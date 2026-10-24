// Local editorial preparation only. No ISBN, cover, product, price or purchase route.
const world = require('../editorial/author-worlds/authors/charles-metcalfe-macgregor.json');
module.exports = {
  slug: world.slug, name: world.name, dates: world.dates,
  eyebrow: 'GREEN SERIES · AETERNUS', tagline: world.locales.en.tagline,
  intro: world.locales.en.intro, metaDescription: world.locales.en.description,
  portrait: {modern: false}, brandOnly: true, books: [],
  editionStatus: world.editionStatus, editorialDraft: false,
  preparationNote: world.locales.en.bridge,
  extras: {kicker: 'Historical map', title: 'Original reconnaissance map',
    text: 'Reconnaissance across the Desert of Balochistan, 1877. Open the two overlapping scan sections at full resolution.',
    items: [['Northern half', 'Original full-resolution scan section.', '/assets/maps/cmm002/K01N_SOURCE.png', 'Download the northern half'],
      ['Southern half', 'Original full-resolution scan section.', '/assets/maps/cmm002/K01S_SOURCE.png', 'Download the southern half']]}
};
