# TECHNICAL_SPEC.md – Architektur und Zuverlässigkeit

## 1. Architekturprinzip

Die Umsetzung soll zur bestehenden Codebasis passen. Die folgende Trennung ist ein Ziel für Verantwortlichkeiten, keine Aufforderung, die gesamte Projektstruktur umzubauen.

- **Datenservice:** CSV laden, Fehler behandeln und Cache verwalten
- **Parser/Normalizer:** CSV-Zeilen validieren und in das interne Modell umwandeln
- **Datumslogik:** Termine vergleichen, formatieren und zusammenfassen
- **Filter-/Sortierlogik:** Reine Funktionen ohne UI-Abhängigkeiten
- **UI-Komponenten:** Liste, Karte, Filter, Sortierung und Detailansicht
- **Seiten/Layout:** Kopfzeile, Hauptbereich und Footer
- **Konfiguration:** App-Name und externe URLs zentral verwalten

## 2. CSV-Import

- Die veröffentlichte CSV wird über eine konfigurierte URL geladen.
- Papa Parse ist die bevorzugte Bibliothek, sofern sie nicht bereits durch eine passende bestehende Lösung ersetzt wird.
- Prüfe HTTP-Status, leere Antworten und Parsing-Fehler.
- Beachte mögliche Browser-CORS-Beschränkungen. Erfinde keinen Proxy als vermeintlich vorhandene Infrastruktur.
- Ein Backend oder eigener Proxy darf nur eingeführt werden, wenn die bestehende Bereitstellung dies wirklich erfordert.

## 3. Cache-Strategie

Bevorzuge die einfachste zuverlässige Lösung:

1. Nutze den HTTP-Cache, soweit die Quelle und die vorhandene Infrastruktur ihn sinnvoll unterstützen.
2. Prüfe, ob ein lokaler Cache tatsächlich einen Mehrwert bietet.
3. Wenn ein lokaler Cache benötigt wird, wähle eine zur Datenmenge passende Lösung. Für eine kleine, vollständig heruntergeladene Veranstaltungsliste kann `localStorage` genügen; andernfalls prüfe IndexedDB.
4. Zeige vorhandene, gültige Cache-Daten sofort an.
5. Aktualisiere die Daten im Hintergrund.
6. Ersetze den bisherigen gültigen Datenstand erst, wenn die neue CSV erfolgreich geladen, geparst und validiert wurde.
7. Bei einem Netzwerkfehler behalte die letzte gültige Version und informiere den Nutzer dezent, dass die Daten möglicherweise nicht aktuell sind.

Vermeide doppelte Cache-Schichten ohne konkreten Nutzen.

## 4. Aktualisierungsverhalten

- Filter, Sortierung und Suche arbeiten lokal auf den bereits geladenen Daten.
- Texteingaben lösen keine neuen CSV-Anfragen aus.
- Ladeanfragen sollen nicht unnötig parallel oder mehrfach ausgelöst werden.
- Bei Bedarf einen erneuten Ladeversuch anbieten.
- Ein manueller Refresh darf nicht die gesamte App unnötig neu initialisieren.
- Cache-Versionierung oder Ablaufregeln müssen nachvollziehbar sein, falls sie benötigt werden.

## 5. Externe Links

Für Links aus der CSV:

- Nur `http:` und `https:` als klickbare Ziele zulassen.
- Keine ungeprüften URLs als HTML ausgeben.
- Bei Öffnen in einem neuen Tab `rel="noopener noreferrer"` setzen.
- Links klar als externe Aktion erkennbar machen.
- Fehlende oder ungültige Links nicht als aktive Schaltfläche darstellen.

## 6. Konfiguration

- App-Name, CSV-URL und Google-Forms-URL zentral verwalten.
- Bereits vorhandene Konfigurationskonventionen verwenden.
- Bei clientseitigen Build-Systemen beachten, dass öffentliche Umgebungsvariablen im ausgelieferten JavaScript sichtbar sein können.
- Keine geheimen Schlüssel im Frontend hinterlegen.
- Wenn ein Wert fehlt, eine klare Konfigurationsmeldung und eine Dokumentation bereitstellen, statt eine erfundene URL einzubauen.

## 7. Fehlerzustände

Die Anwendung soll unterscheiden zwischen:

- Noch keine Daten geladen
- Daten werden geladen
- Erfolgreich geladene Daten
- Erfolgreiche Aktualisierung
- Aktualisierung fehlgeschlagen, Cache weiterhin verfügbar
- Keine gültigen Veranstaltungen vorhanden
- Fehlerhafte Datenquelle ohne brauchbaren Cache

Die Oberfläche soll nicht bei jedem temporären Netzwerkfehler vollständig leer werden, sofern ein gültiger Datenstand existiert.

## 8. Performance

- Filter und Sortierung auf bereits normalisierten Daten ausführen.
- Wiederholte Datumsberechnungen nur dort vermeiden, wo dies die Verständlichkeit nicht beeinträchtigt.
- Keine unnötigen Bibliotheken hinzufügen.
- Keine Karte oder Kartenbibliothek in Version 1 laden.
- Bestehende Build- und Performance-Konventionen beibehalten.

## 9. Tests

Automatisierte Tests sollen mindestens die Datenverarbeitung, die Datumslogik, Suche, Filter, Sortierung und Fehlerfälle abdecken.

Wenn im Projekt bereits ein Testframework existiert, verwende dieses. Führe nicht ohne Grund ein zweites Testframework ein.

Ergänze je nach bestehender Infrastruktur UI-Tests für:
- Öffnen und Schliessen der Detailansicht
- Filtern und Sortieren der Liste
- Lade-, Leer- und Fehlerzustände
- Fallback auf Cache-Daten

## 10. Spätere Karte

Eine Kartenansicht ist bewusst auf später verschoben.

Wenn sie später umgesetzt wird, sollen dafür echte Koordinaten ergänzt oder zuverlässig ermittelt werden. Ortsnamen allein dürfen nicht als präzise Koordinaten ausgegeben werden. Die spätere Kartenfunktion soll die bestehende Event-Datenlogik wiederverwenden.