// Wave 2 (22.11.2026): seven author pages take the portrait printed on their book cover.
// Publisher decision: decision_website_en_welle2_coverportraets_sieben_roberts_sitzend_gpt_kolorierung_20261122
// ("sehr gut. nur roberts sitzend nehmen." Roberts keeps the seated portrait).
// Source: the cover's print source where it exists, otherwise the portrait window cut from the
// register cover on this site (gold frame excluded). The old binding stays under `previous_image`;
// no asset is deleted.
// Usage: node scripts/apply-cover-portraits-20261122.cjs <crops.json>
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const crops = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
const decision = 'decision_website_en_welle2_coverportraets_sieben_roberts_sitzend_gpt_kolorierung_20261122';
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
const titles = {
  'charles-william-wilson': 'From Korti to Khartum',
  'charles-vere-ferrers-townshend': 'My Campaign in Mesopotamia',
  younghusband: 'The Relief of Chitral',
  'ian-hamilton': 'Gallipoli Diary',
  'charles-metcalfe-macgregor': 'The Life and Opinions',
  'winfield-scott': 'Memoirs of Lieutenant-General Scott',
  'samuel-benfield-steele': 'Forty Years in Canada',
};
// Image class per REDAKTION.md. Scott: the cover image's historical source is not recorded yet.
const colourised = new Set(['charles-william-wilson', 'charles-vere-ferrers-townshend', 'younghusband', 'ian-hamilton', 'charles-metcalfe-macgregor', 'samuel-benfield-steele']);
(async () => {
  const report = [];
  for (const [slug, title] of Object.entries(titles)) {
    const c = crops[slug];
    const file = path.join(root, 'editorial/author-worlds/authors', slug + '.json');
    const profile = JSON.parse(fs.readFileSync(file, 'utf8'));
    const name = profile.image?.personName || profile.name;
    const coverFile = path.join(root, 'src/assets/images', c.cover);
    const input = c.source ? sharp(c.source) : sharp(coverFile).extract({ left: c.box[0], top: c.box[1], width: c.box[2] - c.box[0], height: c.box[3] - c.box[1] });
    const out = `/assets/images/portrait-${slug}-cover-20261122.webp`;
    const buf = await input.resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    fs.writeFileSync(path.join(root, 'src', out), buf);
    const meta = await sharp(buf).metadata();
    const klass = colourised.has(slug);
    profile.previous_image = profile.image;
    profile.image = {
      status: 'publisher-approved',
      file: out,
      ...(profile.previous_image?.personName ? { personName: profile.previous_image.personName } : {}),
      caption: {
        de: `${name}. Porträt vom Umschlag der AETERNUS-Ausgabe „${title}“${klass ? '; digital koloriert' : ''}.`,
        en: `${name}. Portrait from the cover of the AETERNUS edition of ${title}${klass ? '; digitally colourised' : ''}.`,
      },
      approval: { date: '2026-11-22', authority: decision, sha256: sha(buf) },
      rights: 'Historical portrait as printed on the AETERNUS cover; see the cover build of the edition.',
      provenance: c.source
        ? `Cover print source ${c.source.replace(/\\/g, '/')} (sha256 ${c.source_sha256}), same motif as the front cover ${c.cover} (sha256 ${c.cover_sha256}).`
        : `Portrait window of the front cover ${c.cover} (sha256 ${c.cover_sha256}), box ${c.box.join(',')} px, gold frame excluded.`,
      processing: `${c.source ? 'Print source' : 'Cover crop'} converted to WebP (quality 88, longest side at most 1400 px, ${meta.width}x${meta.height}); no colour change or new generation. ${klass ? 'The cover image is a digital colourisation of a historical photograph.' : 'Image class (painting, photograph, colourisation) not yet recorded; see PORTRAET_QUELLEN_OFFEN.json.'}`,
    };
    // Replace only the "image" block in the text so the rest of the dossier keeps its formatting.
    const text = fs.readFileSync(file, 'utf8');
    const start = text.indexOf('\n  "image": {') + 1;
    if (start < 1) throw new Error(slug + ': image block not found');
    let depth = 0, end = -1;
    for (let i = text.indexOf('{', start); i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}' && --depth === 0) { end = i + 1; break; }
    }
    const oldBlock = text.slice(text.indexOf('{', start), end);
    const indent = json => JSON.stringify(json, null, 2).replace(/\n/g, '\n  ');
    const next = text.slice(0, start) + '  "image": ' + indent(profile.image) + ',\n  "previous_image": ' + oldBlock + text.slice(end);
    JSON.parse(next);
    fs.writeFileSync(file, next);
    report.push({ slug, file: out, size: `${meta.width}x${meta.height}`, bytes: buf.length, sha256: sha(buf) });
  }
  console.log(JSON.stringify(report, null, 1));
})();
