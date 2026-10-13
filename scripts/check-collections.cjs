const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = require('../src/_data/editionCollections');
const root = path.resolve(__dirname, '../public');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const overview = fs.readFileSync(path.join(root, 'sammlungen/gruen/index.html'), 'utf8');
assert.equal(data.publicCollections.length, 4);
for (const c of data.collections) {
  const file = path.join(root, c.url.slice(1), 'index.html');
  assert.equal(fs.existsSync(file), c.public, c.id);
  assert.equal(sitemap.includes(c.url), c.public, c.id);
  assert.equal(overview.includes(c.url), c.public, c.id);
  if (!c.public) continue;
  assert(c.books.length, c.id);
  const html = fs.readFileSync(file, 'utf8');
  for (const b of c.books) {
    assert(html.includes(b.url), b.id);
    if (b.language === 'de') assert(fs.existsSync(path.join(root, b.url.slice(1), 'index.html')), b.id);
    assert(['published', 'forthcoming'].includes(b.publicationStatus), b.id);
  }
}
for (const [id, assignment] of Object.entries(data.bookAssignments)) {
  assert(assignment.primaryEditionLine && assignment.primaryCollection && Array.isArray(assignment.topics), id);
}
console.log('PASS collection membership, language/status, links and private-route gate');
