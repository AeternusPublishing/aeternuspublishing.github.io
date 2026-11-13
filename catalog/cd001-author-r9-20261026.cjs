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
module.exports = {en: author('en')};
