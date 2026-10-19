"""Deterministic marketing derivatives; source book files remain unchanged."""
from pathlib import Path
import hashlib
import json
import re
import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = Path('C:/AETERNUS/02_SAEULE_II_GRUEN_MILITAER_EXPEDITIONEN/TR_THEODORE_ROOSEVELT/02_WERKE/TR_002_THE_ROUGH_RIDERS_1899')
PACKAGE = WORK / '08_HANDEL/UPLOADPAKET_TR002_EN_INGRAM_V1_20261008'
OUT = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_TR002_EN_20261008')
OUT.mkdir(parents=True, exist_ok=True)
META = PACKAGE / 'METADATEN/ingram_paperback.json'
meta = json.loads(META.read_text(encoding='utf-8'))
PB = PACKAGE / meta['cover_file'] if 'cover_file' in meta else PACKAGE / meta['product']['cover_file']
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(PB) == meta['cover_sha256']
FRONT, BACK = OUT / 'TR002_EN_FRONT_RAW.jpg', OUT / 'TR002_EN_BACK_RAW.jpg'
with pymupdf.open(PB) as doc:
    p = doc[0]
    trim = p.trimbox
    assert abs(trim.height - 648) < .02
    clips = {'FRONT': pymupdf.Rect(trim.x1-432, trim.y0, trim.x1, trim.y1), 'BACK': pymupdf.Rect(trim.x0, trim.y0, trim.x0+432, trim.y1)}
    for name, destination in [('FRONT', FRONT), ('BACK', BACK)]:
        pix = p.get_pixmap(matrix=pymupdf.Matrix(3, 3), clip=clips[name], alpha=False)
        Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(destination, quality=96, subsampling=0)
    detail = {'source_trimbox': list(trim), 'front_clip': list(clips['FRONT']), 'back_clip': list(clips['BACK']), 'text_excerpt': p.get_text('text', clip=clips['BACK'])[:240], 'purpose': 'Public forthcoming announcement authorized in chat; no print file changes.'}

template = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_JDU001_EN_20261006/baue_karten.py').read_text(encoding='utf-8')
start, end = template.index('W = Path('), template.index('D = B.DESIGN')
code = template[:start] + f'FRONT = Path({str(FRONT)!r})\nPB = Path({str(PB)!r})\nHERE = Path({str(OUT)!r})\n' + template[end:]
code = code.replace('JDU001', 'TR002').replace('Joshua Duke went with it.', 'From Washington to Kettle Hill.')
code = code.replace('detail = B.back_panel(PB, raw, 6.125 / 9.25)', f'detail = {detail!r}')
code = code.replace("Verleger im Chat 06.10.2026: 'auch in instagram als live anlegen im bisherigen design. instagram ENG'", 'Verleger Chat 08.10.2026: ENG Rough Riders Instagram und Website synchronisieren; forthcoming announcement only.')
exec(compile(code, str(Path(__file__)), 'exec'), {'__file__': str(Path(__file__))})
asset = ROOT / 'src/assets/images/cover-tr002-en-v1-20261008.jpg'
with Image.open(FRONT) as im:
    im.thumbnail((1200,1800), Image.Resampling.LANCZOS)
    im.save(asset, quality=94, subsampling=0)

