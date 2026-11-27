// Central collection registry. Membership is by catalogue ID, never title matching.
// Names and assignment follow the AETERNUS series register (REIHENVERZEICHNIS.json,
// decisions of 27.11.2026). Series > line > subseries; a collection without a line
// sits directly below its series. A private editorial-review bucket keeps every
// remaining edition classified until its collection has been confirmed.
const green = 'gruen';
const seriesSlugs = { gruen: 'green-series', bernstein: 'amber-series', anthrazit: 'anthracite-series', blau: 'blue-series',
  rot: 'red-series', weiss: 'white-series', purpur: 'purple-series' };
const base = id => `/collections/${seriesSlugs[id]}/`;
const empire = 'to-command-and-to-conquer';
const northAmerica = 'north-american-theatre';

const lines = [
  {
    series: green, id: empire, title: 'To Command and to Conquer', kicker: 'The British Empire',
    tagline: 'The British Empire in the words of those who held it.',
    intro: 'Six subseries follow the Empire from the Great Game and the Indian frontier to the campaigns in Africa and the Near East, the polar seas, the Dominions and the great expeditions.',
    url: `${base(green)}${empire}/`
  },
  {
    series: green, id: northAmerica, title: 'The North American Theatre', kicker: 'North America',
    tagline: 'North America in its own right, centred on the Civil War.',
    intro: 'Command and campaign on the North American continent, from the wars that shaped it to the frontier and the Rangers. The Civil War is the heart of this line.',
    url: `${base(green)}${northAmerica}/`
  }
];

