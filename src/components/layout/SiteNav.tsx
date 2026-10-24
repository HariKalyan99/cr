import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { SoundToggle } from '../audio/WeddingMusic'
import { wedding } from '../../data/wedding'
import { MonogramLogo } from '../ui/ornaments'
import { easeOut, transition } from '../../lib/motion'
import { useSmoothScroll } from '../providers/smoothScrollContext'

const LINKS = [
  { href: '#story', label: 'Story' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#events', label: 'Celebrations' },
  { href: '#venue', label: 'Venue' },
]

export function SiteNav({ visible }: { visible: boolean }) {
  const { scrollTo, lock, unlock } = useSmoothScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setOpen(false)
    // Wait a frame so the scroll lock from the mobile menu is released first.
    requestAnimationFrame(() => scrollTo(href, { offset: href === '#top' ? 0 : -24 }))
  }

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-40 safe-top transition-[background-color,box-shadow] duration-500 ${
          scrolled && !open ? 'bg-ivory/92 shadow-[0_1px_0_rgba(184,146,74,0.25)] backdrop-blur-[6px]' : 'bg-transparent'
        }`}
        initial={false}
        animate={{ y: visible ? 0 : -90, opacity: visible ? 1 : 0 }}
        transition={{ ...transition.base, delay: visible ? 0.6 : 0 }}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between pl-5 pr-[4.75rem] sm:h-20 sm:pl-10 sm:pr-[5.25rem]">
          <a
            href="#top"
            onClick={(e) => go(e, '#top')}
            className="flex size-11 items-center justify-center"
            aria-label={`${wedding.couple.partnerOne} and ${wedding.couple.partnerTwo} — back to top`}
          >
            <MonogramLogo className="h-10 w-10" />
          </a>

          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={(e) => go(e, link.href)} className="text-link inline-flex min-h-11 items-center text-[0.72rem] font-medium tracking-[0.18em] text-ink uppercase lg:tracking-[0.24em]">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#rsvp" onClick={(e) => go(e, '#rsvp')} className="btn btn-solid min-h-11 px-5 py-2 text-[0.7rem]">
                RSVP
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-2 md:hidden">
            <a href="#rsvp" onClick={(e) => go(e, '#rsvp')} className="btn btn-solid min-h-11 px-4 py-2 text-[0.68rem]">
              RSVP
            </a>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative z-50 flex size-11 items-center justify-center rounded-full text-ink"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>
      {visible && (
        <SoundToggle className="fixed z-50 top-[max(env(safe-area-inset-top),0.6rem)] right-[max(env(safe-area-inset-right),0.7rem)] sm:top-[max(env(safe-area-inset-top),1.15rem)] sm:right-[max(env(safe-area-inset-right),1.15rem)]" />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site sections"
            className="paper-grain fixed inset-0 z-30 flex flex-col justify-center bg-ivory px-8 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition.quick}
          >
            <ul className="space-y-3">
              {[...LINKS, { href: '#rsvp', label: 'RSVP' }].map((link, i) => (
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
                    className="flex min-h-11 items-baseline gap-4 py-2 font-display text-[clamp(2.15rem,10vw,2.75rem)] leading-tight text-ink"
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
