import { AnimatePresence, motion } from 'framer-motion'
import { CalendarPlus, Download } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { downloadIcs, googleCalendarUrl, type CalendarEntry } from '../../lib/calendar'
import { transition } from '../../lib/motion'

type MenuBox = { top: number; left: number; width: number }

/** "Add to calendar" with Google Calendar and a universal .ics (Apple, Outlook, etc.). */
export function CalendarMenu({
  entry,
  label = 'Add to calendar',
  className = 'btn btn-outline',
  menuClassName = 'left-0',
}: {
  entry: CalendarEntry
  label?: string
  className?: string
  menuClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [box, setBox] = useState<MenuBox | null>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const google = googleCalendarUrl(entry)
  const alignEnd = menuClassName.includes('right-0')

  useEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = wrapper.current?.querySelector('button')
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const gap = 8
      const menuHeight = 112
      const width = Math.min(Math.max(rect.width, 240), window.innerWidth - 16)
      const roomBelow = window.innerHeight - rect.bottom
      const top = roomBelow < menuHeight + gap && rect.top > menuHeight + gap ? rect.top - gap - menuHeight : rect.bottom + gap
      const preferEnd = alignEnd && window.innerWidth >= 1024
      const rawLeft = preferEnd ? rect.right - width : rect.left
      const left = Math.max(8, Math.min(rawLeft, window.innerWidth - width - 8))
      setBox({ top, left, width })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, alignEnd])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (wrapper.current?.contains(target) || menu.current?.contains(target)) return
      setOpen(false)
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
    <div ref={wrapper} className="relative w-full sm:w-auto">
      <button type="button" className={`${className} whitespace-nowrap`} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((v) => !v)}>
        <CalendarPlus className="size-4" aria-hidden="true" />
        {label}
      </button>
      {createPortal(
        <AnimatePresence>
          {open && box && (
            <motion.div
              ref={menu}
              id={menuId}
              className="fixed z-[55] overflow-hidden rounded-xl border border-gold/30 bg-ivory p-1.5 text-ink shadow-[0_20px_50px_-20px_rgba(42,30,27,0.45)]"
              style={{ top: box.top, left: box.left, width: box.width }}
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
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
