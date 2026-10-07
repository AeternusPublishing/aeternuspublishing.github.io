// Recovery rehearsal into a new, separate D1 database. Never modifies the shop DB.
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(!process.argv.includes('--authorized-cloud-test'))throw new Error('Cloud recovery test authorization required');
const folder=join(process.env.LOCALAPPDATA,'AETERNUS','commerce-preview');
const names=(await readdir(folder)).filter(n=>n.startsWith('cloud-d1-')&&n.endsWith('.manifest.json'));
const manifests=await Promise.all(names.map(async n=>JSON.parse(await readFile(join(folder,n),'utf8'))));
const source=manifests.sort((a,b)=>b.verified_at.localeCompare(a.verified_at))[0];
if(!source||source.integrity!=='ok')throw new Error('Verified local restoration required');
const sql=await readFile(source.sql_path);
if(createHash('sha256').update(sql).digest('hex')!==source.sql_sha256)throw new Error('Backup hash mismatch');
const authentication=await readFile(join(process.env.APPDATA,'xdg.config','.wrangler','config','default.toml'),'utf8');
const oauth=authentication.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if(!oauth)throw new Error('Existing Cloudflare authentication required');
const base='https://api.cloudflare.com/client/v4/accounts/5a177f4bf049aa9628414538d5e37b9f/d1/database';
async function api(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${oauth}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok||!d.success)throw new Error('Recovery API failed; provider output suppressed');return d.result;}
const databases=await api('');if(databases.length>=8)throw new Error('Recovery rehearsal would approach free database allowance');
const name=`aeternus-recovery-${randomUUID().slice(0,8)}`;
const target=await api('',{name});
if(target.uuid==='a6123bd1-c68e-4c37-b989-5125d2575306'||target.name!==name)throw new Error('Unsafe recovery destination');
const cli=join(process.env.APPDATA,'npm','node_modules','wrangler','bin','wrangler.js');
const restored=spawnSync(process.execPath,[cli,'d1','execute',name,'--remote','--file',source.sql_path,'--yes','--config',fileURLToPath(new URL('./wrangler.jsonc',import.meta.url))],{encoding:'utf8',windowsHide:true,maxBuffer:64000,timeout:90000});
if(restored.status!==0)throw new Error(`Restore failed in separate recovery database ${name}; original shop DB unchanged`);
const result=await api(`/${target.uuid}/query`,{sql:"SELECT (SELECT count(*) FROM orders) AS orders,(SELECT count(*) FROM documents) AS documents,(SELECT count(*) FROM outbox) AS outbox,(SELECT count(*) FROM sqlite_master WHERE name IN ('orders','events','requests','outbox','documents')) AS tables,(SELECT count(*) FROM orders WHERE status='REFUNDED' AND refunded=100 AND job_id IS NULL) AS refunded_test_orders"});
const counts=result[0]?.results?.[0];
if(counts?.orders!==source.order_count||counts.tables!==5||counts.refunded_test_orders!==1)throw new Error('Recovered data does not match test backup');
const evidence={schema_version:1,verified_at:new Date().toISOString(),backup_sha256:source.sql_sha256,recovery_database:name,recovery_database_id:target.uuid,
  cloud_restore_verified:true,original_database_modified:false,recovery_database_retained:true,counts,customer_data_is_fictitious:true};
await writeFile(new URL('./evidence/cloud-restore-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
