from pathlib import Path
import hashlib
import html
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
WORK = Path('C:/AETERNUS/02_SAEULE_II_GRUEN_MILITAER_EXPEDITIONEN/CVFT_CHARLES_VERE_FERRERS_TOWNSHEND/02_WERKE/CVFT_001_MY_CAMPAIGN_IN_MESOPOTAMIA_1920')
SOURCE = WORK / '08_SOCIAL_WEB_EN/WEBSITE_INSTAGRAM_20261012'
OUT = WORK / '00_ADMIN/CODEX_UPLOAD_20261012'
manifest = json.loads((SOURCE/'MANIFEST.json').read_text(encoding='utf-8'))
for name, expected in manifest.items():
    assert hashlib.sha256((SOURCE/name).read_bytes()).hexdigest() == expected, name
OUT.mkdir(parents=True, exist_ok=True)
text = json.loads((SOURCE/'WEBSEITE_TEXTE.json').read_text(encoding='utf-8'))
for name in manifest:
    if name.endswith(('.jpg','.webp')) and not name.startswith('instagram_'):
        shutil.copy2(SOURCE/name, ROOT/'src/assets/images'/name)
author = {
    'slug':text['author_slug'],'name':text['author_name_on_book'],'dates':text['author_dates'],
    'eyebrow':'GREEN SERIES · AETERNUS','tagline':'','intro':'',
    'metaDescription':'Charles Vere Ferrers Townshend, My Campaign in Mesopotamia, in an annotated English AETERNUS edition.',
    'portrait':{'modern':True,'fallback':True,'file':'portrait-charles-vere-ferrers-townshend','alt':text['author_portrait_caption'][0]},
    'publisherPortraitCaptionLines':text['author_portrait_caption'],
    'aboutParagraphs':text['about_the_author'],'blocks':[]
}
book_id = 'en-charles-vere-ferrers-townshend-my-campaign-in-mesopotamia-annotated'
desc = '<ul>'+''.join('<li>'+html.escape(x)+'</li>' for x in text['features'])+'</ul>'
desc += '<blockquote><p>'+html.escape(text['press_quote']['text'])+'</p><cite>'+html.escape(text['press_quote']['source'])+'</cite></blockquote>'
desc += ''.join('<p>'+html.escape(x)+'</p>' for x in text['blurb'])
desc += '<p>First published: '+html.escape(text['first_edition'])+'</p>'
formats = {}
isbns = {}
retailer = []
for fmt in text['formats']:
    key=fmt['form'].lower()
    formats[key]={'label':fmt['form'],'price_display':'US$'+fmt['price_usd']}
    isbns[key]=fmt['isbn']
    retailer.append({'label':fmt['form'],'isbn':fmt['isbn'],'pages':fmt['pages'],'price_display':'US$'+fmt['price_usd'],'links':[],'status':'FREIGEGABEN'})
book = {'id':book_id,'work_id':'CVFT_001','language':'en','title':text['book_title']+' (Annotated)','subtitle':'',
    'author':text['author_slug'],'authorName':text['author_name'],'contributors':[],'series':'gruen','series_number':None,
    'original_title':text['book_title'],'original_publication_year':1920,'isbn':isbns,'formats':formats,
    'description':{'short':text['blurb'][1],'long':'\n\n'.join(text['blurb'])},'publisherDescriptionHTML':desc,
    'cover':'/assets/images/cover-front-my-campaign-in-mesopotamia-townshend-en.jpg',
    'coverWebp':'/assets/images/cover-front-my-campaign-in-mesopotamia-townshend-en.webp',
    'backcover':'/assets/images/cover-back-my-campaign-in-mesopotamia-townshend-en.jpg',
    'backcoverWebp':'/assets/images/cover-back-my-campaign-in-mesopotamia-townshend-en.webp',
    'publication_date':text['publication_date'],'pricing':{},'availability':'COMING_SOON','forthcoming_label':'Forthcoming · 20 October 2026',
    'links':{'shop':None,'amazon':None,'ingram':None},'distribution_status':{'ingram':'FREIGEGEBEN','own_shop':'NOT_CONFIGURED'},
    'commerce':{'shopify_product_id':None,'shopify_handle':None},'url':'/books/'+book_id+'/',
    'authorUrl':'/authors/'+text['author_slug']+'/','seriesName':'Green Series','seriesColor':'#2d4a22',
    'legacy':{'modal':{'metadata':'628 book pages · 630 pages in the Ingram editions · Paperback and hardcover forthcoming, 20 October 2026','sample':text['blurb'][1]}},
    'retailer_formats':retailer,'provenance':str(SOURCE/'WEBSEITE_TEXTE.json')}
(ROOT/'catalog/cvft001-en-20261012.json').write_text(json.dumps({'author':author,'book':book},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'SOURCE_BINDINGS.json').write_text(json.dumps({'material_manifest':manifest,'site_base':'76b6218','authority':'CODEX_PROMPT_CVFT001_EN_WEBSITE_INGRAM_INSTAGRAM_20261012.md'},indent=2)+'\n',encoding='utf-8')
print('Prepared Townshend website data and verified 9 source hashes')
