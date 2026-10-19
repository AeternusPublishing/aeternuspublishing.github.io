"""AB_001 EN (Grey Owl, The Men of the Last Frontier): website derivatives and Instagram cards.

Reads the two PRINT_READY KDP covers and the first-edition author portrait named in the
typesetting manuscript; never changes a print file. Writes
  - src/assets/images/cover-men-of-the-last-frontier-grey-owl-en-20261008{.jpg,.webp,.avif,-fallback.jpg}
  - src/assets/images/portrait-grey-owl{.jpg,.webp,.avif}
  - <work>/08_SOCIAL_EN/INSTAGRAM_20261008/: four cards 1080x1350, raw panels, preview,
    INSTAGRAM_CAPTION.txt and EVIDENCE.json
House style of 04_PRODUCTION/SOCIAL/INSTAGRAM_JDU001_EN_20261006/baue_karten.py, recomposed for
the 4:5 feed format. Preparation only: nothing is posted, catalog/social.json is not touched.
Usage: python scripts/build-ab001-social.py [--social-only | --web-only]
"""
from pathlib import Path
import hashlib
import json
import sys

import pymupdf
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
WORK = Path('C:/AETERNUS/02_SAEULE_II_GRUEN_MILITAER_EXPEDITIONEN/ASB_GREY_OWL_BELANEY/02_WERKE/AB_001_MEN_OF_THE_LAST_FRONTIER_1931')
OUT = WORK / '08_SOCIAL_EN/INSTAGRAM_20261008'
FONTS = Path('C:/AETERNUS/99_SYSTEM/BUCHSATZ/fonts')
FONT_DISPLAY, FONT_SERIF = FONTS / 'Cinzel-Regular.ttf', FONTS / 'CormorantGaramond-Regular.ttf'
DESIGN = {'canvas': (1080, 1350), 'background': '#27342D', 'gold': '#A99B6C', 'ivory': '#E5E0D3', 'cover_box': (247, 118, 833, 997)}
COVERS = {
    'PB': (WORK / '07_UMSCHLAG_EN/BAU_KDP_TB_V4_20261008/BUILD/7658461149f149072664f77b0d81e49d003b2a0904b4532e7f7c71e6aa854237',
           'bebf9c14417899f1906b838f6abd6956e729d8262ccb645103281b39b722cf01'),
    'HC': (WORK / '07_UMSCHLAG_EN/BAU_KDP_HC_V2_20261008/BUILD/77d1f30f28f5940f99be17fc917ce2af22aefe465756a8105e9b3cc0ac8332f1',
           '320adcfcbbf7360841ea8b14398166ec96588e80c609d5f856505c2cfb4a9721'),
}
MANUSCRIPT = WORK / '05_SATZ_EN/SATZ_V8_20261008_PB/manuscript.json'
COVER_ASSET = ROOT / 'src/assets/images/cover-men-of-the-last-frontier-grey-owl-en-20261008'
PORTRAIT_ASSET = ROOT / 'src/assets/images/portrait-grey-owl'
# Publisher's wording, back-cover copy of PARATEXTE_EN_SATZFASSUNG_V2.md, shortened by whole paragraphs only.
CLAIM = 'The frontier was closing. The wilderness remained.'
CAPTION = '''The Men of the Last Frontier · Grey Owl, 1931

Beyond the last road lay another Canada.

It was a country of forest and muskeg, rivers and cold lakes, trap lines, winter camps and long distances travelled by canoe, snowshoe and dog team. Men who lived there depended less upon possessions than upon judgement: the ability to read weather, follow a trail, repair what had broken and endure what could not be avoided.

Grey Owl knew that world from within.

A rugged, elegiac portrait of men, animals and a northern country approaching the end of one era.

The frontier was closing. The wilderness remained.

GREEN SERIES · AETERNUS
Coming soon in paperback, hardcover and e-book.

aeternuspublishing.com/authors/grey-owl

#GreyOwl #TheMenOfTheLastFrontier #CanadianWilderness #Canada #Wilderness #Conservation #NatureWriting #AETERNUS
'''


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def panels(binding):
    """Render front and back panel (trim area 6 x 9 in) at 300 ppi from the compiler geometry."""
    folder, expected = COVERS[binding]
    pdf = folder / 'cover.pdf'
    assert sha(pdf) == expected, f'{binding} cover is not the approved build'
    assert (folder / 'PRINT_READY.marker').exists()
    geometry = json.loads((folder / 'build-report.json').read_text(encoding='utf-8'))['geometry']
    result = {}
    with pymupdf.open(pdf) as document:
        assert document.page_count == 1
        page = document[0]
        for side in ('front', 'back'):
            x, y, w, h = geometry[side + '_rect_in']
            assert abs(w - 6.0) < 1e-6 and abs(h - 9.0) < 1e-6
            clip = pymupdf.Rect(x * 72, y * 72, (x + w) * 72, (y + h) * 72)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(300 / 72, 300 / 72), clip=clip, alpha=False)
            result[side] = (Image.frombytes('RGB', (pix.width, pix.height), pix.samples), list(clip),
                            page.get_text('text', clip=clip).strip()[:240])
    return pdf, result


