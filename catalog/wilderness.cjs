const snapshot = require('./wilderness-register.snapshot.json');
const normalize = value => String(value || '').replace(/[^0-9X]/g, '');
const commissioned = ['horace-kephart','william-henry-harrison-murray','warren-hastings-miller','elihu-stewart'];
const pages = [...commissioned, 'richard-jefferies','daniel-carter-beard'];
const american = new Set(['horace-kephart','william-henry-harrison-murray','warren-hastings-miller','daniel-carter-beard']);
const spelling = (text, slug) => american.has(slug) ? text.replace(/\bcentre\b/g,'center').replace(/\bbehaviour\b/g,'behavior').replace(/\btravelling\b/g,'traveling').replace(/\bjudgement\b/g,'judgment') : text.replace(/\bjudgment\b/g,'judgement');
const relevant = id => /^(?:ETS_|BP_|RJE_|DCB_|KEP_|WHM_|WHMILL_|ESW_)/.test(id || '');
function registerRows(book) {
  const isbns = new Set((typeof book.isbn === 'object' ? Object.values(book.isbn) : [book.isbn, ...(book.formats||[]).map(f=>f.isbn)]).filter(Boolean).map(normalize));
  return snapshot.records.filter(r => r.sprache === (book.language || 'de') && (book.work_id ? r.werk_kanon === book.work_id : isbns.has(normalize(r.isbn13))));
}
function live(book) { return registerRows(book).some(r=>r.status==='LIVE'); }
// Bibliographic years and thematic comparisons only; product identities stay in index.cjs.
const bibliography = require('./wilderness-context.json');
function further(slug, english, german) {
  if (!pages.includes(slug)) return [];
  return [...english, ...german].flatMap(book=>{
    const rows = registerRows(book), work = book.work_id || rows[0]?.werk_kanon;
    const author = book.authorSlug || book.author;
    if (!relevant(work) || author === slug || !rows.some(r=>r.status==='LIVE')) return [];
    const context = bibliography.works[work] || bibliography.authors[author];
    if (!context) throw new Error('Missing sourced wilderness context for '+work);
    const year=book.original_publication_year || Number(book.original?.match(/\b(18\d{2}|19\d{2})\b/)?.[0]) || context.year;
    if(!Number.isInteger(year)) throw new Error('Missing source-edition year in catalogue for '+work);
    return [{id:book.id,work_id:work,title:book.title,authorName:book.authorName || book.author,
      year,text:spelling(context.sentence,slug),kind:'thematic-comparison',
      language:book.language || 'de',url:(book.language==='en'?'https://aeternuspublishing.com':'https://aeternus-verlag.de')+book.url,
      sources:context.sources,editorialStatus:'DRAFT_PENDING_BOOK_WINDOW'}];
  });
}
module.exports={commissioned,pages,registerRows,live,further};
