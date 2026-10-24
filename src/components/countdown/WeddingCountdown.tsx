import { AnimatePresence, motion } from 'framer-motion'
import { useRef } from 'react'
import { wedding } from '../../data/wedding'
import { formatLongDate, formatTime, formatWeekday, parseDate } from '../../lib/dates'
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap'
import { easeOut } from '../../lib/motion'
import { useCountdown } from '../../hooks/useCountdown'
import { useReducedMotionPref } from '../../hooks/useMediaQuery'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { CalendarMenu } from '../ui/CalendarMenu'
import { Divider, Mandala } from '../ui/ornaments'
import { SampleNote } from '../ui/SampleNote'

function Unit({ value, label }: { value: number | null; label: string }) {
  const reduced = useReducedMotionPref()
  const text = value === null ? '--' : String(value).padStart(2, '0')
  return (
    <div className="flex min-w-0 flex-col items-center px-1 sm:px-4 md:px-6">
      <span className="relative block h-[1em] overflow-hidden font-display text-[clamp(2.15rem,10.5vw,7.5rem)] leading-none text-ivory tabular">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            className="block"
            initial={{ y: reduced ? 0 : '-60%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : '60%', opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.55, ease: easeOut }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mt-2 text-[0.58rem] tracking-[0.14em] text-gold-soft uppercase sm:mt-3 sm:text-[0.72rem] sm:tracking-[0.28em]">{label}</span>
    </div>
  )
}

export function WeddingCountdown() {
  const root = useRef<HTMLElement>(null)
  const state = useCountdown(wedding.weddingDateTime)
  const date = parseDate(wedding.weddingDateTime)
  const mainEvent = wedding.events.find((e) => e.start === wedding.weddingDateTime) ?? wedding.events[0]
  const { partnerOne, partnerTwo } = wedding.couple
  useScrollReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-mandala]',
          { rotate: -12 },
          { rotate: 12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
        )
      })
    },
    { scope: root },
  )

  const counting = state.status === 'counting' || state.status === 'pending'
  const v = state.status === 'counting' ? state : null

  return (
    <section id="countdown" ref={root} aria-labelledby="countdown-title" className="on-dark relative overflow-hidden bg-wine py-[clamp(5.5rem,12vw,10rem)] text-ivory">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(140,40,64,0.55),transparent_75%)]" />
      <div data-mandala aria-hidden="true" className="mandala-ring pointer-events-none absolute top-1/2 left-1/2 w-[min(78vw,28rem)] -translate-x-1/2 -translate-y-1/2 opacity-30">
        <Mandala src="/mandals/3.svg" className="w-full" />
      </div>
      <div className="relative z-[1] mx-auto max-w-5xl px-5 text-center">
        <p className="eyebrow" data-reveal>
          Counting down to
        </p>
        <h2 id="countdown-title" className="section-title mt-5 text-ivory" data-reveal data-reveal-delay="0.08">
          {state.status === 'passed' ? 'Happily ever after' : state.status === 'today' ? 'Today is the day' : 'Our forever'}
        </h2>
        <Divider className="mx-auto mt-6 h-5 w-40 text-gold-soft" data-reveal="line" data-reveal-delay="0.15" />

        <div className="mt-14" data-reveal data-reveal-delay="0.2">
          {counting && (
            <div role="timer" aria-labelledby="countdown-title" className="mx-auto flex w-full max-w-3xl items-start justify-center divide-x divide-gold-soft/20">
              <Unit value={v?.days ?? null} label={v?.days === 1 ? 'Day' : 'Days'} />
              <Unit value={v?.hours ?? null} label="Hours" />
              <Unit value={v?.minutes ?? null} label="Minutes" />
              <Unit value={v?.seconds ?? null} label="Seconds" />
            </div>
          )}
          {state.status === 'counting' && (
            <p className="sr-only">
              {state.days} days, {state.hours} hours and {state.minutes} minutes to go.
            </p>
          )}
          {state.status === 'today' && <p className="lede mx-auto max-w-xl">The celebrations are underway — thank you for being here with us.</p>}
          {state.status === 'passed' && (
            <p className="lede mx-auto max-w-xl">
              {partnerOne} &amp; {partnerTwo} are married. Thank you for every blessing, every dance and every moment you shared with us.
            </p>
          )}
          {state.status === 'invalid' && <p className="lede mx-auto max-w-xl">The wedding date will be announced soon.</p>}
        </div>

        {date && (
          <div className="mt-14 flex flex-col items-center gap-6" data-reveal data-reveal-delay="0.25">
            <p className="text-center text-[0.68rem] leading-relaxed tracking-[0.16em] text-ivory/80 uppercase sm:text-[0.78rem] sm:tracking-[0.28em]">
              <span className="block sm:inline">{formatWeekday(date)} · {formatLongDate(date)}</span>
              <span className="mt-1 block sm:mt-0 sm:ml-2 sm:inline">{formatTime(date)} {wedding.timeZoneLabel}</span>
            </p>
            {counting && mainEvent && (
              <CalendarMenu
                label="Save the date"
                entry={{
                  id: `${mainEvent.id}-${partnerOne}-${partnerTwo}-save-the-date`.toLowerCase(),
                  title: `${mainEvent.name} · ${partnerOne} & ${partnerTwo}`,
                  start: mainEvent.start,
                  end: mainEvent.end,
                  location: `${mainEvent.space}, ${mainEvent.address}`,
                  description: mainEvent.description,
                }}
              />
            )}
            <SampleNote />
          </div>
        )}
      </div>
    </section>
  )
}
