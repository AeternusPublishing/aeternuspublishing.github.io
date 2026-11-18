# Website-Projektanweisung

Für jede Arbeit an Autorenseiten verbindlich `docs/author-worlds/REDAKTION.md` und `editorial/author-worlds/AGENTS.md` lesen. Die veröffentlichten Autorenwelten sind seit Verlegerauftrag vom 21.10.2026 der Standard. Freigegebene Porträts bleiben unverändert; Austausch, Bearbeitung oder Ausblenden nur auf ausdrücklichen Verlegerauftrag.

Website-Auschecks ausschließlich über das AETERNUS-Werkzeug anlegen; kein direktes `git worktree add` unter `C:\_CB`. Das Werkzeug legt den Auscheck auf E: und den gewohnten C:-Pfad als Junction an:

```powershell
python C:/AETERNUS/00_BETRIEBSDATEN/WERKZEUG/aeternus.py auscheck anlegen NAME --repo C:/_CB/web_acd_20261008 --voll --zweig ZWEIG
```

Bei fehlender E:-Platte stoppen und nicht auf C: ausweichen. Bauordner sind mit `aeternus.py auscheck arbeitsordner NAME` bereitzustellen; vorhandene Ordner nicht überschreiben oder eigenmächtig auslagern. Details: `TOOLS/auscheck/PLATTE_E.md` im System-Repository.
