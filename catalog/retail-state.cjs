// Website read model only: publication observations do not release production files.
const snapshot = require('./retail-state-20261118.json');
const isbn = value => String(value || '').replace(/[^0-9X]/g, '');
const token = url => String(url || '').match(/\/(?:dp|gp\/product)\/([A-Z0-9]+)/)?.[1];
function apply(books) {
  for (const book of books) {
    const available = [];
    let amazonLive = false, ingramLive = false;
    for (const format of book.retailer_formats || []) {
      if (!format.isbn) continue;
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
      if (format.links.length) delete format.availability_note;
      else format.availability_note = ingram ? 'Available through booksellers · order using this ISBN.' : 'Published edition · retailer link under verification.';
      const key = { Paperback: 'paperback', Hardcover: 'hardcover', Kindle: 'ebook', 'E-Book': 'ebook' }[format.label];
      if (key) book.formats[key] = { ...book.formats[key], ...format };
    }
    if (!available.length) continue;
    const future = book.publication_date && book.publication_date > snapshot.captured_date && book.availability !== 'AVAILABLE';
    if (future) {
      // Distribution enabled before the publisher's release date is not "available now".
      const date = new Date(book.publication_date + 'T00:00:00Z');
      book.availabilityNote = `Publication scheduled for ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)}.`;
      for (const format of book.retailer_formats) if (format.status === 'LIVE') format.availability_note = book.availabilityNote;
      continue;
    }
    book.availability = 'AVAILABLE';
    book.distribution_status = { ...book.distribution_status, ...(amazonLive ? { amazon: 'LIVE' } : {}), ...(ingramLive ? { ingram: 'LIVE' } : {}) };
    const visible = available.filter(label => {
      const f = book.retailer_formats.find(format => format.label === label);
      return !f.availability_note?.includes('under verification');
    });
    const labels = (visible.length ? visible : available).join(', ');
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
    const primary = book.retailer_formats.flatMap(format => format.links || []).find(link => link.url.startsWith('https://www.amazon.com/'));
    book.links.amazon = primary?.url || null;
  }
}
module.exports = { apply };
