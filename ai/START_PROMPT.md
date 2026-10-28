# Auftrag: Turnerabend-Agenda als mobile-first Web-App

Du bist der verantwortliche Senior Frontend Engineer für dieses Projekt. Entwickle die bestehende Anwendung zu einer modernen, zuverlässigen und mobilfreundlichen Web-App weiter, mit der Nutzer Turnerabendunterhaltungen und vergleichbare Veranstaltungen von Turnvereinen in der Schweiz finden können.

## Verbindliche Arbeitsgrundlage

Lies vor jeder Implementierung diese Dateien vollständig:

1. `AGENTS.md`
2. `IMPLEMENTATION_PLAN.md`
3. `PROJECT_SPEC.md`
4. `DATA_SPEC.md`
5. `DESIGN_SPEC.md`
6. `TECHNICAL_SPEC.md`
7. `PROJECT_CONFIG.md`, sofern vorhanden

Die Anforderungen in diesen Dateien sind verbindlich. Bei Widersprüchen gilt folgende Priorität:

1. Die bestehende Projektarchitektur und zwingende technische Einschränkungen
2. `AGENTS.md`
3. `DATA_SPEC.md` für Daten und Datumslogik
4. `PROJECT_SPEC.md` für Produktverhalten
5. `DESIGN_SPEC.md` für Oberfläche und Bedienung
6. `TECHNICAL_SPEC.md` für technische Umsetzung
7. `IMPLEMENTATION_PLAN.md` für die Reihenfolge der Arbeit

Melde echte Widersprüche, die nicht sinnvoll auflösbar sind, bevor du riskante Änderungen ausführst.

## Vorgehen

Arbeite strikt nach `IMPLEMENTATION_PLAN.md`.

**Phase 1 – Bestandsaufnahme**

- Untersuche das Repository, die vorhandenen Seiten, Komponenten, Abhängigkeiten, Skripte und Tests.
- Prüfe insbesondere, welches Framework, welcher Build-Prozess und welche Tailwind-/shadcn/ui-Konfiguration bereits vorhanden sind.
- Prüfe, ob CSV-URL, Google-Forms-URL und App-Name bereits im Projekt hinterlegt sind.
- Erstelle eine kurze Bestandsaufnahme und einen konkreten Umsetzungsplan.
- Ändere in dieser Phase noch keine umfangreichen Teile der Anwendung.

**Phase 2 – Datenbasis**

- Implementiere den CSV-Import gemäss `DATA_SPEC.md`.
- Verwende Papa Parse, sofern das vorhandene Projekt keine gleichwertige, bereits etablierte Lösung besitzt.
- Trenne CSV-Parsing, Validierung, Normalisierung, Datumsfunktionen, Filter und Sortierung von der UI.
- Behandle Datums- und Zeitzonen korrekt. Veranstaltungszeiten sind Schweizer Lokalzeiten.
- Ergänze automatisierte Tests für die Datenlogik.

**Phase 3 – Kernoberfläche**

- Implementiere die mobile-first Veranstaltungsübersicht.
- Baue Suche, Filter, Sortierung, Veranstaltungskarten und die gemeinsame Detailansicht.
- Verwende die vorhandenen shadcn/ui-Komponenten und die bereits bestehenden Design-Tokens.
- Ergänze alle erforderlichen Lade-, Leer- und Fehlerzustände.

**Phase 4 – Zuverlässigkeit**

- Ergänze Cache- und Offline-Fallback gemäss `TECHNICAL_SPEC.md`.
- Vermeide unnötige CSV-Neuanfragen beim Suchen, Filtern und Sortieren.
- Behandle ungültige Daten und fehlerhafte externe Links robust.

**Phase 5 – Qualitätssicherung**

- Führe die verfügbaren Tests, den Linter, den Typecheck und den Build aus.
- Behebe Fehler, die durch deine Änderungen entstanden sind.
- Prüfe die Anwendung insbesondere auf schmalen Mobilbildschirmen, Tastaturbedienung und barrierearme Zustände.
- Aktualisiere bei Bedarf die Projektdokumentation.

## Technische Leitplanken

- Verwende die bereits vorhandene Technologie und Projektstruktur, sofern kein überzeugender Grund für eine Änderung besteht.
- shadcn/ui ist bereits installiert. Verwende bestehende Komponenten, statt parallele UI-Systeme aufzubauen.
- Installiere nur zusätzliche Abhängigkeiten, die tatsächlich benötigt werden.
- Baue **in Version 1 keine Karte** ein. Eine spätere Kartenansicht ist ausserhalb des aktuellen Umfangs.
- Erfinde keine CSV- oder Google-Forms-URL. Verwende vorhandene Konfigurationen oder dokumentiere eindeutig, welche Werte noch einzutragen sind.
- Führe keine unnötigen Refactorings oder Änderungen ausserhalb des Projektumfangs durch.
- Bewahre bestehende, funktionierende Funktionen.
- Triff kleine, risikoarme Entscheidungen selbstständig und dokumentiere relevante Annahmen.
- Behaupte nie, Tests seien erfolgreich, wenn du sie nicht tatsächlich ausgeführt hast.

## Abschlussbericht

Melde am Ende:

1. Was implementiert wurde.
2. Welche Dateien neu erstellt oder wesentlich geändert wurden.
3. Welche Tests, Checks und Builds tatsächlich ausgeführt wurden und deren Resultate.
4. Welche Konfigurationswerte noch fehlen.
5. Welche bekannten Einschränkungen oder offenen Punkte bestehen.
6. Wie die Anwendung lokal gestartet werden kann.

Beginne jetzt mit Phase 1. Arbeite danach selbstständig Phase für Phase weiter. Stoppe nur, wenn eine fehlende Information eine sichere oder sinnvolle Umsetzung tatsächlich verhindert.