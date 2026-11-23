// Wave 4 (22.11.2026): the only way the English site goes live.
// Publisher decision: decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122.
//   node scripts/deploy-international.cjs --preview
//       clean origin/main, full quality gate, Cloudflare preview deployment (URL for the publisher's review)
//   node scripts/deploy-international.cjs --live --freigabe <decision_id>
//       same gate, then production; the decision_id must be in the decision book and name this commit
//       (its short or full hash) or state "build-info" for invisible deploys.
// Builds change tracked files (public/, register snapshot, library graph); they are restored afterwards.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const live = args.includes('--live');
const preview = args.includes('--preview');
const freigabe = args.includes('--freigabe') ? args[args.indexOf('--freigabe') + 1] : null;
const DECISIONS = 'C:/AETERNUS/00_BETRIEBSDATEN/COORDINATION/DECISIONS.ndjson';
if (live === preview) throw new Error('choose exactly one: --preview or --live --freigabe <decision_id>');

const sh = (cmd, a, opts = {}) => {
  const r = spawnSync(cmd, a, { cwd: root, encoding: 'utf8', shell: cmd === 'npx', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${a.join(' ')} failed:\n${(r.stderr || r.stdout || '').slice(-2000)}`);
  return (r.stdout || '').trim();
};
const restore = () => { spawnSync('git', ['checkout', '--', '.'], { cwd: root }); spawnSync('git', ['clean', '-fdq', 'public'], { cwd: root }); };

sh('git', ['fetch', '-q', 'origin', 'main']);
const head = sh('git', ['rev-parse', 'HEAD']);
const main = sh('git', ['rev-parse', 'origin/main']);
if (head !== main) throw new Error(`HEAD ${head.slice(0, 7)} is not origin/main ${main.slice(0, 7)}: check out origin/main first`);
if (sh('git', ['status', '--porcelain'])) throw new Error('working tree not clean');

if (live) {
  if (!/^decision_[a-z0-9_]+$/.test(freigabe || '')) throw new Error('--live needs --freigabe <decision_id>');
  const line = fs.readFileSync(DECISIONS, 'utf8').split('\n').find(l => l.includes(`"decision_id": "${freigabe}"`) || l.includes(`"decision_id":"${freigabe}"`));
  if (!line) throw new Error(`${freigabe} is not in the decision book`);
  if (!line.includes(head.slice(0, 7)) && !line.includes('build-info')) throw new Error(`${freigabe} does not name commit ${head.slice(0, 7)}`);
}

try {
  const gate = spawnSync(process.execPath, ['scripts/quality-gate.cjs'], { cwd: root, stdio: 'inherit' });
  if (gate.status !== 0) throw new Error('quality gate FAIL: nothing deployed');
  const subject = sh('git', ['log', '-1', '--format=%s']);
  fs.writeFileSync(path.join(root, 'dist/release/build-info.json'), JSON.stringify({
    site: 'aeternuspublishing.com', commit: head, built_utc: new Date().toISOString(), gate: 'PASS',
    mode: live ? 'production' : 'preview', ...(live ? { freigabe } : {}),
  }, null, 1) + '\n');
  const out = sh('npx', ['wrangler', 'pages', 'deploy', 'dist/release', '--project-name', 'aeternus-international',
    '--branch', live ? 'main' : 'vorschau', '--commit-hash', head, '--commit-message', JSON.stringify(subject.slice(0, 200)), '--commit-dirty=true'], { maxBuffer: 16 * 1024 * 1024 });
  const url = out.match(/https:\/\/[a-z0-9.-]+\.pages\.dev\S*/i)?.[0];
  console.log(JSON.stringify({ deploy: live ? 'LIVE' : 'PREVIEW', commit: head.slice(0, 7), url, freigabe }, null, 1));
} finally {
  restore();
}
