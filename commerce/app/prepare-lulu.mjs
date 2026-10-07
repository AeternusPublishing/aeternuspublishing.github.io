import catalog from './catalog.json' with {type:'json'};
import plan from './release-plan.json' with {type:'json'};
import {loadSandboxCredentials} from './credentials.mjs';
import {providers} from './providers.mjs';
import {writeFile} from 'node:fs/promises';
const provider=providers(loadSandboxCredentials({...process.env,MODE:'sandbox'}));
const products=[];
for(const sku of plan.pilot_skus){
  const item=catalog.items.find(book=>book.sku===sku);
  if(!item)throw new Error('Pilot candidate missing');
  try{products.push({sku,isbn:item.isbn,pages:item.pages,pod_package_id:item.package,dimensions:await provider.coverDimensions(item),status:'DIMENSIONS_RETURNED_NOT_FILE_VALIDATION'});}
  catch{products.push({sku,status:'PROFILE_REQUIRES_REVIEW'});}
}
const evidence={schema_version:1,verified_at:new Date().toISOString(),endpoint:'https://api.sandbox.lulu.com/cover-dimensions/',products,
  catalog_source:'Candidate specifications only; re-run after final print page count',print_ready:false,files_uploaded:0,print_jobs_created:0,paid_calls:0};
await writeFile(new URL('./evidence/lulu-product-preparation.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
if(products.some(product=>product.status==='PROFILE_REQUIRES_REVIEW'))process.exitCode=2;
