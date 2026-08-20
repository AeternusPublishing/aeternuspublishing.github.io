const fs = require('fs'), path = require('path');
const ROOT = 'public';
const SEP = new RegExp('\\\\', 'g');
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(p);
  }
})(ROOT);

const decl = {};   // url -> {lang: url}
for (const p of pages) {
  const u = '/' + path.relative(ROOT, p).replace(SEP, '/').replace(/index\.html$/, '');
  const h = fs.readFileSync(p, 'utf8');
  const alts = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="https:\/\/aeternus-verlag\.de([^"]*)">/g)];
  if (alts.length) decl[u] = Object.fromEntries(alts.map(m => [m[1], m[2]]));
}

const problems = [];
const exists = u => fs.existsSync(path.join(ROOT, u.replace(/^\//, ''), 'index.html'));

for (const [u, alts] of Object.entries(decl)) {
  // 1. jede Ziel-URL muss existieren
  for (const [l, t] of Object.entries(alts)) {
    if (!exists(t)) problems.push(`${u}: hreflang="${l}" zeigt auf nicht existierende Seite ${t}`);
  }
  // 2. Selbstreferenz muss dabei sein
  const self = Object.values(alts).includes(u);
  if (!self) problems.push(`${u}: keine Selbstreferenz in den hreflang-Angaben`);
  // 3. Gegenseitigkeit: jede genannte Seite muss zurueckverweisen
  for (const [l, t] of Object.entries(alts)) {
    if (l === 'x-default' || t === u) continue;
    const back = decl[t];
    if (!back) { problems.push(`${u} -> ${t}: Gegenseite deklariert gar kein hreflang`); continue; }
    if (!Object.values(back).includes(u)) problems.push(`${u} -> ${t}: keine Rueckverweisung`);
    // gleiche Menge?
    const a = Object.keys(alts).filter(x => x !== 'x-default').sort().join(',');
    const b = Object.keys(back).filter(x => x !== 'x-default').sort().join(',');
    if (a !== b) problems.push(`${u} <-> ${t}: unterschiedliche Sprachmengen (${a} vs ${b})`);
  }
  // 4. x-default vorhanden
  if (!alts['x-default']) problems.push(`${u}: kein x-default`);
}

console.log('Seiten mit hreflang: ' + Object.keys(decl).length);
for (const [u, a] of Object.entries(decl)) console.log('  ' + u.padEnd(46) + Object.keys(a).join(' '));
console.log('\nBefunde: ' + (problems.length || 'keine'));
problems.forEach(p => console.log('  ! ' + p));
