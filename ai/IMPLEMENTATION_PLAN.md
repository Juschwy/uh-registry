# IMPLEMENTATION_PLAN.md – Vorgehensplan

## Ziel

Eine zuverlässige, mobile-first Web-App für Schweizer Turnerabendunterhaltungen. Die Daten stammen aus einer öffentlich erreichbaren Google-Sheets-CSV.

## Phase 1: Bestandsaufnahme und Vorbereitung

### Aufgaben
- Repository, Framework, Paketmanager, Ordnerstruktur und vorhandene Seiten untersuchen.
- shadcn/ui, Tailwind, Design-Tokens und bestehende Komponenten prüfen.
- Vorhandene CSV- und Formular-URLs sowie Umgebungsvariablen suchen.
- Bestehende Tests und verfügbare Qualitätsprüfungen ermitteln.
- Projektunterlagen mit dem vorhandenen Code abgleichen.

### Abnahmekriterien
- Die bestehende Architektur ist dokumentiert.
- Die geplanten Änderungen sind auf das Notwendige beschränkt.
- Fehlende Konfigurationswerte sind eindeutig identifiziert.

## Phase 2: CSV-Datenservice und Fachlogik

### Aufgaben
- CSV über die konfigurierte öffentliche URL laden.
- CSV mit Papa Parse parsen.
- Datensätze validieren und in ein einheitliches internes Modell überführen.
- Mehrere Veranstaltungsdaten pro Verein unterstützen.
- Ungültige optionale Werte kontrolliert behandeln.
- Funktionen für zukünftige Veranstaltungen, Datumsformatierung, Suche, Filter und Sortierung erstellen.

### Abnahmekriterien
- CSV-Spalten werden korrekt zugeordnet.
- Leere Datumsfelder verursachen keine Fehler.
- Vergangene Termine werden korrekt behandelt.
- Veranstaltungszeiten werden nicht durch UTC-Konvertierungen verschoben.
- Automatisierte Tests decken die zentrale Fachlogik ab.

## Phase 3: Kernoberfläche

### Aufgaben
- Kopfzeile mit App-Name und Melde-Link erstellen.
- Suchfeld und Filter-/Sortierbedienung implementieren.
- Veranstaltungsübersicht und Karten gestalten.
- Gemeinsame Detailansicht als Sheet oder Drawer umsetzen.
- Footer mit Datenschutz und Impressum ergänzen.
- Lade-, Leer-, Fehler- und Wiederholungszustände erstellen.

### Abnahmekriterien
- Nutzer können Veranstaltungen finden und öffnen.
- Suche, Filter und Sortierung funktionieren unabhängig voneinander und in Kombination.
- Die Detailansicht zeigt sämtliche gültigen zukünftigen und vergangenen Termine des geöffneten Events, soweit sie noch in den Daten vorhanden sind; vergangene Termine werden klar gekennzeichnet.
- Externe Veranstaltungslinks funktionieren sicher.
- Es gibt keine Karte oder Kartenbibliothek in Version 1.

## Phase 4: Cache und Netzwerkfehler

### Aufgaben
- Vorhandenen Browser-HTTP-Cache nutzen, sofern sinnvoll.
- Optional einen kleinen lokalen Cache ergänzen, wenn er sich in die bestehende Architektur sauber einfügt.
- Gültige Cache-Daten zuerst anzeigen und anschliessend im Hintergrund aktualisieren.
- Bei Netzwerkfehlern den letzten gültigen Datenstand verwenden.
- Einen erkennbaren Zustand anzeigen, wenn nur zwischengespeicherte Daten verfügbar sind.

### Abnahmekriterien
- Ein vorübergehender Netzwerkausfall macht die App nicht unbenutzbar, wenn gültige Cache-Daten existieren.
- Ungültige neue CSV-Daten überschreiben keine gültigen Cache-Daten.
- Suchen und Filtern lösen keine neuen Netzwerkanfragen aus.
- Es gibt eine Möglichkeit, einen erneuten Ladeversuch auszulösen.

## Phase 5: Responsive Design und Accessibility

### Aufgaben
- Darstellung auf etwa 320 px bis zu breiten Desktop-Bildschirmen prüfen.
- Touch-Ziele, Abstände, Lesbarkeit und Umbruchverhalten optimieren.
- Tastaturbedienung, sichtbare Fokuszustände und Sheet-Schliessverhalten prüfen.
- Semantische HTML-Elemente und zugängliche Beschriftungen verwenden.
- Bewegungsanimationen bei aktivierter Einstellung für reduzierte Bewegung zurücknehmen.

### Abnahmekriterien
- Kein unbeabsichtigtes horizontales Scrollen.
- Alle zentralen Funktionen sind per Tastatur bedienbar.
- Dialoge/Sheets sind zugänglich und können zuverlässig geschlossen werden.
- Inhalte bleiben bei längeren Titeln, Vereinsnamen und Orten lesbar.

## Phase 6: Qualitätssicherung und Übergabe

### Aufgaben
- Tests ausführen und nötige Tests ergänzen.
- Linter, Typecheck und Build ausführen, sofern im Projekt vorhanden.
- Fehler beheben und Änderungen erneut prüfen.
- README oder Projektdokumentation bei Bedarf aktualisieren.
- Abschlussbericht mit tatsächlichen Resultaten erstellen.

### Abnahmekriterien
- Alle erfolgreich ausführbaren relevanten Checks sind dokumentiert.
- Bekannte Fehler und nicht ausgeführte Checks werden offen genannt.
- Konfigurationswerte und Startanleitung sind dokumentiert.

## Priorisierung

Falls der Umfang angepasst werden muss, gilt diese Reihenfolge:

1. Korrekte Daten und Datumslogik
2. Funktionierende Veranstaltungsübersicht und Details
3. Suche, Filter und Sortierung
4. Zuverlässiges Verhalten bei Netzwerkfehlern
5. Responsive Design und Accessibility
6. Zusätzliche Komfortfunktionen

## Nicht Bestandteil von Version 1

- Interaktive Karte
- Benutzerkonten oder Login
- Direktes Einreichen von Veranstaltungen in die veröffentlichte CSV
- Eigenes Backend, sofern es nicht aus zwingenden Gründen benötigt wird
- Favoriten, Push-Benachrichtigungen oder personalisierte Empfehlungen