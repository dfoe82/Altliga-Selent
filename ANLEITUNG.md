# Mannschafts-App – Einrichtung

**Modular:** Die App startet mit **nur Terminen** (Training, Spiele, Turniere, Events) – für alle mit dem Link sichtbar, ohne Code. Alles Weitere schaltest du als Admin unter **Optionen → Module** frei, wenn ihr so weit seid: Spielerliste, Kader & Aufstellung, Spieler-Zugänge, Zu-/Absagen und Kommentare (jeweils einzeln für Training, Spiele, Events), Teilnahme-Auswertung, Umfragen, Helfer-Einteilung, Aktuelles mit rotem Banner, Pinnwand, Chat, Push und Kassen. Ausschalten blendet nur aus, die Daten bleiben erhalten. Beim Freischalten musst du nichts neu hochladen.

Diese Anleitung bringt die App auf GitHub Pages und verbindet sie mit Firebase, damit alle Spieler dieselben Daten sehen. Rechne mit etwa 30 bis 45 Minuten. Die Firebase-Konsole bedienst du am besten am PC oder Chromebook; auf dem iPhone geht es auch, ist aber fummelig.

**Kosten:** Der kostenlose Firebase-Tarif „Spark“ reicht für eine Mannschaft locker aus. Es wird keine Kreditkarte benötigt.

**Dateien in diesem Paket**

| Datei | Wofür |
|---|---|
| `index.html` | Die App. Kommt in dein GitHub-Repository. |
| `firestore.rules` | Die Sicherheitsregeln. Kommen in die Firebase-Konsole, nicht zu GitHub. |
| `ANLEITUNG.md` | Diese Anleitung. |
| `sw.js`, `manifest.webmanifest` | Für Push-Nachrichten und den Home-Bildschirm. Kommen mit ins GitHub-Repository. |
| `firebase.json`, Ordner `functions` | Das kleine Versand-Programm für Push-Nachrichten. Kommt mit ins GitHub-Repository. |
| `.github/workflows/push-einrichten.yml` | Richtet das Versand-Programm automatisch bei Firebase ein. Kommt mit ins GitHub-Repository. |

Die Demo mit Beispieldaten und die Präsentationsseite liegen in einem eigenen Repository (z. B. `mannschaftskasse-demo`). Diese Version enthält keinen Demo-Modus: Solange in `index.html` keine Firebase-Daten eingetragen sind, zeigt die App nur den Hinweis „Noch nicht eingerichtet“.

---

## 1. App auf GitHub Pages stellen

1. Auf github.com ein neues Repository anlegen, z. B. `kasse`. Es darf öffentlich sein, denn es enthält **keine** Spielerdaten.
2. **Add file → Upload files** → `index.html` hochladen → **Commit changes**.
3. **Settings → Pages** → bei „Branch“ `main` und `/ (root)` wählen → **Save**.
4. Nach ein bis zwei Minuten ist die App erreichbar unter
   `https://DEIN-GITHUB-NAME.github.io/kasse/`
   Diese Adresse brauchst du gleich noch.

## 2. Firebase-Projekt anlegen

1. https://console.firebase.google.com öffnen und mit einem Google-Konto anmelden.
2. **Projekt hinzufügen** → Name z. B. `mannschaftskasse` → Google Analytics **ausschalten** → Projekt erstellen.

## 3. Anmeldung einschalten

1. Links **Build → Authentication → Jetzt starten**.
2. Reiter **Sign-in method**:
   - **E-Mail-Adresse/Passwort** aktivieren (nur der erste Schalter) → Speichern. Damit melden sich die Admins an.
   - **Anonym** aktivieren → Speichern. Damit werden Spieler mit Code erkannt, ohne Konto. (Gebraucht erst mit dem Modul „Spieler-Zugänge“ – am besten trotzdem gleich einschalten.)
3. Reiter **Settings → Autorisierte Domains** → **Domain hinzufügen** → `DEIN-GITHUB-NAME.github.io` eintragen.
4. Optional: Unter **Templates** die Sprache der E-Mails auf Deutsch stellen.

## 4. Datenbank anlegen

1. Links **Build → Firestore Database → Datenbank erstellen**.
2. Standort **europe-west3 (Frankfurt)** wählen. Den Standort kann man später nicht mehr ändern.
3. **Im Produktionsmodus starten** → Erstellen.
4. Reiter **Regeln** → den gesamten Inhalt ersetzen durch den Inhalt der Datei `firestore.rules` → **Veröffentlichen**.

## 5. App mit Firebase verbinden

1. Zahnrad oben links → **Projekteinstellungen** → unten bei „Meine Apps“ auf das Symbol **`</>`** (Web) tippen.
2. App-Spitzname z. B. `kasse` → **Registrieren**. „Firebase Hosting“ **nicht** ankreuzen.
3. Firebase zeigt einen Block `const firebaseConfig = { apiKey: "...", ... }`. Die Werte brauchst du.
4. Auf GitHub `index.html` öffnen → Stift-Symbol (Bearbeiten) → nach `FIREBASE_CONFIG` suchen und die leeren Anführungszeichen mit deinen Werten füllen:

   ```js
   const FIREBASE_CONFIG = {
     apiKey: "AIza…",
     authDomain: "mannschaftskasse-xxxx.firebaseapp.com",
     projectId: "mannschaftskasse-xxxx",
     storageBucket: "mannschaftskasse-xxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```
5. **Commit changes**. Nach ein bis zwei Minuten ist die neue Version online.

> Die Firebase-Konfiguration ist kein Geheimnis und darf im öffentlichen Repository stehen. Geschützt werden die Daten durch die Sicherheitsregeln aus Schritt 4.

