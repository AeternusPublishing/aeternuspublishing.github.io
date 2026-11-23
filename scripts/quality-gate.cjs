// Wave 4 (22.11.2026): one quality gate for both sites, used by the pull-request check on GitHub
// and by the local English deploy (scripts/deploy-international.cjs).
// Publisher decision: decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122.
// Usage: node scripts/quality-gate.cjs [--skip-build]
// A green gate is a technical result, never a publication approval (CORE-009).
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const node = process.execPath;
const eleventy = path.join(root, 'node_modules/@11ty/eleventy/cmd.cjs');
const prod = { AETERNUS_SITE_MODE: 'production' };

const BUILDS = [
  ['DE build (public/)', 'npm', ['run', 'build']],
  ['EN production build (dist/release, incl. check-english-site)', node, ['scripts/build-international-production.cjs']],
  ['DE build for history check (work/history-de)', node, [eleventy, '--output=work/history-de', '--quiet']],
];
// Blocking: a red result fails the gate and, through the branch rule on main, blocks the merge.
const BLOCKING = [
  ['text', node, ['scripts/check-text.cjs']],
  ['author order', node, ['scripts/check-author-order.cjs']],
  ['author worlds (DE+EN)', node, ['scripts/check-author-worlds.cjs']],
  ['edition languages', node, ['scripts/check-edition-languages.cjs']],
  ['book identities DE', node, ['scripts/check-book-identities.cjs']],
  ['book identities EN', node, ['scripts/check-book-identities.cjs', '--international']],
  ['kosmos', node, ['scripts/check-kosmos.cjs']],
  ['library graph', node, ['scripts/check-library-graph.cjs']],
  ['collections', node, ['scripts/check-collections.cjs']],
  ['green collections EN', node, ['scripts/check-green-collections.cjs'], prod],
  ['international EN', node, ['scripts/check-international.cjs'], prod],
  ['history DE+EN', node, ['scripts/check-history.cjs']],
  ['editorial DE', node, ['scripts/check-editorial.cjs']],
  ['QR targets (printed in books)', node, ['scripts/check-qr-targets.js']],
  ['Heidi live (price confirmed 23.11.)', node, ['scripts/check-heidi-live.cjs']],
  ['quality ratchet', node, ['scripts/check-quality-ratchet.cjs']],
];
// Reported, not blocking: older checks that pin single-book values and need a publisher answer
// or a rewrite first (see docs/evidence/WEB_WELLE4_QUALITAETSGATE_20261122.md).
const ADVISORY = [
  ['pages report', node, ['scripts/check-pages.js']],
  ['hreflang report', node, ['scripts/check-hreflang.js']],
  ['wilderness (old pins)', node, ['scripts/check-wilderness.cjs']],
  ['bird pages (old pins)', node, ['scripts/check-bird-pages.js']],
];

const run = ([name, cmd, args, env]) => {
  const t = Date.now();
  const r = spawnSync(cmd, args, { cwd: root, env: { ...process.env, ...(env || {}) }, encoding: 'utf8', shell: cmd === 'npm', maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
  const ok = r.status === 0;
  const tail = out.split('\n').filter(l => !/^\s+at /.test(l)).slice(-6).join('\n');
  return { name, ok, seconds: Math.round((Date.now() - t) / 1000), tail };
};

const results = { builds: [], blocking: [], advisory: [] };
if (!process.argv.includes('--skip-build')) {
  for (const b of BUILDS) {
    const r = run(b); results.builds.push(r);
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  build  ${r.name} (${r.seconds}s)`);
    if (!r.ok) { console.error(r.tail); process.exit(1); }
  }
}
for (const c of BLOCKING) {
  const r = run(c); results.blocking.push(r);
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  gate   ${r.name}`);
  if (!r.ok) console.error(r.tail.replace(/^/gm, '        '));
}
for (const c of ADVISORY) {
  const r = run(c); results.advisory.push(r);
  console.log(`${r.ok ? 'PASS' : 'WARN'}  info   ${r.name}`);
}
const failed = results.blocking.filter(r => !r.ok).map(r => r.name);
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
fs.writeFileSync(path.join(root, 'work/QUALITY_GATE_RESULT.json'), JSON.stringify({
  schema: 'AETERNUS_WEB_QUALITY_GATE_V1', utc: new Date().toISOString(), status: failed.length ? 'FAIL' : 'PASS', failed,
  advisory_warnings: results.advisory.filter(r => !r.ok).map(r => r.name), results,
}, null, 1) + '\n');
console.log(failed.length ? `\nQUALITY GATE FAIL: ${failed.join(', ')}` : '\nQUALITY GATE PASS (technical result, not a publication approval)');
process.exit(failed.length ? 1 : 0);
