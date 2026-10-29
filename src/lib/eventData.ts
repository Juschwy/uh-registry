import Papa from 'papaparse'

export type EventDate = {
  date: string
  startTime: string
}

export type Event = {
  id: string
  organizer: string
  title: string
  town: string | null
  link: string | null
  dates: EventDate[]
}

export type DateRange = {
  from: string | null
  to: string | null
}

export type EventSortMode = 'next-upcoming' | 'latest-upcoming' | 'organizer' | 'title'

const sanitizeLink = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

const isValidDateString = (value: string | null | undefined): value is string => {
  if (!value || typeof value !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value.trim())) return false

  const date = new Date(`${value}Z`)
  return !Number.isNaN(date.getTime())
}

const parseEventDate = (value: string | null | undefined): EventDate | null => {
  if (!isValidDateString(value)) return null

  const raw = value.trim()
  const datePart = raw.slice(0, 10)
  const timePart = raw.slice(11, 16)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null
  if (!/^\d{2}:\d{2}$/.test(timePart)) return null

  return { date: datePart, startTime: timePart }
}

const toDeterministicId = (organizer: string, title: string, index: number): string => {
  const base = `${organizer}-${title}-${index}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `event-${index}`
}

const sortDatesAscending = (dates: EventDate[]): EventDate[] =>
  [...dates].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.startTime.localeCompare(b.startTime)
  })

export const getNextFutureDate = (
  dates: EventDate[],
  now: Date = new Date(),
): EventDate | null => {
  const futureDates = dates
    .map((date) => ({
      ...date,
      combined: new Date(`${date.date}T${date.startTime}:00`),
    }))
    .filter((entry) => entry.combined.getTime() >= now.getTime())
    .sort((a, b) => a.combined.getTime() - b.combined.getTime())

  return futureDates[0] ? { date: futureDates[0].date, startTime: futureDates[0].startTime } : null
}

export const parseCsvEvents = (csvText: string): Event[] => {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  })

  if (parsed.errors.length > 0) {
    const relevantFirstError = parsed.errors[0]
    if (relevantFirstError.type !== 'FieldMismatch') {
      // Ignore parse warnings where the data is still usable.
    }
  }

  const records = parsed.data
    .map((row: Record<string, string>, index: number) => {
      const organizer = (row.organizer ?? '').trim()
      const title = (row.title ?? '').trim()
      if (!organizer || !title) return null

      const cleaned = {
        organizer,
        title,
        town: (row.town ?? '').trim() || null,
        link: sanitizeLink((row.link ?? '').trim() || null),
      }

      const dates = [
        row.eventDatetime1,
        row.eventDatetime2,
        row.eventDatetime3,
        row.eventDatetime4,
        row.eventDatetime5,
      ]
        .map((value) => parseEventDate(value))
        .filter((value): value is EventDate => value !== null)

      if (dates.length === 0) return null

      return {
        id: toDeterministicId(cleaned.organizer, cleaned.title, index),
        ...cleaned,
        dates: sortDatesAscending(dates),
      }
    })
    .filter((event: Event | null): event is Event => event !== null)

  return records
}

export const getVisibleEvents = (events: Event[], now: Date = new Date()): Event[] =>
  events.filter((event) => {
    const next = getNextFutureDate(event.dates, now)
    return next !== null
  })

export const filterEventsByDateRange = (
  events: Event[],
  range: DateRange,
): Event[] => {
  const from = range.from ? new Date(`${range.from}T00:00:00`) : null
  const to = range.to ? new Date(`${range.to}T23:59:59`) : null

  return events.filter((event) =>
    event.dates.some((candidate) => {
      const eventDate = new Date(`${candidate.date}T${candidate.startTime}:00`)
      if (from && eventDate < from) return false
      if (to && eventDate > to) return false
      return true
    }),
  )
}

export const sortEvents = (events: Event[], mode: EventSortMode): Event[] => {
  const sorted = [...events]

  switch (mode) {
    case 'latest-upcoming':
      return sorted.sort((a, b) => {
        const aNext = getNextFutureDate(a.dates)
        const bNext = getNextFutureDate(b.dates)
        const aValue = aNext ? new Date(`${aNext.date}T${aNext.startTime}:00`).getTime() : Number.MAX_SAFE_INTEGER
        const bValue = bNext ? new Date(`${bNext.date}T${bNext.startTime}:00`).getTime() : Number.MAX_SAFE_INTEGER
        return bValue - aValue
      })
    case 'organizer':
      return sorted.sort((a, b) => {
        const organizerCompare = a.organizer.localeCompare(b.organizer, 'de-CH', { sensitivity: 'base' })
        if (organizerCompare !== 0) return organizerCompare
        return a.title.localeCompare(b.title, 'de-CH', { sensitivity: 'base' })
      })
    case 'title':
      return sorted.sort((a, b) => {
        const titleCompare = a.title.localeCompare(b.title, 'de-CH', { sensitivity: 'base' })
        if (titleCompare !== 0) return titleCompare
        return a.organizer.localeCompare(b.organizer, 'de-CH', { sensitivity: 'base' })
      })
    case 'next-upcoming':
    default:
      return sorted.sort((a, b) => {
        const aNext = getNextFutureDate(a.dates)
        const bNext = getNextFutureDate(b.dates)
        const aValue = aNext ? new Date(`${aNext.date}T${aNext.startTime}:00`).getTime() : Number.MAX_SAFE_INTEGER
        const bValue = bNext ? new Date(`${bNext.date}T${bNext.startTime}:00`).getTime() : Number.MAX_SAFE_INTEGER
        return aValue - bValue
      })
  }
}

export const buildEventSummary = (dates: EventDate[], now: Date = new Date()): string => {
  const next = getNextFutureDate(dates, now)
  if (!next) return 'Keine zukünftigen Termine'
  return `${next.date} ${next.startTime}`
}
