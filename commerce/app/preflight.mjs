import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {productFindings} from './product-check.mjs';

const root=fileURLToPath(new URL('./',import.meta.url));
const read=name=>JSON.parse(readFileSync(join(root,name),'utf8'));
export function assess(plan,catalog) {
  const findings=[];
  const products=plan.pilot_skus.map(sku=>{
    const item=catalog.items.find(item=>item.sku===sku);
    const problems=item?productFindings(item,plan.initial_currency):['SKU_NOT_FOUND'];
    for(const code of problems)findings.push({id:sku,code,owner:'production'});
    return {sku,ready:problems.length===0,findings:problems};
  });
  if(!products.length)findings.push({id:'pilot',code:'NO_PILOT_PRODUCTS',owner:'publisher'});
  if(plan.pilot_selection_status!=='APPROVED')findings.push({id:'pilot',code:'PILOT_SELECTION_NOT_APPROVED',owner:'publisher'});
  for(const requirement of plan.requirements)
    if(requirement.status!=='VERIFIED'||!requirement.evidence?.sha256?.match(/^[a-f0-9]{64}$/)||!requirement.evidence?.path)
      findings.push({id:requirement.id,code:'EVIDENCE_OR_APPROVAL_MISSING',owner:requirement.owner});
  if(plan.live_enabled!==true)findings.push({id:'live',code:'LIVE_DISABLED',owner:'publisher'});
  return {ready:findings.length===0,products,findings};
}

if(process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]) {
  const plan=read('release-plan.json'),result=assess(plan,read('catalog.json'));
  // Hash every claimed approval file; a status string alone never passes the check.
  for(const requirement of plan.requirements)if(requirement.evidence?.path) {
    try {
      const actual=createHash('sha256').update(readFileSync(requirement.evidence.path)).digest('hex');
      if(actual!==requirement.evidence.sha256)result.findings.push({id:requirement.id,code:'EVIDENCE_HASH_MISMATCH',owner:requirement.owner});
    } catch {result.findings.push({id:requirement.id,code:'EVIDENCE_FILE_UNAVAILABLE',owner:requirement.owner});}
  }
  const files=[];
  function scan(folder) {
    for(const entry of readdirSync(folder,{withFileTypes:true})) {
      if(['evidence','test','__pycache__'].includes(entry.name))continue;
      const path=join(folder,entry.name);
      if(entry.isDirectory())scan(path);
      else files.push({path:relative(root,path).replaceAll('\\','/'),sha256:createHash('sha256').update(readFileSync(path)).digest('hex')});
    }
  }
  scan(root);
  const vault=process.platform==='win32'?spawnSync('python',[join(root,'credential-store.py'),'status'],{encoding:'utf8',windowsHide:true}):null;
  let stored=false;
  try {stored=JSON.parse(vault?.stdout||'{}').stored===true;}catch { /* Missing vault is a finding, never log child output. */ }
  const stripeVault=process.platform==='win32'?spawnSync('python',[join(root,'credential-store.py'),'status','stripe'],{encoding:'utf8',windowsHide:true}):null;
  let stripeStored=false;
  try {stripeStored=JSON.parse(stripeVault?.stdout||'{}').stored===true;}catch { /* Report only, never expose child output. */ }
  const report={schema_version:1,generated_at:new Date().toISOString(),sales_ready:result.findings.length===0,
    technical_result:'REPORT_ONLY_NOT_RELEASE_AUTHORITY',...result,
    credentials:{lulu_sandbox_local:stored,stripe_sandbox_local:stripeStored,stripe_test_process:!!process.env.STRIPE_KEY?.startsWith('sk_test_'),stripe_webhook_process:!!process.env.STRIPE_WEBHOOK_SECRET},
    files:files.sort((a,b)=>a.path.localeCompare(b.path)),paid_calls:0,uploads:0};
  // Runtime is still deliberately sandbox-only even if external approvals have arrived.
  report.sales_ready=false;
  report.findings.push({id:'runtime',code:'PRODUCTION_RUNTIME_NOT_IMPLEMENTED',owner:'operator'});
  report.ready=false;
  if(process.argv.includes('--report'))writeFileSync(join(root,'evidence','launch-preflight.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({sales_ready:report.sales_ready,local_lulu_credentials:stored,products:report.products,findings:report.findings},null,2));
  if(!process.argv.includes('--report'))process.exitCode=2;
}
