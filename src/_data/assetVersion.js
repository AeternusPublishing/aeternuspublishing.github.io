// Cache-Busting für die Stylesheets.
//
// GitHub Pages liefert CSS mit `Cache-Control: max-age=600` aus. Weil die
// Stylesheets bisher ohne Version verlinkt waren, sahen wiederkehrende
// Besucher nach einer Änderung weiter das alte CSS — genau das ist am
// 2026-07-26 beim Footer-Abstand passiert: die Regel war live, im Browser
// aber noch die zwischengespeicherte Fassung.
//
// Der Hash hängt am Dateiinhalt: ändert sich das CSS, ändert sich die URL und
// der Browser lädt zwingend neu. Bleibt das CSS gleich, bleibt die URL gleich
// und der Cache greift weiter wie gewünscht.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const CSS_DIR = path.join(__dirname, "..", "assets", "css");

function hash(datei) {
  const p = path.join(CSS_DIR, datei);
  try {
    return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 10);
  } catch (e) {
    // Fail-soft: ohne Hash bleibt der Link funktionsfähig, nur ohne Busting.
    console.warn(`[assetVersion] ${datei} nicht lesbar (${e.message}) — Link ohne Version.`);
    return null;
  }
}

module.exports = () => ({
  style: hash("style.css"),
  fonts: hash("fonts.css"),
});
