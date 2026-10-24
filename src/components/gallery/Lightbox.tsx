import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { WeddingImage } from '../../data/types'
import { easeOut } from '../../lib/motion'
import { useReducedMotionPref } from '../../hooks/useMediaQuery'
import { useSmoothScroll } from '../providers/smoothScrollContext'
import { imageSources } from '../../lib/images'
import { WarmWash } from './WarmWash'

interface Props {
  images: WeddingImage[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

/** Accessible modal viewer: arrow keys, Escape, swipe, focus trap and focus return. */
export function Lightbox({ images, index, onClose, onNavigate }: Props) {
  const { lock, unlock } = useSmoothScroll()
  const reduced = useReducedMotionPref()
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [direction, setDirection] = useState(0)
  const image = images[index]
  const count = images.length

  const go = (delta: number) => {
    setDirection(delta)
    onNavigate((index + delta + count) % count)
  }
  const goRef = useRef(go)
  const closeRef = useRef(onClose)
  useEffect(() => {
    goRef.current = go
    closeRef.current = onClose
  })

  useEffect(() => {
    lock()
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButton.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      else if (e.key === 'ArrowRight') goRef.current(1)
      else if (e.key === 'ArrowLeft') goRef.current(-1)
      else if (e.key === 'Tab' && dialog.current) {
        const focusable = dialog.current.querySelectorAll<HTMLElement>('button')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      unlock()
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [lock, unlock])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1)
    else if (info.offset.x > 60) go(-1)
  }

  const { src, srcSet } = imageSources(image)
  const shift = reduced ? 0 : 60

  return (
    <motion.div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
      className="on-dark fixed inset-0 z-[70] flex flex-col bg-night/96 text-ivory"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-2 sm:px-8">
        <p className="text-[0.7rem] tracking-[0.3em] text-ivory/70 uppercase tabular" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </p>
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Close gallery" className="flex size-11 items-center justify-center rounded-full border border-ivory/20 hover:border-gold-soft">
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 sm:px-20">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.figure
            key={image.src}
            custom={direction}
            className="flex max-h-full max-w-full flex-col items-center"
            initial={{ opacity: 0, x: direction * shift }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * shift }}
            transition={{ duration: 0.6, ease: easeOut }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={onDragEnd}
          >
            <div className="relative isolate">
              <img
                src={src}
                srcSet={srcSet}
                sizes="100vw"
                alt={image.alt}
                width={image.width}
                height={image.height}
                draggable={false}
                className="max-h-[calc(100svh-11rem)] w-auto object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
              />
              {image.warm && <WarmWash />}
            </div>
            {image.caption && <figcaption className="mt-4 font-display text-lg text-ivory/85 italic">{image.caption}</figcaption>}
          </motion.figure>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/20 bg-night/40 hover:border-gold-soft sm:left-6 sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/20 bg-night/40 hover:border-gold-soft sm:right-6 sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Thumb-reachable controls on phones */}
      <div className="flex items-center justify-center gap-6 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] sm:hidden">
        <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="flex size-12 items-center justify-center rounded-full border border-ivory/25">
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-[0.65rem] tracking-[0.25em] text-ivory/55 uppercase">Swipe</p>
        <button type="button" onClick={() => go(1)} aria-label="Next photo" className="flex size-12 items-center justify-center rounded-full border border-ivory/25">
          <ChevronRight className="size-5" />
        </button>
      </div>
    </motion.div>
  )
}
