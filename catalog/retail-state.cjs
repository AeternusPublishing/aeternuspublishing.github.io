// Website read model only: publication observations do not release production files.
// The newest snapshot written by scripts/export-retail-state.cjs (from the Buchregister) is authoritative.
const fs = require('fs');
const snapshotFile = fs.readdirSync(__dirname).filter(f => /^retail-state-\d{8}\.json$/.test(f)).sort().pop();
const snapshot = require('./' + snapshotFile);
const isbn = value => String(value || '').replace(/[^0-9X]/g, '');
const token = url => String(url || '').match(/\/(?:dp|gp\/product)\/([A-Z0-9]+)/)?.[1];
const hyphenate = d => d.length === 13 ? `${d.slice(0, 3)}-${d.slice(3, 4)}-${d.slice(4, 9)}-${d.slice(9, 12)}-${d.slice(12)}` : d;
function toIsbn10(d13) {
  if (!/^978\d{10}$/.test(d13)) return null;
  const core = d13.slice(3, 12);
  const sum = [...core].reduce((s, c, i) => s + Number(c) * (10 - i), 0);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? 'X' : String(check));
}
// Buying routes for one LIVE format. Amazon defaults to amazon.com; the page script switches the
// marketplace (US/UK/CA/AU). A direct /dp/ link is used only for a verified listing, otherwise an
// ISBN search, which every marketplace answers.
function buyRoutes(format, kdp) {
  const d13 = isbn(format.isbn);
  const ebook = /kindle|e-book/i.test(format.label);
  const d10 = toIsbn10(d13);
  const directLink = (format.links || []).find(link => link.url.startsWith('https://www.amazon.com/'));
  const directAsin = directLink ? token(directLink.url)
    : kdp?.asin && snapshot.verified_asins.includes(kdp.asin) ? kdp.asin
    : d10 && snapshot.verified_asins.includes(d10) ? d10 : null;
  if (ebook && !directAsin) return null;
  return {
    isbn13: d13,
    asin: directAsin,
    amazon: directAsin ? `https://www.amazon.com/dp/${directAsin}` : `https://www.amazon.com/s?k=${d13}&i=stripbooks`,
    others: ebook ? [] : [
      { label: 'Bookshop.org', url: `https://bookshop.org/search?keywords=${d13}` },
      { label: 'Barnes & Noble', url: `https://www.barnesandnoble.com/s/${d13}` }
    ]
  };
}
// One public name per format, each once, always in the order paperback, hardcover, ebook.
const FORMAT_ORDER = ['Paperback', 'Hardcover', 'Kindle', 'E-book'];
const formatName = label => /kindle/i.test(label) ? 'Kindle' : /e-?book/i.test(label) ? 'E-book' : /hard/i.test(label) ? 'Hardcover' : /paper/i.test(label) ? 'Paperback' : label;
const formatList = labels => [...new Set(labels.map(formatName))].sort((x, y) => FORMAT_ORDER.indexOf(x) - FORMAT_ORDER.indexOf(y)).join(', ');
const usd = row => row && row.preis_waehrung === 'USD' && row.preis_betrag ? `US$${row.preis_betrag.toFixed(2)}` : null;

