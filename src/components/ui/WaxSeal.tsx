import { useId, type SVGProps } from 'react'
import { mediaUrl } from '../../lib/media'
import { waxPath } from '../../lib/seal'

/** Burgundy wax seal with gold-foil monogram; the DOM twin of the 3D seal. */
export function WaxSeal(props: SVGProps<SVGSVGElement>) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="-60 -60 120 120" aria-hidden="true" {...props}>
      <defs>
        <radialGradient id={`wax-${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#8e2a3e" />
          <stop offset="55%" stopColor="#5e1a2c" />
          <stop offset="100%" stopColor="#3a0e1a" />
        </radialGradient>
        <linearGradient id={`foil-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3dfa6" />
          <stop offset="50%" stopColor="#c9a256" />
          <stop offset="100%" stopColor="#8f6a2a" />
        </linearGradient>
      </defs>
      <ellipse cx="1" cy="5" rx="46" ry="42" fill="#2a0a12" opacity="0.22" />
      <path d={waxPath(54)} fill={`url(#wax-${id})`} />
      <circle r={42} fill="none" stroke="#2c0a13" strokeOpacity={0.35} strokeWidth={2.4} />
      <circle r={40} fill="none" stroke={`url(#foil-${id})`} strokeWidth={1.15} />
      <circle r={33.5} fill="none" stroke={`url(#foil-${id})`} strokeWidth={0.6} />
      {Array.from({ length: 28 }, (_, i) => {
        const t = (i / 28) * Math.PI * 2
        return <circle key={i} cx={Math.cos(t) * 36.7} cy={-Math.sin(t) * 36.7} r={0.7} fill={`url(#foil-${id})`} />
      })}
      <image href={mediaUrl('logos/logo.webp')} x={-23} y={-23} width={46} height={46} />
      <path d="M-30 -18 A36 36 0 0 1 -6 -34" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  )
}
