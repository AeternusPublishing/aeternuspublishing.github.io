// Welche Sprachfassungen einer Autorenseite tatsaechlich existieren.
// Speist zwei Dinge aus einer Quelle: die hreflang-Angaben im <head> und den
// sichtbaren Sprachumschalter im Kopf der Seite.
//
// Nur eintragen, was gebaut wird — ein hreflang auf eine 404 ist schaedlicher
// als gar keines.
//
// ACHTUNG, zwei Quellen: nur src/en/authors.njk liest diese Datei zur Bauzeit.
// Die Seiten unter src/autoren/, src/es/autores/ und src/pl/autorzy/ sind
// Einzeldateien und tragen hreflang sowie Sprachumschalter fest im Markup.
// Wer hier eine Sprache ergaenzt, muss sie dort von Hand nachziehen —
// sonst bricht die Gegenseitigkeit, und Google wertet hreflang dann gar
// nicht mehr aus. Pruefung: scratchpad/hreflang.js gegen public/.

const P = {
  de: s => "/autoren/" + s + "/",
  en: s => "/en/authors/" + s + "/",
  es: s => "/es/autores/" + s + "/",
  pl: s => "/pl/autorzy/" + s + "/"
};

const AVAILABLE = {
  "ernest-thompson-seton": ["de", "en", "es", "pl"],
  "robert-montgomery-bird": ["de", "en", "es"],
  "henry-ford": ["de", "en"],
  "lady-florentia-sale": ["de", "en"],
  "robert-baden-powell": ["de", "en"],
  // Nur Deutsch: weitere Sprachfassungen existieren noch nicht.
  "george-washington-sears": ["de"]
};

const LABEL = { de: "DE", en: "EN", es: "ES", pl: "PL" };

module.exports = {
  available: AVAILABLE,
  label: LABEL,
  // [{lang, label, url, current}] für einen Autor in einer Sprache
  versions(slug, current) {
    return (AVAILABLE[slug] || []).map(l => ({
      lang: l,
      label: LABEL[l],
      url: P[l](slug),
      current: l === current
    }));
  }
};
