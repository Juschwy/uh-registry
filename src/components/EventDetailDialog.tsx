import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getUpcomingCount, type Event } from '@/lib/eventData'

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

type EventDetailDialogProps = {
  selectedEvent: Event | null
  now: Date
  onClose: () => void
}

export function EventDetailDialog({ selectedEvent, now, onClose }: EventDetailDialogProps) {
  const selectedEventMapsUrl = selectedEvent?.town
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.town)}`
    : null

  return (
    <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border bg-card p-0 shadow-sm sm:max-w-[640px]">
        {selectedEvent && (
          <div className={selectedEvent.imageUrl ? 'grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]' : 'space-y-5 p-4 sm:p-5'}>
            {selectedEvent.imageUrl && (
              <div className="relative h-44 w-full overflow-hidden bg-muted md:h-full md:min-h-[260px]">
                <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="space-y-5 p-4 sm:p-5">
              <DialogHeader className="space-y-3 pb-0">
                <DialogDescription className="text-left text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                  {selectedEvent.organizer}
                </DialogDescription>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-[2rem]">
                      {selectedEvent.title}
                    </DialogTitle>
                  </div>

                  <Badge variant="default" className="whitespace-nowrap self-start">
                    {getUpcomingCount(selectedEvent.dates, now)} noch offen
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <ul className="space-y-2.5">
                  {selectedEvent.dates.map((date) => {
                    const isPast = new Date(`${date.date}T${date.startTime}:00`).getTime() < now.getTime()
                    return (
                      <li
                        key={`${selectedEvent.id}-${date.date}-${date.startTime}`}
                        className="flex flex-col gap-2 border bg-muted/30 px-3 py-2.5 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="leading-relaxed">{formatDetailDate(date.date, date.startTime)}</span>
                        {isPast ? (
                          <Badge variant="outline" className="w-fit">
                            Vergangen
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">
                            Bevorstehend
                          </Badge>
                        )}
                      </li>
                    )
                  })}
                </ul>

                {selectedEvent.town && selectedEventMapsUrl && (
                  <a
                    href={selectedEventMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.town}</span>
                  </a>
                )}

                {selectedEvent.websiteUrl && (
                  <a
                    href={selectedEvent.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: 'default' }) + ' inline-flex w-full justify-center'}
                  >
                    Weitere Informationen
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
