// Wave 4 (22.11.2026): quality ratchet for both sites.
// Publisher decision: decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122.
// Every metric is a set of concrete findings (page + detail). Known findings are frozen in
// quality/ratchet-baseline.json; a finding that is not in the baseline fails the gate. Fixed findings
// tighten the baseline with --tighten (only removes entries, never adds).
// Accepting new findings needs a publisher decision: --accept <decision_id> (recorded in the baseline).
// Usage: node scripts/check-quality-ratchet.cjs [--tighten | --accept <decision_id>]
// Needs the DE build in public/ and the EN production build in dist/release.
const fs = require('node:fs');
const path = require('node:path');
const { parseDocument } = require('htmlparser2');
const { findAll, textContent, getAttributeValue } = require('domutils');
const catalog = require('../catalog/index.cjs');
const schema = require('../catalog/schemas/book.schema.json');

const root = path.resolve(__dirname, '..');
const baselineFile = path.join(root, 'quality/ratchet-baseline.json');
const args = process.argv.slice(2);
const tighten = args.includes('--tighten');
const acceptIdx = args.indexOf('--accept');
const accept = acceptIdx >= 0 ? args[acceptIdx + 1] : null;
if (acceptIdx >= 0 && !/^decision_[a-z0-9_]+$/.test(accept || '')) throw new Error('--accept needs a decision_id');

const HEAVY_IMAGE_BYTES = 800 * 1024;
// Case-sensitive on purpose: Spanish "todo" is a word, "TODO" is a leftover.
const PLACEHOLDER = /[Ll]orem ipsum|\b(TODO|TBD|FIXME|PLACEHOLDER|undefined|NaN)\b|\[object Object\]|\{\{|\}\}|\{%|%\}/;
const SITES = [
  { id: 'de', dir: path.join(root, 'public') },
  { id: 'en', dir: path.join(root, 'dist/release') },
];

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d =>
  d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const localFile = (dir, ref) => {
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\/+/, '');
  const direct = path.join(dir, clean);
  if (clean === '' || clean.endsWith('/')) return path.join(direct, 'index.html');
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  return path.join(direct, 'index.html');
};

const metrics = {};
const add = (metric, item) => (metrics[metric] ||= new Set()).add(item);

// 1. Catalogue schema: every English book carries every required field.
for (const book of catalog.englishBooks)
  for (const field of schema.required)
    if (!Object.hasOwn(book, field) || book[field] === undefined) add('schema_gaps', `${book.id}:${field}`);

