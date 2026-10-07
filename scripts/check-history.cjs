const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const history=require(root+'/editorial/history.cjs');
const catalog=require(root+'/catalog/index.cjs');
const reports=[];
for(const [lang,books,folder] of [['de',catalog.german.books,'work/history-de'],['en',catalog.englishBooks,'dist/release']]){
 const view=history.create(lang,books);const base=path.join(root,folder);
 for(const theme of view.themes){
  const words=theme.body.join(' ').split(/\s+/).length;assert(words>=120&&words<=220);
  const html=fs.readFileSync(path.join(base,theme.url,'index.html'),'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert(html.includes(`rel="canonical" href="${history.origins[lang]}${theme.url}"`));
  for(const l of ['de','en'])assert(html.includes(`hreflang="${l}" href="${theme.alternates[l]}"`));
  assert(!html.includes('<iframe'));assert(!html.includes('<details'));
  for(const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){let file=path.join(base,m[1]);if(m[1].endsWith('/'))file=path.join(file,'index.html');if(m[1].startsWith('/assets/editorial/'))continue;assert(fs.existsSync(file),`Missing ${lang}: ${m[1]}`);}
  for(const book of theme.books){assert(html.includes(`href="${book.url}"`));const bookhtml=fs.readFileSync(path.join(base,book.url,'index.html'),'utf8');assert(bookhtml.includes(`href="${theme.url}"`));assert.strictEqual(book,books.find(b=>b.id===book.id));}
  reports.push({language:lang,id:theme.id,words,bookCount:theme.books.length,url:history.origins[lang]+theme.url});
 }
 const index=fs.readFileSync(path.join(base,view.base,'index.html'),'utf8');assert.equal((index.match(/class="history-panel"/g)||[]).length,view.themes.length);
}
assert.equal(history.create('de',catalog.german.books).byBook['tagebuch-der-katastrophe'].length,2);
const extra=structuredClone(history.data.themes[0]);extra.id='civil-war';extra.parentIds=[];extra.relatedIds=[];extra.bookRefs={de:[],en:[]};for(const l of ['de','en'])extra.locales[l].slug='civil-war';
const child=structuredClone(extra);child.id='western-theater';child.parentIds=['civil-war'];for(const l of ['de','en'])child.locales[l].slug='western-theater';
const future=history.create('de',catalog.german.books,[...history.data.themes,extra,child]);assert.equal(future.themes.length,8);assert.equal(future.themes.find(t=>t.id==='civil-war').children[0].id,'western-theater');
const broken=structuredClone(history.data.themes);broken[0].bookRefs.de=['missing'];assert.throws(()=>history.create('de',catalog.german.books,broken),/Unknown book/);
const cyclic=[extra,child];extra.parentIds=['western-theater'];assert.throws(()=>history.validate(cyclic),/cycle/);
const result={status:'PASS',themes:reports,checks:['12 localized bodies 120–220 words','14 addressable pages','canonical and reciprocal hreflang','internal links','book object identity, no duplicated book data','bidirectional book links','many-to-many assignment','new topic and nested topic without component edits','cycles and unknown book IDs rejected'],cssBytes:fs.statSync(root+'/src/assets/css/history.css').size};
fs.writeFileSync(path.join(root,'work/HISTORICAL_CONTEXT_CHECKS.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

