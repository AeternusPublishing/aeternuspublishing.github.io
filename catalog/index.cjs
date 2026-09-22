// Shared read model. Existing editorial records are reused, never copied per site.
// No product is created or exported to a commerce provider by this module.
const programme = require('./legacy/programme.cjs');
const authorsDe = require('./legacy/authors-de.cjs');
const authorsEn = require('./legacy/authors-en.cjs');
const german = require('./legacy/catalogue-de.cjs');
const commerce = require('../commerce/markets.json');
const clean = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ').trim();
const slug = value => clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const series = programme.seriesItems.map(s => ({ id: s.slug, name: s.colorName, label: s.label, color: s.colorHex, description: s.desc || s.description || {}, authors: s.authors.map(a => a.slug || a.landingUrl?.de?.split('/')[2]).filter(Boolean) }));
// Explicit migration manifest: page language is NOT edition language. English
// author pages also advertise German editions. Those are deliberately excluded.
const englishAuthors = new Set(['ernest-thompson-seton', 'robert-montgomery-bird', 'george-washington-sears', 'francis-parkman', 'james-hall', 'daniel-carter-beard', 'henry-rider-haggard', 'richard-jefferies', 'charles-brockden-brown']);
const englishBooks = authorsEn.filter(a => englishAuthors.has(a.slug)).flatMap(a => a.books.filter(b => !/German (edition|translation)/i.test(b.meta || '')).map(b => {
  // These existing author pages postdate the programme overview; their own
  // explicit series labels are the authority for this migration mapping.
  const additionalSeries = { 'james-hall': 'anthrazit', 'daniel-carter-beard': 'bernstein', 'richard-jefferies': 'bernstein' };
  const line = series.find(s => s.authors.includes(a.slug) || s.id === additionalSeries[a.slug]);
  if (!line) throw new Error('Unmapped author series: ' + a.slug);
  const id = `en-${a.slug}-${b.id || slug(b.title)}`;
  const availability = b.status === 'Available now' ? 'AVAILABLE' : 'COMING_SOON';
  const isbn = { hardcover: null, paperback: null, ebook: null };
  const formats = { hardcover: null, paperback: null, ebook: null };
  for (const format of b.formats || []) {
    const key = ({ Hardcover: 'hardcover', Paperback: 'paperback', Kindle: 'ebook', 'E-Book': 'ebook' })[format.name];
    if (key) { isbn[key] = format.isbn || null; formats[key] = { label: format.name, price_display: format.price || null }; }
  }
  return {
    id, language: 'en', title: clean(b.title), subtitle: clean(b.subtitle),
    author: a.slug, authorName: a.name, contributors: [], series: line.id,
    series_number: null, original_title: null, original_publication_year: null,
    isbn, formats, description: { short: clean(b.modal?.summary), long: clean(b.modal?.summary) },
    cover: b.cover?.img ? `/assets/images/${b.cover.img}-fallback.jpg` : null,
    publication_date: null, pricing: { EUR: null, USD: null, GBP: null, CAD: null, AUD: null },
    availability, links: { shop: null, amazon: null, ingram: null },
    distribution_status: { own_shop: 'NOT_CONFIGURED', amazon: 'UNKNOWN', ingram: 'UNKNOWN', other: {} },
    commerce: { shopify_product_id: null, shopify_handle: null },
    url: `/books/${id}/`, authorUrl: `/authors/${a.slug}/`, seriesName: line.name.en,
    seriesColor: line.color, legacy: b, provenance: `catalog/legacy/authors-en.cjs#${a.slug}/${b.id || slug(b.title)}`
  };
}));
function directShopUrl(book, language, settings = commerce) {
  if (!settings.enabled || book.availability !== 'AVAILABLE' || !book.commerce?.shopify_product_id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.commerce?.shopify_handle || '')) return null;
  const domain = settings.domains[language === 'de' ? 'de' : 'en'];
  return `https://${domain}/products/${book.commerce.shopify_handle}`;
}
module.exports = { programme, authorsDe, authorsEn, german, series, englishBooks, clean, directShopUrl };
