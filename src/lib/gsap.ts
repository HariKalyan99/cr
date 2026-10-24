import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Shared motion language: one family of eases and durations used across the site. */
export const EASE_OUT = 'expo.out'
export const EASE_IN_OUT = 'power3.inOut'

/** gsap.matchMedia condition: only run motion when the visitor has not asked for less. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger, useGSAP }
