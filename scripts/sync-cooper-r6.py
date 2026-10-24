"""Derive web and social assets from released Cooper R6 covers; never edit print files."""
import hashlib
import html
import importlib.util
import json
import re
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('C:/AETERNUS/01_SAEULE_I_ANTHRAZIT_WELTLITERATUR/JFC_JAMES_FENIMORE_COOPER/04_PRODUCTION/COOPER_LEITSTAND_20261022/PRODUKTION_R6_20261024')
OUT = Path('C:/AETERNUS/00_BETRIEBSDATEN/COORDINATION/CODEX_TO_CLAUDE/COOPER_WEB_SOCIAL_20261024')
FONTS = Path('C:/_CB/NUR_WERKZEUG_MAIN/BUCHSATZ/fonts')
ROMAN = ['I', 'II', 'III', 'IV', 'V']
YEARS = [1841, 1826, 1840, 1823, 1827]
TITLE_IDS = ['CSS9769364', 'CSS9769557', 'CSS9769846', 'CSS9770115', 'CSS9770132']
EXPECTED = ['9772439419478e53a708270c2d20c48f128727a83846178353a43020e96f6ac9', '','87b31bcb917c157df175e7cb028ea73fb720c606f7dd0fa36487a2de88dfb4d0','ec4f816161765235e0d736bdfe8e92018a4d0519a1ba6c11863a4611e3b1e160','a4bc168cc13719982837b85ea71dce659c02c0c30c23040e971d58acf315f9d5']

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

RENDERER = Path('C:/_CB/NUR_WERKZEUG_MAIN/TOOLS/social_house_en/render.py')
module_spec = importlib.util.spec_from_file_location('social_house_en', RENDERER)
house = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(house)
HOUSE_SPEC = json.loads(RENDERER.with_name('houseform_v1.json').read_text(encoding='utf-8'))
HOUSE_FONTS = dict(display=FONTS/'Cinzel-Regular.ttf',serif=FONTS/'CormorantGaramond-Regular.ttf')

OUT.mkdir(parents=True,exist_ok=True)
books, evidence, cards = [], [], []
old = json.loads((ROOT/'catalog/coo001-en-20261008.json').read_text(encoding='utf-8'))
author = old['author']
author['metaDescription'] = 'James Fenimore Cooper and The Leatherstocking Tales: five complete English AETERNUS hardcover volumes, from The Deerslayer to The Prairie.'
author['publisherEditionHTML'] = '<h2>The Leatherstocking Tales</h2><p>The five novels follow Natty Bumppo from youth to old age: The Deerslayer, The Last of the Mohicans, The Pathfinder, The Pioneers and The Prairie.</p><p>Five complete English hardcover volumes, arranged in the chronological order of his life. Submitted to IngramSpark; retail availability will follow after review.</p>'
for i, roman in enumerate(ROMAN):
    package = SOURCE/f'UPLOADPAKET_COO_{i+1:03d}_EN_INGRAM_HC_R6_20261024'
    metadata = package/'METADATEN/ingram_hardcover.json'
    m = json.loads(metadata.read_text(encoding='utf-8'))
    spec = json.loads((SOURCE/f'COO_{roman}_R6_INGRAM_HC.cover-spec.json').read_text(encoding='utf-8'))
    isbn = spec['metadata']['isbn13']
    pdf = package/f'INGRAM/{isbn.replace("-", "")}_cov.pdf'
    if EXPECTED[i]:
        assert sha(pdf)==EXPECTED[i]
    build = next((SOURCE/f'BAU_UMSCHLAG_{roman}').rglob('build-report.json'))
    geometry = json.loads(build.read_text(encoding='utf-8'))['geometry']
    # Bind the production build to the released package bytes for every volume.
    assert sha(build.parent/'cover.pdf')==sha(pdf)
    x,y,w,h = geometry['front_rect_in']
    assert (w,h)==(6.,9.)
    clip=pymupdf.Rect(x*72,y*72,(x+w)*72,(y+h)*72)
    with pymupdf.open(pdf) as doc:
        pix=doc[0].get_pixmap(matrix=pymupdf.Matrix(3,3),clip=clip,alpha=False)
        panel=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
    raw=OUT/f'COO_{i+1:03d}_FRONT.png'
    panel.save(raw)
    asset=f'cover-coo{i+1:03d}-en-ingram-hc-r6-20261024'
    web=panel.resize((800,1200),Image.Resampling.LANCZOS)
    for ext in ['jpg','webp']:
        web.save(ROOT/f'src/assets/images/{asset}.{ext}',quality=92)
    web.save(ROOT/f'src/assets/images/{asset}-fallback.jpg',quality=92)
    title=spec['metadata']['title']
    slug=re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-')
    book_id=f'en-james-fenimore-cooper-{slug}'
    desc=m['description_html']
    paragraphs=re.findall(r'<p>(.*?)</p>',desc,flags=re.S)
    summary=html.unescape(re.sub('<[^>]+>','',paragraphs[0]))
    pages=spec['metadata']['edition_page_count']
    books.append(dict(id=book_id,work_id=f'COO_{i+1:03d}',language='en',title=title,subtitle=m['subtitle'],author=author['slug'],authorName=author['name'],contributors=[],series='bernstein',series_number=None,original_title=f'{title}: {m["subtitle"]}',original_publication_year=YEARS[i],isbn=dict(hardcover=isbn,paperback=None,ebook=None),formats=dict(hardcover=dict(label='Hardcover',isbn=isbn,pages=pages)),description=dict(short=summary,long='\n\n'.join(html.unescape(re.sub('<[^>]+>','',p)) for p in paragraphs)),publisherDescriptionHTML=desc,cover=f'/assets/images/{asset}.jpg',coverWebp=f'/assets/images/{asset}.webp',publication_date=None,pricing={},availability='COMING_SOON',forthcoming_label='Hardcover forthcoming',cardStatus='Hardcover forthcoming',links=dict(shop=None,amazon=None,ingram=None),distribution_status=dict(ingram='EINGEREICHT',amazon='NOT_CONFIGURED',own_shop='NOT_CONFIGURED'),commerce=dict(shopify_product_id=None,shopify_handle=None),url=f'/books/{book_id}/',authorUrl=f'/authors/{author["slug"]}/',legacy=dict(modal=dict(metadata=f'The Leatherstocking Tales · Volume {roman} · Complete English text · Hardcover · {pages} pages',sample=summary)),retailer_formats=[dict(label='Hardcover',isbn=isbn,pages=pages,links=[],status='EINGEREICHT')],provenance=str(metadata),platform_evidence=dict(title_id=TITLE_IDS[i],status='EINGEREICHT',observed_date='2026-10-24',metadata_sha256=sha(metadata),cover_sha256=sha(pdf))))
    target=OUT/f'COO_{i+1:03d}_HOUSE_1080.jpg'
    house.render_card(raw,[title,f'The Leatherstocking Tales · Volume {roman}'],target,HOUSE_SPEC,HOUSE_FONTS)
    cards.append(target)
    evidence.append(dict(work_id=m['work_id'],metadata=str(metadata),metadata_sha256=sha(metadata),cover=str(pdf),cover_sha256=sha(pdf),geometry=str(build),geometry_sha256=sha(build),clip_pt=list(clip),asset=asset,social=str(target),social_sha256=sha(target)))