// Internal production words never reach a public page.
const INTERNAL = /IngramSpark|eProof|approval|\bKDP\b|submitted|uploaded|Freigabe/i;
function publicWording(book) {
  if (book.forthcoming_label && INTERNAL.test(book.forthcoming_label)) book.forthcoming_label = 'Coming soon';
  if (book.cardStatus && INTERNAL.test(book.cardStatus)) book.cardStatus = book.availability === 'AVAILABLE' ? 'Available now' : 'Coming soon';
  // "Forthcoming" and "Coming soon" were both in use; the site says "Coming soon".
  for (const key of ['cardStatus', 'status_line', 'forthcoming_label']) {
    const m = typeof book[key] === 'string' && book[key].match(/^Forthcoming(?: in ([a-z ,]+?))?\.?$/i);
    if (m) book[key] = m[1] ? `Coming soon · ${formatList(m[1].split(/,\s*|\s+and\s+/))}` : 'Coming soon';
  }
  // Every card states its availability; records without a status line get the public default.
  if (!book.cardStatus) book.cardStatus = book.availability === 'AVAILABLE' ? 'Available now' : (book.forthcoming_label || 'Coming soon');
  if (book.status_line && INTERNAL.test(book.status_line)) book.status_line = book.availability === 'AVAILABLE' ? 'Available now' : 'Coming soon';
  if (book.availabilityNote && INTERNAL.test(book.availabilityNote)) delete book.availabilityNote;
  for (const format of book.retailer_formats || []) if (format.availability_note && INTERNAL.test(format.availability_note)) format.availability_note = 'Coming soon';
  // "624 book pages · 626 pages in the Ingram editions": the reader sees the printed page count only.
  const modal = book.legacy?.modal;
  if (modal?.metadata) {
    modal.metadata = modal.metadata
      .replace(/\b\d+ (?:book |print )?pages · (\d+) pages in the Ingram editions?\b/g, '$1 pages')
      .replace(/ · forthcoming\b/g, book.availability === 'AVAILABLE' ? '' : ' · coming soon');
  }
}
// Editions recorded without formats (e.g. Roberts, Forty-One Years in India) take their ISBNs from LIVE register rows.
function formatsFromRegister(book) {
  if ((book.retailer_formats || []).length || !book.work_id) return;
  const volume = (book.id.match(/-volume-(i{1,3}|iv|v)$/) || [])[1];
  const kanon = volume ? `${book.work_id}_BAND_${volume.toUpperCase()}` : book.work_id;
  const rows = snapshot.records.filter(r => r.werk_kanon === kanon && r.produktform !== 'ebook');
  const pick = form => rows.find(r => r.produktform === form && r.plattform === 'INGRAM') || rows.find(r => r.produktform === form);
  book.retailer_formats = [['taschenbuch', 'Paperback'], ['hardcover', 'Hardcover']]
    .filter(([form]) => pick(form)).map(([form, label]) => ({ label, isbn: pick(form).isbn13, links: [] }));
}
// Platform suffixes ("Paperback · IngramSpark") are internal; one card per ISBN, the LIVE one first.
function tidyFormats(book) {
  for (const format of book.retailer_formats || []) {
    const suffix = (format.label || '').match(/\s·\s(IngramSpark|Ingram|Amazon|KDP)$/);
    if (!suffix) continue;
    format.platform ||= /Ingram/.test(suffix[1]) ? 'Ingram' : 'KDP';
    format.label = format.label.slice(0, suffix.index);
  }
}
function dedupeFormats(book) {
  const byIsbn = new Map();
  for (const format of book.retailer_formats || []) {
    const key = isbn(format.isbn) || format.label;
    const kept = byIsbn.get(key);
    if (!kept || (format.status === 'LIVE' && kept.status !== 'LIVE')) byIsbn.set(key, format);
  }
  if (book.retailer_formats) book.retailer_formats = [...byIsbn.values()];
}

