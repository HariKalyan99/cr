import { Clock, MapPin, Navigation, Shirt } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import type { WeddingEvent } from '../../data/types'
import { wedding } from '../../data/wedding'
import { formatDay, formatLongDate, formatMonth, formatTime, formatWeekday, istDateKey, isEventDayCurrent, nextDateKey, parseDate } from '../../lib/dates'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { directionsUrl } from '../../lib/links'
import type { CalendarEntry } from '../../lib/calendar'
import { CalendarMenu } from '../ui/CalendarMenu'
import { CornerFloral, EventMotifIcon } from '../ui/ornaments'
import { SampleNote } from '../ui/SampleNote'
import { SectionHeading } from '../ui/SectionHeading'

function useTodayKey() {
  const [today, setToday] = useState(() => istDateKey(new Date()))
  useEffect(() => {
    const tick = () => setToday(istDateKey(new Date()))
    const id = window.setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])
  return today
}

function timeText(event: WeddingEvent) {
  const start = parseDate(event.start)
  const end = parseDate(event.end)
  if (event.timeLabel) return event.timeLabel
  if (start && end) return `${formatTime(start)} – ${formatTime(end)} ${wedding.timeZoneLabel}`
  return 'Time to be shared'
}

/** A calendar hold for each celebration. Events without a printed finish run until the end of that day. */
function calendarEntry(event: WeddingEvent): CalendarEntry {
  const { partnerOne, partnerTwo } = wedding.couple
  const start = parseDate(event.start)
  const day = start ? istDateKey(start) : event.start.slice(0, 10)
  const description = [timeText(event), event.description, event.dressCode ? `Dress code: ${event.dressCode.label}` : ''].filter(Boolean).join('\n')
  const shared = {
    id: `${event.id}-${partnerOne}-${partnerTwo}`.toLowerCase().replace(/\s+/g, '-'),
    title: `${event.name} · ${partnerOne} & ${partnerTwo}`,
    location: `${event.venueName}, ${event.address}`,
    description,
  }
  if (event.end) return { ...shared, start: event.start, end: event.end }
  if (!event.timeLabel) return { ...shared, start: day, end: nextDateKey(day), allDay: true }
  return { ...shared, start: event.start, end: `${nextDateKey(day)}T00:00:00+05:30` }
}

function sameDay(events: WeddingEvent[]) {
  const keys = events.map((event) => {
    const start = parseDate(event.start)
    return start ? istDateKey(start) : ''
  })
  return keys.every((key) => key && key === keys[0])
}

