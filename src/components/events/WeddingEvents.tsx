import { Clock, MapPin, Navigation, Shirt } from 'lucide-react'
import { useRef } from 'react'
import type { WeddingEvent } from '../../data/types'
import { wedding } from '../../data/wedding'
import { formatDay, formatLongDate, formatMonth, formatTime, formatWeekday, parseDate } from '../../lib/dates'
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap'
import { directionsUrl } from '../../lib/links'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { CalendarMenu } from '../ui/CalendarMenu'
import { CornerFloral, EventMotifIcon } from '../ui/ornaments'
import { SampleNote } from '../ui/SampleNote'
import { SectionHeading } from '../ui/SectionHeading'

function EventItem({ event, index }: { event: WeddingEvent; index: number }) {
  const start = parseDate(event.start)
  const end = parseDate(event.end)
  const right = index % 2 === 1
  const { partnerOne, partnerTwo } = wedding.couple

  return (
    <li className="relative grid gap-8 pl-16 sm:pl-24 lg:grid-cols-2 lg:gap-24 lg:pl-0">
      {/* Medallion on the thread */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 flex size-12 items-center justify-center rounded-full border bg-ivory shadow-[0_0_0_6px_var(--color-ivory)] sm:left-3 sm:size-14 lg:left-1/2 lg:size-16 lg:-translate-x-1/2"
        style={{ borderColor: event.accent, color: event.accent }}
        data-reveal
      >
        <EventMotifIcon motif={event.motif} className="size-7 sm:size-8 lg:size-9" />
      </div>

      {/* Editorial date (desktop) */}
      <div aria-hidden="true" className={`hidden lg:flex lg:flex-col ${right ? 'lg:order-1 lg:items-end lg:text-right' : 'lg:order-2 lg:items-start'}`} data-reveal data-reveal-delay="0.1">
        {start && (
          <>
            <span className="display text-[10rem] leading-[0.8]" style={{ color: event.accent, opacity: 0.85 }}>
              {formatDay(start)}
            </span>
            <span className="mt-4 text-[0.75rem] tracking-[0.4em] text-ink-soft uppercase">
              {formatMonth(start)} · {formatWeekday(start)}
            </span>
          </>
        )}
      </div>

      <article className={right ? 'lg:order-2' : 'lg:order-1 lg:text-right'} aria-labelledby={`event-${event.id}`}>
        <p className="eyebrow" data-reveal style={{ color: event.accent }}>
          {start ? `${formatWeekday(start)} · ${formatLongDate(start)}` : 'Date to be announced'}
        </p>
        <h3 id={`event-${event.id}`} className="display mt-3 text-[clamp(3rem,8vw,4.75rem)] text-ink" data-reveal data-reveal-delay="0.05">
          {event.name}
        </h3>
        <p className="mt-1 font-display text-xl text-ink-soft italic" data-reveal data-reveal-delay="0.1">
          {event.tagline}
        </p>

        <dl className={`mt-7 space-y-3 text-[0.95rem] ${right ? '' : 'lg:ml-auto'} max-w-md`} data-reveal data-reveal-delay="0.15">
          <div className={`flex items-start gap-3 ${right ? '' : 'lg:flex-row-reverse'}`}>
            <dt className="mt-1">
              <Clock className="size-4 text-gold-deep" aria-hidden="true" />
              <span className="sr-only">Time</span>
            </dt>
            <dd>{start && end ? `${formatTime(start)} – ${formatTime(end)} ${wedding.timeZoneLabel}` : 'Time to be announced'}</dd>
          </div>
          <div className={`flex items-start gap-3 ${right ? '' : 'lg:flex-row-reverse'}`}>
            <dt className="mt-1">
              <MapPin className="size-4 text-gold-deep" aria-hidden="true" />
              <span className="sr-only">Venue</span>
            </dt>
            <dd>
              {event.space} · {event.venueName}
            </dd>
          </div>
          {event.dressCode && (
            <div className={`flex items-start gap-3 ${right ? '' : 'lg:flex-row-reverse'}`}>
              <dt className="mt-1">
                <Shirt className="size-4 text-gold-deep" aria-hidden="true" />
                <span className="sr-only">Dress code</span>
              </dt>
              <dd className={`flex flex-wrap items-center gap-3 ${right ? '' : 'lg:flex-row-reverse'}`}>
                {event.dressCode.label}
                <span className="flex -space-x-1" aria-hidden="true">
                  {event.dressCode.swatches.map((c) => (
                    <span key={c} className="size-4 rounded-full ring-2 ring-ivory" style={{ background: c }} />
                  ))}
                </span>
              </dd>
            </div>
          )}
        </dl>

        <p className={`mt-6 max-w-md leading-relaxed text-ink-soft text-pretty ${right ? '' : 'lg:ml-auto'}`} data-reveal data-reveal-delay="0.2">
          {event.description}
        </p>

        <div className={`mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap ${right ? '' : 'lg:justify-end'}`} data-reveal data-reveal-delay="0.25">
          <a href={directionsUrl(event.mapsQuery)} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full sm:w-auto">
            <Navigation className="size-4" aria-hidden="true" />
            Directions
            <span className="sr-only">to {event.name} (opens Google Maps)</span>
          </a>
          <CalendarMenu
            className="btn btn-outline w-full sm:w-auto"
            entry={{
              id: `${event.id}-${partnerOne}-${partnerTwo}`.toLowerCase(),
              title: `${event.name} · ${partnerOne} & ${partnerTwo}`,
              start: event.start,
              end: event.end,
              location: `${event.space}, ${event.address}`,
              description: `${event.description}${event.dressCode ? `\nDress code: ${event.dressCode.label}` : ''}`,
            }}
          />
        </div>
      </article>
    </li>
  )
}

export function WeddingEvents() {
  const root = useRef<HTMLElement>(null)
  useScrollReveal(root)

  // The gold thread draws itself as the guest scrolls through the schedule.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-thread]',
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-thread-track]', start: 'top 70%', end: 'bottom 70%', scrub: 0.5 } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section id="events" ref={root} aria-labelledby="events-title" className="paper-grain relative overflow-hidden bg-ivory py-[clamp(5.5rem,13vw,11rem)]">
      <CornerFloral src="/vines/6.svg" aria-hidden="true" className="pointer-events-none absolute top-5 right-3 size-14 opacity-75 sm:top-8 sm:right-6 sm:size-24" />
      <CornerFloral src="/vines/6.svg" aria-hidden="true" className="pointer-events-none absolute bottom-5 left-3 size-14 -scale-100 opacity-75 sm:bottom-8 sm:left-6 sm:size-24" />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <SectionHeading
          id="events-title"
          eyebrow="Four celebrations, one forever"
          title="The Celebrations"
          lede="From henna to the sacred vows — every gathering is a chapter we hope to share with you."
        />
        <div className="mt-6 flex justify-center">
          <SampleNote />
        </div>

        <div data-thread-track className="relative mt-20 sm:mt-28">
          <div aria-hidden="true" className="absolute top-2 bottom-0 left-6 w-px bg-gold/20 sm:left-10 lg:left-1/2">
            <div data-thread className="size-full origin-top bg-gradient-to-b from-gold via-gold to-gold/0" />
          </div>
          <ol className="space-y-24 lg:space-y-36">
            {wedding.events.map((event, i) => (
              <EventItem key={event.id} event={event} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
