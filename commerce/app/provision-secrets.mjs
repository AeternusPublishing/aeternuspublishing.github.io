// Publisher-authorized transfer to exactly the private sandbox Worker. No secret files.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {join} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {loadSandboxCredentials} from './credentials.mjs';
if(!process.argv.includes('--authorized-cloud-transfer')||process.platform!=='win32')throw new Error('Explicit Windows sandbox cloud-transfer authorization required');
const env=loadSandboxCredentials({...process.env,MODE:'sandbox'});
if(!env.STRIPE_KEY?.startsWith('sk_test_')||!env.LULU_CLIENT_KEY||!env.LULU_CLIENT_SECRET)throw new Error('Sandbox credentials missing');
const helper=fileURLToPath(new URL('./credential-store.py',import.meta.url));
const existing=spawnSync('python',[helper,'read','shop-admin'],{encoding:'utf8',windowsHide:true,maxBuffer:16000});
const adminToken=existing.status===0?JSON.parse(existing.stdout).admin_token:randomBytes(32).toString('hex');
if(!/^[a-f0-9]{64}$/.test(adminToken))throw new Error('Invalid private admin credential');
if(existing.status!==0){
  const stored=spawnSync('python',[helper,'store','shop-admin'],{input:JSON.stringify({admin_token:adminToken}),encoding:'utf8',windowsHide:true});
  if(stored.status!==0)throw new Error('Admin vault storage failed');
}
const secrets={STRIPE_KEY:env.STRIPE_KEY,LULU_CLIENT_KEY:env.LULU_CLIENT_KEY,LULU_CLIENT_SECRET:env.LULU_CLIENT_SECRET,ADMIN_TOKEN:adminToken};
const wrangler=process.env.WRANGLER_CLI||join(process.env.APPDATA,'npm','node_modules','wrangler','bin','wrangler.js');
const result=spawnSync(process.execPath,[wrangler,'secret','bulk','--config',fileURLToPath(new URL('./wrangler.jsonc',import.meta.url))],
  {input:JSON.stringify(secrets),encoding:'utf8',windowsHide:true,maxBuffer:64000,timeout:90000});
if(result.status!==0)throw new Error('Cloudflare secret transfer failed; values and provider output suppressed');
const evidence={schema_version:1,verified_at:new Date().toISOString(),mode:'sandbox',destination:'Cloudflare Worker aeternus-commerce-sandbox',
  secret_names:Object.keys(secrets),values_recorded:false,local_admin_store:'Windows Credential Manager: AETERNUS/Shop/SandboxAdmin',
  webhook_secret_status:'DEDICATED_ENDPOINT_NOT_CREATED',live_credentials_transferred:false};
await writeFile(new URL('./evidence/cloud-secret-provisioning.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
