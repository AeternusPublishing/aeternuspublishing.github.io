const fs = require('fs');
const assert = require('node:assert/strict');
const path = require('path');
const expected = {
  De: { route: 'autoren', covers: ['cover-waldteufel', 'cover-hawks-de'], asins: ['B0HDRJVR7N','3912883106','B0HHJRK4TL','3912883513','3912883521'], formats: [2,3] },
  En: { route: 'en/authors', covers: ['cover-nick-en', 'cover-hawks-en'], asins: ['B0HFG6QCY5','3912883254','3912883114'], formats: [3,3] }
};
for (const [lang, e] of Object.entries(expected)) {
  const a = require(`../src/_data/authors${lang}.js`).find(x=>x.slug==='robert-montgomery-bird');
  const html = fs.readFileSync(`public/${e.route}/${a.slug}/index.html`,'utf8');
  assert.equal(a.books.length,2);
  assert.deepEqual(a.books.map(b=>b.cover.img), e.covers);
  assert.deepEqual(a.books.map(b=>b.formats.length), e.formats);
  assert(!html.includes('Reading sample') && !html.includes('Leseprobe'), 'Promotional copy must not be labeled an excerpt');
  assert(!html.includes('amazon.com/s?')&&!html.includes('amazon.de/s?'), 'Use edition-specific product links');
  for (const asin of e.asins) assert(html.includes(`/dp/${asin}`), `Missing verified ASIN ${asin}`);
  for (const b of a.books) {
    assert(html.includes(`id="${b.id}"`));
    for (const ext of ['.avif','.webp','-fallback.jpg']) assert(fs.existsSync(path.join('public/assets/images',b.cover.img+ext)));
    for (const f of b.formats) {
      const isbn=f.isbn.replaceAll('-','');
      assert.equal(isbn.length,13);
      assert.equal([...isbn].reduce((s,n,i)=>s+Number(n)*(i%2?3:1),0)%10,0);
      for (const link of f.links) assert(/^https:\/\/www\.amazon\.(com|co\.uk|com\.au|ca|de)\/dp\/[A-Z0-9]{10}$/.test(link.url));
    }
  }
  if (lang==='En') {
    assert(html.includes('Spelling has been lightly modernized'));
    assert(!html.includes('to German readers in a complete new translation'));
    assert.equal(a.books[1].formats.flatMap(f=>f.links).length,0,'Pending release must not imply purchasability');
    assert(!a.books[0].formats[2].links.some(l=>l.url.includes('com.au')));
  }
}
console.log('Bird DE/EN: covers, format counts, ISBN checksums, verified ASIN routes, edition labels and pending-release state PASS');
