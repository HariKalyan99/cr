import { useId, type SVGProps } from 'react'
import { wedding } from '../../data/wedding'
import { waxPath } from '../../lib/seal'

/** Burgundy wax seal with gold-foil monogram; the DOM twin of the 3D seal. */
export function WaxSeal(props: SVGProps<SVGSVGElement>) {
  const id = useId().replace(/:/g, '')
  const [a, b] = wedding.couple.monogram
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
        <filter id={`shadow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2a0a12" floodOpacity="0.35" />
        </filter>
        <filter id={`stamp-${id}`} x="-30%" y="-40%" width="160%" height="180%">
          <feOffset dx="0.7" dy="1" in="SourceAlpha" result="off" />
          <feFlood floodColor="#2a0810" floodOpacity="0.8" result="dark" />
          <feComposite in="dark" in2="off" operator="in" result="shade" />
          <feOffset dx="-0.45" dy="-0.6" in="SourceAlpha" result="hi" />
          <feFlood floodColor="#fff1d4" floodOpacity="0.85" result="light" />
          <feComposite in="light" in2="hi" operator="in" result="glint" />
          <feMerge>
            <feMergeNode in="shade" />
            <feMergeNode in="glint" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={waxPath(54)} fill={`url(#wax-${id})`} filter={`url(#shadow-${id})`} />
      <circle r={42} fill="none" stroke="#2c0a13" strokeOpacity={0.35} strokeWidth={2.4} />
      <circle r={40} fill="none" stroke={`url(#foil-${id})`} strokeWidth={1.15} />
      <circle r={33.5} fill="none" stroke={`url(#foil-${id})`} strokeWidth={0.6} />
      {Array.from({ length: 28 }, (_, i) => {
        const t = (i / 28) * Math.PI * 2
        return <circle key={i} cx={Math.cos(t) * 36.7} cy={-Math.sin(t) * 36.7} r={0.7} fill={`url(#foil-${id})`} />
      })}
      <g filter={`url(#stamp-${id})`} fill={`url(#foil-${id})`} fontFamily="var(--font-display)">
        <text x={-12} y={6.5} textAnchor="middle" fontSize={24}>
          {a}
        </text>
        <text x={12} y={6.5} textAnchor="middle" fontSize={24}>
          {b}
        </text>
        <path d="M0 -4.4 L2.4 0 L0 4.4 L-2.4 0 Z" />
      </g>
      <path d="M-30 -18 A36 36 0 0 1 -6 -34" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  )
}
