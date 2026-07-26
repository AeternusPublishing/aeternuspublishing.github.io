// Generate the apple-touch-icon from the vector signet.
// iOS ignores SVG favicons, so this one raster icon has to exist — but it is
// DERIVED from src/assets/images/favicon.svg, never hand-made, so it can never
// drift from the frozen logo master.
// Source of truth: 99_SYSTEM/DESIGN_SYSTEM/assets/logo/ (see LOGO_REGISTRY.json).
// Run: npm run icons
const sharp = require("sharp");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "assets", "images");
const SRC = path.join(DIR, "favicon.svg");
const OUT = path.join(DIR, "apple-touch-icon.png");
const SIZE = 180;   // apple-touch-icon baseline
const INNER = 124;  // signet size inside the square = keeps the protection zone
const BG = "#161311"; // house dark; iOS composites touch icons on an opaque tile

(async () => {
  const signet = await sharp(SRC, { density: 600 })
    .resize({ width: INNER, fit: "inside" })
    .png()
    .toBuffer();
  const m = await sharp(signet).metadata();

  await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: BG } })
    .composite([{
      input: signet,
      left: Math.round((SIZE - m.width) / 2),
      top: Math.round((SIZE - m.height) / 2),
    }])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  const out = await sharp(OUT).metadata();
  console.log(`apple-touch-icon.png ${out.width}x${out.height} (signet ${m.width}x${m.height} on ${BG})`);
})().catch((e) => { console.error(e); process.exit(1); });
