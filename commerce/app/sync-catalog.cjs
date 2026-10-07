// Bibliographic import only: website metadata never grants inventory, pricing or print approval.
const fs=require('node:fs');
const path=require('node:path');
const catalog=require('../../catalog/index.cjs');
const file=path.join(__dirname,'catalog.json');
const current=JSON.parse(fs.readFileSync(file,'utf8'));
const items=new Map(current.items.map(i=>[i.isbn,i]));
const normalize=value=>String(value||'').replace(/[^0-9]/g,'');
function add(book,format,isbn,language){
  isbn=normalize(isbn);if(!/^97[89]\d{10}$/.test(isbn))return;
  const key=format.toLowerCase();if(!/paperback|hardcover|taschenbuch|gebunden/.test(key))return;
  const hardcover=/hardcover|gebunden/.test(key);
  const entry=items.get(isbn)||{sku:`ISBN_${isbn}`,work:book.work_id||null,title:book.title,author:book.authorName||book.author,language,
    format:hardcover?'Hardcover':'Paperback',isbn,pages:null,package:null,prices:{},print_assets:null,approved:false,demo_cents:hardcover?3490:2490};
  const cover=language==='en'?book.cover:`/assets/images/${book.cover}-fallback.jpg`;
  if(cover&&fs.existsSync(path.join(__dirname,'../../src',cover)))entry.cover=cover;
  entry.website_url=book.url;entry.bibliographic_source=language==='en'?book.provenance:`catalog/legacy/catalogue-de.cjs#${book.id}`;
  items.set(isbn,entry);
}
for(const b of catalog.englishBooks)for(const [type,isbn] of Object.entries(b.isbn))add(b,type,isbn,'en');
for(const b of catalog.german.books)for(const f of b.formats||[])add(b,f.name,f.isbn,'de');
const result={...current,import_source:'Website catalogue snapshot; every imported product remains unapproved. Pilot ISBNs checked separately against bookregister.',items:[...items.values()].sort((a,b)=>Number(b.work==='CBB_001')-Number(a.work==='CBB_001')||a.language.localeCompare(b.language)||a.title.localeCompare(b.title)||a.format.localeCompare(b.format))};
console.log(JSON.stringify({mode:process.argv.includes('--write')?'write':'check',products:result.items.length,approved:result.items.filter(i=>i.approved).length,by_language:Object.fromEntries(['de','en'].map(l=>[l,result.items.filter(i=>i.language===l).length]))}));
if(process.argv.includes('--write'))fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');
