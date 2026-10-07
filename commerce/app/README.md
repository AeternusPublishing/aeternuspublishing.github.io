# AETERNUS Direktvertrieb: privater Testbetrieb

Stand 07.10.2026. Der Auftrag ist, Shop, Verwaltung und Abwicklung zu bauen, ohne Live-Verkauf. Dies ist ein ausführbarer Teststand, noch keine Verkaufsfreigabe.

## Start auf diesem Rechner

Im Website-Auscheck `C:\_CB\aeternus-shop-20261007`:

```powershell
npm run shop:preview
```

Shop: http://127.0.0.1:8093/shop/ · Verwaltung: http://127.0.0.1:8093/admin/
Die lokale Verwaltung erhält einen bei jedem Serverstart neu erzeugten Zugang; auf „Anmelden“ klicken. Der Server hört ausschließlich auf 127.0.0.1 und prüft den Host. Testdaten: `%LOCALAPPDATA%\AETERNUS\commerce-preview\test-orders.sqlite`, außerhalb Git. Es dürfen ausschließlich fiktive Testdaten verwendet werden.

## Was funktioniert

- Deutscher und englischer Shop, Suche, Filter, Warenkorb, Versandadresse, Kostenangebot mit Ablaufzeit und Bestellzugang.
- 79 gedruckte Varianten aus dem vorhandenen Website-Katalog (52 DE / 27 EN). Importierte Metadaten sind keine bestätigte Lieferbarkeit. Edgar-Huntly-Pilot-ISBNs wurden zusätzlich mit dem Buchregister abgeglichen.
- Persistente Bestellungen, Statusjournal, Zahlungsabgleich, Verwaltung, Datenexport, Teil-/Vollerstattung, Widerruf und Nachrichten-Outbox.
- Serverseitige Mengen-/Betragsprüfung, signierter Stripe-Webhook, doppelte Ereignisse und parallele Druckanforderungen berücksichtigt.
- Lulu-Sandbox-Adapter: OAuth, Versandoptionen, Vollkosten, Druckauftrag und Statusabfrage; Stripe-Testadapter: Checkout und Erstattung. Lulu-OAuth, Versandoptionen, Kosten und PB-/HC-Umschlagmaße sowie Stripe-API, Checkout, Zahlung, signierte lokale Webhook-Zustellung und Erstattung sind mit den Anbieterzugängen geprüft. Lulu-Druckaufträge und Webhook-Zustellung zur späteren Cloud-Umgebung fehlen noch.
- Nachgelagerte Queue: `npm run shop:process` bearbeitet maximal zehn bestätigte Bestellungen bzw. deren Druckstände. Ungewisse Übertragungen bleiben zur Klärung stehen. Im Cloud-Worker ist derselbe Ablauf vorbereitet, ohne aktivierten Zeitplan.
- `npm run shop:backup` erzeugt eine konsistente SQLite-Sicherung im privaten Datenordner; Sicherung testweise wiederhergestellt und geprüft. Keine automatische Löschung oder Überschreibung.

Die angezeigten 24,90 / 34,90 und Versand 6,50 sind **frei gewählte Testbeträge** je dargestellter Währung, keine Umrechnung und keine genehmigten Verkaufspreise. Druckkosten und Zahlungsbestätigungen werden im lokalen Modus simuliert. Kundenmails werden ausschließlich als lesbare Entwürfe in der Outbox gespeichert. Bei Zahlungsbestätigung entsteht genau ein maschinenlesbarer Rechnungsentwurf mit Positionen und Testnummer; echter Rechnungsversand und echter Mailversand sind noch gesperrt.

## Website-Einbindung

`AETERNUS_SHOP_PREVIEW=1` zeigt im lokalen DE-/EN-Website-Bau einen Link zum Testshop. Ohne diesen Schalter wird kein Link ergänzt; im Produktionsmodus ist der Link immer gesperrt. Der Shop ist ein eigener Dienst, nicht ein statisches Eleventy-Checkout. Die vorhandenen Handelslinks und Shopify-Entwürfe bleiben erhalten.

## Anbieterwechsel / Sandbox

Die Anwendung trennt Katalog, Bestellzustand und Anbieteradapter. `MODE=sandbox` erlaubt ausschließlich Stripe-Testschlüssel und `api.sandbox.lulu.com`. `MODE=production` und Live-Schlüssel sind im Code gesperrt. Simulation wird bei öffentlichen Hostnamen verweigert.

