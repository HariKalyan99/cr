import { AnimatePresence } from 'framer-motion'
import { Expand } from 'lucide-react'
import { useRef, useState } from 'react'
import { wedding } from '../../data/wedding'
import { gsap, useGSAP } from '../../lib/gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { ResponsiveImage } from '../ui/ResponsiveImage'
import { SectionHeading } from '../ui/SectionHeading'
import { Lightbox } from './Lightbox'

/**
 * Editorial, asymmetric placements (mobile 2-col → desktop 12-col). Cycles if
 * more images are added; `speed` drives a subtle desktop-only parallax.
 */
const LAYOUT = [
  { cls: 'col-span-2 aspect-[16/10] lg:col-span-7', speed: 0 },
  { cls: 'col-span-1 aspect-[4/5] lg:col-span-4 lg:col-start-9 lg:mt-28 lg:aspect-[3/4]', speed: 0.12 },
  { cls: 'col-span-1 aspect-[4/5] lg:col-span-4 lg:col-start-2 lg:-mt-10 lg:aspect-square', speed: -0.06 },
  { cls: 'col-span-1 aspect-[4/5] lg:col-span-3 lg:col-start-6 lg:mt-16 lg:aspect-[3/4]', speed: 0.1 },
  { cls: 'col-span-1 aspect-[4/5] lg:col-span-4 lg:col-start-3 lg:mt-6 lg:aspect-[4/3]', speed: -0.04 },
  { cls: 'col-span-2 aspect-[16/10] lg:col-span-4 lg:col-start-9 lg:-mt-24 lg:aspect-[4/3]', speed: 0.08 },
]

export function WeddingGallery() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const { gallery } = wedding
  useScrollReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-speed]', root.current).forEach((el) => {
          const speed = Number(el.dataset.speed)
          if (!speed) return
          gsap.fromTo(
            el,
            { y: speed * 300 },
            { y: -speed * 300, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
          )
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="gallery" ref={root} aria-labelledby="gallery-title" className="on-dark relative overflow-hidden bg-night py-[clamp(5.5rem,13vw,11rem)] text-ivory">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(122,36,58,0.45),transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeading id="gallery-title" eyebrow="The gallery" title={gallery.title} lede={gallery.intro} />

        <ul className="mt-16 grid grid-cols-2 gap-3 sm:mt-24 sm:gap-5 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
          {gallery.images.map((image, i) => {
            const layout = LAYOUT[i % LAYOUT.length]
            return (
              <li key={image.src} className={layout.cls} data-speed={layout.speed}>
                <div data-reveal="image" className="size-full overflow-hidden bg-wine">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`View larger: ${image.alt}`}
                    className="group relative block size-full cursor-zoom-in overflow-hidden text-left"
                  >
                    <ResponsiveImage
                      image={image}
                      sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 92vw"
                      className="size-full object-cover transition-[scale] duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-night/75 via-night/0 to-transparent opacity-90 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-5 lg:translate-y-2 lg:opacity-0 lg:transition-all lg:duration-500 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
                      <span className="font-display text-base text-ivory italic sm:text-xl">{image.caption}</span>
                      <Expand className="size-4 shrink-0 text-gold-soft" aria-hidden="true" />
                    </span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <AnimatePresence>
        {active !== null && <Lightbox images={gallery.images} index={active} onClose={() => setActive(null)} onNavigate={setActive} />}
      </AnimatePresence>
    </section>
  )
}
