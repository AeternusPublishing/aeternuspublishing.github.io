// Read-only house-register query. Only the website snapshot is written.
const fs = require('node:fs');
const {spawnSync} = require('node:child_process');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const wrapper = 'C:/AETERNUS/00_BETRIEBSDATEN/WERKZEUG/aeternus.py';
const target = path.join(root, 'catalog/wilderness-register.snapshot.json');
if (!fs.existsSync(wrapper)) {
  if (!fs.existsSync(target)) throw new Error('Missing wilderness register export');
  console.log('Wilderness register: using versioned export (house register unavailable).');
  process.exit(0);
}
const query = "SELECT werk_kanon,sprache,produktform,isbn13,status,plattform,stand_utc FROM zeilen WHERE werk_kanon LIKE 'ETS_%' OR werk_kanon LIKE 'BP_%' OR werk_kanon LIKE 'RJE_%' OR werk_kanon LIKE 'DCB_%' OR werk_kanon LIKE 'KEP_%' OR werk_kanon LIKE 'WHM%' OR werk_kanon LIKE 'ESW_%' ORDER BY werk_kanon,sprache,produktform,plattform";
const result = spawnSync('python', [wrapper, 'buchregister', 'abfrage', query], {encoding:'utf8', maxBuffer:4*1024*1024});
if (result.status !== 0) throw new Error('House register export failed: '+result.stderr);
const records = JSON.parse(result.stdout);
if (!Array.isArray(records) || !records.length) throw new Error('Empty house register export');
const digest = crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex');
const previous = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target,'utf8')) : null;
if (previous?.records_sha256 !== digest) fs.writeFileSync(target, JSON.stringify({schema:'AETERNUS_WILDERNESS_REGISTER_EXPORT_V1',source:'aeternus.py buchregister abfrage / ARCHIVTAFEL.sqlite zeilen',query,captured_utc:new Date().toISOString(),records_sha256:digest,records},null,2)+'\n');
console.log(JSON.stringify({registerExport:'PASS',records:records.length,live:records.filter(r=>r.status==='LIVE').length,sha256:digest}));
