import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { APP_NAME, CSV_URL, FORM_URL } from './config'
import {
  type Event,
  type EventSortMode,
  filterEventsByDateRange,
  getVisibleEvents,
  parseCsvEvents,
  sortEvents,
} from './lib/eventData'

const CACHE_KEY = 'uh-register-cache-v1'

const SORT_OPTIONS: Array<{ value: EventSortMode; label: string }> = [
  { value: 'next-upcoming', label: 'Nachster Termin' },
  { value: 'latest-upcoming', label: 'Spatester Termin' },
  { value: 'organizer', label: 'Organisator A-Z' },
  { value: 'title', label: 'Titel A-Z' },
]

const normalizeSearchTerm = (value: string): string =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const formatDateOnly = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const formatCardDate = (dates: Event['dates']): string => {
  if (!dates.length) return 'Ohne Termin'

  const sortedDates = [...dates].sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  )
  const first = sortedDates[0]
  const last = sortedDates[sortedDates.length - 1]

  if (sortedDates.length === 1) return formatDateOnly(first.date)
  return `${formatDateOnly(first.date)} – ${formatDateOnly(last.date)}`
}

const toIsoDate = (value: Date): string => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const toComparableDateTime = (value: string, time: string): number => {
  const [year, month, day] = value.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)

  return year * 100000000 + month * 1000000 + day * 10000 + hours * 100 + minutes
}

