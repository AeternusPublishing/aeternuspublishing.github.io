"""Link the publisher-approved Lost World carousel to the English catalogue."""
from datetime import datetime, timezone
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / "catalog/social.json"
data = json.loads(path.read_text(encoding="utf-8"))
post = {
    "title": "The Lost World (Illustrated)",
    "url": "https://www.instagram.com/p/DePTzDACCBY/",
    "book_id": "en-arthur-conan-doyle-the-lost-world",
}
existing = [p for p in data["instagram"]["posts"] if p["book_id"] == post["book_id"]]
if existing and existing != [post]:
    raise SystemExit("Existing Doyle post differs; review before replacing.")
if not existing:
    data["instagram"]["posts"].append(post)
    data["instagram"]["verified_utc"] = datetime.now(timezone.utc).isoformat()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Lost World carousel linked to the English book page.")
