// Publisher-approved V5 Ingram packages, submitted 10 October 2026.
// eProof and retail distribution remain pending; no buying links are shown.
const volumes = [
  {
    roman: 'I', key: 'i', subtitle: 'Out of the Cloister', pages: 216,
    paperback: '978-3-67605-144-6', hardcover: '978-3-67605-145-3',
    description: 'Alleyne Edricson leaves Beaulieu Abbey and meets Hordle John, Samkin Aylward and Sir Nigel Loring. The company begins to form.',
    chapters: 'I–XII',
    apparatus: 'Volume foreword, afterword and author profile'
  },
  {
    roman: 'II', key: 'ii', subtitle: 'Under the Banner', pages: 186,
    paperback: '978-3-67605-147-7', hardcover: '978-3-67605-148-4',
    description: 'The company crosses the sea to Bordeaux and enters the military world of the Black Prince. Reputation and fellowship are tested in the field.',
    chapters: 'XIII–XXVI',
    apparatus: 'Volume foreword, afterword and author profile'
  },
  {
    roman: 'III', key: 'iii', subtitle: 'Beyond the Pyrenees', pages: 200,
    paperback: '978-3-67605-150-7', hardcover: '978-3-67605-151-4',
    description: 'Beyond the Pyrenees, the struggle for the crown of Castile draws the company into its final campaign. Loyalty and courage face their last trial.',
    chapters: 'XXVII–XXXVIII',
    apparatus: 'Volume foreword, afterword and historical essays'
  }
];

module.exports = volumes.map(v => {
  const id = `en-arthur-conan-doyle-the-white-company-volume-${v.key}`;
  const title = `The White Company · Volume ${v.roman}`;
  return {
    id, work_id: `ACD_001_BAND_${v.roman}`, language: 'en', title,
    subtitle: v.subtitle, author: 'arthur-conan-doyle',
    authorName: 'Arthur Conan Doyle', contributors: [], series: 'bernstein',
    series_number: null, original_title: 'The White Company',
    original_publication_year: 1891,
    isbn: { paperback: v.paperback, hardcover: v.hardcover },
    formats: {}, description: {
      short: `${v.description} Submitted to IngramSpark; eProof pending.`,
      long: v.description
    },
    cover: `/assets/images/cover-white-company-vol-${v.key}-fallback.jpg`,
    coverWebp: `/assets/images/cover-white-company-vol-${v.key}.webp`,
    publication_date: null, pricing: {}, availability: 'COMING_SOON',
    links: { shop: null, amazon: null, ingram: null },
    distribution_status: { amazon: 'NOT_SUBMITTED', ingram: 'EINGEREICHT', own_shop: 'NOT_CONFIGURED' },
    commerce: { shopify_product_id: null, shopify_handle: null },
    url: `/books/${id}/`, authorUrl: '/authors/arthur-conan-doyle/',
    legacy: { modal: {
      sample: v.description,
      metadata: `AETERNUS · English · Illustrated · ${v.pages} print pages · Paperback and hardcover submitted to IngramSpark; eProof pending.`
    } },
    retailer_formats: [
      { label: 'Paperback', isbn: v.paperback, links: [], status: 'EINGEREICHT' },
      { label: 'Hardcover', isbn: v.hardcover, links: [], status: 'EINGEREICHT' }
    ],
    publisherDescriptionHTML: `<ul><li>Complete, unmodernised text of the London first edition of 1891</li><li>Volume ${v.roman} of three: chapters ${v.chapters}</li><li>Frontispiece and four plates made for this edition</li><li>${v.apparatus}</li></ul><p>${v.description}</p><p>Submitted to IngramSpark. The eProof and retail release are pending.</p>`,
    provenance: `ACD_001 English Ingram V5 volume ${v.roman}, publisher decision 2026-10-09; submitted 2026-10-10`
  };
});