const definitions = [
  // Green Series · To Command and to Conquer
  { series: green, line: empire, nr: 'I', id: 'geostrategic-works', title: 'Geostrategic Works', public: true,
    region: 'The Great Game · Persia · Central Asia · the defence of India',
    intro: 'The strategic mind of the Empire: the defence of India, the routes through Persia and Central Asia, and the men who mapped them.',
    bookIds: ['en-charles-metcalfe-macgregor-the-defence-of-india', 'en-charles-metcalfe-macgregor-wanderings-in-balochistan'] },
  { series: green, line: empire, nr: 'II', id: 'indian-operations', title: 'Indian Operations', public: true,
    region: 'Afghanistan · the North-West Frontier · Chitral · Tirah',
    intro: 'Campaigns of the Army in India, from the retreat from Kabul to the relief of Chitral and the Tirah expedition, told by those who served.',
    bookIds: [
      'en-lady-florentia-sale-a-journal-of-the-disasters-in-affghanistan',
      'en-george-robert-gleig-sales-brigade-in-afghanistan-illustrated',
      'en-joshua-duke-recollections-of-the-kabul-campaign-1879-1880',
      'en-joshua-duke-recollections-of-the-kabul-campaign-1879-1880-modern-english-edition',
      'en-frederick-sleigh-roberts-forty-one-years-in-india-volume-i',
      'en-frederick-sleigh-roberts-forty-one-years-in-india-volume-ii',
      'en-charles-metcalfe-macgregor-life-and-opinions-volume-i',
      'en-charles-metcalfe-macgregor-life-and-opinions-volume-ii',
      'en-younghusband-the-relief-of-chitral',
      'en-henry-doveton-hutchinson-the-campaign-in-tirah'
    ],
    germanBookIds: ['tagebuch-der-katastrophe'] },
  { series: green, line: empire, nr: 'III', id: 'imperial-campaigns', title: 'Imperial Campaigns', public: true,
    region: 'Ashanti · Matabeleland · the Sudan · Mesopotamia · Gallipoli',
    intro: 'Expeditionary warfare beyond India, from the Victorian campaigns in Africa to the expeditionary forces of the First World War.',
    bookIds: [
      'en-robert-baden-powell-the-downfall-of-prempeh',
      'en-robert-baden-powell-the-matabele-campaign-1896',
      'en-robert-baden-powell-aids-to-scouting',
      'en-charles-william-wilson-from-korti-to-khartum-illustrated',
      'en-george-warrington-steevens-with-kitchener-to-khartum-annotated',
      'en-george-arthur-life-of-lord-kitchener-volume-i',
      'en-george-arthur-life-of-lord-kitchener-volume-ii',
      'en-george-arthur-life-of-lord-kitchener-volume-iii',
      'en-charles-vere-ferrers-townshend-my-campaign-in-mesopotamia-annotated',
      'en-charles-edward-callwell-the-life-of-sir-stanley-maude',
      'en-ian-hamilton-gallipoli-diary-volume-i',
      'en-ian-hamilton-gallipoli-diary-volume-ii',
      'en-william-robertson-from-private-to-field-marshal'
    ],
    germanBookIds: ['der-sturz-prempehs'] },
  { series: green, line: empire, nr: 'IV', id: 'polar-world', title: 'The Polar World', public: true,
    region: 'Arctic Canada · the opening of the North-West Passage',
    intro: 'The Royal Navy in the Arctic and the long search for the North-West Passage, in the journals of the men who made it.',
    bookIds: ['en-john-franklin-narrative-of-a-journey-to-the-shores-of-the-polar-sea', 'en-robert-mcclure-the-discovery-of-the-north-west-passage'] },
  { series: green, line: empire, nr: 'V', id: 'the-dominions', title: 'The Dominions', public: true,
    region: 'Canada · Australia',
    intro: 'The self-governing Dominions of the Empire, beginning with the North-West Mounted Police and the Dominion of Canada; Australia follows.',
    bookIds: ['en-samuel-benfield-steele-forty-years-in-canada'] },
  { series: green, line: empire, nr: 'VI', id: 'imperial-expeditions', title: 'Imperial Expeditions', public: true,
    region: 'The Himalaya · Tibet · Somaliland',
    intro: 'Expeditions carried out under the flag of the Empire, from the assault on Everest to the hunting grounds of Somaliland.',
    bookIds: ['en-francis-younghusband-the-epic-of-mount-everest-illustrated', 'en-melliss-lion-hunting-in-somali-land-annotated'] },
  // Green Series · The North American Theatre
  { series: green, line: northAmerica, nr: 'I', id: 'civil-war', title: 'The Civil War', public: true, inPreparation: true,
    region: '1861 to 1865',
    intro: 'The heart of this line: the American Civil War in the words of those who fought it. The first editions are in preparation.',
    bookIds: [] },
  { series: green, line: northAmerica, nr: 'II', id: 'wars-for-the-continent', title: 'Wars for the Continent', public: true,
    region: 'The Revolution · 1812 · Mexico · Cuba 1898',
    intro: 'The wars that decided the continent, from the southern campaigns of the Revolution and the War of 1812 to Mexico and Cuba.',
    bookIds: [
      'en-winfield-scott-memoirs-volume-i',
      'en-winfield-scott-memoirs-volume-ii',
      'en-theodore-roosevelt-the-naval-war-of-1812',
      'en-theodore-roosevelt-the-rough-riders-annotated'
    ],
    germanBookIds: ['geschichte-der-feldzuege-von-1780-und-1781'] },
  { series: green, line: northAmerica, nr: 'III', id: 'frontier-and-rangers', title: 'Frontier & Rangers', public: true,
    region: 'Texas · the Southern Plains',
    intro: 'Life and service on the Texas frontier, in the memoirs of the Rangers themselves.',
    bookIds: ['en-napoleon-augustus-jennings-a-texas-ranger-annotated', 'en-james-b-gillett-six-years-with-the-texas-rangers-illustrated'] },
  { series: green, id: 'european-military-history', title: 'European Military History', public: false, bookIds: [] },

  // Amber Series
  { series: 'bernstein', id: 'seton-wild-animals', title: 'Seton’s Wild Animals', public: true,
    intro: 'Ernest Thompson Seton’s animal biographies: true stories of wild lives, told from the animal’s side.',
    bookIds: [
      'en-ernest-thompson-seton-wild-animals-i-have-known-annotated',
      'en-ernest-thompson-seton-the-biography-of-a-grizzly-annotated',
      'en-ernest-thompson-seton-lives-of-the-hunted-annotated',
      'en-ernest-thompson-seton-animal-heroes-annotated',
      'en-ernest-thompson-seton-monarch-the-big-bear-of-tallac-annotated'
    ] },
  { series: 'bernstein', id: 'woodcraft-and-wilderness', title: 'Woodcraft & Wilderness', public: true,
    intro: 'Camp, canoe and trail: the classic handbooks of woodcraft and the literature of the North American wilderness.',
    bookIds: [
      'en-ernest-thompson-seton-edition-two-little-savages',
      'en-ernest-thompson-seton-edition-rolf',
      'en-ernest-thompson-seton-edition-arctic-prairies',
      'en-grey-owl-the-men-of-the-last-frontier',
      'en-george-washington-sears-woodcraft-illustrated',
      'en-daniel-carter-beard-shelters-shacks-and-shanties-illustrated',
      'en-daniel-carter-beard-the-american-boys-handy-book',
      'en-william-henry-harrison-murray-adventures-in-the-wilderness',
      'en-elihu-stewart-down-the-mackenzie-and-up-the-yukon-in-1906'
    ] },
  { series: 'bernstein', id: 'leatherstocking-tales', title: 'The Leatherstocking Tales', public: true,
    intro: 'James Fenimore Cooper’s five novels of Natty Bumppo, the frontiersman of the American forest.',
    bookIds: [
      'en-james-fenimore-cooper-the-deerslayer',
      'en-james-fenimore-cooper-the-last-of-the-mohicans',
      'en-james-fenimore-cooper-the-pathfinder',
      'en-james-fenimore-cooper-the-pioneers',
      'en-james-fenimore-cooper-the-prairie'
    ] },
  { series: 'bernstein', id: 'lost-worlds-and-treasure', title: 'Lost Worlds & Treasure', public: true,
    intro: 'Hidden kingdoms, lost plateaus and buried gold: the great adventure novels of Haggard, Conan Doyle and Stevenson.',
    bookIds: [
      'en-h-rider-haggard-king-solomons-mines',
      'en-h-rider-haggard-allan-quatermain',
      'en-h-rider-haggard-nada-the-lily',
      'en-h-rider-haggard-she',
      'en-h-rider-haggard-ayesha',
      'en-arthur-conan-doyle-the-lost-world',
      'en-robert-louis-stevenson-treasure-island-annotated'
    ] },
  { series: 'bernstein', id: 'chivalry', title: 'Chivalry', public: true,
    intro: 'Arthur Conan Doyle’s novels of the Hundred Years’ War and the code of knighthood.',
    bookIds: [
      'en-arthur-conan-doyle-the-white-company-volume-i',
      'en-arthur-conan-doyle-the-white-company-volume-ii',
      'en-arthur-conan-doyle-the-white-company-volume-iii',
      'en-arthur-conan-doyle-sir-nigel'
    ] },
  { series: 'bernstein', id: 'english-country-boyhood', title: 'English Country Boyhood', public: true,
    intro: 'Richard Jefferies on field, wood and water: boyhood and the English countryside.',
    bookIds: ['en-richard-jefferies-edition-bevis', 'en-richard-jefferies-wood-magic', 'en-richard-jefferies-the-gamekeeper-at-home'] },
  { series: 'bernstein', id: 'fairy-tales-and-fables', title: 'Fairy Tales & Fables', public: false, bookIds: [] },

  // Anthracite Series
  { series: 'anthrazit', id: 'american-frontier-gothic', title: 'American Frontier Gothic', public: true,
    intro: 'The dark early novel of the American frontier: wilderness, terror and the borderlands of the young republic.',
    bookIds: [
      'en-charles-brockden-brown-edgar-huntly-illustrated',
      'en-charles-brockden-brown-wieland-illustrated',
      'en-robert-montgomery-bird-edition-nick',
      'en-robert-montgomery-bird-edition-hawks',
      'en-james-hall-the-harpe-s-head-illustrated',
      'en-william-gilmore-simms-the-yemassee-annotated'
    ] },
  { series: 'anthrazit', id: 'parkman-france-and-england', title: 'Parkman: France and England in North America', public: true,
    intro: 'Francis Parkman’s history of the struggle for a continent, and his own journey along the Oregon Trail.',
    bookIds: [
      'en-francis-parkman-the-conspiracy-of-pontiac',
      'en-francis-parkman-the-discovery-of-the-great-west',
      'en-francis-parkman-edition-oregon-trail'
    ] },
  { series: 'anthrazit', id: 'winning-of-the-west', title: 'The Winning of the West', public: false, bookIds: [] },
  { series: 'anthrazit', id: 'tales-of-the-uncanny', title: 'Tales of the Uncanny', public: true,
    intro: 'Haunted men and haunted houses: classic tales of the uncanny.',
    bookIds: ['en-edgar-allan-poe-tales', 'en-charles-dickens-the-haunted-man-and-the-ghosts-bargain'] },
  { series: 'anthrazit', id: 'mind-and-madness', title: 'Mind and Madness', public: true,
    intro: 'The founding texts of humane psychiatry, from Pinel’s treatise to the end of mechanical restraint.',
    bookIds: ['en-philippe-pinel-a-treatise-on-insanity', 'en-john-conolly-the-treatment-of-the-insane-without-mechanical-restraints'] },
  { series: 'anthrazit', id: 'european-classics', title: 'European Classics', public: false, bookIds: [] },

  // Blue Series
  { series: 'blau', id: 'titans-of-industry', title: 'Titans of Industry', public: true,
    intro: 'The builders of railways and industry, in their own words.',
    bookIds: ['en-james-j-hill-highways-of-progress-illustrated'] },
  { series: 'blau', id: 'money-and-markets', title: 'Money & Markets', public: true,
    intro: 'How the great exchanges of London, Paris and New York worked.',
    bookIds: ['en-george-rutledge-gibson-stock-exchanges'] }
];
for (const definition of definitions) {
  definition.line = definition.line || null;
  definition.url = definition.line ? `${base(definition.series)}${definition.line}/${definition.id}/` : `${base(definition.series)}${definition.id}/`;
}
const seriesIds = ['anthrazit', green, 'rot', 'blau', 'bernstein', 'weiss', 'purpur'];
for (const id of seriesIds) {
  definitions.push({ series: id, line: null, id: 'editorial-review', title: 'Editorial review', public: false,
    url: `/collections/${seriesSlugs[id]}/editorial-review/`, bookIds: [] });
}

