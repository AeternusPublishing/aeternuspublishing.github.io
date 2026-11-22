# Welle 4: Qualitätsgate gegen schleichenden Verfall (22.11.2026)

Entscheidung: `decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122`
(alle drei Stufen, rot sperrt den Merge, EN-Deploy lokal über Prüfskript).

## Befund vor Welle 4

- `main` war ungeschützt. Vom 19. bis 22.11. wurden 15 PRs gemergt, keiner wurde vor dem Merge geprüft.
- Die englische Seite ging nur per Hand-Deploy live (`wrangler`). Prüfungen liefen nur im deutschen Build, nach dem Merge.
- Acht ältere Prüfungen waren rot, ohne dass es jemand merkte:

| Prüfung | Ursache | Behandlung |
|---|---|---|
| check-editorial | Monarch führt seit c0b5bc9 (20.10.) auf das Hardcover | Regel fortgeschrieben |
| check-qr-targets | Grimmelshausen und SZ_002 sind bewusst Landeseiten | Landeseiten ausdrücklich zugelassen; Überschrift und Links werden geprüft |
| check-international | Basis vom Umbau auf den internationalen Bau; Lady Sale (PR #244) und BP_005 EN (PR #218) fehlten; 36 Pflichtfeldlücken im EN-Katalog | Basisvergleich ersetzt durch die Sperrklinke, Ausnahmen fortgeschrieben, Lücken an die Sperrklinke |
| check-green-collections, check-history | brauchen den Produktionsbuild bzw. `work/history-de` | im Gate mit dem passenden Build |
| check-wilderness | Porträt-Prüfsumme steht seit Welle 2 unter `image.approval.sha256`; danach veraltete Annahme „keine Buchkarten“ | Prüfsumme berichtigt; übrige Annahme nur Hinweis |
| check-bird-pages | Waldteufel-Umschlag V5 (08.10.); danach fehlende ASIN | Umschlag berichtigt; übrige Annahme nur Hinweis |
| check-heidi-live | Hardcover-Preis: Seite 24,99 €, Prüfung 24,98 € | Preisfrage an den Verleger, bis dahin nur Hinweis |

## Die drei Stufen

1. **PR-Prüfung** (`.github/workflows/quality-gate.yml`, Job `Qualitaetsgate`)
   - Baut beide Seiten und führt `scripts/quality-gate.cjs` aus: 15 sperrende Prüfungen und 5 Hinweisprüfungen.
   - Die Schutzregel auf `main` verlangt diesen Job, also sperrt Rot den Merge.
2. **Sperrklinke** (`scripts/check-quality-ratchet.cjs`, Basis `quality/ratchet-baseline.json`)
   - Erfasst jeden Befund einzeln: Pflichtfeldlücken, tote interne Verweise, Bilder ohne alt, Bilder über 800 KB, Seiten ohne Titel, Beschreibung oder canonical, doppelte Titel, Platzhaltertext.
   - Bekannte Befunde sind eingefroren, jeder neue sperrt.
   - `--tighten` nimmt behobene Befunde aus der Basis.
   - `--accept <decision_id>` nimmt neue nur mit Verlegerwort auf.
   - Feuerprobe: Ein eingebautes kaputtes Bild ergab FAIL, nach dem Entfernen PASS.
3. **Nächtlicher Wächter** (`scripts/watch-live.cjs`, Windows-Aufgabe „AETERNUS Website-Waechter“, 05:40 Uhr)
   - Prüft auf beiden Live-Seiten jede Seite und jede Datei auf 200 und jedes QR-Ziel aus dem DE-Build.
   - Gleicht `build-info.json` mit `main` ab. Mehr als 24 h nicht live gilt als Befund.
   - Prüft, dass jede LIVE-ISBN aus dem Buchregister auf der Seite ihrer Sprache steht.
   - Ausgabe: `COORDINATION/WEBSITE_WAECHTER/STAND.json`. Neue Befunde landen als Notiz in `CODEX_TO_CLAUDE`.

## EN-Deploy

Die englische Seite geht nur noch über `node scripts/deploy-international.cjs` live:

- `--preview`: stellt eine Vorschau auf Cloudflare bereit.
- `--live --freigabe <decision_id>`: geht live, nur von sauberem `origin/main`, mit grünem Gate und mit einer Entscheidung, die den Commit nennt.

Das Skript schreibt `build-info.json` und stellt danach die vom Build veränderten Dateien wieder her.

## Erster Wächterlauf (22.11.2026, vor dem Merge)

291 Seiten, 509 Dateien, 44 QR-Ziele, 107 LIVE-ISBNs. Alle QR-Ziele antworten.

Befunde:
- `/en/authors/arthur-conan-doyle/` auf aeternus-verlag.de antwortet 404. Verlinkt ist es von `/en/series/bernstein/`.
- JJH_001: Taschenbuch und Hardcover sind im Register LIVE, stehen aber nicht auf der deutschen Seite.
- Vier E-Book-ISBNs fehlen auf der Seite: GWS_001 EN, HF_001, HRH_001 und ETS_002 DE. Die Seiten führen E-Books meist über die ASIN.
- `build-info.json` fehlt auf beiden Seiten. Das behebt sich mit dem ersten Deploy nach dem Merge.
