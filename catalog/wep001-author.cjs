const world = require('../editorial/author-worlds/authors/parry.json');

module.exports = {
  slug: world.slug,
  name: world.name,
  dates: world.dates,
  eyebrow: 'AETERNUS',
  tagline: world.locales.en.tagline,
  intro: world.locales.en.intro,
  metaDescription: world.locales.en.description,
  portrait: { modern: false },
  brandOnly: true,
  books: [],
  editionStatus: world.editionStatus,
  editorialDraft: false,
  preparationNote: world.locales.en.bridge
};
