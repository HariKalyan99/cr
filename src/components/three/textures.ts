import * as THREE from 'three'
import { CRACK, waxOutline, waxRadius } from '../../lib/seal'

/**
 * Procedural paper/foil textures painted on 2D canvases (no image downloads).
 *
 * Every surface is drawn twice: a colour layer and a "PBR mask" layer. In the
 * mask, green = roughness and blue = metalness (three.js reads roughnessMap from
 * G and metalnessMap from B), so anything drawn with `foil()` becomes genuinely
 * metallic and catches the scene's light like real gold foil.
 */

type Ctx = CanvasRenderingContext2D

const MASK_PAPER = 'rgb(0, 224, 0)'
const MASK_GOLD = 'rgb(0, 100, 235)'
const INK = '#3a2823'
const INK_SOFT = '#6e5a50'

export const FONTS = {
  display: '"Cormorant Garamond Variable", "Cormorant Garamond", Georgia, serif',
  sans: '"Jost Variable", "Jost", system-ui, sans-serif',
  script: '"Pinyon Script", cursive',
}

interface Layered {
  color: Ctx
  mask: Ctx
  w: number
  h: number
}

function layered(w: number, h: number, base: string | null, maskBase = MASK_PAPER): Layered {
  const make = () => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c.getContext('2d')!
  }
  const color = make()
  const mask = make()
  if (base) {
    color.fillStyle = base
    color.fillRect(0, 0, w, h)
    mask.fillStyle = maskBase
    mask.fillRect(0, 0, w, h)
  }
  return { color, mask, w, h }
}

function goldGradient(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, '#e2c27c')
  g.addColorStop(0.3, '#b48a3c')
  g.addColorStop(0.55, '#d6b367')
  g.addColorStop(0.8, '#a17830')
  g.addColorStop(1, '#7f5c22')
  return g
}

/** Draws the same shape as gold on the colour layer and as metal on the mask layer. */
function foil(L: Layered, draw: (ctx: Ctx) => void, alpha = 1) {
  const c = L.color
  c.save()
  const g = goldGradient(c, 0, 0, L.w, L.h)
  c.fillStyle = g
  c.strokeStyle = g
  c.globalAlpha = alpha
  draw(c)
  c.restore()
  const m = L.mask
  m.save()
  m.fillStyle = MASK_GOLD
  m.strokeStyle = MASK_GOLD
  draw(m)
  m.restore()
}

/** Ink is printed only on the colour layer (it stays matte paper in the mask). */
function ink(L: Layered, color: string, draw: (ctx: Ctx) => void) {
  const c = L.color
  c.save()
  c.fillStyle = color
  c.strokeStyle = color
  draw(c)
  c.restore()
}

function grain(ctx: Ctx, w: number, h: number, strength: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * strength
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

function fibers(ctx: Ctx, w: number, h: number, count: number, rgba: string) {
  ctx.save()
  ctx.strokeStyle = rgba
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const len = (0.004 + Math.random() * 0.012) * w
    const a = Math.random() * Math.PI
    ctx.lineWidth = 0.4 + Math.random() * 0.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(a + 0.6) * len * 0.5, y + Math.sin(a + 0.6) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len)
    ctx.stroke()
  }
  ctx.restore()
}

function vignette(ctx: Ctx, w: number, h: number, edge: string) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, edge)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function paper(L: Layered, edge = 'rgba(120, 90, 50, 0.16)') {
  vignette(L.color, L.w, L.h, edge)
  fibers(L.color, L.w, L.h, Math.round((L.w * L.h) / 2600), 'rgba(140, 110, 70, 0.10)')
  grain(L.color, L.w, L.h, 9)
}

/** Draws text centred on cx with manual letter-spacing (canvas letterSpacing is not universal). */
function spacedText(ctx: Ctx, text: string, cx: number, y: number, spacing: number) {
  const chars = [...text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let x = cx - total / 2
  ctx.textAlign = 'left'
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y)
    x += widths[i] + spacing
  })
}

