// One-off image optimization for the AETERNUS site.
// Generates AVIF/WebP (and an optimized fallback where the source is huge)
// next to the originals in src/assets/images/. NOT part of the Eleventy build —
// run manually after adding/changing source images:  npm run optimize:images
//
// Rationale: pre-generating committed derivatives keeps the Netlify build free
// of native image deps and makes output fully predictable.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "assets", "images");
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);

async function gen(srcName, outputs) {
  const src = path.join(DIR, srcName);
  const meta = await sharp(src).metadata();
  console.log(
    `\n${srcName}: ${meta.width}x${meta.height} ${meta.format} alpha=${meta.hasAlpha} (${kb(src)} KB)`
  );
  for (const o of outputs) {
    const out = path.join(DIR, o.name);
    let pipe = sharp(src);
    if (o.resize) pipe = pipe.resize(o.resize);
    if (o.avif) pipe = pipe.avif(o.avif);
    else if (o.webp) pipe = pipe.webp(o.webp);
    else if (o.jpeg) pipe = pipe.jpeg(o.jpeg);
    else if (o.png) pipe = pipe.png(o.png);
    await pipe.toFile(out);
    console.log(`  -> ${o.name}: ${kb(out)} KB`);
  }
}

(async () => {
  // Hero (LCP) — photo, no alpha. Keep original .jpg as fallback (also used as og:image).
  await gen("hero-library.jpg", [
    { name: "hero-library.avif", avif: { quality: 52, effort: 4 } },
    { name: "hero-library.webp", webp: { quality: 78 } },
  ]);

  // Featured cover — the 3.2 MB offender. Generate modern formats + an optimized JPEG fallback.
  await gen("book-hunted.png", [
    { name: "book-hunted.avif", avif: { quality: 55, effort: 4 } },
    { name: "book-hunted.webp", webp: { quality: 80 } },
    { name: "book-hunted-fallback.jpg", jpeg: { quality: 84, mozjpeg: true } },
  ]);

  // NOTE: the logo is no longer rasterized here. It ships as logo.svg, copied
  // byte-identical from the frozen master in
  // 99_SYSTEM/DESIGN_SYSTEM/assets/logo/MASTER_SVG/ (see LOGO_REGISTRY.json).
  // The only raster derived from it is apple-touch-icon.png — see scripts/make-icons.js.

  // Seton-Edition covers (Band I + II) — front-cover crops from the final KDP wraps.
  await gen("cover-wilde-tiere.png", [
    { name: "cover-wilde-tiere.avif", avif: { quality: 55, effort: 4 } },
    { name: "cover-wilde-tiere.webp", webp: { quality: 80 } },
    { name: "cover-wilde-tiere-fallback.jpg", jpeg: { quality: 84, mozjpeg: true } },
  ]);
  await gen("cover-wahb.png", [
    { name: "cover-wahb.avif", avif: { quality: 55, effort: 4 } },
    { name: "cover-wahb.webp", webp: { quality: 80 } },
    { name: "cover-wahb-fallback.jpg", jpeg: { quality: 84, mozjpeg: true } },
  ]);

  // Band IV Tierhelden — Quelle: finales KDP-Ebook-Cover (1600x2560),
  // auf 1024px Breite normiert wie Band I/II.
  await gen("cover-tierhelden.jpg", [
    { name: "cover-tierhelden.avif", resize: { width: 1024 }, avif: { quality: 55, effort: 4 } },
    { name: "cover-tierhelden.webp", resize: { width: 1024 }, webp: { quality: 80 } },
    { name: "cover-tierhelden-fallback.jpg", resize: { width: 1024 }, jpeg: { quality: 84, mozjpeg: true } },
  ]);

  // Henry Ford, Mein Leben und Werk — finales Cover, auf 1024px Breite normiert.
  await gen("cover-ford.png", [
    { name: "cover-ford.avif", resize: { width: 1024 }, avif: { quality: 55, effort: 4 } },
    { name: "cover-ford.webp", resize: { width: 1024 }, webp: { quality: 80 } },
    { name: "cover-ford-fallback.jpg", resize: { width: 1024 }, jpeg: { quality: 84, mozjpeg: true } },
  ]);

  // Hintergrundgrafik der Editionsseite — dekorativ, daher kleiner und staerker komprimiert.
  await gen("edition-book.png", [
    { name: "edition-book.avif", resize: { width: 900 }, avif: { quality: 50, effort: 4 } },
    { name: "edition-book.webp", resize: { width: 900 }, webp: { quality: 76 } },
    { name: "edition-book-fallback.jpg", resize: { width: 900 }, jpeg: { quality: 82, mozjpeg: true } },
  ]);

  // Autorenportraets Bird und Seton. Bird lag als 3,4-MB-JPEG ohne moderne
  // Formate im Auslieferungspfad. Seitenverhaeltnis bleibt erhalten - der
  // Zuschnitt macht erst die CSS-Regel object-fit:cover.
  await gen("portrait-bird.jpg", [
    { name: "portrait-bird.avif", resize: { width: 900, withoutEnlargement: true }, avif: { quality: 55, effort: 6 } },
    { name: "portrait-bird.webp", resize: { width: 900, withoutEnlargement: true }, webp: { quality: 80 } },
  ]);
  await gen("portrait-seton.jpg", [
    { name: "portrait-seton.avif", resize: { width: 900, withoutEnlargement: true }, avif: { quality: 55, effort: 6 } },
    { name: "portrait-seton.webp", resize: { width: 900, withoutEnlargement: true }, webp: { quality: 80 } },
  ]);

  // Social-Vorschaubild des Waldteufels: 1200x630 JPEG statt 1,7-MB-PNG.
  await gen("waldteufel-og.png", [
    { name: "waldteufel-og.jpg", resize: { width: 1200, height: 630, fit: "cover" }, jpeg: { quality: 84, mozjpeg: true } },
  ]);

  // Band I Anthrazit, Der Waldteufel - Quelle 1707x2560, auf 1024px normiert
  // wie die Bernstein-Baende. Der frueher mitgelieferte "-fallback" war eine
  // unveraenderte Kopie der Quelle.
  await gen("cover-waldteufel.jpg", [
    { name: "cover-waldteufel.avif", resize: { width: 1024 }, avif: { quality: 55, effort: 4 } },
    { name: "cover-waldteufel.webp", resize: { width: 1024 }, webp: { quality: 80 } },
    { name: "cover-waldteufel-fallback.jpg", resize: { width: 1024 }, jpeg: { quality: 84, mozjpeg: true } },
  ]);

  // Stimmungsbilder der sechs Reihen-Landingpages (/reihen/{slug}/). Gemeinfreie
  // historische Gemaelde, thematisch auf die jeweilige Reihe abgestimmt; Quellen
  // und Bildnachweis stehen im seriesItems[].mood-Objekt in i18n.js. Auf 1920px
  // normiert wie hero-library.jpg, da sie denselben vollflaechigen Hero-Einsatz
  // (opacity .55-.7 hinter einer dunklen Wäsche) bedienen.
  await gen("mood-anthrazit.jpg", [
    { name: "mood-anthrazit.avif", resize: { width: 1920 }, avif: { quality: 52, effort: 4 } },
    { name: "mood-anthrazit.webp", resize: { width: 1920 }, webp: { quality: 78 } },
    { name: "mood-anthrazit-fallback.jpg", resize: { width: 1920 }, jpeg: { quality: 82, mozjpeg: true } },
  ]);
  await gen("mood-gruen.jpg", [
    { name: "mood-gruen.avif", resize: { width: 1920 }, avif: { quality: 52, effort: 4 } },
    { name: "mood-gruen.webp", resize: { width: 1920 }, webp: { quality: 78 } },
    { name: "mood-gruen-fallback.jpg", resize: { width: 1920 }, jpeg: { quality: 82, mozjpeg: true } },
  ]);
  await gen("mood-rot.jpg", [
    { name: "mood-rot.avif", resize: { width: 1920, withoutEnlargement: true }, avif: { quality: 52, effort: 4 } },
    { name: "mood-rot.webp", resize: { width: 1920, withoutEnlargement: true }, webp: { quality: 78 } },
    { name: "mood-rot-fallback.jpg", resize: { width: 1920, withoutEnlargement: true }, jpeg: { quality: 82, mozjpeg: true } },
  ]);
  await gen("mood-blau.jpg", [
    { name: "mood-blau.avif", resize: { width: 1920 }, avif: { quality: 52, effort: 4 } },
    { name: "mood-blau.webp", resize: { width: 1920 }, webp: { quality: 78 } },
    { name: "mood-blau-fallback.jpg", resize: { width: 1920 }, jpeg: { quality: 82, mozjpeg: true } },
  ]);
  await gen("mood-bernstein.jpg", [
    { name: "mood-bernstein.avif", resize: { width: 1920 }, avif: { quality: 52, effort: 4 } },
    { name: "mood-bernstein.webp", resize: { width: 1920 }, webp: { quality: 78 } },
    { name: "mood-bernstein-fallback.jpg", resize: { width: 1920 }, jpeg: { quality: 82, mozjpeg: true } },
  ]);
  await gen("mood-weiss.jpg", [
    { name: "mood-weiss.avif", resize: { width: 1920, withoutEnlargement: true }, avif: { quality: 52, effort: 4 } },
    { name: "mood-weiss.webp", resize: { width: 1920, withoutEnlargement: true }, webp: { quality: 78 } },
    { name: "mood-weiss-fallback.jpg", resize: { width: 1920, withoutEnlargement: true }, jpeg: { quality: 82, mozjpeg: true } },
  ]);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
