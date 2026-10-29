import { describe, expect, it } from 'vitest'
import {
  filterEventsByDateRange,
  getNextFutureDate,
  getVisibleEvents,
  parseCsvEvents,
  sortEvents,
} from './eventData'

describe('parseCsvEvents', () => {
  it('parses a normalized CSV with multiple dates and quoted fields', () => {
    const csv = `organizer,title,town,link,eventDatetime1,eventDatetime2,eventDatetime3
"TV Berlingen","Blind Donkey","Berlingen","https://www.tvberlingen.ch/","2026-11-20T20:00:00","2026-11-21T20:00:00","2026-11-22T20:00:00"`

    const events = parseCsvEvents(csv)

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      organizer: 'TV Berlingen',
      title: 'Blind Donkey',
      town: 'Berlingen',
      link: 'https://www.tvberlingen.ch/',
    })
    expect(events[0].dates).toEqual([
      { date: '2026-11-20', startTime: '20:00' },
      { date: '2026-11-21', startTime: '20:00' },
      { date: '2026-11-22', startTime: '20:00' },
    ])
  })

  it('skips invalid records and keeps valid dates from the same row', () => {
    const csv = `organizer,title,town,link,eventDatetime1,eventDatetime2,eventDatetime3
"","Valid title","Zurich","https://example.com","2027-01-01T19:00:00","2027-01-02T19:00:00",""
"TV Uster","Test Event","Uster","","bad-date","2027-02-03T18:30:00",""`

    const events = parseCsvEvents(csv)

    expect(events).toHaveLength(1)
    expect(events[0].organizer).toBe('TV Uster')
    expect(events[0].dates).toEqual([{ date: '2027-02-03', startTime: '18:30' }])
  })
})

describe('getVisibleEvents', () => {
  it('keeps only events with an upcoming valid date and respects date ranges', () => {
    const events = [
      {
        id: 'a',
        organizer: 'TV Berlingen',
        title: 'Blind Donkey',
        town: 'Berlingen',
        link: null,
        dates: [
          { date: '2020-11-20', startTime: '20:00' },
          { date: '2026-11-20', startTime: '20:00' },
        ],
      },
      {
        id: 'b',
        organizer: 'TV Zürich',
        title: 'Fasnachtsnacht',
        town: 'Zürich',
        link: null,
        dates: [{ date: '2027-02-01', startTime: '18:00' }],
      },
      {
        id: 'c',
        organizer: 'TV Winterthur',
        title: 'Past Event',
        town: null,
        link: null,
        dates: [{ date: '2022-01-10', startTime: '19:00' }],
      },
    ]

    const visible = getVisibleEvents(events, new Date('2026-01-01T00:00:00+01:00'))
    expect(visible.map((event) => event.id)).toEqual(['a', 'b'])

    const filtered = filterEventsByDateRange(visible, {
      from: '2026-11-19',
      to: '2026-11-21',
    })
    expect(filtered.map((event) => event.id)).toEqual(['a'])
  })
})

describe('sorting and date helpers', () => {
  it('sorts by next upcoming event and keeps ties stable', () => {
    const events = [
      {
        id: 'later',
        organizer: 'TV Nord',
        title: 'Event B',
        town: null,
        link: null,
        dates: [{ date: '2027-02-10', startTime: '18:00' }],
      },
      {
        id: 'earlier',
        organizer: 'TV Nord',
        title: 'Event A',
        town: null,
        link: null,
        dates: [{ date: '2027-01-10', startTime: '18:00' }],
      },
    ]

    const sorted = sortEvents(events, 'next-upcoming')
    expect(sorted.map((event) => event.id)).toEqual(['earlier', 'later'])
  })

  it('computes the next future date reliably', () => {
    const date = getNextFutureDate(
      [
        { date: '2020-01-01', startTime: '18:00' },
        { date: '2026-11-20', startTime: '20:00' },
        { date: '2026-11-21', startTime: '20:00' },
      ],
      new Date('2026-11-19T12:00:00+01:00'),
    )

    expect(date).toEqual({ date: '2026-11-20', startTime: '20:00' })
  })
})
