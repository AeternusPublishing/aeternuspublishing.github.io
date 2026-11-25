// PP_001: English author world and print QR target (QR on the closing page of A Treatise on Insanity).
// Book identities come only from catalog/pp001-en-20261125.json.
const world = require('../editorial/author-worlds/authors/philippe-pinel.json');
module.exports = {
  slug: world.slug, name: world.name, dates: world.dates,
  eyebrow: 'ANTHRACITE SERIES · AETERNUS', tagline: world.locales.en.tagline,
  intro: world.locales.en.intro, metaDescription: world.locales.en.description,
  portrait: {modern: false}, brandOnly: true, books: [],
  editionStatus: world.editionStatus, editorialDraft: false,
  preparationNote: world.locales.en.bridge
};