function wrap(ctx: Ctx, text: string, maxWidth: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

/**
 * "Name & Name" with the names in script and the ampersand in the display
 * italic (the script face's ampersand reads as an unfamiliar glyph). Shrinks to fit.
 */
function drawNames(ctx: Ctx, [one, two]: [string, string], cx: number, y: number, size: number, maxWidth: number) {
  const script = (s: number) => `400 ${s}px ${FONTS.script}`
  const amp = (s: number) => `italic 300 ${s * 0.62}px ${FONTS.display}`
  const measure = (s: number) => {
    ctx.font = script(s)
    const a = ctx.measureText(one).width
    const b = ctx.measureText(two).width
    const gap = s * 0.22
    ctx.font = amp(s)
    return { a, b, gap, amp: ctx.measureText('&').width, total: a + b + gap * 2 + ctx.measureText('&').width }
  }
  let s = size
  let m = measure(s)
  while (m.total > maxWidth && s > 8) {
    s *= 0.94
    m = measure(s)
  }
  let x = cx - m.total / 2
  ctx.textAlign = 'left'
  ctx.font = script(s)
  ctx.fillText(one, x, y)
  x += m.a + m.gap
  ctx.font = amp(s)
  ctx.fillText('&', x, y)
  x += m.amp + m.gap
  ctx.font = script(s)
  ctx.fillText(two, x, y)
}

export interface PbrTexture {
  map: THREE.CanvasTexture
  pbr: THREE.CanvasTexture
}

function toTextures(L: Layered, anisotropy: number): PbrTexture {
  const map = new THREE.CanvasTexture(L.color.canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = anisotropy
  const pbr = new THREE.CanvasTexture(L.mask.canvas)
  pbr.anisotropy = anisotropy
  return { map, pbr }
}

/* ───────────────────────────── Envelope ───────────────────────────── */

export interface EnvelopeDims {
  W: number
  H: number
  flapH: number
  /** y of the pocket's V notch, in envelope units (origin at centre). */
  pocketV: number
}

export function pocketTexture(size: number, d: EnvelopeDims, aniso: number) {
  const w = size
  const h = Math.round((size * d.H) / d.W)
  const L = layered(w, h, '#f1e8d7')
  const toY = (y: number) => ((d.H / 2 - y) / d.H) * h
  const vY = toY(d.pocketV)
  const apexY = h * 0.6

  // Bottom flap sits on top of the side flaps; give it a soft cast shadow and lift.
  const c = L.color
  c.save()
  c.shadowColor = 'rgba(70, 45, 20, 0.28)'
  c.shadowBlur = w * 0.012
  c.shadowOffsetY = -w * 0.002
  c.fillStyle = '#f5ede0'
  c.beginPath()
  c.moveTo(-w * 0.02, h + 2)
  c.quadraticCurveTo(w * 0.3, apexY + h * 0.06, w / 2, apexY)
  c.quadraticCurveTo(w * 0.7, apexY + h * 0.06, w * 1.02, h + 2)
  c.closePath()
  c.fill()
  c.restore()

  // Side-flap shading towards the V notch.
  const shade = c.createLinearGradient(0, 0, 0, vY)
  shade.addColorStop(0, 'rgba(90, 60, 30, 0.10)')
  shade.addColorStop(1, 'rgba(90, 60, 30, 0)')
  c.fillStyle = shade
  c.fillRect(0, 0, w, vY)

  paper(L)

  // Gold deckle line following the V edge.
  foil(L, (ctx) => {
    ctx.lineWidth = w * 0.0022
    const inset = h * 0.045
    ctx.beginPath()
    ctx.moveTo(w * 0.035, inset * 0.6)
    ctx.lineTo(w / 2, vY - inset)
    ctx.lineTo(w * 0.965, inset * 0.6)
    ctx.stroke()
  })
  // Fine gold rule along the bottom flap edge.
  foil(L, (ctx) => {
    ctx.lineWidth = w * 0.0012
    ctx.beginPath()
    ctx.moveTo(w * 0.06, h * 0.985)
    ctx.quadraticCurveTo(w * 0.3, apexY + h * 0.1, w / 2, apexY + h * 0.05)
    ctx.quadraticCurveTo(w * 0.7, apexY + h * 0.1, w * 0.94, h * 0.985)
    ctx.stroke()
  }, 0.85)

  return toTextures(L, aniso)
}

export function flapTexture(size: number, d: EnvelopeDims, aniso: number) {
  const w = size
  const h = Math.round((size * d.flapH) / d.W)
  const L = layered(w, h, '#f6efe2')
  const g = L.color.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(1, 'rgba(120, 85, 40, 0.12)')
  L.color.fillStyle = g
  L.color.fillRect(0, 0, w, h)
  paper(L, 'rgba(120, 90, 50, 0.1)')

  const tri = (k: number) => {
    // Triangle (0,0) (w,0) (w/2,h) scaled about its centroid.
    const cx = w / 2
    const cy = h / 3
    const p = (x: number, y: number) => [cx + (x - cx) * k, cy + (y - cy) * k] as const
    return [p(0, 0), p(w / 2, h), p(w, 0)]
  }
  foil(L, (ctx) => {
    ctx.lineWidth = w * 0.0024
    const [a, b, c] = tri(0.97)
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.lineTo(c[0], c[1])
    ctx.stroke()
  })
  foil(L, (ctx) => {
    ctx.lineWidth = w * 0.001
    const [a, b, c] = tri(0.86)
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.lineTo(c[0], c[1])
    ctx.stroke()
  }, 0.8)
  return toTextures(L, aniso)
}

/** Burgundy liner with a gold jaali (lattice) pattern; seen inside the envelope. */
export function linerTexture(size: number, aspect: number, aniso: number) {
  const w = size
  const h = Math.round(size / aspect)
  const L = layered(w, h, '#561526')
  vignette(L.color, w, h, 'rgba(20, 4, 10, 0.55)')
  const step = w / 16
  foil(
    L,
    (ctx) => {
      ctx.lineWidth = w * 0.0011
      for (let y = 0; y <= h + step; y += step) {
        for (let x = 0; x <= w + step; x += step) {
          const ox = (Math.round(y / step) % 2) * (step / 2)
          const cx = x + ox
          ctx.beginPath()
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2
            ctx.ellipse(cx + Math.cos(a) * step * 0.16, y + Math.sin(a) * step * 0.16, step * 0.15, step * 0.06, a, 0, Math.PI * 2)
          }
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(cx, y, step * 0.035, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(cx + step / 4, y + step / 2, step * 0.018, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    0.55,
  )
  grain(L.color, w, h, 6)
  return toTextures(L, aniso)
}

/* ─────────────────────────────── Card ─────────────────────────────── */

export interface CardContent {
  monogram: [string, string]
  preface: string
  names: [string, string]
  request: string
  dateLine: string
  city: string
}

export function cardTexture(
  size: number,
  aspect: number,
  content: CardContent,
  aniso: number,
  floral: CanvasImageSource | null = null,
  logo: CanvasImageSource | null = null,
) {
  const w = size
  const h = Math.round(size / aspect)
  const L = layered(w, h, '#fbf6ec')
  paper(L, 'rgba(150, 115, 60, 0.14)')
  const cx = w / 2

  // Double foil border with corner rosettes.
  foil(L, (ctx) => {
    ctx.lineWidth = w * 0.0035
    const i = w * 0.03
    ctx.strokeRect(i, i, w - i * 2, h - i * 2)
  })
  foil(L, (ctx) => {
    ctx.lineWidth = w * 0.0011
    const i = w * 0.042
    ctx.strokeRect(i, i, w - i * 2, h - i * 2)
  }, 0.9)
  if (floral) {
    const S = w * 0.13
    const m = w * 0.03
    const ctx = L.color
    ctx.save()
    ctx.globalAlpha = 0.9
    // Vine 6 is drawn in the top-right of its square, so the image is anchored by that corner.
    for (const [x, y, sx, sy] of [
      [w - m, m, 1, 1],
      [m, h - m, -1, -1],
    ] as const) {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(sx, sy)
      ctx.drawImage(floral, -S, 0, S, S)
      ctx.restore()
    }
    ctx.restore()
  }

  // Monogram roundel.
  const my = h * 0.17
  if (logo) {
    const s = w * 0.15
    L.color.drawImage(logo, cx - s / 2, my - s / 2, s, s)
  }

  ink(L, INK_SOFT, (ctx) => {
    ctx.textBaseline = 'alphabetic'
    ctx.font = `500 ${w * 0.0155}px ${FONTS.sans}`
    spacedText(ctx, content.preface.toUpperCase(), cx, h * 0.335, w * 0.0065)
  })

  foil(L, (ctx) => {
    ctx.textBaseline = 'alphabetic'
    drawNames(ctx, content.names, cx, h * 0.53, w * 0.082, w * 0.78)
  })

  ink(L, INK, (ctx) => {
    ctx.font = `italic 400 ${w * 0.028}px ${FONTS.display}`
    ctx.textAlign = 'center'
    const lines = wrap(ctx, content.request, w * 0.6)
    lines.forEach((line, i) => ctx.fillText(line, cx, h * 0.635 + i * w * 0.034))
  })

  foil(L, (ctx) => {
    ctx.lineWidth = w * 0.0012
    const y = h * 0.775
    ctx.beginPath()
    ctx.moveTo(cx - w * 0.12, y)
    ctx.lineTo(cx - w * 0.012, y)
    ctx.moveTo(cx + w * 0.012, y)
    ctx.lineTo(cx + w * 0.12, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, y - w * 0.007)
    ctx.lineTo(cx + w * 0.007, y)
    ctx.lineTo(cx, y + w * 0.007)
    ctx.lineTo(cx - w * 0.007, y)
    ctx.closePath()
    ctx.fill()
  })

  ink(L, INK, (ctx) => {
    ctx.font = `500 ${w * 0.017}px ${FONTS.sans}`
    spacedText(ctx, content.dateLine.toUpperCase(), cx, h * 0.84, w * 0.005)
  })
  ink(L, INK_SOFT, (ctx) => {
    ctx.font = `400 ${w * 0.0145}px ${FONTS.sans}`
    spacedText(ctx, content.city.toUpperCase(), cx, h * 0.885, w * 0.007)
  })

  return toTextures(L, aniso)
}

/* ─────────────────────────────── Seal ─────────────────────────────── */

/**
 * Face of the 3D wax seal. Proportions match the SVG emblem (viewBox radius 54),
 * and a hairline crack runs through it along the same path the seal splits on.
 * The canvas covers shape coordinates [-radius, radius].
 */
export function sealTexture(size: number, monogram: [string, string], logo: CanvasImageSource | null = null) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const R = size / 2
  const u = (n: number) => (n / 54) * R
  const [one, two] = monogram

  ctx.beginPath()
  waxOutline(R).forEach(([x, y], i) => (i ? ctx.lineTo(c + x, c - y) : ctx.moveTo(c + x, c - y)))
  ctx.closePath()
  const wax = ctx.createRadialGradient(c - R * 0.28, c - R * 0.34, R * 0.08, c, c, R)
  wax.addColorStop(0, '#8e2a3e')
  wax.addColorStop(0.55, '#5e1a2c')
  wax.addColorStop(1, '#3a0e1a')
  ctx.fillStyle = wax
  ctx.fill()

  ctx.strokeStyle = 'rgba(44, 10, 19, 0.35)'
  ctx.lineWidth = u(2.4)
  ctx.beginPath()
  ctx.arc(c, c, u(42), 0, Math.PI * 2)
  ctx.stroke()

  const gold = ctx.createLinearGradient(c - R, c - R, c + R, c + R)
  gold.addColorStop(0, '#f3dfa6')
  gold.addColorStop(0.5, '#c9a256')
  gold.addColorStop(1, '#8f6a2a')
  ctx.strokeStyle = gold
  ctx.fillStyle = gold
  ctx.lineWidth = u(1.15)
  ctx.beginPath()
  ctx.arc(c, c, u(40), 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = u(0.6)
  ctx.beginPath()
  ctx.arc(c, c, u(33.5), 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 28; i++) {
    const t = (i / 28) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(c + Math.cos(t) * u(36.7), c - Math.sin(t) * u(36.7), u(0.7), 0, Math.PI * 2)
    ctx.fill()
  }

  if (logo) {
    const s = u(34)
    ctx.drawImage(logo, c - s / 2, c - s / 2, s, s)
  } else {
    ctx.font = `500 ${u(24)}px ${FONTS.display}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(one, c - u(12), c + u(1.5))
    ctx.fillText(two, c + u(12), c + u(1.5))
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
  ctx.lineWidth = u(3)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(c, c, u(36), Math.PI * 1.15, Math.PI * 1.72)
  ctx.stroke()

  // Hairline break, bottom to top, in the same place the two wax halves meet.
  const top = waxRadius(Math.PI / 2, R)
  const bottom = waxRadius((3 * Math.PI) / 2, R)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'butt'
  ctx.beginPath()
  CRACK.forEach((dx, i) => {
    const x = c + dx * R
    const y = c - (-bottom + ((top + bottom) * i) / (CRACK.length - 1))
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.strokeStyle = 'rgba(42, 14, 20, 0.38)'
  ctx.lineWidth = u(0.7)
  ctx.stroke()
  ctx.save()
  ctx.translate(u(0.28), 0)
  ctx.strokeStyle = 'rgba(255, 236, 214, 0.28)'
  ctx.lineWidth = u(0.22)
  ctx.stroke()
  ctx.restore()

  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  return map
}

/** Ensures webfonts are available before painting text into canvases. */
export async function loadCanvasFonts() {
  if (!document.fonts) return
  await Promise.allSettled([
    document.fonts.load(`italic 400 48px ${FONTS.display}`),
    document.fonts.load(`italic 500 48px ${FONTS.display}`),
    document.fonts.load(`500 48px ${FONTS.display}`),
    document.fonts.load(`500 24px ${FONTS.sans}`),
    document.fonts.load(`400 24px ${FONTS.sans}`),
    document.fonts.load(`400 48px ${FONTS.script}`),
  ])
}