const formatDetailDate = (value: string, time: string): string => {
  const [year, month, day] = value.split('-').map(Number)
  const eventDate = new Date(year, month - 1, day)
  const dateText = new Intl.DateTimeFormat('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(eventDate)

  return `${dateText} · ${time} Uhr`
}

function App() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMode, setSortMode] = useState<EventSortMode>('next-upcoming')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [legalDialog, setLegalDialog] = useState<'privacy' | 'imprint' | null>(null)
  /* oxlint-disable-next-line react/purity */
  const now = useMemo(() => new Date(), [])

  const loadEvents = useCallback(async () => {
    let hasCachedData = false
    const cachedValue = localStorage.getItem(CACHE_KEY)

    if (cachedValue) {
      try {
        const parsed = JSON.parse(cachedValue) as Event[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          hasCachedData = true
          setEvents(parsed)
        }
      } catch {
        // Ignore invalid cache content.
      }
    }

    try {
      const response = await fetch(CSV_URL, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('CSV konnte nicht geladen werden')
      }

      const csvText = await response.text()
      const parsedEvents = parseCsvEvents(csvText)
      setEvents(parsedEvents)
      setError(null)

      if (parsedEvents.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsedEvents))
      }
    } catch {
      if (hasCachedData || localStorage.getItem(CACHE_KEY)) {
        setError('Die Daten konnten nicht aktualisiert werden. Die zuletzt gespeicherten Veranstaltungen bleiben sichtbar.')
      } else {
        setError('Aktuell sind keine gültigen Veranstaltungen verfügbar. Bitte später erneut versuchen.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    const runLoad = async () => {
      await loadEvents()
    }

    void runLoad()
  }, [loadEvents])

  const filteredEvents = useMemo(() => {
    const visibleEvents = getVisibleEvents(events, now)
    const dateFiltered = filterEventsByDateRange(visibleEvents, {
      from: fromDate || null,
      to: toDate || null,
    })

    const searchText = normalizeSearchTerm(searchTerm)
    const finalEvents = dateFiltered.filter((event) => {
      if (!searchText) return true
      const haystack = normalizeSearchTerm(`${event.organizer} ${event.title} ${event.town ?? ''}`)
      return haystack.includes(searchText)
    })

    return sortEvents(finalEvents, sortMode)
  }, [events, fromDate, now, searchTerm, sortMode, toDate])

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  )

  const selectedEventMapsUrl = selectedEvent?.town
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.town)}`
    : null

  const hasActiveFilters = Boolean(searchTerm || fromDate || toDate || sortMode !== 'next-upcoming')
  const currentSortLabel = SORT_OPTIONS.find((option) => option.value === sortMode)?.label ?? 'Nachster Termin'
  const nowComparable = toComparableDateTime(toIsoDate(now), now.toTimeString().slice(0, 5))

  const eventStatusMap = useMemo(
    () =>
      new Map(
        events.map((event) => [
          event.id,
          event.dates.some((date) => toComparableDateTime(date.date, date.startTime) < nowComparable),
        ]),
      ),
    [events, nowComparable],
  )

  const resetFilters = () => {
    setSearchTerm('')
    setFromDate('')
    setToDate('')
    setSortMode('next-upcoming')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-3 sm:p-6">
        <header className="border bg-card p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{APP_NAME}</h1>

            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: 'sm' }) + ' shrink-0'}
            >
              Melden
            </a>
          </div>
        </header>

        <section className="border bg-card p-3 shadow-sm sm:p-4" aria-label="Suche und Filter">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              {events.length > 0 && !loading && (
                <Badge variant="secondary" className="shrink-0">
                  {filteredEvents.length} Treffer
                </Badge>
              )}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Suchen nach Verein, Titel oder Ort"
                aria-label="Suchen nach Verein, Titel oder Ort"
                className="h-11 pl-9 text-sm"
              />
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Von</label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      'flex h-11 w-full items-center justify-between border border-input bg-background px-3 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                      !fromDate ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    <span>{fromDate ? formatDateOnly(fromDate) : 'Datum wählen'}</span>
                    <CalendarDays className="h-4 w-4 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate ? new Date(`${fromDate}T12:00:00`) : undefined}
                      onSelect={(date) => setFromDate(date ? toIsoDate(date) : '')}
                      disabled={(date) => (toDate ? date > new Date(`${toDate}T12:00:00`) : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Bis</label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      'flex h-11 w-full items-center justify-between border border-input bg-background px-3 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                      !toDate ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    <span>{toDate ? formatDateOnly(toDate) : 'Datum wählen'}</span>
                    <CalendarDays className="h-4 w-4 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate ? new Date(`${toDate}T12:00:00`) : undefined}
                      onSelect={(date) => setToDate(date ? toIsoDate(date) : '')}
                      disabled={(date) => (fromDate ? date < new Date(`${fromDate}T12:00:00`) : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Sortieren</label>
                <Select value={sortMode} onValueChange={(value) => setSortMode(value as EventSortMode)}>
                  <SelectTrigger className="h-11 w-full border-input bg-background text-sm shadow-none">
                    <span aria-live="polite">{currentSortLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" className="w-fit gap-2 py-1.5" onClick={resetFilters}>
                <SlidersHorizontal className="h-4 w-4" />
                Filter zurücksetzen
              </Button>
            )}
          </div>
        </section>

        {loading && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Veranstaltungen werden geladen…
            </CardContent>
          </Card>
        )}

        {!loading && error && events.length === 0 && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && events.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Keine gültigen Veranstaltungen gefunden.
            </CardContent>
          </Card>
        )}

        {!loading && filteredEvents.length > 0 && (
          <section className="space-y-3" aria-live="polite">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">Nächste Termine</p>
              <p className="text-xs text-muted-foreground">{filteredEvents.length} gesamt</p>
            </div>

            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const isPast = eventStatusMap.get(event.id) ?? false

                return (
                  <Card
                    key={event.id}
                    className="cursor-pointer border-border/80 bg-card transition-colors hover:border-primary/80 hover:bg-accent/20"
                    onClick={() => setSelectedEventId(event.id)}
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                        keyboardEvent.preventDefault()
                        setSelectedEventId(event.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="max-w-[70%] truncate">
                          {event.organizer}
                        </Badge>
                        {isPast && <Badge variant="outline">Vergangen</Badge>}
                      </div>
                      <CardTitle className="text-xl leading-tight text-foreground">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5 pb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>{formatCardDate(event.dates)}</span>
                      </div>
                      {event.town && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.town}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {!loading && filteredEvents.length === 0 && events.length > 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Keine passenden Veranstaltungen gefunden.
            </CardContent>
          </Card>
        )}

        <footer className="flex flex-wrap items-center justify-center gap-4 border bg-card p-3 text-sm text-muted-foreground shadow-sm">
          <p>UH-Register</p>
        </footer>
      </div>

      <Dialog open={Boolean(legalDialog)} onOpenChange={(open) => !open && setLegalDialog(null)}>
        <DialogContent className="sm:max-w-lg border bg-card p-6 shadow-sm">
          {legalDialog === 'privacy' && (
            <>
              <DialogHeader>
                <DialogTitle>Datenschutz</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Diese Anwendung verarbeitet nur kurzfristig Daten im Browser, um Veranstaltungen anzuzeigen.</p>
                <p>Lokale Zwischenspeicherungen dienen nur der Anzeige und werden nicht an einen Server gesendet.</p>
                <p>Falls externe Formulare oder Karten verwendet werden, gelten die jeweiligen Datenschutzbestimmungen dieser Dienste.</p>
              </div>
            </>
          )}

          {legalDialog === 'imprint' && (
            <>
              <DialogHeader>
                <DialogTitle>Impressum</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>UH-Register</p>
                <p>Beispielstrasse 1</p>
                <p>1010 Beispielstadt</p>
                <p>E-Mail: kontakt@example.com</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && setSelectedEventId(null)}>
        <DialogContent className="sm:max-w-[560px] border bg-card p-6 shadow-sm">
          {selectedEvent && (
            <>
              <DialogHeader className="space-y-3 pb-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-foreground">
                      {selectedEvent.title}
                    </DialogTitle>
                  </div>
                  {selectedEvent.dates.some((date) => new Date(`${date.date}T${date.startTime}:00`).getTime() < now.getTime()) && (
                    <Badge variant="outline">Vergangen</Badge>
                  )}
                </div>
                <DialogDescription className="text-left text-base text-muted-foreground">
                  {selectedEvent.organizer}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pb-2">
                <ul className="space-y-2">
                  {selectedEvent.dates.map((date) => {
                    const isPast = new Date(`${date.date}T${date.startTime}:00`).getTime() < now.getTime()
                    return (
                      <li
                        key={`${selectedEvent.id}-${date.date}-${date.startTime}`}
                        className="flex items-center justify-between gap-2 border bg-muted/30 px-3 py-2.5 text-sm text-foreground"
                      >
                        <span>{formatDetailDate(date.date, date.startTime)}</span>
                        {isPast && <Badge variant="outline">Vergangen</Badge>}
                      </li>
                    )
                  })}
                </ul>

                {selectedEvent.town && selectedEventMapsUrl && (
                  <a
                    href={selectedEventMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.town}</span>
                  </a>
                )}

                {selectedEvent.link && (
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: 'default' }) + ' inline-flex w-full justify-center'}
                  >
                    Weitere Informationen
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
