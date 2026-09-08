// Werk-DNA der Karte: woraus ein Band besteht, nicht wo er im Katalog steht.
//
// Die Reihe sagt, in welches Regal ein Buch gehoert. Sie sagt nicht, dass
// Setons "Rolf in der Wildnis" und Sears' "Waldhandwerk" dieselben Adirondacks
// beschreiben, dass beide in Baden-Powells "Scouting for Boys" nachwirken oder
// dass Birds "Waldteufel" und Roosevelts "Eroberung des Westens" dieselbe
// Grenze im selben Jahrzehnt erzaehlen - die eine als Roman, der andere als
// Geschichtsschreibung. Genau diese Verbindungen traegt diese Datei.
//
// HERKUNFT DER ANGABEN. Das Haus fuehrt seit der Verfassungsergaenzung eine
// Werk-DNA je Werk (WERK_DNA.json mit content.places, content.themes,
// content.figures). Diese Spur ist nicht durchgehalten worden: von den hier
// gefuehrten Baenden hat nur ein Teil eine DNA-Datei. Auf Verlegeranweisung
// vom 2026-09-08 werden die fehlenden Merkmale aus Werkkenntnis gesetzt statt
// auf die Nachpflege zu warten. Jeder Eintrag nennt darum in `herkunft`, worauf
// er beruht - und wo eine Behauptung am Volltext im Haus nachgeprueft wurde,
// steht die Messung dabei. Was sich nicht belegen liess, steht nicht drin.
//
// MITWACHSEN. Ein neues Buch ist ein Eintrag. Es braucht keine neue Kante:
// die Verbindungen entstehen aus den geteilten Merkmalen von selbst, sobald
// das Werk seine Orte, Zeiten, Ereignisse und Stoffe nennt.

// --- Vokabular -------------------------------------------------------------
// KANONISCHE QUELLE: 99_SYSTEM/PIPELINES/V3/PROFILES/CONTRACTS/WORK_DNA_VOCABULARY.json
// im Produktionsordner. Dort haengt seit dem 2026-09-08 das Gate ACC-E801 daran,
// das jede Werk-DNA gegen dieses Verzeichnis prueft. Was hier steht, ist eine
// Spiegelung fuer den Bau der Website - wer ein Merkmal ergaenzt, ergaenzt es
// zuerst dort.
//
// Kanten entstehen nur zwischen gleichen Schluesseln. Ein Ort, der bei einem
// Werk "Adirondacks" und beim naechsten "Adirondack Mountains" hiesse, fiele
// auseinander - deshalb ein geschlossenes Verzeichnis mit Klartext je Sprache.

// `in` bindet einen Ort an den groesseren Raum: von den Adirondacks fuehrt
// der Weg ueber den Staat New York in den Nordosten - und damit zu Buechern,
// die nicht denselben Wald, aber dieselbe Landschaft meinen.
const ORTE = {
  nordost_usa: { de: "Nordosten der Vereinigten Staaten", en: "The American Northeast" },
  nordamerika_grenze: { de: "Amerikanische Grenze", en: "The American frontier" },
  westen_usa: { de: "Amerikanischer Westen", en: "The American West" },
  kanada: { de: "Kanada", en: "Canada" },
  britisches_reich: { de: "Britisches Weltreich", en: "The British Empire" },
  mitteleuropa: { de: "Mitteleuropa", en: "Central Europe" },

  adirondacks: { de: "Adirondacks", en: "The Adirondacks", in: "new_york" },
  champlain: { de: "Lake Champlain", en: "Lake Champlain", in: "new_york" },
  new_york: { de: "New York", en: "New York", in: "nordost_usa" },
  neuengland: { de: "Neuengland", en: "New England", in: "nordost_usa" },
  pennsylvania: { de: "Pennsylvania", en: "Pennsylvania", in: "nordost_usa" },
  ontario: { de: "Ontario", en: "Ontario", in: "kanada" },
  manitoba: { de: "Manitoba", en: "Manitoba", in: "kanada" },
  nordkanada: { de: "Nordkanada", en: "Northern Canada", in: "kanada" },
  neumexiko: { de: "Neumexiko", en: "New Mexico", in: "westen_usa" },
  yellowstone: { de: "Yellowstone", en: "Yellowstone", in: "westen_usa" },
  rocky_mountains: { de: "Rocky Mountains", en: "Rocky Mountains", in: "westen_usa" },
  sierra_nevada: { de: "Sierra Nevada", en: "Sierra Nevada", in: "kalifornien" },
  kalifornien: { de: "Kalifornien", en: "California", in: "westen_usa" },
  kentucky: { de: "Kentucky", en: "Kentucky", in: "nordamerika_grenze" },
  ohiotal: { de: "Ohio-Tal", en: "The Ohio Valley", in: "nordamerika_grenze" },
  tennessee: { de: "Tennessee", en: "Tennessee", in: "nordamerika_grenze" },
  alleghenies: { de: "Alleghenies", en: "The Alleghenies", in: "nordamerika_grenze" },
  michigan: { de: "Michigan", en: "Michigan" },
  england: { de: "England", en: "England", in: "britisches_reich" },
  afghanistan: { de: "Afghanistan", en: "Afghanistan" },
  westafrika: { de: "Westafrika", en: "West Africa", in: "britisches_reich" },
  suedafrika: { de: "Südafrika", en: "Southern Africa", in: "britisches_reich" },
  wien: { de: "Wien", en: "Vienna", in: "mitteleuropa" },
  mitteleuropa_wald: { de: "Mitteleuropäischer Wald", en: "Central European forest", in: "mitteleuropa" },
  toskana: { de: "Toskana", en: "Tuscany" }
};

