// RHK_001: commissioned English author world and print QR target. No ISBN, cover, product, price or purchase route.
// The book card follows only with a catalogue entry for the edition.
const world = require('../editorial/author-worlds/authors/richard-hartley-kennedy.json');
module.exports = {
  slug: world.slug, name: world.name, dates: world.dates,
  eyebrow: 'GREEN SERIES · AETERNUS', tagline: world.locales.en.tagline,
  intro: world.locales.en.intro, metaDescription: world.locales.en.description,
  portrait: {modern: false}, brandOnly: true, books: [],
  editionStatus: world.editionStatus, editorialDraft: false,
  preparationNote: world.locales.en.bridge
};
