import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { SoundToggle } from '../audio/WeddingMusic'
import { wedding } from '../../data/wedding'
import { easeOut, transition } from '../../lib/motion'
import { useSmoothScroll } from '../providers/smoothScrollContext'
import { MonogramLogo } from '../ui/ornaments'

const LINKS = [
  { href: '#story', label: 'Story' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#events', label: 'Celebrations' },
  { href: '#venue', label: 'Venue' },
  { href: '#rsvp', label: 'RSVP' },
]

const control =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/55 bg-ivory/92 text-burgundy shadow-[0_8px_18px_-10px_rgba(42,14,20,0.55)] backdrop-blur-sm transition-colors hover:border-gold'

export function SiteNav({ visible }: { visible: boolean }) {
  const { scrollTo, lock, unlock } = useSmoothScroll()
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const pending = useRef<string | null>(null)

  useEffect(() => {
    if (!open) return
    lock()
    firstLink.current?.focus()
    const button = menuButton.current
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
      button?.focus({ preventScroll: true })
    }
  }, [open, lock, unlock])

  useEffect(() => {
    if (open || !pending.current) return
    const href = pending.current
    pending.current = null
    scrollTo(href, { offset: href === '#top' ? 0 : -16 })
  }, [open, scrollTo])

  useEffect(() => {
    if (!visible) setOpen(false)
  }, [visible])

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (!open) {
      scrollTo(href, { offset: href === '#top' ? 0 : -16 })
      return
    }
    pending.current = href
    setOpen(false)
  }

  return (
    <>
      {visible && (
        <motion.a
          href="#top"
          onClick={(e) => go(e, '#top')}
          aria-label={`${wedding.couple.partnerOne} and ${wedding.couple.partnerTwo} — back to top`}
          className="fixed z-50 flex size-11 items-center justify-center top-[max(env(safe-area-inset-top),0.75rem)] left-[max(env(safe-area-inset-left),0.85rem)] sm:top-[max(env(safe-area-inset-top),1rem)] sm:left-[max(env(safe-area-inset-left),1.25rem)]"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.base, delay: 0.45 }}
        >
          <MonogramLogo className="h-10 w-10" />
        </motion.a>
      )}

      {visible && (
        <motion.div
          className="fixed z-50 flex items-center gap-2 bottom-[max(env(safe-area-inset-bottom),1rem)] right-[max(env(safe-area-inset-right),1rem)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.base, delay: 0.45 }}
        >
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={control}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
          <SoundToggle />
        </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site sections"
            className="paper-grain fixed inset-0 z-40 flex flex-col justify-center bg-ivory px-8 sm:px-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition.quick}
          >
            <ul className="mx-auto w-full max-w-xl space-y-3">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOut, delay: 0.05 + i * 0.05 }}
                >
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    className="flex min-h-11 items-baseline gap-4 py-2 font-display text-[clamp(2.15rem,6vw,3.25rem)] leading-tight text-ink"
                  >
                    <span className="text-xs tracking-[0.2em] text-gold-deep">0{i + 1}</span>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
