// Wave 4 (22.11.2026): nightly watch of both live sites.
// Publisher decision: decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122.
// Reads only. Checks: every page and same-host asset answers 200; every printed QR target leads to a live page;
// the deployed commit (build-info.json) is not older than main by more than a day; every ISBN that the house
// register marks LIVE appears on the site of its language. Writes STAND.json and a dated report; new findings
// (compared with the previous run) go to the inbox COORDINATION/CODEX_TO_CLAUDE as one note.
// Usage: node scripts/watch-live.cjs [--no-register] [--out <dir>] [--max-pages N]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const COORD = 'C:/AETERNUS/00_BETRIEBSDATEN/COORDINATION';
const outDir = opt('--out', path.join(COORD, 'WEBSITE_WAECHTER'));
const inbox = path.join(COORD, 'CODEX_TO_CLAUDE');
const MAX_PAGES = Number(opt('--max-pages', 900));
const LAG_HOURS = 24;
const UA = 'AETERNUS-site-watch/1.0';
const SITES = [
  { id: 'de', base: 'https://aeternus-verlag.de', lang: 'de' },
  { id: 'en', base: 'https://aeternuspublishing.com', lang: 'en' },
];

const findings = [];
const finding = (kind, site, detail) => findings.push({ kind, site, detail });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url, method = 'GET') {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
      const body = method === 'GET' && /text|json|xml/.test(res.headers.get('content-type') || '') ? await res.text() : '';
      if (res.status >= 500 && attempt === 0) { await sleep(3000); continue; }
      return { status: res.status, url: res.url, body };
    } catch (e) {
      if (attempt === 1) return { status: 0, url, body: '', error: e.message };
      await sleep(3000);
    }
  }
}

async function pool(items, size, fn) {
  const queue = [...items]; const workers = [];
  for (let i = 0; i < size; i++) workers.push((async () => { while (queue.length) await fn(queue.shift()); })());
  await Promise.all(workers);
}

async function crawl(site) {
  const origin = new URL(site.base).origin;
  const seen = new Set(['/']); const queue = ['/']; const assets = new Set(); const pages = new Map();
  while (queue.length && pages.size < MAX_PAGES) {
    const batch = queue.splice(0, 6);
    await Promise.all(batch.map(async route => {
      const r = await get(origin + route);
      pages.set(route, r);
      if (r.status !== 200) { finding('page_not_200', site.id, `${route} -> ${r.status}${r.error ? ' ' + r.error : ''}`); return; }
      if (new URL(r.url).origin !== origin) return;
      for (const m of r.body.matchAll(/\s(href|src)="([^"#]+)"/g)) {
        let u; try { u = new URL(m[2].replaceAll('&amp;', '&'), origin + route); } catch { continue; }
        if (u.origin !== origin) continue;
        const p = u.pathname;
        if (p.startsWith('/cdn-cgi/')) continue; // Cloudflare's own e-mail protection, not part of the site
        if (/\.(png|jpe?g|webp|avif|gif|svg|ico|css|js|woff2?|pdf|xml|json|webmanifest|txt)$/i.test(p)) assets.add(p);
        else if (m[1] === 'href' && !seen.has(p)) { seen.add(p); queue.push(p); }
      }
    }));
    await sleep(200);
  }
  if (queue.length) finding('crawl_limit', site.id, `${queue.length} pages not visited (limit ${MAX_PAGES})`);
  await pool([...assets], 6, async p => {
    const r = await get(origin + p, 'HEAD');
    if (r.status === 405 || r.status === 403) { const g = await get(origin + p); if (g.status !== 200) finding('asset_not_200', site.id, `${p} -> ${g.status}`); }
    else if (r.status !== 200) finding('asset_not_200', site.id, `${p} -> ${r.status}`);
  });
  return { pages, assets };
}

function isbnsIn(text) {
  const found = new Set();
  for (const m of text.matchAll(/97[89](?:[-\s\u2011]?\d){10}/g)) found.add(m[0].replace(/\D/g, ''));
  return found;
}

function git(...a) { const r = spawnSync('git', a, { cwd: root, encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : null; }

async function checkDeployLag(site) {
  const r = await get(`${site.base}/build-info.json`);
  if (r.status !== 200) { finding('build_info_missing', site.id, `/build-info.json -> ${r.status}`); return null; }
  let info; try { info = JSON.parse(r.body); } catch { finding('build_info_invalid', site.id, r.body.slice(0, 80)); return null; }
  git('fetch', '-q', 'origin', 'main');
  const head = git('rev-parse', 'origin/main');
  if (!head || !info.commit) return info;
  if (head.startsWith(info.commit) || info.commit.startsWith(head)) return info;
  const pending = (git('log', '--format=%ct %h %s', `${info.commit}..origin/main`) || '').split('\n').filter(Boolean);
  if (!pending.length) return info;
  const oldest = Math.min(...pending.map(l => Number(l.split(' ')[0])));
  const hours = Math.round((Date.now() / 1000 - oldest) / 3600);
  if (hours > LAG_HOURS) finding('deploy_lag', site.id, `${pending.length} commits on main not live, oldest ${hours} h (live ${info.commit.slice(0, 7)}, main ${head.slice(0, 7)})`);
  return info;
}

async function checkQr(de) {
  const qrRoutes = [...de.pages.keys()].filter(r => /^\/qr\/.+\/$/.test(r));
  // Every QR page of the committed DE build (public/qr/**/index.html), also those no page links to.
  const walkQr = dir => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walkQr(path.join(dir, d.name)) : d.name === 'index.html' ? [dir] : []) : [];
  for (const dir of walkQr(path.join(root, 'public/qr'))) {
    const route = '/' + path.relative(path.join(root, 'public'), dir).split(path.sep).join('/') + '/';
    if (!qrRoutes.includes(route)) qrRoutes.push(route);
  }
  await pool(qrRoutes, 4, async route => {
    const page = de.pages.get(route) || await get('https://aeternus-verlag.de' + route);
    if (page.status !== 200) { finding('qr_page_not_200', 'de', `${route} -> ${page.status}`); return; }
    const target = page.body.match(/http-equiv="refresh" content="[^;]+;\s*url=([^" ]+)/i)?.[1];
    if (!target) return; // landing page, crawled like every page
    const t = await get(new URL(target.replaceAll('&amp;', '&'), 'https://aeternus-verlag.de' + route).href);
    if (t.status !== 200) finding('qr_target_not_200', 'de', `${route} -> ${target.split('?')[0]} -> ${t.status}`);
  });
  return qrRoutes.length;
}

