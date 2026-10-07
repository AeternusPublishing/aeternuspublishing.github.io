// Non-mutating test-account connectivity check; no Checkout, payment or refund created.
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadStripeCredentials} from './credentials.mjs';
export async function verifyStripe(env,fetcher=fetch) {
  if(!env.STRIPE_KEY?.startsWith('sk_test_'))throw new Error('Stripe sandbox key missing; live keys prohibited');
  const response=await fetcher('https://api.stripe.com/v1/account',{headers:{Authorization:`Bearer ${env.STRIPE_KEY}`},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Stripe connectivity HTTP ${response.status}`);
  const account=await response.json();
  if(!account.id?.startsWith('acct_'))throw new Error('Unexpected Stripe account response');
  return {schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',connectivity:'PASS',
    account_reference_sha256:createHash('sha256').update(account.id).digest('hex'),
    webhook_secret_present:!!env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_'),
    live_activation_verified:false,checkout_tested:false,payment_created:false,refund_created:false};
}
if(process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]) {
  try {
    const evidence=await verifyStripe(loadStripeCredentials({...process.env,MODE:'sandbox'}));
    await writeFile(new URL('./evidence/stripe-sandbox-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
    console.log(JSON.stringify(evidence));
  }catch(error){console.error(error.message);process.exitCode=2;}
}