(ROOT/'catalog/cooper-r6-20261024.json').write_text(json.dumps(dict(author=author,books=books),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'ASSET_EVIDENCE.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'HOUSE_RENDERER.json').write_text(json.dumps(dict(path=str(RENDERER),sha256=sha(RENDERER),spec_sha256=sha(RENDERER.with_name('houseform_v1.json'))),indent=2)+'\n',encoding='utf-8')
# The identity audit is independently bound to the official register query.
register = json.loads((OUT/'REGISTER_PROOF.json').read_text(encoding='utf-8-sig'))
assert len(register)==5
audit_path = ROOT/'docs/evidence/BOOK_EDITION_IDENTITIES_20261020.json'
audit = json.loads(audit_path.read_text(encoding='utf-8'))
audit['pages'] = [p for p in audit['pages'] if not (p['site']=='en' and 'en-james-fenimore-cooper-' in p['id'])]
for book in books:
    proof=next(r for r in register if r['werk_kanon']==book['work_id'])
    assert proof['isbn13']==book['isbn']['hardcover']
    assert proof['seitenzahl']==book['formats']['hardcover']['pages']
    assert proof['status']=='EINGEREICHT' and proof['sprache']=='en'
    assets=['src'+book['cover'],'src'+book['coverWebp']]
    audit['pages'].append(dict(site='en',id=book['id'],url=book['url'],title=book['title'],language='en',primary_isbn13=None,front_url=book['cover'],assets=[dict(path=a,sha256=sha(ROOT/a)) for a in assets],formats=[dict(label='Hardcover',isbn13=proof['isbn13_ziffern'],productform='hardcover',tokens=[],register_evidence=[proof])]))
audit_path.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
preview=Image.new('RGB',(1800,360),'#27342D')
for i,p in enumerate(cards):
    preview.paste(Image.open(p).resize((360,360),Image.Resampling.LANCZOS),(i*360,0))
preview.save(OUT/'GRID_PREVIEW.jpg',quality=94)
caption='''THE LEATHERSTOCKING TALES
James Fenimore Cooper · Five complete English hardcover volumes

From the waters of Glimmerglass to the open prairie: the life of Natty Bumppo unfolds across five novels, through war, friendship, settlement and the changing American frontier.

I — The Deerslayer
II — The Last of the Mohicans
III — The Pathfinder
IV — The Pioneers
V — The Prairie

Cooper’s complete Household Edition texts, word for word, with plates made for these editions and a publisher’s apparatus of forewords, afterwords, dramatis personae and glossaries.

Arranged in the chronological order of Leatherstocking’s life.
Five hardcover volumes forthcoming. All five have been submitted to IngramSpark; retail availability will follow after review.

Discover the editions:
aeternuspublishing.com/authors/james-fenimore-cooper/

AMBER SERIES · AETERNUS

#JamesFenimoreCooper #LeatherstockingTales #TheDeerslayer #TheLastOfTheMohicans #ThePathfinder #ThePioneers #ThePrairie #AmericanLiterature #ClassicBooks #Aeternus
'''
assert len(caption)<2200
(OUT/'INSTAGRAM_CAPTION.txt').write_text(caption,encoding='utf-8')
print('Prepared five web records and five house-style carousel cards:',OUT)
