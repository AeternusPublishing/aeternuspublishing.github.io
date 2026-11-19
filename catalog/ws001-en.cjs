const slug = 'winfield-scott';
const world = require('../editorial/author-worlds/authors/winfield-scott.json');
const author = {
  slug,
  name: 'Winfield Scott',
  dates: '1786–1866',
  metaDescription: world.locales.en.description,
  brandOnly: true,
  blocks: []
};

// Ingram revision R872 (19 November 2026): packages
// UPLOADPAKET_INGRAM_BAND_I_R872_300PPI_20261118 (MANIFEST 10f6c40e…) and
// UPLOADPAKET_INGRAM_BAND_II_R872_300PPI_20261118 (MANIFEST 0e20ec02…).
// Descriptions follow METADATEN/INGRAM_PAPERBACK.json of each package.
const features = {
  I: ['Complete text of the New York 1864 first edition, Volume I',
    'Historical Introduction, Afterword and Publisher’s Note',
    'Biographical record: commissions, honors, titles',
    'Dramatis Personae of over 400 persons with life dates',
    'Glossary of 387 entries with page references',
    'Chronology, 1786–1866, and Note on the Text'],
  II: ['Complete text of the New York 1864 first edition, Volume II',
    'Historical Introduction, Afterword and Publisher’s Note',
    'Dramatis Personae of some 340 persons with life dates',
    'Glossary of 341 entries with page references',
    'Index of the first edition for both volumes, page references reset',
    'Chronology, 1786–1866, and Note on the Text']
};
const blurbs = {
  I: [
    '<strong>1812. THE UNITED STATES GOES TO WAR WITH GREAT BRITAIN.</strong>',
    'The American Republic is young, its regular army small, its military institutions imperfectly formed. Across the Canadian frontier stand British regiments, seasoned officers, and the formidable military power of an empire already engaged in a world war.',
    'From this contest emerges Winfield Scott.',
    'Taken prisoner at Queenston Heights, he returns to command a brigade of American regulars whose discipline and courage transform the Niagara campaign of 1814. At Chippewa his soldiers defeat British regular infantry in open battle; at Lundy’s Lane they fight one of the bloodiest engagements of the war.',
    'Yet the battlefield is only the beginning.',
    'Commissioned under Thomas Jefferson, he will serve fourteen presidents. He writes the regulations and the tactics by which the army learns its profession; by West Point tradition, the cadets’ gray still honors his regulars of Chippewa.',
    'Written by the general himself and first published in 1864, these memoirs preserve the voice of a soldier whose career helped shape the United States Army.',
    '<strong>Before America could command a continent, it had to learn how to command an army.</strong>'
  ],
  II: [
    '<strong>1847. AN AMERICAN ARMY LANDS UPON THE COAST OF MEXICO.</strong>',
    'Its commander is Winfield Scott, veteran of the War of 1812 and General-in-Chief of the United States Army. Before him lies an enemy capital defended by formidable fortifications, mountain barriers, and the armies of General Antonio López de Santa Anna.',
    'Scott advances from Veracruz into the Mexican interior. At Cerro Gordo, American troops turn the enemy’s position. Beyond Puebla come Contreras, Churubusco, Molino del Rey, and Chapultepec. On September 14, 1847, the American Army enters Mexico City.',
    'Among Scott’s officers are young men whose names will later dominate the American Civil War: Robert E. Lee, Ulysses S. Grant, Thomas J. Jackson, and George B. McClellan.',
    'But the greatest crisis of Scott’s life is still to come.',
    'As the Union fractures in 1861, the aging Virginian remains loyal while Robert E. Lee goes south. Scott guards Lincoln’s inauguration and proposes a continental strategy whose principal elements will help shape the struggle for the Republic’s survival. In Washington his statue stands cast from the bronze of guns taken in Mexico.',
    '<strong>These are the memoirs of the soldier who led America’s march to Mexico City — and lived to see the army he helped build divided against itself.</strong>'
  ]
};
const strip = html => html.replace(/<[^>]+>/g, '');

const volumes = [
  ['I', 'The Making of an American General', 348, ['9783676052443', '9783676052450', '9783676052764'],
    'Scott recalls the War of 1812 and his formation as an American general.', '10f6c40ee6f28c827a92e42c3f20c43fc20d2d449cea6dc08f8977cacec857b2'],
  ['II', 'The Conquest of Mexico and the Fate of the Union', 328, ['9783676052467', '9783676052474', '9783676052771'],
    'Scott recounts his campaign in Mexico and his later years in the United States Army.', '0e20ec02380e673c1dfb5058b2ba30fa3ea4c186e0e64325033be2593f6dcab7']
];
const prices = ['US$21.99', 'US$34.99', 'US$44.99'];

const books = volumes.map(([volume, subtitle, pages, numbers, summary, manifest]) => {
  const id = 'en-winfield-scott-memoirs-volume-' + volume.toLowerCase();
  const image = name => '/assets/images/' + name + '-ws001-volume-' + volume.toLowerCase() + '-ingram-r872-20261119';
  const formats = numbers.map((isbn, index) => ({
    label: ['Paperback', 'Hardcover', 'Cloth hardcover with dust jacket'][index],
    isbn, pages, price_display: prices[index], platform: 'IngramSpark', status: 'EINGEREICHT', links: [],
    // Cloth was first submitted with R872; retail-state replaces this note once a LIVE row exists.
    ...(index === 2 ? { availability_note: 'Forthcoming · retail availability to follow.' } : {})
  }));
  const blurb = blurbs[volume];
  return {
    id, work_id: 'WS_001', workGroupId: 'WS_001', language: 'en',
    title: 'Memoirs of Lieutenant-General Scott (Annotated)',
    subtitle: 'Volume ' + volume + ': ' + subtitle,
    author: slug, authorName: author.name, series: 'gruen', seriesName: 'GREEN', seriesColor: '#2d4a22',
    original_publication_year: 1864, first_published: '1864',
    isbn: { paperback: numbers[0], hardcover: numbers[1] },
    formats: { paperback: formats[0], hardcover: formats[1] }, retailer_formats: formats,
    description: { short: summary, long: features[volume].join('\n') + '\n\n' + blurb.map(strip).join('\n\n') },
    publisherDescriptionHTML: '<ul>' + features[volume].map(f => '<li>' + f + '</li>').join('') + '</ul>' +
      blurb.map(p => '<p>' + p + '</p>').join('') + '<p>The Green Series · The North American Theatre</p>',
    cover: image('cover') + '.jpg', coverWebp: image('cover') + '.webp',
    backcover: image('backcover') + '.jpg', backcoverWebp: image('backcover') + '.webp',
    availability: 'COMING_SOON', links: { shop: null, amazon: null, ingram: null },
    distribution_status: { ingram: 'EINGEREICHT' },
    provenance: 'WS_001 Volume ' + volume + ' Ingram revision R872, MANIFEST ' + manifest + '; paperback and hardcover live at Ingram since 14 November 2026 (earlier revision), revision R872 and the cloth edition submitted 19 November 2026, awaiting Ingram approval',
    url: '/books/' + id + '/', authorUrl: '/authors/' + slug + '/',
    cardStatus: 'Forthcoming', forthcoming_label: 'Forthcoming in paperback, hardcover and cloth hardcover.',
    brandOnly: true
  };
});

module.exports = { author, books };
