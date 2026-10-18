# Gemeinsame Autorenvorlage – lokale Ansicht vom 18.10.2026

Status: lokaler Entwurf, nicht veröffentlicht, nicht gepusht.

## Geltungsbereich

Alle 31 `/authors/<slug>/`-Seiten der englischen Website werden über
`international/author.njk` erzeugt. Die deutschen und spanischen Websites
haben eigene Vorlagen und werden durch diese Änderung nicht verändert.

Die Arbeitskopie wurde zunächst von `origin/main` angelegt. Dort fehlt die
englische Website. Tatsächliche Ausgangsbasis dieses lokalen Zweigs ist
`a8ebbd1` (Callwell-Porträt, nach dem integrierten englischen Website-Stand
`debabb7`). Vor einer späteren Veröffentlichung muss der dann aktuelle
englische Veröffentlichungsstand erneut abgeglichen werden. Kein automatischer
Merge und keine Veröffentlichung sind Teil dieses Auftrags.

## Aufbau und Pflege

1. Kompakter Kopf mit Name, Lebensdaten, Einführung und optionalem Porträt.
   Bilder bleiben vollständig sichtbar; keine feste Abschnittshöhe.
2. Buchmodule aus dem bestehenden Katalog über `authorBooks`. Zwei Spalten
   auf breiten Bildschirmen, eine unter 1000 px. Ein einzelnes Buch erhält
   eine begrenzte Lesebreite. Null Bücher behalten den bestehenden Verweis.
3. Biografie. Kurze, redaktionell zusammengestellte Absätze werden in
   `international/_data/authorSummaries.json` unter dem Autorenslug gepflegt.
   Ohne Kurzfassung bleibt die vorhandene vollständige Biografie in einem
   nativen, per Tastatur bedienbaren Aufklappbereich zugänglich.
4. Vorhandene Zusatzmaterialien und Downloads bleiben erhalten. Lange
   Editionsabschnitte anderer Autoren bleiben vorerst aufklappbar. Sobald
   die Buchdetailseiten diese Informationen tragen, kann je Autor
   `editionDetailsOnBookPages: true` gesetzt werden. Dies gilt bereits für
   Parkman; seine beiden Buchseiten und Katalogdaten bleiben unverändert.

Neue Bücher werden nur im bestehenden Katalog ergänzt. Keine vollständigen
Buchbeschreibungen mehr unter Autorenseiten anhängen. Preis, ISBN,
Ausstattung und Kaufwege gehören zur jeweiligen Buchdetailseite.

Gemeinsames Buchmodul: `international/_includes/author-book.njk`.
Gestaltung: `src/assets/css/authors.css`, nur auf Autorenseiten geladen.
Die bestehende Buchkarten-Vorlage für andere Seitentypen bleibt unverändert.

## Lokal bauen und ansehen

```powershell
node node_modules/@11ty/eleventy/cmd.cjs --config=eleventy.international.cjs --quiet
python -m http.server 8097 --bind 127.0.0.1 --directory dist/international
```

Vorschau: http://127.0.0.1:8097/authors/francis-parkman/
Der Standardbau trägt `noindex, nofollow` und die Vorschauleiste.

## Prüfung

- Eleventy: 121 Ausgabedateien, darunter 118 HTML-Seiten; Bau erfolgreich.
- Alle lokalen HTML-Verweise und Bildpfade aufgelöst; genau eine H1 je Seite.
- Parkman, Haggard, Robertson und Ford bei 1280, 768, 390 und 320 px geprüft:
  kein horizontaler Überlauf und keine defekten geladenen Bilder.
- Damit Fälle mit null, einem, zwei und fünf Büchern abgedeckt.
- Parkman bei 1280 px: 1988 px Gesamthöhe inklusive Vorschauleiste,
  gegenüber 4267 px auf der Live-Seite, rund 53 % kürzer.
- Bildschirmbilder: `output/playwright/parkman-1280.png` und
  `output/playwright/parkman-390.png` (lokale Prüfergebnisse).
- Werkzeuge: rg, Git, Python, Eleventy, Playwright. Keine neuen Abhängigkeiten,
  keine bezahlten Aufrufe. Netzwerk nur Git-Abgleich und lesender Live-Vergleich.

Rückweg: Änderungen liegen ausschließlich im lokalen Zweig
`codex/autorenvorlage-en-lokal-20261018`; Ausgangsdateien sind unter `a8ebbd1`
versioniert. Die Live-Website wurde nicht verändert.

## Erweiterung DE + EN, 18.10.2026

Aktueller Umfang: 21 deutsche Autorenseiten (einschließlich Hill, Hutchinson
und Doyle), 31 englische Seiten der Anglo-Website und 12 ältere englische
Routen auf der deutschen Website. Die beiden Website-Stände bleiben getrennt.
DE: `work/de-main`, Basis `982b221`, Zweig
`codex/autorenvorlage-de-lokal-20261018`. EN: bisheriger lokaler Zweig.

Gemeinsame Gestaltung in `src/assets/css/authors.css`; dieselbe Datei liegt
im DE-Auscheck. Gemeinsamer DE/Legacy-EN-Inhalt in
`src/_includes/author-landing.njk`, Beschriftungen in
`src/_data/authorLabels.json`. Sonderseiten sind als Daten in
`src/_data/authorSpecials.json` eingebunden. Buch- und Biografietexte bleiben
über native Aufklappbereiche zugänglich, bestehende Buchseiten und Bezugswege
bleiben erreichbar. Ein veralteter `/autoren/`-Verweis bei Sale führt nun zum
vorhandenen Buchkatalog. Bestehende Hill-/Doyle-Porträts aus dem EN-Stand
wurden unverändert übernommen; keine neuen Bilder erzeugt.

Porträts: Desktop 250 × 310 px (vollständig sichtbar), mobil 120 px breit,
unter 380 px Bildschirmbreite 100 px. Text unter dem Porträt nutzt mobil die
volle Breite. Gemeinsame Gestaltung in beiden Auschecks bytegleich geprüft.

Prüfung: 64 Autorenseiten × 3 Breiten (1280/390/320), keine horizontalen
Überläufe oder fehlgeschlagenen geladenen Bilder. Lokale Links/Bildpfade und
eine H1 je Seite geprüft. Biografie und Editionsdetails geöffnet; ISBN im
geöffneten Detailbereich nachgewiesen. Beide Eleventy-Bauten erfolgreich.

Lokale Vorschauen: EN Port 8097, DE und ältere EN-Routen Port 8098.
DE starten: im DE-Auscheck `python -m http.server 8098 --bind 127.0.0.1
--directory dist/preview`. Bau: `node node_modules/@11ty/eleventy/cmd.cjs
--output=dist/preview --quiet`. Keine Veröffentlichung und kein Push.
