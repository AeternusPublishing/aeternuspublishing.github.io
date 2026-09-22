const catalog = require('../../catalog/index.cjs');
module.exports = {
  name: 'AETERNUS PUBLISHING', origin: 'https://aeternuspublishing.com',
  preview: true, language: 'en', email: 'kontakt@aeternus-verlag.de',
  series: catalog.series, books: catalog.englishBooks, authors: catalog.authorsEn,
  nav: [ ['Books', '/books/'], ['Series', '/series/'], ['Authors', '/authors/'], ['About', '/about/'], ['Shop', '/shop/'] ],
  footer: [ ['Editorial Method', '/editorial-method/'], ['Reading Room', '/reading-room/'], ['Press / Booksellers', '/press/'], ['Contact', '/contact/'], ['Legal', '/legal/'], ['Privacy', '/privacy/'] ]
};
