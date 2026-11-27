const { definitions } = require('../../catalog/collections.cjs');
const catalogue = require('./catalogue');
const english = require('../../catalog/collection-editions-en.json');
const scott = require('../../catalog/ws001-en.cjs');
const labels = {
  'geostrategic-works': ['Geostrategische Werke', 'To Command and to Conquer · I. Das strategische Denken des Empire: die Verteidigung Indiens, Persien und Zentralasien.'],
  'indian-operations': ['Indische Operationen', 'To Command and to Conquer · II. Feldzüge der Armee in Indien, vom Rückzug aus Kabul bis Chitral und Tirah.'],
  'imperial-campaigns': ['Feldzüge des Empire', 'To Command and to Conquer · III. Expeditionskriege jenseits Indiens, von Afrika bis Mesopotamien und Gallipoli.'],
  'polar-world': ['Die polare Welt', 'To Command and to Conquer · IV. Die Royal Navy in der Arktis und die Suche nach der Nordwestpassage.'],
  'the-dominions': ['Die Dominions', 'To Command and to Conquer · V. Die Dominions des Empire: Kanada und Australien.'],
  'imperial-expeditions': ['Expeditionen des Empire', 'To Command and to Conquer · VI. Expeditionen unter der Flagge des Empire, vom Everest bis Somaliland.'],
  'civil-war': ['Der Bürgerkrieg', 'The North American Theatre · I. Der Amerikanische Bürgerkrieg in den Worten derer, die ihn führten.'],
  'wars-for-the-continent': ['Kriege um den Kontinent', 'The North American Theatre · II. Die Kriege, die den Kontinent entschieden: Unabhängigkeitskrieg, 1812, Mexiko, Kuba.'],
  'frontier-and-rangers': ['Grenze und Ranger', 'The North American Theatre · III. Leben und Dienst an der texanischen Grenze.'],
  'editorial-review': ['Redaktionelle Zuordnung', ''],
  'european-military-history': ['Europäische Militärgeschichte', '']
};
// Snapshot ids from before the line structure of 27.11.2026.
const formerIds = { 'british-empire': null, 'american-military-history': 'wars-for-the-continent',
  'american-frontier-rangers': 'frontier-and-rangers', 'exploration-frontier-worlds': null, 'north-american-theatre': 'wars-for-the-continent' };
const englishMembership = id => definitions.find(d => d.series === 'gruen' && (d.bookIds || []).includes(id));
const views = definitions.filter(c => c.series === 'gruen').map(c => {
  const germanIds = [...(c.germanBookIds || []), ...(c.id === 'wars-for-the-continent' ? ['die-rough-riders'] : [])];
  const books = germanIds.map(id => {
    const b = catalogue.books.find(book => book.id === id);
    if (!b || b.series !== c.series) throw new Error(`Invalid German collection member: ${id}`);
    return { id: b.id, title: b.title, author: b.author, url: b.url, language: 'de', publicationStatus: b.pending ? 'forthcoming' : 'published' };
  });
  for (const b of english.books.filter(b => (englishMembership(b.id)?.id || formerIds[b.collection]) === c.id)) books.push({ ...b, language: 'en' });
  if (c.id === 'wars-for-the-continent') {
    for (const book of scott.books) books.push({ id: book.id, title: book.title + ' · ' + book.subtitle,
      author: book.authorName, url: 'https://aeternuspublishing.com' + book.url, language: 'en', publicationStatus: 'forthcoming' });
  }
  if (!labels[c.id]) throw new Error(`Missing German collection label: ${c.id}`);
  return { id: c.id, series: c.series, title: labels[c.id][0], intro: labels[c.id][1], public: c.public && books.length > 0,
    url: `/sammlungen/gruen/${c.id}/`, englishUrl: `https://aeternuspublishing.com${c.url}`, books,
    published: books.filter(b => b.publicationStatus === 'published'), forthcoming: books.filter(b => b.publicationStatus === 'forthcoming') };
});
const bookAssignments = Object.fromEntries(catalogue.books.map(book => {
  const collection = views.find(c => c.books.some(b => b.language === 'de' && b.id === book.id));
  return [book.id, { primaryEditionLine: book.series, primaryCollection: collection?.id || 'editorial-review',
    topics: [], workGroupId: null, publicationStatus: book.pending ? 'forthcoming' : 'published',
    collectionUrl: collection?.public ? collection.url : null, collectionTitle: collection?.title || null }];
}));
const redirects = [['british-empire', ''], ['american-military-history', 'wars-for-the-continent'],
  ['american-frontier-rangers', 'frontier-and-rangers'], ['exploration-frontier-worlds', 'imperial-expeditions'], ['north-american-theatre', 'wars-for-the-continent']]
  .map(([from, to]) => ({ from: `/sammlungen/gruen/${from}/`, to: to ? `/sammlungen/gruen/${to}/` : '/sammlungen/gruen/' }));
module.exports = { redirects, collections: views, publicCollections: views.filter(c => c.public), bookAssignments,
  bySeries: Object.fromEntries(catalogue.series.map(s => [s.slug, views.filter(c => c.series === s.slug && c.public)])) };
