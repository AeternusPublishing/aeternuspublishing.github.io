const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const catalogue = require("../src/_data/catalogue");
const sample = require("../src/_data/readingSample.json");
const root = path.resolve("public");
const pages = ["/", "/en/", "/buecher/", "/reihen/", "/verlag/", "/edition/", "/presse/", ...catalogue.series.map(s => "/reihen/" + s.slug + "/"), ...catalogue.books.map(b => b.url)];
const read = url => fs.readFileSync(path.join(root, url, "index.html"), "utf8");
let links = 0;
for (const page of pages) {
  const html = read(page);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, page + ": exactly one H1");
  assert(html.includes('href="https://aeternus-verlag.de' + page + '"'), page + ": canonical URL");
  assert.equal((html.match(/<\/html>/g) || []).length, 1, page + ": balanced document");
  for (const match of html.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
    const value = match[1];
    for (const candidate of value.split(",").map(v => v.trim().split(/\s/)[0])) {
      if (!candidate.startsWith("/") || candidate.startsWith("//")) continue;
      const url = new URL(candidate, "https://aeternus-verlag.de");
      let target = path.join(root, decodeURIComponent(url.pathname));
      if (url.pathname.endsWith("/")) target = path.join(target, "index.html");
      assert(fs.existsSync(target), page + ": missing local target " + candidate);
      if (url.hash && target.endsWith(".html")) {
        const destination = fs.readFileSync(target, "utf8");
        assert(destination.includes('id="' + decodeURIComponent(url.hash.slice(1)) + '"'), page + ": missing fragment " + candidate);
      }
      links++;
    }
  }
}
assert.equal(new Set(catalogue.books.map(b => b.url)).size, catalogue.books.length);
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const book of catalogue.books) {
  assert(sitemap.includes("https://aeternus-verlag.de" + book.url), "Book absent from sitemap");
  const html = read(book.url);
  assert(html.includes('href="' + book.authorUrl + '"'), "Missing author landing-page link: " + book.id);
  assert(read('/buecher/').includes('href="' + book.authorUrl + '"'), "Author not reachable directly from catalogue: " + book.id);
  assert(!html.includes("Bei KDP eingereicht"), "Internal production status in book UI");
  if (book.pending) {
    const primary = html.split('id="ausgabe"')[0];
    assert(!primary.includes('href="https://www.amazon.'), "Pending book has purchase CTA");
  }
  for (const item of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.equal(JSON.parse(item[1])["@type"], "Book");
}
const monarch = catalogue.books.find(b => b.id === "monarch");
assert.equal(monarch.amazonLabel, "Taschenbuch bei Amazon suchen");
assert(monarch.searchIsbns.includes("978-3-912883-36-7"));
assert(sample.paragraphs.length >= 4 && sample.paragraphs.join(" ").length > 2000, "Real reading sample required");
const reader = read("/buecher/wilde-tiere-die-ich-kannte/");
assert(reader.includes(sample.paragraphs[0]));
const quotation = read('/').match(/<blockquote lang="de">„([^]*?)“<\/blockquote>/)?.[1];
assert(quotation && sample.paragraphs.some(p => p.includes(quotation)), "Homepage quotation must be verbatim from the sourced sample");
const authors = require('../src/_data/authorsDe');
for (const author of authors) {
  const url = '/autoren/' + author.slug + '/';
  assert(read(url).includes('<h1'), 'Author landing page missing: ' + url);
  assert(sitemap.includes('https://aeternus-verlag.de' + url), 'Author absent from sitemap: ' + url);
}
// These data regressions are examples of observed launch faults.
const woodcraft = catalogue.books.filter(b => b.cover.startsWith("cover-waldhandwerk-band"));
assert.equal(woodcraft.length, 2);
// Stand 2026-09-20: beide Baende sind bei KDP live (Buchregister, KDP-Regalabzug).
// Die fruehere Regel hielt den Einreichungsstand vom 15.09. fest und schuetzte damit
// genau den Fehler, den sie fangen sollte: ein lieferbares Buch ohne Kaufweg.
assert(woodcraft.every(b => !b.pending && b.amazon.includes("amazon.de/dp/")), "Live volumes must be buyable");
const seton = read("/autoren/ernest-thompson-seton/");
assert(seton.includes('href="/buecher/wilde-tiere-die-ich-kannte/"'));
assert(!seton.includes('class="book-index">010<'), "Tenth book must be 10");
console.log(JSON.stringify({ status: "PASS", editorialPages: pages.length, internalTargets: links, bookPages: catalogue.books.length, series: catalogue.series.length, sampleParagraphs: sample.paragraphs.length }, null, 2));
