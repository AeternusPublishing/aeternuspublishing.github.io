// Explicitly authorized sandbox endpoint; secrets remain in memory and Cloudflare.
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {createHmac} from 'node:crypto';
import {loadStripeCredentials} from './credentials.mjs';
if(!process.argv.includes('--authorized-cloud-transfer'))throw new Error('Cloud transfer authorization required');
const env=loadStripeCredentials({...process.env,MODE:'sandbox'});
if(!env.STRIPE_KEY?.startsWith('sk_test_'))throw new Error('Sandbox key required');
const endpoint='https://sandbox-shop.aeternuspublishing.com/api/webhooks/stripe';
let previous;
try{previous=JSON.parse(await readFile(new URL('./evidence/cloud-webhook-provisioning.json',import.meta.url),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
// Stripe idempotency responses expire. Never create a second endpoint after that window.
if(previous&&Date.now()-Date.parse(previous.verified_at)>12*60*60*1000)throw new Error('Endpoint already provisioned; do not recreate it. Use the existing Cloudflare signing secret.');
const params=new URLSearchParams({url:endpoint,description:'AETERNUS private sandbox shop',
  'enabled_events[0]':'checkout.session.completed','enabled_events[1]':'checkout.session.async_payment_succeeded'});
const response=await fetch('https://api.stripe.com/v1/webhook_endpoints',{method:'POST',
  headers:{Authorization:`Bearer ${env.STRIPE_KEY}`,'Idempotency-Key':'aeternus-private-cloud-webhook-20261007','Content-Type':'application/x-www-form-urlencoded'},
  body:params,signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error(`Sandbox webhook creation HTTP ${response.status}`);
const result=await response.json();
if(result.livemode!==false||result.url!==endpoint||!result.secret?.startsWith('whsec_'))throw new Error('Unexpected sandbox endpoint response');
const cli=process.env.WRANGLER_CLI||join(process.env.APPDATA,'npm','node_modules','wrangler','bin','wrangler.js');
const upload=spawnSync(process.execPath,[cli,'secret','bulk','--config',fileURLToPath(new URL('./wrangler.jsonc',import.meta.url))],
  {input:JSON.stringify({STRIPE_WEBHOOK_SECRET:result.secret}),encoding:'utf8',windowsHide:true,maxBuffer:64000,timeout:90000});
if(upload.status!==0)throw new Error('Webhook secret transfer failed; provider output suppressed. Retry with the same idempotency key.');
const evidence={schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',endpoint,
  stripe_endpoint_id:result.id,secret_destination:'Cloudflare Worker aeternus-commerce-sandbox',secret_values_recorded:false,
  live_endpoint_created:false,cloud_delivery_verified:false};
if(process.argv.includes('--verify-signature-transport')){
  const body=JSON.stringify({id:'evt_aeternus_transport_probe',livemode:false,type:'aeternus.transport.probe'});
  const timestamp=Math.floor(Date.now()/1000);
  const signature=createHmac('sha256',result.secret).update(`${timestamp}.${body}`).digest('hex');
  const valid=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':`t=${timestamp},v1=${signature}`},body,redirect:'manual'});
  const accepted=valid.status===200&&(await valid.json()).ignored===true;
  const invalid=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':`t=${timestamp},v1=${'0'.repeat(64)}`},body,redirect:'manual'});
  if(!accepted||invalid.status!==401)throw new Error('Cloud signature transport probe failed');
  evidence.signature_transport_verified=true;
  evidence.forged_signature_status=invalid.status;
  evidence.probe_created_order=false;
}
await writeFile(new URL('./evidence/cloud-webhook-provisioning.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
