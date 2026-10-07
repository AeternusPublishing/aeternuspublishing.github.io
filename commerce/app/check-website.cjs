const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');const cli=path.join(root,'node_modules/@11ty/eleventy/cmd.cjs');
for(const [lang,preview,mode] of [['de',false,'preview'],['en',false,'preview'],['de',true,'preview'],['en',true,'preview'],['en',true,'production']]){
  const output=path.join(root,'work',`shop-integration-${lang}-${preview}-${mode}`);
  const args=[cli,`--output=${output}`,'--quiet'];if(lang==='en')args.push('--config=eleventy.international.cjs');
  const result=spawnSync(process.execPath,args,{cwd:root,env:{...process.env,AETERNUS_SHOP_PREVIEW:preview?'1':'0',AETERNUS_SITE_MODE:mode},encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr);
  let pages=0,links=0;function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(file.endsWith('.html')){pages++;if(fs.readFileSync(file,'utf8').includes('127.0.0.1:8093'))links++;}}}walk(output);
  if(pages<10 || (preview&&mode!=='production'?links===0:links!==0))throw new Error('Website shop gating failed');
  console.log(JSON.stringify({language:lang,mode,preview,pages,preview_links:links,status:'PASS'}));
}