function apply(books) {
  for (const book of books) {
    formatsFromRegister(book);
    tidyFormats(book);
    applyOne(book);
    dedupeFormats(book);
    publicWording(book);
  }
}
function applyOne(book) {
  {
    const available = [];
    let amazonLive = false, ingramLive = false;
    for (const format of book.retailer_formats || []) {
      if (!format.isbn) continue;
      if (/^\d{13}$/.test(isbn(format.isbn))) format.isbn = hyphenate(isbn(format.isbn));
      // One price style everywhere ("US$24.99"), whatever wording the legacy record used.
      const legacyPrice = String(format.price_display || '').match(/\$\s?(\d+(?:\.\d{2})?)/);
      if (legacyPrice) format.price_display = `US$${Number(legacyPrice[1]).toFixed(2)}`;
      const platform = /Ingram/i.test(format.platform || format.label) ? 'INGRAM' : /(?:KDP|Amazon)/i.test(format.platform || format.label) ? 'KDP' : null;
      const observations = snapshot.records.filter(row => isbn(row.isbn13) === isbn(format.isbn) && row.status === 'LIVE' && (!platform || row.plattform === platform));
      if (!observations.length) continue;
      const kdp = observations.find(row => row.plattform === 'KDP');
      const ingram = observations.find(row => row.plattform === 'INGRAM');
      amazonLive ||= Boolean(kdp);
      ingramLive ||= Boolean(ingram);
      format.status = 'LIVE';
      format.availability = 'AVAILABLE';
      available.push(format.label);
      // Keep a specifically observed broken listing out of every buying surface.
      format.links = (format.links || []).filter(link => !snapshot.unavailable_asins.includes(token(link.url)));
      if (kdp?.asin && !snapshot.unavailable_asins.includes(kdp.asin) && !format.links.length) {
        if (snapshot.verified_asins.includes(kdp.asin)) format.links = [{ label: 'United States', url: `https://www.amazon.com/dp/${kdp.asin}` }];
      }
      const row = format.links.length && kdp ? kdp : (ingram || kdp);
      if (row.seitenzahl && row.produktform !== 'ebook') format.pages = row.seitenzahl;
      const price = usd(ingram) || usd(kdp);
      if (price) format.price_display = price;
      format.buy = buyRoutes(format, kdp);
      if (format.buy || format.links.length) delete format.availability_note;
      else format.availability_note = 'Published edition · retailer link under verification.';
      const key = { Paperback: 'paperback', Hardcover: 'hardcover', Kindle: 'ebook', 'Kindle eBook': 'ebook', 'E-Book': 'ebook' }[format.label];
      if (key) book.formats[key] = { ...book.formats[key], ...format };
    }
    if (!available.length) return;
    const future = book.publication_date && book.publication_date > snapshot.captured_date && book.availability !== 'AVAILABLE';
    if (future) {
      // Distribution enabled before the publisher's release date is not "available now".
      const date = new Date(book.publication_date + 'T00:00:00Z');
      book.availabilityNote = `Publication scheduled for ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)}.`;
      for (const format of book.retailer_formats) if (format.status === 'LIVE') { format.availability_note = book.availabilityNote; delete format.buy; }
      return;
    }
    book.availability = 'AVAILABLE';
    book.distribution_status = { ...book.distribution_status, ...(amazonLive ? { amazon: 'LIVE' } : {}), ...(ingramLive ? { ingram: 'LIVE' } : {}) };
    const visible = available.filter(label => {
      const f = book.retailer_formats.find(format => format.label === label);
      return !f.availability_note?.includes('under verification');
    });
    const labels = formatList(visible.length ? visible : available);
    book.cardStatus = `Available now · ${labels}`;
    book.status_line = 'Available now';
    book.availabilityNote = `Available now: ${labels}.`;
    delete book.forthcoming_label;
    if (book.legacy?.modal) book.legacy.modal.status = book.cardStatus;
    const clearAnnouncement = text => typeof text === 'string' ? text
      .replace(/Submitted to IngramSpark; eProof pending\./g, 'Available through booksellers.')
      .replace(/Submitted to IngramSpark\. The eProof and retail release are pending\./g, 'Available through booksellers.')
      .replace(/Paperback and hardcover submitted to IngramSpark; eProof pending\./g, 'Paperback and hardcover available through booksellers.')
      .replace(/Paperback and hardcover forthcoming/g, 'Paperback and hardcover available through booksellers') : text;
    book.description = { short: clearAnnouncement(book.description.short), long: clearAnnouncement(book.description.long) };
    if (book.publisherDescriptionHTML) book.publisherDescriptionHTML = clearAnnouncement(book.publisherDescriptionHTML);
    if (book.legacy?.modal) for (const key of ['metadata', 'sample', 'summary']) book.legacy.modal[key] = clearAnnouncement(book.legacy.modal[key]);
    const pageCounts = [...new Set(book.retailer_formats.filter(f => f.status === 'LIVE' && f.pages).map(f => f.pages))];
    if (pageCounts.length === 1 && book.legacy?.modal?.metadata) book.legacy.modal.metadata = book.legacy.modal.metadata.replace(/\b\d+ (print|book) pages\b/g, `${pageCounts[0]} $1 pages`);
    const primary = book.retailer_formats.map(format => format.buy?.amazon || (format.links || [])[0]?.url).find(Boolean);
    book.links.amazon = primary || null;
  }
}
module.exports = { apply, snapshotFile };
