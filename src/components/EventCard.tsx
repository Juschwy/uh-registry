import { CalendarDays, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getUpcomingCount, type Event } from '@/lib/eventData'

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

type EventCardProps = {
  event: Event
  now: Date
  onSelect: (eventId: string) => void
}

export function EventCard({ event, now, onSelect }: EventCardProps) {
  const upcomingCount = getUpcomingCount(event.dates, now)

  return (
    <Card
      key={event.id}
      className="cursor-pointer overflow-hidden border-border/80 bg-card transition-colors hover:border-primary/80 hover:bg-accent/20"
      onClick={() => onSelect(event.id)}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault()
          onSelect(event.id)
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={cn(event.imageUrl ? 'grid md:grid-cols-[220px_minmax(0,1fr)]' : 'block')}>
        {event.imageUrl && (
          <div className="relative h-44 w-full overflow-hidden bg-muted md:h-full md:min-h-[220px]">
            <img
              src={event.imageUrl}
              alt={`${event.title} Bild`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col">
          <CardHeader className={cn('space-y-3 pb-2', event.imageUrl ? 'pt-3' : 'pt-4')}>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="max-w-[70%] truncate">
                {event.organizer}
              </Badge>
              <Badge variant="default" className="whitespace-nowrap">
                {upcomingCount} {upcomingCount === 1 ? 'bevorstehend' : 'bevorstehend'}
              </Badge>
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
        </div>
      </div>
    </Card>
  )
}
