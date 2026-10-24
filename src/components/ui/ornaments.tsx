import type { SVGProps } from 'react'
import { mediaUrl } from '../../lib/media'

type SvgProps = SVGProps<SVGSVGElement>

const petal = (len: number, w: number) =>
  `M0 0 C${w} ${-len * 0.35} ${w} ${-len * 0.75} 0 ${-len} C${-w} ${-len * 0.75} ${-w} ${-len * 0.35} 0 0Z`

/** Intertwined C R mark from the wedding storage bucket. */
export function MonogramLogo({ className }: { className?: string }) {
  return <img src={mediaUrl('logos/logo.png')} alt="" draggable={false} className={`pointer-events-none object-contain select-none ${className ?? ''}`} />
}

/** One of the mandalas in the wedding storage bucket. The parent owns any rotation, scale, or scroll motion. */
export function Mandala({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" draggable={false} className={`pointer-events-none aspect-square w-full object-cover object-center select-none ${className ?? ''}`} />
}

/** Gold rule with a central lotus bud. */
export function Divider({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 240 24" fill="none" stroke="currentColor" strokeWidth={0.8} className={className} aria-hidden="true" {...props}>
      <path d="M0 12 H92" strokeOpacity={0.7} />
      <path d="M148 12 H240" strokeOpacity={0.7} />
      <path d="M120 3 C126 8 128 12 120 21 C112 12 114 8 120 3Z" />
      <path d="M120 21 C130 18 136 14 140 8 C132 9 126 13 120 21Z" />
      <path d="M120 21 C110 18 104 14 100 8 C108 9 114 13 120 21Z" />
      <circle cx={96} cy={12} r={1.6} fill="currentColor" stroke="none" />
      <circle cx={144} cy={12} r={1.6} fill="currentColor" stroke="none" />
    </svg>
  )
}

/** A corner vine from the wedding storage bucket. Each file is drawn for one corner; mirror the box to the others. */
export function CornerFloral({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" draggable={false} className={`pointer-events-none aspect-square object-contain select-none ${className ?? ''}`} />
}

/** objectBoundingBox clip-path for the Mughal-style arch used in the hero. Render once. */
export function ArchClipDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <clipPath id="arch-clip" clipPathUnits="objectBoundingBox">
          <path d={ARCH_PATH} />
        </clipPath>
      </defs>
    </svg>
  )
}

export const ARCH_PATH =
  'M0,1 L0,0.34 C0,0.21 0.11,0.155 0.25,0.115 C0.37,0.085 0.455,0.05 0.5,0 C0.545,0.05 0.63,0.085 0.75,0.115 C0.89,0.155 1,0.21 1,0.34 L1,1 Z'

/** Outline matching the arch clip; stretched to its box. */
export function ArchOutline(props: SvgProps) {
  return (
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" fill="none" aria-hidden="true" {...props}>
      <path d={ARCH_PATH} stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* ───────────── Event motifs (64×64 line drawings) ───────────── */

function Paisley() {
  return (
    <>
      <path d="M30 56 C14 54 8 40 12 28 C16 14 30 6 42 10 C52 13 54 24 46 30 C40 34 34 30 36 24" />
      <path d="M30 50 C20 48 16 40 18 31 C21 21 31 15 40 17" strokeOpacity={0.6} />
      <path d="M36 24 C38 20 44 20 45 25" />
      <circle cx={24} cy={38} r={2.2} />
      <circle cx={24} cy={38} r={5.5} strokeOpacity={0.6} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={14 + i * 0.4} cy={22 + i * 7} r={0.9} fill="currentColor" stroke="none" />
      ))}
      <path d="M30 56 C36 58 44 58 50 54" />
    </>
  )
}

function Marigold() {
  return (
    <>
      <g transform="translate(32 30)">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`o${i}`} d={petal(18, 5)} transform={`rotate(${i * 30})`} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={`i${i}`} d={petal(10, 3.5)} transform={`rotate(${i * 36 + 18})`} strokeOpacity={0.7} />
        ))}
        <circle r={3} fill="currentColor" stroke="none" />
      </g>
      <path d="M32 48 V60" />
      <path d="M32 55 C26 52 22 54 20 58 C25 59 29 58 32 55Z" />
    </>
  )
}

function Kalash() {
  return (
    <>
      <path d="M22 30 C14 36 14 50 22 56 H42 C50 50 50 36 42 30Z" />
      <path d="M24 30 H40 V26 H24Z" />
      <path d="M18 44 H46" strokeOpacity={0.6} />
      <path d="M20 49 H44" strokeOpacity={0.4} />
      <circle cx={32} cy={18} r={7} />
      <path d="M32 11 V8" />
      <path d="M24 26 C18 24 14 20 12 14 C18 15 22 19 24 26Z" />
      <path d="M40 26 C46 24 50 20 52 14 C46 15 42 19 40 26Z" />
      <path d="M28 26 C25 20 25 15 27 10" strokeOpacity={0.6} />
      <path d="M36 26 C39 20 39 15 37 10" strokeOpacity={0.6} />
      <circle cx={32} cy={42} r={2} fill="currentColor" stroke="none" />
    </>
  )
}

function Lantern() {
  return (
    <>
      <path d="M32 4 V12" />
      <path d="M26 12 H38 L42 18 H22Z" />
      <path d="M22 18 C16 28 16 42 22 50 H42 C48 42 48 28 42 18" />
      <path d="M32 18 V50" strokeOpacity={0.5} />
      <path d="M27 18 C24 28 24 40 27 50" strokeOpacity={0.5} />
      <path d="M37 18 C40 28 40 40 37 50" strokeOpacity={0.5} />
      <path d="M24 50 H40 L36 56 H28Z" />
      <path d="M32 56 V62" />
      <path d="M50 10 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2Z" fill="currentColor" stroke="none" />
      <path d="M12 26 l0.9 2 2 0.9 -2 0.9 -0.9 2 -0.9 -2 -2 -0.9 2 -0.9Z" fill="currentColor" stroke="none" />
    </>
  )
}

const motifs = { mehendi: Paisley, haldi: Marigold, sangeet: Lantern, wedding: Kalash, reception: Lantern }

export function EventMotifIcon({ motif, ...props }: SvgProps & { motif: keyof typeof motifs }) {
  const Motif = motifs[motif]
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <Motif />
    </svg>
  )
}
