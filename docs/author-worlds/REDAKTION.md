# Historische Autorenwelten · Redaktionsrichtlinie

Verbindlicher Standard seit 21. Oktober 2026 auf ausdrücklichen Verlegerauftrag. Referenz ist die veröffentlichte Autorenwelten-Fassung (PR #152).

## Auftrag und Stimme

Die Seite erschließt einen Menschen, seine historische Welt und sein literarisches Werk. Würde, Genauigkeit, erzählerische Kraft und die individuelle Eigenart gehen vor Textmenge. Anschauliche Aussagen brauchen einen Gegenstand: einen Ort, eine Entscheidung, ein Buch, ein Verfahren. Keine psychologischen Motive erfinden, keine Superlative einsetzen, keine Niederlage in einen Sieg umdeuten. Historische Widersprüche aus dem jeweiligen Leben erklären. Die Sprache des Verlags ersetzt weder Quellenkritik noch den Standpunkt des historischen Autors.

Für deutschsprachige Verlagstexte zusätzlich die aktuelle Verlegerstimme aus dem AETERNUS-Publishing-Skill lesen. Deren Beispiele sind Stilvorbilder, keine historischen Belege. Buchtexte und bereits freigegebene Paratexte bleiben eigenständige Produktionsartefakte.

## Ein Dossier, mehrere vorhandene Sprachfassungen

`editorial/author-worlds/authors/<slug>.json` enthält den gemeinsamen Tatsachenbestand, Quellen und begründete Auslassungen. `locales.de` und `locales.en` tragen die jeweils eigenständig formulierte Prosa. `scope` dokumentiert die vorhandenen Routen; es ist kein Auftrag für zusätzliche Sprachen.

`facts` benennt überprüfbare Aussagen mit Quellenkennungen. `uncertainties` unterscheidet OFFEN und EINGESCHRÄNKT. `interpretation` benennt die historische Deutung; `appraisal` die eigene literarische Würdigung. Für neue Recherche Fundstellen möglichst bis zum Abschnitt oder Blatt präzisieren. Ein pauschales BELEGT darf keinen ungeprüften Einzelwert verdecken. Ein historischer Katalog kann einen Werktitel bestätigen, ohne eine ganze Laufbahn oder eine Weltrechtefreigabe zu belegen.

Originalquelle und spätere Forschung nach Zweck wählen: Ernennungen und Orden aus datierten amtlichen Zeugnissen; Lebenswege aus Archiven, Institutionen und belastbaren Biografien; literarische Form am Werk erläutern. Eigenzeugnisse als solche lesen, besonders Rechtfertigungsschriften von Befehlshabern. Widersprüche sichtbar im Dossier bewahren. Auszeichnungsjahr, Verleihungsdatum und Datum der Urkunde sind verschiedene Angaben.

## Komposition und Tiefenstufe

Der Kopf nennt den belegbaren vollständigen Namen, Lebensdaten mit erforderlicher Unsicherheit und gegebenenfalls Rang, Würde und Erwerbsjahr. Eine starke Eröffnung führt zum Leben. Danach stehen sofort die tatsächlich vorhandenen Bücher mit einer individuellen Brücke zum Werk.

Der kompakte Überblick bleibt sichtbar. Die ausführliche Biografie, Chronologie, Schauplätze und Dokumente werden mit nativen `details` erschlossen. Geeignete Ehrungen erscheinen als ruhige Textgalerie; keine erfundenen Insignien. Drei bis fünf bedeutende Einträge sind ein guter Ausschnitt, aber eine einzelne belegte Ehrung darf allein stehen. Unterschiedliche Kategorien sichtbar benennen.

Kompakt: gezielte Biografie und Werkdeutung, ohne künstlich vermehrte Module. Erweitert: zusätzliche belegte Lebensstationen, Zeittafel oder Ehrungen. Umfassend: ein besonders ergiebiger Lebens- und Werkzusammenhang mit mehreren unterschiedlichen Vertiefungen. Die Stufe ist keine Rangordnung der Personen. Keine Mindestwortzahl.

## Bilder und historische Beziehungen

Jedes neue Bild erhält Originaldatei, Quellenadresse, Identität, Rechtebegründung, Bearbeitung, Abmessungen und SHA-256. Dokumentarische Ausschnitte als Ausschnitte benennen. Der Inhalt eines gemeinsamen Fotos belegt die gemeinsame Aufnahme, nicht ohne weitere Quelle deren genaues Datum oder eine behauptete besondere Zusammenarbeit. Unsichere Archivetiketten nicht präziser darstellen, als die Aufnahme sie trägt.

Die bisherigen Porträts sind laut Verlegerwort vom 21.10.2026 bereits freigegeben und bleiben sichtbar. Offene Herkunftsangaben intern dokumentieren, nicht eigenmächtig ausblenden oder ersetzen. Die Freigabe am konkreten Asset-Hash festhalten. Historische Kolorierung, moderne Kolorierung, Restaurierung und generative Rekonstruktion müssen auseinandergehalten werden. Neue Bildgenerierung gehört nicht zum Regelablauf dieser Autorenwelten.

Verweise müssen einen konkreten Erkenntnisgewinn bieten. `kind` unterscheidet dokumentierte Begegnung, institutionellen Zusammenhang, gemeinsamen Feldzug und thematischen Vergleich. Für den Vergleich keine persönliche Beziehung behaupten. Ziele auf bestehende Sprachfassungen beschränken und einen Sprachwechsel benennen.

## Technik und Prüfung

Adapter: `catalog/author-worlds.cjs`. Gemeinsame Bausteine: `editorial/author-worlds/components/`. Darstellung: `src/assets/css/author-worlds.css`. Beide Eleventy-Konfigurationen verwenden denselben Adapter und dieselben Bausteine. Die zwölf älteren englischen Seiten beziehen Prosa und englische Buchkarten aus denselben Quellen wie die internationale Website.

Buchidentitäten bleiben Eigentum der bestehenden Katalogdaten. Keine ISBN, Formate, Preise oder Cover im Biografiedossier neu führen. Der Rückverweis auf eine andere vorhandene Sprachausgabe ist ausdrücklich zu beschriften. Ohne englische Ausgabe keine englische Buchkarte aus einer deutschen ableiten.

Vor Übergabe: beide Builds, Dossier- und Routenprüfung, Ausgabezuordnung, Text- und Bildprüfung, Desktop und Mobilansicht sowie Tastaturbedienung. Lokal arbeiten und Ergebnisse bündeln. Die Prüfergebnisse sind technische Evidenz; Endredaktion und Veröffentlichung bleiben eigene Freigabeschritte.

## Verbindlichkeit für künftige Aufträge

Dieser Standard gilt für alle künftig beauftragten neuen und überarbeiteten Autorenseiten. Er ist zentral in `C:\AETERNUS\CLAUDE.md`, der daraus erzeugten `AGENTS.md` und `DOKTRIN/REGISTER.md` verankert. Er ändert keine freigegebenen Buchtexte und erteilt keine pauschale Veröffentlichungsfreigabe.

### Schutz freigegebener Porträts

Freigegebene, handverlesene Porträts bleiben unverändert. Austausch, Bearbeitung, neuer Beschnitt, Nachkolorierung oder Ausblendung nur auf ausdrücklichen Verlegerauftrag für das betreffende Bild. Fehlende Herkunftsunterlagen intern dokumentieren; sie sind kein Grund, eine bestehende Freigabe eigenmächtig aufzuheben. Neue Bilder nur auf Auftrag und in Farbe. Bestehende Schwarzweißporträts bleiben erhalten; die Townshend-Kolorierung vom 21.10.2026 ist ein Einzelauftrag.
