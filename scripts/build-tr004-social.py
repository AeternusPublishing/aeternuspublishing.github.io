from pathlib import Path
import hashlib
import importlib.util
import json
import re

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = Path('C:/AETERNUS/01_SAEULE_I_ANTHRAZIT_WELTLITERATUR/TR_THEODORE_ROOSEVELT/02_WERKE/TR_004_THROUGH_THE_BRAZILIAN_WILDERNESS_1914')
PACK = WORK / '07_EXPORT/UPLOADPAKET_INGRAM_V4_20261010'
OUT = WORK / '09_SOCIAL_WEB_EN/20261012'
TEMPLATE = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_COHERENCE_20260914')
PDF = PACK / 'INGRAM/9783676051712_cov.pdf'
REPORT = WORK / 'EN_MASTER/UMSCHLAG/BAU_INGRAM_V3_20261010/HC_546/BUILD/build-report.json'

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

assert sha(PDF) == '768f73f9435e17c5e5f892a49a27a8040c1f78941bea680ed7851a2c4d140557'
assert not OUT.exists()
OUT.mkdir(parents=True)
geometry = json.loads(REPORT.read_text(encoding='utf-8'))['geometry']
panels = {}
with pymupdf.open(PDF) as doc:
    for side in ('front', 'back'):
        x, y, w, h = geometry[side + '_rect_in']
        assert (w, h) == (6, 9)
        pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(300 / 72, 300 / 72), clip=pymupdf.Rect(x*72,y*72,(x+w)*72,(y+h)*72), alpha=False)
        im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        # Fractional PDF boundaries can add one render pixel; normalize to the exact trim ratio.
        im = im.resize((1800, 2700), Image.Resampling.LANCZOS)
        p = OUT / f'TR004_{side.upper()}_RAW.jpg'
        im.save(p, quality=96, subsampling=0)
        panels[side] = p
loader = importlib.util.spec_from_file_location('house_cards', TEMPLATE / 'build_instagram_tiles.py')
cards = importlib.util.module_from_spec(loader)
loader.loader.exec_module(cards)
cards.ROOT, cards.HERE = Path('C:/AETERNUS'), OUT
spec = json.loads((TEMPLATE / 'social_tile_spec.json').read_text(encoding='utf-8'))
spec['typography']['header'] = 'AETERNUS · ENGLISH EDITION'
spec['typography']['footer'] = 'CLASSICS REDISCOVERED.'
spec['items'] = [
    {'id':'TR004_FRONT','source':str(panels['front']),'claim':'Into the River of Doubt.','output':'TR004_01_FRONT_1080.jpg'},
    {'id':'TR004_BACK','source':str(panels['back']),'claim':'Theodore Roosevelt · 1914.','output':'TR004_02_BACK_1080.jpg'},
]
outputs = [cards.build_tile(spec, item) for item in spec['items']]
preview = cards.build_contact_sheet(outputs)
(OUT / 'SPEC.json').write_text(json.dumps(spec, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
caption = '''Through the Brazilian Wilderness · Theodore Roosevelt, 1914

Into the River of Doubt.

Roosevelt, Cândido Rondon, Kermit Roosevelt and their companions descended an uncharted river through the Brazilian interior. Rapids, lost canoes, hunger and fever tested a scientific expedition devoted to geography and natural history.

The AETERNUS annotated edition presents the complete text of the 1914 first edition, its three appendices, photographic plates, maps and index, with a new publisher’s apparatus on the expedition, its participants and the work of surveying the river.

ANTHRACITE SERIES · AETERNUS
Hardcover forthcoming. Submitted to IngramSpark; digital proof pending.

aeternuspublishing.com/authors/theodore-roosevelt/

#TheodoreRoosevelt #ThroughTheBrazilianWilderness #RiverOfDoubt #CandidoRondon #Brazil #Exploration #NaturalHistory #AETERNUS
'''
(OUT / 'CAPTION.txt').write_text(caption, encoding='utf-8')
front = Image.open(panels['front'])
asset = ROOT / 'src/assets/images/cover-tr004-en-20261012'
for suffix, size in [('.jpg',(800,1200)),('.webp',(800,1200)),('.avif',(800,1200)),('-fallback.jpg',(1600,2400))]:
    front.resize(size, Image.Resampling.LANCZOS).save(str(asset)+suffix, quality=88)
meta = json.loads((PACK / 'METADATEN/ingram_hardcover.json').read_text(encoding='utf-8'))
short = 'Roosevelt and Rondon descend the River of Doubt. The complete text of the 1914 first edition, with its plates, maps and index and an extensive new publisher’s apparatus.'
book = {
    'id':'en-theodore-roosevelt-through-the-brazilian-wilderness-annotated','work_id':'TR_004','language':'en','title':meta['title'],'subtitle':'','author':'theodore-roosevelt','authorName':'Theodore Roosevelt','contributors':[],
    'series':'anthrazit','series_number':None,'original_title':'Through the Brazilian Wilderness','original_publication_year':1914,
    'isbn':{'hardcover':meta['product']['isbn'],'paperback':None,'ebook':None},'formats':{'hardcover':{'label':'Hardcover','price_display':'US$34.99'}},
    'description':{'short':short,'long':re.sub('<[^>]+>',' ',meta['description_html'])},'publisherDescriptionHTML':meta['description_html'],
    'cover':'/assets/images/cover-tr004-en-20261012.jpg','publication_date':None,'pricing':{'USD':34.99,'GBP':29.99,'EUR':32.99},'availability':'COMING_SOON',
    'links':{'shop':None,'amazon':None,'ingram':None},'distribution_status':{'ingram':'EINGEREICHT','own_shop':'NOT_CONFIGURED'},'commerce':{'shopify_product_id':None,'shopify_handle':None},
    'url':'/books/en-theodore-roosevelt-through-the-brazilian-wilderness-annotated/','authorUrl':'/authors/theodore-roosevelt/','seriesName':'Anthracite Series','seriesColor':'#303236',
    'legacy':{'modal':{'metadata':'544 book pages · Complete English text of the 1914 first edition · 49 plates and three maps · Hardcover forthcoming; digital proof pending','sample':short}},
    'retailer_formats':[{'label':'Hardcover','isbn':meta['product']['isbn'],'price_display':'US$34.99','links':[],'status':'EINGEREICHT'}],
    'provenance':str(PACK / 'METADATEN/ingram_hardcover.json')
}
(ROOT / 'catalog/tr004-en-20261012.json').write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
evidence={'source_pdf':str(PDF),'source_pdf_sha256':sha(PDF),'geometry_report':str(REPORT),'geometry_report_sha256':sha(REPORT),'template_sha256':sha(TEMPLATE/'build_instagram_tiles.py'),'outputs':{p.name:sha(p) for p in outputs},'caption_sha256':sha(OUT/'CAPTION.txt'),'status':'PREPARED','account':'aeternus.publishing','cost_usd':0}
(OUT / 'EVIDENCE.json').write_text(json.dumps(evidence,indent=2)+'\n',encoding='utf-8')
print(preview)
