import type { Transition } from 'framer-motion'

/** Framer Motion side of the shared motion language (mirrors EASE_OUT in lib/gsap). */
export const easeOut = [0.16, 1, 0.3, 1] as const
export const easeInOut = [0.65, 0, 0.35, 1] as const

export const transition = {
  base: { duration: 0.9, ease: easeOut } satisfies Transition,
  quick: { duration: 0.45, ease: easeOut } satisfies Transition,
  slow: { duration: 1.4, ease: easeOut } satisfies Transition,
}