function EventRow({ event, showDate }: { event: WeddingEvent; showDate: boolean }) {
  const start = parseDate(event.start)
  return (
    <li className="border-t border-gold/25 py-6 first:border-t-0 first:pt-0 sm:py-7">
      <div className="flex gap-3.5 sm:gap-5">
        <div
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-ivory sm:size-12"
          style={{ borderColor: event.accent, color: event.accent }}
        >
          <EventMotifIcon motif={event.motif} className="size-6 sm:size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="min-w-0">
              {showDate && start && (
                <p className="eyebrow" style={{ color: event.accent }}>
                  {formatWeekday(start)} · {formatLongDate(start)}
                </p>
              )}
              <h4 id={`event-${event.id}`} className="display text-[clamp(2rem,6vw,3.15rem)] leading-none text-ink">
                {event.name}
              </h4>
              <p className="mt-2 font-display text-lg text-ink-soft italic sm:text-xl">{event.tagline}</p>
              <dl className="mt-4 space-y-2.5 text-[0.95rem]">
                <div className="flex items-start gap-3">
                  <dt className="mt-1">
                    <Clock className="size-4 text-gold-deep" aria-hidden="true" />
                    <span className="sr-only">Time</span>
                  </dt>
                  <dd>{timeText(event)}</dd>
                </div>
                {event.dressCode && (
                  <div className="flex items-start gap-3">
                    <dt className="mt-1">
                      <Shirt className="size-4 text-gold-deep" aria-hidden="true" />
                      <span className="sr-only">Dress code</span>
                    </dt>
                    <dd className="flex flex-wrap items-center gap-3">
                      {event.dressCode.label}
                      <span className="flex -space-x-1" aria-hidden="true">
                        {event.dressCode.swatches.map((color) => (
                          <span key={color} className="size-4 rounded-full ring-2 ring-ivory" style={{ background: color }} />
                        ))}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-soft text-pretty">{event.description}</p>
            </div>
            <CalendarMenu className="btn btn-outline w-full lg:w-auto" menuClassName="left-0 lg:left-auto lg:right-0" entry={calendarEntry(event)} />
          </div>
        </div>
      </div>
    </li>
  )
}

function VenueGroup({ events }: { events: WeddingEvent[] }) {
  const first = events[0]
  const start = parseDate(first.start)
  const oneDay = sameDay(events)
  return (
    <li>
      <article className="relative overflow-hidden border border-gold/35 bg-paper/55 px-4 py-6 sm:px-8 sm:py-9" aria-labelledby={`venue-${first.id}`}>
        <CornerFloral src="/vines/6.svg" aria-hidden="true" className="pointer-events-none absolute top-0 right-0 size-16 opacity-80 sm:size-24" />
        <CornerFloral src="/vines/6.svg" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 size-16 -scale-100 opacity-80 sm:size-24" />
        <header className="relative z-[1] border-b border-gold/25 pb-6">
          <div className="min-w-0">
            {oneDay && start ? (
              <p className="display text-[clamp(4.25rem,16vw,6.5rem)] leading-[0.8]" style={{ color: first.accent }}>
                {formatDay(start)}
                <span className="mt-3 block font-sans text-[0.7rem] font-medium tracking-[0.28em] text-ink-soft uppercase sm:text-[0.75rem] sm:tracking-[0.36em]">
                  {formatMonth(start)} · {formatWeekday(start)}
                </span>
              </p>
            ) : (
              <ul className="flex flex-wrap gap-x-8 gap-y-4">
                {events.map((event) => {
                  const date = parseDate(event.start)
                  if (!date) return null
                  return (
                    <li key={event.id}>
                      <p className="display text-[clamp(3.25rem,10vw,4.5rem)] leading-[0.8]" style={{ color: event.accent }}>
                        {formatDay(date)}
                      </p>
                      <p className="mt-2 text-[0.68rem] tracking-[0.22em] text-ink-soft uppercase">
                        {formatWeekday(date)} · {formatMonth(date)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </header>
        <ul className="relative z-[1] mt-6">
          {events.map((event) => (
            <EventRow key={event.id} event={event} showDate={!oneDay} />
          ))}
        </ul>
        <footer className="relative z-[1] mt-2 flex flex-col gap-4 border-t border-gold/25 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 id={`venue-${first.id}`} className="display text-[clamp(1.7rem,4vw,2.4rem)] text-ink">
              {first.venueName}
            </h3>
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-ink-soft text-pretty">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
              {first.address}
            </p>
          </div>
          <a href={first.mapsUrl ?? directionsUrl(first.mapsQuery)} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full sm:w-auto">
            <Navigation className="size-4" aria-hidden="true" />
            Directions
            <span className="sr-only"> to {first.venueName} (opens Google Maps)</span>
          </a>
        </footer>
      </article>
    </li>
  )
}

export function WeddingEvents() {
  const root = useRef<HTMLElement>(null)
  const today = useTodayKey()
  useScrollReveal(root)

  const upcoming = wedding.events.filter((event) => isEventDayCurrent(event.start, new Date(`${today}T12:00:00+05:30`)))
  const groups: WeddingEvent[][] = []
  for (const event of upcoming) {
    const last = groups[groups.length - 1]
    if (last && last[0].venueName === event.venueName) last.push(event)
    else groups.push([event])
  }

  return (
    <section id="events" ref={root} aria-labelledby="events-title" className="paper-grain relative overflow-hidden bg-ivory pt-[clamp(5.5rem,13vw,11rem)] pb-[max(7.5rem,calc(env(safe-area-inset-bottom)+6rem))]">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-10">
        <SectionHeading
          id="events-title"
          eyebrow="Three days of celebration"
          title="The Celebrations"
          lede="Haldi, Mehendi and Sangeet share Tuesday at the farm house. The reception and the Muhurtham share S B Convention Hall."
        />
        <div className="mt-6 flex justify-center">
          <SampleNote />
        </div>

        {groups.length > 0 ? (
          <ol className="mt-14 space-y-8 sm:mt-20 sm:space-y-12">
            {groups.map((events) => (
              <VenueGroup key={events[0].venueName} events={events} />
            ))}
          </ol>
        ) : (
          <p className="mt-16 text-center font-display text-2xl text-ink-soft italic">These celebrations have passed.</p>
        )}
      </div>
    </section>
  )
}
