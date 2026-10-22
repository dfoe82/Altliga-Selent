# Mannschaftskasse – Einrichtung

Diese Anleitung bringt die App auf GitHub Pages und verbindet sie mit Firebase, damit alle Spieler dieselben Daten sehen. Rechne mit etwa 30 bis 45 Minuten. Die Firebase-Konsole bedienst du am besten am PC oder Chromebook; auf dem iPhone geht es auch, ist aber fummelig.

**Kosten:** Der kostenlose Firebase-Tarif „Spark“ reicht für eine Mannschaft locker aus. Es wird keine Kreditkarte benötigt.

**Dateien in diesem Paket**

| Datei | Wofür |
|---|---|
| `index.html` | Die App. Kommt in dein GitHub-Repository. |
| `firestore.rules` | Die Sicherheitsregeln. Kommen in die Firebase-Konsole, nicht zu GitHub. |
| `ANLEITUNG.md` | Diese Anleitung. |
| `demo.html` | Demo mit 40 Beispielspielern, läuft ohne Firebase. Optional mit hochladen. |
| `praesentation.html` | Präsentationsseite für Beamer: Demo im Handy-Rahmen mit 12 Szenen. Braucht `demo.html` im selben Ordner. |

Solange in `index.html` keine Firebase-Daten eingetragen sind, läuft die App im **Demo-Modus** mit Beispieldaten nur auf dem jeweiligen Gerät. So kannst du sie vorab ausprobieren.

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
   - **Anonym** aktivieren → Speichern. Damit werden Spieler mit Code erkannt, ohne Konto.
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
3. Fertig – du bist in der Admin-Ansicht.

## 7. Verein und Spieler einrichten

1. **Optionen → Verein:** Name der App, Mannschaftsname, Vereinsfarben, Wappen und optional ein weiteres Logo. Der App-Name erscheint im Kopf, im Browser-Tab, auf dem Home-Bildschirm, in Einladungen und in den Dateinamen der Sicherungen (z. B. `kasse-alte-herren_2026-10-22_14-35.json`).
2. **Optionen → Kassen:** Monatsbeitrag, Betrag pro Getränketag, PayPal.me-Name.
3. **Optionen → Spieler & Zugänge:** Spitznamen oder Kürzel eintragen (einer pro Zeile) → **Hinzufügen & Codes erzeugen**. Bitte **keine vollständigen Namen**.
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
- **Teilnahme-Auswertung:** nur Trainer & Admins oder alle Spieler.
- **Öffentlicher Zugang:** Wer die App **ohne Code** öffnet, sieht nur die Termine (Datum, Uhrzeit, Ort) und auf der Übersicht die nächsten Termine – bei Spiel und Training mit dem Umfragestand als Zahl. Keine Namen, keine Beträge, keine Notizen. Den Link ohne Code kannst du z. B. auf der Vereinsseite verlinken.

**Geburtsdaten** trägst du bei den Spielern ein. Das Datum selbst sehen nur Admins mit allen Rechten; alle anderen sehen im Bereich **Team** nur Rückennummer, Spitzname und Alter. Das Alter aktualisiert sich, sobald ein Admin mit allen Rechten die App öffnet.

**Kommentare und Berichte:** Beim Anlegen oder Bearbeiten eines Termins „Kommentare erlauben“ bzw. bei einer Umfrage „Kommentare zur Umfrage erlauben“ ankreuzen. Berichte (bei Spielen mit Ergebnis) schreiben Admins mit Recht auf Termine in der Detailansicht eines Termins. Pro Bericht wählst du die Sichtbarkeit: **Mannschaft** (Spieler mit Code), **Alle** (zusätzlich in der öffentlichen Ansicht) oder **Nur Admins**. Das gilt auch auf dem Server.

**Freie Aufstellung:** Unter Kader & Aufstellung bei „Spielsystem“ die Option **Frei – selbst positionieren** wählen. Die bisherigen Positionen werden übernommen, danach lassen sich die Spieler mit dem Finger frei auf dem Feld verschieben. Spieler aus der Ersatzbank antippen holt sie aufs Feld; zum Herausnehmen antippen und „Auf die Bank“ wählen oder vom Feld ziehen.

**Einteilung für Events (Aufbau, Bierstand, Abbau …):** In der Detailansicht eines Events (bei Spielen und Trainings über „+ Einteilung“) legen Admins mit Recht auf Termine Aufgaben an – mit Uhrzeit von/bis und wie viele Personen gebraucht werden. Über **Zuteilen** werden Spieler eingeteilt; dabei steht neben jedem Namen, wo er bei diesem Termin schon eingeteilt ist. Ist „Spieler dürfen sich selbst in freie Plätze eintragen“ angehakt, können sich Spieler mit ihrem Code selbst ein- und wieder austragen, solange Plätze frei sind und der Termin noch nicht vorbei ist. Wer eingeteilt ist, sieht seine Einsätze auf der Übersicht. Bei einem neuen Event lassen sich die Aufgaben eines früheren Events mit einem Tipp übernehmen. In der öffentlichen Ansicht ist die Einteilung nicht sichtbar.

> **Wichtig nach einem Update:** Wenn du eine neue Version der `index.html` hochlädst, immer auch den aktuellen Inhalt von `firestore.rules` in der Firebase-Konsole einfügen und veröffentlichen.

