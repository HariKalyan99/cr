export type DeviceTier = 'high' | 'mobile' | 'low'

let webglCache: boolean | null = null

/** True when a WebGL context can actually be created (not just when the API exists). */
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    webglCache = !!gl
    ;(gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}

/**
 * Coarse capability bucket used to scale the 3D scene:
 * - `low`: few cores / little memory → no shadows, minimal particles, dpr 1.
 * - `mobile`: touch-first small screens → reduced particles and texture size.
 * - `high`: everything else.
 */
export function getDeviceTier(): DeviceTier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  if (cores <= 2 || memory <= 2) return 'low'
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (coarse && Math.min(window.innerWidth, window.innerHeight) < 820) return 'mobile'
  if (cores <= 4 && memory <= 4) return 'mobile'
  return 'high'
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
