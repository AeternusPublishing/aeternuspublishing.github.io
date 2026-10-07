const $=s=>document.querySelector(s);
const node=(tag,text,cls)=>{const n=document.createElement(tag); if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
let lang=new URL(location.href).searchParams.get('lang') || localStorage.getItem('aeternus-language') || 'de';
let catalog, quote;
let limit=12;
const cart=JSON.parse(localStorage.getItem('aeternus-cart') || '{}');
const order=new URL(location.href).searchParams.get('order');
let active=order || sessionStorage.getItem('aeternus-active-order');
const tr=(de,en)=>lang==='de'?de:en;
const money=(cents,currency)=>new Intl.NumberFormat(lang,{style:'currency',currency}).format(cents/100);
async function api(path,body) {
  const response=await fetch(path,{...(body!==undefined?{method:'POST',body:JSON.stringify(body)}:{}),headers:{'Content-Type':'application/json',...(active?{'X-Order-Token':sessionStorage.getItem(`aeternus-order-${active}`)||''}:{})}});
  const data=await response.json(); if(!response.ok)throw new Error(data.error);return data;
}
const message=error=>{$('#message').textContent=error.message || error;};
function translate(){document.documentElement.lang=lang;document.querySelectorAll('[data-de]').forEach(n=>{
  const text=n.dataset[lang]; if(n.firstChild?.nodeType===Node.TEXT_NODE)n.firstChild.nodeValue=text; else n.textContent=text;
});$('#language').textContent=tr('English','Deutsch');}
function render(){
  translate(); const currency=catalog.countries[$('#country').value]; const list=$('#catalog');list.replaceChildren();
  const needle=$('#search').value.toLowerCase();const editionLanguage=$('#edition-language').value;
  const filtered=catalog.items.filter(b=>(editionLanguage==='all'||b.language===editionLanguage)&&`${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(needle));
  $('#catalog-count').textContent=`${filtered.length} ${tr('Ausgaben · Alle im Testbetrieb','editions · All in test mode')}`;
  $('#more').hidden=filtered.length<=limit;
  for(const b of filtered.slice(0,limit)){
    const card=node('article',undefined,'book'); let art=node('div',undefined,'book-art');
    art.append(node('span',b.author,'small'),node('strong',b.title),node('span','AETERNUS · VORSCHAU','small'));
    if(b.cover){art=node('img');art.src=b.cover;art.alt=b.title;art.className='book-image';art.loading='lazy';}
    const available=(catalog.simulation||b.approved)&&Number.isSafeInteger(b.prices[currency])&&b.prices[currency]>0;
    const copy=node('div');copy.append(node('span',b.language==='en'?tr('ENGLISCHE AUSGABE','ENGLISH EDITION'):tr('DEUTSCHE AUSGABE','GERMAN EDITION'),'eyebrow'),node('h3',b.title),node('p',b.author),node('p',`${b.format} · ISBN ${b.isbn}`,'format'),node('p',available?money(b.prices[currency],currency):tr('Noch nicht freigegeben','Not yet approved'),'price'));
    const add=node('button',available?tr('In den Warenkorb','Add to basket'):tr('Noch nicht bestellbar','Not available yet'),'primary'); add.disabled=!available;add.onclick=()=>{cart[b.sku]=Math.min(10,(cart[b.sku]||0)+1);changed();};copy.append(add);card.append(art,copy);list.append(card);
  }
  $('#cart-items').replaceChildren();let sum=0,count=0;
  for(const [sku,quantity] of Object.entries(cart)){const b=catalog.items.find(i=>i.sku===sku);if(!b||(!catalog.simulation&&!b.approved)||!Number.isSafeInteger(b.prices[currency])||b.prices[currency]<=0){delete cart[sku];continue;}
    const row=node('div',undefined,'cart-row');row.append(node('strong',`${b.title} · ${b.format}`));
    const input=node('input');input.type='number';input.min='1';input.max='10';input.value=quantity;input.setAttribute('aria-label',tr('Anzahl','Quantity'));input.onchange=()=>{cart[sku]=Math.max(1,Math.min(10,Number(input.value)||1));changed();};
    const remove=node('button',tr('Entfernen','Remove'));remove.onclick=()=>{delete cart[sku];changed();};
    row.append(input,node('span',money(b.prices[currency]*quantity,currency)),remove);$('#cart-items').append(row);sum+=b.prices[currency]*quantity;count+=quantity;
  }
  if(!count)$('#cart-items').append(node('p',tr('Ihr Warenkorb ist noch leer.','Your basket is empty.')));
  $('#cart-total').textContent=tr('Bücher: ','Books: ')+money(sum,currency)+tr(' · Versand wird berechnet.',' · Shipping calculated next.');
  $('#cart-link').textContent=tr('Warenkorb','Basket')+` (${count})`;
}
function changed(){localStorage.setItem('aeternus-cart',JSON.stringify(cart));quote=null;$('#quote').replaceChildren();render();}
$('#country').onchange=changed;
$('#search').oninput=()=>{limit=12;render();};$('#edition-language').onchange=()=>{limit=12;render();};$('#more').onclick=()=>{limit+=12;render();};
$('#language').onclick=()=>{lang=lang==='de'?'en':'de';localStorage.setItem('aeternus-language',lang);render();if(active)refresh().catch(message);};
$('#address').onsubmit=async event=>{event.preventDefault();try{
  const form=Object.fromEntries(new FormData(event.target));const email=form.email;delete form.email;form.country_code=$('#country').value;
  quote=await api('/api/quote',{email,language:lang,address:form,items:Object.entries(cart).map(([sku,quantity])=>({sku,quantity}))});
  active=quote.id;sessionStorage.setItem('aeternus-active-order',active);sessionStorage.setItem(`aeternus-order-${active}`,quote.token);
  const area=$('#quote');area.replaceChildren();area.append(node('p',`${tr('Bücher','Books')}: ${money(quote.merchandise,quote.currency)} · ${tr('Versand','Shipping')}: ${money(quote.delivery,quote.currency)}`),node('p',tr('Gesamt: ','Total: ')+money(quote.total,quote.currency),'total'));
  const label=node('label');const check=node('input');check.type='checkbox';label.append(check,document.createTextNode(tr(' Ich habe verstanden: ausschließlich Testbestellung, keine echte Zahlung.',' I understand: test order only, no real payment.')));
  const pay=node('button',tr('Testbestellung fortsetzen','Continue test order'),'primary');pay.disabled=true;check.onchange=()=>pay.disabled=!check.checked;
  pay.onclick=async()=>{pay.disabled=true;try{const result=await api(`/api/orders/${active}/checkout`,{accepted_test:true});location.assign(result.url);}catch(error){message(error);pay.disabled=false;}};
  area.append(label,pay);$('#message').textContent='';
}catch(error){message(error);}};
async function refresh(){if(!active)return;const data=await api(`/api/orders/${active}`);$('#status').hidden=false;
  const area=$('#order-status');area.replaceChildren();area.append(node('p',`${tr('Bestellung','Order')} ${data.id.slice(0,8)}`),node('p',data.status,'badge'),node('p',tr('Gesamt: ','Total: ')+money(data.total,data.currency)));
  for(const i of data.items)area.append(node('p',`${i.quantity} × ${i.title} · ${i.format}`));
  if(data.status==='PAYMENT_PENDING')area.append(node('p',tr('Die Zahlung wartet. In der lokalen Verwaltung kann sie simuliert werden.','Payment is pending. It can be simulated in local administration.')));
  $('#withdrawal').hidden=['QUOTED','PAYMENT_PENDING'].includes(data.status);
}
$('#refresh').onclick=()=>refresh().catch(message);
$('#withdrawal').onsubmit=async event=>{event.preventDefault();try{const result=await api(`/api/orders/${active}/withdrawal`,{note:new FormData(event.target).get('note')});$('#withdrawal-result').textContent=tr('Widerruf eingegangen. Vorgang: ','Withdrawal received. Reference: ')+result.request_id;}catch(error){message(error);}};
try{catalog=await api('/api/catalog');if(!catalog.simulation)$('#testbar').textContent='SANDBOX · Testzahlungen / Testdruckaufträge';render();await refresh();}catch(error){message(error);}
