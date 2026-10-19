"""Deterministic derivative of the approved front/back social template; no print-file changes."""
from pathlib import Path
import hashlib
import json

template = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_JDU001_EN_20261006/baue_karten.py').read_text(encoding='utf-8')
start = template.index('W = Path(')
end = template.index('D = B.DESIGN', start)
package = Path('C:/AETERNUS/02_SAEULE_II_GRUEN_MILITAER_EXPEDITIONEN/CWW_CHARLES_WILLIAM_WILSON/02_WERKE/CWW_001_FROM_KORTI_TO_KHARTUM_1885/09_EXPORT/UPLOADPAKET_EN_V5_20261006')
out = Path('C:/AETERNUS/04_PRODUCTION/SOCIAL/INSTAGRAM_CWW001_EN_20261007')
out.mkdir(parents=True, exist_ok=True)
front = package / 'CWW001_EN_EBOOK_DECKEL_1600x2400.jpg'
back = package / 'CWW001_EN_KDP_TASCHENBUCH_UMSCHLAG_220.pdf'
code = template[:start] + f'FRONT = Path({str(front)!r})\nPB = Path({str(back)!r})\nHERE = Path({str(out)!r})\n' + template[end:]
code = code.replace('JDU001', 'CWW001').replace('Joshua Duke went with it.', 'He reached Khartoum too late.')
code = code.replace("Verleger im Chat 06.10.2026: 'auch in instagram als live anlegen im bisherigen design. instagram ENG'", 'Verleger Chat 07.10.2026: CWW ebenfalls Instagram und Landingpage pruefen; fehlende Inhalte komplettieren, Upload anderes Fenster')
exec(compile(code, str(Path(__file__)), 'exec'), {'__file__': str(Path(__file__))})
caption = '''From Korti to Khartum (Illustrated) · Sir Charles William Wilson, 1885

Sudan, 1885. Khartoum is besieged and time is running out. Across the Bayuda Desert the British Desert Column drives towards the Nile in a desperate attempt to reach General Gordon. Wilson crosses the desert, takes command after Sir Herbert Stewart is mortally wounded, and boards Gordon’s armed steamers for the last ascent. He reaches Khartoum two days after its fall.

The complete English text of the first edition, with thirteen sketch plans redrawn from the original, two Admiralty plates, a frontispiece and a publisher’s apparatus.

GREEN SERIES · Military, expeditions and frontiers.
Paperback, hardcover and Kindle editions forthcoming.

aeternuspublishing.com/authors/charles-william-wilson/

#CharlesWilliamWilson #FromKortiToKhartum #Khartoum #NileExpedition #GeneralGordon #Sudan #MilitaryHistory #AETERNUS
'''
(out / 'CAPTION.txt').write_text(caption, encoding='utf-8')
print('Prepared two social cards and accurate forthcoming caption:', out)