paratext_path = WORK / '04_PARATEXT/VERLAGSPARATEXTE_EN_V3_20261008.md'
paratext = paratext_path.read_text(encoding='utf-8')
bio_section = paratext.split('## 4. Author Portrait', 1)[1].split('\n## 5.', 1)[0]
bio = [re.sub(r'\*+', '', s.strip()) for s in bio_section.split('\n\n') if s.strip() and s.strip() != '---']
heading = bio.pop(0)
short = 'In 1898 Theodore Roosevelt leaves Washington for Cuba. Cowboys, ranchmen and Eastern athletes become a volunteer regiment whose brief campaign will enter American history. The complete English text of the 1899 first edition, with a new publisher’s apparatus.'
image_note = 'All forty-four historical illustrations are included. Forty-three were digitally reconstructed for clarity; fine details were rebuilt and may differ from the originals. The Charles Dana Gibson portrait follows the original drawing in the National Portrait Gallery, Smithsonian Institution.'
description = meta['description_html'] + '<h3>About the illustrations</h3><p>' + image_note + '</p>'
book_id = 'en-theodore-roosevelt-the-rough-riders-annotated'
formats = [('paperback', 'Paperback', '978-3-67605-155-2', 'US$19.99'), ('hardcover', 'Hardcover', '978-3-67605-156-9', 'US$29.99'), ('ebook', 'E-Book', '978-3-67605-157-6', 'US$10.99')]
record = {'author': {'slug':'theodore-roosevelt','name':'Theodore Roosevelt','dates':'1858–1919','eyebrow':'GREEN SERIES · AETERNUS','tagline':'Historian, naturalist, soldier and statesman','intro':'The author of The Rough Riders, writing before the White House.','metaDescription':short,'portrait':{'modern':True,'file':'portrait-roosevelt','alt':'Theodore Roosevelt, after the portrait by Philip Alexius de László, 1908'},'blocks':[{'h':heading,'p':bio}],'publisherPortraitCaption':'After the portrait by Philip Alexius de László, 1908.'}, 'book': {'id':book_id,'work_id':'TR_002','language':'en','title':meta['title'],'subtitle':'','author':'theodore-roosevelt','authorName':'Theodore Roosevelt','contributors':[],'series':'gruen','series_number':None,'original_title':'The Rough Riders','original_publication_year':1899,'isbn':{k:isbn for k,label,isbn,price in formats},'formats':{k:{'label':label,'price_display':price} for k,label,isbn,price in formats},'description':{'short':short,'long':re.sub('<[^>]+>',' ',description)},'publisherDescriptionHTML':description,'cover':'/assets/images/'+asset.name,'publication_date':None,'pricing':{},'availability':'COMING_SOON','links':{'shop':None,'amazon':None,'ingram':None},'distribution_status':{'amazon':'GEBAUT','ingram':'GEBAUT','own_shop':'NOT_CONFIGURED'},'commerce':{'shopify_product_id':None,'shopify_handle':None},'url':'/books/'+book_id+'/','authorUrl':'/authors/theodore-roosevelt/','seriesName':'Green Series','seriesColor':'#30483c','legacy':{'modal':{'metadata':'352 book pages · Complete English text of the 1899 first edition · Four appendices and the Muster-out Roll with 1,349 entries · Paperback, hardcover and e-book forthcoming','sample':short}},'provenance':str(META),'retailer_formats':[{'label':label,'isbn':isbn,'price_display':price,'links':[],'status':'GEBAUT'} for k,label,isbn,price in formats]}}
(ROOT / 'catalog/tr002-en-20261008.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
caption = '''The Rough Riders (Annotated) · Theodore Roosevelt, 1899

From Washington to Kettle Hill.

In 1898 Roosevelt leaves his post as Assistant Secretary of the Navy and goes to war. Cowboys, ranchmen, hunters and law officers serve beside athletes and volunteers from the colleges of the East. Most of their horses remain in Florida. In Cuba, the famous cavalry regiment fights largely on foot.

Roosevelt writes while the campaign is still close and the fallen are still comrades. San Antonio, Tampa, Las Guasimas and Kettle Hill become the history of a regiment that existed for only a few months.

The complete English text of the 1899 first edition, with four appendices, the Muster-out Roll of 1,349 entries, a publisher’s foreword, author portrait, historical afterword, notes and glossary.

All 44 historical illustrations: 43 digitally reconstructed for clarity, with fine details that may differ from the originals; the Gibson portrait follows the original drawing in the National Portrait Gallery.

GREEN SERIES · Military, expeditions and frontiers.
352 book pages. Paperback, hardcover and e-book forthcoming.

aeternuspublishing.com/authors/theodore-roosevelt/

#TheodoreRoosevelt #TheRoughRiders #SpanishAmericanWar #MilitaryHistory #AETERNUS
'''
(OUT / 'CAPTION.txt').write_text(caption,encoding='utf-8')
(OUT / 'SOURCE_BINDINGS.json').write_text(json.dumps({'authority':'Verleger Chat 08.10.2026: da kannst du schon instagram und website sync machen','purpose':'EN announcement; no book release or Ingram upload implied','sources':{str(p):sha(p) for p in [PB,META,paratext_path]},'site_base':'origin/agent/wgs001-web-20261008 d82adfa; current international production lineage, separate from German main'},ensure_ascii=False,indent=2),encoding='utf-8')
