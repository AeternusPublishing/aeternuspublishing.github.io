const catalog = require('../../catalog/index.cjs');
module.exports = {
  name: 'AETERNUS PUBLISHING', origin: 'https://aeternuspublishing.com',
  preview: process.env.AETERNUS_SITE_MODE !== 'production', language: 'en', email: 'kontakt@aeternus-verlag.de',
  social: require('../../catalog/social.json'),
  series: catalog.series, books: catalog.englishBooks, authors: catalog.authorsEn,
  nav: [ ['Books', '/books/'], ['Series', '/series/'], ['Authors', '/authors/'], ['Why AETERNUS?', '/why-aeternus/'], ['Shop', '/shop/'] ],
  footer: [ ['About the House', '/about/'], ['Editorial Method', '/editorial-method/'], ['Reading Room', '/reading-room/'], ['Press / Booksellers', '/press/'], ['Contact', '/contact/'], ['Legal', '/legal/'], ['Privacy', '/privacy/'] ]
};
