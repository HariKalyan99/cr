import { motion, type Variants } from 'framer-motion'
import { useRef, type Ref } from 'react'
import { wedding } from '../../data/wedding'
import { formatDotted, formatLongDate, formatWeekday, parseDate } from '../../lib/dates'
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap'
import { easeOut } from '../../lib/motion'
import { useReducedMotionPref } from '../../hooks/useMediaQuery'
import { ArchOutline, Mandala, MonogramLogo } from '../ui/ornaments'
import { ResponsiveImage } from '../ui/ResponsiveImage'
import { SampleNote } from '../ui/SampleNote'
import { useSmoothScroll } from '../providers/smoothScrollContext'

interface Props {
  /** Entrance plays once the invitation intro hands over. */
  revealed: boolean
  headingRef: Ref<HTMLHeadingElement>
}

/*
 * Motion ownership: Framer Motion animates the inner elements' entrance;
 * GSAP scroll parallax only touches the [data-parallax] wrappers, so the two
 * libraries never fight over the same transform.
 */
export function WeddingHero({ revealed, headingRef }: Props) {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotionPref()
  const { scrollTo } = useSmoothScroll()
  const date = parseDate(wedding.weddingDateTime)
  const { partnerOne, partnerTwo } = wedding.couple

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const scrollTrigger = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
        gsap.to('[data-parallax="image"]', { yPercent: 10, ease: 'none', scrollTrigger })
        gsap.to('[data-parallax="frame"]', { yPercent: -7, ease: 'none', scrollTrigger })
        gsap.to('[data-parallax="text"]', { yPercent: -14, autoAlpha: 0.25, ease: 'none', scrollTrigger })
        gsap.to('[data-parallax="mandala"]', { rotate: 18, ease: 'none', scrollTrigger })
        gsap.to('[data-parallax="badge"]', { rotate: 120, ease: 'none', scrollTrigger })
      })
    },
    { scope: root },
  )

  const rise = reduced ? 0 : 28
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }
  const item: Variants = {
    hidden: { opacity: 0, y: rise },
    show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: easeOut } },
  }
  const line: Variants = {
    // Generous negative insets keep script ascenders/descenders from being clipped once revealed.
    hidden: { opacity: 0, y: reduced ? 0 : '0.35em', clipPath: reduced ? 'inset(-30% -10% -30% -10%)' : 'inset(0% -10% 100% -10%)' },
    show: { opacity: 1, y: 0, clipPath: 'inset(-30% -10% -30% -10%)', transition: { duration: 1.4, ease: easeOut } },
  }
  const state = revealed ? 'show' : 'hidden'

  return (
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      className="paper-grain relative overflow-hidden bg-ivory pt-[max(env(safe-area-inset-top),4.5rem)] pb-20 sm:pt-20 lg:flex lg:min-h-[100svh] lg:items-center lg:pt-16 lg:pb-24"
    >
      <div data-parallax="mandala" aria-hidden="true" className="pointer-events-none absolute -top-[22vw] -right-[34vw] w-[86vw] opacity-40 lg:-top-[14vw] lg:-right-[16vw] lg:w-[58vw] lg:opacity-55">
        <Mandala src="/mandals/3.svg" className="w-full" />
      </div>
      <div className="relative z-[1] mx-auto grid w-full max-w-7xl gap-14 px-6 sm:px-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div data-parallax="text" className="@container lg:col-span-7">
          <motion.div variants={container} initial="hidden" animate={state}>
            <motion.p variants={item} className="eyebrow">
              {wedding.hero.eyebrow}
            </motion.p>
            <h1
              id="hero-title"
              ref={headingRef}
              tabIndex={-1}
              className="display hero-names mt-6 text-ink outline-none"
            >
              <motion.span variants={line} className="block whitespace-nowrap">
                {partnerOne}
              </motion.span>
              <motion.span variants={line} className="block whitespace-nowrap">
                <span className="font-light text-[0.8em] text-gold italic">&amp;</span> {partnerTwo}
              </motion.span>
            </h1>
            <motion.p variants={item} className="lede mt-8 max-w-[34rem] text-pretty">
              {wedding.hero.announcement}
            </motion.p>
            <motion.div variants={item} className="mt-10 flex flex-col gap-2 text-[0.72rem] font-medium tracking-[0.14em] text-ink uppercase sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3 sm:text-[0.78rem] sm:tracking-[0.26em]">
              <span>{date ? `${formatWeekday(date)} · ${formatLongDate(date)}` : 'Date to be announced'}</span>
              <span aria-hidden="true" className="hidden h-px w-10 bg-gold sm:block" />
              <span>{wedding.city}</span>
            </motion.div>
            <motion.div variants={item}>
              <SampleNote className="mt-4" />
            </motion.div>
          </motion.div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[3/4] w-[min(80vw,25rem)] lg:w-full lg:max-w-[27rem]">
            <div data-parallax="frame" aria-hidden="true" className="absolute -inset-3 translate-x-4 translate-y-4 sm:-inset-4">
              <ArchOutline className="size-full text-gold/70" />
            </div>
            <motion.div
              className="absolute inset-0 overflow-hidden bg-champagne [clip-path:url(#arch-clip)]"
              initial={{ opacity: 0, scale: reduced ? 1 : 1.06 }}
              animate={revealed ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 1.8, ease: easeOut, delay: 0.15 }}
            >
              <div data-parallax="image" className="absolute inset-x-0 -top-[8%] h-[116%]">
                <ResponsiveImage
                  image={wedding.hero.image}
                  sizes="(min-width: 1024px) 27rem, 80vw"
                  priority
                  className="size-full object-cover"
                />
              </div>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-wine/25 via-transparent to-transparent" />
            </motion.div>

            {/* Save-the-date roundel */}
            <motion.div
              aria-hidden="true"
              className="absolute -bottom-8 -left-6 size-28 sm:-left-10 sm:size-32"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
              animate={revealed ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 1.2, ease: easeOut, delay: 0.9 }}
            >
              <img src="/vines/3.svg" alt="" draggable={false} className="pointer-events-none absolute top-1/2 left-1/2 w-[175%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none" />
              <div className="absolute inset-0 rounded-full bg-burgundy shadow-[0_18px_40px_-14px_rgba(61,18,32,0.7)]" />
              <svg data-parallax="badge" viewBox="0 0 100 100" className="absolute inset-0 size-full text-gold-soft">
                <defs>
                  <path id="badge-ring" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
                </defs>
                <text fontSize="7.2" letterSpacing="2.4" fill="currentColor" fontFamily="var(--font-sans)">
                  <textPath href="#badge-ring">SAVE THE DATE · {date ? formatDotted(date) : 'TBA'} ·</textPath>
                </text>
              </svg>
              <MonogramLogo className="absolute top-1/2 left-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </div>
        </div>
      </div>

      <motion.a
        href="#story"
        onClick={(e) => {
          e.preventDefault()
          scrollTo('#story')
        }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.65rem] tracking-[0.35em] text-ink-soft uppercase sm:flex lg:left-10 lg:translate-x-0"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.6 }}
      >
        Scroll
        <span aria-hidden="true" className="relative h-12 w-px overflow-hidden bg-gold/25">
          <span className="absolute inset-x-0 top-0 h-1/3 bg-gold-deep [animation:scroll-cue_2.2s_cubic-bezier(.65,0,.35,1)_infinite]" />
        </span>
      </motion.a>
    </section>
  )
}
