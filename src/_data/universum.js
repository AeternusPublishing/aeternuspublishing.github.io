// Fuehrt den Werk-Graphen mit dem zusammen, was die Website ohnehin ueber
// jedes Buch weiss: Umschlag, Untertitel, Beschreibung, Weg zum Kauf.
//
// Getroffen wird ueber den Titel. Ein Werk, dessen Titel in werkdna.js anders
// geschrieben steht als auf der Autorenseite, faellt auf - der Bau bricht ab,
// statt einen Stern ohne Buch dahinter zu zeigen (CORE-008, kein stiller
// Rueckfall). Umgekehrt darf ein Buch auf der Website noch ohne Werk-DNA sein;
// es fehlt dann in der Karte, und die Zahl steht im Bau-Protokoll.

const werkdna = require("./werkdna.js");
const authorsDe = require("./authorsDe.js");
const authorsEn = require("./authorsEn.js");

function plain(s) {
  return String(s || "")
    .replace(/&middot;/g, "·").replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const AUTOR_URL = {
  de: slug => "/autoren/" + slug + "/",
  en: slug => "/en/authors/" + slug + "/"
};

function buecher(authors, lang) {
  const map = {};
  const namen = {};
  for (const a of authors) {
    namen[a.slug] = a.name;
    for (const b of a.books || []) {
      map[plain(b.title)] = {
        autorSlug: a.slug,
        autorName: a.name,
        autorUrl: AUTOR_URL[lang](a.slug),
        untertitel: plain(b.subtitle),
        text: plain(b.modal && b.modal.summary),
        cover: b.cover && b.cover.img ? b.cover.img : null,
        kaufUrl: (b.modal && b.modal.amazon) || null,
        vorschau: !!a.preview,
        meta: plain(b.meta)
      };
    }
  }
  return { map, namen };
}

function baue(lang, authors) {
  const { map, namen } = buecher(authors, lang);
  const g = werkdna.graph[lang];
  const fehlend = [];

  let knoten = g.knoten.map(n => {
    if (n.typ === "autor") {
      return Object.assign({}, n, {
        label: namen[n.key] || n.key,
        url: AUTOR_URL[lang](n.key),
        bekannt: !!namen[n.key]
      });
    }
    if (n.typ !== "werk") return n;

    const b = map[n.label];
    if (!b) { fehlend.push(n.label); return Object.assign({}, n, { fehlt: true }); }
    return Object.assign({}, n, {
      untertitel: b.untertitel,
      text: b.text,
      cover: b.cover,
      url: b.kaufUrl || b.autorUrl,
      extern: !!b.kaufUrl,
      autorName: b.autorName,
      autorUrl: b.autorUrl,
      vorschau: b.vorschau
    });
  });

  // Ein Stern ohne Buch dahinter ist ein Fehler in den Daten, kein Anlass zum
  // Weitermachen: entweder heisst das Werk auf der Autorenseite anders, oder
  // es steht dort gar nicht.
  if (fehlend.length && lang === "de") {
    throw new Error(
      "[universum] Diese Werke aus werkdna.js haben auf keiner deutschen Autorenseite " +
      "ein Buch mit demselben Titel: " + fehlend.join(" | ") +
      ". Titel angleichen oder den Eintrag entfernen."
    );
  }

  const gefuehrt = {};
  g.knoten.forEach(n => { if (n.typ === "werk") gefuehrt[n.label] = true; });
  const ohneDna = Object.keys(map).filter(t => !gefuehrt[t]);

  // Die englische Fassung fuehrt weniger Baende. Merkmale, an denen dann kein
  // Werk mehr haengt, wuerden als Punkte ohne Zusammenhang stehen bleiben -
  // sie fallen samt ihrer Oberbegriffe heraus.
  let bleib = knoten.filter(n => !n.fehlt);
  let kanten = g.kanten.filter(k => {
    const ids = new Set(bleib.map(n => n.id));
    return ids.has(k.a) && ids.has(k.b);
  });
  for (let runde = 0; runde < 6; runde++) {
    const werkAn = new Set();
    const merken = (id, tiefe) => {
      if (tiefe > 4) return;
      kanten.forEach(k => {
        if (k.a === id && !werkAn.has(k.b)) { werkAn.add(k.b); merken(k.b, tiefe + 1); }
        if (k.b === id && !werkAn.has(k.a)) { werkAn.add(k.a); merken(k.a, tiefe + 1); }
      });
    };
    bleib.filter(n => n.typ === "werk").forEach(n => { werkAn.add(n.id); merken(n.id, 0); });
    const vorher = bleib.length;
    bleib = bleib.filter(n => n.typ === "werk" || werkAn.has(n.id));
    const ids = new Set(bleib.map(n => n.id));
    kanten = kanten.filter(k => ids.has(k.a) && ids.has(k.b));
    if (bleib.length === vorher) break;
  }
  knoten = bleib;

  return {
    knoten,
    kanten,
    stand: {
      werke: knoten.filter(n => n.typ === "werk" && !n.fehlt).length,
      ereignisse: knoten.filter(n => n.typ === "ereignis").length,
      orte: knoten.filter(n => n.typ === "ort").length,
      stoffe: knoten.filter(n => n.typ === "motiv").length,
      verbindungen: kanten.length,
      ohneDna: ohneDna
    }
  };
}

const de = baue("de", authorsDe);
const en = baue("en", authorsEn);

if (de.stand.ohneDna.length) {
  console.warn("[universum] ohne Werk-DNA und darum nicht in der Karte: " +
    de.stand.ohneDna.join(" | "));
}

module.exports = { de, en };