// Cross-series theme pages point to existing lines and collections; they never move a book.
const themes = [
  {
    id: 'westward', title: 'Westward', subtitle: 'The Settlement and Conquest of North America',
    intro: 'The opening of a continent, seen from the barracks, the forest and the novel. These collections belong to different AETERNUS series; together they tell how North America was crossed, settled and won.',
    url: '/collections/westward/',
    refs: [
      { kind: 'line', series: green, id: northAmerica },
      { kind: 'collection', series: 'anthrazit', id: 'parkman-france-and-england' },
      { kind: 'collection', series: 'anthrazit', id: 'american-frontier-gothic' },
      { kind: 'collection', series: 'bernstein', id: 'leatherstocking-tales' },
      { kind: 'collection', series: 'bernstein', id: 'woodcraft-and-wilderness' },
      { kind: 'collection', series: 'bernstein', id: 'seton-wild-animals' }
    ]
  }
];

// Former collection addresses keep working.
const redirects = {
  '/collections/green-series/british-empire/': `${base(green)}${empire}/`,
  '/collections/green-series/american-military-history/': `${base(green)}${northAmerica}/wars-for-the-continent/`,
  '/collections/green-series/american-frontier-rangers/': `${base(green)}${northAmerica}/frontier-and-rangers/`,
  '/collections/green-series/exploration-frontier-worlds/': `${base(green)}${empire}/imperial-expeditions/`
};

