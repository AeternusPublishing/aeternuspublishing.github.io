const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) pages.push(file);
  }
}
walk('public');
const snapshot = {};
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('/assets/css/author-es.css')) continue;
  const route = '/' + path.relative('public', file).replaceAll(path.sep, '/');
  const sections = [...html.matchAll(/<section class="(hero|works|biography|factbar|bird-editions)"[\s\S]*?<\/section>/g)];
  snapshot[route] = Object.fromEntries(sections.map(([content, type]) => [type, crypto.createHash('sha256').update(content).digest('hex')]));
  if (process.argv[2] === '--record') continue;
  const order = sections.map(s => s[1]);
  assert.equal(order[0], 'hero', route);
  assert.equal(order[1], 'works', route + ': books must immediately follow the introduction');
  assert.equal(order.at(-1), 'biography', route + ': biography must be last');
  const nav = html.match(/<nav class="nav"[\s\S]*?<\/nav>/)[0];
  assert(nav.search(/href="#(?:werke|works|obras|dziela)"/) < nav.search(/href="#bio/), route + ': nav must follow reading order');
}
assert(Object.keys(snapshot).length >= 27, 'Author landing pages missing');
if (process.argv[2] === '--record') {
  fs.writeFileSync(process.argv[3], JSON.stringify(snapshot, null, 2) + '\n');
  console.log('Recorded unchanged-section hashes for ' + Object.keys(snapshot).length + ' author pages');
} else {
  if (process.argv[2]) assert.deepEqual(snapshot, JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), 'Section content changed during reorder');
  console.log('PASS: books first, biography last, matching navigation on ' + Object.keys(snapshot).length + ' author pages' + (process.argv[2] ? '; all section contents byte-identical' : ''));
}
