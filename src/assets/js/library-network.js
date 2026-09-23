(() => {
  'use strict';
  const data=JSON.parse(document.querySelector('#library-data').textContent),{ui,lang}=data,de=lang==='de';
  const $=s=>document.querySelector(s),status=$('#library-status'),detail=$('#library-detail'),shelf=$('#library-list');
  if(!window.d3){status.textContent=ui.list;return;}
  const nodes=data.nodes.map(n=>({...n})),byId=new Map(nodes.map(n=>[n.id,n]));
  const links=data.links,books=nodes.filter(n=>n.type==='book'),themes=nodes.filter(n=>n.type==='theme');
  const adjacent=id=>links.filter(l=>l.source===id||l.target===id).map(l=>({node:byId.get(l.source===id?l.target:l.source),link:l}));
  const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  const button=(text,action)=>{const b=make('button',text);b.type='button';b.onclick=action;return b;};
  let mode='map',region='world',selected=null,world=null,width=1200,height=560,visible=[],matches=[],mapError=false;
  const svg=d3.select('#library-graph'),layer=svg.append('g'),mapLayer=layer.append('g').attr('aria-hidden','true'),edgeLayer=layer.append('g').attr('aria-hidden','true'),nodeLayer=layer.append('g');
  const projection=d3.geoNaturalEarth1();
  const zoom=d3.zoom().scaleExtent([.65,6]).on('zoom',e=>layer.attr('transform',e.transform));svg.call(zoom);
  const regionPoints={'north-america':[-100,40],europe:[15,48],africa:[18,1],asia:[88,35]};
  function fit(){if(mode==='map'){const p=regionPoints[region];if(p){const [x,y]=projection(p),k=2;svg.call(zoom.transform,d3.zoomIdentity.translate(width/2-x*k,height/2-y*k).scale(k));}else svg.call(zoom.transform,d3.zoomIdentity);}else if(visible.length){const xs=visible.map(n=>n.x),ys=visible.map(n=>n.y),x0=Math.min(...xs)-70,x1=Math.max(...xs)+70,y0=Math.min(...ys)-65,y1=Math.max(...ys)+65,k=Math.min(1.4,width/(x1-x0),height/(y1-y0));svg.call(zoom.transform,d3.zoomIdentity.translate(width/2-k*(x0+x1)/2,height/2-k*(y0+y1)/2).scale(k));}}
  function select(id,focusPanel=false){if(id){const n=byId.get(id);$('#library-search').value='';if(region!=='world'&&n.geography?.region!==region){region='world';updateRegions();}if(n.language&&$('#library-language').value!=='all'&&$('#library-language').value!==n.language)$('#library-language').value='all';}selected=id;show();render(true);const u=new URL(location.href);if(id)u.searchParams.set('node',id);else u.searchParams.delete('node');history.replaceState(null,'',u);if(focusPanel)detail.querySelector('button')?.focus({preventScroll:true});}
  function show(){detail.replaceChildren();detail.hidden=!selected;if(!selected)return;const n=byId.get(selected);const close=button('×',()=>{const id=selected;select(null);nodeLayer.selectAll('.library-node').filter(n=>n.id===id).node()?.focus({preventScroll:true});});close.className='detail-close';close.setAttribute('aria-label',de?'Details schließen':'Close details');detail.append(close);if(n.cover){const img=make('img',null,'detail-cover');img.src=n.cover;img.alt=n.label;detail.append(img);}detail.append(make('small',n.typeLabel+(n.language?' · '+n.language.toUpperCase():'')),make('h2',n.label));if(n.author)detail.append(make('p',n.author));if(n.summary)detail.append(make('p',n.summary));if(n.geography){const p=make('p',(de?'Schauplatz / Bezugsraum: ':'Setting / reference area: ')+n.geography.place);if(!de)p.lang='de';detail.append(p);}else if(n.type==='book')detail.append(make('small',de?'Noch ohne geografische Zuordnung. Im Bücherregal und im Netzwerk verfügbar.':'Not yet geographically placed. Available in the shelf and network.'));if(n.url){const a=make('a',ui.open);a.href=n.url;detail.append(a);}const related=adjacent(n.id);detail.append(make('h3',ui.detail+' · '+related.length));if(n.type==='theme'&&!related.some(r=>r.node.type==='book'))detail.append(make('p',de?'Zu diesem historischen Raum ist noch keine Ausgabe zugeordnet. Entdecken Sie die Hintergrundtafel oder verwandte Themen.':'No edition is assigned to this historical context yet. Explore its background panel or related themes.'));const ul=make('ul');for(const {node,link} of related){const li=make('li');li.append(make('small',ui.relations[link.type]),button(node.label,()=>select(node.id,true)));if(link.label){const p=make('p',(de?'':'Editorial note (DE): ')+link.label[lang]);if(!de)p.lang='de';li.append(p);}ul.append(li);}detail.append(ul);}
  function render(refit=false){
    const active=document.activeElement?.dataset.node,query=$('#library-search').value.trim().toLocaleLowerCase(),language=$('#library-language').value;
    const allowed=n=>n.type!=='book'||((language==='all'||n.language===language)&&(region==='world'||n.geography?.region===region));
    matches=nodes.filter(n=>allowed(n)&&(!query||(n.label+' '+(n.author||'')).toLocaleLowerCase().includes(query)));
    const matchIds=new Set(matches.map(n=>n.id)),shown=new Set(matchIds);
    if(query)for(const n of matches)for(const r of adjacent(n.id))if(allowed(r.node))shown.add(r.node.id);
    visible=nodes.filter(n=>shown.has(n.id)&&(mode==='network'||(n.type==='book'&&n.geography)));
    const near=new Set(selected?[selected,...adjacent(selected).map(r=>r.node.id)]:[]);
    const clustered=mode==='map'&&width<650&&region==='world'&&!selected&&!query;
    const mappedCount=visible.length;
    if(clustered){const names=de?{'north-america':'Nordamerika',europe:'Europa',africa:'Afrika',asia:'Asien'}:{'north-america':'North America',europe:'Europe',africa:'Africa',asia:'Asia'};visible=Object.entries(regionPoints).map(([key,location])=>{const members=visible.filter(n=>n.geography.region===key);return {id:'region:'+key,type:'region',region:key,label:names[key]+' · '+members.length,typeLabel:de?'Ausgaben':'editions',count:members.length,geography:{location},cover:members.find(n=>n.cover)?.cover};}).filter(n=>n.count);}
    mapLayer.selectAll('*').remove();edgeLayer.selectAll('*').remove();nodeLayer.selectAll('*').remove();
    projection.fitWidth(width-60,{type:'Sphere'}).translate([width/2,height*.49]);
    if(mode==='map'){
      const path=d3.geoPath(projection);mapLayer.append('path').attr('class','atlas-sphere').attr('d',path({type:'Sphere'}));mapLayer.append('path').attr('class','atlas-graticule').attr('d',path(d3.geoGraticule10()));if(world)mapLayer.append('path').attr('class','atlas-land').attr('d',path(world));
      for(const n of visible){const [x,y]=projection(n.geography.location);n.px=x;n.py=y;n.x=x;n.y=y;}
      const sim=d3.forceSimulation(visible).randomSource(d3.randomLcg(.42)).force('x',d3.forceX(n=>n.px).strength(.04)).force('y',d3.forceY(n=>n.py).strength(.04)).force('collide',d3.forceCollide(29)).stop();for(let i=0;i<160;i++){sim.tick();for(const n of visible){n.x=Math.max(28,Math.min(width-28,n.x));n.y=Math.max(width<650?290:225,Math.min(height-295,n.y));}}
      for(const n of visible){n.x=Math.max(28,Math.min(width-28,n.x));n.y=Math.max(width<650?290:225,Math.min(height-295,n.y));}
      edgeLayer.selectAll('.atlas-anchor').data(visible).join('line').attr('class','atlas-anchor').attr('x1',n=>n.px).attr('y1',n=>n.py).attr('x2',n=>n.x).attr('y2',n=>n.y);
    }else{
      for(const n of visible){delete n.x;delete n.y;delete n.vx;delete n.vy;}
      const ids=new Set(visible.map(n=>n.id)),edges=links.filter(l=>ids.has(l.source)&&ids.has(l.target)).map(l=>({...l}));const sim=d3.forceSimulation(visible).randomSource(d3.randomLcg(.42)).force('link',d3.forceLink(edges).id(n=>n.id).distance(120).strength(.3)).force('charge',d3.forceManyBody().strength(-250)).force('collide',d3.forceCollide(40)).force('x',d3.forceX(width/2).strength(.09)).force('y',d3.forceY(height/2).strength(.12)).stop();for(let i=0;i<150;i++)sim.tick();
    }
    const ids=new Set(visible.map(n=>n.id)),drawLinks=links.filter(l=>ids.has(l.source)&&ids.has(l.target)&&(!selected?mode==='network':l.source===selected||l.target===selected));
    edgeLayer.selectAll('.library-edge').data(drawLinks).join('line').attr('class','library-edge').attr('x1',l=>byId.get(l.source).x).attr('y1',l=>byId.get(l.source).y).attr('x2',l=>byId.get(l.target).x).attr('y2',l=>byId.get(l.target).y).style('opacity',selected?.85:.12);
    const g=nodeLayer.selectAll('g').data(visible,n=>n.id).join('g').attr('class','library-node').attr('role','button').attr('tabindex',0).attr('data-node',n=>n.id).attr('aria-label',n=>n.label+' · '+n.typeLabel+(n.language?' · '+n.language.toUpperCase():'' )).attr('aria-pressed',n=>String(n.id===selected)).attr('transform',n=>`translate(${n.x},${n.y})`).style('opacity',n=>selected&&!near.has(n.id)?.18:1).on('click',(e,n)=>{e.stopPropagation();if(n.type==='region'){region=n.region;updateRegions();render(true);}else select(n.id);}).on('keydown',(e,n)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(n.type==='region'){region=n.region;updateRegions();render(true);}else select(n.id,true);}});
    g.append('rect').attr('class','node-frame').attr('x',n=>n.type==='book'?-17:-24).attr('y',-25).attr('width',n=>n.type==='book'?34:48).attr('height',50).attr('rx',n=>n.type==='book'?1:24);
    g.filter(n=>n.cover).append('image').attr('href',n=>n.cover).attr('x',-16).attr('y',-24).attr('width',32).attr('height',48).attr('preserveAspectRatio','xMidYMid meet');
    g.filter(n=>!n.cover).append('text').attr('text-anchor','middle').attr('y',4).text(n=>n.type==='book'?'Ω':n.type==='theme'?'◇':n.type==='author'?'✧':'○');
    g.append('title').text(n=>n.label);g.append('text').attr('class','node-language').attr('text-anchor','middle').attr('y',35).text(n=>n.language?.toUpperCase()||n.typeLabel);
    g.append('text').attr('text-anchor','middle').attr('y',48).text(n=>n.id===selected||query||n.type!=='book'?(n.label.length>28?n.label.slice(0,26)+'…':n.label):'');
    const pool=books.filter(n=>shown.has(n.id)),shelfBooks=selected?pool.filter(n=>near.has(n.id)):pool;
    shelf.replaceChildren();for(const n of shelfBooks){const li=make('li'),b=button('',()=>select(n.id));b.setAttribute('aria-pressed',String(n.id===selected));b.setAttribute('aria-label',n.label+' · '+n.language.toUpperCase());if(n.cover){const img=make('img');img.src=n.cover;img.alt='';img.loading='lazy';b.append(img);}else b.append(make('span','Ω','shelf-placeholder'));const text=make('span');text.append(make('strong',n.label),make('small',n.author+' · '+n.language.toUpperCase()));b.append(text);li.append(b);shelf.append(li);}
    if(!shelfBooks.length)shelf.append(make('li',de?'Keine zugeordneten Bücher in dieser Auswahl.':'No books in this selection.'));
    $('#shelf-title').textContent=selected?byId.get(selected).label+' · '+shelfBooks.length+' '+(de?(shelfBooks.length===1?'Buch':'Bücher'):(shelfBooks.length===1?'book':'books')):(de?'Durch die Bibliothek streifen':'Wander through the library')+' · '+pool.length;
    document.querySelectorAll('#library-themes button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.node===selected)));
    status.textContent=(mode==='map'?mappedCount+' '+(de?'Ausgaben auf der Karte':'editions on the map'):visible.length+' '+(de?'Knoten':'nodes'))+' · '+(de?'Ziehen & zoomen':'Drag & zoom')+(mapError?' · '+(de?'Kartenhintergrund nicht geladen':'Map background unavailable'):'');
    if(!matches.length)status.textContent=ui.none;
    $('.atlas-regions').hidden=mode!=='map';$('.atlas-invitation').hidden=!!selected;
    if(refit)fit();if(active)nodeLayer.selectAll('.library-node').filter(n=>n.id===active).node()?.focus({preventScroll:true});
  }
  for(const n of themes){const b=button(n.label,()=>{region='world';updateRegions();$('#library-search').value='';select(n.id);});b.dataset.node=n.id;$('#library-themes').append(b);}
  function updateRegions(){document.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===region)));}
  document.querySelectorAll('[data-region]').forEach(b=>b.onclick=()=>{region=b.dataset.region;updateRegions();select(null);});
  function changeMode(value){mode=value;$('#library-map').setAttribute('aria-pressed',String(mode==='map'));$('#library-network').setAttribute('aria-pressed',String(mode==='network'));render(true);}
  $('#library-map').onclick=()=>changeMode('map');$('#library-network').onclick=()=>changeMode('network');
  function reset(){selected=null;region='world';$('#library-search').value='';$('#library-language').value='all';updateRegions();select(null);}
  $('#library-reset').onclick=reset;$('#library-search').oninput=()=>select(null);$('#library-language').onchange=()=>select(null);
  $('#library-zoom-in').onclick=()=>svg.call(zoom.scaleBy,1.3);$('#library-zoom-out').onclick=()=>svg.call(zoom.scaleBy,1/1.3);
  for(const [id,direction] of [['#shelf-prev',-1],['#shelf-next',1]])$(id).onclick=()=>shelf.scrollBy({left:direction*shelf.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();select(null);$('#library-reset').focus();}});
  document.querySelector("#library-language").value=lang;
  const initial=new URLSearchParams(location.search).get('node');if(byId.has(initial)){selected=initial;if(byId.get(initial).language)document.querySelector('#library-language').value=byId.get(initial).language;}show();
  new ResizeObserver(entries=>{const box=entries[0].contentRect;width=Math.max(320,box.width);height=Math.max(250,box.height);svg.attr('viewBox',`0 0 ${width} ${height}`);render(true);}).observe($('.library-canvas'));
  fetch('/assets/data/land-110m.json').then(r=>{if(!r.ok)throw Error('Map');return r.json();}).then(w=>{world=topojson.feature(w,w.objects.land);render();}).catch(()=>{mapError=true;render();});
})();
