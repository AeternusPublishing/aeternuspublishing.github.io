const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {parseDocument}=require('htmlparser2');
const {findAll,textContent}=require('domutils');
const {profiles,get}=require('../catalog/author-worlds.cjs');
const baseline=require('../docs/author-worlds/inventory-before.json');
const deOnly=process.argv.includes('--de-only');
const tags=doc=>findAll(n=>n.type==='tag',doc.children);
function validate(p){
 assert.equal(p.schema,'AETERNUS_AUTHOR_WORLD_V1');
 assert(['compact','expanded','comprehensive'].includes(p.depth));
 const ids=new Set(p.sources.map(s=>s.id));assert.equal(ids.size,p.sources.length,p.slug+': duplicate source');
 for(const s of p.sources){assert(s.title&&/^https:\/\//.test(s.url),p.slug+': source');assert(!s.url.includes('/search?'),p.slug+': unresolved discovery URL');}
 for(const f of p.facts){assert(f.kind==='historical-fact'&&f.statement&&f.sources.length);for(const id of f.sources)assert(ids.has(id),p.slug+': unknown claim source '+id);}
 for(const [lang,l] of Object.entries(p.locales)){
  assert(p.scope[lang],p.slug+': unexpected language');
  for(const field of ['tagline','intro','orientation','literature','legacy','bridge'])assert(l[field]?.length,p.slug+': empty '+field);
  assert(!JSON.stringify(l).match(/&(?:ndash|mdash|amp|nbsp);|\uFFFD|\bundefined\b|\{\{/),p.slug+': encoded prose');
  assert.equal(l.claimRefs.length,p.facts.length,p.slug+': claim map');
 }
 for(const h of p.honours||[]){assert(['order','decoration','title','prize','academic'].includes(h.category));assert(h.name&&h.year&&h.sources.length);for(const id of h.sources)assert(ids.has(id));}
 for(const c of p.connections||[]){assert(profiles.some(t=>t.slug===c.slug));assert(['documented-meeting','institutional-context','shared-campaign','thematic-comparison'].includes(c.kind));for(const id of c.sources)assert(ids.has(id),p.slug+': connection source '+id);}
 if(p.image.status==='verified'){assert(p.image.rights&&p.image.provenance&&p.image.processing);assert(fs.existsSync(path.join('src',p.image.file)));}
 else if(p.image.status==='publisher-approved'){assert(p.image.approval?.authority);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join('src',p.image.file))).digest('hex'),p.image.approval.sha256);assert(p.image.caption.de&&p.image.caption.en);}
 else assert(p.image.reason,p.slug+': image omission needs a reason');
}
assert.equal(profiles.length,39);assert.equal(new Set(profiles.map(p=>p.slug)).size,39);
assert.throws(()=>get('uncommissioned-author','en'));
for(const p of profiles)validate(p);
// Mutated examples establish that missing evidence and accidental language expansion fail.
const copy=()=>structuredClone(profiles[0]);let red=copy();red.facts[0].sources=['UNKNOWN'];assert.throws(()=>validate(red));
red=copy();red.scope.pl=false;red.locales.pl=red.locales.en;assert.throws(()=>validate(red));
red=structuredClone(profiles.find(p=>p.honours?.length));red.honours[0].sources=[];assert.throws(()=>validate(red));
red=copy();red.image.status='verified';red.image.rights='';assert.throws(()=>validate(red));
let routes=0,bookLinks=0;const pageRecords=[];
for(const p of profiles){
 const targets=[];
 if(p.scope.de)targets.push(['de','public',`/autoren/${p.slug}/`]);
 if(p.scope.en&&!deOnly)targets.push(['en','dist/release',`/authors/${p.slug}/`]);
 if(p.scope.legacyEn)targets.push(['en','public',`/en/authors/${p.slug}/`]);
 for(const [lang,root,route] of targets){
  const file=path.join(root,route,'index.html'),html=fs.readFileSync(file,'utf8'),doc=parseDocument(html),nodes=tags(doc),world=get(p.slug,lang);
  assert(html.includes(`data-author-world="${p.slug}"`),route+': world missing');
  assert.equal(nodes.filter(n=>n.name==='h1').length,1,route+': h1');
  assert.equal(textContent(nodes.find(n=>n.name==='h1')),p.name,route+': heading');
  for(const n of nodes.filter(n=>/^h[1-6]$/.test(n.name)))assert(textContent(n).trim(),route+': empty heading');
  assert(!textContent(doc).includes('&ndash;'),route+': escaped date');
  const ids=nodes.map(n=>n.attribs?.id).filter(Boolean);assert.equal(ids.length,new Set(ids).size,route+': duplicate IDs');
  const hero=html.indexOf('data-author-world='),books=html.indexOf('class="author-books'),bio=html.indexOf('author-biography');
  assert(hero>=0&&books>hero&&bio>books,route+': hero → books → biography');
  for(const n of nodes){
   const src=n.attribs?.src;if(n.name==='img'&&src?.startsWith('/'))assert(fs.existsSync(path.join(root,src)),route+': missing image '+src);
   const href=n.attribs?.href;
   if(n.name==='a'&&href?.startsWith('#')&&href.length>1)assert(ids.includes(href.slice(1)),route+': anchor '+href);
   if(n.name==='a'&&/^\/(?:books|buecher)\//.test(href||'')){assert(fs.existsSync(path.join(root,href,'index.html')),route+': book route '+href);bookLinks++;}
  }
  const portrait=nodes.find(n=>n.name==='img'&&n.attribs?.alt===p.name);
  assert.equal(Boolean(portrait),Boolean(world.portrait),route+': portrait visibility mismatch');
  if(world.portrait){assert.equal(portrait.attribs.src,p.image.file);assert(textContent(doc).includes(p.image.caption[lang]),route+': portrait caption missing');}
  for(const l of world.connections)assert(html.includes(l.url),route+': connection missing');
  if(lang==='en'){
   const expected=require('../catalog/index.cjs').englishBooks.filter(b=>b.author===p.slug);
   const cards=nodes.filter(n=>n.name==='article'&&n.attribs?.class==='author-book');
   assert.equal(cards.length,expected.length,route+': edition language or missing cards');
   for(let i=0;i<cards.length;i++){
    const children=tags(cards[i]),cover=children.find(n=>n.name==='img');
    assert.equal(expected[i].language,'en');
    if(cover)assert.equal(cover.attribs.src,expected[i].cover,route+': foreign-language cover');
    assert(children.some(n=>n.name==='a'&&n.attribs.href.endsWith(expected[i].url)),route+': wrong edition link');
   }
   if(!expected.length)assert(html.includes('German-language editions')&&html.includes('https://aeternus-verlag.de/autoren/'+p.slug+'/'),route+': missing language referral');
  }
  pageRecords.push({route,root,language:lang,sha256:crypto.createHash('sha256').update(html).digest('hex')});routes++;
 }
}
assert.equal(routes,deOnly?33:65);
assert.equal(profiles.filter(p=>p.scope.de).length,21);assert.equal(profiles.filter(p=>p.scope.en).length,32);
// The original catalogue data are retained verbatim; all generated book-page text is compared locally.
let unchangedBooks=0;
for(const [oldRoot,newRoot,folder] of [['work/before-de','public','buecher'],['work/before-en','dist/release','books']]){
 if(deOnly&&newRoot==='dist/release')continue;
 if(!fs.existsSync(oldRoot))continue;
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const old of walk(path.join(oldRoot,folder)).filter(f=>f.endsWith('.html'))){
  const rel=path.relative(oldRoot,old),now=path.join(newRoot,rel);
  const normal=s=>s.replace(/\r\n/g,'\n');
  assert.equal(normal(fs.readFileSync(now,'utf8')),normal(fs.readFileSync(old,'utf8')),rel+': book content changed');unchangedBooks++;
 }
}
for(const row of baseline.authors){const p=profiles.find(p=>p.slug===row.slug);assert.deepEqual(p.scope,row.scope,p.slug+': route scope changed');}
const result={status:'PASS',mode:deOnly?'de-build':'both-builds',authors:39,germanPages:21,englishPages:deOnly?0:32,legacyEnglishPages:12,routes,bookLinks,unchangedBooks,negativeFixtures:4,
 depths:Object.fromEntries(['compact','expanded','comprehensive'].map(d=>[d,profiles.filter(p=>p.depth===d).map(p=>p.slug)])),
 honours:profiles.filter(p=>p.honours?.length).length,timelines:profiles.filter(p=>p.timeline?.length).length,connections:profiles.reduce((n,p)=>n+(p.connections?.length||0),0),approvedPortraits:profiles.filter(p=>p.image.status==='publisher-approved').length,verifiedPortraits:profiles.filter(p=>p.image.status==='verified').length,pages:pageRecords};
if(process.argv.includes('--record'))fs.writeFileSync('docs/author-worlds/validation.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,pages:undefined,depths:Object.fromEntries(Object.entries(result.depths).map(([d,a])=>[d,a.length]))}));
