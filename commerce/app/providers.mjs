// Lulu request shapes: https://api.lulu.com/api-docs/openapi-specs/openapi_public.yml
// This module intentionally has no live endpoint or live payment support.
export function cents(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) throw new Error('Invalid monetary amount');
  const [whole, fraction = ''] = String(value).split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(result)) throw new Error('Amount overflow');
  return result;
}
async function checked(response) {
  if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
  return response.json();
}
export function providers(env, fetcher = fetch) {
  if (env.MODE !== 'sandbox') throw new Error('Sandbox provider mode required');
  if (env.STRIPE_KEY && !env.STRIPE_KEY.startsWith('sk_test_')) throw new Error('Stripe test key required');
  const lulu = 'https://api.sandbox.lulu.com';
  let access;
  let accessExpires=0;
  async function request(path, body, method = 'POST') {
    if (!env.LULU_CLIENT_KEY || !env.LULU_CLIENT_SECRET) throw new Error('Lulu sandbox credentials missing');
    if (!access || Date.now()>=accessExpires) {
      access = await checked(await fetcher(`${lulu}/auth/realms/glasstree/protocol/openid-connect/token`, {
        method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded',
          Authorization:`Basic ${btoa(`${env.LULU_CLIENT_KEY}:${env.LULU_CLIENT_SECRET}`)}`},
        body:'grant_type=client_credentials', signal:AbortSignal.timeout(20000)
      }));
      if(typeof access.access_token!=='string'||!access.access_token)throw new Error('Lulu access token missing');
      accessExpires=Date.now()+Math.max(0,(Number(access.expires_in)||60)-30)*1000;
    }
    return checked(await fetcher(lulu + path, {method,
      headers:{Authorization:`Bearer ${access.access_token}`, 'Content-Type':'application/json'},
      ...(body ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(25000)}));
  }
  async function stripe(path, body, key) {
    if (!env.STRIPE_KEY?.startsWith('sk_test_')) throw new Error('Stripe test key required');
    return checked(await fetcher(`https://api.stripe.com/v1/${path}`, {method:'POST',
      headers:{Authorization:`Bearer ${env.STRIPE_KEY}`, 'Content-Type':'application/x-www-form-urlencoded', 'Idempotency-Key':key},
      body:new URLSearchParams(body), signal:AbortSignal.timeout(25000)}));
  }
  return {
    async coverDimensions(item) {
      if(!Number.isInteger(item.pages)||item.pages<2||typeof item.package!=='string')throw new Error('Lulu product specification missing');
      const dimensions=await request('/cover-dimensions/',{pod_package_id:item.package,interior_page_count:item.pages,unit:'pt'});
      if(dimensions.unit!=='pt'||!Number.isFinite(Number(dimensions.width))||Number(dimensions.width)<=0||!Number.isFinite(Number(dimensions.height))||Number(dimensions.height)<=0)throw new Error('Invalid Lulu cover dimensions');
      return dimensions;
    },
    async quote(items, address, currency, level) {
      const lines = items.map(i => ({page_count:i.pages, pod_package_id:i.package, quantity:i.quantity}));
      const options = await request('/shipping-options/', {currency, line_items:lines,
        shipping_address:{...address, country:address.country_code, state:address.state_code}});
      if (!options.some(o => o.level === level && o.currency === currency)) throw new Error('Shipping unavailable in selected currency');
      const cost = await request('/print-job-cost-calculations/', {line_items:lines, shipping_address:address, shipping_option:level});
      if (cost.currency !== currency) throw new Error(`Lulu currency mismatch: requested ${currency}, received ${cost.currency}`);
      return {cost_cents:cents(cost.total_cost_incl_tax), raw:cost, options};
    },
    checkout(order, origin) {
      return stripe('checkout/sessions', {
        mode:'payment', client_reference_id:order.id, customer_email:order.data.email,
        'metadata[order_id]':order.id, 'payment_intent_data[metadata][order_id]':order.id,
        'line_items[0][price_data][currency]':order.data.currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]':String(order.data.total),
        'line_items[0][price_data][product_data][name]':'AETERNUS test order',
        'line_items[0][quantity]':'1',
        success_url:`${origin}/shop/?order=${order.id}#status`, cancel_url:`${origin}/shop/?order=${order.id}#status`
      }, `checkout-${order.id}`);
    },
    submit(order) {
      return request('/print-jobs/', {contact_email:env.OPERATOR_EMAIL, external_id:order.id,
        production_delay:120, shipping_level:order.data.shipping_level, shipping_address:order.data.address,
        line_items:order.data.items.map(i => ({external_id:i.sku, title:i.title, quantity:i.quantity,
          printable_normalization:{pod_package_id:i.package,
            cover:{source_url:i.print_assets.cover.url}, interior:{source_url:i.print_assets.interior.url}}}))});
    },
    getJob(id) {
      if (!/^\d+$/.test(String(id))) throw new Error('Invalid Lulu job id');
      return request(`/print-jobs/${id}/`, null, 'GET');
    },
    refund(order, amount, requestId) {
      if (!order.data.payment_intent?.startsWith('pi_')) throw new Error('Payment intent missing');
      return stripe('refunds', {payment_intent:order.data.payment_intent, amount:String(amount)}, `refund-${requestId}`);
    }
  };
}
