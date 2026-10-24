import { createContext, useContext } from 'react'

export interface SmoothScrollApi {
  /** Scrolls to a selector, element or pixel offset. Falls back to native scrolling without Lenis. */
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number; immediate?: boolean }) => void
  /** Pause/resume page scrolling (intro, lightbox, mobile menu). Reference-counted. */
  lock: () => void
  unlock: () => void
}

export const SmoothScrollContext = createContext<SmoothScrollApi | null>(null)

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext)
  if (!ctx) throw new Error('useSmoothScroll must be used inside <SmoothScroll>')
  return ctx
}