Secrets gehören in Prozessvariablen oder einen Secret Store, niemals ins Repository. Konfigurationsbedarf steht in `env.example`. Lulu und das separate Sandbox-Konto `kontakt@aeternus-verlag.de` sind am 07.10. angemeldet und geprüft. Der ausdrücklich freigegebene Sandbox-Client liegt im Windows-Anmeldetresor unter `AETERNUS/Lulu/Sandbox`. Lokaler Sandbox-Server und Queue lesen ihn über einen privaten Prozesskanal; die Simulation liest keine Zugangsdaten. Auf einem anderen Rechner oder im Cloud-Worker muss ein eigener Secret Store konfiguriert werden.

`node commerce/app/verify-lulu.mjs` prüft ausschließlich Anmeldung, Versandoptionen und Kosten mit einem Dokumentationsprodukt und einer öffentlichen US-Adresse. Beleg: `evidence/lulu-sandbox-verification.json`. Ergebnis: 10,10 EUR für dieses Testbeispiel, kein Verkaufspreis. Die Kostenberechnung lieferte bei angeforderten USD die Kontowährung EUR; der Adapter sperrt diesen Währungskonflikt. Angebote in USD/GBP/CAD/AUD benötigen deshalb erst eine geprüfte Kalkulations- und Währungsstrategie. Keine Kontowährung wurde geändert und kein Druckauftrag erzeugt.

Vor echten Sandbox-Bestellungen müssen Artikel ausdrücklich freigegeben und mit gültigen Druckdatei-URLs plus SHA-256, Landespreisen und geprüfter Kalkulation versehen sein. Die vorhandenen Kandidaten-Paketcodes sind nicht als Lulu-validierte Profile bestätigt. Aktuelle Lulu-Vollkosten müssen zur Angebotswährung passen. Lieferland und Steuer-/Zahlungskosten werden nicht geraten; fehlende Regeln blockieren.

## Betrieb und Fehlerbehandlung

Maschinelle Betriebsbefehle:

- `npm run shop:readiness`: schreibt `evidence/launch-preflight.json` mit Produktbefunden, Zuständigkeiten und SHA-256 des technischen Stands. Rückgabe 0 bedeutet nur, dass der Bericht erzeugt wurde; `sales_ready` bleibt false.
- `npm run shop:preflight`: dieselbe Prüfung als Sperrprüfung; Rückgabe 2 solange Startvoraussetzungen fehlen. Der aktuelle Code enthält keinen freigegebenen Produktionsmodus.
- `npm run shop:monitor`: öffnet die lokale Testdatenbank ausschließlich lesend, prüft Integrität und meldet unklare Druck-/Erstattungsvorgänge, unbezahlte Lulu-Aufträge, alte Zahlungen und Druckverzögerungen. Rückgabe 2 erfordert Klärung. Ausgabe enthält keine Kundenadressen oder E-Mail-Adressen.
- `npm run shop:verify-stripe`: prüft mit einem außerhalb Git bereitgestellten `sk_test_` nur die Stripe-Konto-Verbindung. Es erzeugt keinen Checkout und keine Zahlung. Kontoidentität erscheint nur als SHA-256 im Beleg; eine erfolgreiche Testverbindung beweist keine Live-Aktivierung.

`release-plan.json` enthält die noch offenen Startvoraussetzungen; Edgar Huntly PB/HC sind lediglich bisherige Pilotkandidaten, keine genehmigte Startauswahl. `stripe-setup.json` enthält die technische Kontoeinrichtung und Abnahmefälle. Die AETERNUS-Sandbox ist am 07.10.2026 eingerichtet, mit Deutschland, Verlagswebsite und einmaligen Buchverkäufen. Stripe Checkout ist ausgewählt. Der ausdrücklich freigegebene vorhandene Testschlüssel liegt im Windows-Tresor `AETERNUS/Stripe/Sandbox`; lokale Sandbox-Befehle laden ihn über einen privaten Prozesskanal. Die Simulation lädt keine Zugangsdaten. Käufer benötigen kein eigenes Stripe-Konto. E-Mail-Bestätigung, Unternehmensprüfung und Live-Aktivierung sind weiter offen.

Anbieterprüfung: `verify-stripe-checkout.mjs` erstellt ausschließlich eine separate fiktive Sandbox-Session über 1,00 EUR, keinen freigegebenen Buchverkauf. Die private Session-URL liegt außerhalb Git. `verify-stripe-payment.mjs <private-fixture.json>` liest den Zahlungsstand authentifiziert; `--refund` ist ausschließlich für die ausdrücklich autorisierte Testerstattung vorgesehen und verwendet einen stabilen Idempotenzschlüssel. Zahlung und Vollerstattung wurden am 07.10. erfolgreich mit der offiziellen Stripe-Testkarte geprüft. Belege: `evidence/stripe-sandbox-verification.json`, `evidence/stripe-checkout-verification.json`. Diese isolierte Anbieterprüfung beweist weder die echte Webhook-Zustellung noch einen vollständigen Shop-Lulu-Ablauf.

