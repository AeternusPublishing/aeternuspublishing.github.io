// Website-only overlay: the German catalogue and historic English URLs stay intact.
const snapshot = require('./english-register.snapshot.json');
const additions = require('./english-additions.json');
const key = title => title.toLowerCase().replace(/\([^)]*\)/g, '').split(':')[0].replace(/[^a-z0-9]/g, '');
const slug = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
module.exports = function populate(books, authors, series, clean) {
  for (const data of additions) {
    const author = authors.find(a => a.slug === data.author);
    const line = series.find(s => s.id === 'bernstein');
    const id = `en-${data.author}-${slug(data.title)}`;
    const text = clean(data.description.replace(/<\/p>/g, '</p> '));
    books.push({id, language:'en', title:data.title, subtitle:data.subtitle,
      author:author.slug, authorName:author.name, contributors:[], series:line.id,
      series_number:null, original_title:null, original_publication_year:null,
      isbn:{hardcover:null,paperback:null,ebook:null}, formats:{hardcover:null,paperback:null,ebook:null},
      description:{short:text.split(/(?<=\.)\s/).slice(0,3).join(' '),long:text}, cover:null,
      publication_date:null, pricing:{EUR:null,USD:null,GBP:null,CAD:null,AUD:null},
      availability:'COMING_SOON', links:{shop:null,amazon:null,ingram:null},
      distribution_status:{own_shop:'NOT_CONFIGURED',amazon:'UNKNOWN',ingram:'UNKNOWN',other:{}},
      commerce:{shopify_product_id:null,shopify_handle:null},url:`/books/${id}/`,authorUrl:`/authors/${author.slug}/`,
      seriesName:line.name.en,seriesColor:line.color,legacy:{modal:{sample:text,metadata:'AETERNUS · English-language edition'}},provenance:data.provenance,work_id:data.work_id});
  }
  for (const book of books) {
    const rows = snapshot.records.filter(r => (book.work_id ? r.work_id === book.work_id : key(r.title) === key(book.title)));
    book.retailer_formats = (book.legacy.formats || []).map(f => ({label:f.name,isbn:f.isbn,price_display:f.price,links:f.links || []}));
    if (rows.length) {
      book.work_id = rows[0].work_id;
      book.availability = rows.some(r => r.status === 'LIVE') ? 'AVAILABLE' : 'COMING_SOON';
      for (const row of rows) {
        const format = row.format.split('_').at(-1);
        if (!['hardcover','paperback','ebook'].includes(format)) continue;
        if (row.isbn) book.isbn[format] = row.isbn;
        const label = {hardcover:'Hardcover',paperback:'Paperback',ebook:'Kindle'}[format];
        const prior = book.retailer_formats.find(f => f.label === label);
        // Retailer net values in the register are not public consumer prices.
        const display = prior?.price_display || (/USD$/.test(row.price || '') ? `US list price $${row.price.split(' ')[0]}` : null);
        book.formats[format] = {label,price_display:display,availability:row.status === 'LIVE' ? 'AVAILABLE' : 'COMING_SOON'};
        if (!prior) {
          const domains = format === 'hardcover' ? [['United States','com'],['United Kingdom','co.uk'],['Canada','ca']] : [['United States','com'],['United Kingdom','co.uk'],['Australia','com.au'],['Canada','ca']];
          const links = row.status === 'LIVE' && row.asin ? domains.map(([label,domain])=>({label,url:`https://www.amazon.${domain}/dp/${row.asin}`})) : [];
          book.retailer_formats.push({label,isbn:row.isbn,price_display:display,links,status:row.status});
        }
      }
      book.distribution_status.amazon = rows.some(r=>r.format.startsWith('kdp_')&&r.status==='LIVE') ? 'LIVE' : 'PENDING';
      book.distribution_status.ingram = rows.some(r=>r.format.startsWith('ingram_')&&r.status==='LIVE') ? 'LIVE' : 'UNKNOWN';
    }
    // Public retailer listing observed after the register snapshot. Regional
    // purchasing restrictions remain the retailer's decision; do not claim stock.
    if (book.work_id === 'CBB_001') {
      const kindle = book.retailer_formats.find(f=>f.label==='Kindle');
      kindle.links = [{label:'United States — listing',url:'https://www.amazon.com/dp/B0HKMTDRHJ'}];
      book.publication_date = '2026-09-22';
      book.distribution_status.amazon = 'LISTED_REGIONAL_AVAILABILITY';
      book.retailer_observation = {url:kindle.links[0].url,observed_date:'2026-09-22',publisher:'AETERNUS',isbn:'978-3676050975',note:'Public Kindle listing; buying availability varies by region.'};
    }
    const amazon = book.retailer_formats.flatMap(f=>f.links).find(l=>l.url.startsWith('https://www.amazon.com/'));
    book.links.amazon = amazon?.url || null;
    book.retailer_formats = book.retailer_formats.filter(f => f.links.length || f.isbn);
  }
};
