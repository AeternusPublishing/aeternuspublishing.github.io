// Re-bind reviewed English cover identities after a register cover sync.
// Usage: node scripts/rebind-cover-identities.cjs docs/evidence/EN_COVER_SYNC_<date>.json
// Only books listed in the sync evidence are touched; their front_url and asset hashes are
// replaced by the synced files, and the previous binding is kept under `previous_cover_binding`.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const identitiesFile = path.join(root, 'docs/evidence/BOOK_EDITION_IDENTITIES_20261020.json');
const sync = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
const catalog = require('../catalog/index.cjs');
const identities = JSON.parse(fs.readFileSync(identitiesFile, 'utf8'));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const synced = new Set(sync.sources.map(s => s.id));
let changed = 0;
for (const page of identities.pages.filter(p => p.site === 'en' && synced.has(p.id))) {
  const book = catalog.englishBooks.find(b => b.id === page.id);
  if (!book || book.cover === page.front_url) continue;
  const files = [...new Set(['cover', 'coverWebp', 'backcover', 'backcoverWebp'].filter(k => book[k]).map(k => 'src' + book[k]))];
  page.previous_cover_binding = { front_url: page.front_url, assets: page.assets };
  page.front_url = book.cover;
  page.assets = files.map(file => ({ path: file, sha256: sha(file) }));
  page.cover_rebind = { date: sync.date, evidence: `docs/evidence/EN_COVER_SYNC_${sync.date}.json`, reason: 'Same artwork, rendered from the hash-verified print cover recorded in the Buchregister (or the KDP package).' };
  changed++;
}
fs.writeFileSync(identitiesFile, JSON.stringify(identities, null, 2) + '\n');
console.log(JSON.stringify({ rebound: changed }));
