import { useRef } from 'react'
import type { StoryChapter } from '../../data/types'
import { wedding } from '../../data/wedding'
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { ResponsiveImage } from '../ui/ResponsiveImage'
import { SectionHeading } from '../ui/SectionHeading'

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

function Chapter({ chapter, index }: { chapter: StoryChapter; index: number }) {
  const portrait = chapter.image.height > chapter.image.width
  const flip = index % 2 === 1

  // Landscape photos get the wider column; portraits sit narrower with an offset.
  const imageCols = portrait
    ? `lg:col-span-5 ${flip ? 'lg:col-start-7' : 'lg:col-start-2'}`
    : `lg:col-span-7 ${flip ? 'lg:col-start-6' : 'lg:col-start-1'}`
  const textCols = portrait
    ? `lg:col-span-5 ${flip ? 'lg:col-start-1' : 'lg:col-start-8'}`
    : `lg:col-span-4 ${flip ? 'lg:col-start-1' : 'lg:col-start-9'}`

  return (
    <li className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
      <div className={`relative ${imageCols} ${flip ? 'lg:order-2' : ''}`}>
        <div
          aria-hidden="true"
          className={`absolute inset-0 border border-gold/50 ${flip ? '-translate-x-3 translate-y-3 sm:-translate-x-5 sm:translate-y-5' : 'translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5'}`}
        />
        <figure data-reveal="image" className="relative overflow-hidden bg-champagne" style={{ aspectRatio: `${chapter.image.width} / ${chapter.image.height}` }}>
          <div data-parallax-img className="absolute inset-x-0 -top-[7%] h-[114%]">
            <ResponsiveImage image={chapter.image} sizes="(min-width: 1024px) 50vw, 92vw" className="size-full object-cover" />
          </div>
        </figure>
      </div>

      <div className={`relative ${textCols} ${flip ? 'lg:order-1' : ''}`}>
        <span aria-hidden="true" className="display pointer-events-none absolute -top-14 -left-2 text-[8rem] text-gold/[0.16] sm:-top-20 sm:text-[11rem]">
          {NUMERALS[index] ?? index + 1}
        </span>
        <p className="eyebrow relative" data-reveal>
          {chapter.label}
        </p>
        <h3 className="display relative mt-4 text-[clamp(2.2rem,5vw,3.4rem)] text-ink text-balance" data-reveal data-reveal-delay="0.08">
          {chapter.title}
        </h3>
        <div aria-hidden="true" className="mt-6 h-px w-16 bg-gold" data-reveal="line" data-reveal-delay="0.15" />
        <p className="relative mt-6 max-w-md text-[1.02rem] leading-relaxed text-ink-soft text-pretty" data-reveal data-reveal-delay="0.2">
          {chapter.body}
        </p>
      </div>
    </li>
  )
}

export function CoupleStory() {
  const root = useRef<HTMLElement>(null)
  useScrollReveal(root)

  // Slow image drift inside each frame, scrubbed to scroll.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax-img]', root.current).forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -6 },
            { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
          )
        })
      })
    },
    { scope: root },
  )

  const { story } = wedding
  return (
    <section id="story" ref={root} aria-labelledby="story-title" className="paper-grain relative bg-paper py-[clamp(5.5rem,13vw,11rem)]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <SectionHeading id="story-title" eyebrow="Chapter by chapter" title={story.title} lede={story.intro} />
        <ol className="mt-20 space-y-24 sm:mt-28 lg:space-y-40">
          {story.chapters.map((chapter, i) => (
            <Chapter key={chapter.id} chapter={chapter} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
