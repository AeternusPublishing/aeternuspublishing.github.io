// Derived, portable graph projection: never edit the generated JSON by hand.
const fs=require('node:fs');
const atlas=require('../src/_data/kosmos');
const de=require('../src/_data/catalogue');
const en=require('../catalog/index.cjs').englishBooks;
const history=require('../editorial/history.cjs');
const nodes=[],links=[],ids=new Set(),edges=new Set();
const origin={de:'https://aeternus-verlag.de',en:'https://aeternuspublishing.com'};
const add=n=>{if(ids.has(n.id))throw Error('Duplicate '+n.id);ids.add(n.id);nodes.push(n);return n;};
const edge=(source,target,type,label)=>{if(!ids.has(source)||!ids.has(target))throw Error('Missing endpoint');const key=[source,target].sort().join('|')+'|'+type;if(!edges.has(key)){edges.add(key);links.push({source,target,type,label});}};
const seriesNames={anthrazit:'ANTHRACITE',gruen:'GREEN',rot:'RED',blau:'BLUE',bernstein:'AMBER',weiss:'WHITE',purpur:'PURPLE'};
for(const s of de.series)add({id:'series:'+s.slug,type:'series',label:{de:s.name,en:seriesNames[s.slug]},url:{de:origin.de+'/reihen/'+s.slug+'/',en:origin.en+'/series/'+s.slug+'/'}});
const byCover=new Map(),byRef=new Map();
for(const b of de.books){const n=add({id:'book:de:'+b.id,type:'book',label:{de:b.title,en:b.title},author:b.author,language:'de',cover:origin.de+'/assets/images/'+b.cover+'.webp',url:{de:origin.de+b.url,en:origin.de+b.url},summary:{de:b.summary,en:''}});byCover.set(b.cover,n.id);byRef.set('de:'+b.id,n.id);edge(n.id,'series:'+b.series,'series');}
for(const b of en){const n=add({id:'book:'+b.id,type:'book',label:{de:b.title,en:b.title},author:b.authorName,language:'en',cover:b.cover?origin.en+b.cover:null,url:{de:origin.en+b.url,en:origin.en+b.url},summary:{de:'',en:b.description.short}});byRef.set('en:'+b.id,n.id);if(b.cover)byCover.set(b.cover.split('/').pop().replace(/-fallback\.jpg$/,''),n.id);edge(n.id,'series:'+b.series,'series');}
const atlasIds=new Map();
for(const b of atlas.nodes){const cover=b.coverImageUrl.split('/').pop().replace('.webp','');let id=byCover.get(cover);if(!id){id='book:atlas:'+b.id;add({id,type:'book',label:{de:b.title,en:b.title},author:b.author,language:b.language==='Englisch'?'en':'de',cover:origin.de+b.coverImageUrl,url:{de:origin.de+b.landingUrl,en:origin.de+b.landingUrl},summary:{de:b.summary,en:''}});}atlasIds.set(b.id,id);}
for(const e of atlas.links)edge(atlasIds.get(e.source),atlasIds.get(e.target),'curated',{de:e.reason,en:e.reason});
for(const t of history.data.themes)add({id:'theme:'+t.id,type:'theme',label:{de:t.locales.de.title,en:t.locales.en.title},url:{de:origin.de+history.routes.de+t.locales.de.slug+'/',en:origin.en+history.routes.en+t.locales.en.slug+'/'},summary:{de:t.locales.de.subtitle,en:t.locales.en.subtitle}});
for(const t of history.data.themes){for(const lang of ['de','en'])for(const ref of t.bookRefs[lang]||[])edge('theme:'+t.id,byRef.get(lang+':'+ref),'context');for(const id of t.relatedIds)edge('theme:'+t.id,'theme:'+id,'related');for(const id of t.parentIds)edge('theme:'+t.id,'theme:'+id,'parent');}
// Author/series membership is bibliographic, never presented as thematic influence.
for(const book of nodes.filter(n=>n.type==='book')){const id='author:'+book.author;if(!ids.has(id))add({id,type:'author',label:{de:book.author,en:book.author}});edge(book.id,id,'author');}
// Reuse the last complete atlas's editorial geography. Equivalent editions
// share a work's setting; books without a verified setting stay in the shelf.
const editionPlaces={
'en-ernest-thompson-seton-edition-rolf':'rolf',
'en-ernest-thompson-seton-edition-two-little-savages':'two-wild',
'en-ernest-thompson-seton-edition-arctic-prairies':'arctic',
'en-robert-montgomery-bird-edition-nick':'waldteufel',
'en-robert-montgomery-bird-edition-hawks':'hawks',
'en-george-washington-sears-woodcraft-illustrated':'woodcraft',
'en-francis-parkman-edition-oregon-trail':'oregon',
'en-james-hall-the-harpe-s-head-illustrated':'harpe',
'en-daniel-carter-beard-shelters-shacks-and-shanties-illustrated':'shelters',
'en-henry-rider-haggard-king-solomon-s-mines-annotated':'haggard',
'en-richard-jefferies-edition-bevis':'bevis',
'en-charles-brockden-brown-edgar-huntly-illustrated':'edgar-huntly',
'en-ernest-thompson-seton-wild-animals-i-have-known-annotated':'wild-animals',
'en-ernest-thompson-seton-the-biography-of-a-grizzly-annotated':'wahb',
'en-ernest-thompson-seton-lives-of-the-hunted-annotated':'hunted',
'en-ernest-thompson-seton-animal-heroes-annotated':'heroes',
'en-ernest-thompson-seton-monarch-the-big-bear-of-tallac-annotated':'monarch'
};
for(const n of nodes.filter(n=>n.type==='book')){
 const a=atlas.nodes.find(a=>a.coverImageUrl.split('/').pop()===n.cover?.split('/').pop()) || atlas.nodes.find(a=>a.id===editionPlaces[n.id.replace(/^book:/,'')]);
 if(a)n.geography={location:a.location,region:a.region,place:a.place,source:'kosmosSelection:'+a.id};
}
const result={schema:2,provenance:['src/_data/catalogue.js','catalog/index.cjs','src/_data/kosmos.js','editorial/historical-themes.json'],nodes,links};
fs.writeFileSync('editorial/library-graph.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({books:nodes.filter(n=>n.type==='book').length,themes:history.data.themes.length,links:links.length}));

