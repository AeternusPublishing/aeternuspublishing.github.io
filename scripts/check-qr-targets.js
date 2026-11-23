const fs = require("fs");
const path = require("path");

const PUBLIC = path.resolve("public");
const QR_ROOT = path.join(PUBLIC, "qr");
const findings = [];
const qrPages = [];
// QR-Ziele, die bewusst eine eigene Landeseite statt einer Weiterleitung sind (Inhalt mit Ueberschrift,
// Ausgaben und Links). Fuer sie gilt: Seite hat eine h1 und jeder interne Link fuehrt auf eine vorhandene Seite.
const LANDING_PAGES = new Set(["grimmelshausen", "sz002"]);

const internalTargetFile = (pathname) => {
  const clean = pathname.split("?")[0].replace(/^\/+/, "");
  return path.join(PUBLIC, clean, clean.endsWith(".html") ? "" : "index.html");
};

if (!fs.existsSync(QR_ROOT)) {
  console.error("QR-Ausgabeordner fehlt: public/qr");
  process.exit(1);
}

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(child);
    else if (entry.name === "index.html") qrPages.push(child);
  }
};
walk(QR_ROOT);

for (const page of qrPages) {
  const route = path.relative(QR_ROOT, path.dirname(page)).replaceAll("\\", "/");

  const html = fs.readFileSync(page, "utf8");
  const refresh = html.match(/http-equiv="refresh" content="[^;]+;\s*url=([^" ]+)/i)?.[1];
  const fallback = html.match(/<body>[\s\S]*?<a href="([^"]+)"/i)?.[1];
  const campaign = html.match(/params\.set\("utm_campaign",\s*"([^"]+)"\)/)?.[1];

  if (LANDING_PAGES.has(route)) {
    if (!/<h1[\s>]/i.test(html)) findings.push(`${route}: Landeseite ohne Ueberschrift`);
    for (const href of html.matchAll(/<a\s[^>]*href="(\/[^"#?]*)/g)) {
      const target = href[1];
      if (/\.(css|js|ico|png|jpg|webp|avif|svg|xml|json|webmanifest)$/i.test(target)) continue;
      if (!fs.existsSync(internalTargetFile(target))) findings.push(`${route}: Link auf fehlendes Ziel ${target}`);
    }
    continue;
  }
  if (!refresh) findings.push(`${route}: Meta-Refresh-Ziel fehlt`);
  if (!fallback) findings.push(`${route}: sichtbarer Fallback-Link fehlt`);
  if (route === "grimm" && campaign !== "grimm") findings.push(`${route}: utm_campaign=grimm fehlt`);

  for (const [kind, target] of [["Meta-Refresh", refresh], ["Fallback-Link", fallback]]) {
    if (!target || !target.startsWith("/")) continue;
    const decoded = target.replaceAll("&amp;", "&");
    const targetFile = internalTargetFile(decoded);
    if (!fs.existsSync(targetFile)) {
      findings.push(`${route}: ${kind} zeigt auf fehlendes Ziel ${decoded.split("?")[0]}`);
    }
  }
}

if (findings.length) {
  console.error("QR-Zielpruefung fehlgeschlagen:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`QR-Ziele geprueft: ${qrPages.length}`);
console.log("keine Befunde");