// 2. Built pages of both sites.
for (const site of SITES) {
  if (!fs.existsSync(site.dir)) throw new Error(`${site.id}: build output missing (${site.dir})`);
  const pages = walk(site.dir).filter(f => f.endsWith('.html'));
  const titles = new Map();
  for (const file of pages) {
    const route = '/' + path.relative(site.dir, file).replaceAll('\\', '/').replace(/index\.html$/, '');
    const html = fs.readFileSync(file, 'utf8');
    const doc = parseDocument(html);
    const isRedirect = /http-equiv="refresh"/i.test(html);
    const els = name => findAll(n => n.name === name, doc.children);
    const metaContent = name => els('meta').find(m => getAttributeValue(m, 'name') === name)?.attribs.content;
    const robots = metaContent('robots') || '';
    for (const el of findAll(n => n.attribs && (n.attribs.href || n.attribs.src), doc.children)) {
      if (el.name === 'link' && /preconnect|dns-prefetch/.test(el.attribs.rel || '')) continue;
      for (const ref of [el.attribs.href, el.attribs.src].filter(Boolean)) {
        if (!ref.startsWith('/') || ref.startsWith('//')) continue;
        if (!fs.existsSync(localFile(site.dir, ref))) add(`${site.id}_broken_local_refs`, `${route} -> ${ref.split(/[?#]/)[0]}`);
      }
    }
    if (isRedirect) continue;
    for (const img of els('img')) {
      if (img.attribs.alt === undefined) add(`${site.id}_img_without_alt`, `${route} ${img.attribs.src || ''}`);
      const src = img.attribs.src || '';
      if (src.startsWith('/') && !src.startsWith('//')) {
        const f = localFile(site.dir, src);
        if (fs.existsSync(f) && fs.statSync(f).size > HEAVY_IMAGE_BYTES) add(`${site.id}_heavy_images`, src.split(/[?#]/)[0]);
      }
    }
    const title = textContent(els('title')).trim();
    if (!title) add(`${site.id}_pages_without_title`, route);
    else if (!/noindex/.test(robots)) titles.set(title, [...(titles.get(title) || []), route]);
    if (!/noindex/.test(robots)) {
      if (!metaContent('description')) add(`${site.id}_pages_without_description`, route);
      if (!els('link').some(l => getAttributeValue(l, 'rel') === 'canonical')) add(`${site.id}_pages_without_canonical`, route);
    }
    const body = els('body')[0];
    if (body) {
      for (const n of findAll(x => x.name === 'script' || x.name === 'style' || x.name === 'noscript', body.children)) n.children = [];
      const text = textContent(body).replace(/\s+/g, ' ');
      const hit = text.match(PLACEHOLDER);
      if (hit) add(`${site.id}_placeholder_text`, `${route} "${hit[0]}"`);
    }
  }
  for (const [title, routes] of titles) if (routes.length > 1) add(`${site.id}_duplicate_titles`, `${title} (${routes.length})`);
}

const current = Object.fromEntries(Object.entries(metrics).map(([k, v]) => [k, [...v].sort()]));
const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : null;
const known = baseline?.metrics || {};
const allMetrics = [...new Set([...Object.keys(current), ...Object.keys(known)])].sort();
const fresh = {}, fixed = {};
for (const m of allMetrics) {
  const now = new Set(current[m] || []), before = new Set(known[m] || []);
  const n = [...now].filter(x => !before.has(x)), f = [...before].filter(x => !now.has(x));
  if (n.length) fresh[m] = n;
  if (f.length) fixed[m] = f;
}
const summary = Object.fromEntries(allMetrics.map(m => [m, `${(current[m] || []).length} (baseline ${(known[m] || []).length})`]));

const write = (metricsOut, note) => {
  fs.mkdirSync(path.dirname(baselineFile), { recursive: true });
  const history = [...(baseline?.history || []), { date: new Date().toISOString().slice(0, 10), note }];
  fs.writeFileSync(baselineFile, JSON.stringify({
    schema: 'AETERNUS_WEB_QUALITY_RATCHET_V1',
    rule: 'Findings may only disappear. A new finding fails the gate unless a publisher decision accepts it (--accept).',
    authority: 'decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122',
    history, metrics: metricsOut,
  }, null, 1) + '\n');
};

if (!baseline || accept) {
  write(current, baseline ? `accepted new findings: ${accept}` : 'initial baseline (state of main at wave 4)');
  console.log(JSON.stringify({ ratchet: baseline ? 'ACCEPTED' : 'BASELINE_CREATED', accept, summary }, null, 1));
  process.exit(0);
}
if (Object.keys(fresh).length) {
  console.error(JSON.stringify({ ratchet: 'FAIL', rule: 'new findings are not allowed', fresh, summary }, null, 1));
  process.exit(1);
}
if (tighten && Object.keys(fixed).length) {
  write(current, `tightened: ${Object.entries(fixed).map(([m, v]) => `${m} -${v.length}`).join(', ')}`);
  console.log(JSON.stringify({ ratchet: 'TIGHTENED', fixed, summary }, null, 1));
  process.exit(0);
}
console.log(JSON.stringify({ ratchet: 'PASS', summary, ...(Object.keys(fixed).length ? { fixed_run_with_tighten: fixed } : {}) }, null, 1));
