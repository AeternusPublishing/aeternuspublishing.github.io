import catalog from './catalog.json' with {type:'json'};
import readiness from './readiness.json' with {type:'json'};
import {providers} from './providers.mjs';
import {productFindings} from './product-check.mjs';
import {renderMessage} from './messages.mjs';

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const assert = (condition, message, status = 400) => {if (!condition) throw Object.assign(new Error(message), {status});};
const statuses = ['QUOTED','PAYMENT_PENDING','PAID','SUBMITTING','SUBMISSION_UNKNOWN','PRINT_SUBMITTED','IN_PRODUCTION','SHIPPED','DELIVERED','CANCELLED','REFUND_PENDING','REFUNDED'];
const fulfillmentRank = {PRINT_SUBMITTED:0, IN_PRODUCTION:1, SHIPPED:2, DELIVERED:3};
const fromLulu = {CREATED:'PRINT_SUBMITTED', UNPAID:'PRINT_SUBMITTED', PAYMENT_IN_PROGRESS:'PRINT_SUBMITTED', PRODUCTION_DELAY:'PRINT_SUBMITTED', PRODUCTION_READY:'PRINT_SUBMITTED', IN_PRODUCTION:'IN_PRODUCTION', SHIPPED:'SHIPPED', CANCELLED:'CANCELLED', REJECTED:'CANCELLED'};
const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8'}});
const safeEqual = (a, b) => {
  let difference = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length,b.length); i++) difference |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0);
  return difference === 0;
};
export async function stripeSignature(raw, header, secret, timestamp = Date.now()) {
  assert(secret && header, 'Webhook not configured', 503);
  const parts = header.split(',').map(x => x.split('='));
  const t = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(x => x[1]);
  assert(/^\d+$/.test(t || '') && Math.abs(timestamp / 1000 - Number(t)) <= 300, 'Webhook timestamp invalid', 401);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${raw}`));
  const expected = Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2,'0')).join('');
  assert(signatures.some(s => safeEqual(s,expected)), 'Webhook signature invalid', 401);
}
export function createService(env, suppliedProvider, suppliedCatalog = catalog) {
  const db = env.DB;
  const simulation = env.MODE === 'simulation';
  const provider = suppliedProvider || (!simulation ? providers(env) : null);
  assert(['simulation','sandbox'].includes(env.MODE), 'Live commerce is disabled', 503);
  assert(env.ADMIN_TOKEN?.length >= 32, 'Administrative authentication missing', 503);
  const query = (sql, ...args) => db.prepare(sql).bind(...args);
  async function get(id) {
    const row = await query('SELECT * FROM orders WHERE id=?', id).first();
    assert(row, 'Order not found', 404);
    return {...row, data:JSON.parse(row.data)};
  }
  const event = (id, kind, data = {}) => query('INSERT INTO events VALUES (?,?,?,?,?)', uuid(), id, now(), kind, JSON.stringify(data));
  const mail = (order, kind, body) => query('INSERT INTO outbox (id,order_id,created,kind,recipient,body) VALUES (?,?,?,?,?,?)', uuid(), order.id, now(), kind, order.data.email, JSON.stringify(renderMessage(order,kind,body)));
  async function transition(order, status, extra = {}, message = {}) {
    assert(statuses.includes(status), 'Invalid status');
    const result = await query('UPDATE orders SET status=?,data=?,updated=? WHERE id=? AND status=?', status, JSON.stringify({...order.data,...extra}), now(), order.id, order.status).run();
    assert(result.meta.changes === 1, 'Order changed concurrently; reload', 409);
    await event(order.id,status,message).run();
    return get(order.id);
  }
  function address(input) {
    const result = {};
    for (const [name, length, required] of [['name',35,true],['street1',30,true],['street2',30,false],['city',30,true],['postcode',64,true],['state_code',3,false],['phone_number',20,true],['country_code',2,true]]) {
      const value = String(input?.[name] || '').trim();
      assert(value.length <= length && (!required || value.length > 0) && !/[\u0000-\u001f]/.test(value), `Invalid address: ${name}`);
      result[name] = value;
    }
    assert(readiness.countries[result.country_code], 'Country not enabled for testing');
    assert(/^\+?[\d\s\-./()]{8,20}$/.test(result.phone_number), 'Phone number required by Lulu');
    assert(!['US','CA','AU'].includes(result.country_code) || /^[A-Z]{2,3}$/.test(result.state_code), 'State/province code required');
    return result;
  }
  async function quote(body) {
    assert(Array.isArray(body.items) && body.items.length > 0 && body.items.length <= 20, 'Empty or oversized cart');
    assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || '') && body.email.length <= 254, 'Valid email required');
    if (simulation) assert(body.email.endsWith('.invalid'), 'Use a fictional .invalid email in simulation');
    const shipping = address(body.address);
    const currency = readiness.countries[shipping.country_code];
    const seen = new Set();
    const items = body.items.map(line => {
      assert(!seen.has(line.sku), 'Duplicate cart line'); seen.add(line.sku);
      const book = suppliedCatalog.items.find(i => i.sku === line.sku);
      assert(book && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 10, 'Invalid product or quantity');
      if (!simulation) {
        assert(productFindings(book,currency).length===0,'Product print evidence or approval missing',409);
        assert(book.approved && book.print_assets && Number.isSafeInteger(book.prices[currency]) && book.prices[currency] > 0, 'Product not approved for sandbox', 409);
        for (const asset of Object.values(book.print_assets)) {
          assert(/^https:\/\//.test(asset.url) && /^[a-f0-9]{64}$/.test(asset.sha256), 'Print asset evidence missing', 409);
        }
      }
      return {...book, quantity:line.quantity, unit:simulation ? book.demo_cents : book.prices[currency]};
    });
    const shipping_level = body.shipping_level || 'MAIL';
    assert(['MAIL','PRIORITY_MAIL','GROUND_HD','GROUND_BUS','GROUND','EXPEDITED','EXPRESS'].includes(shipping_level), 'Shipping level invalid');
    const merchandise = items.reduce((sum,i) => sum+i.unit*i.quantity,0);
    let costs = {cost_cents:items.reduce((sum,i) => sum+(i.format === 'Hardcover' ? 1500 : 900)*i.quantity,0)+650};
    if (!simulation) costs = await provider.quote(items,shipping,currency,shipping_level);
    // Tax policy must supply explicit reviewed gross shipping/retail prices. Lulu tax is a supplier cost, never retail tax.
    assert(simulation || env.TAX_POLICY_APPROVED === 'true', 'Destination tax policy not approved', 409);
    const delivery = simulation ? 650 : Number(env[`SHIPPING_GROSS_${currency}`]);
    assert(Number.isSafeInteger(delivery) && delivery >= 0, 'Reviewed shipping price missing', 409);
    const total = merchandise + delivery;
    const tax_bps = simulation ? 0 : Number(env[`RETAIL_TAX_BPS_${shipping.country_code}`]);
    const fee_bps = simulation ? 350 : Number(env.PAYMENT_FEE_BPS);
    const fee_fixed = simulation ? 30 : Number(env[`PAYMENT_FEE_FIXED_${currency}`]);
    assert(Number.isInteger(tax_bps) && tax_bps >= 0 && tax_bps <= 10000 && Number.isInteger(fee_bps) && fee_bps >= 0 && fee_bps <= 10000 && Number.isInteger(fee_fixed) && fee_fixed >= 0,'Reviewed tax/payment cost missing',409);
    const retail_net = Math.floor(total*10000/(10000+tax_bps));
    const payment_fee = Math.ceil(total * fee_bps / 10000) + fee_fixed;
    const margin = retail_net - costs.cost_cents - payment_fee;
    assert(Number.isSafeInteger(costs.cost_cents) && margin >= Number(env.MIN_MARGIN_CENTS || 100), 'Cost exceeds reviewed margin', 409);
    const id = uuid(); const token = uuid()+uuid();
    const data = {email:body.email, language:body.language==='en'?'en':'de', address:shipping, currency, items, shipping_level, merchandise, delivery, total,
      retail_net, tax_bps, cost:costs.cost_cents, payment_fee, margin, simulation, expires:Date.now()+15*60*1000, provider_quote:costs.raw || null};
    await db.batch([query('INSERT INTO orders (id,token,created,updated,status,data) VALUES (?,?,?,?,?,?)',id,token,now(),now(),'QUOTED',JSON.stringify(data)), event(id,'QUOTED')]);
    return {id,token,currency,merchandise,delivery,total,expires:data.expires,simulation};
  }
  async function checkout(order, origin) {
    assert(order.data.expires > Date.now(), 'Quote expired', 409);
    if (order.status === 'PAYMENT_PENDING' && order.data.checkout_url) return {url:order.data.checkout_url};
    assert(order.status === 'QUOTED', 'Order is already being processed',409);
    // Claim before network I/O. Uncertain Stripe replies can safely retry with the same provider idempotency key.
    order = await transition(order,'PAYMENT_PENDING');
    return completeCheckout(order,origin);
  }
  async function completeCheckout(order, origin) {
    const session = simulation ? {id:`cs_test_${order.id}`,url:`${origin}/shop/?order=${order.id}#status`} : await provider.checkout(order,origin);
    assert(session.id?.startsWith('cs_test_') && (simulation ? new URL(session.url).origin === origin : new URL(session.url).origin === 'https://checkout.stripe.com'), 'Unexpected checkout response', 502);
    await query('UPDATE orders SET session_id=?,data=?,updated=? WHERE id=? AND status=?', session.id,JSON.stringify({...order.data,checkout_url:session.url}),now(),order.id,'PAYMENT_PENDING').run();
    return {url:session.url,simulation};
  }
  async function paid(id, session, eventId) {
    const order = await get(id);
    assert(session.livemode === false && session.payment_status === 'paid' && session.amount_total === order.data.total && session.currency?.toUpperCase() === order.data.currency && session.id === order.session_id, 'Payment does not match order',409);
    assert(session.client_reference_id === order.id, 'Payment reference mismatch',409);
    const exists = await query('SELECT id FROM events WHERE id=?',eventId).first();
    if (exists || order.status !== 'PAYMENT_PENDING') return {duplicate:true};
    try {await db.batch([
      query('INSERT INTO events VALUES (?,?,?,?,?)',eventId,id,now(),'PAYMENT_VERIFIED',JSON.stringify({session_id:session.id})),
      query('UPDATE orders SET status=?,data=?,updated=? WHERE id=? AND status=?','PAID',JSON.stringify({...order.data,payment_intent:session.payment_intent}),now(),id,'PAYMENT_PENDING'),
      query('INSERT INTO documents VALUES (?,?,?,?,?)',uuid(),id,now(),'INVOICE_DRAFT',JSON.stringify({schema_version:1,number:`TEST-${new Date().getUTCFullYear()}-${id}`,legal_status:'DRAFT_NOT_A_TAX_INVOICE',order_id:id,
        customer:{email:order.data.email,address:order.data.address},currency:order.data.currency,lines:order.data.items.map(i=>({sku:i.sku,isbn:i.isbn,title:i.title,quantity:i.quantity,unit_gross_cents:i.unit,line_gross_cents:i.unit*i.quantity})),shipping_gross_cents:order.data.delivery,total_gross_cents:order.data.total,retail_net_cents:order.data.retail_net,retail_tax_bps:order.data.tax_bps,seller_details_status:'REQUIRES_VERIFIED_LEGAL_MASTER_DATA'})),
      mail(order,'ORDER_RECEIPT',{order_id:id,total:order.data.total,currency:order.data.currency,simulation})
    ]);} catch(error) {
      if ((await get(id)).status !== 'PAYMENT_PENDING') return {duplicate:true};
      throw error;
    }
    return {received:true};
  }
  async function submit(id) {
    let order = await get(id);
    assert(order.status === 'PAID','Only confirmed payments can enter fulfillment',409);
    const withdrawn = await query("SELECT id FROM requests WHERE order_id=? AND kind='WITHDRAWAL'",id).first();
    assert(!withdrawn && !order.refunded,'Refund or withdrawal requires resolution before printing',409);
    if (!simulation) {
      assert(!order.data.integration_fixture && Array.isArray(order.data.items) && order.data.items.length > 0,'Integration fixtures cannot print',409);
      for (const item of order.data.items) {
        const current = suppliedCatalog.items.find(book => book.sku === item.sku);
        assert(current && productFindings(current,order.data.currency).length === 0 && productFindings(item,order.data.currency).length === 0,'Current product approval missing before printing',409);
        assert(JSON.stringify(current.print_assets) === JSON.stringify(item.print_assets) && current.package === item.package && current.pages === item.pages,'Print evidence changed after quotation',409);
      }
    }
    order = await transition(order,'SUBMITTING');
    try {
      const job = simulation ? {id:`sim-${uuid()}`,status:{name:'CREATED'}} : await provider.submit(order);
      assert(job.id,'Print job id missing',502);
      await query('UPDATE orders SET job_id=? WHERE id=? AND status=?',String(job.id),id,'SUBMITTING').run();
      return transition(await get(id),'PRINT_SUBMITTED',{lulu_status:job.status?.name || 'CREATED'},{job_id:String(job.id)});
    } catch {
      // No automatic retry: Lulu external_id is a reference, not documented as an idempotency guarantee.
      return transition(await get(id),'SUBMISSION_UNKNOWN',{}, {reason:'Provider outcome uncertain; reconcile before any resubmission'});
    }
  }
  async function reconcile(id, jobId) {
    let order = await get(id);
    assert(['SUBMISSION_UNKNOWN','SUBMITTING'].includes(order.status),'Reconciliation not needed',409);
    assert(!simulation,'Simulation cannot attach a real Lulu job',409);
    const job = await provider.getJob(jobId);
    assert(job.external_id === order.id,'Lulu job belongs to another order',409);
    await query('UPDATE orders SET job_id=? WHERE id=?',String(job.id),id).run();
    return transition(order,'PRINT_SUBMITTED',{lulu_status:job.status?.name},{job_id:String(job.id)});
  }
  async function poll(id, demoStatus) {
    const order = await get(id);
    assert(order.job_id && ['PRINT_SUBMITTED','IN_PRODUCTION','SHIPPED'].includes(order.status),'Order is not pollable',409);
    const job = simulation ? {status:{name:demoStatus || 'SHIPPED'},line_items:[]} : await provider.getJob(order.job_id);
    await query('UPDATE orders SET data=?,updated=? WHERE id=? AND status=?',JSON.stringify({...order.data,lulu_status:job.status?.name || 'UNKNOWN',last_provider_check:now()}),now(),id,order.status).run();
    const next = fromLulu[job.status?.name];
    if (!next) {await event(id,'PROVIDER_STATUS_REVIEW',{status:job.status?.name || 'UNKNOWN'}).run(); return order;}
    if (next === 'CANCELLED') {await event(id,'PROVIDER_FAILURE_REVIEW',{status:job.status.name}).run(); return order;}
    if (fulfillmentRank[next] <= fulfillmentRank[order.status]) return order;
    const changed = await transition(order,next,{lulu_status:job.status.name,tracking:job.line_items || []});
    await mail(changed,'FULFILLMENT_UPDATE',{status:next,tracking:changed.data.tracking}).run();
    return changed;
  }
  async function withdrawal(order, body) {
    assert(!['QUOTED','PAYMENT_PENDING'].includes(order.status),'No confirmed order to withdraw',409);
    const existing = await query("SELECT id FROM requests WHERE order_id=? AND kind='WITHDRAWAL'",order.id).first();
    if (existing) return {request_id:existing.id,received:true};
    const id = uuid();
    await db.batch([query('INSERT INTO requests VALUES (?,?,?,?,?)',id,order.id,now(),'WITHDRAWAL',JSON.stringify({email:order.data.email,note:String(body.note || '').slice(0,2000)})),
      event(order.id,'WITHDRAWAL_RECEIVED',{request_id:id}),mail(order,'WITHDRAWAL_RECEIPT',{request_id:id,received:now()})]);
    return {request_id:id,received:true};
  }
  async function refund(order, body) {
    assert(Number.isInteger(body.amount) && body.amount > 0 && body.amount <= order.data.total-order.refunded,'Refund exceeds remaining payment',409);
    assert(['PAID','REFUNDED'].includes(order.status),'Printing has begun or payment is unconfirmed; resolve manually',409);
    assert(/^[a-zA-Z0-9_-]{8,80}$/.test(body.request_id || ''),'Stable refund request id required');
    const existing = await query('SELECT * FROM requests WHERE id=?',body.request_id).first();
    if (existing) return {request_id:existing.id,status:'MANUAL_RECONCILIATION_REQUIRED'};
    // Reserve BEFORE network I/O, so an uncertain timeout never permits a duplicate refund or overspend.
    const reserve = await query('UPDATE orders SET refunded=refunded+?,updated=? WHERE id=? AND refunded=? AND status=?',body.amount,now(),order.id,order.refunded,order.status).run();
    assert(reserve.meta.changes === 1,'Concurrent refund; reload',409);
    await query('INSERT INTO requests VALUES (?,?,?,?,?)',body.request_id,order.id,now(),'REFUND_PENDING',JSON.stringify({amount:body.amount})).run();
    try {
      const result = simulation ? {id:`re_sim_${uuid()}`,status:'succeeded'} : await provider.refund(order,body.amount,body.request_id);
      await query('UPDATE requests SET kind=?,data=? WHERE id=?','REFUND_RECORDED',JSON.stringify({amount:body.amount,provider:result}),body.request_id).run();
      await event(order.id,'REFUND_RECORDED',{amount:body.amount,provider_id:result.id}).run();
      assert(['succeeded','pending','requires_action'].includes(result.status),'Refund needs review',502);
      if (order.refunded+body.amount === order.data.total) await transition(await get(order.id),result.status === 'succeeded' ? 'REFUNDED' : 'REFUND_PENDING');
      await mail(order,'REFUND_RECEIPT',{amount:body.amount,currency:order.data.currency,provider_status:result.status}).run();
      return {request_id:body.request_id,provider:result};
    } catch {
      await event(order.id,'REFUND_UNKNOWN',{request_id:body.request_id}).run();
      return {request_id:body.request_id,status:'MANUAL_RECONCILIATION_REQUIRED'};
    }
  }
  const publicOrder = o => ({id:o.id,status:o.status,created:o.created,currency:o.data.currency,total:o.data.total,refunded:o.refunded,simulation:o.data.simulation,
    items:o.data.items.map(i=>({sku:i.sku,title:i.title,format:i.format,quantity:i.quantity,unit:i.unit})),tracking:o.data.tracking || []});
  async function processQueue() {
    const candidates=(await query("SELECT id,status FROM orders WHERE status IN ('PAID','PRINT_SUBMITTED','IN_PRODUCTION') ORDER BY created LIMIT 10").all()).results;
    const result=[];
    for(const order of candidates) {
      try {const updated=order.status==='PAID'?await submit(order.id):await poll(order.id);result.push({id:order.id,status:updated.status});}
      catch {result.push({id:order.id,status:'REVIEW_REQUIRED'});}
    }
    return result;
  }
  async function route(request) {
    try {
      const url = new URL(request.url); const path = url.pathname;
      if (simulation) assert(['127.0.0.1','localhost','[::1]'].includes(url.hostname),'Simulation is local only',403);
      assert(!env.STRIPE_KEY || env.STRIPE_KEY.startsWith('sk_test_'),'Live keys prohibited',503);
      if (request.method !== 'GET' && path !== '/api/webhooks/stripe') {
        assert(request.headers.get('Origin') === url.origin,'Same-origin request required',403);
        assert(request.headers.get('Content-Type')?.includes('application/json'),'JSON required',415);
      }
      if (path.startsWith('/api/admin/')) {
        assert(safeEqual(request.headers.get('Authorization') || '',`Bearer ${env.ADMIN_TOKEN}`),'Administrative login required',401);
      }
      if (path === '/api/catalog' && request.method === 'GET') return json({simulation,live_enabled:false,countries:readiness.countries,items:catalog.items.map(i=>({sku:i.sku,title:i.title,author:i.author,format:i.format,isbn:i.isbn,language:i.language,cover:i.cover||null,approved:i.approved,prices:simulation?Object.fromEntries(Object.values(readiness.countries).map(c=>[c,i.demo_cents])):i.prices}))});
      if (path === '/api/quote' && request.method === 'POST') return json(await quote(await request.json()),201);
      if (path === '/api/webhooks/stripe' && request.method === 'POST') {
        assert(!simulation,'External webhooks disabled in simulation',403);
        const raw = await request.text(); assert(raw.length <= 128000,'Webhook too large',413);
        await stripeSignature(raw,request.headers.get('Stripe-Signature'),env.STRIPE_WEBHOOK_SECRET);
        const payload = JSON.parse(raw);
        assert(payload.livemode === false && /^evt_/.test(payload.id || ''),'Live or invalid webhook prohibited',409);
        if (!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(payload.type)) return json({ignored:true});
        if (payload.data.object.payment_status !== 'paid') return json({awaiting_payment:true});
        return json(await paid(payload.data.object.client_reference_id,payload.data.object,payload.id));
      }
      const customer = path.match(/^\/api\/orders\/([a-f0-9-]+)(?:\/(checkout|withdrawal))?$/);
      if (customer) {
        const order = await get(customer[1]);
        assert(safeEqual(request.headers.get('X-Order-Token') || '',order.token),'Order access denied',403);
        if (request.method === 'GET' && !customer[2]) return json(publicOrder(order));
        if (request.method === 'POST' && customer[2] === 'checkout') {
          const body = await request.json(); assert(body.accepted_test === true,'Test acknowledgement required');
          // Recovery only for Stripe's safely idempotent session creation.
          return json(order.status === 'PAYMENT_PENDING' && !order.data.checkout_url ? await completeCheckout(order,url.origin) : await checkout(order,url.origin));
        }
        if (request.method === 'POST' && customer[2] === 'withdrawal') return json(await withdrawal(order,await request.json()),201);
      }
      if (path === '/api/admin/readiness' && request.method === 'GET') return json({...readiness,mode:env.MODE,credentials:{stripe:!!env.STRIPE_KEY?.startsWith('sk_test_'),lulu:!!env.LULU_CLIENT_KEY,webhook:!!env.STRIPE_WEBHOOK_SECRET}});
      if (path === '/api/admin/orders' && request.method === 'GET') return json((await query("SELECT orders.*, EXISTS(SELECT 1 FROM requests WHERE order_id=orders.id AND kind='WITHDRAWAL') AS withdrawal_pending FROM orders ORDER BY created DESC LIMIT 500").all()).results.map(o=>({...o,token:undefined,data:JSON.parse(o.data)})));
      if (path === '/api/admin/outbox' && request.method === 'GET') return json((await query('SELECT * FROM outbox ORDER BY created DESC LIMIT 500').all()).results);
      if (path === '/api/admin/requests' && request.method === 'GET') return json((await query('SELECT * FROM requests ORDER BY created DESC LIMIT 500').all()).results);
      if (path === '/api/admin/documents' && request.method === 'GET') return json((await query('SELECT * FROM documents ORDER BY created DESC LIMIT 500').all()).results);
      const admin = path.match(/^\/api\/admin\/orders\/([a-f0-9-]+)\/(pay|submit|poll|refund|reconcile|events)$/);
      if (admin) {
        const order = await get(admin[1]); const action = admin[2];
        if (action === 'events' && request.method === 'GET') return json((await query('SELECT * FROM events WHERE order_id=? ORDER BY created',order.id).all()).results);
        if (request.method === 'POST') {
          const body = await request.json();
          if (action === 'pay') {
            assert(simulation,'Simulated payments are local only',403);
            return json(await paid(order.id,{id:order.session_id,livemode:false,payment_status:'paid',amount_total:order.data.total,currency:order.data.currency,client_reference_id:order.id,payment_intent:`pi_sim_${order.id}`},`evt_sim_${order.id}`));
          }
          if (action === 'submit') return json(publicOrder(await submit(order.id)));
          if (action === 'poll') return json(publicOrder(await poll(order.id,body.status)));
          if (action === 'reconcile') return json(publicOrder(await reconcile(order.id,body.job_id)));
          if (action === 'refund') return json(await refund(order,body));
        }
      }
      return json({error:'Route not found'},404);
    } catch (error) {
      // Never forward provider response bodies, secrets, addresses or database internals to a browser.
      return json({error:error.status ? error.message : 'Request failed; review operational log'},error.status || 502);
    }
  }
  return {route,quote,get,paid,submit,poll,reconcile,refund,withdrawal,processQueue};
}
