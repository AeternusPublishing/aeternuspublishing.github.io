// Portrait search (22.11.2026): public-domain portraits for authors who had none.
// Publisher decision: decision_website_portraetsuche_7_autoren_freigegeben_keine_karikaturen_20261122
// (contact sheet PORTRAETSUCHE_BOGEN.jpg; no caricatures). Each source file is hash-checked against
// docs/evidence/PORTRAIT_SEARCH_20261122.json before use. The old binding stays under `previous_image`.
// Usage: node scripts/apply-found-portraits-20261122.cjs <source-folder> [slug ...]
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const srcDir = path.resolve(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/evidence/PORTRAIT_SEARCH_20261122.json'), 'utf8'));
const wanted = process.argv.slice(3);
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
(async () => {
  const report = [];
  for (const entry of manifest.approved) {
    if (wanted.length && !wanted.includes(entry.slug)) continue;
    const srcBuf = fs.readFileSync(path.join(srcDir, entry.source_file));
    if (sha(srcBuf) !== entry.source_sha256) throw new Error(`${entry.slug}: ${entry.source_file} hash differs from manifest`);
    const file = path.join(root, 'editorial/author-worlds/authors', entry.slug + '.json');
    const text = fs.readFileSync(file, 'utf8');
    const profile = JSON.parse(text);
    if (profile.previous_image) throw new Error(`${entry.slug}: previous_image already present`);
    const out = `/assets/images/portrait-${entry.slug}-20261122.webp`;
    const buf = await sharp(srcBuf).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    fs.writeFileSync(path.join(root, 'src', out), buf);
    const meta = await sharp(buf).metadata();
    const src = await sharp(srcBuf).metadata();
    const image = {
      status: 'publisher-approved',
      file: out,
      caption: entry.caption,
      approval: { date: '2026-11-22', authority: manifest.decision, sha256: sha(buf) },
      rights: entry.rights,
      provenance: `${entry.source_url} (retrieved 2026-11-22); ${entry.provenance}`,
      processing: `Source file ${entry.source_file} (sha256 ${entry.source_sha256}, ${src.width}x${src.height}) converted to WebP (quality 88, longest side at most 1400 px, ${meta.width}x${meta.height}). ${entry.processing_note || 'No crop, colouring, retouching or generative change.'}`,
    };
    // Replace only the "image" block in the text so the rest of the dossier keeps its formatting.
    const start = text.indexOf('\n  "image": {') + 1;
    if (start < 1) throw new Error(entry.slug + ': image block not found');
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
    report.push({ slug: entry.slug, file: out, size: `${meta.width}x${meta.height}`, bytes: buf.length, sha256: sha(buf) });
  }
  console.log(JSON.stringify(report, null, 1));
})().catch(err => { console.error(err.message); process.exit(1); });
