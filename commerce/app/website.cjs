// Preview wiring is opt-in and accepts only loopback. Production emits no commerce link.
function previewUrl(language='de',isbn=null,env=process.env){
  if(env.AETERNUS_SITE_MODE==='production' || env.AETERNUS_SHOP_PREVIEW!=='1')return null;
  const base='http://127.0.0.1:8093/shop/';
  return base+`?lang=${language==='en'?'en':'de'}`+(isbn?`&isbn=${encodeURIComponent(String(isbn).replace(/[^0-9]/g,''))}`:'');
}
module.exports={previewUrl};
