import { Info } from 'lucide-react'
import { wedding } from '../../data/wedding'

/** Shown next to dates/venues while `isSampleContent` is true, so placeholders never read as confirmed. */
export function SampleNote({ children = 'Sample details · to be confirmed', className = '' }: { children?: string; className?: string }) {
  if (!wedding.isSampleContent) return null
  return (
    <p className={`sample-note ${className}`}>
      <Info className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}
