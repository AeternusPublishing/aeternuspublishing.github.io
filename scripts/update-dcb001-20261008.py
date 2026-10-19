"""Import the publisher's DCB_001 copy without editorial rewriting."""
import html
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
work = Path('C:/AETERNUS/_STAGING_OUTDOOR_CLASSICS_PILLAR_PENDING/BEARD/02_WERKE/DCB_001_SHELTERS_SHACKS_SHANTIES_1914')
source = work / '06_PARATEXT/EN/PARATEXT_PAKET_EN_V1.md'
text = source.read_text(encoding='utf-8')
def paragraphs(n):
    section = text.split(f'## {n}. ', 1)[1].split('\n', 1)[1].split('\n## ', 1)[0].strip()
    return section.split('\n\n')
bio, blurb = paragraphs(2), paragraphs(5)
assert len(bio) == 9 and len(blurb) == 5
def plain(s):
    return re.sub(r'\*([^*]+)\*', r'\1', s)
def markup(s):
    return re.sub(r'\*([^*]+)\*', r'<em>\1</em>', html.escape(s, quote=False))
data = {
    'provenance': str(source),
    'author': {
        'blocks': [{'h': 'About the Author', 'p': [plain(p) for p in bio]}],
        'publisherPortraitCaption': 'Daniel Carter Beard · born 21 June 1850 at Cincinnati, Ohio · died 11 June 1941 at Suffern, New York · Photograph by Bain News Service, date unknown.',
        'previewStatus': 'Paperback forthcoming',
        'facts': [['Series', 'AMBER SERIES'], ['First edition', 'New York, 1914'], ['Print edition', '272 pages · 63 plates'], ['Format', 'Paperback · 6 × 9 in']],
    },
    'book': {
        'work_id': 'DCB_001',
        'description': {'short': plain(blurb[0]), 'long': '\n\n'.join(map(plain, blurb))},
        'publisherDescriptionHTML': ''.join('<p>' + markup(p) + '</p>' for p in blurb),
        'cover': '/assets/images/cover-shelters-shacks-shanties.jpg',
        'availability': 'COMING_SOON',
        'distribution_status': {'own_shop': 'NOT_CONFIGURED', 'amazon': 'UNKNOWN', 'ingram': 'PENDING', 'other': {}},
        'links': {'shop': None, 'amazon': None, 'ingram': None},
        'retailer_formats': [{'label': 'Paperback', 'isbn': '978-3-67605-072-2', 'price_display': '$19.99 · £15.99 · €19.99', 'links': [], 'status': 'HOCHGELADEN'}],
        'formats': {'hardcover': None, 'paperback': {'label': 'Paperback', 'price_display': '$19.99 · £15.99 · €19.99', 'availability': 'COMING_SOON'}, 'ebook': None},
        'isbn': {'hardcover': None, 'paperback': '978-3-67605-072-2', 'ebook': None},
        'metadata': 'AETERNUS · AMBER SERIES · Paperback · 272 pages · 6 × 9 in · 63 plates · ISBN 978-3-67605-072-2',
    }
}
(root / 'catalog/dcb001-en-20261008.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Imported nine author paragraphs and five book paragraphs.')
