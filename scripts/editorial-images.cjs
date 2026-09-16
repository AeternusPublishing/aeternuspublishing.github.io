// Web-only derivatives. Original cover artwork, typography and print data are untouched.
// Default: inspect the plan. --write: generate the responsive website renditions.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const sharp = require("sharp");
const catalogue = require("../src/_data/catalogue");
const input = path.resolve("src/assets/images");
const output = path.resolve("public/assets/editorial");
const covers = [...new Set(catalogue.books.map(b => b.cover))];
const scenes = ["hero-library", "mood-bernstein", "mood-anthrazit", "mood-gruen"];
const digest = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const jobs = covers.flatMap(name => [240,480,720].map(width => ({ name, width, source: name + "-fallback.jpg" })))
  .concat(scenes.map(name => ({ name, width: 800, source: name + ".jpg" })));
(async () => {
  for (const job of jobs) if (!fs.existsSync(path.join(input, job.source))) throw new Error("Missing source: " + job.source);
  if (!process.argv.includes("--write")) { console.log("CHECK: " + jobs.length + " responsive image sizes; originals found; no files changed."); return; }
  fs.mkdirSync(output, { recursive: true });
  const evidence = [];
  for (const job of jobs) {
    const source = path.join(input, job.source), before = digest(source);
    for (const format of ["avif", "webp"]) {
      const destination = path.join(output, job.name + "-" + job.width + "." + format);
      const info = await sharp(source).resize({ width: job.width, withoutEnlargement: true }).toFormat(format, { quality: format === "avif" ? 52 : 80 }).toFile(destination);
      evidence.push({ source: job.source, source_sha256: before, file: path.basename(destination), width: info.width, height: info.height, sha256: digest(destination) });
    }
    if (before !== digest(source)) throw new Error("Original changed: " + job.source);
  }
  fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log("Generated " + evidence.length + " web derivatives; source hashes unchanged.");
})().catch(error => { console.error(error); process.exitCode = 1; });
