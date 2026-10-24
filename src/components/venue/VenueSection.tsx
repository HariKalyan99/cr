import { Car, ExternalLink, Hotel, MapPinned, Navigation, Plane, TrainFront, TramFront } from 'lucide-react'
import { useRef, useState } from 'react'
import type { TravelInfo } from '../../data/types'
import { wedding } from '../../data/wedding'
import { directionsUrl, mapEmbedUrl, mapSearchUrl } from '../../lib/links'
import { useReducedMotionPref } from '../../hooks/useMediaQuery'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { CornerFloral } from '../ui/ornaments'
import { SampleNote } from '../ui/SampleNote'
import { SectionHeading } from '../ui/SectionHeading'

const TRAVEL_ICONS: Record<TravelInfo['kind'], typeof Plane> = {
  airport: Plane,
  rail: TrainFront,
  metro: TramFront,
  road: Car,
  stay: Hotel,
}

/** Decorative, clearly-labelled map illustration — not a real map. */
function MapIllustration({ name, animate }: { name: string; animate: boolean }) {
  return (
    <svg viewBox="0 0 600 450" className="size-full" role="img" aria-label={`Decorative illustration marking ${name}. Not to scale.`}>
      <defs>
        <pattern id="map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0H0V30" fill="none" stroke="#b8924a" strokeOpacity="0.1" />
        </pattern>
        <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5e1a2c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5e1a2c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="450" fill="#f1e7d4" />
      <rect width="600" height="450" fill="url(#map-grid)" />
      {/* parks and water */}
      <path d="M40 300 C90 260 170 270 200 320 C220 360 160 410 90 400 C40 392 20 340 40 300Z" fill="#c9cfae" fillOpacity="0.55" />
      <path d="M380 60 C430 40 520 50 540 100 C556 140 500 170 440 160 C390 150 350 90 380 60Z" fill="#c9cfae" fillOpacity="0.5" />
      <path d="M470 280 C520 270 570 300 575 340 C580 380 530 410 490 395 C450 380 430 300 470 280Z" fill="#b9cbd0" fillOpacity="0.6" />
      {/* roads */}
      <g fill="none" stroke="#fffaf0" strokeLinecap="round">
        <path d="M-10 210 C120 190 220 240 300 225 C400 205 480 150 610 170" strokeWidth="14" />
        <path d="M300 -10 C290 90 320 160 300 225 C285 300 310 380 290 460" strokeWidth="12" />
        <path d="M60 -10 C90 120 150 180 300 225" strokeWidth="7" />
        <path d="M300 225 C380 260 420 330 520 460" strokeWidth="7" />
        <path d="M-10 90 C120 110 220 70 360 40" strokeWidth="5" />
        <path d="M120 460 C150 380 200 330 300 225" strokeWidth="5" />
      </g>
      <g fill="none" stroke="#b8924a" strokeOpacity="0.35" strokeLinecap="round">
        <path d="M-10 210 C120 190 220 240 300 225 C400 205 480 150 610 170" strokeWidth="1" strokeDasharray="6 8" />
        <path d="M300 -10 C290 90 320 160 300 225 C285 300 310 380 290 460" strokeWidth="1" strokeDasharray="6 8" />
      </g>
      {/* compass */}
      <g transform="translate(70 70)" stroke="#85652b" fill="none">
        <circle r="26" strokeOpacity="0.5" />
        <path d="M0 -22 L6 0 L0 22 L-6 0Z" fill="#b8924a" fillOpacity="0.5" />
        <text y="-32" textAnchor="middle" fontSize="11" fill="#85652b" stroke="none" fontFamily="var(--font-sans)" letterSpacing="2">N</text>
      </g>
      {/* pin */}
      <circle cx="300" cy="225" r="90" fill="url(#map-glow)" />
      <circle cx="300" cy="225" r="34" fill="none" stroke="#5e1a2c" strokeOpacity="0.35">
        {animate && (
          <>
            <animate attributeName="r" values="18;42;18" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="3.2s" repeatCount="indefinite" />
          </>
        )}
      </circle>
      <path d="M300 236 C300 236 278 210 278 194 C278 181 288 172 300 172 C312 172 322 181 322 194 C322 210 300 236 300 236Z" fill="#5e1a2c" />
      <circle cx="300" cy="194" r="7" fill="#e6cd92" />
      <rect x="226" y="246" width="148" height="30" rx="15" fill="#fbf6ec" stroke="#b8924a" strokeOpacity="0.6" />
      <text x="300" y="266" textAnchor="middle" fontSize="13" fill="#2a1e1b" fontFamily="var(--font-display)" fontStyle="italic">
        {name}
      </text>
    </svg>
  )
}

