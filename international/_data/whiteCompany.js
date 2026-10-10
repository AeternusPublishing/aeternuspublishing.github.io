const catalog = require('../../catalog/index.cjs');

module.exports = {
  volumes: catalog.englishBooks.filter(book => book.original_title === 'The White Company'),
  instagramUrl: 'https://www.instagram.com/aeternus.publishing/p/DeUIRIxiHlj/'
};
