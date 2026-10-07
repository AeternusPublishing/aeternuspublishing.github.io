import {test} from 'node:test';
import assert from 'node:assert/strict';
import {providers} from '../providers.mjs';
import {loadSandboxCredentials} from '../credentials.mjs';
import {verifyStripe} from '../verify-stripe.mjs';

test('Lulu verification works without Stripe and rejects a mismatched cost currency',async()=>{
  const requests=[];
  const client=providers({MODE:'sandbox',LULU_CLIENT_KEY:'fixture-key',LULU_CLIENT_SECRET:'fixture-secret'},async(url,options)=>{
    requests.push({url,options});
    const value=url.includes('/token')?{access_token:'fixture-token'}:
      url.includes('/shipping-options/')?[{level:'MAIL',currency:'USD'}]:{currency:'EUR',total_cost_incl_tax:'10.10'};
    return new Response(JSON.stringify(value),{status:200});
  });
  await assert.rejects(()=>client.quote([{pages:32,package:'fixture',quantity:1}],{country_code:'US'},'USD','MAIL'),/currency mismatch/);
  assert.equal(requests.length,3);
  assert.ok(requests.every(r=>new URL(r.url).origin==='https://api.sandbox.lulu.com'));
  await assert.rejects(()=>client.checkout({id:'fixture',data:{email:'test@example.invalid',currency:'USD',total:100}},'http://127.0.0.1:8093'),/Stripe test key required/);
});

test('credential loader leaves simulation and explicit process credentials unchanged',()=>{
  for(const env of [{MODE:'simulation'},{MODE:'sandbox',LULU_CLIENT_KEY:'fixture',LULU_CLIENT_SECRET:'fixture',STRIPE_KEY:'sk_test_fixture'}])
    assert.equal(loadSandboxCredentials(env),env);
});

test('Stripe account probe forbids live keys and excludes business details from evidence',async()=>{
  let calls=0;
  const fetcher=async(url,options)=>{calls++;assert.equal(url,'https://api.stripe.com/v1/account');assert.equal(options.method,undefined);return new Response(JSON.stringify({id:'acct_fixture',email:'private@example.invalid',business_profile:{name:'Private business'}}));};
  await assert.rejects(()=>verifyStripe({STRIPE_KEY:'sk_live_fixture'},fetcher));
  assert.equal(calls,0);
  const evidence=await verifyStripe({STRIPE_KEY:'sk_test_fixture'},fetcher);
  assert.equal(evidence.connectivity,'PASS');
  assert.equal(evidence.live_activation_verified,false);
  assert.equal(evidence.payment_created,false);
  assert.ok(!JSON.stringify(evidence).includes('private'));
});
test('expired Lulu token is refreshed before the next cost request',async()=>{
  let tokens=0;
  const client=providers({MODE:'sandbox',LULU_CLIENT_KEY:'fixture',LULU_CLIENT_SECRET:'fixture'},async(url)=>{
    const value=url.includes('/token')?(tokens++,{access_token:'fixture-token',expires_in:1}):url.includes('/shipping-options/')?[{level:'MAIL',currency:'EUR'}]:{currency:'EUR',total_cost_incl_tax:'1.00'};
    return new Response(JSON.stringify(value));
  });
  await client.quote([{pages:32,package:'fixture',quantity:1}],{country_code:'DE'},'EUR','MAIL');
  assert.equal(tokens,2);
});
test('cover dimension preparation verifies the provider unit without uploading files',async()=>{
  const calls=[];
  const client=providers({MODE:'sandbox',LULU_CLIENT_KEY:'fixture',LULU_CLIENT_SECRET:'fixture'},async(url,options)=>{
    calls.push({url,body:options.body});return new Response(JSON.stringify(url.includes('/token')?{access_token:'fixture',expires_in:600}:{width:'900',height:'666',unit:'pt'}));
  });
  assert.equal((await client.coverDimensions({pages:316,package:'fixture'})).unit,'pt');
  assert.deepEqual(JSON.parse(calls[1].body),{pod_package_id:'fixture',interior_page_count:316,unit:'pt'});
  assert.ok(calls.every(call=>!call.url.includes('print-jobs')&&!call.url.includes('validate')));
  await assert.rejects(()=>client.coverDimensions({pages:0,package:'fixture'}));
});
