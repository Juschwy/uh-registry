# AGENTS.md – Arbeitsregeln

All of the specs, rules and configs are in the `ai` directory.

## Projektprinzipien

- Lies die relevanten Projektdokumente vor Änderungen.
- Prüfe bestehende Konventionen, bevor du neue einführst.
- Bevorzuge kleine, verständliche und wartbare Änderungen.
- Verwende vorhandene Komponenten, Utilities, Design-Tokens und Abhängigkeiten.
- Vermeide doppelte Implementierungen derselben Funktion.
- Trenne Datenlogik, Geschäftslogik und Darstellung.
- Verwende TypeScript-Typen, sofern das Projekt TypeScript verwendet.
- Behandle externe Daten grundsätzlich als nicht vertrauenswürdig.
- Verwende keine erfundenen URLs, Testresultate oder Datenquellen.

## Bestehendes Projekt schützen

- Erstelle kein neues Projekt, wenn bereits eines existiert.
- Ändere weder Framework noch Paketmanager ohne triftigen Grund.
- Überschreibe keine bestehenden Konfigurationen blind.
- Untersuche vorhandene Git-Änderungen, bevor du Dateien veränderst.
- Lösche keine bestehenden Funktionen, um eine neue Funktion einfacher umzusetzen.
- Führe keine destruktiven Befehle aus, ohne deren Auswirkungen zu prüfen.

## UI und Design

- Verwende das vorhandene shadcn/ui-Setup.
- Folge den bereits vorhandenen Farbvariablen, Typografie-, Radius-, Abstands- und Theme-Konventionen.
- Verwende keine zweite Komponentenbibliothek, wenn sie nicht erforderlich ist.
- Stelle konsistente Zustände für Hover, Focus, Disabled, Loading und Error sicher.
- Die Anwendung muss zuerst für Smartphones gestaltet und anschliessend für grössere Bildschirme angepasst werden.
- Vermeide horizontales Scrollen bei üblichen mobilen Bildschirmbreiten.

## Daten und Datum

- Halte dich an `DATA_SPEC.md`.
- Behandle CSV-Datumswerte als Schweizer lokale Veranstaltungszeiten, nicht als UTC.
- Verwende für die fachliche Datumslogik eine konsistente Schweizer Zeitzone.
- Vermeide Datumsvergleiche auf Basis formatierter Anzeigetexte.
- Ungültige optionale Felder sollen möglichst nur das betroffene Feld beeinträchtigen.
- Erfinde keine fehlenden Veranstaltungsdaten.

## Tests und Qualität

- Ergänze Tests für neue fachliche Logik.
- Führe passende Tests und verfügbare Qualitätsprüfungen aus.
- Prüfe nach Änderungen mindestens die betroffenen Funktionen.
- Kennzeichne fehlgeschlagene oder nicht ausführbare Prüfungen ehrlich.
- Ändere Tests nicht nur, um eine fehlerhafte Implementierung grün erscheinen zu lassen.

## Dokumentation und Kommunikation

- Halte Annahmen und Konfigurationsanforderungen nachvollziehbar fest.
- Aktualisiere Dokumentation, wenn sich Bedienung, Konfiguration oder Architektur wesentlich ändern.
- Stelle offene Fragen gesammelt und nur dann, wenn eine sichere Fortsetzung sonst nicht möglich ist.
- Melde zum Abschluss Änderungen, Prüfresultate, offene Punkte und Startanweisungen.