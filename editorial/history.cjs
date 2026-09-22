const data = require('./historical-themes.json');
const routes = { de: '/reihen/gruen/historischer-hintergrund/', en: '/series/gruen/historical-background/' };
const origins = { de: 'https://aeternus-verlag.de', en: 'https://aeternuspublishing.com' };
const labels = {
  de: {title:'Historischer Hintergrund',series:'Reihe GRÜN',intro:'Ein Buch öffnet einen historischen Raum. Hier führen kurze Tafeln von einzelnen Erfahrungen zu den größeren Zusammenhängen: zu Grenzregionen, Feldzügen, politischen Umbrüchen und den Wegen der Erkundung. Den Anfang bilden sechs Schauplätze und Themen des 19. Jahrhunderts. Mit dem Programm wächst auch diese historische Bibliothek.',period:'Zeitraum',regions:'Regionen',keywords:'Schlüsselthemen',read:'Historischen Zusammenhang entdecken',books:'Bücher aus diesem historischen Zusammenhang',empty:'Zu diesem Thema ist derzeit noch keine Ausgabe in diesem Sprachkatalog verzeichnet.',related:'Verbundene Themen',children:'Vertiefungen',parents:'Übergeordnete Zusammenhänge',sources:'Quellen und weiterführende Lektüre',back:'Alle historischen Themen',context:'Historischer Zusammenhang',count:'Ausgaben im Sprachkatalog',switch:'Read in English',meta:'Historische Zusammenhänge entdecken: Great Game, Nordwestgrenze, Sudan, Ashanti, Abessinien und Vermessung. Die historische Bibliothek von AETERNUS.'},
  en: {title:'Historical Background',series:'GREEN SERIES',intro:'Every book opens onto a larger world. These short historical panels connect individual experiences with campaigns, borderlands, political change and the work of exploration. Six subjects from the nineteenth century begin a historical library that will grow with the publishing programme.',period:'Period',regions:'Regions',keywords:'Key themes',read:'Explore the historical context',books:'Books in this Historical Context',empty:'No edition in this language is currently listed for this historical context.',related:'Connected themes',children:'Explore in greater depth',parents:'Wider contexts',sources:'Sources and further reading',back:'All historical themes',context:'Historical Context',count:'editions in this language catalogue',switch:'Auf Deutsch lesen',meta:'Explore the Great Game, North-West Frontier, Sudan, Ashanti, Abyssinia and military surveying through the AETERNUS historical library.'}
};
function validate(themes=data.themes) {
  const ids=new Set();
  for(const t of themes){if(ids.has(t.id))throw Error('Duplicate theme '+t.id);ids.add(t.id);}
  for(const lang of Object.keys(routes)){
    const slugs=new Set();
    for(const t of themes){const l=t.locales[lang];if(!l||!l.title||!l.subtitle||!l.body?.length||!l.period||!l.regions?.length||!l.keywords?.length||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(l.slug))throw Error('Invalid locale '+t.id+'/'+lang);if(slugs.has(l.slug))throw Error('Duplicate slug');slugs.add(l.slug);}
  }
  for(const t of themes)for(const id of [...t.parentIds,...t.relatedIds])if(!ids.has(id)||id===t.id)throw Error('Invalid theme edge '+t.id+' -> '+id);
  function visit(id,stack=[]){if(stack.includes(id))throw Error('Theme hierarchy cycle');for(const parent of themes.find(t=>t.id===id).parentIds)visit(parent,[...stack,id]);}
  for(const t of themes)visit(t.id);
  return true;
}
validate();
function create(lang,books,themes=data.themes){
  validate(themes);
  const other=lang==='de'?'en':'de';
  const url=t=>routes[lang]+t.locales[lang].slug+'/';
  const link=t=>({id:t.id,title:t.locales[lang].title,url:url(t)});
  const views=themes.map(t=>{
    const refs=t.bookRefs[lang]||[];
    const matched=refs.map(id=>{const book=books.find(b=>b.id===id);if(!book)throw Error('Unknown book '+id+' for '+t.id);return book;});
    const local=t.locales[lang];
    return {...t,...local,url:url(t),books:matched,description:local.subtitle+' · '+local.body[0].split('. ')[0]+'.',alternates:{de:origins.de+routes.de+t.locales.de.slug+'/',en:origins.en+routes.en+t.locales.en.slug+'/'},otherUrl:origins[other]+routes[other]+t.locales[other].slug+'/',parents:t.parentIds.map(id=>link(themes.find(x=>x.id===id))),children:themes.filter(x=>x.parentIds.includes(t.id)).map(link),related:t.relatedIds.map(id=>link(themes.find(x=>x.id===id)))};
  });
  const byBook={};for(const t of views)for(const b of t.books)(byBook[b.id]??=[]).push({id:t.id,title:t.title,url:t.url});
  return {lang,labels:labels[lang],base:routes[lang],seriesUrl:lang==='de'?'/reihen/gruen/':'/series/gruen/',alternates:{de:origins.de+routes.de,en:origins.en+routes.en},otherUrl:origins[other]+routes[other],themes:views,byBook};
}
module.exports={create,validate,data,routes,origins};
