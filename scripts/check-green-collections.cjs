// Series > line > subseries model (REIHENVERZEICHNIS, 27.11.2026): every series with public
// collections has a landing page, the Green landing shows both lines, every public collection
// has its own page, appears in the sitemap and is linked from its series landing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../catalog/index.cjs');
const root = path.resolve(__dirname, '..');
const output = path.join(root, process.env.AETERNUS_SITE_MODE === 'production' ? 'dist/release' : 'dist/international');
const html = relative => fs.readFileSync(path.join(output, relative), 'utf8');
const exists = url => fs.existsSync(path.join(output, url.slice(1), 'index.html'));
const escaped = value => value.replaceAll('&', '&amp;');
const architecture = catalog.collectionArchitecture;
const green = architecture.green;
const overview = html('collections/green-series/index.html');
const sitemap = html('sitemap.xml');
const greenSeriesPage = html('series/gruen/index.html');

assert.equal(catalog.series.length, 7);
assert.equal(green.series.name.en, 'GREEN');
assert.equal(green.series.label.en, 'Military, Expeditions, and Frontier Regions');
assert.deepEqual(green.lines.map(line => line.title), ['To Command and to Conquer', 'The North American Theatre']);
assert.deepEqual(green.lines[0].collections.map(c => c.nr + ' ' + c.title), [
  'I Geostrategic Works', 'II Indian Operations', 'III Imperial Campaigns', 'IV The Polar World', 'V The Dominions', 'VI Imperial Expeditions'
]);
assert(greenSeriesPage.includes('Explore the Collections'));
for (const line of green.lines) {
  assert(exists(line.url) && sitemap.includes(line.url), `${line.id} line page`);
  assert(overview.includes(`href="${line.url}"`) && overview.includes(escaped(line.title)), `${line.id} on Green landing`);
}
for (const book of catalog.englishBooks) {
  assert.equal(book.primaryEditionLine, book.series, book.id);
  assert(book.primaryCollection && Array.isArray(book.topics) && book.publicationStatus, book.id);
  assert.equal(book.publicationStatus, book.availability === 'AVAILABLE' ? 'published' : 'forthcoming', book.id);
  assert(architecture.bySeries[book.series].collections.some(c => c.id === book.primaryCollection), book.id);
}
const expected = {
  'en-george-robert-gleig-sales-brigade-in-afghanistan-illustrated': 'indian-operations',
  'en-charles-vere-ferrers-townshend-my-campaign-in-mesopotamia-annotated': 'imperial-campaigns',
  'en-samuel-benfield-steele-forty-years-in-canada': 'the-dominions',
  'en-theodore-roosevelt-the-rough-riders-annotated': 'wars-for-the-continent',
  'en-napoleon-augustus-jennings-a-texas-ranger-annotated': 'frontier-and-rangers',
  'en-francis-younghusband-the-epic-of-mount-everest-illustrated': 'imperial-expeditions',
  'en-grey-owl-the-men-of-the-last-frontier': 'woodcraft-and-wilderness'
};
for (const [id, collection] of Object.entries(expected)) {
  assert.equal(catalog.englishBooks.find(book => book.id === id).primaryCollection, collection, id);
}
for (const collection of architecture.collections) {
  assert.equal(exists(collection.url), collection.public, `${collection.id} public route`);
  assert.equal(sitemap.includes(collection.url), collection.public, `${collection.id} sitemap`);
  if (!collection.public) continue;
  assert(collection.books.length || collection.inPreparation, collection.id);
  assert(collection.books.every(book => book.language === 'en'), `${collection.id}: English collection contains another edition language`);
  const landing = html(`${collection.seriesUrl.slice(1)}index.html`);
  assert(landing.includes(`href="${collection.url}"`) && landing.includes(escaped(collection.title)), `${collection.id} on series landing`);
  const page = html(`${collection.url.slice(1)}index.html`);
  for (const book of collection.books) {
    assert(page.includes(book.url), book.id);
    if (book.primaryCollection === collection.id) assert(html(`${book.url.slice(1)}index.html`).includes(collection.url), book.id);
  }
  for (const book of collection.publishedGerman || []) {
    assert(!landing.includes(book.url) && !page.includes(book.url), `${book.id}: German edition leaked into English collections`);
  }
  assert(!page.includes('German-language edition'), `${collection.id}: English collections advertise German editions`);
}
for (const [from, to] of Object.entries(architecture.redirects)) {
  assert(html(`${from.slice(1)}index.html`).includes(`url=${to}`), from);
  assert(exists(to), to);
  assert(!sitemap.includes(from), `${from} redirect in sitemap`);
}
for (const theme of architecture.themes) assert(exists(theme.url) && sitemap.includes(theme.url), theme.id);
console.log('PASS series landings, lines, subseries, redirects and publication gates');
