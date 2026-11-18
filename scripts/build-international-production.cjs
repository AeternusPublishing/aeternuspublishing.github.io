const {spawnSync} = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, [path.join(root,'node_modules/@11ty/eleventy/cmd.cjs'), '--config=eleventy.international.cjs', '--output=dist/release', '--quiet'], {
  cwd:root, env:{...process.env,AETERNUS_SITE_MODE:'production'}, stdio:'inherit'
});
if(result.error) throw result.error;
if (result.status === 0) {
  const check = spawnSync(process.execPath, [path.join(root, 'scripts/check-english-site.cjs')], { cwd: root, stdio: 'inherit' });
  if (check.error) throw check.error;
  process.exitCode = check.status ?? 1;
} else process.exitCode = result.status ?? 1;
