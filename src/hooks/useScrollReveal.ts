import type { RefObject } from 'react'
import { EASE_OUT, MOTION_OK, gsap, useGSAP } from '../lib/gsap'

/**
 * Scroll-triggered entrances for any descendant marked with `data-reveal`:
 *   data-reveal            → fade + rise (text)
 *   data-reveal="image"    → curtain wipe with a slow settle of the inner <img>
 *   data-reveal="line"     → horizontal draw (ornamental rules)
 * Optional `data-reveal-delay="0.2"`.
 *
 * Content is visible by default in CSS; hidden start states are only applied by
 * GSAP when motion is allowed, so reduced-motion or a script failure never
 * leaves content invisible. `useGSAP` scopes and reverts everything on unmount
 * (and is Strict-Mode safe).
 */
export function useScrollReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current)
        items.forEach((el) => {
          const kind = el.dataset.reveal
          const delay = Number(el.dataset.revealDelay ?? 0)
          const scrollTrigger = { trigger: el, start: 'top 88%', once: true }

          if (kind === 'image') {
            const inner = el.querySelector('img')
            const tl = gsap.timeline({ scrollTrigger, delay })
            tl.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: EASE_OUT })
            if (inner) tl.from(inner, { scale: 1.18, duration: 2, ease: EASE_OUT }, 0)
          } else if (kind === 'line') {
            gsap.from(el, { scaleX: 0, transformOrigin: '50% 50%', duration: 1.6, ease: EASE_OUT, delay, scrollTrigger })
          } else {
            gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.2, ease: EASE_OUT, delay, scrollTrigger })
          }
        })
      })
    },
    { scope },
  )
}
