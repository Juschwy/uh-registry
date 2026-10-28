# PROJECT_CONFIG.md – Projektwerte

## Produkt

- Vorläufiger App-Name: `UH-Register`
- Sprache der Oberfläche: Deutsch
- Locale für Datumsanzeigen: `de-CH`
- Zeitzone für Veranstaltungsdaten: `Europe/Zurich`
- Zielplattform: Responsive Web-App
- Version-1-Kartenansicht: Deaktiviert

## Externe URLs

### Veröffentlichte Google-Sheets-CSV

`https://docs.google.com/spreadsheets/d/1ybv9lAwSZEBGDTzgsaPMSSzZdxRVrnF6adqbmZWjRZE/export?format=csv`

Hinweise:
- Die URL muss auf die tatsächlich veröffentlichte CSV zeigen.
- Prüfen, dass die Daten ohne Google-Login lesbar sind.
- Keine private Bearbeitungs-URL eines Google Sheets als CSV-Quelle voraussetzen.
- Keine erfundene Beispiel-URL in die produktive Konfiguration übernehmen.

### Google-Forms-Link für Veranstaltungsmeldungen

`https://docs.google.com/forms/d/e/1FAIpQLSeMcrlxd7ZKETjAPz6CfEN3kGQ1wZjC9kdMlTm6X8OQ9FKWIQ/viewform?usp=header`

Hinweise:
- Den bestehenden Melde-Link verwenden.
- Der Button «Veranstaltung melden» öffnet das Formular.
- Die App schreibt nicht direkt in die veröffentlichte CSV.

## Informationsseiten

### Datenschutz
- Vorhandene Route oder URL: noch zu prüfen
- Falls nicht vorhanden: Platzhalterseite erstellen und klar kennzeichnen, dass der endgültige Inhalt noch ergänzt werden muss.

### Impressum
- Vorhandene Route oder URL: noch zu prüfen
- Falls nicht vorhanden: Platzhalterseite erstellen und klar kennzeichnen, dass der endgültige Inhalt noch ergänzt werden muss.

## Technische Konfiguration

Der Coding-Agent muss zuerst prüfen, welche Konventionen das bestehende Projekt verwendet.

- CSV-URL zentral und passend zur Build-Umgebung konfigurieren.
- Google-Forms-URL zentral konfigurieren.
- App-Name nicht an mehreren UI-Stellen fest codieren.
- Keine geheimen Zugangsdaten im Frontend speichern.

Falls das Projekt Umgebungsvariablen verwendet, passende Beispielwerte in `.env.example` dokumentieren. Keine echten Geheimnisse in `.env.example` eintragen.

## Vor Veröffentlichung zu prüfen

- [ ] Richtige veröffentlichte CSV-URL eingetragen
- [ ] Richtiger Google-Forms-Link eingetragen
- [ ] App-Name bestätigt
- [ ] Datenschutzseite mit echtem Inhalt ergänzt
- [ ] Impressum mit echtem Inhalt ergänzt
- [ ] CSV öffentlich erreichbar
- [ ] Datum und Uhrzeit korrekt in Schweizer Lokalzeit
- [ ] Produktions-Build erfolgreich