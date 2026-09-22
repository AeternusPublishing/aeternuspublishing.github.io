const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const catalog = require('../catalog/index.cjs');
const locale = require('../catalog/localization.cjs');
const markets = require('../commerce/markets.json');
const root = path.resolve(__dirname, '..');
const production = process.env.AETERNUS_SITE_MODE === 'production';
const output = path.join(root, production ? 'dist/release' : 'dist/international');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(d => d.isDirectory() ? walk(path.join(dir,d.name)) : [path.join(dir,d.name)]);
const failures = [];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const baseline = require('../tests/international/legacy-baseline.json');
function check(name, fn) {try {fn(); console.log('PASS',name);} catch(e) {failures.push(name+': '+e.message); console.error('FAIL',name,e.message);}}
check('existing German data compatibility', () => {
  const current=require('../src/_data/catalogue.js');
  assert.equal(hash(JSON.stringify(current)),baseline.catalogue_sha256, 'German catalogue differs from baseline');
});
check('German build is byte-identical', () => {
  const after=path.join(root,'work/de-after');
  assert(Object.keys(baseline.html).length>100);
  for(const [file,digest] of Object.entries(baseline.html)) assert.equal(hash(fs.readFileSync(path.join(after,file))),digest,file);
  assert.equal(walk(after).filter(f=>f.endsWith('.html')).length,Object.keys(baseline.html).length);
});
check('catalogue IDs, language and series', () => {
  const schema=require('../catalog/schemas/book.schema.json');
  assert.equal(catalog.series.length,7);
  const ids=new Set();
  for(const b of catalog.englishBooks) {
    for(const field of schema.required) assert(Object.hasOwn(b,field),field);
    if(b.publication_date!==null) assert(/^\d{4}-\d{2}-\d{2}$/.test(b.publication_date)&&new Date(b.publication_date).toISOString().slice(0,10)===b.publication_date);
    assert(!ids.has(b.id),b.id);ids.add(b.id);
    assert.equal(b.language,'en');assert(catalog.series.some(s=>s.id===b.series));
    assert(!['henry-ford','lady-florentia-sale','robert-baden-powell'].includes(b.author));
    assert.equal(catalog.directShopUrl(b,'en'),null);
  }
});
check('Shopify checkout stays gated until activation', () => {
  assert.deepEqual(require('../catalog/books/index.json'),[]);
  const mappings=require('../commerce/product-mappings.json').products;
  assert.equal(mappings.length,15);
  for(const p of mappings){assert.equal(p.status,'DRAFT');assert.equal(p.sales_channels,0);assert.equal(p.inventory_quantity,0);}
  assert.equal(markets.enabled,false);assert.equal(markets.product_population,true);
  assert.equal(require('../commerce/shopify-theme/config/settings_data.json').current.commerce_enabled,false);
});
check('direct-buy gating requires availability and valid product mapping', () => {
  const settings={enabled:true,domains:{de:'shop.aeternus-verlag.de',en:'shop.aeternuspublishing.com'}};
  const book={availability:'AVAILABLE',commerce:{shopify_product_id:'fixture-only',shopify_handle:'fixture-only'}};
  assert.equal(catalog.directShopUrl(book,'en',settings),'https://shop.aeternuspublishing.com/products/fixture-only');
  assert.equal(catalog.directShopUrl(book,'de',settings),'https://shop.aeternus-verlag.de/products/fixture-only');
  assert.equal(catalog.directShopUrl({...book,availability:'COMING_SOON'},'en',settings),null);
  assert.equal(catalog.directShopUrl({...book,commerce:{...book.commerce,shopify_handle:'../checkout'}},'en',settings),null);
  assert.equal(catalog.directShopUrl({...book,commerce:{shopify_handle:'fixture-only'}},'en',settings),null);
});
check('future languages stay unpublished and extensible', () => {
  assert.equal(locale.localePath('en','books/'),'/books/');
  for(const lang of ['es','pl','fr']) assert.equal(locale.localePath(lang,'books/'),null);
  assert.deepEqual(locale.alternatives({en:'books/',es:'libros/',pl:'ksiazki/'}),[{language:'en',path:'/books/'}]);
  assert(!fs.existsSync(path.join(output,'es')));assert(!fs.existsSync(path.join(output,'pl')));
  assert.throws(()=>locale.localePath('en','../secret'));
});
check('market country groups do not overlap', () => {
  const countries=new Set();for(const m of markets.markets) for(const c of m.countries) {assert(!countries.has(c),c);countries.add(c);}
  assert.equal(markets.markets.length,7);
});
check('all local HTML links and assets resolve; SEO matches deployment mode', () => {
  const canonicals=new Set();let count=0;
  for(const file of walk(output).filter(f=>f.endsWith('.html'))) {
    const html=fs.readFileSync(file,'utf8');count++;
    assert.match(html,/<html lang="en">/);
    if(production) assert(!html.includes('noindex'),file); else assert.match(html,/name="robots" content="noindex, nofollow"/);
    const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert(canonical.startsWith('https://aeternuspublishing.com/'));assert(!canonicals.has(canonical));canonicals.add(canonical);
    assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,file);
    assert(!html.includes('BUY DIRECT'),file);
    for(const m of html.matchAll(/(?:href|src)="([^"#]+)[^"]*"/g)) {
      const url=m[1].split(/[?#]/)[0];if(!url.startsWith('/')||url.startsWith('//')) continue;
      const target=path.join(output,url.endsWith('/')?url+'index.html':url);
      assert(fs.existsSync(target),path.relative(output,file)+' -> '+url);
    }
    for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  }
  assert(count>40);assert.equal(fs.readFileSync(path.join(output,'sitemap.xml'),'utf8').includes('<loc>'),production);
  assert.equal(fs.readFileSync(path.join(output,'robots.txt'),'utf8').includes('Disallow: /'),!production);
  assert.equal(fs.readFileSync(path.join(output,'_headers'),'utf8').includes('noindex'),!production);
  console.log('Checked HTML pages:',count);
});
check('English Instagram is linked without automatic third-party loading', () => {
  const home=fs.readFileSync(path.join(output,'index.html'),'utf8');
  assert(home.includes('https://www.instagram.com/aeternus.publishing/'));
  assert(home.includes('data-load-instagram'));
  assert(!/<(?:iframe|script)[^>]+src="https:\/\/[^\"]*(instagram|facebook)/.test(home));
  for(const post of require('../catalog/social.json').instagram.posts) {
    assert(catalog.englishBooks.some(b=>b.id===post.book_id));
    assert(/^https:\/\/www.instagram.com\/p\/[A-Za-z0-9_-]+\/$/.test(post.url));
  }
});
check('theme JSON, sections and translations', () => {
  const theme=path.join(root,'commerce/shopify-theme');
  for(const file of walk(theme).filter(f=>f.endsWith('.json'))) JSON.parse(fs.readFileSync(file,'utf8'));
  for(const name of ['index','product','collection','cart','page']) {
    const template=require(path.join(theme,'templates',name+'.json'));
    for(const section of Object.values(template.sections)) assert(fs.existsSync(path.join(theme,'sections',section.type+'.liquid')));
  }
  const en=require(path.join(theme,'locales/en.default.json')),de=require(path.join(theme,'locales/de.json'));
  for(const file of walk(theme).filter(f=>f.endsWith('.liquid'))) {
    const source=fs.readFileSync(file,'utf8');
    for(const m of source.matchAll(/'([a-z_]+\.[a-z_]+)'\s*\|\s*t/g)) for(const dict of [en,de]) assert(m[1].split('.').reduce((o,k)=>o?.[k],dict),m[1]);
    for(const m of source.matchAll(/{% schema %}([\s\S]*?){% endschema %}/g)) JSON.parse(m[1]);
  }
});
check('planned redirects have real source and target pages', () => {
  const redirects=require('../docs/international/redirects.planned.json');assert.equal(redirects.enabled,false);
  for(const entry of redirects.routes){assert(baseline.html[entry.from.slice(1)+'index.html']);assert(fs.existsSync(path.join(output,entry.to,'index.html')));}
});
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log('All international checks passed.');
