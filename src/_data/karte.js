// Datenschicht der Verlagskarte (/karte/ und /en/map/).
//
// Die Karte erfindet nichts. Jeder Knoten und jede Kante entsteht aus den
// Datenmodellen, die die Website ohnehin fuehrt:
//
//   authorsDe.js / authorsEn.js  -> Autoren und ihre Werke
//   i18n.js seriesItems          -> die sechs Reihen samt Farbe und Nummer
//
// Abgeleitet wird nur, was in diesen Daten steht: die Reihe eines Autors aus
// seiner eyebrow-Zeile, das Erscheinungsjahr des Originals aus der meta-Zeile
// eines Buches, das Motiv eines Buches aus der Gattungsangabe derselben Zeile.
//
// Fail-closed (CORE-008, kein stiller Rueckfall): Eine unbekannte Reihe oder
// eine unbekannte Gattungsangabe bricht den Bau mit Klartext ab, statt den
// Knoten still fallen zu lassen. Wer einen neuen Autor oder eine neue Gattung
// anlegt, entscheidet damit bewusst, wo er in der Karte haengt.

const authorsDe = require("./authorsDe.js");
const authorsEn = require("./authorsEn.js");
const i18n = require("./i18n.js");

// --- Reihen ---------------------------------------------------------------
// Erkennungswort am Anfang der eyebrow-Zeile -> slug der Reihe in seriesItems.
const SERIES_WORD = {
  de: {
    "Anthrazit": "anthrazit",
    "Grün": "gruen",
    "Rot": "rot",
    "Blau": "blau",
    "Bernstein": "bernstein",
    "Weiß": "weiss"
  },
  en: {
    "Anthracite": "anthrazit",
    "Green": "gruen",
    "Red": "rot",
    "Blue": "blau",
    "Amber": "bernstein",
    "White": "weiss"
  }
};

// --- Motive ---------------------------------------------------------------
// Ein Motiv ist die Sachgruppe, unter der ein Werk gelesen wird. Es ist kein
// Marketingetikett, sondern die Gattungsangabe, die auf der Autorenseite
// ohnehin ueber jedem Titel steht - hier nur zu Gruppen zusammengezogen,
// damit Werke verschiedener Autoren sichtbar zusammenfinden.
const MOTIVE = {
  tiererzaehlung: { de: "Tiererzählung", en: "Animal narrative" },
  abenteuer: { de: "Abenteuer & Jugend", en: "Adventure & youth" },
  grenzland: { de: "Grenzland-Erzählung", en: "Frontier fiction" },
  handbuch: { de: "Waldläuferkunst & Handbuch", en: "Woodcraft & handbooks" },
  augenzeuge: { de: "Augenzeugenbericht", en: "Eyewitness account" },
  geschichte: { de: "Geschichtsschreibung", en: "Historiography" },
  wirtschaft: { de: "Wirtschaft & Selbstzeugnis", en: "Industry & memoir" }
};

// Gattungswort (erstes Feld der meta-Zeile) -> Motiv.
// Zwei Eintraege sind kuratiert, weil ihre meta-Zeile keine Gattung fuehrt;
// der Beleg steht daneben.
const MOTIV_BY_META = {
  de: {
    "Tiergeschichten": "tiererzaehlung",
    "Tiererzählung": "tiererzaehlung",
    "Tierroman": "tiererzaehlung",
    "AETERNUS-Ausgabe in Vorbereitung": "tiererzaehlung", // Bambi; Beleg: Salten-Autorenseite
    "Jugendabenteuer": "abenteuer",
    "Roman": "abenteuer",
    "Illustrierte Neuübersetzung": "abenteuer",           // Pinocchio; Beleg: Collodi-Autorenseite
    "Grenzroman": "grenzland",
    "Historischer Roman": "grenzland",
    "Handbuch": "handbuch",
    "Ratgeber": "handbuch",
    "Tagebuch": "augenzeuge",
    "Expeditionsbericht": "augenzeuge",
    "Geschichte": "geschichte",
    "Industrielle Autobiografie": "wirtschaft"
  },
  en: {
    "Animal stories": "tiererzaehlung",
    "Animal biography": "tiererzaehlung",
    "Expedition narrative": "augenzeuge",
    "Journal": "augenzeuge",
    "Field manual": "handbuch",
    "Handbook": "handbuch",
    "Outdoor classic": "handbuch",
    "Frontier novel": "grenzland",
    "Historical novel": "grenzland",
    "Industrial autobiography": "wirtschaft"
  }
};

const AUTHOR_URL = {
  de: slug => "/autoren/" + slug + "/",
  en: slug => "/en/authors/" + slug + "/"
};

const SERIES_URL = {
  de: slug => "/reihen/" + slug + "/",
  en: slug => "/en/series/" + slug + "/"
};

