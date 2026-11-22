# aeternuspublishing.com: Bestandsaufnahme und Maßnahmenpaket

Stand 22.11.2026 · geprüft: alle 174 Live-Seiten (Sitemap), Abgleich gegen `BUCHREGISTER.ndjson`, Browser Desktop 1280 px und Mobil 375 px. Nur gelesen, nichts geändert.

---

## Teil 1: Bestandsaufnahme

### Das Gute (bleibt)

- Alle 174 Seiten antworten mit 200. Jede Seite hat Titel, Beschreibung, Canonical, Vorschaubild und strukturierte Daten (83 × Book, 52 × ProfilePage). Jedes Bild hat Alt-Text. Mobil scrollt nichts seitwärts.
- Die Gestaltung trägt: dunkler Kopf, Goldmarke, ruhige Serifen. Die Buchseiten sehen hochwertig aus. Die Startseite hat eine klare Haltung („Voices from another age. Books for ours.“).
- Wir müssen nicht neu bauen, wir müssen **aufräumen, vereinheitlichen und automatisieren**.

### A. Bücher: Status, Kaufwege, Cover

| Befund | Umfang | Beispiele |
|---|---|---|
| **Kein Kaufknopf** bei lieferbaren Büchern. Die Seite sagt „order using this ISBN“ | ~60 von 84 Buchseiten, nur 21 mit Händlerlink | Cooper (alle 5), Haggard (alle 5), Doyle, Hamilton, Poe, Melliss, Kitchener I–III |
| **Status falsch** gegenüber dem Buchregister | mindestens 6 | *Naval War of 1812*: Hardcover LIVE, Seite „Forthcoming“ · *Campaign in Tirah*: LIVE, Text „Submitted to IngramSpark; eProof pending“ (auch auf /books/, /series/gruen/, Autorenseite) · *Defence of India*: „available“, Register nicht LIVE · *Wieland*: Register BLOCKIERT, Seite online · *Scott I/II*: „Available“ und „Forthcoming“ gemischt |
| **Statuszeile fehlt** ganz | ~30 Buchseiten | Kitchener I–III, Townshend, Rolf, Bevis, Oregon Trail |
| **Alte Ausweich-Umschläge** („fallback“, Stand Sept./Okt.) statt aktuellem Druckumschlag | 25 Buchseiten | Texas Ranger (Jennings), Seton Rolf/Two Little Savages/Arctic Prairies, Oregon Trail, Maude, Matabele, Prempeh, Gibson |
| **Kein Cover** | 1 | *The Conspiracy of Pontiac* |
| **Uneinheitliche Formatkarten**: ISBN mal mit, mal ohne Bindestrich; Preis mal „US$21.99“, mal „US list price $24.99“, meist gar nicht | alle | |
| **Doppelte oder verwirrende Seiten** | 4 Fälle | Joshua Duke (2 Seiten, eine nur GEBAUT) · Roberts Bd. 1/2 mit gleichem Seitentitel · White Company Sammelseite + 3 Bände · `younghusband/` und `francis-younghusband/` |

### B. Autorenseiten und Porträts

- **53 Autorenseiten.** Der Aufbau ist eine lange Spalte: Kopf → Bücher → „A life in context“ → Ehrungen → drei Klappen (Leben, Zeittafel, Quellen) ganz unten. Die eigentliche Biografie liegt hinter Klappen am Seitenende, die kaum jemand öffnet. Roosevelt: Desktop 4,5 Bildschirmhöhen, mobil 5,6. Mobil kommt das Porträt erst nach dem Einleitungstext.
- **Reiter gab es nie.** Im ganzen Git-Verlauf gibt es keine Reiterlösung. Seit 21.10. schreibt `REDAKTION.md` Klappen (`details`) vor. Ein Umbau auf Reiter ändert also diesen Standard und braucht Ihr Wort.
- **Porträts uneinheitlich.**
  - Nur 4 von 40 sind farbig (Townshend, Callwell, Roberts, Baden-Powell). Der Rest ist Schwarzweißfoto, Stich, Pastell oder Rekonstruktion, jeweils mit anderem Beschnitt.
  - Die Dateiformate sind gemischt (webp, png, jpg).
  - **13 Autoren haben kein Porträt:** Gleig, Hutchinson, Jennings, Duke, Macgregor, Stewart, Dickens, Kennedy, Gibson, McClure, Franklin, Irving, Parry.