## 6. Dich selbst als ersten Admin einrichten

**Mach diesen Schritt direkt nach Schritt 5.** Die Ersteinrichtung ist nur einmal möglich: Wer sich als Erstes einrichtet, wird Admin mit allen Rechten.

1. App öffnen → **Admin-Anmeldung** (bzw. Schloss oben rechts) → **Konto erstellen** mit deiner E-Mail und einem Passwort (mindestens 8 Zeichen).
2. Es erscheint „Ersteinrichtung“ → Namen eingeben, z. B. `Kassenwart` → **Als ersten Admin einrichten**.
3. Fertig – du bist in der Admin-Ansicht. Die App legt die Starttermine an (Training dienstags 19 Uhr auf dem Schulsportplatz bis Oktober 2027, Offener Adventskalender am 22.12.2026, Osterfeuer am 28.03.2027, Sylt Altliga Turnier am 19.06.2027) und gibt die Termine für alle frei. Den Link kannst du gleich in die WhatsApp-Gruppe schicken.

## 6a. Module freischalten

**Optionen → Module.** Jedes Modul hat einen Schalter **An/Aus**; Zu-/Absagen und Kommentare schaltest du einzeln für **Training · Spiele & Turniere · Events**.

| Modul | Braucht vorher |
|---|---|
| Spielerliste (nur Admins sehen die Namen, solange es keine Zugänge gibt) | – |
| Kader, Aufstellung & Berichte | Spielerliste |
| Spieler-Zugänge (persönlicher Code/Link) | Spielerliste |
| Zu-/Absagen, Kommentare, Umfragen, Helfer-Einteilung, Aktuelles & roter Banner, Pinnwand, Chat, Push | Spieler-Zugänge |
| Teilnahme-Auswertung („7 von 9“) | Zu-/Absagen |
| Kassen | Spielerliste |

- Fehlt etwas, fragt die App: „Dafür wird auch … eingeschaltet“ – mit **Ja, einschalten** oder **Abbrechen**. Beim Ausschalten genauso für alles, was davon abhängt.
- **Zu-/Absagen einschalten** ergänzt bei allen kommenden Terminen dieser Art die Abfrage Ja · Nein · Vielleicht; neue Termine bekommen sie automatisch.
- **Spieler-Zugänge ausschalten** stellt wieder auf „Termine für alle ohne Code“ um.
- Schaltest du **Spieler-Zugänge** ein, erzeugst du anschließend unter **Optionen → Spieler & Zugänge** die Codes und lädst die Spieler ein (Abschnitt 8).
- Nur Admins mit „Alles“ sehen die Module. Jede Änderung steht im Änderungsprotokoll.

**Ansicht ohne Code** (ebenfalls unter Optionen → Module): **Nur Termine** (Standard – keine Übersicht, die App öffnet direkt die Terminliste), **Übersicht: nächste 5** oder **Übersicht je Art** (je Spiel, Training, Event der nächste Termin).

**Treffen:** Bei jedem Termin gibt es optional **Treffen um** und **Treffpunkt** (z. B. 13:30 Vereinsheim). Angezeigt wird dann „Treffen 13:30 · Vereinsheim · Anpfiff 15:00 Uhr“ – in der Liste, auf der Übersicht, öffentlich, in Erinnerungen und im Kalender (der Eintrag beginnt zur Treffzeit).

Ein typischer Weg: zuerst nur Termine → **Spielerliste + Kader** für die Spiele und Turniere → **Spieler-Zugänge + Zu-/Absagen** → später Chat, Push und Kassen.

## 7. Verein und Spieler einrichten

1. **Optionen → Verein:** Name der App, Mannschaftsname, Vereinsfarben, Wappen und optional ein weiteres Logo. Der App-Name erscheint im Kopf, im Browser-Tab, auf dem Home-Bildschirm, in Einladungen und in den Dateinamen der Sicherungen (z. B. `kasse-alte-herren_2026-10-22_14-35.json`).
2. **Optionen → Kassen:** Monatsbeitrag, Betrag pro Getränketag, PayPal.me-Name.
3. **Optionen → Spieler & Zugänge** (bzw. „Spielerliste“, solange die Zugänge aus sind): Spitznamen oder Kürzel eintragen (einer pro Zeile) → **Hinzufügen & Codes erzeugen**. Bitte **keine vollständigen Namen**.
4. Optional Rückennummern ergänzen.

## 8. Spieler einladen

Für jeden Spieler in **Optionen → Spieler & Zugänge**:

1. **Einladen** tippen → das Teilen-Menü öffnet sich mit fertigem Text (persönlicher Link + Code).
2. **Einzeln per WhatsApp an diesen Spieler** schicken – **nicht in die Gruppe**, sonst kennt jeder jeden Code.
3. Alternativ **QR** tippen und den Spieler den Code mit seinem Handy abscannen lassen.

Der Status zeigt dir anschließend:

- **Eingeladen · noch nicht geöffnet** – Link wurde noch nicht benutzt.
- **Aktiv · zuletzt …** – Spieler nutzt die App.
- **Kein Zugang** – noch kein Code erzeugt oder gesperrt.

Weitere Aktionen:

- **Neuer Code:** z. B. wenn ein Link in falsche Hände geraten ist. Der alte Code ist sofort ungültig.
- **Sperren:** z. B. wenn jemand die Mannschaft verlässt. Seine Zahlungen bleiben erhalten.

