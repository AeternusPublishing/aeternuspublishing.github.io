"""Render three White Company Instagram cards with the established house template."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path


ROOT = Path("C:/AETERNUS")
HERE = Path(__file__).resolve().parent / "white_company_20261010"
HERE.mkdir(exist_ok=True)
TEMPLATE = ROOT / "04_PRODUCTION/SOCIAL/INSTAGRAM_COHERENCE_20260914"
SOURCE = Path(__file__).resolve().parents[1] / "src/assets/images"

loader = importlib.util.spec_from_file_location("house_cards", TEMPLATE / "build_instagram_tiles.py")
assert loader and loader.loader
cards = importlib.util.module_from_spec(loader)
loader.loader.exec_module(cards)
cards.ROOT = ROOT
cards.HERE = HERE

spec = json.loads((TEMPLATE / "social_tile_spec.json").read_text(encoding="utf-8"))
spec["typography"]["header"] = "AETERNUS · ENGLISH EDITION"
spec["typography"]["footer"] = "CLASSICS REDISCOVERED."
spec["items"] = [
    {
        "id": "ACD001_EN_VOLUME_I",
        "source": str(SOURCE / "cover-white-company-vol-i-fallback.jpg"),
        "claim": "Three volumes. One campaign.",
        "output": "ACD001_EN_VOLUME_I_INSTAGRAM_1080.jpg",
    },
    {
        "id": "ACD001_EN_VOLUME_II",
        "source": str(SOURCE / "cover-white-company-vol-ii-fallback.jpg"),
        "claim": "Under the Black Prince's banner.",
        "output": "ACD001_EN_VOLUME_II_INSTAGRAM_1080.jpg",
    },
    {
        "id": "ACD001_EN_VOLUME_III",
        "source": str(SOURCE / "cover-white-company-vol-iii-fallback.jpg"),
        "claim": "Beyond the Pyrenees.",
        "output": "ACD001_EN_VOLUME_III_INSTAGRAM_1080.jpg",
    },
]

sha256 = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
source_hashes = {item["source"]: sha256(Path(item["source"])) for item in spec["items"]}
outputs = [cards.build_tile(spec, item) for item in spec["items"]]
output_hashes = {str(path): sha256(path) for path in outputs}
for item in spec["items"]:
    cards.build_tile(spec, item)
assert output_hashes == {str(path): sha256(path) for path in outputs}
assert source_hashes == {item["source"]: sha256(Path(item["source"])) for item in spec["items"]}
preview = cards.build_contact_sheet(outputs)

(HERE / "SPEC.json").write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
(HERE / "EVIDENCE.json").write_text(
    json.dumps(
        {
            "template": str(TEMPLATE / "build_instagram_tiles.py"),
            "template_sha256": sha256(TEMPLATE / "build_instagram_tiles.py"),
            "sources": source_hashes,
            "outputs": output_hashes,
            "preview": str(preview),
            "repeat_hashes_equal": True,
            "source_hashes_equal": True,
            "previous_post": "https://www.instagram.com/p/DeUIRIxiHlj/",
            "replacement_post": "https://www.instagram.com/p/DeUMbwOiKc4/",
        },
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)
print(json.dumps({"outputs": output_hashes, "preview": str(preview)}, ensure_ascii=False))
