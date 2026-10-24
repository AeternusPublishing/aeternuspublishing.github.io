// Publisher-authorized preview. Retail availability is changed only after observed LIVE.
const slug = 'frederick-sleigh-roberts';
const author = {
  slug, name: 'Frederick Sleigh Roberts', dates: '1832–1914', brandOnly: true,
  eyebrow: 'GREEN SERIES · AETERNUS',
  tagline: 'From the Bengal Artillery to command in India.',
  metaDescription: 'Frederick Sleigh Roberts and Forty-One Years in India. Two forthcoming English volumes in the AETERNUS Green Series.',
  portrait: { modern: false }, blocks: []
};
const subtitles = [
  'From Subaltern to Commander-in-Chief. Volume I: The Mutiny and the Making of an Officer',
  'From Subaltern to Commander-in-Chief. Volume II: Kabul, Kandahar, and Command'
];
const summaries = [
  'Volume I follows Roberts from the Bengal Artillery through Delhi, Cawnpore, Lucknow and the campaigns of 1857–58.',
  'Volume II follows Roberts through frontier warfare, Abyssinia and the Second Afghan War, the march from Kabul to Kandahar and command in India.'
];
const books = subtitles.map((subtitle, i) => {
  const volume = i ? 'II' : 'I';
  const id = `en-frederick-sleigh-roberts-forty-one-years-in-india-volume-${volume.toLowerCase()}`;
  return {
    id, work_id: 'FSR_001', language: 'en', title: 'Forty-One Years in India (Annotated)', subtitle,
    author: slug, authorName: author.name, contributors: [], series: 'gruen', series_number: null,
    original_title: 'Forty-One Years in India: From Subaltern to Commander-in-Chief', original_publication_year: 1897,
    isbn: { paperback: null, hardcover: null, ebook: null }, formats: {}, retailer_formats: [],
    description: { short: summaries[i], long: summaries[i] }, cover: null,
    publication_date: '2026-10-31', pricing: {}, availability: 'COMING_SOON',
    links: { shop: null, amazon: null, ingram: null }, distribution_status: { ingram: 'FREIGEGEBEN', amazon: 'NOT_SUBMITTED' },
    commerce: { shopify_product_id: null, shopify_handle: null },
    url: `/books/${id}/`, authorUrl: `/authors/${slug}/`, seriesName: 'GREEN SERIES', seriesColor: '#2d4a22',
    brandOnly: true, forthcoming_label: 'Forthcoming · planned publication 31 October 2026',
    cardStatus: `Volume ${volume} · forthcoming in paperback and hardcover`,
    publisherDescriptionHTML: `<p>${summaries[i]}</p><p>Complete English text of the London edition of 1897, with portraits, plates, plans and a publisher’s apparatus.</p><p><a href="/books/en-frederick-sleigh-roberts-forty-one-years-in-india-volume-${i ? 'i' : 'ii'}/">Explore Volume ${i ? 'I' : 'II'} →</a></p>`,
    legacy: { modal: { metadata: `GREEN SERIES · AETERNUS · Volume ${volume}`, sample: summaries[i] } },
    provenance: 'FSR_001/07_EXPORT/UPLOADPAKET_BD' + (i + 1) + '_V5_20261023/METADATEN/'
  };
});
module.exports = { author, books };
