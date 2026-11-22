// Wave 2 (22.11.2026): author portraits replaced by their digital colourisation.
// Publisher decision: all 23 colourisations approved from the before/after sheets
// (decision_website_en_welle2_kolorierung_23_freigegeben_melliss_scharlach_20261122);
// Melliss follows with a corrected scarlet tunic (V2).
// Source: COORDINATION/CLAUDE_TO_CODEX/WEB_EN_WELLE2_PORTRAET_KOLORIERUNG_20261122, outputs hash-checked
// against AUSGABE/KOLORIERUNG_PRUEFUNG.json. The old binding stays under `previous_image`; no asset is deleted.
// Usage: node scripts/apply-colourised-portraits-20261122.cjs <order-folder> <slug[:version]> ...
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const order = path.resolve(process.argv[2]);
const wanted = process.argv.slice(3);
const decision = 'decision_website_en_welle2_kolorierung_23_freigegeben_melliss_scharlach_20261122';
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
const check = JSON.parse(fs.readFileSync(path.join(order, 'AUSGABE/KOLORIERUNG_PRUEFUNG.json'), 'utf8'));
const checked = new Map();
(function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (node && typeof node === 'object') {
    if (node.ausgabe && node.ausgabe_sha256) checked.set(path.basename(node.ausgabe), node.ausgabe_sha256);
    Object.values(node).forEach(walk);
  }
})(check);
const suffix = { de: 'digital koloriert', en: 'digitally colourised' };
const addSuffix = (text, lang) => {
  const t = String(text).trim();
  const stop = /[.]$/.test(t);
  return `${t.replace(/[.]$/, '')}; ${suffix[lang]}${stop ? '.' : ''}`;
};
(async () => {
  const report = [];
  for (const arg of wanted) {
    const [slug, version = 'V1'] = arg.split(':');
    const srcName = `${slug}_KOLORIERT_${version}.png`;
    const srcFile = path.join(order, 'AUSGABE', srcName);
    const srcBuf = fs.readFileSync(srcFile);
    const expected = checked.get(srcName);
    if (!expected) throw new Error(`${slug}: ${srcName} not in KOLORIERUNG_PRUEFUNG.json`);
    if (sha(srcBuf) !== expected) throw new Error(`${slug}: ${srcName} hash differs from KOLORIERUNG_PRUEFUNG.json`);
    const file = path.join(root, 'editorial/author-worlds/authors', slug + '.json');
    const text = fs.readFileSync(file, 'utf8');
    const profile = JSON.parse(text);
    if (profile.previous_image) throw new Error(`${slug}: previous_image already present`);
    const out = `/assets/images/portrait-${slug}-coloured-20261122.webp`;
    const buf = await sharp(srcBuf).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    fs.writeFileSync(path.join(root, 'src', out), buf);
    const meta = await sharp(buf).metadata();
    const old = profile.image;
    const caption = {};
    for (const [lang, value] of Object.entries(old.caption || {})) caption[lang] = addSuffix(value, lang);
    const image = {
      status: 'publisher-approved',
      file: out,
      ...(old.personName ? { personName: old.personName } : {}),
      caption,
      approval: { date: '2026-11-22', authority: decision, sha256: sha(buf) },
      ...(old.rights ? { rights: old.rights } : {}),
      provenance: `Digital colourisation (GPT image tool, Codex thread web_en_welle2_portraet_kolorierung) of the previously approved portrait ${old.file}${old.provenance ? '; original source: ' + old.provenance : ''}. Colourised master ${srcName} (sha256 ${expected}).`,
      processing: `Colourised master converted to WebP (quality 88, longest side at most 1400 px, ${meta.width}x${meta.height}). Colours are an interpretation, not a record.`,
    };
    // Replace only the "image" block in the text so the rest of the dossier keeps its formatting.
    const start = text.indexOf('\n  "image": {') + 1;
    if (start < 1) throw new Error(slug + ': image block not found');
    let depth = 0, end = -1;
    for (let i = text.indexOf('{', start); i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}' && --depth === 0) { end = i + 1; break; }
    }
    const oldBlock = text.slice(text.indexOf('{', start), end);
    const indent = json => JSON.stringify(json, null, 2).replace(/\n/g, '\n  ');
    const next = text.slice(0, start) + '  "image": ' + indent(image) + ',\n  "previous_image": ' + oldBlock + text.slice(end);
    JSON.parse(next);
    fs.writeFileSync(file, next);
    report.push({ slug, file: out, size: `${meta.width}x${meta.height}`, bytes: buf.length, sha256: sha(buf) });
  }
  console.log(JSON.stringify(report, null, 1));
})().catch(err => { console.error(err.message); process.exit(1); });
