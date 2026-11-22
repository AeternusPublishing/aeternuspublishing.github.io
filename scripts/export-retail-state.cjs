#!/usr/bin/env node
// Writes catalog/retail-state-<date>.json from the AETERNUS Buchregister event log.
// An English edition counts as on sale once any LIVE event exists for its ISBN and platform,
// unless the most recent event for that ISBN and platform is ZURUECKGEZOGEN or BLOCKIERT.
// A newer EINGEREICHT/GEBAUT revision of a LIVE ISBN does not take the edition off sale.
// Read only against the register; verified ASIN evidence is carried over from the previous snapshot.
'use strict';
const fs = require('fs');
const path = require('path');

const REGISTER = process.env.AETERNUS_BUCHREGISTER || 'C:/AETERNUS/00_BUCHREGISTER/BUCHREGISTER.ndjson';
const CATALOG = path.join(__dirname, '..', 'catalog');
const date = (process.argv[2] || new Date().toISOString().slice(0, 10));
const OFF_SALE = new Set(['ZURUECKGEZOGEN', 'BLOCKIERT']);
const digits = v => String(v || '').replace(/[^0-9X]/gi, '');
const hyphenate = d => d.length === 13 ? `${d.slice(0, 3)}-${d.slice(3, 4)}-${d.slice(4, 9)}-${d.slice(9, 12)}-${d.slice(12)}` : d;
const form = m => /hardcover|hc/i.test(m) ? 'hardcover' : /ebook/i.test(m) ? 'ebook' : 'taschenbuch';

const readline = require('readline');
(async () => {
const events = [];
// The register is too large for one string; stream it line by line.
for await (const line of readline.createInterface({ input: fs.createReadStream(REGISTER, 'utf8'), crlfDelay: Infinity })) {
  if (!/"sprache":\s*"en"/.test(line)) continue;
  const e = JSON.parse(line);
  if (e.sprache === 'en' && e.isbn && (e.plattform === 'INGRAM' || e.plattform === 'KDP')) events.push(e);
}
const groups = new Map();
for (const e of events) {
  const key = `${digits(e.isbn)}|${e.plattform}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(e);
}
const records = [];
for (const [key, list] of groups) {
  list.sort((a, b) => String(a.utc).localeCompare(String(b.utc)));
  const live = list.filter(e => e.status === 'LIVE');
  if (!live.length) continue;
  const latest = list[list.length - 1];
  if (OFF_SALE.has(latest.status)) continue;
  const last = live[live.length - 1];
  const withPrice = [...list].reverse().find(e => e.preis);
  const withPages = [...list].reverse().find(e => e.seitenzahl);
  const [betrag, waehrung] = String((withPrice || {}).preis || '').split(/\s+/);
  const d = key.split('|')[0];
  records.push({
    zeile_id: `${last.werk_id}|en|${last.manifestation}`,
    werk_kanon: last.werk_id,
    manifestation: last.manifestation,
    isbn13: hyphenate(d),
    asin: [...list].reverse().find(e => e.asin)?.asin || null,
    produktform: form(last.manifestation),
    plattform: last.plattform,
    status: 'LIVE',
    version: last.version,
    stand_utc: last.utc,
    erstmals_live_utc: live[0].utc,
    letzter_registerstatus: latest.status,
    seitenzahl: withPages ? withPages.seitenzahl : null,
    preis_betrag: betrag ? Number(betrag) : null,
    preis_waehrung: waehrung || null,
    titel: last.titel
  });
}
records.sort((a, b) => a.zeile_id.localeCompare(b.zeile_id));

const outName = `retail-state-${date.replace(/-/g, '')}.json`;
const previous = fs.readdirSync(CATALOG).filter(f => /^retail-state-\d{8}\.json$/.test(f) && f !== outName).sort().pop();
const prev = previous ? JSON.parse(fs.readFileSync(path.join(CATALOG, previous), 'utf8')) : {};
// Carry over earlier LIVE rows the event log cannot see: rows backed by explicit evidence
// (historical_evidence, e.g. Scott Vol. II, whose events are keyed under Vol. I) and rows whose ISBN
// has no event in the log at all. A later ZURUECKGEZOGEN/BLOCKIERT for that ISBN still wins.
const seen = new Set(records.map(r => `${digits(r.isbn13)}|${r.plattform}`));
let carried = 0;
for (const r of prev.records || []) {
  const key = `${digits(r.isbn13)}|${r.plattform}`;
  if (seen.has(key) || r.status !== 'LIVE') continue;
  const list = groups.get(key);
  if (list && !r.historical_evidence) continue;
  if (list && OFF_SALE.has(list[list.length - 1].status)) continue;
  records.push({ ...r, uebernommen_aus: previous });
  seen.add(key);
  carried++;
}
records.sort((a, b) => a.zeile_id.localeCompare(b.zeile_id));
if (carried) console.log(`carried over ${carried} evidenced LIVE rows from ${previous}`);
const out = {
  schema: 'AETERNUS_EN_WEBSITE_RETAIL_OBSERVATIONS_V1',
  captured_date: date,
  source: 'scripts/export-retail-state.cjs from BUCHREGISTER.ndjson; English editions matched by exact ISBN; on sale = any LIVE event, not withdrawn',
  verified_asins: prev.verified_asins || [],
  unavailable_asins: prev.unavailable_asins || [],
  retailer_evidence: prev.retailer_evidence || [],
  records
};
const file = path.join(CATALOG, `retail-state-${date.replace(/-/g, '')}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
console.log(`${path.basename(file)}: ${records.length} LIVE rows (previous ${previous || 'none'}: ${(prev.records || []).length})`);
})();
