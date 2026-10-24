// Shared read model. Existing editorial records are reused, never copied per site.
// No product is created or exported to a commerce provider by this module.
const programme = require('./legacy/programme.cjs');
const authorsDe = require('./legacy/authors-de.cjs');
const authorsEn = require('./legacy/authors-en.cjs');
const german = require('./legacy/catalogue-de.cjs');
const commerce = require('../commerce/markets.json');
const clean = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').trim();
const slug = value => clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const collectionModel = require('./collections.cjs');
const series = programme.seriesItems.map(s => ({
  id: s.slug,
  name: s.colorName,
  label: s.label,
  color: s.colorHex, mood: s.mood, description: s.desc || s.description || {},
  authors: s.authors.map(a => a.slug || a.landingUrl?.de?.split('/')[2]).filter(Boolean)
}));
// Explicit migration manifest: page language is NOT edition language. English
// author pages also advertise German editions. Those are deliberately excluded.
const englishAuthors = new Set(['ernest-thompson-seton', 'robert-montgomery-bird', 'george-washington-sears', 'francis-parkman', 'james-hall', 'daniel-carter-beard', 'henry-rider-haggard', 'richard-jefferies', 'charles-brockden-brown', 'james-b-gillett', 'james-j-hill', 'francis-younghusband', 'robert-louis-stevenson', 'joshua-duke', 'charles-william-wilson', 'grey-owl']);
const englishBooks = authorsEn.filter(a => englishAuthors.has(a.slug)).flatMap(a => a.books.filter(b => !/German (edition|translation)/i.test(b.meta || '')).map(b => {
  // These existing author pages postdate the programme overview; their own
  // explicit series labels are the authority for this migration mapping.
  const additionalSeries = { 'james-hall': 'anthrazit', 'daniel-carter-beard': 'bernstein', 'richard-jefferies': 'bernstein', 'james-b-gillett': 'gruen', 'james-j-hill': 'blau', 'francis-younghusband': 'gruen', 'robert-louis-stevenson': 'bernstein', 'joshua-duke': 'gruen', 'charles-william-wilson': 'gruen', 'grey-owl': 'gruen' };
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
require('./populate-english.cjs')(englishBooks, authorsEn, series, clean);
// Publisher-authorized DCB_001 V2 copy; forthcoming until distribution is observed.
const dcb001 = require('./dcb001-en-20261008.json');
Object.assign(authorsEn.find(a => a.slug === 'daniel-carter-beard'), dcb001.author);
const dcbBook = englishBooks.find(b => b.author === 'daniel-carter-beard');
Object.assign(dcbBook, dcb001.book);
dcbBook.legacy = { ...dcbBook.legacy, modal: { ...dcbBook.legacy.modal, metadata: dcb001.book.metadata, summary: dcb001.book.description.long, status: 'Paperback forthcoming' } };
// Publisher-authorized RLS_001 V4 announcement; Ingram form blocked, no retail links.
Object.assign(englishBooks.find(b => b.id === 'en-robert-louis-stevenson-treasure-island-annotated'), require('./rls001-en-20261008.json'));
// Publisher-authorized WGS_001 V6 announcement; register status GEBAUT, no retail links.
const wgs001 = require('./wgs001-en-20261008.json');
authorsEn.push(wgs001.author);
englishBooks.push(wgs001.book);
// ACD author page (QR target of The Lost World and The White Company); register status GEBAUT, no prices, no retail links.
const acd = require('./acd-en-20261008.json');
const amberRef = englishBooks.find(b => b.series === 'bernstein');
authorsEn.push(acd.author);
englishBooks.push({ ...acd.book, seriesName: amberRef.seriesName, seriesColor: amberRef.seriesColor });
const whiteCompany = require('./acd001-en-20261010.cjs');
englishBooks.push(...whiteCompany.map(book => ({ ...book, seriesName: amberRef.seriesName, seriesColor: amberRef.seriesColor })));
const doyle = authorsEn.find(author => author.slug === 'arthur-conan-doyle');
doyle.intro = 'Arthur Conan Doyle wrote detective stories, historical romances and tales of scientific adventure. The White Company is presented in three illustrated English volumes.';
doyle.publisherEditionHTML = doyle.publisherEditionHTML.replace(
  '<p>Forthcoming, in three volumes</p><p>Doyle’s historical romance of 1891, in the Amber Series.</p>',
  '<p>Three illustrated volumes submitted to IngramSpark. Paperback and hardcover eProofs are pending; retail availability will follow after review.</p><p>Doyle’s historical romance of 1891 follows the company from Beaulieu through France to the Castilian campaign.</p>'
);
// ACD_003 English Ingram V3: submitted 12 October 2026; retail remains forthcoming.
const sirNigel = require('./acd003-en-20261012.json');
const nigelBook = {
  ...sirNigel.book,
  coverWebp: '/assets/images/cover-acd003-en-ingram-v2-20261011.webp',
  seriesName: amberRef.seriesName,
  seriesColor: amberRef.seriesColor,
  distribution_status: { ...sirNigel.book.distribution_status, ingram: 'EINGEREICHT' },
  retailer_formats: sirNigel.book.retailer_formats.map(format => ({ ...format, status: 'EINGEREICHT' })),
  cardStatus: sirNigel.author_page_card.status_nach_dem_einreichen
};
englishBooks.push(nigelBook);
doyle.intro = sirNigel.author_page_intro_vorschlag;
doyle.metaDescription = sirNigel.author_page_meta_description_vorschlag;
doyle.publisherEditionHTML += sirNigel.author_page_edition_block_html.replace('<p>Forthcoming</p>', '<p>Submitted to IngramSpark; eProof pending.</p>');
// COO author page (QR target of The Deerslayer, Part One and Part Two); register status GEBAUT, no prices, no retail links.
const coo001 = require('./coo001-en-20261008.json');
authorsEn.push(coo001.author);
englishBooks.push({ ...coo001.book, seriesName: amberRef.seriesName, seriesColor: amberRef.seriesColor });
// ETA author page (QR target of The Klondike Stampede); register status GEBAUT, no ISBN, no prices, no retail links.
const eta001 = require('./eta001-en-20261008.json');
authorsEn.push(eta001.author);
englishBooks.push(eta001.book);
// Explicitly authorized English announcement; no retail availability claimed.
const tr002 = require('./tr002-en-20261008.json');
const cvft001 = require('./cvft001-en-20261012.json');
authorsEn.push(cvft001.author);
englishBooks.unshift(cvft001.book);
// GA_001: the printed author text and three unreleased hardcover volumes.
const ga001 = require('./ga001-en-20261014.cjs');
authorsEn.push(ga001.author);
englishBooks.unshift(...ga001.books);
authorsEn.push(tr002.author);
englishBooks.unshift(tr002.book);
// NAJ_001 V8: publisher-approved author and book pages; print editions forthcoming.
const naj001 = require('./naj001-en-20261009.cjs');
authorsEn.push(naj001.author);
englishBooks.unshift(naj001.book);
// GRG_001 author page is the English edition's verified QR destination.
authorsEn.push(require('./grg001-author-20261010.cjs'));
authorsEn.find(author => author.slug === 'george-robert-gleig').hideEditions = false;
englishBooks.unshift(require('./grg001-en-20261012.json'));
// HDH_001: approved English QR author page and submitted Ingram editions.
const hdh001 = require('./hdh001-en-20261012.json');
const greenRef = englishBooks.find(book => book.series === 'gruen');
const escapeHdh = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hdhHead = hdh001.author_page.kopfzeilen.map(line => `<p>${escapeHdh(line)}</p>`).join('');
const hdhBody = hdh001.author_page.text_absaetze.map(line => `<p>${escapeHdh(line)}</p>`).join('');
authorsEn.push({
  slug: hdh001.author_slug,
  name: hdh001.author_page.name,
  dates: '1847–1924',
  eyebrow: 'GREEN SERIES · AETERNUS',
  tagline: hdh001.author_page.kopfzeilen[4],
  intro: hdh001.author_page.text_absaetze[0],
  metaDescription: hdh001.author_page.meta_description_vorschlag,
  portrait: { modern: false },
  brandOnly: true,
  publisherAuthorHTML: hdhHead + hdhBody,
  publisherAuthorSource: 'HDH_001/04_PARATEXT/PARATEXT_V8/08_ABOUT_THE_AUTHOR'
});
englishBooks.push({
  ...hdh001.book,
  coverWebp: '/assets/images/cover-hdh001-en-ingram-v4-20261012.webp',
  seriesName: greenRef.seriesName,
  seriesColor: greenRef.seriesColor,
  press_quote: hdh001.press_quote,
  cardStatus: 'Submitted to IngramSpark; eProof pending.',
  forthcoming_label: 'Submitted to IngramSpark; eProof pending.'
});
// Publisher 12 October: replace the earlier Haggard web editions and show Live.
const haggardRecords = require('./haggard-en-20261012.json');
for (let i = englishBooks.length - 1; i >= 0; i--) {
  if (englishBooks[i].author === 'henry-rider-haggard') englishBooks.splice(i, 1);
}
englishBooks.push(...haggardRecords.map(r => ({ ...r.book, seriesName: amberRef.seriesName, seriesColor: amberRef.seriesColor })));
const haggardAuthor = authorsEn.find(a => a.slug === 'henry-rider-haggard');
Object.assign(haggardAuthor, {
  brand: 'AETERNUS', eyebrow: 'AMBER SERIES · AETERNUS', preview: false,
  previewStatus: '', facts: [['Series', 'AMBER SERIES'], ['Editions', 'Five English editions'], ['Formats', 'Paperback · Hardcover · E-Book'], ['Status', 'Live']],
  worksTitle: 'Five journeys beyond the known world', worksIntro: '',
  metaDescription: 'H. Rider Haggard at AETERNUS: King Solomon’s Mines, Allan Quatermain, Nada the Lily, She and Ayesha in five English editions.',
  publisherEditionHTML: haggardRecords.map(r => r.author_page_edition_block_html || '').join('')
});
// JJH_001: existing live KDP titles; publisher-approved V8 edition details.
const hill = require('./jjh001-en-20261012.json');
const hillBook = englishBooks.find(book => book.author === 'james-j-hill');
Object.assign(hillBook, {
  work_id: hill.work_id, availability: 'AVAILABLE',
  retailer_formats: hill.formats, publisherDescriptionHTML: hill.description_html,
  links: { ...hillBook.links, amazon: hill.formats[0].links[0].url },
  distribution_status: { ...hillBook.distribution_status, amazon: 'LIVE' }
});
hillBook.legacy = { ...hillBook.legacy, modal: { ...hillBook.legacy.modal, metadata: 'AETERNUS · Blue Series · 310 print pages', status: 'Available in paperback, hardcover and Kindle' } };
const hillAuthor = authorsEn.find(author => author.slug === 'james-j-hill');
hillAuthor.publisherEditionHTML = '<h2>Highways of Progress</h2><div class="actions">' + hill.formats.map(format => `<a class="button ink-button" href="${format.links[0].url}" target="_blank" rel="noopener noreferrer">${format.label} on Amazon</a>`).join('') + '</div><p>Print edition · 310 pages</p>' + hill.description_html;

// FP_005: hash-released Ingram print editions; no retail links before LIVE.
const fp005 = require('./fp005-en-20261016.json');
englishBooks.push(fp005);
// FP_001 V7: publisher-authorized announcement; retailer links wait for observed LIVE.
englishBooks.push(require('./fp001-en-20261024.json'));
const parkmanAuthor = authorsEn.find(author => author.slug === 'francis-parkman');
parkmanAuthor.brandOnly = true;
parkmanAuthor.publisherEditionHTML = (parkmanAuthor.publisherEditionHTML || '') + "<h2>The Discovery of the Great West</h2><p>The Text of the First Edition, 1869</p><p>France and England in North America · Part Third</p><p>ANTHRACITE SERIES · AETERNUS</p><p>Forthcoming in paperback and hardcover.</p><blockquote><p>“We should own to having found in this one the charm of a romance.”</p><cite>The Atlantic Monthly, 1870</cite></blockquote><p>Before the wagon roads, before the frontier towns and before the rails, the great western road of New France into the heart of North America ran by water.</p><p>From the St. Lawrence and Great Lakes, French explorers, missionaries, soldiers and traders pushed toward the Illinois country and the Mississippi. At the center of Francis Parkman’s narrative stands René-Robert Cavelier, Sieur de La Salle — visionary, relentless, repeatedly ruined and repeatedly beginning again.</p><p>In 1682 La Salle followed the Mississippi to the Gulf and claimed the river country for Louis XIV. Behind that act stood a still greater conception: forts, trade, alliances and a continental French axis joining Canada to the sea.</p><p>Published in 1869 as Part Third of France and England in North America, The Discovery of the Great West is Parkman at his grandest: documentary history with the breadth and movement of epic adventure.</p><p>This is WESTWARD before the Republic — the continent opening by river.</p><ul><li>Complete text of the first edition of 1869, checked against the page</li><li>Parkman’s notes, preface, introduction and both appendices</li><li>19 paintings by George Catlin of La Salle’s voyages (1847–1848)</li><li>The map of the first edition, from Franquelin’s manuscript map</li><li>Publisher’s foreword, afterword, chronology, glossary; author portrait</li></ul><p>First published: Little, Brown, and Company, Boston, 1869</p><p>Paperback · ISBN 978-3-67605-104-0 · 456 pages · US list price $18.99</p><p>Hardcover · ISBN 978-3-67605-105-7 · 456 pages · US list price $29.99</p>";

const wr001 = require('./wr001-en-20261017.cjs');
authorsEn.push(wr001.author);
englishBooks.push(wr001.book);

// CEC_001: publisher-authorized website announcement; no buying links before LIVE.
const cec001 = require('./cec001-en-20261018.cjs');
authorsEn.push(cec001.author);
englishBooks.push(cec001.book);

const cjm001 = require('./cjm001-en-20261018.json');
authorsEn.push(cjm001.author);
englishBooks.push(cjm001.book);

// BP_009: add the forthcoming book to the existing QR author page.
englishBooks.push(require('./bp009-en-20261019.cjs'));
authorsEn.find(author => author.slug === 'robert-baden-powell').brandOnly = true;
Object.assign(authorsEn.find(author => author.slug === 'robert-baden-powell'), {
  tagline: 'British general and founder of the Boy Scouts.',
  intro: 'Robert Baden-Powell founded the Boy Scouts and became the first Chief Scout of the worldwide Scout movement. Before turning to youth education, he had made his name as a highly decorated British army officer, serving in India and Africa and rising to lieutenant-general.',
  metaDescription: 'Robert Baden-Powell: decorated British general, founder of the Boy Scouts, and author. His military career, Scouting for Boys, and links with Seton and Beard.',
  relatedAuthors: [
    { name: 'Ernest Thompson Seton', slug: 'ernest-thompson-seton' },
    { name: 'Daniel Carter Beard', slug: 'daniel-carter-beard' }
  ]
});

englishBooks.push(require('./bp002-en-20261020.cjs'));

const gjy001 = require('./gjy001-en-20261021.json');
authorsEn.push(gjy001.author);
englishBooks.push(gjy001.book);

const ih001 = require('./ih001-en-20261022.json');
authorsEn.push(ih001.author);
englishBooks.push(...ih001.books);

// EAP_001: commissioned English author world; buying links await observed LIVE.
const eap001 = require('./eap001-en-20261022.json');
authorsEn.push(eap001.author);
englishBooks.push(eap001.book);

// RMB_001: publisher-requested web sync while the END_V5 update is in review.
const rmb001 = englishBooks.find(book => book.id === 'en-robert-montgomery-bird-edition-nick');
Object.assign(rmb001, require('./rmb001-en-20261023.json'));
rmb001.legacy = { ...rmb001.legacy, modal: { ...rmb001.legacy.modal, metadata: 'AETERNUS · English · 440 print pages · Kindle, paperback & hardcover', sample: rmb001.blurb.at(-1) } };
for (const format of rmb001.retailer_formats) {
  if (format.label !== 'Kindle') format.pages = 440;
  if (format.label === 'Paperback') format.price_display = 'US list price $19.99';
}
rmb001.formats.paperback.price_display = 'US list price $19.99';

const fsr001 = require('./fsr001-en-20261024.cjs');
authorsEn.push(fsr001.author);
englishBooks.push(...fsr001.books);

// Publisher-authorized author page only; no book products.
authorsEn.push(require('./cmm-author-draft-20261024.cjs'));

const collectionArchitecture = collectionModel.bind(englishBooks, german.books, series);

function directShopUrl(book, language, settings = commerce) {
  if (!settings.enabled || book.availability !== 'AVAILABLE' || !book.commerce?.shopify_product_id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.commerce?.shopify_handle || '')) return null;
  const domain = settings.domains[language === 'de' ? 'de' : 'en'];
  return `https://${domain}/products/${book.commerce.shopify_handle}`;
}
module.exports = { programme, authorsDe, authorsEn, german, series, collectionArchitecture, englishBooks, clean, directShopUrl };