- **Autorenübersicht:** 52 Einträge ohne Ordnung nach Reihe oder Alphabet, ohne Filter. Desktop 12 Bildschirmhöhen, mobil 19. Unter jedem Vorschaubild steht ein langer Herkunftsvermerk („Historical photograph; digitally restored, partly reconstructed and enlarged.“). Das gehört in die Quellen, nicht in die Übersicht. Nur 4 von 42 Bildern haben Maßangaben, deshalb springt das Layout beim Laden.
- **Englische Autorenseiten empfehlen deutsche Bücher:** Beard, Jefferies, Kephart, Murray, Miller und Stewart verweisen auf „Wilde Tiere, die ich kannte · German-language edition“, obwohl die englischen Seton-Ausgaben live sind.

### C. Lektorat (Text)

- **Fehlende Apostrophe** durch einen Zeichensatzfehler: „Watson s Life“ (Wilson und Übersicht), „Kennedy s book“, „Sir John Keane s too-tight coat“, „Steele s“.
- **Gerade statt typografische Apostrophe** auf 12 Buchseiten (Gleig, Wilson, Steevens, Hamilton …).
- **Dopplungen:** „AETERNUS AETERNUS“ (Hill, Treasure Island), „Hutchinson Hutchinson“ (Townshend), „Townshend Townshend“ (Melliss).
- **Leerzeichen vor Satzzeichen** auf 5 Buchseiten (McClure, Jennings, Beard, Chitral, Poe).
- **Interne Sprache öffentlich:** „Publication details will follow after approval.“ (Kennedy), „eProof pending“, „Submitted to IngramSpark“.
- **Ungleiche Teaser auf der Startseite:** Gleig ~120 Wörter, Jennings ein Satz, Rough Riders ohne Status. Erster Titel ist ein „Forthcoming“ (McClure).

### D. Technik und Tempo

- **Das Instagram-Symbol im Kopf ist ein PNG mit 2,6 MB und lädt auf jeder Seite.** Allein das macht jede Seite träge.
- /books/ lädt **31 MB** Bilder, /authors/ **19 MB**. Porträts bis 2 MB als PNG, auf /authors/ ohne responsive Bildgrößen. Ein Cover hat 1 MB.
- **Bücherliste:** Desktop 15 500 px, mobil 26 800 px (≈ 33 Bildschirme). Kein Filter, keine Suche, keine Sortierung.
- **SEO-Feinheiten:**
  - 83 Beschreibungen sind länger als 165 Zeichen (Google kürzt), 65 Titel länger als 65 Zeichen.
  - 2 doppelte Seitentitel.
  - Im Book-Schema fehlen Preis und Angebot.
- **Betrieb:** Die Live-Seite kommt per ZIP-Handupload auf Cloudflare Pages. Repo und Live-Stand können unbemerkt auseinanderlaufen. Das erklärt Ihr Gefühl, dass vieles durcheinandergeraten ist: Jede Buchrunde hat ihre Seite einzeln nachgezogen, keine hat das Ganze abgeglichen.

---

## Teil 2: Maßnahmenpaket (Empfehlung als Webdesigner)

### Welle 1: Vertrauen und Verkauf (sofort, ~1 Arbeitstag)

1. **Eine Quelle der Wahrheit.** Status, Cover, ISBN, Seitenzahl und Preis jeder Buchseite kommen beim Bau maschinell aus dem Buchregister, nicht mehr von Hand. Statuswörter werden vereinheitlicht: *Available now* / *Coming soon* (mit Monat). Interne Wörter (eProof, Submitted, approval) sperrt ein Gate.
2. **Kaufknopf für jede lieferbare Ausgabe.** Einheitliche Formatkarte: Format · Seiten · Preis · **[Buy on Amazon]** (Länderwahl US/UK/CA/AU) · **[Other booksellers]** (Bookshop.org / Barnes & Noble per ISBN).
3. **Aktuelle Druckumschläge** auf allen 84 Buchseiten: 25 Ausweich-Umschläge ersetzen, Pontiac nachziehen.
4. **Lektoratsfehler beheben:** Apostrophe, Dopplungen, Leerzeichen, deutsche Seton-Empfehlungen durch englische ersetzen.
5. **Ladezeit:** Instagram-Symbol als SVG (2,6 MB → 1 KB). Porträts und Cover als WebP/AVIF in drei Größen. Ziel: jede Seite unter 1,5 MB.

