import {cpSync,mkdirSync,copyFileSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import catalog from './catalog.json' with {type:'json'};
const here=dirname(fileURLToPath(import.meta.url));const output=resolve(here,'../../dist/shop-assets');
mkdirSync(output,{recursive:true});cpSync(resolve(here,'public'),output,{recursive:true});
// Cloud administration needs an explicitly supplied credential; local bootstrap is loopback-only.
const adminFile=resolve(output,'admin.html');
writeFileSync(adminFile,readFileSync(adminFile,'utf8').replace('value="LOCAL_ADMIN_TOKEN"','value=""'));
for(const cover of new Set(catalog.items.map(i=>i.cover).filter(Boolean))) {
  if(!/^\/assets\/images\/[a-zA-Z0-9._-]+\.(jpg|webp|avif)$/.test(cover))throw new Error('Unexpected asset path');
  const source=resolve(here,'../../src','.'+cover);const target=resolve(output,'.'+cover);
  if(!existsSync(source))throw new Error(`Missing website cover: ${cover}`);
  mkdirSync(dirname(target),{recursive:true});copyFileSync(source,target);
}
console.log(`Shop preview assets assembled: ${output}`);
