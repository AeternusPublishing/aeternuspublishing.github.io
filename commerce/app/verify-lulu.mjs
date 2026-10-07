// Read-only provider verification using a documentation fixture, never a print order.
import {writeFile} from 'node:fs/promises';
import {loadSandboxCredentials} from './credentials.mjs';
import {providers} from './providers.mjs';

const env=loadSandboxCredentials({...process.env,MODE:'sandbox'});
const client=providers(env);
const address={name:'Test Reader',street1:'101 Independence Ave SE',city:'Washington',
  state_code:'DC',postcode:'20540',country_code:'US',phone_number:'+1 206 555 0100'};
try {
  const quote=await client.quote([{pages:32,package:'0600X0900BWSTDPB060UW444MXX',quantity:1}],address,'EUR','MAIL');
  const evidence={schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',
    credential_store:'Windows Credential Manager: AETERNUS/Lulu/Sandbox',
    oauth:'PASS',shipping_options:'PASS',cost_calculation:'PASS',currency:'EUR',destination:'US',
    cross_currency_checkout:'BLOCKED: sandbox cost calculations return account currency EUR; no unapproved conversion',
    fixture:'Lulu documentation package; public US address; not an approved AETERNUS product',
    provider_cost_cents:quote.cost_cents,shipping_levels:quote.options.map(o=>o.level),
    print_job_created:false,payment_created:false,live_enabled:false};
  await writeFile(new URL('./evidence/lulu-sandbox-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence));
} catch(error) {
  console.error('Lulu sandbox verification failed: '+error.message);
  process.exitCode=1;
}
