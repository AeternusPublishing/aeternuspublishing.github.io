// Finite audit evidence, derived from the house register and direct retailer observations.
// This verifies website identities; it does not allocate ISBNs or release books.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Parser } = require('htmlparser2');
const evidence = require('../docs/evidence/BOOK_EDITION_IDENTITIES_20261020.json');
const models = {
  de: require('../src/_data/catalogue').books,
  en: require('../catalog/index.cjs').englishBooks,
};
const normal = value => String(value || '').replace(/[^0-9X]/g, '');
const token = value => {
  const url = new URL(value);
  assert(/^www\.amazon\.(?:de|com|co\.uk|com\.au|ca)$/.test(url.hostname), 'Unexpected retailer host: ' + value);
  const id = url.pathname.match(/^\/(?:dp|gp\/product)\/([A-Z0-9]+)(?:\/|$)/)?.[1];
  assert(id, 'Expected a specific edition, not a general search: ' + value);
  return id;
};
const isbnValid = value => {
  const n = normal(value);
  return /^97[89]\d{10}$/.test(n) && [...n].reduce((s, c, i) => s + Number(c) * (i % 2 ? 3 : 1), 0) % 10 === 0;
};
const formats = book => book.retailer_formats || book.formats;
const label = format => format.label || format.name;
const links = format => format.links || (format.url ? [{ url: format.url }] : []);
const front = (site, book) => site === 'de' ? '/assets/images/' + book.cover + '-fallback.jpg' : book.cover;
function validateBook(site, book, expected) {
  assert.equal(book.language, expected.language, book.id + ': edition language');
  assert.equal(book.url, expected.url, book.id + ': edition route');
  assert.equal(front(site, book), expected.front_url, book.id + ': wrong front cover');
  const actualAssets = site === 'de' ? ['.webp', '-fallback.jpg'].map(ext => 'src/assets/images/' + book.cover + ext) :
    [...new Set(['cover', 'coverWebp', 'backcover', 'backcoverWebp'].filter(k => book[k]).map(k => 'src' + book[k]))];
  assert.deepEqual(actualAssets.sort(), expected.assets.map(a => a.path).sort(), book.id + ': wrong front/back cover variant');
  assert.equal(formats(book).length, expected.formats.length, book.id + ': unverified product form');
  for (const f of formats(book)) {
    const bound = expected.formats.find(e => e.label === label(f));
    assert(bound, book.id + ': unknown format ' + label(f));
    assert.equal(normal(f.isbn) || null, bound.isbn13, book.id + ': ISBN assigned to another edition or form');
    if (f.isbn) assert(isbnValid(f.isbn), book.id + ': invalid ISBN checksum');
    const allowed = new Set(bound.tokens);
    for (const link of links(f)) assert(allowed.has(token(link.url)), book.id + ': buying link belongs to another edition or form');
    assert.equal(links(f).length > 0, bound.tokens.length > 0, book.id + ': buying links added or lost without verification');
    for (const proof of bound.register_evidence) {
      assert.equal(proof.sprache, expected.language, book.id + ': register language');
      assert.equal(proof.produktform, bound.productform, book.id + ': register product form');
      if (bound.isbn13) assert.equal(normal(proof.isbn13), bound.isbn13, book.id + ': register ISBN');
    }
    for (const id of bound.tokens) {
      const registered = bound.register_evidence.some(p => p.asin === id || (bound.isbn13 && p.isbn10 === id));
      if (registered) continue;
      const observed = evidence.amazon_observations[id];
      assert(observed, book.id + ': unverified retailer identifier');
      assert.equal(observed.language, expected.language, book.id + ': retailer language');
      assert.equal(observed.productform, bound.productform, book.id + ': retailer product form');
      if (bound.isbn13) assert.equal(observed.isbn13, bound.isbn13, book.id + ': retailer ISBN');
    }
  }
  if (site === 'en') for (const [form, isbn] of Object.entries(book.isbn)) {
    if (isbn) assert(expected.formats.some(f => f.isbn13 === normal(isbn) && f.productform === (form === 'paperback' ? 'taschenbuch' : form)), book.id + ': alternate template ISBN belongs to another edition');
  }
  if (site === 'de') {
    assert.equal(normal(book.isbn), expected.primary_isbn13, book.id + ': primary ISBN');
    if (book.amazon) {
      const primary = expected.formats.find(f => f.isbn13 === expected.primary_isbn13);
      assert(primary?.tokens.includes(token(book.amazon)), book.id + ': main buying link disagrees with primary ISBN');
      assert(book.amazonLabel.startsWith(primary.label + ' '), book.id + ': buying button must name its product form');
    }
  }
}
const textAndLinks = html => {
  let ignored = 0;
  const text = [], urls = [];
  const parser = new Parser({
    onopentag(tag, attrs) {
      if (tag === 'script' || tag === 'style') ignored++;
      if (tag === 'a' && /^https:\/\/www\.amazon\./.test(attrs.href || '')) urls.push(attrs.href);
    },
    onclosetag(tag) { if (tag === 'script' || tag === 'style') ignored--; },
    ontext(value) { if (!ignored) text.push(value); },
  }, { decodeEntities: true });
  parser.end(html);
  return { text: text.join(' '), urls };
};
function validateRendered(site, route, boundPages) {
  const root = site === 'de' ? 'public' : 'dist/release';
  const html = fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');
  const { text, urls } = textAndLinks(html);
  const allowedIsbns = new Set(boundPages.flatMap(p => p.formats.map(f => f.isbn13)).filter(Boolean));
  const allowedTokens = new Set(boundPages.flatMap(p => p.formats.flatMap(f => f.tokens)));
  for (const n of text.match(/(?<!\d)97[89](?:[- ]?\d){10}(?!\d)/g) || []) assert(allowedIsbns.has(normal(n)), route + ': foreign ISBN in rendered text');
  for (const url of urls) assert(allowedTokens.has(token(url)), route + ': foreign buying link in rendered HTML');
  const art = html.match(/<(?:div|figure) class="detail-art">([\s\S]*?)<\/(?:div|figure)>/);
  if (art && boundPages.length === 1) {
    const expected = boundPages[0];
    assert(art[1].includes('src="' + expected.front_url + '"'), route + ': wrong rendered front cover');
    const stem = path.basename(expected.front_url).replace(/(?:-fallback)?\.[^.]+$/, '');
    for (const srcset of art[1].matchAll(/srcset="([^"]+)"/g)) assert(srcset[1].includes('/' + stem), route + ': wrong responsive cover');
  }
}
let rendered = 0, assetCount = 0;
for (const site of ['de', 'en']) {
  const bound = evidence.pages.filter(p => p.site === site);
  assert.deepEqual(models[site].map(b => b.id).sort(), bound.map(b => b.id).sort(), 'New book needs independent edition verification');
  for (const book of models[site]) {
    const expected = bound.find(p => p.id === book.id);
    validateBook(site, book, expected);
    for (const asset of expected.assets) {
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(asset.path)).digest('hex'), asset.sha256, book.id + ': cover bytes differ from reviewed asset');
      assetCount++;
    }
    if (site === 'de' || process.argv.includes('--international')) { validateRendered(site, book.url, [expected]); rendered++; }
  }
}
for (const extra of evidence.additional_pages) {
  if (extra.site === 'en' && !process.argv.includes('--international')) continue;
  validateRendered(extra.site, extra.url, evidence.pages.filter(p => p.site === extra.site && extra.book_ids.includes(p.id)));
  rendered++;
}
// Observed bad input plus deliberate cross-language/ISBN/cover swaps must fail.
const monarch = models.de.find(b => b.id === 'monarch');
const monarchProof = evidence.pages.find(p => p.site === 'de' && p.id === monarch.id);
const paperbackMain = { ...monarch, amazon: 'https://www.amazon.de/dp/391288336X' };
assert.throws(() => validateBook('de', paperbackMain, monarchProof), /main buying link/);
const wrongCover = { ...monarch, cover: 'cover-ets007-en-20260923' };
assert.throws(() => validateBook('de', wrongCover, monarchProof), /wrong front cover/);
const wrongIsbn = structuredClone(monarch);
wrongIsbn.formats[0].isbn = '978-3-912883-75-6';
assert.throws(() => validateBook('de', wrongIsbn, monarchProof), /ISBN assigned/);
const wrongLink = structuredClone(monarch);
wrongLink.formats[0].url = 'https://www.amazon.com/dp/B0HKNBL4CV';
assert.throws(() => validateBook('de', wrongLink, monarchProof), /buying link belongs/);
console.log(JSON.stringify({ status: 'PASS', books: evidence.pages.length, formats: evidence.pages.reduce((n, b) => n + b.formats.length, 0), reviewedAssets: assetCount, renderedPages: rendered, negativeCases: 4 }));
