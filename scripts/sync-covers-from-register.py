#!/usr/bin/env python3
"""Render website front covers from the cover PDF the Buchregister records for an edition.

For each target book (JSON list: id, isbns[{label, isbn}]), the newest register event for one of
its print ISBNs that names an `umschlag` file is used, preferring LIVE over EINGEREICHT,
HOCHGELADEN and FREIGEGEBEN. The PDF must match the recorded sha256. Only the front trim face
(right panel, bleed removed) is rendered. Nothing is redrawn or retouched.

Usage: python scripts/sync-covers-from-register.py targets.json YYYYMMDD
Writes src/assets/images/cover-<id>-trade-<date>.{jpg,webp}, catalog/cover-sync-<date>.json and
docs/evidence/EN_COVER_SYNC_<date>.json.
"""
import hashlib, io, json, os, re, sys
import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AETERNUS = os.environ.get('AETERNUS_ROOT', 'C:/AETERNUS')
REGISTER = os.path.join(AETERNUS, '00_BUCHREGISTER', 'BUCHREGISTER.ndjson')
PRIORITY = {'LIVE': 4, 'EINGEREICHT': 3, 'HOCHGELADEN': 2, 'FREIGEGEBEN': 1}
BLEED = 9.0  # 0.125 in, Ingram and KDP print covers
TRIM_WIDTH = {648: 432, 612: 396, 720: 504, 576: 360, 792: 612, 684: 432}  # trim height pt -> trim width pt
WIDTH = 900

digits = lambda v: re.sub(r'[^0-9X]', '', str(v or ''))


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def main(targets_file, date):
    targets = json.load(open(targets_file, encoding='utf8'))
    wanted = {digits(i['isbn']): t['id'] for t in targets for i in t['isbns']
              if i.get('isbn') and not re.search(r'kindle|e-?book', i.get('label', ''), re.I)}
    candidates = {}
    with open(REGISTER, encoding='utf8') as f:
        for line in f:
            if '"umschlag"' not in line:
                continue
            e = json.loads(line)
            book = wanted.get(digits(e.get('isbn')))
            if not book or e.get('sprache') != 'en' or e.get('status') not in PRIORITY:
                continue
            cover = next((d for d in e.get('dateien') or [] if d.get('rolle') == 'umschlag' and d.get('pfad', '').lower().endswith('.pdf')), None)
            if not cover:
                continue
            rank = ('paperback' in e.get('manifestation', ''), PRIORITY[e['status']], e.get('utc', ''))
            if book not in candidates or rank > candidates[book][0]:
                candidates[book] = (rank, e, cover)
    mapping, evidence, missing = {}, [], []
    for t in targets:
        if t['id'] not in candidates:
            missing.append({'id': t['id'], 'reason': 'no register event with a print cover PDF'})
            continue
        _, e, cover = candidates[t['id']]
        pdf = os.path.join(AETERNUS, cover['pfad'])
        if not os.path.exists(pdf):
            missing.append({'id': t['id'], 'reason': 'cover PDF not found', 'path': cover['pfad']})
            continue
        digest = sha256(pdf)
        if digest != cover['sha256']:
            missing.append({'id': t['id'], 'reason': 'sha256 mismatch', 'path': cover['pfad']})
            continue
        doc = pymupdf.open(pdf)
        page = doc[0]
        W, H = page.rect.width, page.rect.height
        # Ingram template PDFs carry the spread's TrimBox inside a larger page; KDP/plain covers are spread + bleed.
        trim = page.trimbox
        if abs(trim.width - W) > 1 or abs(trim.height - H) > 1:
            x0, x1, y0, y1 = trim.x0, trim.x1, trim.y0, trim.y1
        else:
            x0, x1, y0, y1 = BLEED, W - BLEED, BLEED, H - BLEED
        trim_h = round(y1 - y0)
        trim_w = TRIM_WIDTH.get(trim_h)
        if not trim_w:
            missing.append({'id': t['id'], 'reason': f'unknown trim height {trim_h} pt', 'path': cover['pfad']})
            continue
        clip = pymupdf.Rect(x1 - trim_w, y0, x1, y1)
        zoom = WIDTH / trim_w
        outputs = []
        mapping[t['id']] = {}
        sides = [('front', 'cover', clip)]
        if t.get('backcover'):  # only where the page already shows a back cover
            sides.append(('back', 'back', pymupdf.Rect(x0, y0, x0 + trim_w, y1)))
        for side, prefix, rect in sides:
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=rect, alpha=False)
            img = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
            base = f"{prefix}-{t['id']}-trade-{date}"
            for ext, kw in (('jpg', {'quality': 84, 'optimize': True, 'progressive': True}), ('webp', {'quality': 80})):
                rel = f'src/assets/images/{base}.{ext}'
                img.save(os.path.join(ROOT, rel), **kw)
                outputs.append({'path': rel, 'sha256': sha256(os.path.join(ROOT, rel)), 'dimensions': list(img.size), 'side': side})
            field = 'cover' if side == 'front' else 'backcover'
            mapping[t['id']].update({field: f'/assets/images/{base}.jpg', field + 'Webp': f'/assets/images/{base}.webp'})
        evidence.append({'id': t['id'], 'title': t['title'], 'current': t['current'], 'source': cover['pfad'],
                         'source_sha256': digest, 'register_event': e['eintrag_id'], 'register_status': e['status'],
                         'register_utc': e['utc'], 'page_pt': [W, H], 'front_clip_pt': [clip.x0, clip.y0, clip.x1, clip.y1],
                         'output_assets': outputs,
                         'operation': 'Render the front trim face of the hash-verified register cover PDF; no retouching.'})
    json.dump(mapping, open(os.path.join(ROOT, 'catalog', f'cover-sync-{date}.json'), 'w', encoding='utf8'), indent=2, ensure_ascii=False)
    json.dump({'schema': 'AETERNUS_WEB_COVER_SYNC_V1', 'date': date, 'sources': evidence, 'not_synced': missing},
              open(os.path.join(ROOT, 'docs', 'evidence', f'EN_COVER_SYNC_{date}.json'), 'w', encoding='utf8'), indent=2, ensure_ascii=False)
    print(f'synced {len(mapping)}, not synced {len(missing)}')
    for m in missing:
        print('  -', m['id'], '|', m['reason'])


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
