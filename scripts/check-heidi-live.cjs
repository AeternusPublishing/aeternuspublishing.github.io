const assert=require('node:assert/strict');
const fs=require('node:fs');
const book=require('../src/_data/catalogue').books.find(b=>b.id==='heidi');
const author=require('../src/_data/authorsDe').find(a=>a.slug==='johanna-spyri');
assert.equal(book.pending,false);
assert.equal(book.amazon,'https://www.amazon.de/dp/3676050363');
assert.equal(author.preview,false);
assert.deepEqual(book.formats.map(f=>[f.name,f.url,f.price]),[
  ['E-Book','https://www.amazon.de/dp/B0HJTRVJ17','9,99 €'],
  ['Taschenbuch','https://www.amazon.de/dp/3676050363','16,99 €'],
  ['Hardcover','https://www.amazon.de/dp/3676050371','24,98 €']
]);
const html=fs.readFileSync('public/buecher/heidi/index.html','utf8');
const landing=fs.readFileSync('public/autoren/johanna-spyri/index.html','utf8');
assert(!html.split('id="ausgabe"')[0].includes('Demnächst erhältlich'));
for(const f of book.formats)assert(html.includes('href="'+f.url+'"'));
assert(!/Bei KDP eingereicht|Bestelllinks folgen|KDP-Einreichung wird vorbereitet|class="preview-banner"/.test(landing));
assert(landing.includes('href="/buecher/heidi/"'));
console.log('PASS: Heidi live status, three verified purchase links, prices and Spyri landing');
