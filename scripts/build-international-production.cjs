const {spawnSync} = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, [path.join(root,'node_modules/@11ty/eleventy/cmd.cjs'), '--config=eleventy.international.cjs', '--output=dist/release', '--quiet'], {
  cwd:root, env:{...process.env,AETERNUS_SITE_MODE:'production'}, stdio:'inherit'
});
if(result.error) throw result.error;
process.exitCode = result.status ?? 1;
