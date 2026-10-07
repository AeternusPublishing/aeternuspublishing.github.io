// Opt-in real sandbox integration test. Never used by production or the catalog.
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {randomUUID,randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {database} from './local-db.mjs';
import {createService} from './service.mjs';
import {loadStripeCredentials} from './credentials.mjs';

if (!process.argv.includes('--authorized-test')) throw new Error('Explicit sandbox test authorization required');
const env=loadStripeCredentials({...process.env,MODE:'sandbox',ADMIN_TOKEN:randomBytes(32).toString('hex')});
if(!env.STRIPE_KEY?.startsWith('sk_test_'))throw new Error('Sandbox credential required');
const id=randomUUID(), token=randomUUID()+randomUUID();
const folder=join(process.env.LOCALAPPDATA,'AETERNUS','commerce-preview');
await mkdir(folder,{recursive:true});
const db=database(join(folder,`webhook-${id}.sqlite`)); env.DB=db;
const service=createService(env);
const origin='http://127.0.0.1:8094';
const data={integration_fixture:true,simulation:false,email:'reader@example.invalid',language:'de',currency:'EUR',
  address:{name:'Test Reader',country_code:'DE'},items:[{sku:'INTEGRATION_FIXTURE',title:'AETERNUS sandbox integration fixture',quantity:1,unit:100,approved:false}],
  total:100,merchandise:100,delivery:0,retail_net:100,tax_bps:0,expires:Date.now()+600000};
await db.prepare('INSERT INTO orders (id,token,created,updated,status,data) VALUES (?,?,?,?,?,?)').bind(id,token,new Date().toISOString(),new Date().toISOString(),'QUOTED',JSON.stringify(data)).run();
let deliveries=0,receivedEvent,finished=false,listener;
const server=createServer(async(req,res)=>{
  if(req.headers.host!=='127.0.0.1:8094'||req.url!=='/api/webhooks/stripe'||req.method!=='POST'){res.writeHead(404);res.end();return;}
  try {
    const chunks=[];let length=0;
    for await(const chunk of req){length+=chunk.length;if(length>128000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
    const raw=Buffer.concat(chunks);
    const response=await service.route(new Request(origin+req.url,{method:'POST',headers:req.headers,body:raw}));
    if(response.ok){deliveries++; receivedEvent={raw:raw.toString(),header:req.headers['stripe-signature']};}
    res.writeHead(response.status,{'Content-Type':'application/json'});res.end(await response.text());
  }catch{res.writeHead(500);res.end();}
});
await new Promise(resolve=>server.listen(8094,'127.0.0.1',resolve));
const stripe=process.env.STRIPE_CLI_PATH||join(process.env.LOCALAPPDATA,'AETERNUS','tools','stripe-1.53.0','stripe.exe');
let secretReadyResolve,secretReadyReject;
const ready=new Promise((resolve,reject)=>{secretReadyResolve=resolve;secretReadyReject=reject;});
listener=spawn(stripe,['listen','--events','checkout.session.completed,checkout.session.async_payment_succeeded','--forward-to',origin+'/api/webhooks/stripe'],
  {env:{...process.env,STRIPE_API_KEY:env.STRIPE_KEY,STRIPE_CLI_TELEMETRY_OPTOUT:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let cliBuffer='';
function capture(bytes){cliBuffer=(cliBuffer+bytes.toString()).slice(-8000);const secret=cliBuffer.match(/whsec_[A-Za-z0-9]+/);if(secret){env.STRIPE_WEBHOOK_SECRET=secret[0];cliBuffer='';secretReadyResolve();}}
listener.stdout.on('data',capture);listener.stderr.on('data',capture);
listener.on('error',()=>secretReadyReject(new Error('Stripe CLI unavailable')));
listener.on('exit',()=>{if(!finished)secretReadyReject(new Error('Stripe CLI stopped'));});
const readyTimeout=setTimeout(()=>secretReadyReject(new Error('Stripe listener not ready')),30000);
async function cleanup(){finished=true;listener?.kill();await new Promise(resolve=>server.close(resolve));db.close();}
try {
  await ready;clearTimeout(readyTimeout);
  const response=await service.route(new Request(`${origin}/api/orders/${id}/checkout`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Order-Token':token},body:JSON.stringify({accepted_test:true})}));
  if(!response.ok)throw new Error('Test Checkout could not be created');
  const checkout=await response.json();
  const fixturePath=join(folder,`webhook-${id}.json`);
  await writeFile(fixturePath,JSON.stringify({mode:'sandbox',integration_fixture:true,id,url:checkout.url},null,2),{flag:'wx'});
  console.log(JSON.stringify({state:'WAITING_FOR_TEST_CARD',private_fixture:fixturePath,amount_cents:100,currency:'EUR'}));
  const deadline=Date.now()+600000;
  while((await service.get(id)).status!=='PAID'){
    if(Date.now()>deadline)throw new Error('Test payment was not confirmed before deadline');
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  const before=await service.get(id);
  const documentCount=(await db.prepare('SELECT * FROM documents WHERE order_id=?').bind(id).all()).results.length;
  const receiptCount=(await db.prepare('SELECT * FROM outbox WHERE order_id=?').bind(id).all()).results.length;
  const replay=await service.route(new Request(origin+'/api/webhooks/stripe',{method:'POST',headers:{'Stripe-Signature':receivedEvent.header},body:receivedEvent.raw}));
  if(!replay.ok||(await replay.json()).duplicate!==true)throw new Error('Webhook duplicate handling failed');
  let printBlocked=false;
  try{await service.submit(id);}catch(error){printBlocked=error.status===409;}
  if(!printBlocked||documentCount!==1||receiptCount!==1)throw new Error('Fixture safety or document count failed');
  const refund=await service.refund(before,{amount:100,request_id:`integration-${id}`});
  const after=await service.get(id);
  const evidence={schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',transport:'Official Stripe CLI WebSocket forwarding to loopback; not a deployed webhook',
    real_stripe_delivery:deliveries>0,signed_webhook_verified:true,payment_status_before_refund:before.status,invoice_drafts:documentCount,receipt_drafts:receiptCount,
    duplicate_event_ignored:true,print_fixture_blocked:printBlocked,lulu_job_created:false,refund_status:refund.provider?.status,final_order_status:after.status,
    amount_cents:100,currency:'EUR',emails_sent:0,public_hosting_verified:false};
  await writeFile(new URL('./evidence/stripe-webhook-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
  if(evidence.refund_status!=='succeeded'||after.status!=='REFUNDED')throw new Error('Test refund requires reconciliation');
  console.log(JSON.stringify(evidence));
}catch{console.error('Sandbox integration did not complete; inspect private fixture and Stripe sandbox before retrying.');process.exitCode=2;}
finally{clearTimeout(readyTimeout);await cleanup();}
