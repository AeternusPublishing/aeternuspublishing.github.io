const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const kosmos = require('../src/_data/kosmos');
const root = path.resolve('public');
const read = route => fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');
const html = read('/kosmos/');
const payload = JSON.parse(html.match(/<script type="application\/json" id="kosmos-data">([^]*?)<\/script>/)[1]);
assert.equal(payload.nodes.length, kosmos.count);
assert.equal(new Set(payload.nodes.map(n => n.id)).size, payload.nodes.length);
assert(read('/').includes('href="/kosmos/"'), 'Homepage must link to atlas');
assert(read('/en/').includes('href="/kosmos/"'), 'English homepage must link to atlas');
assert(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('https://aeternus-verlag.de/kosmos/'));
assert(html.includes('rel="canonical" href="https://aeternus-verlag.de/kosmos/"'));
assert(!html.includes('src="https://cdn.'), 'Runtime assets must be self-hosted');
assert(html.includes('<noscript>'), 'Catalogue fallback must be available without JavaScript');
for (const node of payload.nodes) {
  assert(node.title && node.author && node.summary && node.place);
  assert(node.location.length === 2 && Math.abs(node.location[0])<=180 && Math.abs(node.location[1])<=90);
  assert(fs.existsSync(path.join(root,node.coverImageUrl)), 'Missing cover: '+node.title);
  const url = new URL(node.landingUrl,'https://aeternus-verlag.de');
  const destination = read(url.pathname);
  if (url.hash) assert(destination.includes('id="'+url.hash.slice(1)+'"'), 'Missing landing fragment: '+node.title);
  if (node.status === 'In Vorbereitung') assert(!node.amazonUrl, 'Pending title cannot have a buy link');
}
for (const file of ['assets/vendor/d3-7.9.0.min.js','assets/vendor/topojson-client-3.1.0.min.js','assets/js/kosmos.js','assets/css/kosmos.css','assets/data/land-110m.json']) assert(fs.existsSync(path.join(root,file)), 'Missing runtime asset: '+file);
assert(JSON.parse(fs.readFileSync(path.join(root,'assets/data/land-110m.json'))).objects.land);
new Function(fs.readFileSync('src/assets/js/kosmos.js','utf8'));
console.log(JSON.stringify({status:'PASS',books:payload.nodes.length,connections:payload.links.length,landingPagesChecked:payload.nodes.length,selfHostedAssets:true},null,2));
