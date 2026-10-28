// Only the four commissioned English routes; no book products or language expansion.
const {commissioned} = require('./wilderness.cjs');
module.exports = commissioned.map(slug=>{
  const world = require(`../editorial/author-worlds/authors/${slug}.json`);
  return {slug,name:world.name,dates:world.dates,tagline:world.locales.en.tagline,metaDescription:world.locales.en.description,
    intro:world.locales.en.intro,portrait:{modern:false},brandOnly:true,books:[],editionStatus:'AWAITING_LIVE'};
});