### Welle 2: Autorenseiten neu (Ihr Kernwunsch)

6. **Reiteraufbau.** Kopf mit großem Farbporträt, Name, Lebensdaten, Rang und einem Satz Eröffnung. Darunter eine **haftende Reiterleiste:** **Books · Life · Timeline · Honours · Sources** (dazu *Places*, wo vorhanden).
   - „Books“ ist beim Öffnen aktiv.
   - Jeder Reiter hat eine eigene Adresse (`#life`), lässt sich also verlinken und funktioniert mit dem Zurück-Knopf.
   - Mit Tastatur und Screenreader bedienbar; mobil wischbar.
   - Die Seite passt dann in etwa 1,5 Bildschirmhöhen. Ohne JavaScript bleiben die Abschnitte untereinander lesbar, Suchmaschinen sehen weiter den ganzen Text.
7. **Porträts einheitlich farbig.** Gleiches Format (4:5), gleicher Beschnitt, gleiche Rahmung.
   - Quelle sind die kolorierten Porträts aus den Autorenkapiteln der Bücher.
   - Der Herkunftsvermerk wandert in den Reiter „Sources“.
   - Die 13 fehlenden Porträts werden ergänzt.
   - Laut `REDAKTION.md` brauchen freigegebene Porträts dafür Ihren ausdrücklichen Auftrag.
8. **Autorenübersicht als Porträtraster.** Kacheln mit Bild, Name, Lebensdaten und Reihenfarbe. Filter nach Reihe, A–Z, Suchfeld. Etwa 3 statt 12 Bildschirme.

### Welle 3: Katalog und Startseite

9. **Bücherseite mit Filter.** Reihe, Autor, Format, „lieferbar“, dazu Sortierung (neueste, A–Z) und Suche. Sichtbare Reihenabschnitte.
10. **Startseite:** „New releases“ automatisch aus den vier neuesten LIVE-Titeln, Teaser einheitlich höchstens 35 Wörter, klarer Kauf-Aufruf.
11. **Doppelseiten zusammenführen** (Duke, Younghusband, White Company) mit Weiterleitung.

### Welle 4: Dauerhaft auf Niveau (Betrieb)

12. **Qualitätsgate bei jedem Bau.** Registerabgleich (Status, Cover, Kauflink), Lektorats-Prüfung (Apostroph, Dopplung, interne Wörter, Deutsch auf EN-Seiten), Bildgewichtsgrenze, Lighthouse ≥ 90. Rot stoppt den Bau.
13. **Automatischer Deploy** statt ZIP-Upload: Cloudflare Pages an GitHub anbinden. Das ist eine Kontoeinstellung, nur mit Ihrem Wort.
14. **SEO-Feinschliff:** Titel und Beschreibungen kürzen, Preis und Angebot ins Book-Schema, Brotkrumen-Schema, Autoren mit Wikipedia/Wikidata verknüpfen.
15. **Monatlicher Seitenprüflauf** mit Kurzbericht, damit nichts mehr unbemerkt wegdriftet.

## Welle 1 – Stand bei Freigabe (22.11.2026)

