# PROJECT_SPEC.md – Produktbeschreibung

## 1. Produktziel

Die App bietet eine übersichtliche Liste von Turnerabendunterhaltungen und vergleichbaren Veranstaltungen von Turnvereinen in der Schweiz. Sie soll vor allem auf Smartphones schnell und angenehm bedienbar sein.

Der vorläufige App-Name ist **TV-Agenda**. Der Name muss zentral konfigurierbar bleiben, damit er später einfach geändert werden kann.

## 2. Zielgruppe

Personen, die Veranstaltungen von Turnvereinen suchen und Informationen zu Datum, Uhrzeit, Veranstalter und Veranstaltungsort benötigen.

## 3. Umfang der ersten Version

Die erste Version besteht aus einer Veranstaltungsübersicht, Suche, Filter, Sortierung, einer Detailansicht und einfachen Informationsseiten.

**Eine Karte ist ausdrücklich nicht Bestandteil von Version 1.** Die Datenstruktur soll eine spätere Ergänzung von Koordinaten und einer Kartenansicht nicht unnötig erschweren.

## 4. Seitenaufbau

### Kopfzeile

- App-Name oder Logo links
- Aktion «Veranstaltung melden» rechts
- Der Melde-Button öffnet das konfigurierte Google-Formular.
- Das Formular wird nicht in der App nachgebaut.
- Auf kleinen Bildschirmen bleibt die Kopfzeile kompakt.

### Hauptbereich

- Suchfeld
- Zugang zu Filtern
- Sortierauswahl
- Anzahl der gefundenen Veranstaltungen, sofern sinnvoll
- Liste der Veranstaltungskarten
- Optional aktive Filter als Chips mit der Möglichkeit, sie einzeln zu entfernen

### Footer

- Link «Datenschutz»
- Link «Impressum»
- Die Links führen zu vorhandenen Seiten oder klar gekennzeichneten Platzhaltern, bis echte Inhalte verfügbar sind.

## 5. Veranstaltungskarte

Jede Karte zeigt kompakt:

1. Titel in der Form `Organisator: Veranstaltungstitel`
2. Datum oder Datumszusammenfassung
3. Ort, sofern vorhanden

Beispiel:

**TV Berlingen: Blind Donkey**

20.–21. November 2026

Berlingen

Die gesamte Karte ist anklickbar. Sie muss eine ausreichende Touch-Fläche und einen sichtbaren Fokuszustand besitzen.

Fehlende Ortsangaben sollen keine leeren Zeilen oder unnötigen Platzhalter erzeugen.

## 6. Detailansicht

Die Detailansicht wird als Sheet oder Drawer dargestellt. Verwende die in der vorhandenen UI-Bibliothek verfügbare passende Komponente.

Sie zeigt:

- Organisator und Veranstaltungstitel
- Alle gültigen Veranstaltungstermine, jeweils mit Wochentag, Datum und Startzeit
- Ort, sofern vorhanden
- Einen externen Informationslink, sofern vorhanden
- Eine gut erkennbare Schliessen-Aktion oben rechts

Beispiel:

**TV Berlingen**

Blind Donkey

- Freitag, 20. November 2026 · 20:00 Uhr
- Samstag, 21. November 2026 · 20:00 Uhr

Berlingen

[Weitere Informationen]

Vergangene Termine dürfen in den Quelldaten und in der Detailansicht erhalten bleiben, sollen jedoch als vergangen erkennbar sein. Die Hauptliste zeigt standardmässig nur Veranstaltungen, für die mindestens ein zukünftiger Termin vorhanden ist.

Beim Schliessen muss die vorherige Listenposition möglichst erhalten bleiben.

## 7. Suche

Die Suche durchsucht:

- Organisator
- Veranstaltungstitel
- Ort

Anforderungen:

- Gross-/Kleinschreibung ignorieren
- Möglichst tolerant gegenüber Akzenten und Umlauten sein
- Teilstrings finden
- Suche und aktive Filter miteinander kombinieren
- Keine neue CSV-Anfrage bei jeder Texteingabe auslösen

## 8. Filter

Mindestens folgende Filter sind vorgesehen:

- Datumsbereich: von / bis

Der Datumsbereich wird mit sämtlichen gültigen Veranstaltungsterminen einer Veranstaltung abgeglichen. Eine Veranstaltung ist ein Treffer, wenn mindestens einer ihrer Termine innerhalb des ausgewählten Bereichs liegt.

Ein Filterdialog oder Sheet ist auf Mobilgeräten geeignet. Es muss eine Möglichkeit geben, Filter zurückzusetzen.

## 9. Sortierung

Folgende Sortiermöglichkeiten sind vorgesehen:

- Nächster zukünftiger Termin zuerst – Standard
- Spätester zukünftiger Termin zuerst
- Organisator A–Z
- Veranstaltungstitel A–Z

Bei alphabetischer Sortierung gelten fehlende Werte als leere Werte und dürfen keine Laufzeitfehler auslösen. Bei gleichen Sortierwerten soll die Reihenfolge stabil bleiben.

## 10. Termine und Sichtbarkeit

- Eine Veranstaltung kann mehrere Termine haben.
- Termine werden chronologisch sortiert.
- Standardmässig erscheint eine Veranstaltung in der Hauptliste, wenn mindestens ein gültiger Termin ab dem aktuellen Zeitpunkt in Schweizer Lokalzeit liegt.
- Vergangene Termine einer weiterhin aktuellen Veranstaltung bleiben in deren Detailansicht sichtbar.
- Die Kartenanzeige darf mehrere aufeinanderfolgende Tage kompakt zusammenfassen.
- Nicht aufeinanderfolgende Termine dürfen nicht irreführend als durchgehender Zeitraum angezeigt werden.

## 11. Meldung neuer Veranstaltungen

Der Button «Veranstaltung melden» öffnet das konfigurierte Google-Formular.

Das Formular übermittelt nicht direkt an die veröffentlichte CSV. Veranstaltungen werden erst angezeigt, wenn sie nach dem vorgesehenen Prozess in der veröffentlichten Datenquelle erscheinen.

## 12. Zustände und Rückmeldungen

Die Anwendung muss folgende Zustände abdecken:

- Initiales Laden
- Daten werden aktualisiert
- Veranstaltungen vorhanden
- Keine Veranstaltungen vorhanden
- Keine Suchtreffer
- CSV oder Netzwerk nicht erreichbar
- Zwischengespeicherte Daten werden angezeigt
- Erneuter Ladeversuch möglich

Fehler sollen verständlich formuliert sein und keine technischen Interna offenlegen.

## 13. Spätere Erweiterungen

Mögliche spätere Funktionen sind eine Karte, Favoriten und zusätzliche Filter. Diese dürfen den Umfang der ersten Version nicht unnötig vergrössern.