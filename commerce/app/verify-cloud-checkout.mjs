// Opt-in fictitious 1 EUR fixture. Does not approve or offer any book for sale.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {loadStripeCredentials} from './credentials.mjs';
import {providers} from './providers.mjs';
if(!process.argv.includes('--authorized-test'))throw new Error('Explicit sandbox test authorization required');
const config=JSON.parse(await readFile(new URL('./wrangler.jsonc',import.meta.url),'utf8'));
if(config.vars.MODE!=='sandbox'||config.vars.PRIVATE_DEPLOYMENT_VERIFIED!=='true'||config.name!=='aeternus-commerce-sandbox')throw new Error('Private sandbox deployment required');
const authentication=await readFile(join(process.env.APPDATA,'xdg.config','.wrangler','config','default.toml'),'utf8');
const oauth=authentication.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if(!oauth)throw new Error('Existing Cloudflare authentication required');
async function query(sql,params=[]){
  const response=await fetch('https://api.cloudflare.com/client/v4/accounts/5a177f4bf049aa9628414538d5e37b9f/d1/database/a6123bd1-c68e-4c37-b989-5125d2575306/query',{
    method:'POST',headers:{Authorization:`Bearer ${oauth}`,'Content-Type':'application/json'},body:JSON.stringify({sql,params}),signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  if(!response.ok||!result.success||!result.result?.[0]?.success)throw new Error('Sandbox D1 query failed; provider output suppressed');
  return result.result[0].results;
}
const env=loadStripeCredentials({...process.env,MODE:'sandbox'});
const id=randomUUID();
const data={integration_fixture:true,simulation:false,email:'reader@example.invalid',language:'de',currency:'EUR',
  address:{name:'Test Reader',country_code:'DE'},items:[{sku:'INTEGRATION_FIXTURE',title:'AETERNUS cloud sandbox fixture',quantity:1,unit:100,approved:false}],
  total:100,merchandise:100,delivery:0,retail_net:100,tax_bps:0,expires:Date.now()+600000};
const checkout=await providers(env).checkout({id,data},'https://sandbox-shop.aeternuspublishing.com');
if(checkout.livemode!==false||!checkout.id?.startsWith('cs_test_'))throw new Error('Test checkout required');
data.checkout_url=checkout.url;
await query('INSERT INTO orders (id,token,created,updated,status,data,session_id) VALUES (?,?,?,?,?,?,?)',
  [id,randomUUID()+randomUUID(),new Date().toISOString(),new Date().toISOString(),'PAYMENT_PENDING',JSON.stringify(data),checkout.id]);
const folder=join(process.env.LOCALAPPDATA,'AETERNUS','commerce-preview');await mkdir(folder,{recursive:true});
const fixture=join(folder,`cloud-checkout-${id}.json`);
await writeFile(fixture,JSON.stringify({id,url:checkout.url,integration_fixture:true,mode:'sandbox'},null,2),{flag:'wx'});
console.log(JSON.stringify({state:'WAITING_FOR_TEST_CARD',private_fixture:fixture,amount_cents:100,currency:'EUR'}));
const deadline=Date.now()+600000;let confirmed=false;
while(Date.now()<deadline){
  const [order]=await query('SELECT status,refunded,job_id FROM orders WHERE id=?',[id]);
  if(order.status==='PAID'&&!confirmed){confirmed=true;console.log(JSON.stringify({state:'CLOUD_WEBHOOK_PAYMENT_CONFIRMED',amount_cents:100}));}
  if(order.status==='REFUNDED'){
    const [counts]=await query('SELECT (SELECT count(*) FROM events WHERE order_id=? AND kind=?) AS payments,(SELECT count(*) FROM documents WHERE order_id=? AND kind=?) AS invoices,(SELECT count(*) FROM outbox WHERE order_id=? AND kind=?) AS receipts',
      [id,'PAYMENT_VERIFIED',id,'INVOICE_DRAFT',id,'ORDER_RECEIPT']);
    if(counts.payments!==1||counts.invoices!==1||counts.receipts!==1||order.refunded!==100||order.job_id)throw new Error('Cloud integration consistency failure');
    const evidence={schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',transport:'Dedicated Stripe webhook to Cloudflare Worker and D1',
      real_stripe_payment_delivery:true,invoice_drafts:counts.invoices,receipt_drafts:counts.receipts,payment_events:counts.payments,
      final_order_status:order.status,refunded_cents:order.refunded,amount_cents:100,currency:'EUR',lulu_job_created:false,emails_sent:0,
      checkout_fixture_is_not_product_approval:true};
    await writeFile(new URL('./evidence/cloud-checkout-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
    console.log(JSON.stringify(evidence));process.exit(0);
  }
  await new Promise(resolve=>setTimeout(resolve,3000));
}
throw new Error('Cloud integration incomplete; inspect the existing private fixture before another run');
