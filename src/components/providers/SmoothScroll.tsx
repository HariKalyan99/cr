import Lenis from 'lenis'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/device'
import { SmoothScrollContext, type SmoothScrollApi } from './smoothScrollContext'

/**
 * Lenis ⇄ GSAP ScrollTrigger synchronisation strategy
 * ----------------------------------------------------
 * 1. Lenis does NOT run its own requestAnimationFrame loop (`autoRaf: false`).
 *    Instead it is stepped from `gsap.ticker`, so smooth scrolling and every
 *    GSAP tween/ScrollTrigger share one clock and one frame.
 * 2. Every Lenis scroll event calls `ScrollTrigger.update()`, so scrubbed
 *    animations read the interpolated (smoothed) position, not the raw one.
 * 3. `lagSmoothing(0)` stops GSAP from "catching up" after a dropped frame,
 *    which would otherwise make the smoothed scroll jump.
 * Lenis animates the real window scroll position (no transformed wrapper), so
 * native scrollbars, keyboard scrolling, anchor links and position: sticky all
 * keep working. Touch devices keep native scrolling (Lenis' default).
 * When the visitor prefers reduced motion, Lenis is never created and the page
 * uses plain native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const lockCount = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 0.95 })
    lenisRef.current = lenis
    if (lockCount.current > 0) lenis.stop()

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Recalculate trigger positions once webfonts and late images have settled.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  const api = useMemo<SmoothScrollApi>(
    () => ({
      scrollTo(target, options = {}) {
        const lenis = lenisRef.current
        const offset = options.offset ?? 0
        if (lenis) {
          lenis.scrollTo(target, { offset, immediate: options.immediate, duration: 1.4 })
          return
        }
        const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
        const top =
          typeof el === 'number' ? el : el ? el.getBoundingClientRect().top + window.scrollY + offset : null
        if (top !== null) window.scrollTo({ top, behavior: options.immediate ? 'auto' : 'smooth' })
      },
      lock() {
        lockCount.current += 1
        document.documentElement.classList.add('is-locked')
        lenisRef.current?.stop()
      },
      unlock() {
        lockCount.current = Math.max(0, lockCount.current - 1)
        if (lockCount.current === 0) {
          document.documentElement.classList.remove('is-locked')
          lenisRef.current?.start()
        }
      },
    }),
    [],
  )

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
}