// Auch Ereignisse haengen aneinander: die Schlacht gehoert zum Krieg, der
// Rueckzug zum Feldzug. Ein Leser, der bei Plattsburgh steht, kommt so zum
// Krieg von 1812 und von dort zu allem, was ihn sonst noch erzaehlt.
const EREIGNISSE = {
  krieg_1812: { de: "Krieg von 1812", en: "War of 1812", jahre: [1812, 1815] },
  plattsburgh: { de: "Schlacht von Plattsburgh 1814", en: "Battle of Plattsburgh, 1814", jahre: [1814, 1814], in: "krieg_1812" },
  amerikanische_revolution: { de: "Amerikanische Revolution", en: "The American Revolution", jahre: [1775, 1783] },
  indianerkriege_frontier: { de: "Grenzkriege im Ohio-Tal", en: "Frontier wars of the Ohio Valley", jahre: [1774, 1795] },
  anglo_afghan_1: { de: "Erster Anglo-Afghanischer Krieg", en: "First Anglo-Afghan War", jahre: [1839, 1842] },
  rueckzug_kabul: { de: "Rückzug aus Kabul 1842", en: "The retreat from Kabul, 1842", jahre: [1842, 1842], in: "anglo_afghan_1" },
  ashanti_1895: { de: "Ashanti-Feldzug 1895/96", en: "Ashanti expedition, 1895–96", jahre: [1895, 1896] },
  fliessband_1913: { de: "Einführung des Fließbands", en: "The moving assembly line", jahre: [1913, 1913] },
  untergang_habsburg: { de: "Untergang der Donaumonarchie", en: "The fall of the Habsburg monarchy", jahre: [1914, 1918] }
};

const MOTIVE = {
  tierbiografie: { de: "Tierbiografie", en: "Animal biography" },
  tiertod: { de: "Der Tod des Tieres", en: "The death of the animal" },
  jagd: { de: "Jagd", en: "Hunting" },
  wolf: { de: "Wolf", en: "Wolves" },
  baer: { de: "Bär", en: "Bears" },
  wildnisverlust: { de: "Die schwindende Wildnis", en: "The vanishing wilderness" },
  naturbeobachtung: { de: "Feldbeobachtung", en: "Field observation" },
  waldlaeuferkunst: { de: "Waldläuferkunst", en: "Woodcraft" },
  spurenlesen: { de: "Spurenlesen", en: "Tracking" },
  lagerleben: { de: "Lagerleben", en: "Camp life" },
  leichtes_gepaeck: { de: "Leichtes Gepäck", en: "Going light" },
  kanufahrt: { de: "Kanufahrt", en: "Canoe travel" },
  selbstversorgung: { de: "Selbstversorgung", en: "Self-reliance" },
  indigenes_wissen: { de: "Indigenes Wissen", en: "Indigenous knowledge" },
  jungenbande: { de: "Jungen bauen sich eine Welt", en: "Boys building their own world" },
  jugenderziehung: { de: "Jugenderziehung", en: "Educating the young" },
  pfadfinderei: { de: "Pfadfinderei", en: "Scouting" },
  expedition: { de: "Expedition", en: "Expedition" },
  augenzeuge: { de: "Augenzeugenbericht", en: "Eyewitness account" },
  militaerkatastrophe: { de: "Militärische Katastrophe", en: "Military catastrophe" },
  kolonialfeldzug: { de: "Kolonialfeldzug", en: "Colonial campaign" },
  gefangenschaft: { de: "Gefangenschaft", en: "Captivity" },
  frontier_gewalt: { de: "Gewalt an der Grenze", en: "Violence on the frontier" },
  siedlung: { de: "Landnahme und Siedlung", en: "Settlement" },
  historiografie: { de: "Geschichtsschreibung", en: "Historiography" },
  schatzsuche: { de: "Schatzsuche", en: "Quest for treasure" },
  industrie: { de: "Industrie und Maschine", en: "Industry and machinery" },
  unternehmertum: { de: "Unternehmertum", en: "Enterprise" },
  maerchen: { de: "Märchen", en: "Fairy tale" },
  reifung: { de: "Ein Junge wird erwachsen", en: "A boy comes of age" },
  pferd: { de: "Pferd", en: "Horses" }
};

