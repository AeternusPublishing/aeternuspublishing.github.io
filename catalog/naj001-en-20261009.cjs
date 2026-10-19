// Publisher-approved NAJ_001 website copy. The JSON is copied byte-for-byte
// from the work's WEBSITE_20261009/WEBSEITE_TEXTE.json.
const source = require('./naj001-en-20261009.source.json');

const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = value => escapeHtml(value).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const paragraphs = values => values.map(value => `<p>${inline(value).replace(/\n/g, '<br>')}</p>`).join('');
const paperback = source.formats.find(format => format.form === 'Paperback');
const hardcover = source.formats.find(format => format.form === 'Hardcover');
const price = format => `US$${format.usd.toFixed(2)} · £${format.gbp.toFixed(2)} · €${format.eur.toFixed(2)}`;
const slug = source.author_slug;
const id = `en-${slug}-a-texas-ranger-annotated`;
const cover = '/assets/images/cover-a-texas-ranger-jennings-en-20261009-fallback.jpg';

module.exports = {
  author: {
    slug,
    name: source.author_name,
    dates: source.author_dates,
    eyebrow: `${source.series} · AETERNUS`,
    tagline: 'Ranger, Reporter and Chronicler of the Border',
    intro: '',
    metaDescription: `${source.author_name} (${source.author_dates}), author of ${source.book_title}, first published by ${source.first_published}. The AETERNUS ${source.series} edition is forthcoming.`,
    portrait: null,
    blocks: [{ h: 'About the Author', p: source.about_the_author.slice(1).map(value => value.replace(/\*([^*]+)\*/g, '$1')) }]
  },
  book: {
    id,
    work_id: 'NAJ_001',
    language: 'en',
    title: source.book_title,
    subtitle: '',
    author: slug,
    authorName: source.author_name,
    contributors: [],
    series: 'gruen',
    series_number: null,
    original_title: source.book_title,
    original_publication_year: 1899,
    isbn: { paperback: paperback.isbn, hardcover: hardcover.isbn, ebook: null },
    formats: {
      paperback: { label: paperback.form, price_display: price(paperback) },
      hardcover: { label: hardcover.form, price_display: price(hardcover) }
    },
    description: {
      short: source.back_cover_text[1],
      long: source.back_cover_text.join('\n\n')
    },
    cover,
    coverWebp: '/assets/images/cover-a-texas-ranger-jennings-en-20261009.webp',
    publication_date: null,
    pricing: {},
    availability: 'COMING_SOON',
    links: { shop: null, amazon: null, ingram: null },
    distribution_status: { own_shop: 'NOT_CONFIGURED', amazon: 'UNKNOWN', ingram: 'FREIGEGEBEN' },
    commerce: { shopify_product_id: null, shopify_handle: null },
    url: `/books/${id}/`,
    authorUrl: `/authors/${slug}/`,
    seriesName: 'Green Series',
    seriesColor: '#2d4a22',
    legacy: { modal: { sample: source.back_cover_text[1], metadata: `${source.series} · ${source.first_published} · ${paperback.pages} pages · Paperback and hardcover forthcoming` } },
    provenance: 'NAJ_001/09_SOCIAL_WEB_EN/WEBSITE_20261009/WEBSEITE_TEXTE.json',
    retailer_formats: [paperback, hardcover].map(format => ({ label: format.form, isbn: format.isbn, price_display: price(format), links: [] })),
    publisherDescriptionHTML: `<blockquote>${inline(source.back_cover_text[0]).replace(/\n/g, ' <br>')}</blockquote>${paragraphs(source.back_cover_text.slice(1))}`
  }
};