**Tipp für die Spieler (iPhone):** Link in Safari öffnen → Teilen → **Zum Home-Bildschirm**. Dann erscheint die App mit dem Wappen als Symbol. Fragt die App dort noch einmal nach dem Code, einfach den Code aus der Nachricht eingeben – danach bleibt er gespeichert.

## 8a. Sichtbarkeit, öffentlicher Zugang, Team-Liste

In **Optionen → Sichtbarkeit**:

- **Beträge:** Standard ist „Jeder nur seine eigenen“. Spieler sehen dann nur ihren eigenen Stand, die Beträge der anderen sind auch auf dem Server gesperrt. Mit „Für alle sichtbar“ sehen alle Spieler die kompletten Kassen. Admins sehen immer alles.
- **Teilnahme-Auswertung:** nur Trainer & Admins oder alle Spieler. Der Zeitraum ist unter **Optionen → Verein** einstellbar: **Kalenderjahr** (Standard) oder **Saison** (Juli bis Juni).
- **Öffentlicher Zugang:** Wer die App **ohne Code** öffnet, sieht nur die Termine (Datum, Uhrzeit, Ort) und auf der Übersicht die nächsten Termine – bei Spiel und Training mit dem Umfragestand als Zahl. Keine Namen, keine Beträge, keine Notizen. Den Link ohne Code kannst du z. B. auf der Vereinsseite verlinken.

**Geburtsdaten** trägst du bei den Spielern ein. Das Datum selbst sehen nur Admins mit allen Rechten; alle anderen sehen im Bereich **Team** nur Rückennummer, Spitzname und Alter. Das Alter aktualisiert sich, sobald ein Admin mit allen Rechten die App öffnet.

**Trainings als Serie:** Beim Anlegen eines Trainings „Jede Woche wiederholen (Serie)“ ankreuzen und das Enddatum wählen (Standard: ein Jahr, höchstens 60 Termine). Mit „Draußen | Halle“ legst du den Ort fest (Standard draußen). Trainer und Admins mit Recht auf Termine können jedes Training direkt in der Terminliste mit einem Tipp auf **Fällt aus** absagen oder zwischen **Draußen** und **Halle** umschalten – mit Push an alle, die Benachrichtigungen aktiviert haben. Abgesagte Trainings zählen nicht in der Teilnahme-Auswertung. **Spiele und Events absagen:** Bei jedem kommenden Spiel und Event gibt es für Admins mit Recht „Termine“ den Knopf **Abgesagt** bzw. **Fällt aus** (auch beim Bearbeiten als Häkchen). Alle bekommen eine Push-Nachricht, der Termin wird durchgestrichen, im Kalender-Abo als abgesagt markiert und zählt nicht für die Teilnahme.

**Umfragen der Mannschaft:** Auf der Übersicht kann jeder Spieler (mit seinem persönlichen Link) und jeder Admin über **+ Umfrage** eine eigene Umfrage starten – mit 2 bis 6 Antworten, wie in einer WhatsApp-Gruppe. Beenden oder löschen kann sie, wer sie gestartet hat, sowie Admins mit Recht auf Termine.

**Kommentare und Berichte:** Standardmäßig kann jeder Termin – auch jedes Training – kommentiert werden (**Optionen → Sichtbarkeit → Kommentare zu Terminen → Bei allen Terminen**). Wer das lieber einzeln steuert, stellt dort auf „Nur wenn beim Termin erlaubt“ und hakt beim Termin „Kommentare erlauben“ an. Bei Umfragen gibt es zusätzlich „Kommentare zur Umfrage erlauben“. Berichte (bei Spielen mit Ergebnis) schreiben Admins mit Recht auf Termine in der Detailansicht eines Termins. Pro Bericht wählst du die Sichtbarkeit: **Mannschaft** (Spieler mit Code), **Alle** (zusätzlich in der öffentlichen Ansicht) oder **Nur Admins**. Das gilt auch auf dem Server. Admins mit Recht auf Termine können jeden Kommentar entfernen – wahlweise mit dem sichtbaren Hinweis „Kommentar entfernt“ und einer kurzen Begründung an derselben Stelle. Das Entfernen fremder Kommentare steht im Änderungsprotokoll; Spieler können ihre eigenen Kommentare löschen.

**Freie Aufstellung:** Unter Kader & Aufstellung bei „Spielsystem“ die Option **Frei – selbst positionieren** wählen. Die bisherigen Positionen werden übernommen, danach lassen sich die Spieler mit dem Finger frei auf dem Feld verschieben. Unter **Raster** wählst du Grob (5 Spalten, Standard), Mittel (7), Fein (9) oder Aus: Mit Raster rasten die Spieler auf dem nächsten Punkt ein, sodass Reihen gerade und symmetrisch stehen; wer auf einen besetzten Punkt gezogen wird, tauscht den Platz. Die Rasterpunkte sehen nur Admins beim Bearbeiten; mit **Fertig** werden sie ausgeblendet, über **Positionen bearbeiten** kommen sie wieder. Spieler aus der Ersatzbank antippen holt sie aufs Feld; zum Herausnehmen antippen und „Auf die Bank“ wählen oder vom Feld ziehen.

**Einteilung für Events (Aufbau, Bierstand, Abbau …):** In der Detailansicht eines Events (bei Spielen und Trainings über „+ Einteilung“) legen Admins mit Recht auf Termine Aufgaben an – mit Uhrzeit von/bis und wie viele Personen gebraucht werden. Über **Zuteilen** werden Spieler eingeteilt; dabei steht neben jedem Namen, wo er bei diesem Termin schon eingeteilt ist. Ist „Spieler dürfen sich selbst in freie Plätze eintragen“ angehakt, können sich Spieler mit ihrem Code selbst ein- und wieder austragen, solange Plätze frei sind und der Termin noch nicht vorbei ist. Wer eingeteilt ist, sieht seine Einsätze auf der Übersicht. Bei einem neuen Event lassen sich die Aufgaben eines früheren Events mit einem Tipp übernehmen. In der öffentlichen Ansicht ist die Einteilung nicht sichtbar.