function registerLive() {
  const wrapper = 'C:/AETERNUS/00_BETRIEBSDATEN/WERKZEUG/aeternus.py';
  const q = "SELECT werk_kanon,sprache,produktform,isbn13,status,stand_utc FROM zeilen WHERE isbn13 IS NOT NULL AND isbn13<>'' AND status IN ('LIVE','ZURUECKGEZOGEN') ORDER BY stand_utc";
  const r = spawnSync('python', [wrapper, 'buchregister', 'abfrage', q], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('register query failed: ' + (r.stderr || '').slice(0, 300));
  const last = new Map();
  for (const row of JSON.parse(r.stdout)) last.set(row.isbn13.replace(/\D/g, ''), row);
  return [...last.entries()].filter(([, row]) => row.status === 'LIVE');
}

(async () => {
  const started = new Date();
  const crawled = {}; const deploy = {};
  for (const site of SITES) {
    crawled[site.id] = await crawl(site);
    deploy[site.id] = await checkDeployLag(site);
  }
  const qrCount = await checkQr(crawled.de);
  let registerCount = null;
  if (!args.includes('--no-register')) {
    try {
      const live = registerLive(); registerCount = live.length;
      const onSite = {};
      for (const site of SITES) { onSite[site.lang] = new Set(); for (const p of crawled[site.id].pages.values()) for (const i of isbnsIn(p.body || '')) onSite[site.lang].add(i); }
      for (const [isbn, row] of live) {
        const lang = row.sprache === 'de' ? 'de' : 'en';
        if (!['de', 'en'].includes(row.sprache)) continue;
        if (!onSite[lang].has(isbn)) finding('register_live_not_on_site', lang, `${row.werk_kanon} ${row.produktform} ${row.isbn13}`);
      }
    } catch (e) { finding('register_unavailable', '-', e.message); }
  }
  const key = f => `${f.kind}|${f.site}|${f.detail.replace(/\d+ h\b/, 'h').replace(/oldest .*$/, '')}`;
  fs.mkdirSync(outDir, { recursive: true });
  const standFile = path.join(outDir, 'STAND.json');
  const previous = fs.existsSync(standFile) ? JSON.parse(fs.readFileSync(standFile, 'utf8')) : null;
  const before = new Set((previous?.findings || []).map(key));
  const fresh = findings.filter(f => !before.has(key(f)));
  const resolved = (previous?.findings || []).filter(f => !findings.some(n => key(n) === key(f)));
  const stand = {
    schema: 'AETERNUS_WEBSITE_WAECHTER_V1', utc: started.toISOString(), seconds: Math.round((Date.now() - started) / 1000),
    authority: 'decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122',
    status: findings.length ? 'BEFUNDE' : 'GRUEN',
    counts: { de_pages: crawled.de.pages.size, de_assets: crawled.de.assets.size, en_pages: crawled.en.pages.size, en_assets: crawled.en.assets.size, qr_routes: qrCount, register_live_isbns: registerCount },
    deployed: deploy, findings, new_since_last_run: fresh, resolved_since_last_run: resolved,
  };
  fs.writeFileSync(standFile, JSON.stringify(stand, null, 1) + '\n');
  fs.writeFileSync(path.join(outDir, `BERICHT_${started.toISOString().slice(0, 10)}.json`), JSON.stringify(stand, null, 1) + '\n');
  if (fresh.length && !args.includes('--no-inbox')) {
    const stamp = started.toISOString().replace(/[-:]/g, '').slice(0, 13) + 'Z';
    const byKind = fresh.reduce((m, f) => ((m[f.kind] ||= []).push(`${f.site}: ${f.detail}`), m), {});
    const lines = [`# Website-Waechter: ${fresh.length} neue Befunde (${started.toISOString().slice(0, 10)})`, '',
      `Stand: ${standFile.replaceAll('\\', '/')}. Alle Befunde: ${findings.length}, behoben seit letztem Lauf: ${resolved.length}.`, '',
      ...Object.entries(byKind).flatMap(([k, v]) => [`## ${k} (${v.length})`, ...v.slice(0, 40).map(x => `- ${x}`), ...(v.length > 40 ? [`- … ${v.length - 40} weitere im Stand`] : []), '']),
      'Nur lesend erhoben. Kein Befund ist eine Freigabe; Behebung nur auf dem ueblichen Weg (PR, Gate, Vorschau, Verlegerwort).'];
    fs.writeFileSync(path.join(inbox, `${stamp}__website_waechter_befunde.md`), lines.join('\n') + '\n');
  }
  console.log(JSON.stringify({ status: stand.status, counts: stand.counts, findings: findings.length, new: fresh.length, resolved: resolved.length }, null, 1));
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
