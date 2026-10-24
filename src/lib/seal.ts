/**
 * Irregular "poured wax" outline shared by the 3D seal (three.js shape) and the
 * SVG seal used in the CSS fallback and closing scene, so both look identical.
 */
export function waxRadius(theta: number, radius = 1) {
  return radius * (1 + 0.045 * Math.sin(5 * theta + 1.1) + 0.028 * Math.sin(11 * theta + 0.4) + 0.018 * Math.sin(17 * theta + 2.3))
}

export function waxOutline(radius = 1, segments = 96): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const r = waxRadius(t, radius)
    pts.push([Math.cos(t) * r, Math.sin(t) * r])
  }
  return pts
}

export function waxPath(radius = 1, cx = 0, cy = 0) {
  return (
    waxOutline(radius)
      .map(([x, y], i) => `${i ? 'L' : 'M'}${(cx + x).toFixed(2)} ${(cy - y).toFixed(2)}`)
      .join(' ') + 'Z'
  )
}

/** Gentle x-offsets (as a fraction of the radius) along the hairline crack, from bottom to top. */
export const CRACK = [0, 0.016, -0.01, 0.018, -0.006, 0.012, -0.008, 0.005, 0]
