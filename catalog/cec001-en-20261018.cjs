const source = require('./cec001-en-20261018.source.json');
const a = source.autor, b = source.buch;
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = values => values.map(value => `<p>${esc(value)}</p>`).join('');
const id = 'en-charles-edward-callwell-the-life-of-sir-stanley-maude';
const status = 'Forthcoming · 27 October 2026';
const formats = source.formats.map(f => ({label: f.form, isbn: f.isbn, ...(f.seiten ? {pages: f.seiten} : {}), price_display: `US list price $${f.preis_usd.toFixed(2)}`, links: []}));
const editionHTML = `<h2>${esc(b.titel)}</h2><p>${esc(b.untertitel)}</p><p>${esc(b.reihe)}</p><p>${status}</p><h3>${esc(b.kicker)}</h3>${paras([...b.blurb, b.schluss])}<ul>${b.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul><p>First published: ${esc(b.erstausgabe)}</p>${formats.map(f => `<p>${esc(f.label)} · ISBN ${esc(f.isbn)}${f.pages ? ` · ${f.pages} pages` : ''} · ${esc(f.price_display)}</p>`).join('')}`;
module.exports = {
  author: {
    slug: a.slug, name: a.anzeige, dates: a.lebensdaten,
    eyebrow: 'GREEN SERIES · AETERNUS', tagline: '', intro: '',
    metaDescription: b.kurzbeschreibung[0], brandOnly: true,
    portrait: {modern: true, file: 'author-charles-edward-callwell', alt: a.portraet_legende},
    publisherPortrait: '/assets/images/' + a.portraet,
    publisherPortraitCaption: a.portraet_legende,
    publisherAuthorHTML: paras(a.bio_absaetze), publisherEditionHTML: editionHTML,
    publisherAuthorSource: 'CEC_001/08_SOCIAL_WEB_EN/WEBSITE_20261017/WEBSEITE_TEXTE.json', blocks: []
  },
  book: {
    id, work_id: 'CEC_001', language: 'en', title: b.titel, subtitle: b.untertitel,
    author: a.slug, authorName: a.anzeige, contributors: [], series: 'gruen', series_number: null,
    original_title: b.titel, original_publication_year: 1920,
    isbn: {paperback: formats[0].isbn, hardcover: formats[1].isbn, ebook: formats[2].isbn},
    formats: {paperback: formats[0], hardcover: formats[1], ebook: formats[2]},
    description: {short: b.kurzbeschreibung[0], long: [...b.blurb, b.schluss].join('\n\n')},
    cover: '/assets/images/' + b.umschlag.replace('.webp', '-fallback.jpg'),
    coverWebp: '/assets/images/' + b.umschlag,
    backcover: '/assets/images/' + b.rueckseite,
    backcoverWebp: '/assets/images/' + b.rueckseite.replace('-fallback.jpg', '.webp'),
    publication_date: source.erscheinen, pricing: {}, availability: 'COMING_SOON',
    links: {shop: null, amazon: null, ingram: null},
    distribution_status: {own_shop: 'NOT_CONFIGURED', amazon: 'UNKNOWN', ingram: 'UNKNOWN'},
    commerce: {shopify_product_id: null, shopify_handle: null},
    url: `/books/${id}/`, authorUrl: `/authors/${a.slug}/`,
    seriesName: 'Green Series', seriesColor: '#2d4a22', series_line: b.reihe,
    legacy: {modal: {metadata: b.reihe, sample: b.kurzbeschreibung[0]}},
    retailer_formats: formats,
    publisherDescriptionHTML: `<h3>${esc(b.kicker)}</h3>${paras([...b.blurb, b.schluss])}<ul>${b.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul><p>First published: ${esc(b.erstausgabe)}</p>`,
    forthcoming_label: status, cardStatus: status, brandOnly: true,
    provenance: 'CEC_001/08_SOCIAL_WEB_EN/WEBSITE_20261017/WEBSEITE_TEXTE.json'
  }
};
