from pathlib import Path
from datetime import datetime, timezone
import json

root = Path(__file__).resolve().parents[1]
now = datetime.now(timezone.utc).isoformat()
url = 'https://www.instagram.com/p/DeNN2guiNlJ/'
file = root / 'catalog/social.json'
data = json.loads(file.read_text(encoding='utf-8'))
post = {'title': 'From Korti to Khartum (Illustrated)', 'url': url, 'book_id': 'en-charles-william-wilson-from-korti-to-khartum-illustrated'}
assert not any(p['book_id'] == post['book_id'] for p in data['instagram']['posts']), 'Existing Wilson post needs review; do not duplicate.'
data['instagram']['posts'].append(post)
data['instagram']['verified_utc'] = now
file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
evidence = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_CWW001_EN_20261007/EVIDENCE.json')
record = json.loads(evidence.read_text(encoding='utf-8'))
record['published'] = {'url': url, 'account': '@aeternus.publishing', 'verified_utc': now, 'confirmation': 'Dein Beitrag wurde geteilt.; public caption observed', 'images': 2, 'book_availability_claim': 'forthcoming'}
evidence.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Wilson public Instagram post linked; publication evidence recorded.')
