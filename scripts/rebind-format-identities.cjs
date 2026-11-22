// Re-bind reviewed English product forms after the wave-1 buy box (22.11.2026).
// The public page shows one card per ISBN and keeps the platform (Amazon, IngramSpark, KDP)
// out of the label. Bound forms that differ only by that suffix are merged per ISBN: tokens and
// register evidence are united, nothing is invented. Forms without any binding (Roberts I/II)
// are bound from the LIVE rows of the register snapshot catalog/retail-state-<date>.json.
// The previous binding stays under `previous_format_binding`. ISBNs are never changed here.
// Usage: node scripts/rebind-format-identities.cjs 20261122
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const date = process.argv[2];
const identitiesFile = path.join(root, 'docs/evidence/BOOK_EDITION_IDENTITIES_20261020.json');
const identities = JSON.parse(fs.readFileSync(identitiesFile, 'utf8'));
const register = JSON.parse(fs.readFileSync(path.join(root, `catalog/retail-state-${date}.json`), 'utf8'));
const rows = register.records;
const catalog = require('../catalog/index.cjs');
const normal = v => String(v || '').replace(/[^0-9X]/g, '');
const isbn10 = isbn13 => {
  const core = normal(isbn13).slice(3, 12);
  const sum = [...core].reduce((s, c, i) => s + Number(c) * (10 - i), 0);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? 'X' : String(check));
};
const formOf = label => /kindle|e-?book/i.test(label) ? 'ebook' : /hardcover/i.test(label) ? 'hardcover' : 'taschenbuch';
const uniq = list => [...new Map(list.map(x => [JSON.stringify(x), x])).values()];
const report = [];
for (const page of identities.pages.filter(p => p.site === 'en')) {
  const book = catalog.englishBooks.find(b => b.id === page.id);
  if (!book) continue;
  const current = book.retailer_formats || book.formats || [];
  const same = current.length === page.formats.length && current.every(f => page.formats.some(e => e.label === (f.label || f.name) && e.isbn13 === (normal(f.isbn) || null)));
  if (same) continue;
  const next = current.map(f => {
    const label = f.label || f.name;
    const isbn13 = normal(f.isbn) || null;
    const productform = formOf(label);
    const bound = page.formats.filter(e => e.productform === productform && e.isbn13 === isbn13);
    let evidence = bound.flatMap(e => e.register_evidence);
    if (!bound.length) {
      const row = rows.find(r => normal(r.isbn13) === isbn13 && r.produktform === productform && r.status === 'LIVE');
      if (!row) throw new Error(page.id + ': no LIVE register row for ' + label + ' ' + isbn13);
      evidence = [{ werk_kanon: row.werk_kanon, sprache: 'en', produktform: row.produktform, titel: row.titel, isbn13: row.isbn13, isbn10: isbn10(row.isbn13), asin: row.asin, zeile_id: row.zeile_id, version: row.version }];
    }
    return { label, isbn13, productform, tokens: [...new Set(bound.flatMap(e => e.tokens))], register_evidence: uniq(evidence) };
  });
  const before = new Set(page.formats.map(e => e.isbn13 + '|' + e.productform));
  const after = new Set(next.map(e => e.isbn13 + '|' + e.productform));
  const added = [...after].filter(x => !before.has(x));
  const lost = [...before].filter(x => !after.has(x));
  if (lost.length) throw new Error(page.id + ': bound form would be lost: ' + lost.join(', '));
  page.previous_format_binding = page.formats;
  page.formats = next;
  page.format_rebind = { date, evidence: `catalog/retail-state-${date}.json`, reason: added.length ? 'Forms bound from LIVE register rows; previously a forthcoming preview without product forms.' : 'Platform suffix moved out of the public label; one card per ISBN; tokens and register evidence united, ISBNs unchanged.' };
  report.push({ id: page.id, added });
}
fs.writeFileSync(identitiesFile, JSON.stringify(identities, null, 2) + '\n');
console.log(JSON.stringify({ rebound: report.length, report }, null, 1));
