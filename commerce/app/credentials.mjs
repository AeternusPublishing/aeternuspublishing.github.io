import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export function loadStripeCredentials(environment) {
  if(environment.MODE!=='sandbox'||environment.STRIPE_KEY||process.platform!=='win32')return environment;
  const result=spawnSync('python',[fileURLToPath(new URL('./credential-store.py',import.meta.url)),'read','stripe'],{encoding:'utf8',windowsHide:true,maxBuffer:16000});
  if(result.status!==0)return environment;
  const credentials=JSON.parse(result.stdout);
  if(!credentials.api_key?.startsWith('sk_test_'))throw new Error('Stripe sandbox credential required');
  return {...environment,STRIPE_KEY:credentials.api_key};
}
export function loadSandboxCredentials(environment) {
  environment=loadStripeCredentials(environment);
  if(environment.MODE !== 'sandbox' || environment.LULU_CLIENT_KEY || process.platform !== 'win32')return environment;
  const result=spawnSync('python',[fileURLToPath(new URL('./credential-store.py',import.meta.url)),'read'],{encoding:'utf8',windowsHide:true,maxBuffer:16000});
  if(result.status!==0)throw new Error('Lulu sandbox credential is missing in Windows Credential Manager');
  const credentials=JSON.parse(result.stdout);
  return {...environment,LULU_CLIENT_KEY:credentials.client_key,LULU_CLIENT_SECRET:credentials.client_secret};
}
