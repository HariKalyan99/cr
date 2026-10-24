import type { ReactNode } from 'react'
import { Divider } from './ornaments'

interface Props {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  align?: 'center' | 'left'
  id?: string
}

export function SectionHeading({ eyebrow, title, lede, align = 'center', id }: Props) {
  const centered = align === 'center'
  return (
    <header className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <p className="eyebrow" data-reveal>
        {eyebrow}
      </p>
      <h2 id={id} className="section-title mt-5 text-balance" data-reveal data-reveal-delay="0.08">
        {title}
      </h2>
      <Divider
        className={`mt-6 h-5 w-40 text-gold ${centered ? 'mx-auto' : ''}`}
        data-reveal="line"
        data-reveal-delay="0.2"
      />
      {lede && (
        <p className="lede mt-6 text-pretty" data-reveal data-reveal-delay="0.25">
          {lede}
        </p>
      )}
    </header>
  )
}
