const fs = require('fs'), path = require('path');
const ROOT = 'public';
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(p);
  }
})(ROOT);
const SEP = new RegExp('\\\\', 'g');
const url = p => '/' + path.relative(ROOT, p).replace(SEP, '/').replace(/index\.html$/, '');
const out = [];
const add = (sev, p, msg) => out.push({ sev, page: url(p), msg });

for (const p of pages) {
  const h = fs.readFileSync(p, 'utf8');
  const u = url(p);
  const isAuthor = /^\/(autoren|en\/authors|es\/autores|pl\/autorzy)\//.test(u);

  // Weiterleitungsstummel (/qr/...) sind absichtlich noindex und zeigen mit
  // canonical und lang auf ihr Ziel, nicht auf sich selbst. Die beiden
  // Regeln unten wuerden dort systematisch falschen Alarm schlagen - und ein
  // Pruefskript, das immer meckert, wird nicht mehr gelesen.
  const isRedirectStub =
    /<meta name="robots" content="noindex/.test(h) &&
    /<meta http-equiv="refresh"/.test(h);

  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { add('HOCH', p, 'JSON-LD kaputt: ' + e.message.slice(0, 60)); }
  }
  const bm = h.match(/window\.AETERNUS_BOOKS=(\[[\s\S]*?\]);/);
  if (bm) { try { eval('(' + bm[1] + ')'); } catch (e) { add('HOCH', p, 'AETERNUS_BOOKS nicht parsebar: ' + e.message.slice(0, 60)); } }

  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dup = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
  if (dup.length) add('HOCH', p, 'doppelte id: ' + dup.join(', '));

  const canM = h.match(/<link rel="canonical" href="https:\/\/aeternus-verlag\.de([^"]*)"/);
  if (!canM) add('MITTEL', p, 'kein canonical');
  else if (canM[1] !== u && !isRedirectStub) add('HOCH', p, 'canonical zeigt woanders hin: ' + canM[1] + ' statt ' + u);

  const lang = (h.match(/<html lang="([^"]*)"/) || [])[1];
  const expect = u.startsWith('/en/') ? 'en' : u.startsWith('/es/') ? 'es' : u.startsWith('/pl/') ? 'pl' : 'de';
  if (lang !== expect && !isRedirectStub) add('HOCH', p, 'lang="' + lang + '" erwartet "' + expect + '"');

  if (isAuthor && !/hreflang/.test(h)) add('MITTEL', p, 'kein hreflang trotz mehrsprachiger Entsprechung');

  for (const m of h.matchAll(/<img (?![^>]*\balt=)[^>]*>/g)) add('MITTEL', p, 'img ohne alt: ' + m[0].slice(0, 60));

  if (!/og:image/.test(h) && !/noindex/.test(h)) add('NIEDRIG', p, 'kein og:image');

  if (isAuthor) {
    const hasLabel = /class="language"/.test(h);
    const other = (h.match(/href="\/(en\/authors|autoren|es\/autores|pl\/autorzy)\//g) || []).length;
    if (hasLabel && other === 0) add('MITTEL', p, 'Sprachanzeige ohne Umschaltmoeglichkeit');
  }
}

const rank = { HOCH: 0, MITTEL: 1, NIEDRIG: 2 };
out.sort((a, b) => rank[a.sev] - rank[b.sev]);
const agg = {};
for (const o of out) {
  const k = o.sev + ' | ' + o.msg.replace(/:.*/, '');
  (agg[k] = agg[k] || []).push(o.page);
}
console.log('Seiten geprueft: ' + pages.length + '\n');
for (const [k, v] of Object.entries(agg)) {
  console.log(k + '  (' + v.length + ')');
  console.log('   ' + v.slice(0, 10).join('\n   ') + (v.length > 10 ? '\n   ...' : ''));
}
if (!out.length) console.log('keine Befunde');