## 9. Weitere Admins (bis zu 4)

1. **Optionen → Admins → Admin einladen:** Name, E-Mail und Rechte wählen:
   - **Alles (inkl. Optionen)** – z. B. zweiter Kassenwart
   - **Einzelne Bereiche** – z. B. Trainer nur „Termine & Kader“
2. Der eingeladenen Person den App-Link schicken (ohne Spielercode oder mit ihrem eigenen).
3. Sie tippt auf das **Schloss → Konto erstellen** mit **genau dieser E-Mail**.
4. Sie bekommt eine Bestätigungsmail, öffnet den Link und tippt in der App auf **Ich habe bestätigt**. Fertig.

Ist ein Admin gleichzeitig Spieler, öffnet er zusätzlich seinen persönlichen Spieler-Link auf demselben Gerät. Dann kann er auch abstimmen.

## 10. Sicherheit im Überblick

- **Spieler** sehen alles nur lesend und können ausschließlich ihre **eigene** Umfrage-Stimme abgeben, solange die Umfrage offen ist, und sich – wenn erlaubt – nur selbst in die Einteilung eintragen. Das prüft der Firebase-Server, nicht nur die App.
- **Ohne gültigen Code** zeigt die App nichts an und der Server gibt keine Daten heraus.
- **Admins** melden sich mit E-Mail und Passwort an und dürfen nur in ihren Bereichen schreiben.
- **Änderungsprotokoll** (Optionen): Jede Änderung mit Name und Uhrzeit. Einträge können nicht gelöscht werden.
- **Sicherungspunkte** (Optionen → Sicherung): automatisch höchstens alle 30 Minuten vor Änderungen, die letzten 10 bleiben online erhalten. Zusätzlich ab und zu **Als Datei speichern** und die Datei z. B. in iCloud Drive ablegen.
- Die App ist für Suchmaschinen gesperrt (`noindex`).

**Optional, für noch mehr Schutz:**

- **App Check** (Firebase-Konsole → Build → App Check) mit reCAPTCHA Enterprise einrichten. Dann akzeptiert Firebase nur Anfragen von deiner App.
- In der Google Cloud Console den API-Schlüssel auf deine GitHub-Domain beschränken (APIs & Dienste → Anmeldedaten → Browser-Schlüssel → Website-Einschränkungen: `https://DEIN-GITHUB-NAME.github.io/*`).

## 11. Datenschutz

- Spitznamen oder Kürzel sind empfohlen (Datensparsamkeit). Vollständige Namen sind mit Einverständnis der Spieler möglich, dann aber den Zugang konsequent über Codes schützen.
- Geburtsdaten sind nur für Admins mit allen Rechten lesbar; die Mannschaft sieht nur das Alter.
- Kurz in der Mannschaft erklären, was gespeichert wird: Spitzname, Rückennummer, Geburtsdatum (optional), Zahlungsstatus, Getränketage, Umfrage-Antworten, Kommentare, Aufstellungen, Einteilungen.
- Die Daten liegen bei Google Firebase in Frankfurt (wenn so in Schritt 4 gewählt).
- Wer die Mannschaft verlässt: Zugang sperren und – wenn keine Beträge mehr offen sind – den Spieler entfernen.

## 12. Nutzung im Browser oder auf dem Home-Bildschirm

Beides geht, auch dauerhaft im normalen Browser:

- **Im Browser:** Link öffnen und als Lesezeichen speichern. Die Daten liegen bei Firebase, nicht im Browser.
- **Home-Bildschirm (iPhone):** Safari → Teilen → „Zum Home-Bildschirm“. Startet ohne Adressleiste, mit Wappen als Symbol.
- **PC/Chromebook:** Lesezeichen, oder in Chrome über das Menü „Installieren“ bzw. „Verknüpfung erstellen“.

Im Browser merkt sich das Gerät nur den Spielercode bzw. die Admin-Anmeldung. Safari kann diese gespeicherten Angaben löschen, wenn die Seite längere Zeit (etwa 7 Tage) nicht geöffnet wurde. Dann einfach den persönlichen Link erneut öffnen oder den Code eingeben; Admins melden sich neu an. Es gehen dabei keine Daten verloren.

## 13. Wenn etwas nicht klappt

| Problem | Lösung |
|---|---|
| App zeigt „Demo-Modus“ | In `index.html` sind noch keine Firebase-Daten eingetragen (Schritt 5) oder GitHub hat die neue Version noch nicht veröffentlicht. |
| Anmeldung schlägt fehl: Domain nicht autorisiert | Schritt 3.3 prüfen: `DEIN-GITHUB-NAME.github.io` muss eingetragen sein. |
| „Keine Berechtigung“ beim Speichern | Regeln aus `firestore.rules` vollständig veröffentlicht? Hat der Admin das Recht für diesen Bereich? |
| Spieler: „Code ungültig oder gesperrt“ | In Optionen prüfen, ob der Spieler einen Code hat; ggf. **Neuer Code** und neu einladen. |
| Admin-Einladung greift nicht | Konto muss mit genau der eingeladenen E-Mail erstellt und die E-Mail bestätigt sein. |
| Bestätigungsmail kommt nicht | Spam-Ordner prüfen; in der App „Link erneut senden“. |