const PERSONEN = {
  seton: { de: "Ernest Thompson Seton", en: "Ernest Thompson Seton" },
  nessmuk: { de: "Nessmuk (George W. Sears)", en: "Nessmuk (George W. Sears)" },
  boone: { de: "Daniel Boone", en: "Daniel Boone" },
  quatermain: { de: "Allan Quatermain", en: "Allan Quatermain" }
};

// --- Die Werke -------------------------------------------------------------
// `titel` verbindet den Eintrag mit dem Buch auf der Autorenseite; getroffen
// wird ueber genau diesen Titel, damit die Karte nichts doppelt fuehrt.
// `wirkung` ist die einzige gerichtete Verbindung: A wirkt in B nach.

const WERKE = [
  // --- Ernest Thompson Seton ---
  {
    key: "ets-wilde-tiere",
    autor: "ernest-thompson-seton",
    titel: { de: "Wilde Tiere, die ich kannte", en: "Wild Animals I Have Known" },
    handlung: [1880, 1898],
    orte: ["neumexiko", "manitoba", "ontario"],
    motive: ["tierbiografie", "tiertod", "wolf", "jagd", "naturbeobachtung"],
    personen: [],
    herkunft: {
      de: "Werkkenntnis; Lobo im Currumpaw-Tal, Silberfleck und Wully sind Schauplatz und Stoff der acht Geschichten",
      en: "Knowledge of the work; Lobo of the Currumpaw, Silverspot and Wully are the setting and the substance of the eight stories"
    }
  },
  {
    key: "ets-wahb",
    autor: "ernest-thompson-seton",
    titel: { de: "Wahb. Lebensgeschichte eines Grizzlybären", en: "The Biography of a Grizzly" },
    handlung: [1880, 1900],
    orte: ["yellowstone", "rocky_mountains"],
    motive: ["tierbiografie", "tiertod", "baer", "wildnisverlust", "naturbeobachtung"],
    herkunft: {
      de: "Werkkenntnis; Wahbs Leben spielt im Yellowstone-Land",
      en: "Knowledge of the work; Wahb's life is set in the Yellowstone country"
    }
  },
  {
    key: "ets-gejagte",
    autor: "ernest-thompson-seton",
    titel: { de: "Leben der Gejagten", en: "Lives of the Hunted" },
    handlung: [1880, 1901],
    orte: ["yellowstone", "neumexiko", "ontario"],
    motive: ["tierbiografie", "tiertod", "jagd", "naturbeobachtung"],
    herkunft: {
      de: "Werkkenntnis; Fortsetzung der Tierbiografien, u. a. Krag und Johnny Bear",
      en: "Knowledge of the work; the sequel volume of animal biographies, among them Krag and Johnny Bear"
    }
  },
  {
    key: "ets-tierhelden",
    autor: "ernest-thompson-seton",
    titel: { de: "Tierhelden. Portraits aus der Wildnis", en: "Animal Heroes" },
    handlung: [1880, 1905],
    orte: ["new_york", "ontario", "manitoba"],
    motive: ["tierbiografie", "tiertod", "naturbeobachtung"],
    herkunft: {
      de: "Werkkenntnis; von der Brieftaube Arnaux über New York bis zum Luchs in den Wäldern",
      en: "Knowledge of the work; from the homing pigeon Arnaux over New York to the lynx in the woods"
    }
  },
  {
    key: "ets-zwei-kleine-wilde",
    autor: "ernest-thompson-seton",
    titel: { de: "Zwei kleine Wilde", en: "Two Little Savages" },
    handlung: [1870, 1880],
    orte: ["ontario"],
    motive: ["jungenbande", "waldlaeuferkunst", "spurenlesen", "lagerleben", "selbstversorgung", "indigenes_wissen", "reifung", "naturbeobachtung"],
    wirkung: [{ ziel: "bp-scouting", art: "vorbild", beleg: "Scouting for Boys nennt Seton fünfzehnmal (gemessen am Quelltext im Haus)" }],
    herkunft: {
      de: "Werkkenntnis; Yan und Sam bauen sich in Sanger ein indianisches Lager - das Buch, aus dem die Woodcraft Indians hervorgingen",
      en: "Knowledge of the work; Yan and Sam build themselves an Indian camp at Sanger - the book the Woodcraft Indians grew out of"
    }
  },
  {
    key: "ets-rolf",
    autor: "ernest-thompson-seton",
    titel: { de: "Rolf in der Wildnis", en: "Rolf in the Woods" },
    handlung: [1812, 1815],
    orte: ["adirondacks", "champlain", "neuengland"],
    ereignisse: ["krieg_1812", "plattsburgh"],
    motive: ["waldlaeuferkunst", "spurenlesen", "kanufahrt", "lagerleben", "selbstversorgung", "indigenes_wissen", "reifung", "jagd"],
    personen: [],
    herkunft: {
      de: "Werkkenntnis, am Manuskript nachgeprüft: 'Plattsburg' steht 63-mal im deutschen Endmanuskript; Rolf und Quonab fahren die Adirondacks bis zum Lake Champlain und geraten in den Krieg von 1812",
      en: "Knowledge of the work, checked against the manuscript: 'Plattsburg' occurs 63 times in the German final manuscript; Rolf and Quonab travel the Adirondacks to Lake Champlain and are caught up in the War of 1812"
    }
  },
  {
    key: "ets-arktische-praerien",
    autor: "ernest-thompson-seton",
    titel: { de: "Die arktischen Prärien", en: "The Arctic Prairies" },
    handlung: [1907, 1907],
    orte: ["nordkanada"],
    motive: ["expedition", "kanufahrt", "augenzeuge", "naturbeobachtung", "indigenes_wissen", "lagerleben"],
    herkunft: {
      de: "Werkkenntnis; die 2000-Meilen-Kanufahrt durch die Barren Grounds zum Aylmer Lake, 1907",
      en: "Knowledge of the work; the 2000-mile canoe journey through the Barren Grounds to Aylmer Lake, 1907"
    }
  },
  {
    key: "ets-monarch",
    autor: "ernest-thompson-seton",
    titel: { de: "Monarch", en: "Monarch, the Big Bear of Tallac" },
    handlung: [1880, 1904],
    orte: ["kalifornien", "sierra_nevada"],
    motive: ["tierbiografie", "baer", "wildnisverlust", "tiertod"],
    herkunft: {
      de: "WERK_DNA.json des Werks (content.places, content.themes): Tallac, Sierra Nevada, Kalifornien am Übergang zum 20. Jahrhundert",
      en: "The work's own WERK_DNA.json (content.places, content.themes): Tallac, Sierra Nevada, California at the turn of the twentieth century"
    }
  },
  {
    key: "ets-waldlaeuferkunst",
    autor: "ernest-thompson-seton",
    titel: { de: "Das Buch der Waldläuferkunst", en: "The Book of Woodcraft and Indian Lore" },
    handlung: [1900, 1912],
    orte: ["ontario", "new_york"],
    motive: ["waldlaeuferkunst", "spurenlesen", "lagerleben", "selbstversorgung", "indigenes_wissen", "jugenderziehung", "naturbeobachtung"],
    wirkung: [{ ziel: "bp-scouting", art: "vorbild", beleg: "Scouting for Boys nennt Seton fünfzehnmal (gemessen am Quelltext im Haus)" }],
    herkunft: {
      de: "Werkkenntnis; das Handbuch der Woodcraft Indians, über 500 eigene Zeichnungen",
      en: "Knowledge of the work; the handbook of the Woodcraft Indians, with more than 500 drawings by the author"
    }
  },

  // --- George Washington Sears ---
  {
    key: "gws-woodcraft",
    autor: "george-washington-sears",
    titel: { de: "Waldhandwerk", en: "Woodcraft" },
    handlung: [1870, 1884],
    orte: ["adirondacks", "new_york"],
    motive: ["waldlaeuferkunst", "kanufahrt", "leichtes_gepaeck", "lagerleben", "selbstversorgung", "jagd"],
    wirkung: [{ ziel: "bp-scouting", art: "nachwirkung", beleg: "Scouting for Boys nennt Nessmuk (gemessen am Quelltext im Haus)" }],
    herkunft: {
      de: "Werkkenntnis; Nessmuks Adirondack-Fahrten im eigenen Leichtkanu, das Buch des Weglassens",
      en: "Knowledge of the work; Nessmuk's Adirondack journeys in his own light canoe, the book of leaving things behind"
    }
  },

  // --- Robert Baden-Powell ---
  {
    key: "bp-scouting",
    autor: "robert-baden-powell",
    titel: { de: "Scouting for Boys", en: "Scouting for Boys" },
    handlung: [1900, 1908],
    orte: ["england"],
    motive: ["pfadfinderei", "waldlaeuferkunst", "spurenlesen", "lagerleben", "jugenderziehung", "selbstversorgung"],
    personen: ["seton", "nessmuk"],
    herkunft: {
      de: "Am Quelltext im Haus gemessen: das Buch nennt Seton fünfzehnmal, Nessmuk einmal und führt Woodcraft als eigenes Kapitelwort",
      en: "Measured against the source text in house: the book names Seton fifteen times and Nessmuk once, and carries woodcraft as a chapter word of its own"
    }
  },
  {
    key: "bp-prempeh",
    autor: "robert-baden-powell",
    titel: { de: "Der Sturz Prempehs", en: "The Downfall of Prempeh" },
    handlung: [1895, 1896],
    orte: ["westafrika"],
    ereignisse: ["ashanti_1895"],
    motive: ["kolonialfeldzug", "augenzeuge", "expedition", "spurenlesen"],
    herkunft: {
      de: "WERK_DNA.json des Werks; Tagebuch des Ashanti-Marsches 1895/96",
      en: "The work's own WERK_DNA.json; diary of the Ashanti march of 1895-96"
    }
  },

  // --- Lady Florentia Sale ---
  {
    key: "fs-tagebuch",
    autor: "lady-florentia-sale",
    titel: { de: "Tagebuch der Katastrophe", en: "A Journal of the Disasters in Affghanistan" },
    handlung: [1841, 1842],
    orte: ["afghanistan"],
    ereignisse: ["anglo_afghan_1", "rueckzug_kabul"],
    motive: ["augenzeuge", "militaerkatastrophe", "gefangenschaft", "kolonialfeldzug"],
    herkunft: {
      de: "Werkkenntnis; Tag für Tag geschrieben im Zusammenbruch des Kabuler Feldzugs und in neunmonatiger Geiselhaft",
      en: "Knowledge of the work; written day by day inside the collapse of the Kabul campaign and through nine months of captivity"
    }
  },

  // --- Robert Montgomery Bird ---
  {
    key: "rmb-waldteufel",
    autor: "robert-montgomery-bird",
    titel: { de: "Der Waldteufel", en: "Nick of the Woods" },
    handlung: [1782, 1782],
    orte: ["kentucky", "ohiotal"],
    ereignisse: ["indianerkriege_frontier", "amerikanische_revolution"],
    motive: ["frontier_gewalt", "siedlung", "jagd"],
    herkunft: {
      de: "Werkkenntnis; Kentucky im Jahr 1782, am Ende der Revolution, mit dem Quäker Nathan Slaughter",
      en: "Knowledge of the work; Kentucky in 1782, at the close of the Revolution, with the Quaker Nathan Slaughter"
    }
  },
  {
    key: "rmb-hawks",
    autor: "robert-montgomery-bird",
    titel: { de: "Die Falken von Hawk-Hollow", en: "The Hawks of Hawk-Hollow" },
    handlung: [1782, 1782],
    orte: ["pennsylvania"],
    ereignisse: ["amerikanische_revolution"],
    motive: ["frontier_gewalt", "siedlung"],
    herkunft: {
      de: "Werkkenntnis; Pennsylvania 1782, die Loyalistenfehde am Delaware",
      en: "Knowledge of the work; Pennsylvania 1782, the loyalist feud on the Delaware"
    }
  },

  // --- Theodore Roosevelt ---
  {
    key: "tr-wotw-1",
    autor: "theodore-roosevelt",
    titel: { de: "Die Eroberung des Westens · Band I", en: "The Winning of the West I" },
    handlung: [1769, 1776],
    orte: ["alleghenies", "kentucky", "tennessee", "ohiotal"],
    ereignisse: ["indianerkriege_frontier"],
    motive: ["historiografie", "siedlung", "frontier_gewalt", "jagd"],
    personen: ["boone"],
    herkunft: {
      de: "Werkkenntnis; Band I führt von den Alleghenies zum Mississippi, 1769–1776, mit Boone und den Long Hunters",
      en: "Knowledge of the work; volume I runs from the Alleghenies to the Mississippi, 1769-1776, with Boone and the Long Hunters"
    }
  },
  {
    key: "tr-wotw-2",
    autor: "theodore-roosevelt",
    titel: { de: "Die Eroberung des Westens · Band II", en: "The Winning of the West II" },
    handlung: [1777, 1783],
    orte: ["kentucky", "ohiotal", "tennessee"],
    ereignisse: ["amerikanische_revolution", "indianerkriege_frontier"],
    motive: ["historiografie", "siedlung", "frontier_gewalt"],
    herkunft: {
      de: "Werkkenntnis; die Grenze im Revolutionskrieg, Clarks Feldzug im Nordwesten",
      en: "Knowledge of the work; the frontier during the war of the Revolution, Clark's campaign in the Northwest"
    }
  },
  {
    key: "tr-wotw-3",
    autor: "theodore-roosevelt",
    titel: { de: "Die Eroberung des Westens · Band III", en: "The Winning of the West III" },
    handlung: [1784, 1790],
    orte: ["ohiotal", "tennessee", "kentucky"],
    ereignisse: ["indianerkriege_frontier"],
    motive: ["historiografie", "siedlung", "frontier_gewalt"],
    herkunft: {
      de: "Werkkenntnis; die Jahre der jungen Republik an der Grenze",
      en: "Knowledge of the work; the years of the young republic on the frontier"
    }
  },
  {
    key: "tr-wotw-4",
    autor: "theodore-roosevelt",
    titel: { de: "Die Eroberung des Westens · Band IV", en: "The Winning of the West IV" },
    handlung: [1791, 1807],
    orte: ["ohiotal", "tennessee"],
    ereignisse: ["indianerkriege_frontier"],
    motive: ["historiografie", "siedlung"],
    herkunft: {
      de: "Werkkenntnis; bis zur Louisiana-Erwerbung und darüber hinaus",
      en: "Knowledge of the work; up to the Louisiana Purchase and beyond"
    }
  },

  // --- H. Rider Haggard ---
  {
    key: "hrh-salomo",
    autor: "henry-rider-haggard",
    titel: { de: "König Salomos Schatzkammer", en: "King Solomon's Mines" },
    handlung: [1880, 1885],
    orte: ["suedafrika"],
    motive: ["schatzsuche", "expedition", "jagd", "reifung"],
    personen: ["quatermain"],
    herkunft: {
      de: "Werkkenntnis; Quatermains Zug ins Kukuanaland",
      en: "Knowledge of the work; Quatermain's march into Kukuanaland"
    }
  },

  // --- Henry Ford ---
  {
    key: "hf-leben-werk",
    autor: "henry-ford",
    titel: { de: "Mein Leben und Werk", en: "My Life and Work" },
    handlung: [1863, 1922],
    orte: ["michigan"],
    ereignisse: ["fliessband_1913"],
    motive: ["industrie", "unternehmertum", "augenzeuge"],
    herkunft: {
      de: "Werkkenntnis; Fords eigene Darstellung von der Farm über die Werkstatt bis zur Fließbandfertigung",
      en: "Knowledge of the work; Ford's own account from the farm through the workshop to assembly-line production"
    }
  },

  // --- Felix Salten ---
  {
    key: "fsa-bambi",
    autor: "felix-salten",
    titel: { de: "Bambi", en: "Bambi" },
    handlung: [1900, 1923],
    orte: ["mitteleuropa_wald"],
    motive: ["tierbiografie", "tiertod", "jagd", "reifung", "naturbeobachtung"],
    herkunft: {
      de: "Werkkenntnis; ein Reh vom ersten Sommer bis zur Einsamkeit des alten Bocks",
      en: "Knowledge of the work; a roe deer from his first summer to the solitude of the old buck"
    }
  },

  {
    key: "fsa-bambis-kinder",
    autor: "felix-salten",
    titel: { de: "Bambis Kinder", en: "Bambi's Children" },
    handlung: [1900, 1940],
    orte: ["mitteleuropa_wald"],
    motive: ["tierbiografie", "tiertod", "jagd", "reifung", "gefangenschaft", "naturbeobachtung"],
    wirkung: [{ ziel: "fsa-bambi", art: "fortsetzung", beleg: "Fortsetzung von Bambi: Genos und Gurris Geschichte setzt die des Vaters fort" }],
    herkunft: {
      de: "Werkkenntnis; die 1940 auf Deutsch erschienene Fortsetzung - Bambis Zwillinge Geno und Gurri, Gurris Gefangenschaft beim Menschen",
      en: "Knowledge of the work; the sequel published in German in 1940 - Bambi's twins Geno and Gurri, and Gurri's captivity among men"
    }
  },

  // --- Carlo Collodi ---
  {
    key: "cc-pinocchio",
    autor: "carlo-collodi",
    titel: { de: "Pinocchio", en: "Pinocchio" },
    handlung: [1880, 1883],
    orte: ["toskana"],
    motive: ["maerchen", "reifung"],
    herkunft: {
      de: "Werkkenntnis; die toskanische Erzählung vom hölzernen Jungen",
      en: "Knowledge of the work; the Tuscan tale of the wooden boy"
    }
  }
];

