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
  ['I', 'The Making of an American General', 278, ['9783676052443', '9783676052450', '9783676052764'],
    'Scott recalls the War of 1812 and his formation as an American general.'],
  ['II', 'The Conquest of Mexico and the Fate of the Union', 294, ['9783676052467', '9783676052474', '9783676052771'],
    'Scott recounts his campaign in Mexico and his later years in the United States Army.']
];

const books = volumes.map(([volume, subtitle, pages, numbers, summary]) => {
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
    cover: '/assets/images/cover-ws001-volume-' + volume.toLowerCase() + '.jpg',
    availability: 'COMING_SOON', links: { shop: null, amazon: null, ingram: null },
    distribution_status: { ingram: 'FREIGEGEBEN' },
    url: '/books/' + id + '/', authorUrl: '/authors/' + slug + '/',
    cardStatus: 'Forthcoming', forthcoming_label: 'Forthcoming in paperback, hardcover and cloth hardcover.',
    brandOnly: true
  };
});

module.exports = { author, books };
