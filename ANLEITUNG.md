# Altliga-Termine ohne Firebase – Einrichtung

Diese Version ist der **Zwischenschritt**: nur **Übersicht** (die nächsten 5 Termine) und **Termine** (alle Termine mit Filter). Jeder mit dem Link sieht sie, ohne Anmeldung und ohne Code. Es gibt **kein Firebase** und keine Datenbank. Die Termine liegen als Datei `termine.json` im GitHub-Repository.

**Admins** verwalten die Termine direkt in der App: neu anlegen, bearbeiten, löschen, „fällt aus“, Trainingsort. Gespeichert wird mit einem **GitHub-Schlüssel**, der nur dieses eine Repository ändern darf. Nach dem Speichern sehen alle die Änderung nach etwa einer Minute.

**Schon eingetragen:** Training jeden Dienstag 19:00 Uhr auf dem Schulsportplatz bis Ende Oktober 2027, Offener Adventskalender am Di 22.12.2026 (statt Training), Osterfeuer am So 28.03.2027 in Selent, Sylt Altliga Turnier am Sa 19.06.2027.

**Kosten:** keine. Rechne mit etwa 15 Minuten.

| Datei | Wofür |
|---|---|
| `index.html` | Die App |
| `termine.json` | Die Termine. Die App liest und schreibt diese Datei. |
| `termine.ics` | Für das Kalender-Abo. Die App aktualisiert sie beim Speichern selbst. |

---

## 1. App auf GitHub Pages stellen

1. Auf github.com ein neues Repository anlegen, z. B. `termine` (öffentlich).
2. **Add file → Upload files** → `index.html`, `termine.json` und `termine.ics` hochladen → **Commit changes**.
3. **Settings → Pages** → bei „Branch“ `main` und `/ (root)` wählen → **Save**.
4. Nach ein bis zwei Minuten ist die App erreichbar unter `https://DEIN-GITHUB-NAME.github.io/termine/`

Diesen Link kannst du gleich in die WhatsApp-Gruppe schicken. Tipp für alle (iPhone): Link in Safari öffnen → Teilen → **Zum Home-Bildschirm**.

## 2. Ausprobieren ohne Schlüssel

Schloss oben rechts → **Ohne Schlüssel ausprobieren**. Dann kannst du alles bedienen, aber die Änderungen bleiben nur auf deinem Gerät. Über **Abmelden** ist alles wieder wie vorher.

## 3. GitHub-Schlüssel für Admins anlegen

Am besten am PC oder Chromebook (auf dem iPhone in Safari geht es auch):

1. github.com → oben rechts dein Profilbild → **Settings**.
2. Ganz unten links **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
3. **Token name:** z. B. `Altliga-Termine Admin`. **Expiration:** z. B. 1 Jahr (danach einfach einen neuen anlegen).
4. **Repository access:** **Only select repositories** → dein Repository `termine` auswählen.
5. **Permissions → Repository permissions → Contents:** **Read and write**. Alles andere bleibt aus.
6. **Generate token** → den Schlüssel (beginnt mit `github_pat_…`) kopieren. Er wird nur einmal angezeigt.
7. In der App: Schloss oben rechts → Schlüssel einfügen → **Anmelden**. Mit „Auf diesem Gerät merken“ musst du ihn nur einmal eingeben.

**Weitere Admins** (z. B. der Trainer): für jeden einen eigenen Schlüssel auf dieselbe Weise anlegen, mit eigenem Namen, und ihm geben. Verlässt jemand das Team, löschst du nur seinen Schlüssel (gleiche Seite → **Delete**).

**Sicherheit:** Der Schlüssel kann nur dieses eine Repository ändern, sonst nichts in deinem GitHub-Konto. Gib ihn nicht in die Gruppe. Jede Änderung steht im Repository unter **Commits** mit Datum. Dort lässt sich auch jeder alte Stand zurückholen.

## 4. Termine pflegen

Schloss oben rechts → angemeldet (gelb). Unten erscheint der Reiter **Optionen**.

- **Termine → + Termin:** Spiel, Training oder Event. Dazu Datum, Anpfiff bzw. Beginn, optional **Treffen um** und **Treffpunkt**, Ort und Notiz.
  - **Training:** Standard 19:00 Uhr auf dem Schulsportplatz. Den Ort wählst du per Tipp: **Draußen · Halle · OHLA Stadion**. Mit „Jede Woche wiederholen“ legst du eine Serie an. Wochentag und Uhrzeit sind frei wählbar.
  - **Spiel:** Gegner und Heim/Auswärts. Oder **Turnier** ankreuzen, dann wird der Name so angezeigt.
- **Direkt am Termin:** Trainingsort umschalten, **Fällt aus** bzw. **Abgesagt**, **Bearbeiten**, **×** löschen.
- **Optionen:** Name der App, Mannschaft, Namen der Trainingsorte, Termine als Datei herunterladen.

Oben steht nach jeder Änderung „✓ Gespeichert – für alle sichtbar in etwa einer Minute“. Klappt es nicht (z. B. kein Netz), bleibt die Änderung auf dem Gerät. Mit **Erneut versuchen** wird sie nachgeholt. Ändern zwei Admins kurz nacheinander, werden beide Änderungen übernommen.

## 5. Kalender

Unter **📅 In meinen Kalender**:

- **Abo** für iPhone und Android (Google Kalender): Die Termine erscheinen im Kalender und aktualisieren sich selbst. Das iPhone prüft etwa alle paar Stunden, Google manchmal seltener.
- **Einmalig als Datei:** übernimmt den aktuellen Stand, ändert sich danach nicht mehr.
- An jedem Termin: **📅 In Kalender eintragen** für einen einzelnen Termin.

## 6. Später: Umstieg auf die Version mit Firebase

Wenn ihr Spieler-Zugänge, Zu-/Absagen, Kader usw. wollt: die `index.html` der Firebase-Version (Paket `mannschaftskasse-echt`) **ins selbe Repository** hochladen, Firebase nach deren Anleitung einrichten und dort den ersten Admin anlegen. Die App übernimmt dabei automatisch alle Termine, Trainingsorte und den Mannschaftsnamen aus `termine.json`. Die Datei kann danach im Repository bleiben.

## Wenn etwas nicht klappt

| Problem | Lösung |
|---|---|
| „Mit diesem Schlüssel kann dieses Repository nicht geändert werden“ | Beim Schlüssel prüfen: richtiges Repository ausgewählt, **Contents: Read and write**. |
| „Schlüssel ist ungültig oder abgelaufen“ | Neuen Schlüssel anlegen (Abschnitt 3) und in der App neu anmelden. |
| Änderung erscheint bei anderen nicht | Etwa eine Minute warten und die Seite neu laden. Im Repository unter **Actions** sieht man, ob GitHub Pages fertig ist. |
| App liegt nicht unter `NAME.github.io/REPO/` (eigene Domain) | In `index.html` oben bei `REPO_OVERRIDE` Besitzer und Repository eintragen. |
