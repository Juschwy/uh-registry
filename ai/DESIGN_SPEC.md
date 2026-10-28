# DESIGN_SPEC.md – UI, Design und Accessibility

## 1. Grundsatz

Die App ist mobile-first. Das Layout wird zuerst für kleine Smartphones entworfen und danach für grössere Bildschirme erweitert.

Das bestehende Design des Projekts hat Vorrang. shadcn/ui ist bereits installiert.

## 2. Bestehendes Designsystem zuerst prüfen

Vor der Gestaltung:

- Bestehende shadcn/ui-Komponenten untersuchen.
- Vorhandene Tailwind-Konfiguration und Design-Tokens prüfen.
- Bestehende Farben, Schriftgrössen, Radien, Abstände und Theme-Modi übernehmen.
- Vorhandene Komponenten wiederverwenden.
- Keine neuen Farben oder Komponentenbibliotheken ohne Bedarf einführen.

Wenn die Anwendung bereits einen konsistenten Stil hat, soll dieser beibehalten und nur dort erweitert werden, wo es für die neue Funktion notwendig ist.

## 3. Layout

### Kopfzeile

- Kompakt und gut lesbar
- App-Name links
- «Veranstaltung melden» als klare, aber nicht überdimensionierte Aktion
- Bei kleinen Breiten kein horizontaler Überlauf

### Such- und Filterbereich

- Suchfeld prominent und leicht erreichbar
- Filter und Sortierung verständlich beschriftet
- Auf Mobilgeräten bevorzugt ein Sheet oder ein Dialog für umfangreiche Filter
- Aktive Filter optional als entfernbaren Chips anzeigen
- Filter einfach zurücksetzbar

### Veranstaltungsübersicht

- Klare, gut scannbare Karten
- Veranstaltungsname als primäre Information
- Datum als gut erkennbare sekundäre Information
- Ort nur anzeigen, wenn vorhanden
- Kartenabstände und Zeilenumbrüche für Touch-Bedienung optimieren
- Lange Vereins- und Veranstaltungstitel dürfen das Layout nicht beschädigen

### Detailansicht

- Mobile Sheet-/Drawer-Darstellung
- Klarer Titelbereich mit Schliessen-Schaltfläche
- Termine als separate, gut lesbare Einträge
- Externer Link als eindeutig beschriftete Aktion
- Auf kleinen Bildschirmen bei Bedarf intern scrollbar

### Footer

- Schlichte Links zu Datenschutz und Impressum
- Visuell nachrangig gegenüber der Veranstaltungsübersicht

## 4. Responsive Verhalten

- Zielbereich ab ungefähr 320 px Bildschirmbreite
- Keine unbeabsichtigten horizontalen Scrollleisten
- Auf breiten Bildschirmen eine sinnvolle maximale Inhaltsbreite nutzen
- Suchfeld und Bedienelemente auf schmalen Geräten ausreichend breit halten
- Buttons und interaktive Flächen bequem antippbar gestalten
- Keine Informationen ausschliesslich über Hover vermitteln

## 5. Accessibility

- Semantische HTML-Struktur verwenden.
- Alle interaktiven Elemente per Tastatur bedienbar machen.
- Sichtbare Fokuszustände beibehalten.
- Beschriftungen für Eingabefelder und Auswahlfelder bereitstellen.
- Für Sheet/Dialog geeignete Accessibility-Eigenschaften der vorhandenen UI-Bibliothek verwenden.
- Fokus beim Öffnen und Schliessen sinnvoll verwalten.
- Escape zum Schliessen unterstützen, wenn es zur verwendeten Dialogkomponente passt.
- Ausreichende Kontraste und verständliche Fehlermeldungen sicherstellen.
- Statusmeldungen wie «Daten werden geladen» zugänglich ausgeben.
- `prefers-reduced-motion` berücksichtigen.

## 6. Konsistenz

- Bestehende Button-, Card-, Input-, Sheet- und Dialogkomponenten verwenden.
- Keine unterschiedlichen visuellen Varianten für dieselbe Funktion ohne guten Grund.
- Icons nur dort einsetzen, wo ihre Bedeutung klar ist; wichtige Aktionen zusätzlich beschriften.
- Einfache, sachliche und verständliche deutsche Texte verwenden.
- Fehler- und Leerzustände sollen helfen, statt nur technische Fehlermeldungen auszugeben.

## 7. Zu vermeiden

- Keine Karte in Version 1.
- Keine übermässigen Animationen.
- Keine grossen Hero-Bereiche, die die Veranstaltungsliste nach unten verdrängen.
- Keine dekorativen Elemente, die auf Mobilgeräten Platz verschwenden.
- Keine vollständig klickbaren Container mit darin verschachtelten, konkurrierenden interaktiven Elementen.
- Keine neuen Designsysteme neben shadcn/ui.