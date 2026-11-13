# Quarantäne 12.11.2026 · Reihen VI Weiß und VII Purpur offline

Verlegerwort 12.11.2026 (Korti-Fenster): „die beiden linien erstmal offline nehmen“ · „auf ENG und DEU“.

| Datei (Herkunft) | sha256 |
|---|---|
| public/reihen/weiss/index.html → public__reihen__weiss__index.html | 95df692f86c3f812ed3796486c6d4b88ef72b78f474b6216fa43808d8d294c26 |

Die Datei war eine veraltete, eingecheckte Altseite. Ohne Quarantäne wäre sie nach dem Bau weiter ausgeliefert worden.

## Rückweg

1. In `catalog/offline-series.cjs` die Slugs aus `OFFLINE_SERIES` entfernen.
2. Die Fußzeilenverweise in `src/_includes/footer.njk` wieder einkommentieren.
3. Die Zahlwörter (fünf/five → sieben/seven) zurücksetzen. Am einfachsten geht das, indem man den Commit dieses Schritts mit `git revert` zurücknimmt.
4. DE baut der Pages-Workflow beim Merge. EN wird mit `npm run build:international:production` gebaut und anschließend mit wrangler ausgerollt.

Die Reihenseiten entstehen beim Bau aus den Daten neu. Die Altseite hier wird nicht gebraucht.
