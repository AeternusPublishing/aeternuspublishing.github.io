const source = require('./bp002-en-20261020.source.json');
const b = source.buch;
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = values => values.map(value => `<p>${esc(value)}</p>`).join('');
const id = 'en-robert-baden-powell-aids-to-scouting';
const formats = source.formats.map(f => ({label: f.form, isbn: f.isbn, ...(f.seiten ? {pages: f.seiten} : {}), price_display: `US list price $${f.preis_usd.toFixed(2)}`, links: []}));
const status = 'Forthcoming · 28 October 2026';
module.exports = {
  id, work_id: 'BP_002', language: 'en', title: b.titel, subtitle: b.untertitel,
  author: source.autor.slug, authorName: source.autor.name, contributors: [],
  series: 'gruen', series_number: null, seriesName: 'Green Series', seriesColor: '#2d4a22', series_line: b.reihe,
  original_title: b.titel, original_publication_year: 1899,
  isbn: {paperback: formats[0].isbn, hardcover: null, ebook: formats[1].isbn},
  formats: {paperback: formats[0], hardcover: null, ebook: formats[1]}, retailer_formats: formats,
  description: {short: b.blurb[0], long: [...b.blurb, b.schluss].join('\n\n')},
  cover: '/assets/images/' + b.umschlag.replace('.webp', '-fallback.jpg'),
  coverWebp: '/assets/images/' + b.umschlag,
  backcover: '/assets/images/' + b.rueckseite,
  backcoverWebp: '/assets/images/' + b.rueckseite.replace('-fallback.jpg', '.webp'),
  publication_date: source.erscheinen, pricing: {USD: {paperback: 14.99, ebook: 7.99}},
  availability: 'COMING_SOON', status: source.status,
  links: {shop: null, amazon: null, ingram: null},
  distribution_status: {own_shop: 'NOT_CONFIGURED', amazon: 'UNKNOWN', ingram: 'UNKNOWN'},
  commerce: {shopify_product_id: null, shopify_handle: null},
  url: `/books/${id}/`, authorUrl: `/authors/${source.autor.slug}/`,
  legacy: {modal: {metadata: b.reihe, sample: b.blurb[0]}},
  publisherDescriptionHTML: `<h3>${esc(b.kicker)}</h3><blockquote><p>${esc(b.zitat)}</p></blockquote>${paras([...b.blurb, b.schluss])}<ul>${b.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul><p>First published: ${esc(b.erstausgabe)}</p>`,
  forthcoming_label: status, cardStatus: status, brandOnly: true,
  provenance: 'BP_002/10_SOCIAL_WEB_EN/WEBSITE_20261020/WEBSEITE_TEXTE.json'
};
