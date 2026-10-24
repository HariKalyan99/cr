import { useAnimate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { easeInOut, easeOut } from '../../lib/motion'
import { CRACK, waxRadius } from '../../lib/seal'
import { WaxSeal } from '../ui/WaxSeal'
import { InvitationCardContent } from './InvitationCardContent'
import type { InvitationRendererProps } from './types'

const LINER =
  'radial-gradient(circle, rgba(222,190,120,.55) 0 1.1px, transparent 1.5px) 0 0/16px 16px, radial-gradient(circle, rgba(222,190,120,.35) 0 0.8px, transparent 1.2px) 8px 8px/16px 16px, radial-gradient(120% 90% at 50% 40%, #6a1a2e, #3d0f1c)'
const PAPER = 'linear-gradient(170deg, #f5ecdb 0%, #eadcc2 100%)'
const FLAP_PAPER = 'linear-gradient(180deg, #f6eedf 0%, #ebdec6 100%)'

/** Zig-zag crack shared with the 3D seal, expressed as CSS polygons for each half. */
const CRACK_X = ['50%', '50.8%', '49.5%', '50.9%', '49.7%', '50.6%', '49.6%', '50.3%', '50%']
const crackPoints = CRACK_X.map((x, i) => `${x} ${100 - (i * 100) / (CRACK_X.length - 1)}%`)
const SEAL_LEFT = `polygon(0 0, ${[...crackPoints].reverse().join(', ')}, 0 100%)`
const SEAL_RIGHT = `polygon(100% 0, ${[...crackPoints].reverse().join(', ')}, 100% 100%)`
const CRACK_LINE = (() => {
  const top = waxRadius(Math.PI / 2, 54)
  const bottom = waxRadius((3 * Math.PI) / 2, 54)
  return CRACK.map((dx, i) => {
    const y = -bottom + ((top + bottom) * i) / (CRACK.length - 1)
    return `${(dx * 54).toFixed(2)},${(-y).toFixed(2)}`
  }).join(' ')
})()

interface Props extends InvitationRendererProps {
  reduced: boolean
}

/**
 * Layered DOM/CSS-3D envelope. Used when WebGL is unavailable, while the 3D
 * scene loads, and for visitors who prefer reduced motion (opacity-only path).
 */
export function CssEnvelope({ phase, onRevealed, reduced }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const revealedRef = useRef(onRevealed)
  useEffect(() => {
    revealedRef.current = onRevealed
  })

  const started = phase !== 'idle'
  useEffect(() => {
    if (!started || !scope.current) return
    let cancelled = false

    const root = scope.current
    const card = root.querySelector<HTMLElement>('[data-card]')!
    const flap = root.querySelector<HTMLElement>('[data-flap]')!
    const rect = root.getBoundingClientRect()
    const cardW = rect.width * 0.93
    const cardH = rect.height * 0.88
    const scale = Math.min((window.innerWidth * 0.9) / cardW, (window.innerHeight * 0.74) / cardH, 1.8)
    // The card's centre sits at 46% of the envelope height (top 2%, bottom 10% insets).
    const toCenter = window.innerHeight / 2 - (rect.top + rect.height * 0.46)

    // z-index can't be tweened, so a sequence would apply it immediately; restack between stages instead.
    const run = async () => {
      if (reduced) {
        await animate([
          ['[data-env]', { opacity: 0 }, { duration: 0.35 }],
          [flap, { opacity: 0 }, { duration: 0.35, at: 0 }],
          [card, { opacity: 0 }, { duration: 0.35, at: 0 }],
        ])
        if (cancelled) return
        card.style.zIndex = '6'
        await animate(card, { y: [toCenter, toCenter], scale: [scale, scale], opacity: [0, 1] }, { duration: 0.45 })
      } else {
        await animate([
          ['[data-crack]', { opacity: 0 }, { duration: 0.12, at: 0 }],
          ['[data-seal="l"]', { x: '-18%', rotate: -24 }, { duration: 0.25, ease: easeOut }],
          ['[data-seal="r"]', { x: '18%', rotate: 20 }, { duration: 0.25, ease: easeOut, at: '<' }],
          ['[data-seal="l"]', { y: '320%', rotate: -70, opacity: 0 }, { duration: 0.75, ease: 'easeIn' }],
          ['[data-seal="r"]', { y: '340%', rotate: 64, opacity: 0 }, { duration: 0.75, ease: 'easeIn', at: '<' }],
          [flap, { rotateX: 90 }, { duration: 0.5, ease: 'easeIn', at: 0.45 }],
        ])
        if (cancelled) return
        flap.style.zIndex = '1'
        await animate([
          [flap, { rotateX: 178 }, { duration: 0.55, ease: 'easeOut' }],
          [card, { y: -cardH * 0.6 }, { duration: 0.95, ease: easeOut, at: 0.3 }],
        ])
        if (cancelled) return
        card.style.zIndex = '6'
        await animate([
          ['[data-env]', { y: '150%', opacity: 0 }, { duration: 1.05, ease: [0.55, 0, 0.75, 0.2] }],
          [flap, { y: rect.height * 1.5, opacity: 0 }, { duration: 1.05, ease: [0.55, 0, 0.75, 0.2], at: 0 }],
          [card, { y: toCenter, scale }, { duration: 1.3, ease: easeInOut, at: 0.05 }],
        ])
      }
      if (!cancelled) revealedRef.current()
    }
    run()
    return () => {
      cancelled = true
    }
  }, [started, reduced, animate, scope])

  return (
    <div
      ref={scope}
      className={`relative aspect-[3.2/2.1] w-[min(82vw,34rem,calc(41svh*1.524))] ${started ? '[perspective:1600px]' : ''}`}
      aria-hidden="true"
    >
      {/* Back panel (inside of the envelope) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[68%] left-1/2 z-0 h-[34%] w-[92%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(8,1,4,0.55),transparent_68%)] blur-xl"
      />
      <div data-env className="absolute inset-0 z-[1] rounded-[3px] shadow-[0_28px_50px_-18px_rgba(8,1,4,0.72),0_10px_18px_-8px_rgba(8,1,4,0.45)]" style={{ background: LINER }} />

      {/* Card */}
      <div data-card className="absolute inset-x-[3.5%] top-[2%] bottom-[10%] z-[2] overflow-hidden rounded-[3px] shadow-[0_14px_28px_-12px_rgba(20,6,10,0.5)]">
        <InvitationCardContent />
      </div>

      {/* Pocket */}
      <div data-env className="absolute inset-0 z-[3]">
        <div
          className="absolute inset-0"
          style={{ background: PAPER, clipPath: 'polygon(0 0, 50% 52.4%, 100% 0, 100% 100%, 0 100%)' }}
        />
        <svg viewBox="0 0 320 210" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
          <path d="M11 4 L160 104 L309 4" stroke="#b8924a" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          <path d="M0 210 Q96 132 160 126 Q224 132 320 210" stroke="rgba(90,60,30,.25)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M18 207 Q96 142 160 136 Q224 142 302 207" stroke="#b8924a" strokeOpacity="0.7" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* Flap: front paper + liner on the reverse, hinged on the top edge */}
      <div data-flap className={`absolute inset-x-0 top-0 z-[4] h-[62%] origin-top ${started ? '[transform-style:preserve-3d]' : ''}`}>
        <div className={`absolute inset-0 ${started ? '[backface-visibility:hidden]' : ''}`} style={{ background: FLAP_PAPER, clipPath: 'polygon(0 0, 100% 0, 54% 96%, 50% 100%, 46% 96%)' }}>
          <svg viewBox="0 0 320 130" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
            <path d="M16 3 L160 117 L304 3" stroke="#b8924a" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
            <path d="M28 3 L160 108 L292 3" stroke="#b8924a" strokeOpacity="0.6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div
          className={`absolute inset-0 [transform:rotateX(180deg)] ${started ? '[backface-visibility:hidden]' : 'hidden'}`}
          style={{ background: LINER, clipPath: 'polygon(0 0, 100% 0, 54% 96%, 50% 100%, 46% 96%)' }}
        />
      </div>

      {/* Wax seal, split along the crack */}
      <div data-env className="absolute left-1/2 top-[56%] z-[5] aspect-square w-[23%] -translate-x-1/2 -translate-y-1/2">
        <div data-seal="l" className="absolute inset-0" style={{ clipPath: SEAL_LEFT }}>
          <WaxSeal className="size-full" />
        </div>
        <div data-seal="r" className="absolute inset-0" style={{ clipPath: SEAL_RIGHT }}>
          <WaxSeal className="size-full" />
        </div>
        <svg data-crack viewBox="-60 -60 120 120" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
          <polyline points={CRACK_LINE} fill="none" stroke="#3a1218" strokeOpacity={0.4} strokeWidth={0.65} strokeLinejoin="round" strokeLinecap="butt" />
        </svg>
      </div>
    </div>
  )
}
