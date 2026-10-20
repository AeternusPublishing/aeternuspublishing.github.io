const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const authors = require('../src/_data/authorsDe');
const specials = Object.values(require('../src/_data/authorSpecials.json'));
const catalogue = require('../src/_data/catalogue');
const english = require('../catalog/index.cjs').englishBooks;
const root = path.resolve('public');
const read = route => fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');
const imageKey = url => path.basename(url || '').replace(/(?:-fallback)?\.(?:jpg|webp|avif)$/, '');
const englishCovers = new Set(english.flatMap(b => [b.cover, b.coverWebp]).filter(Boolean).map(imageKey));
const englishIsbns = new Set(english.flatMap(b => Object.values(b.isbn || {})).filter(Boolean).map(s => s.replace(/-/g, '')));
let authorPages = 0;
for (const a of [...authors, ...specials]) {
  const html = read('/autoren/' + a.slug + '/');
  authorPages++;
  const cards = html.match(/<article class="author-book"[\s\S]*?<\/article>/g) || [];
  if (a.editionLanguage === 'en') {
    assert.equal(cards.length, 0, a.slug + ': English editions must link to the English site');
    assert(html.includes('Englischsprachige Ausgaben') && html.includes('href="' + a.sisterUrl + '"'), a.slug + ': missing English referral');
    assert(english.some(b => b.author === a.slug), a.slug + ': English referral needs actual editions');
    continue;
  }
  assert.equal(cards.length, a.books.length, a.slug + ': German editions lost');
  for (const b of a.books) {
    assert(!englishCovers.has(b.cover?.img), a.slug + ': English cover in German author data: ' + b.title);
    assert(!/Englische Originalausgabe|English edition/i.test(b.meta || ''), a.slug + ': English edition in German author data');
    for (const f of b.formats || []) if (f.isbn) assert(!englishIsbns.has(f.isbn.replace(/-/g, '')), a.slug + ': English ISBN in German author data: ' + f.isbn);
  }
}
const haggard = read('/autoren/henry-rider-haggard/');
assert(haggard.includes('König Salomos Schatzkammer') && haggard.includes('/buecher/koenig-salomos-schatzkammer/'));
assert(!haggard.includes('cover-hrh001-en') && !haggard.includes('Englische Originalausgabe'));
assert(haggard.includes('https://aeternuspublishing.com/authors/henry-rider-haggard/'));
for (const b of catalogue.books) {
  const html = read(b.url);
  const knownEnglish = englishCovers.has(b.cover);
  assert.equal(b.language, knownEnglish ? 'en' : 'de', b.id + ': edition language disagrees with English catalogue');
  assert.equal(b.schema.inLanguage, b.language, b.id + ': schema language');
  assert(html.includes('<dt>Sprache</dt><dd>' + b.languageLabel + '</dd>'), b.id + ': visible edition language');
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  assert(schemas.some(s => s['@type'] === 'Book' && s.inLanguage === b.language), b.id + ': rendered schema language');
}
const graph = require('../editorial/library-graph.json');
for (const b of catalogue.books) assert.equal(graph.nodes.find(n => n.id === 'book:de:' + b.id)?.language, b.language, b.id + ': book-universe language');
console.log(JSON.stringify({ status: 'PASS', germanAuthorPages: authorPages, catalogueEditions: catalogue.books.length, englishReferrals: specials.filter(a => a.editionLanguage === 'en').length }));