`node commerce/app/verify-webhook.mjs --authorized-test` führt einen ausdrücklich autorisierten, separaten Sandbox-Integrationstest durch. Das offizielle Stripe CLI 1.53.0 wird lokal gestartet; Schlüssel und temporäres Signaturgeheimnis bleiben im Prozess. Der Server bindet nur an 127.0.0.1:8094 und nimmt ausschließlich Stripe-Webhooks entgegen. Eine fiktive 1-EUR-Bestellung liegt in einer eigenen SQLite-Datei außerhalb Git. Am 07.10. kamen die echten Stripe-Ereignisse über die CLI an: Signatur bestanden, Status PAID, genau ein Rechnungs-/Nachrichtenentwurf, Wiederholung ignoriert, Drucksperre bestanden, vollständige Erstattung und REFUNDED. Danach wurden Listener und Server beendet. Beleg: `evidence/stripe-webhook-verification.json`. Das ist eine lokale Zustellprüfung, keine Cloud-Abnahme und kein Buchverkauf. Für eine Wiederholung braucht das CLI dieselbe Installation oder `STRIPE_CLI_PATH`.

`node commerce/app/prepare-lulu.mjs` fragt ausschließlich Umschlagmaße für die Pilotkandidaten ab. Bei den bisherigen 316-Seiten-Spezifikationen: PB 938 × 666 pt, HC 1062 × 774 pt. Beleg: `evidence/lulu-product-preparation.json`. Keine PDF-Datei wird übertragen. Nach endgültiger Seitenzahl erneut messen; Maße ersetzen weder Datei-Validierung noch Muster- oder Produktfreigabe. Vor jeder echten Sandbox-Druckübergabe werden aktuelle Katalogfreigabe und Dateihashes erneut mit der Bestellung verglichen. Integrationsfixtures bleiben grundsätzlich druckgesperrt.