// --- Kantenbildung ---------------------------------------------------------
// Zwei Werke sind verwandt, wenn sie Merkmale teilen. Was schwerer wiegt,
// bindet staerker: ein gemeinsames historisches Ereignis sagt mehr ueber die
// Verwandtschaft zweier Buecher als ein gemeinsames Motiv, und eine belegte
// Wirkungslinie sagt am meisten.
const GEWICHT = { ereignis: 3.5, ort: 2, person: 2, motiv: 1.2, zeit: 1.5, wirkung: 5 };
const SCHWELLE = 3.2;   // darunter ist die Aehnlichkeit Zufall, nicht Verwandtschaft

function ueberschneidung(a, b) {
  return (a || []).filter(x => (b || []).indexOf(x) >= 0);
}

// Beruehren sich die Handlungszeiten? Zwei Buecher, die dasselbe Jahrzehnt
// erzaehlen, stehen einander naeher als zwei, die Jahrhunderte trennen.
function zeitnaehe(a, b) {
  if (!a.handlung || !b.handlung) return 0;
  const von = Math.max(a.handlung[0], b.handlung[0]);
  const bis = Math.min(a.handlung[1], b.handlung[1]);
  if (bis < von) return 0;
  return bis - von >= 5 ? 1 : 0.5;
}

