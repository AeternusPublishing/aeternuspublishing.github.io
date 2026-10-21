const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '../editorial/author-worlds/authors');
const profiles = fs.readdirSync(root).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')));
const index = new Map(profiles.map(p => [p.slug, p]));
const labels = {
  de: {context:'Leben und Werk',about:'Historischer Überblick',origin:'Herkunft und frühe Jahre',career:'Lebensweg',literature:'Das literarische Werk',legacy:'Das Vermächtnis',timeline:'Stationen des Lebens',honours:'Auszeichnungen und Würden',moreHonours:'Weitere Ehrungen',places:'Historische Schauplätze',connections:'Verbundene Autoren',sources:'Historische Quellen und weiterführende Literatur',gallery:'Historische Bilder und Dokumente',read:'Leben und Werk vertiefen',works:'Zu den Ausgaben',order:'Orden',decoration:'Auszeichnung',prize:'Preis',title:'Würde',academic:'Akademische Ehrung',otherLanguage:'englische Autorenseite'},
  en: {context:'Life and work',about:'A life in context',origin:'Origins and early years',career:'The course of a life',literature:'The literary work',legacy:'The legacy',timeline:'A life in dates',honours:'Honours and distinctions',moreHonours:'Further distinctions',places:'Historical places',connections:'Connected authors',sources:'Historical sources and further reading',gallery:'Historical images and documents',read:'Explore the life and work',works:'Return to the editions',order:'Order',decoration:'Decoration',prize:'Prize',title:'Title',academic:'Academic honour',otherLanguage:'English author page'}
};
function get(slug,lang) {
  const p=index.get(slug);
  if(['de','en'].includes(lang)&&!p?.locales[lang]) throw new Error(`Missing editorial author profile: ${slug}/${lang}. New authors and languages require an explicit editorial brief.`);
  if(!p?.locales[lang]) return null;
  const connections=(p.connections||[]).map(c=>{
    const target=index.get(c.slug);
    if(!target) throw new Error(`Unknown author connection: ${p.slug} → ${c.slug}`);
    const targetLang=target.scope[lang]?lang:'en';
    return {...c,name:target.name,text:c[lang]||c.en,url:targetLang==='de'?`https://aeternus-verlag.de/autoren/${c.slug}/`:`https://aeternuspublishing.com/authors/${c.slug}/`,languageNote:targetLang!==lang?labels[lang].otherLanguage:null};
  });
  return {...p,...p.locales[lang],lang,labels:labels[lang],rankLine:p.rank?.[lang],portrait:['verified','publisher-approved'].includes(p.image.status)?{file:p.image.file,caption:p.image.caption[lang],source:p.image.provenance}:null,
    timeline:(p.timeline||[]).filter(row=>row[lang==='de'?2:1]).map(row=>({date:row[0],text:row[lang==='de'?2:1]})),
    places:(p.places||[]).filter(item=>item[lang]).map(item=>({title:item[lang][0],text:item[lang][1]})),connections,
    honours:(p.honours||[]).map(h=>({...h,name:h.localName?.[lang]||h.name,categoryLabel:labels[lang][h.category],note:h.note?.[lang]})),
    gallery:(p.gallery||[]).filter(g=>g.caption[lang]).map(g=>({...g,caption:g.caption[lang]}))};
}
function englishBooks(slug,absolute=false){return require('./index.cjs').englishBooks.filter(b=>b.author===slug).map(b=>({...b,url:absolute?'https://aeternuspublishing.com'+b.url:b.url}));}
function profileSchema(world,origin,route){return {'@context':'https://schema.org','@type':'ProfilePage',name:world.name,inLanguage:world.lang,url:origin+route,mainEntity:{'@type':'Person',name:world.name,description:world.intro}};}
function plugin(config){config.addFilter('authorWorld',get);config.addFilter('worldEnglishBooks',englishBooks);config.addFilter('authorWorldSchema',profileSchema);}
module.exports={profiles,get,plugin};