> **Wichtig nach einem Update:** Wenn du eine neue Version der `index.html` hochlädst, immer auch den aktuellen Inhalt von `firestore.rules` in der Firebase-Konsole einfügen und veröffentlichen.

## 8c. Mannschafts-Chat (optional, ersetzt die WhatsApp-Gruppe)

Einschalten unter **Optionen → Module → Chat → An**. Dann erscheint unten der Reiter **Chat**:

- **Gruppenchat für alle** mit Spieler-Link: Text, **Fotos** (werden automatisch verkleinert), **Antworten** auf eine Nachricht, **👍**, **Kopieren**. Nachricht antippen öffnet diese Aktionen.
- **📊 Umfrage** direkt im Chat starten – sie erscheint im Chat und auf der Übersicht.
- **Ungelesene Nachrichten** stehen als Zahl am Reiter Chat.
- **Admin-Chat:** Admins und Trainer haben zusätzlich einen eigenen Chat „Nur Admins“.
- **Push:** Neue Nachrichten kommen bei allen an, die in der Glocke „Chat-Nachrichten“ aktiviert haben; dort lässt sich der Chat auch stummschalten.
- **Löschen:** Jeder seine eigenen Nachrichten, Admins jede Nachricht.
- Angezeigt werden die letzten 300 Nachrichten. Fotos werden erst geladen, wenn sie gebraucht werden, damit der Chat schnell bleibt.

**Tipp für den Umstieg:** Den Chat zuerst ein paar Wochen parallel zur WhatsApp-Gruppe laufen lassen, bis alle die App auf dem Home-Bildschirm haben und Push aktiviert ist. Dann die WhatsApp-Gruppe mit einem letzten Hinweis auf die App schließen.

## 8b. Einnahmen & Ausgaben, gemeldete Zahlungen

**Einnahmen & Ausgaben (Kassenbuch):** In **Optionen → Einnahmen & Ausgaben** einschalten und den Anfangsbestand eintragen. Admins mit dem Recht „Einnahmen & Ausgaben“ sehen dann auf der Übersicht eine Kachel mit dem **Kassenstand**. Dort buchen sie Einnahmen (z. B. Spenden, bar eingesammelte Beiträge) und Ausgaben (z. B. Schiedsrichter, Getränke-Einkauf) mit Datum, Betrag, Bezeichnung und Kategorie, blättern nach Jahren und sehen Einnahmen, Ausgaben und Saldo. Spieler sehen das Kassenbuch nicht.

**Zahlung melden:** Spieler tippen bei „Dein Stand“ auf **Zahlung melden**, geben Betrag und Zahlungsart (PayPal, Überweisung, bar) an und schicken die Meldung ab. Admins mit Recht auf eine der Kassen bekommen eine Push-Nachricht und sehen auf der Übersicht „gemeldete Zahlung prüfen“. Beim **Prüfen & verrechnen** schlägt die App die ältesten offenen Posten des Spielers vor, die zum Betrag passen; Häkchen lassen sich anpassen. Nach dem Bestätigen sind die Posten als bezahlt markiert, die Zahlung erscheint im Kassenbuch als Einnahme (wenn eingeschaltet) und der Spieler bekommt eine Nachricht. Abschaltbar unter **Optionen → Einnahmen & Ausgaben**.

**Strafenkatalog (optional, ab Werk aus):** Unter **Optionen → Strafenkatalog** einschalten. Die App legt Vorschläge an (zu spät, unentschuldigt gefehlt, Gelbe Karte …), die du unter **Sonstiges → Strafenkatalog** änderst, löschst oder ergänzt (Admins mit Recht „Sonstiges“). Eintragen: **Sonstiges → + Strafe** oder auf der Seite eines Spielers **Strafe eintragen** → Strafe aus dem Katalog antippen → Spieler wählen → Speichern. Die Strafe erscheint wie ein sonstiger Posten beim Stand des Spielers. Alle sehen den Katalog über **Strafenkatalog ansehen** auf der Übersicht.

## 9. Weitere Admins (standardmäßig bis zu 6)

Die Höchstzahl stellst du unter **Optionen → Admins → Höchstzahl Admins** ein (2 bis 8).

