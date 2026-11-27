const catalog = require('../../catalog/index.cjs');
module.exports = {
  name: 'AETERNUS PUBLISHING', origin: 'https://aeternuspublishing.com',
  preview: process.env.AETERNUS_SITE_MODE !== 'production', language: 'en', email: 'kontakt@aeternus-verlag.de',
  social: require('../../catalog/social.json'),
  // Offline series (REIHENVERZEICHNIS status offline, e.g. weiss 27.11.2026) get no page and no listing; their address redirects.
  series: catalog.series.filter(s => !s.offline), collections: catalog.collectionArchitecture.bySeries,
  greenSeries: catalog.collectionArchitecture.green,
  collectionLanding: catalog.collectionArchitecture.landingSeries,
  collectionLines: catalog.collectionArchitecture.lines.filter(line => line.collections.length),
  collectionPages: catalog.collectionArchitecture.collections.filter(c => c.public),
  collectionThemes: catalog.collectionArchitecture.themes,
  collectionRedirects: [...Object.entries(catalog.collectionArchitecture.redirects).map(([from, to]) => ({ from, to })), ...catalog.series.filter(s => s.offline).map(s => ({ from: '/series/' + s.id + '/', to: '/series/' }))], books: catalog.englishBooks, authors: catalog.authorsEn,
  nav: [ ['Books', '/books/'], ['Book Universe', '/book-universe/'], ['Series', '/series/'], ['Authors', '/authors/'], ['Why AETERNUS?', '/why-aeternus/'], ['Shop', '/shop/'] ],
  footer: [ ['About the House', '/about/'], ['Editorial Method', '/editorial-method/'], ['Reading Room', '/reading-room/'], ['Press / Booksellers', '/press/'], ['Contact', '/contact/'], ['Legal', '/legal/'], ['Privacy', '/privacy/'] ]
};
