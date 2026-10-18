// Central collection registry. Membership is by catalogue ID, never title matching.
// A private editorial-review bucket keeps every existing edition classified until
// its series-specific collection has been checked by the publisher.
const green = 'gruen';
const greenBase = '/collections/green-series/';
const definitions = [
  {
    series: green, id: 'british-empire', title: 'British Empire Collection', public: true,
    url: `${greenBase}british-empire/`,
    intro: 'First-hand accounts of British campaigns, command and the people caught in the reach of empire.',
    bookIds: [
      'en-charles-edward-callwell-the-life-of-sir-stanley-maude',
      'en-william-robertson-from-private-to-field-marshal',
      'en-george-robert-gleig-sales-brigade-in-afghanistan-illustrated',
      'en-charles-vere-ferrers-townshend-my-campaign-in-mesopotamia-annotated',
      'en-george-arthur-life-of-lord-kitchener-volume-i',
      'en-george-arthur-life-of-lord-kitchener-volume-ii',
      'en-george-arthur-life-of-lord-kitchener-volume-iii',
      'en-henry-doveton-hutchinson-the-campaign-in-tirah',
      'en-joshua-duke-recollections-of-the-kabul-campaign-1879-1880',
      'en-joshua-duke-recollections-of-the-kabul-campaign-1879-1880-modern-english-edition',
      'en-charles-william-wilson-from-korti-to-khartum-illustrated'
    ],
    germanBookIds: ['tagebuch-der-katastrophe', 'der-sturz-prempehs', 'geschichte-der-feldzuege-von-1780-und-1781']
  },
  {
    series: green, id: 'american-military-history', title: 'American Military History', public: true,
    url: `${greenBase}american-military-history/`,
    intro: 'American military accounts presented in the context of their campaigns and editions.',
    bookIds: ['en-theodore-roosevelt-the-rough-riders-annotated']
  },
  {
    series: green, id: 'american-frontier-rangers', title: 'American Frontier & Rangers', public: true,
    url: `${greenBase}american-frontier-rangers/`,
    intro: 'Accounts of frontier life and the Rangers, with publication status stated for each edition.',
    bookIds: [
      'en-napoleon-augustus-jennings-a-texas-ranger-annotated',
      'en-james-b-gillett-six-years-with-the-texas-rangers-illustrated'
    ]
  },
  {
    series: green, id: 'european-military-history', title: 'European Military History', public: false,
    url: `${greenBase}european-military-history/`, bookIds: []
  },
  {
    series: green, id: 'exploration-frontier-worlds', title: 'Exploration & Frontier Worlds', public: true,
    url: `${greenBase}exploration-frontier-worlds/`,
    intro: 'Expedition and frontier narratives already present in the Green Series, distinct from its military collections.',
    bookIds: [
      'en-francis-younghusband-the-epic-of-mount-everest-illustrated',
      'en-grey-owl-the-men-of-the-last-frontier'
    ]
  }
];
const seriesIds = ['anthrazit', green, 'rot', 'blau', 'bernstein', 'weiss', 'purpur'];
for (const id of seriesIds.filter(id => id !== green)) {
  definitions.push({ series: id, id: 'editorial-review', title: 'Editorial review', public: false,
    url: `/collections/${id}/editorial-review/`, bookIds: [] });
}

function bind(englishBooks, germanBooks, series) {
  const englishById = new Map(englishBooks.map(book => [book.id, book]));
  const germanById = new Map(germanBooks.map(book => [book.id, book]));
  const assigned = new Set();
  const collections = definitions.map(definition => {
    if (!seriesIds.includes(definition.series)) throw new Error(`Unknown collection series: ${definition.series}`);
    const books = definition.bookIds.map(id => {
      const book = englishById.get(id);
      if (!book || book.series !== definition.series || assigned.has(id)) throw new Error(`Invalid collection membership: ${id}`);
      assigned.add(id);
      return book;
    });
    const publishedGerman = (definition.germanBookIds || []).map(id => {
      const book = germanById.get(id);
      if (!book || book.series !== definition.series || book.pending) throw new Error(`German collection edition is not published: ${id}`);
      return { id, title: book.title, author: book.author, language: 'German',
        url: `https://aeternus-verlag.de${book.url}`, publicationStatus: 'published' };
    });
    if (definition.public && !books.length && !publishedGerman.length) throw new Error(`Empty public collection: ${definition.id}`);
    return { ...definition, books, publishedGerman,
      publishedBooks: books.filter(book => book.availability === 'AVAILABLE'),
      forthcomingBooks: books.filter(book => book.availability !== 'AVAILABLE') };
  });
  for (const book of englishBooks) {
    const collection = collections.find(item => item.books.includes(book)) ||
      collections.find(item => item.series === book.series && item.id === 'editorial-review');
    if (!collection) throw new Error(`No collection for ${book.id}`);
    if (book.series === green && collection.id === 'editorial-review') throw new Error(`Unclassified Green Series book: ${book.id}`);
    Object.assign(book, {
      primaryEditionLine: book.series,
      primaryCollection: collection.id,
      collectionTitle: collection.title,
      collectionUrl: collection.public ? collection.url : null,
      topics: Array.isArray(book.topics) ? book.topics : [],
      workGroupId: book.workGroupId || null,
      publicationStatus: book.availability === 'AVAILABLE' ? 'published' : 'forthcoming'
    });
  }
  const bySeries = Object.fromEntries(seriesIds.map(id => [id, {
    series: series.find(item => item.id === id),
    collections: collections.filter(item => item.series === id),
    publicCollections: collections.filter(item => item.series === id && item.public)
  }]));
  return { collections, bySeries, green: bySeries[green] };
}

module.exports = { definitions, bind };