- Build `build:international:production`: PASS (174 Routen, 83 Bücher, 52 Autoren).
- Kaufbox auf 63 von 84 Buchseiten (vorher 21): Format, US-Listenpreis, Seitenzahl, ISBN, Amazon mit Marktwahl (US/UK/CA/AU), Bookshop.org und Barnes & Noble. Direkte `/dp/`-Links nur für bestätigte Angebote, sonst ISBN-Suche.
- Statuszeile auf jeder Karte: „Available now · Paperback, Hardcover, Kindle“ in fester Reihenfolge und ohne Dopplungen, sonst „Coming soon“. „Forthcoming“ wurde vereinheitlicht.
- Entfernte interne Wörter: eProof, Submitted to IngramSpark, after approval, „pages in the Ingram edition(s)“, „Ingram revision R872“.
- Vorschaubilder (WebP 480 px, beim Build erzeugt) für Buchkarten, Autorenbuchkarten und Porträtliste. Bildlast /books/ 24 MB → 1,8 MB, /authors/ 17,1 MB → 1,2 MB, Startseite 1,7 MB → rund 0,5 MB (Gutenberg-Illustration 1200 px).
- Cover: 22 Vorderseiten und 6 Rückseiten aus hashgeprüften Register-PDFs; Hawk Hollow aus dem KDP-Paket vom 07.09.2026 (sha256 ad8f09c0…). Woodcraft und Gillett zeigen bereits ihre echten Cover (nur der Dateiname enthält „fallback“).
- Henry Ford: „German-language editions“ ist richtig, auf Englisch gibt es nur die deutschen Ausgaben, der Link führt zu aeternus-verlag.de.
- Entscheidung: `decision_website_en_welle1_freigabe_pr_deploy_cover_suche_20261122`.

## Wave 1: merge preparation (22.11.2026)

The wave-1 changes broke three checks of the German deploy run. They are fixed before the merge:

- `catalog/thumbs.cjs`: the `thumb` filter is a shared plugin. The German build also renders the English listing templates.
- `scripts/rebind-cover-identities.cjs`: 23 English cover bindings moved to the register covers (same artwork). The old binding stays under `previous_cover_binding`.
- `scripts/rebind-format-identities.cjs`: 20 English form bindings now use the public labels without a platform suffix, one per ISBN. Tokens and register evidence are merged, and no ISBN changed. Roberts I/II are bound from the LIVE register rows. The old binding stays under `previous_format_binding`.
- `check-author-worlds`: accepts the 480 px thumbnail of the expected cover.
- `check-book-identities --international`: an Amazon ISBN search is allowed only for an ISBN-13 bound to that page. A general search or a foreign ISBN fails (two new negative cases).

Results: check:text, check:author-order, check:author-worlds (de-only and both builds), check:edition-languages, check:book-identities (plain and `--international`) and check:kosmos all PASS. check-english-site PASS.

## Wave 2: author pages in tabs, portrait grid, cover portraits (22.11.2026)

- `international/author.njk`: English author pages in tabs (Books · Life · Timeline · Honours · Places · Sources); empty tabs are left out. Without JavaScript all panels stay visible and the tab bar is an in-page navigation. The portrait sits in a 4:5 frame; its caption moved to the Sources tab. The German `content.njk` is unchanged.
- `international/authors.njk`: portrait grid with series filter, search and sort (programme order, name, year of birth); authors without a portrait show their initials.
- `international/assets/css/author-tabs.css` (aw-* classes) and `international.js` (tabs with arrow keys and hash routing, filters).
- Seven author pages take the portrait from their book cover (`scripts/apply-cover-portraits-20261122.cjs`, crops in `WELLE2_COVER_PORTRAIT_CROPS_20261122.json`, approval sheet `WELLE2_PORTRAETS_VOM_COVER_20261122.jpg`). The old binding stays under `previous_image`; no asset was deleted. Winfield Scott's image class is open in `PORTRAET_QUELLEN_OFFEN.json`. Roberts keeps the seated portrait.
- Results: check:text, check:author-order, check:author-worlds (de-only and both builds), check:edition-languages, check:book-identities (plain and `--international`), check:kosmos and check-english-site all PASS.
- Open: 23 black-and-white portraits are being colourised (each image to the publisher for approval); 12 authors without a portrait get a sourced search, each image presented.
- Decisions: `decision_website_en_welle2_coverportraets_sieben_roberts_sitzend_gpt_kolorierung_20261122`, `decision_website_en_welle2_freigabe_reiter_raster_coverportraets_live_portraetsuche_20261122`.