Stripe nimmt Kundenzahlungen entgegen; Lulu muss separat für Druck und Versand bezahlt werden. Vor automatischem Betrieb sind eine Zahlungsmethode und automatische Zahlungen im Lulu-Produktionsportal einzurichten und nachzuweisen. Keine Kontozahlung wurde eingerichtet. [Stripe-Kontoaktivierung](https://docs.stripe.com/get-started/account/set-up) · [Lulu-Zahlungseinrichtung](https://help.api.lulu.com/en/support/solutions/articles/64000311553-how-do-i-set-up-scheduled-batch-payments-).

1. `QUOTED → PAYMENT_PENDING → PAID`: nur bestätigte, betrags- und währungsgleiche Testzahlungen werden übernommen. Ein fehlgeschlagener Stripe-Checkout kann mit demselben Idempotenzschlüssel erneut abgefragt werden.
2. `PAID → SUBMITTING → PRINT_SUBMITTED`: Ein unklarer Lulu-Ausgang wird `SUBMISSION_UNKNOWN`. Kein automatisches Wiederholen. Vorhandene Lulu-Job-ID in der Verwaltung zuordnen; deren `external_id` muss zur Bestellung passen. `SUBMITTING` nach einem Prozessabbruch ebenfalls klären.
3. Lulu-Statusabfrage führt vorwärts zu `IN_PRODUCTION` / `SHIPPED`. Rückwärts laufende Antworten werden ignoriert. Ablehnung, Stornierung und unbekannte Zustände erzeugen einen Prüfvermerk. Versand ist kein Zustellnachweis.
4. Widerrufe speichern Eingang und Bestätigung; sie sperren einen noch nicht gestarteten Druck. Bereits gestartete Produktion muss anhand des Lulu-Stands manuell geklärt werden.
5. Erstattung vor Produktionsbeginn: Betrag wird vor der Anfrage reserviert. Unklare/pending Erstattungen werden nicht als abgeschlossen ausgegeben. Im Stripe-Dashboard abgleichen, ehe ein neuer Vorgang eröffnet wird. Rückabwicklung nach Druckbeginn bleibt manuell.
6. Nachrichten in der Verwaltung prüfen; bis zur Absender-/Textfreigabe erfolgt kein Versand. Ein formaler Rechnungsprozess mit Nummernkreis, Steuerpositionen, Gutschriften, Aufbewahrung und Buchhaltungsübergabe ist vor Livebetrieb separat fertigzustellen.

## Cloud-Vorbereitung

Die D1-Datenbank `aeternus-commerce-sandbox` wurde am 07.10. in WEUR angelegt und `0001.sql` eingespielt. Die fünf Anwendungstabellen sind vorhanden, Bestellungen = 0. Es wurden keine lokalen Bestell- oder Kundendaten übertragen. Der Worker ist hochgeladen, ohne öffentliche Route und mit `PRIVATE_DEPLOYMENT_VERIFIED=false`. `workers_dev=false`, Vorschau-URLs ausgeschaltet. Der Worker prüft Cloudflare-Access-JWTs kryptografisch (Issuer, Audience, Zeit, Signatur und zugelassenes Betreiberpostfach). Der signierte Stripe-Webhook ist die einzige vorgesehene Ausnahme. `private-hosting-plan.json` beschreibt den Aufbau für `sandbox-shop.aeternuspublishing.com`. Der vorhandene Cloudflare-OAuth-Zugang erhält beim Access-API-Lesen HTTP 403; Dashboard-Anmeldung und Access-Anwendung fehlen noch. Der Verleger hat die Cloud-Anbindung gesondert freigegeben: Stripe-/Lulu-Sandbox-Schlüssel und ein privater Verwaltungszugang sind im Worker-Secret-Store gespeichert, keine Werte in Dateien oder Git. Der Verwaltungszugang liegt zusätzlich im Windows-Tresor `AETERNUS/Shop/SandboxAdmin`. `provision-secrets.mjs --authorized-cloud-transfer` liest ausschließlich private Prozesskanäle und unterdrückt Anbieter-Ausgaben. Ein eigener Cloud-Webhook samt Signaturgeheimnis fehlt noch. Der Worker verweigert vor verifizierter privater Provisionierung sämtliche Zugriffe.

`npm run shop:cloud-backup` exportiert die D1-Datenbank in eine neue private SQL-Datei und stellt sie in einer neuen lokalen SQLite-Datei wieder her. Die Prüfung am 07.10. ergab Integrität `ok`, fünf Anwendungstabellen und 0 Bestellungen; SQL-Hash und Prüfresultat stehen in `evidence/cloud-backup-verification.json`. Temporäre signierte Download-URLs werden unterdrückt. Das beweist Export und lokale Lesbarkeit, noch keine Wiederherstellung auf Cloudflare und keinen Lasttest mit echten Bestelldaten. Es wird keine vorhandene Datenbank überschrieben.

## Offene Abnahmen

Cloudflare-Dashboard am 07.10. angemeldet. Zero Trust war noch nicht aktiviert; der Free-Tarif ist im Abschluss vorbereitet. Das Dashboard zeigt 0 USD/Monat Grundgebühr und verlangt zusätzlich Zustimmung zu Vertragsbedingungen sowie monatlicher Abrechnung oberhalb der Gratisgrenzen. Dieser Abschluss wurde dem Verleger übergeben; keine Checkbox wurde durch den Agenten bestätigt. Nach Aktivierung folgt die private Access-Anwendung. Die Sandbox-Schlüsselfreigabe ist vorhanden und muss nicht erneut eingeholt werden.

Die maschinenlesbare Liste steht in `readiness.json` und in der Verwaltung: Anmeldung und Testschlüssel, Lulu-Druckprüfung und Muster PB/HC, Differenzierungsdossier, Landespreise/Margen, Steuer-/Rechtstexte, Kundenkommunikation, Rechnungs-/Buchhaltungsprozess, privates Hosting und Live-Freigabe. Keine dieser Abnahmen wird durch einen erfolgreichen technischen Test ersetzt.

## Prüfung

```powershell
npm run shop:check
npm run shop:test
npm run shop:check-website
npm run shop:build
wrangler deploy --dry-run --config commerce/app/wrangler.jsonc
```

Der vorhandene internationale Website-Check enthält ältere Katalog-/DE-HTML-Snapshotwerte und schlägt bereits auf dem unveränderten Basisstand fehl. Zusätzlich fehlt auf der bestehenden EN-Atlas-Vorschau der noindex-Marker. Diese Befunde bleiben dokumentiert; keine Snapshotwerte wurden zur Erzeugung eines grünen Tests aktualisiert. Das neue Commerce-Laufzeitsystem verwendet ausschließlich Node-/Web-Standardbibliotheken; es erhält keine Eleventy-Abhängigkeiten. Der vorhandene Website-Build hat beim npm-Audit 12 transitive/direkte Entwicklungsbefunde (5 moderate, 7 high). Kein pauschales `audit fix --force` ausgeführt.

Offizielle Schnittstellen: [Lulu OpenAPI](https://api.lulu.com/api-docs/openapi-specs/openapi_public.yml), [Stripe Checkout](https://docs.stripe.com/api/checkout/sessions/create), [Stripe Webhooks](https://docs.stripe.com/webhooks/signature), [Stripe Refunds](https://docs.stripe.com/refunds), [Cloudflare Access JWT](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).
