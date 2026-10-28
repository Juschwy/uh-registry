# DATA_SPEC.md – Datenmodell und CSV-Verarbeitung

## 1. Datenquelle

Die Veranstaltungen stammen aus einer öffentlich veröffentlichten Google-Sheets-CSV.

- CSV-URL ausschliesslich aus der Projektkonfiguration beziehen.
- Papa Parse zum Parsen verwenden, sofern keine gleichwertige bestehende Lösung vorhanden ist.
- Keine Zugangsdaten oder privaten Google-API-Schlüssel in den Client einbauen.
- Nicht von einer bestimmten Reihenfolge der CSV-Zeilen abhängig sein.

## 2. Verbindliches CSV-Schema

Die Spaltennamen sind fest definiert:

| Spalte | Pflichtfeld | Bedeutung |
|---|---|---|
| `organizer` | Ja | Name des Turnvereins oder Veranstalters |
| `title` | Ja | Veranstaltungstitel |
| `town` | Nein | Ort der Veranstaltung |
| `link` | Nein | Externer Informationslink |
| `eventDatetime1` | Nein | Erster Termin |
| `eventDatetime2` | Nein | Zweiter Termin |
| `eventDatetime3` | Nein | Dritter Termin |
| `eventDatetime4` | Nein | Vierter Termin |
| `eventDatetime5` | Nein | Fünfter Termin |

Beispiel einer CSV-Zeile:

```csv
organizer,title,town,link,eventDatetime1,eventDatetime2,eventDatetime3,eventDatetime4,eventDatetime5
TV Berlingen,Blind Donkey,Berlingen,https://www.tvberlingen.ch/,2026-11-20T20:00:00,2026-11-21T20:00:00,,,,
```

Die tatsächliche CSV muss korrektes CSV-Quoting verwenden, wenn Werte Kommas, Anführungszeichen oder Zeilenumbrüche enthalten.

## 3. Datumsformat und Zeitzone

Ein Termin hat das Format:

`YYYY-MM-DDTHH:mm:ss`

Beispiel:

`2026-11-20T20:00:00`

**Wichtig:** Der Wert beschreibt die lokale Uhrzeit der Veranstaltung in der Schweiz. Er ist kein UTC-Zeitstempel.

Daher:

- Nicht direkt als UTC interpretieren.
- Keine automatische Verschiebung durch `toISOString()` oder vergleichbare UTC-Konvertierungen in die fachliche Anzeige einführen.
- Die Datums- und Uhrzeitbestandteile zunächst als lokale Kalenderwerte validieren und verarbeiten.
- Schweizer Lokalzeit und Sommer-/Winterzeit berücksichtigen.
- Für die Anzeige die Locale `de-CH` und die Zeitzone `Europe/Zurich` verwenden, sofern die gewählte Implementierung diese explizit benötigt.

Eine robuste Umsetzung darf für die Sortierung nicht auf formatierte Anzeigetexte zurückgreifen. Verwende eine zentrale, getestete Datumsfunktion. Wenn eine Bibliothek für zeitzonenbewusste Verarbeitung benötigt wird, prüfe zuerst, ob das bestehende Projekt bereits eine geeignete Abhängigkeit enthält.

## 4. Internes Datenmodell

Normalisiere die CSV-Daten in ein einheitliches internes Modell. Beispiel für TypeScript:

```ts
type EventDate = {
  date: string;      // YYYY-MM-DD, Schweizer lokaler Kalendertag
  startTime: string; // HH:mm, Schweizer lokale Startzeit
};

type Event = {
  id: string;
  organizer: string;
  title: string;
  town: string | null;
  link: string | null;
  dates: EventDate[];
};
```

Die genaue Umsetzung darf an bestehende Projektkonventionen angepasst werden. Die Semantik der Felder muss erhalten bleiben.

Da die CSV keine ID-Spalte besitzt:

- Erzeuge eine deterministische ID aus geeigneten vorhandenen Datenfeldern oder verwende eine bereits vorhandene Identifikationsstrategie.
- Verwende keine zufällige ID, die sich bei jedem erneuten Laden ändert.
- Dokumentiere, dass eine zusammengesetzte ID nicht vollständig stabil bleibt, wenn sich ihre Quellfelder ändern.
- Prüfe, dass doppelte oder unvollständige Datensätze die UI nicht zum Absturz bringen.

