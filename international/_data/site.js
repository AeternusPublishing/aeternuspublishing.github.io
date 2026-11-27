const catalog = require('../../catalog/index.cjs');
module.exports = {
  name: 'AETERNUS PUBLISHING', origin: 'https://aeternuspublishing.com',
  preview: process.env.AETERNUS_SITE_MODE !== 'production', language: 'en', email: 'kontakt@aeternus-verlag.de',
  social: require('../../catalog/social.json'),
  series: catalog.series, collections: catalog.collectionArchitecture.bySeries,
  greenSeries: catalog.collectionArchitecture.green,
  collectionLanding: catalog.collectionArchitecture.landingSeries,
  collectionLines: catalog.collectionArchitecture.lines.filter(line => line.collections.length),
  collectionPages: catalog.collectionArchitecture.collections.filter(c => c.public),
  collectionThemes: catalog.collectionArchitecture.themes,
  collectionRedirects: Object.entries(catalog.collectionArchitecture.redirects).map(([from, to]) => ({ from, to })), books: catalog.englishBooks, authors: catalog.authorsEn,
  nav: [ ['Books', '/books/'], ['Book Universe', '/book-universe/'], ['Series', '/series/'], ['Authors', '/authors/'], ['Why AETERNUS?', '/why-aeternus/'], ['Shop', '/shop/'] ],
  footer: [ ['About the House', '/about/'], ['Editorial Method', '/editorial-method/'], ['Reading Room', '/reading-room/'], ['Press / Booksellers', '/press/'], ['Contact', '/contact/'], ['Legal', '/legal/'], ['Privacy', '/privacy/'] ]
};