export function VenueSection() {
  const root = useRef<HTMLElement>(null)
  const [liveMap, setLiveMap] = useState(false)
  const reduced = useReducedMotionPref()
  const { venue } = wedding
  useScrollReveal(root)

  return (
    <section id="venue" ref={root} aria-labelledby="venue-title" className="paper-grain relative overflow-hidden bg-paper py-[clamp(5.5rem,13vw,11rem)]">
      <CornerFloral src="/vines/6.svg" aria-hidden="true" className="pointer-events-none absolute top-5 right-3 size-14 opacity-75 sm:top-8 sm:right-6 sm:size-24" />
      <CornerFloral src="/vines/6.svg" aria-hidden="true" className="pointer-events-none absolute bottom-5 left-3 size-14 -scale-100 opacity-75 sm:bottom-8 sm:left-6 sm:size-24" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <SectionHeading id="venue-title" eyebrow="Getting there" title="The Venue" />

        <div className="mt-16 grid gap-12 sm:mt-24 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-7">
            <div data-reveal="image" className="relative overflow-hidden border border-gold/40 bg-champagne p-2 shadow-[0_30px_60px_-30px_rgba(61,18,32,0.35)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                {liveMap ? (
                  <iframe
                    title={`Map showing ${venue.name}`}
                    src={mapEmbedUrl(venue.mapsQuery)}
                    className="absolute inset-0 size-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <MapIllustration name={venue.name} animate={!reduced} />
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
              <span className="italic">{liveMap ? 'Map data © Google' : 'Illustration — not to scale'}</span>
              {!liveMap && (
                <button type="button" onClick={() => setLiveMap(true)} className="text-link inline-flex min-h-11 items-center gap-2 font-medium tracking-[0.18em] text-gold-deep uppercase">
                  <MapPinned className="size-4" aria-hidden="true" />
                  Load interactive map
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="display text-[clamp(2.6rem,6vw,4rem)] text-ink" data-reveal>
              {venue.name}
            </h3>
            <address className="mt-4 text-[1.02rem] leading-relaxed text-ink-soft not-italic" data-reveal data-reveal-delay="0.05">
              {venue.address}
            </address>
            <SampleNote className="mt-3" />
            <p className="lede mt-6" data-reveal data-reveal-delay="0.1">
              {venue.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3" data-reveal data-reveal-delay="0.15">
              <a href={directionsUrl(venue.mapsQuery)} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
                <Navigation className="size-4" aria-hidden="true" />
                Get directions
                <span className="sr-only">(opens Google Maps)</span>
              </a>
              <a href={mapSearchUrl(venue.mapsQuery)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <ExternalLink className="size-4" aria-hidden="true" />
                Open in Maps
              </a>
            </div>

            {venue.travel.length > 0 && (
              <ul className="mt-12 divide-y divide-gold/25 border-y border-gold/25">
                {venue.travel.map((t, i) => {
                  const Icon = TRAVEL_ICONS[t.kind]
                  return (
                    <li key={t.id} className="flex gap-5 py-5" data-reveal data-reveal-delay={String(0.05 * i)}>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold-deep">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h4 className="eyebrow">{t.title}</h4>
                        <p className="mt-1.5 font-display text-xl text-ink">{t.detail}</p>
                        {t.note && <p className="mt-1 text-sm text-ink-soft">{t.note}</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
