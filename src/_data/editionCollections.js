const { definitions } = require('../../catalog/collections.cjs');
const catalogue = require('./catalogue');
const english = require('../../catalog/collection-editions-en.json');
const labels = {
  'british-empire': ['Britisches Empire', 'Augenzeugenberichte über britische Feldzüge, militärische Führung und die Menschen im Machtbereich des Empire.'],
  'american-military-history': ['Amerikanische Militärgeschichte', 'Militärische Erinnerungen und Berichte aus der Geschichte der Vereinigten Staaten.'],
  'american-frontier-rangers': ['Amerikanischer Grenzraum & Rangers', 'Erinnerungen an das Leben im amerikanischen Grenzraum und den Dienst der Texas Rangers.'],
  'exploration-frontier-worlds': ['Expeditionen & Grenzräume', 'Expeditionsberichte und Erzählungen aus Grenzräumen innerhalb der Grünen Reihe.'],
  'european-military-history': ['Europäische Militärgeschichte', '']
};
const views = definitions.filter(c => c.series === 'gruen').map(c => {
  const germanIds = [...(c.germanBookIds || []), ...(c.id === 'american-military-history' ? ['die-rough-riders'] : [])];
  const books = germanIds.map(id => {
    const b = catalogue.books.find(book => book.id === id);
    if (!b || b.series !== c.series) throw new Error(`Invalid German collection member: ${id}`);
    return { id: b.id, title: b.title, author: b.author, url: b.url, language: 'de', publicationStatus: b.pending ? 'forthcoming' : 'published' };
  });
  for (const b of english.books.filter(b => b.collection === c.id)) books.push({ ...b, language: 'en' });
  if (c.public && !books.length) throw new Error(`Empty public collection: ${c.id}`);
  return { id: c.id, series: c.series, title: labels[c.id][0], intro: labels[c.id][1], public: c.public,
    url: `/sammlungen/gruen/${c.id}/`, englishUrl: `https://aeternuspublishing.com${c.url}`, books,
    published: books.filter(b => b.publicationStatus === 'published'), forthcoming: books.filter(b => b.publicationStatus === 'forthcoming') };
});
const bookAssignments = Object.fromEntries(catalogue.books.map(book => {
  const collection = views.find(c => c.books.some(b => b.language === 'de' && b.id === book.id));
  return [book.id, { primaryEditionLine: book.series, primaryCollection: collection?.id || 'editorial-review',
    topics: [], workGroupId: null, publicationStatus: book.pending ? 'forthcoming' : 'published',
    collectionUrl: collection?.public ? collection.url : null, collectionTitle: collection?.title || null }];
}));
module.exports = { collections: views, publicCollections: views.filter(c => c.public), bookAssignments,
  bySeries: Object.fromEntries(catalogue.series.map(s => [s.slug, views.filter(c => c.series === s.slug && c.public)])) };
