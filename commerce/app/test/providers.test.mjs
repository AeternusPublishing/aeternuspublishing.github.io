import {test} from 'node:test';
import assert from 'node:assert/strict';
import {providers} from '../providers.mjs';
import {loadSandboxCredentials} from '../credentials.mjs';

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
  for(const env of [{MODE:'simulation'},{MODE:'sandbox',LULU_CLIENT_KEY:'fixture',LULU_CLIENT_SECRET:'fixture'}])
    assert.equal(loadSandboxCredentials(env),env);
});
