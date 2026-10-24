// GA_001 author copy is copied byte-for-byte from the printed V63 source.
// V9 released 24 October 2026; retail availability awaits observation.
const fs = require('node:fs');
const path = require('node:path');
const releasedVolumes = require('./ga001-v9-20261024.json');

const source = fs.readFileSync(path.join(__dirname, 'ga001-author-v63-20261014.txt'), 'utf8').trim();
if (!/^SIR GEORGE ARTHUR\r?\n\r?\n/.test(source)) throw new Error('GA_001 author source heading changed');
const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const paragraphs = source.split(/\r?\n\s*\r?\n/);
const publisherAuthorHTML = paragraphs.map(paragraph =>
  `<p>${escapeHtml(paragraph).replace(/_([^_]+)_/g, '<em>$1</em>')}</p>`
).join('');

const author = {
  slug: 'george-arthur',
  name: 'Sir George Arthur',
  dates: '1860–1946',
  eyebrow: 'GREEN SERIES · AETERNUS',
  tagline: 'Sir George Compton Archibald Arthur, 3rd Baronet',
  intro: '',
  metaDescription: 'Sir George Arthur (1860–1946), author of Life of Lord Kitchener, in three unabridged AETERNUS hardcover volumes.',
  portrait: {
    modern: true, fallback: true, file: 'portrait-george-arthur-bassano-1920',
    alt: 'Photographic portrait of Sir George Arthur'
  },
  publisherPortraitCaption: 'Photograph by Bassano. The Illustrated London News, 24 April 1920, p. 704.',
  publisherAuthorHTML,
  publisherAuthorSource: 'GA_001/00_ADMIN/AUTORENTEXT_ARTHUR_WIE_GEDRUCKT_V63_20261014.txt',
  brandOnly: true,
  extras: {
    kicker: 'MAPS AND PLANS',
    title: 'Maps and plans in full resolution',
    text: 'Download the maps and plans from all three volumes of Life of Lord Kitchener. These are the full-resolution images used in the AETERNUS edition.',
    items: [
      ['Volume I · The Sudan, 1883–1899', 'Full-resolution PNG.', '/assets/downloads/george-arthur/v70/GA001_V1_MAP_SUDAN_1883_1899.png', 'Download PNG'],
      ['Volume I · Omdurman', 'Full-resolution PNG.', '/assets/downloads/george-arthur/v70/GA001_V1_MAP_OMDURMAN.png', 'Download PNG'],
      ['Volume I · Paardeberg, plan A', 'Full-resolution PNG.', '/assets/downloads/george-arthur/v70/GA001_V1_PLAN_PAARDEBERG_A.png', 'Download PNG'],
      ['Volume I · Paardeberg, plan B', 'Full-resolution PNG.', '/assets/downloads/george-arthur/v70/GA001_V1_PLAN_PAARDEBERG_B.png', 'Download PNG'],
      ['Volume II · The armies in India', 'Full-resolution PNG.', '/assets/downloads/george-arthur/v70/GA001_V2_MAP_INDIA_ARMIES.png', 'Download PNG'],
      ['Volume II · Strategic railways', 'Full-resolution PNG.', '/assets/downloads/george-arthur/v70/GA001_V2_MAP_STRATEGIC_RAILWAYS_B.png', 'Download PNG'],
      ['Volume III · Gallipoli and the Dardanelles', 'Full-resolution PNG.', '/assets/downloads/george-arthur/v70/GA001_V3_MAP_GALLIPOLI_DARDANELLES.png', 'Download PNG']
    ]
  },
  blocks: []
};

const volumes = [
  ['I', '978-3-67605-175-0'],
  ['II', '978-3-67605-176-7'],
  ['III', '978-3-67605-177-4']
];
const books = volumes.map(([volume, isbn]) => {
  const released = releasedVolumes[volume];
  if (released.isbn !== isbn) throw new Error(`GA_001 Volume ${volume}: released ISBN mismatch`);
  const slug = volume.toLowerCase();
  const id = `en-george-arthur-life-of-lord-kitchener-volume-${slug}`;
  const description = `Life of Lord Kitchener, Volume ${volume}. Complete text of the first London edition of 1920, unabridged. AETERNUS Green Series hardcover.`;
  return {
    id, work_id: 'GA_001', workGroupId: 'GA_001', language: 'en',
    title: `Life of Lord Kitchener · Volume ${volume}`, subtitle: '',
    author: author.slug, authorName: author.name, contributors: [],
    series: 'gruen', series_number: null,
    original_title: 'Life of Lord Kitchener', original_publication_year: 1920,
    isbn: { paperback: null, hardcover: isbn, ebook: null },
    formats: { hardcover: { label: 'Hardcover', isbn, pages: released.book_pages } },
    description: { short: description, long: description },
    publisherDescriptionHTML: released.description_html,
    cover: `/assets/images/cover-life-of-lord-kitchener-volume-${slug}-front.jpg`,
    coverWebp: `/assets/images/cover-life-of-lord-kitchener-volume-${slug}-front.webp`,
    publication_date: released.publication_date, pricing: {}, availability: 'COMING_SOON',
    forthcoming_label: 'Planned publication · 21 November 2026', cardStatus: 'Forthcoming · 21 November 2026',
    links: { shop: null, amazon: null, ingram: null },
    distribution_status: { ingram: 'GEBAUT', own_shop: 'NOT_CONFIGURED' },
    commerce: { shopify_product_id: null, shopify_handle: null },
    url: `/books/${id}/`, authorUrl: `/authors/${author.slug}/`,
    seriesName: 'Green Series', seriesColor: '#2d4a22', brandOnly: true,
    legacy: { modal: { metadata: `Hardcover · ${released.book_pages} pages · forthcoming`, sample: description } },
    retailer_formats: [{ label: 'Hardcover', isbn, pages: released.book_pages, links: [], status: 'GEBAUT' }],
    provenance: `GA_001/07_EXPORT/UPLOADPAKETE_INGRAM_V9_20261024/${released.source_package}/METADATEN/ingram_hardcover.json`
  };
});

module.exports = { author, books };