1. **Optionen → Admins → Admin einladen:** Name, E-Mail und Rechte wählen (später jederzeit über **Rechte** beim jeweiligen Admin änderbar):
   - Für die üblichen Rollen gibt es Vorlagen: **Kassenwart** (Getränke, Beiträge, Sonstiges, Einnahmen & Ausgaben, Kassen-Einstellungen), **Trainer** (Termine & Kader) und **Alles**
   - **Alles (inkl. Optionen)** – z. B. Vorstand oder zweiter Admin
   - **Einzelne Bereiche** – jeder Bereich wird einzeln freigegeben:
     - Wer eine Kasse hat, bekommt unten den Reiter **Kasse**: Kassen, Kassenstand, wer noch offen ist, gemeldete Zahlungen und Schnellknöpfe (+ Getränketag, + Strafe, + Posten). Die **Übersicht** zeigt dann nur noch eine Kachel „Kasse · offen“.
     - **Getränke**, **Beiträge**, **Sonstiges**: Nur wer eine Kasse freigeschaltet hat, sieht und bearbeitet dort die Beträge **aller** Spieler. Ohne das Recht sieht ein Admin – wie jeder Spieler – nur seine eigenen Beträge (außer die Beträge sind unter Sichtbarkeit für alle freigegeben).
     - **Spieler & Zugänge**: Spitznamen, Rückennummern, Geburtsdaten, Spieler hinzufügen oder entfernen, Codes und Einladungen. Admins mit diesem Recht sehen unter **Optionen** nur diesen Bereich.
     - **Termine & Kader**, **Einnahmen & Ausgaben** wie bisher.
     - **Optionen** – jeder Teil einzeln: **Verein, Farben & Wappen**, **Kassen-Einstellungen** (Beitrag, Getränkepreis, PayPal, Strafenkatalog ein/aus, Kassenbuch ein/aus), **Sichtbarkeit, Chat & Pinnwand**, **Kalender & Erinnerungen**, **Datenschutz**. Wer mindestens einen Teil hat, sieht unten den Reiter **Optionen** – aber nur mit diesen Teilen. Die Optionen sind in sieben Bereiche gegliedert (Spieler & Zugänge, Admins & Rechte, Kasse, Verein & Aussehen, Sichtbarkeit & Chat, Kalender & Erinnerungen, Daten & Datenschutz). Eingeklappt zeigt jeder Bereich eine Kurzinfo und ggf. einen gelben Hinweis wie „4 ohne Code“; beim Öffnen der Optionen ist alles eingeklappt. Admins verwalten, Sicherung und Zurücksetzen bleiben bei „Alles“.
   - Hinweis: Die persönlichen Stände der Spieler hält die App aktuell, sobald ein Admin mit allen drei Kassen (oder „Alles“) sie öffnet. Sicherungspunkte legen nur Admins mit „Alles“ an.
2. Der eingeladenen Person den App-Link schicken (ohne Spielercode oder mit ihrem eigenen).
3. Sie tippt auf das **Schloss → Konto erstellen** mit **genau dieser E-Mail**.
4. Sie bekommt eine Bestätigungsmail, öffnet den Link und tippt in der App auf **Ich habe bestätigt**. Fertig.

**Admin ist auch Spieler** (z. B. Kassenwart oder Trainer aus der Mannschaft): Beim Einladen oder später unter **Optionen → Admins → Rechte** bei „Ist auch Spieler“ den Spieler auswählen. Dann ist dieser Admin auf jedem Gerät, auf dem er sich anmeldet, automatisch auch als dieser Spieler unterwegs: eigener Stand, Zahlung melden, abstimmen, eintragen, Umfragen. Mit **Spieleransicht** oben in der Admin-Leiste sieht er die App genau wie seine Mitspieler, über das Schloss geht es zurück in die Admin-Ansicht.

## 10. Sicherheit im Überblick

- **Spieler** sehen alles nur lesend und können ausschließlich ihre **eigene** Umfrage-Stimme abgeben, solange die Umfrage offen ist, und sich – wenn erlaubt – nur selbst in die Einteilung eintragen. Das prüft der Firebase-Server, nicht nur die App.
- **Ohne gültigen Code** zeigt die App nichts an und der Server gibt keine Daten heraus.
- **Admins** melden sich mit E-Mail und Passwort an und dürfen nur in ihren Bereichen schreiben.
- **Änderungsprotokoll** (Optionen): Jede Änderung mit Name und Uhrzeit. Einträge können nicht gelöscht werden.
- **Überschreib-Schutz:** Jeder Bereich (z. B. Getränkekasse) hat eine Versionsnummer. Ändern zwei Admins gleichzeitig, führt die App beide Änderungen zusammen, statt die eine mit der anderen zu überschreiben („Ein anderer Admin hat gleichzeitig geändert – beides wurde zusammengeführt“). Nur wenn beide genau denselben Wert geändert haben, gilt die zuletzt gespeicherte Änderung. Der Firebase-Server lässt Speichern mit veraltetem Stand gar nicht erst zu.
- **Ohne Verbindung** (z. B. am Sportplatz): Oben erscheint rot „Noch nicht gespeichert – keine Verbindung“. Die Änderung bleibt auf dem Gerät und wird automatisch nachgeholt, sobald wieder Netz da ist. App bis dahin nicht schließen.
- **Sind meine Daten sicher?** (Optionen → Datensicherheit & Datenschutz, für Admins mit „Alles“): Ampel-Übersicht mit Speicherstand, letztem Sicherungspunkt, letzter Datei-Sicherung, Anzahl Admins mit „Alles“, ob die Firebase-Regeln zur App passen, Push, Datenschutzhinweis und Spielern ohne Zugang – jeweils mit dem passenden Knopf zum Erledigen.
- **Sicherungspunkte** (Optionen → Sicherung): automatisch höchstens alle 30 Minuten vor Änderungen, die letzten 10 bleiben online erhalten. Zusätzlich ab und zu **Als Datei speichern** und die Datei z. B. in iCloud Drive ablegen.
- Die App ist für Suchmaschinen gesperrt (`noindex`).

**Optional, für noch mehr Schutz:**

- **App Check** (Firebase-Konsole → Build → App Check) mit reCAPTCHA Enterprise einrichten. Dann akzeptiert Firebase nur Anfragen von deiner App.
- In der Google Cloud Console den API-Schlüssel auf deine GitHub-Domain beschränken (APIs & Dienste → Anmeldedaten → Browser-Schlüssel → Website-Einschränkungen: `https://DEIN-GITHUB-NAME.github.io/*`).

## 11. Datenschutz

