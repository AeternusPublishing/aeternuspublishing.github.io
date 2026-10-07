const fs = require('node:fs');
const path = require('node:path');
const catalog = require('./catalog/index.cjs');
module.exports = function(config) {
  config.addPassthroughCopy({ 'src/assets': 'assets' });
  config.addPassthroughCopy({ 'international/assets': 'assets' });
  config.addFilter('plain', catalog.clean);
  config.addFilter('jsonld', value => JSON.stringify(value).replace(/</g, '\\u003c'));
  config.addFilter('shopUrl', catalog.directShopUrl);
  config.addFilter('authorBooks', author => catalog.englishBooks.filter(b => b.author === author));
  config.addFilter('seriesBooks', series => catalog.englishBooks.filter(b => b.series === series));
  config.addFilter('existingImage', filename => filename && fs.existsSync(path.join(__dirname, 'src', filename.replace(/^\//, ''))) ? filename : null);
  config.addFilter('bookSchema', book => ({ '@context': 'https://schema.org', '@type': 'Book', name: book.title, description: book.description.short, inLanguage: book.language, url: 'https://aeternuspublishing.com' + book.url, author: { '@type': 'Person', name: book.authorName }, publisher: { '@type': 'Organization', name: 'AETERNUS PUBLISHING' }, ...(book.cover ? { image: 'https://aeternuspublishing.com' + book.cover } : {}) }));
  config.addFilter('productSchema', book => {
    const url = catalog.directShopUrl(book, 'en');
    return url ? { '@context': 'https://schema.org', '@type': 'Product', name: book.title, sku: book.id, url } : null;
  });
  return { dir: { input: 'international', output: 'dist/international', includes: '_includes' }, templateFormats: ['njk'], htmlTemplateEngine: 'njk' };
};
