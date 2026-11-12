const slug = 'winfield-scott';
const author = {
  slug,
  name: 'Winfield Scott',
  dates: '1786–1866',
  metaDescription: 'Winfield Scott and his two-volume memoir of command in North America.',
  brandOnly: true,
  blocks: []
};

const volumes = [
  ['I', 'The Making of an American General', 348, ['9783676052443', '9783676052450', '9783676052764'],
    'Scott recalls the War of 1812 and his formation as an American general.',
    ['Complete text of the New York 1864 first edition, Volume I',
      'Historical Introduction, Afterword and Publisher’s Note',
      'Biographical record: commissions, honors, titles',
      'Dramatis Personae of over 400 persons with life dates',
      'Glossary of 387 entries with page references',
      'Chronology, 1786–1866, and Note on the Text']],
  ['II', 'The Conquest of Mexico and the Fate of the Union', 328, ['9783676052467', '9783676052474', '9783676052771'],
    'Scott recounts his campaign in Mexico and his later years in the United States Army.',
    ['Complete text of the New York 1864 first edition, Volume II',
      'Historical Introduction, Afterword and Publisher’s Note',
      'Dramatis Personae of some 340 persons with life dates',
      'Glossary of 340 entries with page references',
      'Index of the first edition for both volumes, page references reset',
      'Chronology, 1786–1866, and Note on the Text']]
];

const books = volumes.map(([volume, subtitle, pages, numbers, summary, features]) => {
  const id = 'en-winfield-scott-memoirs-volume-' + volume.toLowerCase();
  const formats = numbers.map((isbn, index) => ({
    label: ['Paperback', 'Hardcover', 'Cloth hardcover with dust jacket'][index],
    isbn, pages, platform: 'IngramSpark', status: 'FREIGEGEBEN', links: []
  }));
  return {
    id, work_id: 'WS_001', workGroupId: 'WS_001', language: 'en',
    title: 'Memoirs of Lieutenant-General Scott (Annotated)',
    subtitle: 'Volume ' + volume + ': ' + subtitle,
    author: slug, authorName: author.name, series: 'gruen', seriesName: 'GREEN', seriesColor: '#2d4a22',
    original_publication_year: 1864, first_published: '1864',
    isbn: { paperback: numbers[0], hardcover: numbers[1] },
    formats: { paperback: formats[0], hardcover: formats[1] }, retailer_formats: formats,
    description: { short: summary, long: summary },
    blurb: [summary], features,
    cover: '/assets/images/cover-ws001-volume-' + volume.toLowerCase() + '.jpg',
    availability: 'COMING_SOON', links: { shop: null, amazon: null, ingram: null },
    distribution_status: { ingram: 'FREIGEGEBEN' },
    url: '/books/' + id + '/', authorUrl: '/authors/' + slug + '/',
    cardStatus: 'Forthcoming', forthcoming_label: 'Forthcoming in paperback, hardcover and cloth hardcover.',
    brandOnly: true
  };
});

module.exports = { author, books };
