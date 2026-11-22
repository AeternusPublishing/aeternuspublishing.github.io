// Regressions found in the full English-site audit, 18 November 2026.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Parser } = require('htmlparser2');
const catalogue = require('../catalog/index.cjs');
const worlds = require('../catalog/author-worlds.cjs');
const snapshot = require('../catalog/' + require('../catalog/retail-state.cjs').snapshotFile);
const root = path.resolve('dist/release');
const origin = 'https://aeternuspublishing.com';
const parse = html => {
  const links = [], images = [], ids = new Set();
  const parser = new Parser({ onopentag(tag, attrs) {
    if (attrs.id) ids.add(attrs.id);
    if (tag === 'a' && attrs.name) ids.add(attrs.name);
    if (tag === 'a' && attrs.href) links.push(attrs.href);
    if (tag === 'img' && attrs.src) images.push(attrs.src);
    if (tag === 'source' && attrs.srcset) images.push(...attrs.srcset.split(',').map(s => s.trim().split(/\s+/)[0]));
  } }, { decodeEntities: true });
  parser.end(html);
  return { links, images, ids };
};
const routeFile = route => path.join(root, route, route.endsWith('/') ? 'index.html' : '');
const routes = [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const pages = new Map(routes.map(route => { const html = fs.readFileSync(routeFile(route), 'utf8'); return [route, { html, ...parse(html) }]; }));
const targets = new Set(), assets = new Set();
for (const [route, page] of pages) {
  for (const href of [...page.links, ...page.images]) {
    assert(!/\s\(leaf|source (?:JP2|PNG) SHA-256/.test(href), `${route}: provenance prose used as a hyperlink`);
    if (/^(?:data|mailto|tel|javascript):/.test(href)) continue;
    const url = new URL(href, origin + route);
    if (url.origin !== origin || url.pathname.startsWith('/cdn-cgi/')) continue;
    const target = decodeURIComponent(url.pathname);
    assert(fs.existsSync(routeFile(target)), `${route}: missing internal target ${target}`);
    targets.add(target);
    if (url.hash && pages.has(target)) assert(pages.get(target).ids.has(decodeURIComponent(url.hash.slice(1))), `${route}: missing anchor ${href}`);
  }
  for (const src of page.images) if (src.startsWith('/')) assets.add(src);
}
for (const book of catalogue.englishBooks) {
  assert.equal(book.language, 'en', `${book.id}: edition language`);
  const page = pages.get(book.url);
  assert(page, `${book.id}: book route missing`);
  if (book.cover) assert(page.html.includes(`<meta property="og:image" content="${origin}${book.cover}"`), `${book.id}: stale share cover`);
  if (book.availability === 'AVAILABLE') {
    assert(!book.forthcoming_label, `${book.id}: live edition still announced as forthcoming`);
    assert(!/eProof pending|eProof and retail release are pending/i.test(page.html), `${book.id}: stale eProof announcement`);
  }
  for (const format of book.retailer_formats || []) {
    for (const link of format.links || []) assert(!snapshot.unavailable_asins.some(asin => link.url.includes(asin)), `${book.id}: observed broken retailer link`);
  }
}
const directory = pages.get('/authors/').html;
for (const author of catalogue.authorsEn) {
  const world = worlds.get(author.slug, 'en');
  // The directory may show the 480 px thumbnail rendered from the approved file, never another image.
  const thumb = world.portrait && `/assets/thumbs/${path.basename(world.portrait.file).replace(/\.[^.]+$/, '')}-480.webp`;
  if (world.portrait) assert(directory.includes(`src="${world.portrait.file}"`) || directory.includes(`src="${thumb}"`), `${author.slug}: approved portrait missing in directory`);
}
const library = require('../editorial/library-view.cjs')('en');
assert(library.nodes.filter(n => n.type === 'book').every(n => n.language === 'en'), 'German editions in static English library shelf');
assert.equal(library.nodes.filter(n => n.type === 'book').length, catalogue.englishBooks.length, 'Duplicate legacy copies in English library shelf');
const libraryPayload = JSON.parse(library.payload);
assert.equal(libraryPayload.aliases['book:de:the-white-company-band-i'], 'book:en-arthur-conan-doyle-the-white-company-volume-i', 'Legacy English-edition deep link lost');
assert(!pages.get('/book-universe/').html.includes('>Der Waldteufel</a>'), 'German title in default English shelf');
const scottII = catalogue.englishBooks.find(b => b.id === 'en-winfield-scott-memoirs-volume-ii');
assert.equal(scottII.retailer_formats[0].pages, snapshot.records.find(r => r.isbn13.replace(/-/g, '') === '9783676052467' && r.status === 'LIVE').seitenzahl, 'Scott volumes conflated');
for (const book of catalogue.englishBooks.filter(b => b.publication_date > snapshot.captured_date)) assert.equal(book.availability, 'COMING_SOON', `${book.id}: future release advertised as available now`);
console.log(JSON.stringify({ status: 'PASS', routes: pages.size, internalTargets: targets.size, imageAssets: assets.size, englishBooks: catalogue.englishBooks.length, authors: catalogue.authorsEn.length }));