**Datenschutzhinweis in der App:** Unter **Optionen → Datenschutz** trägst du den Verantwortlichen (Verein bzw. Mannschaftsleitung mit Anschrift), eine Kontakt-E-Mail und optional die zuständige Aufsichtsbehörde ein. Daraus entsteht automatisch ein Datenschutzhinweis, der zu den eingeschalteten Bereichen passt (Kassen, Chat, Push, öffentliche Ansicht …). Alle erreichen ihn über **Datenschutz** unten in der App und auf der Anmeldeseite – also schon vor der Code-Eingabe. Bitte den Text einmal prüfen; er ist eine Vorlage, keine Rechtsberatung.

**Meine Daten (Auskunft nach Art. 15 DSGVO):** Jeder Spieler sieht unter **Meine Daten** alles, was die App über ihn gespeichert hat, und kann es als Datei speichern oder als Text kopieren. Admins können das unter **Datenschutz → Daten eines Spielers anzeigen** für jeden Spieler aufrufen, z. B. bei einer Anfrage per Mail.

**Löschfrist:** Unter **Optionen → Datenschutz** lässt sich einstellen, dass Chat-Nachrichten und Pinnwand-Beiträge nach 6, 12 oder 24 Monaten automatisch gelöscht werden (angeheftete Beiträge bleiben). Das Löschen erledigt die App, wenn ein Admin mit allen Rechten sie öffnet.

**Schriften:** Die Schriften sind in der App eingebettet. Es werden keine Google Fonts geladen und damit keine IP-Adressen an Google Fonts übertragen (Lizenz siehe `LIZENZ-SCHRIFTEN.txt`).

**Firebase:** In der Firebase- bzw. Google-Cloud-Konsole die Bedingungen zur Datenverarbeitung (Data Processing and Security Terms) akzeptieren und unter Projekteinstellungen eine Kontaktperson für Datenschutz eintragen. Die Datenbank liegt in Frankfurt (Schritt 4); die Anmeldung läuft bei Google in den USA (EU-US Data Privacy Framework).


- Spitznamen oder Kürzel sind empfohlen (Datensparsamkeit). Vollständige Namen sind mit Einverständnis der Spieler möglich, dann aber den Zugang konsequent über Codes schützen.
- Geburtsdaten sind nur für Admins mit allen Rechten lesbar; die Mannschaft sieht nur das Alter.
- Kurz in der Mannschaft erklären, was gespeichert wird: Spitzname, Rückennummer, Geburtsdatum (optional), Zahlungsstatus, Getränketage, Umfrage-Antworten, Kommentare, Aufstellungen, Einteilungen und – wenn Push aktiviert ist – ein technischer Geräteschlüssel für die Benachrichtigungen.
- Die Daten liegen bei Google Firebase in Frankfurt (wenn so in Schritt 4 gewählt).
- Wer die Mannschaft verlässt: Zugang sperren und – wenn keine Beträge mehr offen sind – den Spieler entfernen.

## 12. Nutzung im Browser oder auf dem Home-Bildschirm

Beides geht, auch dauerhaft im normalen Browser:

- **Im Browser:** Link öffnen und als Lesezeichen speichern. Die Daten liegen bei Firebase, nicht im Browser.
- **Home-Bildschirm (iPhone):** Safari → Teilen → „Zum Home-Bildschirm“. Startet ohne Adressleiste, mit Wappen als Symbol.
- **PC/Chromebook:** Lesezeichen, oder in Chrome über das Menü „Installieren“ bzw. „Verknüpfung erstellen“.

Im Browser merkt sich das Gerät nur den Spielercode bzw. die Admin-Anmeldung. Safari kann diese gespeicherten Angaben löschen, wenn die Seite längere Zeit (etwa 7 Tage) nicht geöffnet wurde. Dann einfach den persönlichen Link erneut öffnen oder den Code eingeben; Admins melden sich neu an. Es gehen dabei keine Daten verloren.

## 12a. Push-Nachrichten (wie bei WhatsApp)

Mit Push bekommt jeder, der es auf seinem Handy aktiviert, eine Nachricht bei **neuen Terminen und Umfragen** (auch Umfragen von Spielern), bei **abgesagten oder verlegten Trainings**, bei **neuen Beiträgen an der Pinnwand**, bei **neuen Kommentaren** und – wenn eingeschaltet – bei **Chat-Nachrichten**. Jeder kann über die **Glocke** oben rechts selbst wählen, wofür. Ohne diese Einrichtung funktioniert die App ganz normal, nur ohne Push.

Die Einrichtung ist einmalig und dauert etwa 20 Minuten. Die Schritte 1 bis 3 gehen am besten am PC oder Chromebook, der Rest auch am iPhone.

**1. Firebase-Tarif „Blaze“** (nötig, damit Firebase Nachrichten verschicken darf)
1. Firebase-Konsole → links unten bei **Spark** auf **Upgrade** → **Blaze** → Rechnungskonto mit Kreditkarte anlegen.
2. Für eine Mannschaft bleibt die Nutzung im kostenlosen Kontingent; es können allenfalls wenige Cent im Monat für die Ablage des Programms anfallen.
3. Empfohlen: in der Google Cloud Console unter **Abrechnung → Budgets und Benachrichtigungen** ein Budget von z. B. 5 € anlegen. Das ist eine Warnung per E-Mail, keine automatische Sperre.

**2. Schlüssel für Web-Push**
1. Firebase-Konsole → Zahnrad → **Projekteinstellungen** → Reiter **Cloud Messaging**.
2. Ganz unten bei **Web-Konfiguration → Web-Push-Zertifikate** auf **Schlüsselpaar generieren**.
3. Den langen Schlüssel kopieren und in `index.html` oben bei `FIREBASE_VAPID_KEY = "";` zwischen die Anführungszeichen setzen.