## 5. Validierung und Normalisierung

- `organizer` und `title` müssen nach dem Entfernen unnötiger äusserer Leerzeichen einen sinnvollen Wert enthalten.
- Datensätze ohne Organisator oder Titel sollen übersprungen und nachvollziehbar gezählt werden.
- Leere `town`- und `link`-Felder werden als `null` behandelt.
- Leere Datumsfelder werden ignoriert.
- Ungültige einzelne Datumsfelder werden verworfen, ohne die übrigen gültigen Termine desselben Datensatzes zu verlieren.
- Ein Datensatz ohne gültigen Termin wird nicht in der Hauptliste angezeigt.
- Ungültige oder nicht unterstützte Link-Schemata werden nicht als klickbare Links ausgegeben.
- Die Anwendung darf keine fehlenden Termine, Orte oder Links erfinden.

## 6. Reihenfolge und Anzeige der Termine

- Termine intern chronologisch sortieren.
- Den nächsten zukünftigen Termin für die Standardsortierung verwenden.
- In der Detailansicht alle gültigen Termine anzeigen, einschliesslich vergangener Termine, soweit sie in den Quelldaten vorhanden sind.
- Vergangene Termine optisch als vergangen kennzeichnen.
- Die Hauptliste zeigt standardmässig nur Veranstaltungen, deren nächster gültiger Termin noch nicht vorbei ist.

Für die kompakte Darstellung auf einer Karte:

- Aufeinanderfolgende Kalendertage dürfen zu einem Zeitraum zusammengefasst werden.
- Nicht aufeinanderfolgende Tage müssen als einzelne Termine dargestellt werden.
- Termine über Monats- oder Jahresgrenzen müssen korrekt formatiert sein.
- Eine Zusammenfassung darf nicht suggerieren, dass an jedem Tag zwischen zwei Terminen eine Veranstaltung stattfindet.

## 7. Filter- und Sortierregeln

### Standardliste

Eine Veranstaltung ist sichtbar, wenn mindestens ein gültiger Termin in der Schweizer Lokalzeit noch bevorsteht.

Vergangene Termine dürfen nicht verhindern, dass eine Veranstaltung mit einem weiteren zukünftigen Termin angezeigt wird.

### Datumsfilter

Der ausgewählte Datumsbereich ist inklusiv. Eine Veranstaltung passt, wenn mindestens einer ihrer Termine innerhalb des Bereichs liegt.

Der Vergleich erfolgt anhand lokaler Kalendertage, nicht anhand formatierter Texte.

### Standardsortierung

- Berechne für jede sichtbare Veranstaltung den nächsten zukünftigen Termin.
- Sortiere aufsteigend nach diesem Termin.
- Veranstaltungen ohne zukünftigen Termin gehören nicht in die Standardliste.
- Bei gleichen Werten verwende eine stabile, nachvollziehbare sekundäre Sortierung.

### Suche

Durchsuche `organizer`, `title` und `town`, sofern vorhanden. Die Suche ist unabhängig von Gross-/Kleinschreibung. Eine Normalisierung von Unicode-Zeichen und Umlauten soll die Suche möglichst tolerant machen, ohne die angezeigten Originaltexte zu verändern.

## 8. CSV-Ladefehler

- Fehlgeschlagene HTTP-Anfragen behandeln.
- Leere oder offensichtlich fehlerhafte CSV-Antworten erkennen.
- Parsing-Fehler berücksichtigen.
- Gültige Daten nicht durch einen ungültigen neuen Datenstand überschreiben.
- Bereits gültige Cache-Daten weiterverwenden, wenn die Aktualisierung fehlschlägt.
- Fehler für Nutzer verständlich anzeigen und technische Details nur in geeigneter Entwicklungsdiagnostik ausgeben.

## 9. Tests

Mindestens testen:

- Normales CSV mit allen Spalten
- Leere optionale Felder
- Mehrere Termine
- Ungültiger Termin neben gültigem Termin
- Fehlender Organisator oder Titel
- Kommas und korrekt gequotete Felder
- Doppelte oder unvollständige Datensätze
- Vergangene und zukünftige Termine im selben Datensatz
- Schweizer Lokalzeit, einschliesslich Sommer-/Winterzeit
- Sortierung bei gleichen Terminen
- Inklusiver Datumsfilter
- Nicht aufeinanderfolgende Termine bei der kompakten Anzeige