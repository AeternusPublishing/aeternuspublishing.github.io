// JC_005: commissioned English author world and print QR target (decision_jc005_bilder_deckel_autorenseite_claude_20261122).
// No ISBN, cover, product, price or purchase route; the book card follows only with a catalogue entry for the edition.
const world = require('../editorial/author-worlds/authors/john-conolly.json');
module.exports = {
  slug: world.slug, name: world.name, dates: world.dates,
  eyebrow: 'ANTHRACITE SERIES · AETERNUS', tagline: world.locales.en.tagline,
  intro: world.locales.en.intro, metaDescription: world.locales.en.description,
  portrait: {modern: false}, brandOnly: true, books: [],
  editionStatus: world.editionStatus, editorialDraft: false,
  preparationNote: world.locales.en.bridge
};
