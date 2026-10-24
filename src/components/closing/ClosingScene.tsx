import { ArrowUp, RotateCcw } from 'lucide-react'
import { useRef } from 'react'
import { wedding } from '../../data/wedding'
import { formatDotted, parseDate } from '../../lib/dates'
import { EASE_OUT, MOTION_OK, gsap, useGSAP } from '../../lib/gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { useSmoothScroll } from '../providers/smoothScrollContext'
import { Divider, Mandala } from '../ui/ornaments'
import { WaxSeal } from '../ui/WaxSeal'

/**
 * The story closes the way it opened: an envelope whose flap folds shut as
 * the guest scrolls, then the wax seal is pressed on.
 */
function ClosingEnvelope() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[3.2/2.1] w-[min(72vw,22rem)] [perspective:1400px] [perspective-origin:center_top]">
      <div aria-hidden="true" className="pointer-events-none absolute top-[70%] left-1/2 h-[30%] w-[88%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55),transparent_70%)] blur-lg" />
      <div className="absolute inset-0 shadow-[0_34px_54px_-20px_rgba(0,0,0,0.7),0_12px_18px_-10px_rgba(0,0,0,0.45)]" style={{ background: 'linear-gradient(170deg,#f3e9d7,#e4d4b8)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg,#f5ecdb,#e8d9be)', clipPath: 'polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)' }} />
      <svg viewBox="0 0 320 210" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
        <path d="M0 210 Q96 132 160 126 Q224 132 320 210" stroke="rgba(90,60,30,.22)" vectorEffect="non-scaling-stroke" />
      </svg>
      <div data-close-flap className="absolute inset-x-0 top-0 h-[62%] origin-top [transform-style:preserve-3d]">
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ background: 'linear-gradient(180deg,#f7efe0,#eadcc3)', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}>
          <svg viewBox="0 0 320 130" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
            <path d="M6 2 L160 126 L314 2" stroke="#b8924a" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]"
          style={{ background: 'radial-gradient(circle, rgba(222,190,120,.5) 0 1px, transparent 1.4px) 0 0/14px 14px, #561526', clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }}
        />
      </div>
      <div className="absolute left-1/2 top-[56%] aspect-square w-[24%] -translate-x-1/2 -translate-y-1/2">
        <WaxSeal data-close-seal className="size-full" />
      </div>
    </div>
  )
}

export function ClosingScene({ onReplay }: { onReplay: () => void }) {
  const root = useRef<HTMLElement>(null)
  const { scrollTo } = useSmoothScroll()
  const date = parseDate(wedding.weddingDateTime)
  const { partnerOne, partnerTwo, hashtag } = wedding.couple
  useScrollReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '[data-close-stage]', start: 'top 80%', end: 'center 45%', scrub: 0.8 },
        })
        tl.fromTo('[data-close-flap]', { rotateX: 180 }, { rotateX: 0, ease: 'power2.inOut', duration: 1 }).fromTo(
          '[data-close-seal]',
          { scale: 1.9, autoAlpha: 0, rotate: -12 },
          { scale: 1, autoAlpha: 1, rotate: 0, ease: EASE_OUT, duration: 0.5 },
          0.8,
        )
        gsap.fromTo(
          '[data-close-mandala]',
          { rotate: -10 },
          { rotate: 10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
        )
      })
      // Without motion, simply show the envelope sealed.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-close-flap]', { rotateX: 0 })
      })
    },
    { scope: root },
  )

  return (
    <section id="closing" ref={root} aria-labelledby="closing-title" className="on-dark relative overflow-hidden bg-night pt-[clamp(5.5rem,13vw,10rem)] text-ivory">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,rgba(110,32,52,0.55),transparent_75%)]" />
      <div data-close-mandala aria-hidden="true" className="mandala-ring pointer-events-none absolute top-[46%] left-1/2 w-[min(80vw,30rem)] -translate-x-1/2 -translate-y-1/2 opacity-25">
        <Mandala src="/mandals/3.svg" className="w-full" />
      </div>
      <div className="relative z-[1] mx-auto max-w-3xl px-6 text-center">
        <div data-close-stage>
          <ClosingEnvelope />
        </div>

        <p className="eyebrow mt-16" data-reveal>
          Thank you
        </p>
        <h2 id="closing-title" className="section-title mt-5 text-ivory" data-reveal data-reveal-delay="0.08">
          {wedding.closing.title}
        </h2>
        <Divider className="mx-auto mt-6 h-5 w-40 text-gold-soft" data-reveal="line" data-reveal-delay="0.15" />
        <p className="lede mx-auto mt-8 max-w-xl text-pretty" data-reveal data-reveal-delay="0.2">
          {wedding.closing.message}
        </p>

        <p className="mt-12 text-[0.68rem] tracking-[0.18em] text-ivory/60 uppercase sm:text-[0.72rem] sm:tracking-[0.35em]" data-reveal>
          {wedding.closing.signOff}
        </p>
        <p className="mt-3 font-script text-[clamp(3rem,10vw,5.5rem)] leading-tight text-gold-soft" data-reveal data-reveal-delay="0.08">
          {partnerOne} <span className="font-display text-[0.7em] font-light italic">&amp;</span> {partnerTwo}
        </p>
        <p className="mt-4 text-[0.72rem] tracking-[0.18em] text-ivory/75 uppercase sm:text-[0.8rem] sm:tracking-[0.4em]" data-reveal data-reveal-delay="0.12">
          {date ? formatDotted(date) : ''} {date && '·'} {wedding.city}
        </p>
        {hashtag && (
          <p className="mt-3 font-display text-lg text-gold-soft/80 italic" data-reveal data-reveal-delay="0.15">
            {hashtag}
          </p>
        )}

        <div className="mt-12 flex w-full flex-col items-center justify-center gap-3 sm:flex-row" data-reveal data-reveal-delay="0.2">
          <button type="button" onClick={onReplay} className="btn btn-outline w-full max-w-xs sm:w-auto">
            <RotateCcw className="size-4" aria-hidden="true" />
            Open the invitation again
          </button>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              scrollTo('#top')
            }}
            className="btn w-full max-w-xs text-ivory/75 hover:text-ivory sm:w-auto"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
            Back to top
          </a>
        </div>
      </div>

      <footer className="relative mt-24 border-t border-gold-soft/15 px-24 pt-8 pb-[max(env(safe-area-inset-bottom),5.5rem)] text-center text-xs text-ivory/50">
        <p>
          Made with love for the families of {partnerOne} &amp; {partnerTwo}
        </p>
        {wedding.isSampleContent && <p className="mt-2 italic">Preview — dates, venues and photographs shown are samples and will be updated.</p>}
      </footer>
    </section>
  )
}
