const WASH = {
  ivory: 'var(--color-ivory)',
  paper: 'var(--color-paper)',
  night: 'var(--color-night)',
  wine: 'var(--color-wine)',
  /** Matches the RSVP ground, which is champagne at 60% over the ivory page. */
  rsvp: 'color-mix(in srgb, var(--color-champagne) 60%, var(--color-ivory))',
} as const

/** A soft carry of the previous section's colour across the join. */
export function SectionWash({ from }: { from: keyof typeof WASH }) {
  const color = WASH[from]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[clamp(4.75rem,12vw,9rem)]"
      style={{
        background: `linear-gradient(to bottom, ${color} 0%, color-mix(in srgb, ${color} 46%, transparent) 48%, transparent 100%)`,
      }}
    />
  )
}