// HTML-Entities, die in den Datenmodellen als Text stehen, fuer die Auswertung
// aufloesen. Sichtbarer Text wird spaeter ohnehin als HTML ausgegeben.
function plain(s) {
  return String(s || "")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function seriesOf(author, lang) {
  const first = plain(author.eyebrow).split("·")[0].trim();
  const slug = SERIES_WORD[lang][first];
  if (!slug) {
    throw new Error(
      "[karte] Autor '" + author.slug + "' (" + lang + ") traegt die Reihe '" + first +
      "', die in SERIES_WORD nicht steht. Reihe in src/_data/karte.js ergaenzen " +
      "oder die eyebrow-Zeile korrigieren - die Karte laesst keinen Autor ins Nichts haengen."
    );
  }
  return slug;
}

function motivOf(book, author, lang) {
  const first = plain(book.meta).split("·")[0].trim();
  const key = MOTIV_BY_META[lang][first];
  if (!key) {
    throw new Error(
      "[karte] Werk '" + book.title + "' von " + author.name + " (" + lang + ") fuehrt die " +
      "Gattung '" + first + "', die in MOTIV_BY_META nicht steht. Zuordnung in " +
      "src/_data/karte.js ergaenzen - lieber ein bewusster Eintrag als ein stiller Ausfall."
    );
  }
  return key;
}

function yearOf(book) {
  const m = plain(book.meta).match(/\b(1[5-9]\d\d|20\d\d)\b/);
  return m ? Number(m[1]) : null;
}

function buildLang(lang, authors) {
  const series = i18n.seriesItems.map(s => ({
    id: "reihe:" + s.slug,
    slug: s.slug,
    num: s.num,
    label: s.colorName[lang],
    title: s.label[lang],
    color: s.colorHex,
    url: SERIES_URL[lang](s.slug)
  }));
  const seriesById = new Map(series.map(s => [s.slug, s]));

  const nodes = [];
  const links = [];
  const motiveUsed = new Set();

  for (const s of series) {
    nodes.push({
      id: s.id, type: "reihe", label: s.label, sub: s.title,
      color: s.color, url: s.url, series: s.slug
    });
  }

  for (const a of authors) {
    const slug = seriesOf(a, lang);
    const s = seriesById.get(slug);
    const id = "autor:" + a.slug;
    nodes.push({
      id, type: "autor",
      label: a.name,
      sub: plain(a.dates),
      note: plain(a.tagline || a.intro).slice(0, 180),
      color: s.color,
      url: AUTHOR_URL[lang](a.slug),
      series: slug,
      preview: !!a.preview
    });
    links.push({ a: s.id, b: id, kind: "reihe" });

    (a.books || []).forEach((b, i) => {
      const motiv = motivOf(b, a, lang);
      motiveUsed.add(motiv);
      const wid = "werk:" + a.slug + ":" + i;
      nodes.push({
        id: wid, type: "werk",
        label: plain(b.title),
        sub: plain(b.subtitle),
        note: plain(b.modal && b.modal.summary).slice(0, 220),
        year: yearOf(b),
        color: s.color,
        url: (b.modal && b.modal.amazon) || AUTHOR_URL[lang](a.slug),
        external: !!(b.modal && b.modal.amazon),
        series: slug,
        author: a.name,
        motiv
      });
      links.push({ a: id, b: wid, kind: "werk" });
      links.push({ a: wid, b: "motiv:" + motiv, kind: "motiv" });
    });
  }

  for (const key of Object.keys(MOTIVE)) {
    if (!motiveUsed.has(key)) continue;
    nodes.push({
      id: "motiv:" + key, type: "motiv",
      label: MOTIVE[key][lang], sub: "", color: "#d4af37", series: null
    });
  }

  // Verwandtschaft: zwei Baende sind verwandt, wenn sie denselben Stoff
  // tragen und von verschiedenen Autoren stammen. Innerhalb eines Werks
  // desselben Autors sagt die gemeinsame Gattung nichts Neues - die
  // Verbindung laeuft dort ohnehin ueber den Autor.
  const works = nodes.filter(n => n.type === "werk");
  const kin = [];
  for (let i = 0; i < works.length; i++) {
    for (let j = i + 1; j < works.length; j++) {
      if (works[i].motiv !== works[j].motiv) continue;
      if (works[i].author === works[j].author) continue;
      kin.push({ a: works[i].id, b: works[j].id, kind: "verwandt", motiv: works[i].motiv });
    }
  }

  // Textverzeichnis: dieselbe Karte in Listenform. Es traegt die Seite, wenn
  // im Browser kein Skript laeuft, und ist zugleich das, was Suchmaschinen
  // lesen - eine gezeichnete Karte allein waere fuer beide unsichtbar.
  const index = series.map(s => ({
    slug: s.slug,
    num: s.num,
    label: s.label,
    color: s.color,
    url: s.url,
    authors: nodes
      .filter(n => n.type === "autor" && n.series === s.slug)
      .map(a => ({
        label: a.label,
        sub: a.sub,
        url: a.url,
        works: nodes
          .filter(w => w.type === "werk" && w.author === a.label)
          .map(w => ({ label: w.label, year: w.year }))
      }))
  }));

  return {
    nodes,
    links,
    kin,
    series: series.map(s => ({
      ...s,
      empty: !nodes.some(n => n.type === "autor" && n.series === s.slug)
    })),
    index,
    stats: {
      series: series.length,
      seriesActive: new Set(nodes.filter(n => n.type === "autor").map(n => n.series)).size,
      authors: nodes.filter(n => n.type === "autor").length,
      works: nodes.filter(n => n.type === "werk").length,
      motive: nodes.filter(n => n.type === "motiv").length,
      kin: kin.length
    }
  };
}

module.exports = {
  de: buildLang("de", authorsDe),
  en: buildLang("en", authorsEn)
};
