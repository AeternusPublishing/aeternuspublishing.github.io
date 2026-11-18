const graph=require('./library-graph.json');
const labels={de:{title:'Bücher & Themen',intro:'Eine Bibliothek voller Verbindungen. Entdecken Sie Bücher, historische Themen, Autoren und Reihen – im deutschen und englischen Programm.',search:'Buch, Thema oder Autor suchen',all:'Alle Sprachen',de:'Deutsche Ausgaben',en:'Englische Ausgaben',reset:'Gesamtes Netzwerk',map:'Zur geografischen Weltkarte',hint:'Ein Buch oder Thema auswählen: Die direkten Verbindungen werden sichtbar. Ziehen und zoomen Sie die Ansicht.',empty:'Wählen Sie einen Knoten im Graphen oder in der Liste.',open:'Seite öffnen →',list:'Alle Bücher und Themen als Liste',types:{book:'Buch',theme:'Historisches Thema',author:'Autor',series:'Reihe'},relations:{series:'Gleiche Verlagsreihe',author:'Verfasser',context:'Historischer Zusammenhang',curated:'Redaktionelle Verbindung',related:'Verwandtes Thema',parent:'Übergeordneter Zusammenhang'},note:'Reihen und Autoren zeigen bibliografische Zugehörigkeit. Thematische Verbindungen folgen den redaktionellen Zuordnungen. Themen ohne zugeordnete Ausgabe bleiben sichtbar.',none:'Keine Treffer. Suche oder Sprachfilter zurücksetzen.',detail:'Verbindungen',close:'Auswahl zurücksetzen'},en:{title:'Books & Themes',intro:'A library of connections. Explore books, historical contexts, authors and series across our German and English programme.',search:'Find a book, theme or author',all:'All languages',de:'German editions',en:'English editions',reset:'Full network',map:'Geographical atlas (German)',hint:'Select a book or theme to reveal its direct connections. Drag and zoom to explore.',empty:'Select a node in the graph or in the list.',open:'Open page →',list:'All books and themes as a list',types:{book:'Book',theme:'Historical theme',author:'Author',series:'Series'},relations:{series:'Publishing series',author:'Written by',context:'Historical context',curated:'Editorial connection',related:'Related theme',parent:'Wider context'},note:'Series and authors indicate bibliographic membership. Thematic links follow editorial assignments. Themes without an assigned edition remain visible. Book titles retain their edition language; original German editorial notes are labelled.',none:'No matches. Clear the search or language filter.',detail:'Connections',close:'Clear selection'}};
const english = require('./library-translations-en.json');
module.exports = lang => {
  const ui = labels[lang];
  const origin = lang === 'en' ? 'https://aeternuspublishing.com' : 'https://aeternus-verlag.de';
  const canonical = new Map();
  if (lang === 'en') {
    const englishBooks = require('../catalog/index.cjs').englishBooks;
    const numbers = book => new Set([...(typeof book.isbn === 'string' ? [book.isbn] : Object.values(book.isbn || {})), ...(Array.isArray(book.formats) ? book.formats.map(f => f.isbn) : [])].filter(Boolean).map(n => n.replace(/-/g, '')));
    for (const book of require('../src/_data/catalogue').books.filter(b => b.language === 'en')) {
      const isbns = numbers(book);
      const match = englishBooks.find(b => [...numbers(b)].some(n => isbns.has(n)));
      if (match) canonical.set('book:de:' + book.id, 'book:' + match.id);
    }
  }
  const nodes = graph.nodes.filter(n => !canonical.has(n.id)).map(n => ({ ...n, cover: n.cover?.startsWith(origin + '/') ? n.cover.slice(origin.length) : n.cover, label: n.label[lang], url: n.url?.[lang], summary: n.summary?.[lang] || '', typeLabel: ui.types[n.type],
    ...(lang === 'en' && n.geography ? { geography: { ...n.geography, place: english.places[n.geography.place] || n.geography.place } } : {}) }));
  const seen = new Set();
  const links = graph.links.map(link => ({ ...link, source: canonical.get(link.source) || link.source, target: canonical.get(link.target) || link.target,
    ...(lang === 'en' && link.label?.en && english.connections[link.label.en] ? { label: { ...link.label, en: english.connections[link.label.en] } } : {}) })).filter(link => {
      const key = [link.source, link.target].sort().join('|') + '|' + link.type;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  const aliases = { ...Object.fromEntries(Object.entries(graph.aliases || {}).map(([id, target]) => [id, canonical.get(target) || target])), ...Object.fromEntries(canonical) };
  return { lang, ui, nodes: nodes.filter(n => ['book', 'theme'].includes(n.type) && (n.type !== 'book' || n.language === lang)), payload: JSON.stringify({ ...graph, nodes, links, aliases, ui, lang }).replace(/</g, '\\u003c') };
};
