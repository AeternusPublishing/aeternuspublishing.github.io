import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadStripeCredentials} from './credentials.mjs';
import {providers} from './providers.mjs';

const env=loadStripeCredentials({...process.env,MODE:'sandbox'});
try {
  if(!env.STRIPE_KEY?.startsWith('sk_test_'))throw new Error('Stripe test credential required');
  const fixture=JSON.parse(await readFile(process.argv[2],'utf8'));
  if(fixture.mode!=='sandbox'||!/^cs_test_[A-Za-z0-9]+$/.test(fixture.session_id)||fixture.amount_cents!==100||fixture.currency!=='EUR')throw new Error('Unexpected test fixture');
  const response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${fixture.session_id}`,{headers:{Authorization:`Bearer ${env.STRIPE_KEY}`},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Stripe session HTTP ${response.status}`);
  const session=await response.json();
  if(session.livemode!==false||session.amount_total!==100||session.currency!=='eur'||session.client_reference_id!==fixture.fixture_id)throw new Error('Test payment mismatch');
  if(session.payment_intent)await writeFile(process.argv[2],JSON.stringify({...fixture,payment_intent:session.payment_intent},null,2)+'\n');
  const evidence={schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',
    session_reference_sha256:createHash('sha256').update(session.id).digest('hex'),amount_cents:100,currency:'EUR',
    payment_confirmed:session.payment_status==='paid',checkout_status:session.status,
    verification_source:'Authenticated Stripe session retrieval; not a webhook test',webhook_verified:false,print_job_created:false};
  if(process.argv.includes('--refund')) {
    if(!evidence.payment_confirmed||!session.payment_intent?.startsWith('pi_'))throw new Error('Paid test session required before test refund');
    const result=await providers(env).refund({id:fixture.fixture_id,data:{payment_intent:session.payment_intent}},100,`fixture-${fixture.fixture_id}`);
    evidence.test_refund_status=result.status;
    evidence.test_refund_reference_sha256=createHash('sha256').update(result.id).digest('hex');
  }
  await writeFile(new URL('./evidence/stripe-checkout-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence));
}catch(error){console.error('Stripe test payment check failed: '+error.message);process.exitCode=2;}