function bind(englishBooks, germanBooks, series) {
  const englishById = new Map(englishBooks.map(book => [book.id, book]));
  const germanById = new Map(germanBooks.map(book => [book.id, book]));
  const assigned = new Set();
  const collections = definitions.map(definition => {
    if (!seriesIds.includes(definition.series)) throw new Error(`Unknown collection series: ${definition.series}`);
    if (definition.line && !lines.some(line => line.id === definition.line && line.series === definition.series)) throw new Error(`Unknown line: ${definition.line}`);
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
    if (definition.public && !books.length && !publishedGerman.length && !definition.inPreparation) throw new Error(`Empty public collection: ${definition.id}`);
    return { ...definition, books, publishedGerman,
      publishedBooks: books.filter(book => book.availability === 'AVAILABLE'),
      catalogueBooks: books.filter(book => book.availability !== 'AVAILABLE' && book.hideAvailabilityTeaser),
      forthcomingBooks: books.filter(book => book.availability !== 'AVAILABLE' && !book.hideAvailabilityTeaser) };
  });
  const seriesOf = id => series.find(item => item.id === id);
  const boundLines = lines.map(line => {
    const members = collections.filter(c => c.line === line.id && c.public);
    return { ...line, seriesInfo: seriesOf(line.series), seriesUrl: base(line.series), collections: members,
      bookCount: members.reduce((n, c) => n + c.books.length, 0) };
  });
  for (const collection of collections) {
    collection.seriesInfo = seriesOf(collection.series);
    collection.seriesUrl = base(collection.series);
    collection.lineInfo = boundLines.find(line => line.id === collection.line) || null;
    collection.siblings = collections.filter(c => c.public && c.series === collection.series && c.line === collection.line);
  }
  for (const book of englishBooks) {
    const collection = collections.find(item => item.books.includes(book)) ||
      collections.find(item => item.series === book.series && item.id === 'editorial-review');
    if (!collection) throw new Error(`No collection for ${book.id}`);
    if (book.series === green && collection.id === 'editorial-review' && !book.collectionReviewPending) throw new Error(`Unclassified Green Series book: ${book.id}`);
    const line = collection.public ? collection.lineInfo : null;
    Object.assign(book, {
      primaryEditionLine: book.series,
      primaryCollection: collection.id,
      collectionTitle: collection.title,
      collectionUrl: collection.public ? collection.url : null,
      collectionLineTitle: line ? line.title : null,
      collectionLineUrl: line ? line.url : null,
      collectionSeriesUrl: collection.public ? base(book.series) : null,
      collectionSeriesTitle: collection.public && seriesOf(book.series) ? `${seriesOf(book.series).name.en} Series` : null,
      topics: Array.isArray(book.topics) ? book.topics : [],
      workGroupId: book.workGroupId || null,
      publicationStatus: book.availability === 'AVAILABLE' ? 'published' : 'forthcoming'
    });
  }
  const bySeries = Object.fromEntries(seriesIds.map(id => {
    const publicCollections = collections.filter(item => item.series === id && item.public);
    return [id, {
      series: seriesOf(id), slug: seriesSlugs[id], url: base(id),
      collections: collections.filter(item => item.series === id),
      publicCollections,
      lines: boundLines.filter(line => line.series === id),
      looseCollections: publicCollections.filter(item => !item.line),
      bookCount: publicCollections.reduce((n, c) => n + c.books.length, 0)
    }];
  }));
  const landingSeries = seriesIds.map(id => bySeries[id]).filter(entry => entry.publicCollections.length);
  const boundThemes = themes.map(theme => ({ ...theme, items: theme.refs.map(ref => {
    const target = ref.kind === 'line' ? boundLines.find(l => l.id === ref.id && l.series === ref.series)
      : collections.find(c => c.id === ref.id && c.series === ref.series && c.public);
    if (!target) throw new Error(`Unknown theme reference: ${ref.id}`);
    const books = ref.kind === 'line' ? target.collections.flatMap(c => c.books) : target.books;
    return { kind: ref.kind, title: target.title, intro: target.tagline || target.intro, url: target.url,
      series: seriesOf(ref.series), books, count: books.length };
  }) }));
  return { collections, lines: boundLines, themes: boundThemes, redirects, bySeries, landingSeries, green: bySeries[green] };
}

module.exports = { definitions, lines, themes, redirects, seriesSlugs, bind };
