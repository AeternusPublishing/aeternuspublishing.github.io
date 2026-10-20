# Historische Autorenwelten · Redaktionsrichtlinie

Entwicklungsstand 20. Oktober 2026. Grundlage ist der vollständige Verlegerauftrag „Die historischen Autorenwelten“. Die öffentliche Einführung steht unter dem gesonderten Sicht- und Freigabevorbehalt des Auftrags.

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

Vorhandene Bilder ohne ausreichenden Herkunftsnachweis bleiben im Inventar erhalten. Ihre Auslassung ist einem unzutreffenden Authentizitätsversprechen vorzuziehen. Historische Kolorierung, moderne Kolorierung, Restaurierung und generative Rekonstruktion müssen auseinandergehalten werden. Neue Bildgenerierung gehört nicht zum Regelablauf dieser Autorenwelten.

Verweise müssen einen konkreten Erkenntnisgewinn bieten. `kind` unterscheidet dokumentierte Begegnung, institutionellen Zusammenhang, gemeinsamen Feldzug und thematischen Vergleich. Für den Vergleich keine persönliche Beziehung behaupten. Ziele auf bestehende Sprachfassungen beschränken und einen Sprachwechsel benennen.

## Technik und Prüfung

Adapter: `catalog/author-worlds.cjs`. Gemeinsame Bausteine: `editorial/author-worlds/components/`. Darstellung: `src/assets/css/author-worlds.css`. Beide Eleventy-Konfigurationen verwenden denselben Adapter und dieselben Bausteine. Die zwölf älteren englischen Seiten beziehen Prosa und englische Buchkarten aus denselben Quellen wie die internationale Website.

Buchidentitäten bleiben Eigentum der bestehenden Katalogdaten. Keine ISBN, Formate, Preise oder Cover im Biografiedossier neu führen. Der Rückverweis auf eine andere vorhandene Sprachausgabe ist ausdrücklich zu beschriften. Ohne englische Ausgabe keine englische Buchkarte aus einer deutschen ableiten.

Vor Übergabe: beide Builds, Dossier- und Routenprüfung, Ausgabezuordnung, Text- und Bildprüfung, Desktop und Mobilansicht sowie Tastaturbedienung. Lokal arbeiten und Ergebnisse bündeln. Die Prüfergebnisse sind technische Evidenz; Endredaktion und Veröffentlichung bleiben eigene Freigabeschritte.

## Einbindung in künftige Buchaufträge

Die verschachtelte `editorial/author-worlds/AGENTS.md` bindet diese Regeln an künftige Arbeit am Websitebestand. Für die zentrale Buchproduktion ist nach Freigabe folgende Ergänzung der kanonischen `C:\AETERNUS\CLAUDE.md` vorgesehen; sie wird hier nur vorbereitet, nicht eigenmächtig eingetragen:

> Vor einer neuen oder geänderten Autoren-Landingpage das vorhandene Faktendossier und die Redaktionsrichtlinie `docs/author-worlds/REDAKTION.md` im Website-Repository lesen. Aus einem neuen Buch keine zusätzliche Autorensprache ableiten. Neue Werkdaten aus dem Buchregister beziehungsweise dem freigegebenen Katalog übernehmen; biografische Ergänzungen mit Quellen in das Autorendossier eintragen. Buchfreigabe und Websitefreigabe getrennt behandeln.

Die zentrale Regeldatei wird ausschließlich an ihrer kanonischen Quelle und mit dem vorgesehenen Synchronisationsverfahren geändert. Dieser Websitezweig baut keine zweite Buchpipeline.
