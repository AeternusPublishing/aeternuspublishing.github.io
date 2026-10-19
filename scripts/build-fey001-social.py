"""Render approved V9 cover panels into the established English social template."""
from pathlib import Path
import hashlib
import json
import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = Path('C:/AETERNUS/02_SAEULE_II_GRUEN_MILITAER_EXPEDITIONEN/FEY_FRANCIS_EDWARD_YOUNGHUSBAND/02_WERKE/FEY_001_THE_EPIC_OF_MOUNT_EVEREST_1926/08_VERTRIEB_KDP_INGRAM_20260930/UPLOADPAKET_V9_EN_INGRAM_20261007')
OUT = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_FEY001_EN_20261008')
OUT.mkdir(parents=True, exist_ok=True)
PB = PACKAGE / 'INGRAM/9783676051156_cov.pdf'
assert hashlib.sha256(PB.read_bytes()).hexdigest() == 'e6e3d3ddef91e32c70527f997518edeb87ea0a4b300abc19864d534da8c3e4f9'
FRONT = OUT / 'FEY001_EN_FRONT_RAW.jpg'
BACK = OUT / 'FEY001_EN_BACK_RAW.jpg'
with pymupdf.open(PB) as doc:
    page = doc[0]
    trim = page.trimbox
    assert abs(trim.height - 9*72) < 0.02
    clip = pymupdf.Rect(trim.x1-6*72, trim.y0, trim.x1, trim.y1)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(3, 3), clip=clip, alpha=False)
    Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(FRONT, quality=96, subsampling=0)
    back_clip = pymupdf.Rect(trim.x0, trim.y0, trim.x0+6*72, trim.y1)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(3, 3), clip=back_clip, alpha=False)
    Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(BACK, quality=96, subsampling=0)
    detail = {'source_trimbox': list(trim), 'front_clip': list(clip), 'back_clip': list(back_clip), 'text_excerpt': page.get_text('text', clip=back_clip)[:240], 'purpose': 'Social and website derivative only; approved print PDF unchanged.'}
template = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_JDU001_EN_20261006/baue_karten.py').read_text(encoding='utf-8')
start, end = template.index('W = Path('), template.index('D = B.DESIGN')
code = template[:start] + f'FRONT = Path({str(FRONT)!r})\nPB = Path({str(PB)!r})\nHERE = Path({str(OUT)!r})\n' + template[end:]
code = code.replace('JDU001', 'FEY001').replace('Joshua Duke went with it.', 'Before conquest came the attempt.')
code = code.replace('detail = B.back_panel(PB, raw, 6.125 / 9.25)', f'detail = {detail!r}')
code = code.replace("Verleger im Chat 06.10.2026: 'auch in instagram als live anlegen im bisherigen design. instagram ENG'", 'Verleger Chat 08.10.2026: Instagram und Landingpage pruefen und aktualisieren; Ankuendigung vor Vertriebsaktivierung.')
exec(compile(code, str(Path(__file__)), 'exec'), {'__file__': str(Path(__file__))})
caption = '''The Epic of Mount Everest (Illustrated) · Sir Francis Younghusband, 1926

Before conquest came the attempt.

In 1921, Britain sent an expedition to discover whether a way to the summit of Everest existed at all. The attempts of 1922 and 1924 followed: the North Col, extreme altitude, oxygen, avalanche—and the final ascent into the clouds by George Mallory and Andrew Irvine.

Sir Francis Younghusband gathers the three expeditions into one continuous narrative. The complete English text of the first edition, read against two copies, with sixteen photographic plates reconstructed for legibility, two enlarged maps, an author portrait, a publisher’s note and an afterword.

GREEN SERIES · Military, expeditions and frontiers.
Paperback and hardcover editions forthcoming.

aeternuspublishing.com/authors/francis-younghusband/

#FrancisYounghusband #TheEpicOfMountEverest #MountEverest #MalloryAndIrvine #Himalaya #MountaineeringHistory #Exploration #AETERNUS
'''
(OUT / 'CAPTION.txt').write_text(caption, encoding='utf-8')
asset = ROOT / 'src/assets/images/cover-epic-of-mount-everest-younghusband-en-v13-20261008'
with Image.open(FRONT) as image:
    image.thumbnail((1200, 1800), Image.Resampling.LANCZOS)
    image.save(str(asset)+'-fallback.jpg', quality=94, subsampling=0)
    image.save(str(asset)+'.jpg', quality=94, subsampling=0)
    image.save(str(asset)+'.webp', quality=94)
    image.save(str(asset)+'.avif', quality=90)
print(OUT)
