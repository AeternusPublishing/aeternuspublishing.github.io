// R9-05: QR author pages only. No product, ISBN, price, image or buying link.
const world = require('../editorial/author-worlds/authors/charles-dickens.json');
function author(lang) {
  const text = world.locales[lang];
  return {slug: world.slug, name: 'Charles Dickens', dates: world.dates,
    eyebrow: lang === 'de' ? 'ANTHRAZIT · AETERNUS' : 'ANTHRACITE SERIES · AETERNUS',
    tagline: text.tagline, intro: text.intro, metaDescription: text.description,
    portrait: {modern: false}, brandOnly: true, books: [],
    editionStatus: 'IN_PREPARATION', preview: false,
    schema: {birthDate: '1812-02-07', deathDate: '1870-06-09', description: text.description},
  };
}
const de = author('de');
const book = require('./cd001-de-20261113.json');
de.books.push({
  id: book.id, title: book.title, subtitle: book.subtitle, url: book.url,
  cover: {img: book.cover}, meta: 'Deutsche Ausgabe · Anthrazit',
  status: book.status, modal: {summary: book.summary, metadata: book.metadata},
  formats: book.formats.map(format => ({...format, links: []})),
});
module.exports = {de, en: author('en')};
