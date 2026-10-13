const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../catalog/index.cjs');
const root = path.resolve(__dirname, '..');
const output = path.join(root, process.env.AETERNUS_SITE_MODE === 'production' ? 'dist/release' : 'dist/international');
const html = relative => fs.readFileSync(path.join(output, relative), 'utf8');
const escaped = value => value.replaceAll('&', '&amp;');
const architecture = catalog.collectionArchitecture;
const green = architecture.green;
const overview = html('collections/green-series/index.html');
const sitemap = html('sitemap.xml');
const greenSeriesPage = html('series/gruen/index.html');

assert.equal(catalog.series.length, 7);
assert.equal(green.series.name.en, 'GREEN');
assert.equal(green.series.label.en, 'Military, Expeditions, and Frontier Regions');
assert.equal(green.publicCollections.length, 4);
assert(overview.includes('Explore the Collections'));
assert(greenSeriesPage.includes('Explore the Collections'));
for (const book of catalog.englishBooks) {
  assert.equal(book.primaryEditionLine, book.series, book.id);
  assert(book.primaryCollection && Array.isArray(book.topics) && book.publicationStatus, book.id);
  assert.equal(book.publicationStatus, book.availability === 'AVAILABLE' ? 'published' : 'forthcoming', book.id);
  assert(architecture.bySeries[book.series].collections.some(c => c.id === book.primaryCollection), book.id);
}
const expected = {
  'en-george-robert-gleig-sales-brigade-in-afghanistan-illustrated': 'british-empire',
  'en-charles-vere-ferrers-townshend-my-campaign-in-mesopotamia-annotated': 'british-empire',
  'en-theodore-roosevelt-the-rough-riders-annotated': 'american-military-history',
  'en-napoleon-augustus-jennings-a-texas-ranger-annotated': 'american-frontier-rangers',
  'en-francis-younghusband-the-epic-of-mount-everest-illustrated': 'exploration-frontier-worlds',
  'en-grey-owl-the-men-of-the-last-frontier': 'exploration-frontier-worlds'
};
for (const [id, collection] of Object.entries(expected)) {
  assert.equal(catalog.englishBooks.find(book => book.id === id).primaryCollection, collection);
}
for (const collection of architecture.collections) {
  const file = path.join(output, collection.url.slice(1), 'index.html');
  assert.equal(fs.existsSync(file), collection.public, `${collection.id} public route`);
  assert.equal(sitemap.includes(collection.url), collection.public, `${collection.id} sitemap`);
  if (collection.series !== 'gruen') assert.equal(collection.public, false);
  if (collection.public) {
    assert(collection.books.length || collection.publishedGerman.length, collection.id);
    assert(overview.includes(escaped(collection.title)) && overview.includes(`href="${collection.url}"`), collection.id);
    const page = html(`${collection.url.slice(1)}index.html`);
    for (const book of collection.books) {
      assert(page.includes(book.url), book.id);
      assert(html(`${book.url.slice(1)}index.html`).includes(collection.url), book.id);
    }
    for (const book of collection.publishedGerman) {
      assert(overview.includes(book.url) && page.includes(book.url), book.id);
    }
    if (!collection.publishedBooks.length && !collection.publishedGerman.length) assert(!page.includes('Published editions.'), collection.id);
  } else {
    assert(!overview.includes(collection.url) && !greenSeriesPage.includes(collection.url), collection.id);
  }
}
console.log('PASS seven-series model, verified membership, collection pages and publication gates');
