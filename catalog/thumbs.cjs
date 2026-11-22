// Thumbnails for listing pages, shared by the German and the English build.
// `{{ file | thumb(480) }}` returns /assets/thumbs/<name>-<width>.webp and renders it from the
// source image under src/ after the build. Detail pages keep the full image.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

module.exports = function thumbsPlugin(config) {
  const thumbs = new Map();
  config.addFilter('thumb', (file, width = 480) => {
    if (!file || !/\.(jpe?g|png|webp)$/i.test(file)) return file;
    const src = path.join(root, 'src', String(file).replace(/^\//, ''));
    if (!fs.existsSync(src)) return file;
    const out = `/assets/thumbs/${path.basename(file).replace(/\.[^.]+$/, '')}-${width}.webp`;
    thumbs.set(out, { src, width });
    return out;
  });
  config.on('eleventy.after', async ({ dir, directories }) => {
    const output = directories?.output || dir.output;
    const sharp = require('sharp');
    for (const [out, { src, width }] of thumbs) {
      const dest = path.join(output, out);
      if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) continue;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toFile(dest);
    }
  });
};