function kanten2(lang) {
  const out = [];
  for (let i = 0; i < WERKE.length; i++) {
    for (let j = i + 1; j < WERKE.length; j++) {
      const a = WERKE[i], b = WERKE[j];
      const gruende = [];
      let gewicht = 0;

      ueberschneidung(a.ereignisse, b.ereignisse).forEach(k => {
        gewicht += GEWICHT.ereignis;
        gruende.push({ art: "ereignis", label: EREIGNISSE[k][lang] });
      });
      ueberschneidung(a.orte, b.orte).forEach(k => {
        gewicht += GEWICHT.ort;
        gruende.push({ art: "ort", label: ORTE[k][lang] });
      });
      ueberschneidung(a.personen, b.personen).forEach(k => {
        gewicht += GEWICHT.person;
        gruende.push({ art: "person", label: PERSONEN[k][lang] });
      });
      ueberschneidung(a.motive, b.motive).forEach(k => {
        gewicht += GEWICHT.motiv;
        gruende.push({ art: "motiv", label: MOTIVE[k][lang] });
      });

      const z = zeitnaehe(a, b);
      if (z) gewicht += GEWICHT.zeit * z;

      // Wirkungslinien binden in beide Richtungen sichtbar, bleiben aber als
      // gerichtete Aussage erkennbar.
      const w = ((a.wirkung || []).filter(x => x.ziel === b.key)
        .concat((b.wirkung || []).filter(x => x.ziel === a.key)));
      w.forEach(x => {
        gewicht += GEWICHT.wirkung;
        gruende.push({ art: "wirkung", label: x.beleg });
      });

      if (gewicht < SCHWELLE || !gruende.length) continue;
      out.push({
        a: a.key, b: b.key,
        gewicht: Math.round(gewicht * 10) / 10,
        wirkung: w.length > 0,
        gruende: gruende
      });
    }
  }
  return out.sort((x, y) => y.gewicht - x.gewicht);
}

