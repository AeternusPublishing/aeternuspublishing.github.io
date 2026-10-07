// Export only; restoration is into a new local database, never over the cloud database.
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=join(process.env.LOCALAPPDATA,'AETERNUS','commerce-preview');
await mkdir(folder,{recursive:true});
const id=randomUUID(),sql=join(folder,`cloud-d1-${id}.sql`),restored=join(folder,`cloud-d1-${id}.restored.sqlite`);
const cli=process.env.WRANGLER_CLI||join(process.env.APPDATA,'npm','node_modules','wrangler','bin','wrangler.js');
const exported=spawnSync(process.execPath,[cli,'d1','export','aeternus-commerce-sandbox','--remote','--config',fileURLToPath(new URL('./wrangler.jsonc',import.meta.url)),'--output',sql],
  {encoding:'utf8',windowsHide:true,maxBuffer:64000,timeout:90000});
// Never publish the provider's temporary signed download URL.
if(exported.status!==0)throw new Error('D1 export failed; provider output suppressed');
const code=`import sys,sqlite3,pathlib,json
source,target=map(pathlib.Path,sys.argv[1:])
assert not target.exists()
db=sqlite3.connect(target)
db.executescript(source.read_text(encoding='utf-8'))
integrity=db.execute('PRAGMA integrity_check').fetchone()[0]
tables=[row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE name IN ('orders','events','requests','outbox','documents') ORDER BY name")]
print(json.dumps({'integrity':integrity,'application_tables':tables,'order_count':db.execute('SELECT count(*) FROM orders').fetchone()[0]}))
db.close()
assert integrity=='ok' and len(tables)==5
`;
const restore=spawnSync('python',['-c',code,sql,restored],{encoding:'utf8',windowsHide:true,maxBuffer:4000,timeout:30000});
if(restore.status!==0)throw new Error('D1 backup local restoration failed');
const result=JSON.parse(restore.stdout);
const evidence={schema_version:1,verified_at:new Date().toISOString(),source:'Cloudflare D1 aeternus-commerce-sandbox',
  sql_sha256:createHash('sha256').update(await readFile(sql)).digest('hex'),restore_target:'New local SQLite database outside Git',
  ...result,remote_database_modified:false,cloud_restore_verified:false,backup_contains_customer_data:result.order_count>0};
await writeFile(join(folder,`cloud-d1-${id}.manifest.json`),JSON.stringify({...evidence,sql_path:sql,restore_path:restored},null,2)+'\n',{flag:'wx'});
await writeFile(new URL('./evidence/cloud-backup-verification.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence));
