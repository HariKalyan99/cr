import { AnimatePresence, motion } from 'framer-motion'
import { CalendarPlus, Download } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { downloadIcs, googleCalendarUrl, type CalendarEntry } from '../../lib/calendar'
import { transition } from '../../lib/motion'

/** "Add to calendar" with Google Calendar and a universal .ics (Apple, Outlook, etc.). */
export function CalendarMenu({ entry, label = 'Add to calendar', className = 'btn btn-outline' }: { entry: CalendarEntry; label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const google = googleCalendarUrl(entry)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!google) return null

  return (
    <div ref={wrapper} className="relative inline-block">
      <button type="button" className={className} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((v) => !v)}>
        <CalendarPlus className="size-4" aria-hidden="true" />
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            className="absolute left-0 top-full z-20 mt-2 w-60 overflow-hidden rounded-xl border border-gold/30 bg-ivory p-1.5 text-ink shadow-[0_20px_50px_-20px_rgba(42,30,27,0.45)]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={transition.quick}
          >
            <a
              href={google}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-champagne/60"
            >
              <CalendarPlus className="size-4 text-gold-deep" aria-hidden="true" />
              Google Calendar
            </a>
            <button
              type="button"
              onClick={() => {
                downloadIcs(entry)
                setOpen(false)
              }}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-champagne/60"
            >
              <Download className="size-4 text-gold-deep" aria-hidden="true" />
              Apple / Outlook (.ics)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