// --- Der Graph -------------------------------------------------------------
// Nicht nur Buecher sind Knoten. Ein Ereignis ist einer, ein Ort ist einer,
// ein Stoff ist einer - sonst bliebe die Schlacht von Plattsburgh eine
// Eigenschaft von Rolf statt ein Punkt, an dem weitere Buecher haengen
// koennen. Merkmale haengen ihrerseits aneinander: die Schlacht am Krieg,
// die Adirondacks am Staat New York, der am Nordosten.
function graph(lang) {
  const knoten = [];
  const kanten = [];
  const gesehen = {};

  const add = (n) => { if (!gesehen[n.id]) { gesehen[n.id] = n; knoten.push(n); } return n.id; };
  const verbinde = (a, b, art) => { if (a && b && a !== b) kanten.push({ a, b, art }); };

  // Ein Merkmal und alles, worin es liegt: Adirondacks -> New York -> Nordosten
  function merkmal(art, schluessel, verzeichnis) {
    const eintrag = verzeichnis[schluessel];
    if (!eintrag) throw new Error("[werkdna] " + art + " '" + schluessel + "' steht nicht im Vokabular");
    const id = art + ":" + schluessel;
    add({
      id, typ: art, key: schluessel,
      label: eintrag[lang],
      jahre: eintrag.jahre || null
    });
    if (eintrag.in) {
      const oben = merkmal(art, eintrag.in, verzeichnis);
      verbinde(id, oben, "teil_von");
    }
    return id;
  }

  WERKE.forEach(w => {
    const id = "werk:" + w.key;
    add({
      id, typ: "werk", key: w.key,
      label: w.titel[lang] || w.titel.de,
      autor: w.autor,
      handlung: w.handlung || null,
      // herkunft ist zweisprachig gefuehrt: die Belegzeile steht auf der
      // englischen Karte sonst auf Deutsch.
      herkunft: (w.herkunft && (w.herkunft[lang] || w.herkunft.de)) || w.herkunft || ""
    });

    const autorId = "autor:" + w.autor;
    add({ id: autorId, typ: "autor", key: w.autor, label: "" });
    verbinde(id, autorId, "autorschaft");

    (w.ereignisse || []).forEach(k => verbinde(id, merkmal("ereignis", k, EREIGNISSE), "ereignis"));
    (w.orte || []).forEach(k => verbinde(id, merkmal("ort", k, ORTE), "ort"));
    (w.motive || []).forEach(k => verbinde(id, merkmal("motiv", k, MOTIVE), "motiv"));
    (w.personen || []).forEach(k => verbinde(id, merkmal("person", k, PERSONEN), "person"));
  });

  // Wirkungslinien: die einzige gerichtete Aussage im Graphen.
  WERKE.forEach(w => (w.wirkung || []).forEach(x => {
    kanten.push({ a: "werk:" + w.key, b: "werk:" + x.ziel, art: "wirkung", beleg: x.beleg });
  }));

  // Die abgeleitete Verwandtschaft zweier Baende bleibt als eigene Kantenart
  // erhalten: sie beantwortet die Frage "was soll ich als Naechstes lesen?"
  // in einem Schritt, waehrend der Weg ueber die Merkmalsknoten erklaert, warum.
  kanten2(lang).forEach(k => kanten.push({
    a: "werk:" + k.a, b: "werk:" + k.b, art: "verwandt",
    gewicht: k.gewicht, gruende: k.gruende
  }));

  return { knoten, kanten };
}

module.exports = {
  vokabular: { orte: ORTE, ereignisse: EREIGNISSE, motive: MOTIVE, personen: PERSONEN },
  werke: WERKE,
  verwandt: { de: kanten2("de"), en: kanten2("en") },
  graph: { de: graph("de"), en: graph("en") }
};
