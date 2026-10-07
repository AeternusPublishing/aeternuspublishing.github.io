// Explicitly authorized sandbox fixture; no Lulu order or approved retail product involved.
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {loadStripeCredentials} from './credentials.mjs';
import {providers} from './providers.mjs';

const env=loadStripeCredentials({...process.env,MODE:'sandbox'});
const id=randomUUID();
try {
  const session=await providers(env).checkout({id,data:{email:'reader@example.invalid',currency:'EUR',total:100}},'http://127.0.0.1:8093');
  if(!session.id?.startsWith('cs_test_')||session.livemode!==false||session.amount_total!==100||session.currency!=='eur'||new URL(session.url).origin!=='https://checkout.stripe.com')throw new Error('Unexpected sandbox checkout response');
  const folder=join(process.env.LOCALAPPDATA||process.env.HOME,'AETERNUS','commerce-preview');
  await mkdir(folder,{recursive:true});
  const file=join(folder,`stripe-checkout-${id}.json`);
  await writeFile(file,JSON.stringify({session_id:session.id,url:session.url,fixture_id:id,currency:'EUR',amount_cents:100,mode:'sandbox'},null,2)+'\n',{flag:'wx'});
  const evidence={schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',checkout_creation:'PASS',
    session_reference_sha256:createHash('sha256').update(session.id).digest('hex'),amount_cents:100,currency:'EUR',
    checkout_origin:'https://checkout.stripe.com',payment_confirmed:false,webhook_verified:false,print_job_created:false};
  await writeFile(new URL('./evidence/stripe-checkout-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify({checkout_creation:'PASS',mode:'sandbox',local_fixture_file:file,payment_confirmed:false}));
}catch(error){console.error('Stripe sandbox checkout verification failed: '+error.message);process.exitCode=2;}
