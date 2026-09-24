const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const graph=require('../editorial/library-graph.json'),catalogue=require('../src/_data/catalogue'),history=require('../editorial/historical-themes.json');
const ids=new Set(graph.nodes.map(n=>n.id));assert.equal(ids.size,graph.nodes.length);
for(const n of graph.nodes){assert(n.label.de&&n.label.en);if(n.type==='book')assert(n.url.de&&n.author&&['de','en'].includes(n.language));for(const url of Object.values(n.url||{}))assert(/^https:\/\/aeternus(?:-verlag\.de|publishing\.com)\//.test(url));}
for(const l of graph.links){assert(ids.has(l.source)&&ids.has(l.target));assert.notEqual(l.source,l.target);}
for(const b of catalogue.books){const n=graph.nodes.find(n=>n.id==='book:de:'+b.id);assert(n,'Graph missing current DE book '+b.id);assert.equal(n.label.de,b.title);}
if(fs.existsSync(path.join(__dirname,'../catalog/index.cjs')))for(const b of require('../catalog/index.cjs').englishBooks)assert(ids.has('book:'+b.id),'Graph missing EN book '+b.id);
for(const t of history.themes){assert(ids.has('theme:'+t.id));for(const lang of ['de','en'])for(const id of t.bookRefs[lang])assert(graph.links.some(l=>l.source==='theme:'+t.id&&l.target===(lang==='de'?'book:de:':'book:')+id&&l.type==='context'));}
assert(graph.links.filter(l=>l.type==='curated').length>=require('../src/_data/kosmos').links.length,'Existing editorial relations must be preserved');
const hall='book:en-james-hall-the-harpe-s-head-illustrated';
assert(graph.links.filter(l=>l.type==='curated'&&(l.source===hall||l.target===hall)).length>=2,'English Hall must retain editorial book connections');
new Function(fs.readFileSync(path.join(__dirname,'../src/assets/js/library-network.js'),'utf8'));
console.log(JSON.stringify({status:'PASS',books:graph.nodes.filter(n=>n.type==='book').length,themes:history.themes.length,links:graph.links.length}));
const atlasNodes=require('../src/_data/kosmos').nodes;
for(const old of atlasNodes){const mapped=graph.nodes.filter(n=>n.geography?.source==='kosmosSelection:'+old.id);assert(mapped.length,'Lost atlas placement: '+old.id);for(const n of mapped)assert.deepEqual(n.geography.location,old.location);}
for(const n of graph.nodes.filter(n=>n.geography)){assert.equal(n.type,'book');assert(n.geography.location.length===2&&Math.abs(n.geography.location[0])<=180&&Math.abs(n.geography.location[1])<=90);}
const atlasTemplate=fs.readFileSync(path.join(__dirname,fs.existsSync(path.join(__dirname,'../international/_includes/library-network.njk'))?'../international/_includes/library-network.njk':'../src/_includes/library-network.njk'),'utf8');
assert(atlasTemplate.includes('topojson-client-3.1.0.min.js'));
assert(atlasTemplate.includes('library-map')&&atlasTemplate.includes('library-themes'));
console.log('Recovered atlas coverage: '+atlasNodes.length+' original placements preserved.');

