const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {parseDocument}=require('htmlparser2');
const {findAll,textContent,removeElement}=require('domutils');
const render=require('dom-serializer').default;
const catalog=require('../catalog/index.cjs');
const worlds=require('../catalog/author-worlds.cjs');
const wilderness=require('../catalog/wilderness.cjs');
const snapshot=require('../catalog/wilderness-register.snapshot.json');
const context=require('../catalog/wilderness-context.json');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
assert.equal(snapshot.records_sha256,hash(JSON.stringify(snapshot.records)));
for(const item of Object.values(context.works)) {
  assert(Number.isInteger(item.year)&&item.year>=1800&&item.year<=1921);
  assert(item.sentence.split(/\s+/).length<=25);
  assert(item.sources.length&&item.sources.every(s=>s.startsWith('https://')));
}
for(const item of Object.values(context.authors))assert(item.sentence.split(/\s+/).length<=25&&item.sources.length);
let links=0,emptyCards=0;
for(const slug of wilderness.pages) {
  const profile=worlds.get(slug,'en');
  const html=fs.readFileSync(path.join('dist/release/authors',slug,'index.html'),'utf8');
  const doc=parseDocument(html),nodes=findAll(n=>n.type==='tag',doc.children);
  const items=wilderness.further(slug,catalog.englishBooks,catalog.german.books);
  const lis=nodes.filter(n=>n.attribs?.['data-work']);
  assert.equal(lis.length,items.length,slug+': generated LIVE entries');
  for(const item of items) {
    assert(snapshot.records.some(r=>r.werk_kanon===item.work_id&&r.sprache===item.language&&r.status==='LIVE'));
    const li=lis.find(n=>n.attribs['data-work']===item.work_id&&textContent(n).includes(item.title));
    assert(li&&textContent(li).includes(item.year)&&textContent(li).includes(item.authorName));
    assert(html.includes(item.url));links++;
  }
  if(wilderness.commissioned.includes(slug)) {
    assert.deepEqual(Object.keys(profile.locales),['en']);
    assert(!profile.scope.de&&!profile.scope.legacyEn);
    assert.equal(nodes.filter(n=>n.name==='article'&&n.attribs.class==='author-book').length,0);
    assert(!html.includes('/autoren/'+slug+'/'));
    assert(!nodes.some(n=>n.name==='img'&&n.attribs.alt===profile.name));
    emptyCards++;
  }
}
// A newly LIVE catalogue product appears automatically; earlier states do not.
const fixture={id:'fixture',work_id:'WHM_001',author:'william-henry-harrison-murray',authorName:'William Henry Harrison Murray',title:'Fixture title from catalogue',language:'en',url:'/books/fixture/',isbn:{}};
const row={werk_kanon:'WHM_001',sprache:'en',status:'GEBAUT'};
const originalRecords=snapshot.records;
snapshot.records=[row];
let lifecycleStates=0;
try {
  for(const status of ['ENTWURF','GEBAUT','FREIGEGEBEN','HOCHGELADEN','EINGEREICHT','LIVE']) {
    row.status=status;
    const results=wilderness.further('horace-kephart',[fixture],[]);
    assert.equal(results.length,status==='LIVE'?1:0,status);
    if(results.length)assert.equal(results[0].title,fixture.title);
    lifecycleStates++;
  }
  row.status='LIVE';
  assert.equal(wilderness.further(fixture.author,[fixture],[]).length,0,'self reference');
  assert.equal(wilderness.further('horace-kephart',[{...fixture,language:'de'}],[]).length,0,'wrong edition language');
  assert(!wilderness.live({...fixture,work_id:'UNREGISTERED',isbn:{}}),'unknown work');
  row.werk_kanon='BP_FUTURE';
  const future={...fixture,work_id:'BP_FUTURE',author:'robert-baden-powell',original_publication_year:1908};
  assert.equal(wilderness.further('horace-kephart',[future],[])[0].title,future.title,'new catalogue work needs no hand-maintained title list');
  assert.throws(()=>wilderness.further('horace-kephart',[{...future,original_publication_year:null}],[]),/source-edition year/);
} finally { snapshot.records=originalRecords; }
let preserved=0;
for(const slug of ['richard-jefferies','daniel-carter-beard']) {
  const profile=worlds.profiles.find(p=>p.slug===slug);
  assert.equal(hash(fs.readFileSync('src'+profile.image.file)),profile.image.approval.sha256);
  const before=path.join('work',slug+'-before.html');
  if(fs.existsSync(before)) {
    const after=parseDocument(fs.readFileSync(path.join('dist/release/authors',slug,'index.html'),'utf8'));
    const additions=findAll(n=>n.type==='tag'&&n.attribs?.class?.split(' ').includes('wilderness-further'),after.children);
    assert.equal(additions.length,1);removeElement(additions[0]);
    const normal=value=>render(parseDocument(value)).replace(/>\s+</g,'><').trim();
    assert.equal(normal(render(after)),normal(fs.readFileSync(before,'utf8')),slug+': change beyond Further editions');preserved++;
  }
}
for(const [short,slug] of [['kephart','horace-kephart'],['murray','william-henry-harrison-murray'],['miller','warren-hastings-miller'],['stewart','elihu-stewart']]) {
  const html=fs.readFileSync(`public/qr/${short}/index.html`,'utf8');
  assert(html.includes(`https://aeternuspublishing.com/authors/${slug}/`));
  assert(!html.includes('navigator.language'));assert(html.includes('URLSearchParams'));
}
console.log(JSON.stringify({status:'PASS',pages:6,newEnglishPages:4,furtherLinks:links,emptyNewAuthorCards:emptyCards,lifecycleStates,negativeCases:4,futureCatalogueCases:1,preservedExistingPages:preserved,portraitsUnchanged:2,qrShortcuts:4,registerRecords:snapshot.records.length}));
