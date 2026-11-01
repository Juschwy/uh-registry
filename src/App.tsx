import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, LoaderCircle, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { APP_LOGO_URL, APP_NAME, CSV_URL, FORM_URL } from './config'
import { EventCard } from './components/EventCard'
import { EventDetailDialog } from './components/EventDetailDialog'
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
  { value: 'next-upcoming', label: 'Nächster Termin' },
  { value: 'latest-upcoming', label: 'Spätester Termin' },
  { value: 'organizer', label: 'Organisator A-Z' },
  { value: 'title', label: 'Titel A-Z' },
]

const getTodayIso = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

const toIsoDate = (value: Date): string => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function App() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMode, setSortMode] = useState<EventSortMode>('next-upcoming')
  const [fromDate, setFromDate] = useState<string>(getTodayIso())
  const [toDate, setToDate] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [legalDialog, setLegalDialog] = useState<'privacy' | 'imprint' | null>(null)
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

  useEffect(() => {
    void loadEvents()
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

  const hasActiveFilters = Boolean(
    searchTerm || toDate || fromDate !== getTodayIso() || sortMode !== 'next-upcoming',
  )
  const currentSortLabel = SORT_OPTIONS.find((option) => option.value === sortMode)?.label ?? 'Nächster Termin'

  const resetFilters = () => {
    setSearchTerm('')
    setFromDate(getTodayIso())
    setToDate('')
    setSortMode('next-upcoming')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-3 sm:p-6">
        <header className="border bg-card p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src={APP_LOGO_URL} alt={`${APP_NAME} Logo`} className="h-9 w-9 rounded-md object-cover" />
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-2xl">{APP_NAME}</h1>
            </div>

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

              <div>
                <label className="text-xs font-medium text-muted-foreground">Sortieren</label>
                <Select value={sortMode} onValueChange={(value) => setSortMode(value as EventSortMode)}>
                  <SelectTrigger className="h-11 w-full border-input bg-background p-3 text-sm shadow-none">
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
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center text-sm text-muted-foreground">
              <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              <span>Veranstaltungen werden geladen…</span>
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" onClick={() => void loadEvents()}>
                Erneut versuchen
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && events.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Keine gültigen Veranstaltungen gefunden.
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <section className="space-y-3" aria-live="polite">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">Nächste Termine</p>
              <p className="text-xs text-muted-foreground">{filteredEvents.length} Treffer</p>
            </div>

            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} now={now} onSelect={setSelectedEventId} />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && filteredEvents.length === 0 && events.length > 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Keine passenden Veranstaltungen gefunden.
            </CardContent>
          </Card>
        )}

        <footer className="flex flex-wrap items-center justify-center gap-4 border bg-card p-3 text-sm text-muted-foreground shadow-sm">
          <button type="button" onClick={() => setLegalDialog('privacy')} className="transition-colors hover:text-foreground">
            Datenschutz
          </button>
          <button type="button" onClick={() => setLegalDialog('imprint')} className="transition-colors hover:text-foreground">
            Impressum
          </button>
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

      <EventDetailDialog selectedEvent={selectedEvent} now={now} onClose={() => setSelectedEventId(null)} />
    </div>
  )
}

export default App