**3. Dienstkonto für die automatische Einrichtung**
1. Projekteinstellungen → Reiter **Dienstkonten** → **Neuen privaten Schlüssel generieren** → Datei speichern. Diese Datei ist geheim: nicht weitergeben, nicht ins Repository hochladen.
2. Auf [console.cloud.google.com](https://console.cloud.google.com) dein Projekt wählen → **IAM und Verwaltung → IAM**.
3. Beim Konto `firebase-adminsdk-…@…iam.gserviceaccount.com` auf den Stift → **Weitere Rolle hinzufügen** → **Inhaber** → Speichern. Damit darf GitHub das Versand-Programm einrichten.

**4. GitHub vorbereiten**
1. Im Repository der App: **Settings → Secrets and variables → Actions → New repository secret**.
2. Name: `FIREBASE_SERVICE_ACCOUNT`. Wert: der **komplette Inhalt** der Schlüsseldatei aus Schritt 3 (beginnt mit `{` und endet mit `}`) → **Add secret**.
3. Danach kannst du die Schlüsseldatei auf deinem Gerät löschen.

**5. Dateien hochladen**
1. `index.html` (mit Firebase-Daten und Push-Schlüssel), `sw.js`, `manifest.webmanifest` und `firebase.json` wie gewohnt über **Add file → Upload files**.
2. Die Dateien in Ordnern legst du am iPhone über **Add file → Create new file** an: Als Namen den Pfad eintippen, z. B. `functions/index.js` – der Schrägstrich legt den Ordner an – und den Inhalt der Datei einfügen. Genauso `functions/package.json` und `.github/workflows/push-einrichten.yml`. Am PC kannst du die Ordner einfach ins Upload-Fenster ziehen.
3. Sobald die Dateien hochgeladen sind, startet GitHub die Einrichtung von selbst. Unter **Actions → Push einrichten** siehst du den Fortschritt (beim ersten Mal 3 bis 10 Minuten). Grüner Haken = fertig. Bei rotem Kreuz einmal **Re-run all jobs** – beim allerersten Mal schaltet Firebase im Hintergrund noch Dienste frei.

**6. Regeln aktualisieren:** Den Inhalt von `firestore.rules` in der Firebase-Konsole einfügen und veröffentlichen.

**7. Spieler aktivieren Push auf ihrem Handy**
- **iPhone (ab iOS 16.4):** Persönlichen Link in Safari öffnen → Teilen → **Zum Home-Bildschirm** → die App über das neue Symbol öffnen (ggf. Code eingeben) → **Glocke** → **Benachrichtigungen aktivieren** → erlauben. Im normalen Safari-Tab geht Push auf dem iPhone nicht.
- **Android:** Link öffnen → **Glocke** → **Benachrichtigungen aktivieren** → erlauben.
- Gesperrte Spieler bekommen automatisch keine Nachrichten mehr.

**Übersicht:** Oben stehen drei kleine Kacheln nebeneinander – **Pinnwand**, **Umfrage** und **Zahlung** (Admins mit Kassen-Recht: gemeldete Zahlungen zum Prüfen; Spieler: dein Stand). Ein roter Zähler zeigt, was neu ist bzw. wo deine Stimme fehlt. Antippen klappt den Inhalt darunter auf, nochmal antippen klappt ihn zu.

**Pinnwand:** Über die Kachel **Pinnwand → + Beitrag** schreiben Admins und – wenn unter **Optionen → Sichtbarkeit** erlaubt – auch Spieler einen Beitrag, z. B. „Suche Mitfahrgelegenheit“. Alle können mit 👍 reagieren und kommentieren.

**Aktuelles (nur Admins):** In der Kachel **Pinnwand** gibt es zwei Reiter: **Aktuelles** für Mitteilungen von Vorstand, Trainer oder Kassenwart und **Pinnwand** für alle. Mitteilungen erscheinen nie auf der Pinnwand. **+ Mitteilung** → Überschrift und Text (oder eine **Vorlage** wie „Training fällt aus“, „Platz gesperrt – Halle“), dann die Stufe:
- **Info:** steht nur unter Aktuelles.
- **Wichtig – roter Banner:** erscheint oben auf **jeder Seite** als roter Kasten. Einstellbar:
  - **Banner anzeigen:** bis Ende des Tages, 1/2/3 Tage, 1 Woche, bis Datum & Uhrzeit oder bis du ihn beendest,
  - **Start:** sofort oder später (z. B. Samstag 8 Uhr – der Push kommt dann zum Start),
  - **Nach „Gelesen“:** schmale rote Zeile bleibt bis zum Ablauf oder ganz ausblenden,
  - Fenster beim Öffnen (muss bestätigt werden) und Push an alle – auch an die, die Pinnwand-Nachrichten abgeschaltet haben.
- **Kommentare erlauben** (für Info und Wichtig) – sonst ist es eine reine Ansage.
- **Mit Termin verknüpfen:** der Banner bekommt „Zum Termin“. Setzt ein Admin ein Training, Spiel oder Event auf **fällt aus** bzw. **abgesagt**, schlägt die App automatisch einen Banner bis zum Ende des Termins vor.

Bei jeder Mitteilung haben Admins **+1 Tag**, **Beenden**, **Bearbeiten**, **Erinnern** (Push an alle, die noch nicht gelesen haben) und **Verlauf**: wer sie wann erstellt, verlängert, geändert oder beendet hat, wer wann „Gelesen“ getippt hat und wer noch offen ist. Alles steht zusätzlich im Änderungsprotokoll. Abgelaufene Mitteilungen bleiben unter Aktuelles nachlesbar.

## 12b. Termine im Handy-Kalender (iPhone und Android)

**Einschalten (einmalig, Admin mit „Alles“):** **Optionen → Kalender & Erinnerungen → Kalender-Abo anbieten**. Das Abo läuft über das gleiche Firebase-Programm wie Push (Abschnitt 12a) – wenn Push eingerichtet ist, ist nichts weiter zu tun. Nach dem Hochladen der neuen `functions/index.js` richtet GitHub es automatisch mit ein.

**Für jeden Spieler:** **Termine → 📅 In meinen Kalender**
- **iPhone/iPad:** **Kalender abonnieren** → Abonnieren bestätigen. Der Kalender erscheint in der Kalender-App und holt Änderungen selbst (wie oft: Einstellungen → Kalender → Accounts → Abonnierte Kalender).
- **Android:** **Zum Google Kalender hinzufügen** → mit dem Google-Konto anmelden → Hinzufügen. Taucht der Kalender in der Google-Kalender-App nicht auf: Menü → Einstellungen → den Kalender antippen → **Synchronisieren** einschalten. Google holt Änderungen etwa alle paar Stunden bis einmal am Tag. Samsung-Kalender zeigt Google-Kalender automatisch mit an; für andere Kalender-Apps geht es mit der kostenlosen App **ICSx⁵** und **Abo-Link kopieren**.
- **Ohne Abo:** Bei jedem Termin **In meinen Kalender eintragen** oder **Alle kommenden Termine (.ics)** – das klappt auf beiden Systemen, spätere Änderungen kommen dann aber nicht nach.

Abgesagte Trainings stehen als „Abgesagt: Training“ im Kalender, Halle oder draußen steht im Titel. Im Abo stehen nur Datum, Uhrzeit, Ort, Titel und Hinweis, keine Namen. Wer den Link hat, kann die Termine sehen – scheidet jemand aus, unter Optionen **Neuen Abo-Link erzeugen**; danach müssen alle einmal neu abonnieren.

## 12c. Erinnerungen per Push (optional, ab Werk aus)

Unter **Optionen → Kalender & Erinnerungen** einzeln einschalten:
- **Zu-/Absage:** am Vortag um 18 Uhr an alle, die bei einem Spiel oder Training mit Umfrage noch nicht geantwortet haben.
- **Offene Beträge:** jeden Monat einen Tag nach dem letzten Training oder Spiel des Monats um 18 Uhr – nur an Spieler, bei denen etwas offen ist. Abgesagte Trainings zählen nicht. Grundlage ist der Stand, den die App beim letzten Öffnen durch einen Admin mit allen drei Kassen gespeichert hat.
- **Geburtstage:** morgens um 9 Uhr an alle („Heute hat Jonny Geburtstag“, ohne Alter); das Geburtstagskind bekommt einen eigenen Glückwunsch. Nur für Spieler mit eingetragenem Geburtsdatum.

Voraussetzung ist eingerichtetes Push (Abschnitt 12a). Jeder kann Erinnerungen und Geburtstage an seiner **Glocke** für sich abschalten. Beim ersten Einrichten schaltet Firebase den Zeitplaner (Cloud Scheduler) ein; schlägt **Actions → Push einrichten** dabei einmal fehl, einfach **Re-run all jobs**. Kosten: im kostenlosen Kontingent (bis zu drei Zeitpläne pro Konto sind frei, die App nutzt genau drei: Erinnerungen, Geburtstage und geplante Mitteilungen).

## 13. Wenn etwas nicht klappt

| Problem | Lösung |
|---|---|
| App zeigt „Noch nicht eingerichtet“ | In `index.html` sind noch keine Firebase-Daten eingetragen (Schritt 5) oder GitHub hat die neue Version noch nicht veröffentlicht. |
| Anmeldung schlägt fehl: Domain nicht autorisiert | Schritt 3.3 prüfen: `DEIN-GITHUB-NAME.github.io` muss eingetragen sein. |
| „Keine Berechtigung“ beim Speichern | Regeln aus `firestore.rules` vollständig veröffentlicht? Hat der Admin das Recht für diesen Bereich? |
| Spieler: „Code ungültig oder gesperrt“ | In Optionen prüfen, ob der Spieler einen Code hat; ggf. **Neuer Code** und neu einladen. |
| Admin-Einladung greift nicht | Konto muss mit genau der eingeladenen E-Mail erstellt und die E-Mail bestätigt sein. |
| Bestätigungsmail kommt nicht | Spam-Ordner prüfen; in der App „Link erneut senden“. |
| Glocke zeigt „Push ist noch nicht eingerichtet“ | `FIREBASE_VAPID_KEY` in `index.html` fehlt (Abschnitt 12a, Schritt 2). |
| Glocke zeigt „Zuerst zum Home-Bildschirm hinzufügen“ | iPhone: App über „Zum Home-Bildschirm“ installieren und von dort öffnen. |
| Aktiviert, aber es kommt nichts | Unter Actions muss „Push einrichten“ grün sein; Regeln veröffentlicht? Am iPhone: Einstellungen → Mitteilungen → App erlaubt? Eigene Kommentare und Nachrichten lösen bei dir selbst keine Nachricht aus. |
| „Push einrichten“ ist rot | Secret `FIREBASE_SERVICE_ACCOUNT` vollständig eingefügt? Blaze-Tarif aktiv? Rolle „Inhaber“ vergeben? Dann **Re-run all jobs**. |