def tracked(draw, value, cy, size, tracking, color):
    font = ImageFont.truetype(str(FONT_DISPLAY), size)
    width = sum(draw.textlength(c, font=font) for c in value) + tracking * (len(value) - 1)
    box = draw.textbbox((0, 0), value, font=font)
    x, y = 540 - width / 2, cy - (box[3] - box[1]) / 2 - box[1]
    for c in value:
        draw.text((x, y), c, font=font, fill=color)
        x += draw.textlength(c, font=font) + tracking


def card(panel, output, claim):
    canvas = Image.new('RGB', DESIGN['canvas'], DESIGN['background'])
    tracked(ImageDraw.Draw(canvas), 'AETERNUS \u00b7 ENGLISH EDITION', 62, 19, 5, DESIGN['gold'])
    left, top, right, bottom = DESIGN['cover_box']
    cover = ImageOps.fit(panel, (right - left, bottom - top), method=Image.Resampling.LANCZOS)
    shadow = Image.new('RGBA', canvas.size)
    ImageDraw.Draw(shadow).rectangle((left + 9, top + 9, right + 9, bottom + 9), fill='#101713B8')
    canvas = Image.alpha_composite(canvas.convert('RGBA'), shadow.filter(ImageFilter.GaussianBlur(16))).convert('RGB')
    canvas.paste(cover, (left, top))
    draw = ImageDraw.Draw(canvas)
    size = 44
    while size > 30:
        font = ImageFont.truetype(str(FONT_SERIF), size)
        if draw.textlength(claim, font=font) <= 960:
            break
        size -= 1
    box = draw.textbbox((0, 0), claim, font=font)
    draw.text(((1080 - (box[2] - box[0])) / 2, 1120 - (box[3] - box[1]) / 2 - box[1]), claim, font=font, fill=DESIGN['ivory'])
    draw.line((474, 1252, 606, 1252), fill=DESIGN['gold'], width=1)
    tracked(draw, 'CLASSICS REDISCOVERED.', 1296, 15, 4, DESIGN['gold'])
    canvas.save(output, 'JPEG', quality=94, subsampling=0, optimize=True, dpi=(72, 72))


def social():
    OUT.mkdir(parents=True, exist_ok=True)
    evidence = {'schema': 'AETERNUS_INSTAGRAM_AB001_EN_V1', 'account': '@aeternus.publishing', 'status': 'PREPARED_NOT_POSTED',
                'book_availability_claim': 'coming soon', 'cards': []}
    files, number = [], 1
    for binding in ('PB', 'HC'):
        pdf, rendered = panels(binding)
        for side, claim in (('front', CLAIM), ('back', 'BACK COVER')):
            image, clip, excerpt = rendered[side]
            raw = OUT / f'AB001_EN_{binding}_{side.upper()}_RAW.jpg'
            image.save(raw, 'JPEG', quality=96, subsampling=0, optimize=True)
            target = OUT / f'AB001_EN_{number:02d}_{binding}_{side.upper()}_1080x1350.jpg'
            card(image, target, claim)
            evidence['cards'].append({'datei': target.name, 'sha256': sha(target), 'roh': raw.name, 'quelle': str(pdf),
                                      'quelle_sha256': sha(pdf), 'clip_pt': clip, 'text_excerpt': excerpt})
            files.append(target)
            number += 1
    preview = Image.new('RGB', (1100 * len(files) - 20, 1350), 'white')
    for index, file in enumerate(files):
        preview.paste(Image.open(file), (1100 * index, 0))
    preview.save(OUT / 'VORSCHAU.jpg', quality=90)
    (OUT / 'INSTAGRAM_CAPTION.txt').write_text(CAPTION, encoding='utf-8', newline='\n')
    evidence['caption_sha256'] = sha(OUT / 'INSTAGRAM_CAPTION.txt')
    (OUT / 'EVIDENCE.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('Instagram material prepared, not posted:', OUT)


def web():
    front = panels('PB')[1]['front'][0]
    large = front.resize((1600, 2400), Image.Resampling.LANCZOS)
    small = front.resize((800, 1200), Image.Resampling.LANCZOS)
    large.save(f'{COVER_ASSET}-fallback.jpg', quality=88, subsampling=0, optimize=True)
    small.save(f'{COVER_ASSET}.jpg', quality=88, subsampling=0, optimize=True)
    small.save(f'{COVER_ASSET}.webp', quality=86)
    small.save(f'{COVER_ASSET}.avif', quality=70)
    record = json.loads(MANUSCRIPT.read_text(encoding='utf-8'))['author_portrait']
    source = WORK / record['path']
    assert sha(source) == record['sha256'], 'author portrait differs from the typeset book'
    assert 'first edition' in record['caption']
    with Image.open(source) as image:
        portrait = image.convert('RGB')
        portrait = portrait.resize((720, round(720 * portrait.height / portrait.width)), Image.Resampling.LANCZOS)
    portrait.save(f'{PORTRAIT_ASSET}.jpg', quality=88, optimize=True)
    portrait.save(f'{PORTRAIT_ASSET}.webp', quality=86)
    portrait.save(f'{PORTRAIT_ASSET}.avif', quality=70)
    print('Website cover and portrait derivatives written:', COVER_ASSET.parent)


if __name__ == '__main__':
    if '--social-only' not in sys.argv:
        web()
    if '--web-only' not in sys.argv:
        social()
