import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, MailOpen } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { wedding } from '../../data/wedding'
import { formatDotted, parseDate } from '../../lib/dates'
import { getDeviceTier, hasWebGL } from '../../lib/device'
import { easeInOut, transition } from '../../lib/motion'
import { useReducedMotionPref } from '../../hooks/useMediaQuery'
import { useSmoothScroll } from '../providers/smoothScrollContext'
import { SceneErrorBoundary } from '../three/SceneErrorBoundary'
import { CornerFloral, Mandala } from '../ui/ornaments'
import { CssEnvelope } from './CssEnvelope'
import type { IntroPhase } from './types'

const InvitationScene = lazy(() => import('../three/InvitationScene'))

/** How long the presented card is held before handing over to the site. */
const CARD_HOLD_MS = 1300

export function InvitationIntro({ onComplete }: { onComplete: () => void }) {
  const reduced = useReducedMotionPref()
  const { lock, unlock } = useSmoothScroll()
  const [phase, setPhase] = useState<IntroPhase>('idle')
  const [tier] = useState(getDeviceTier)
  const [webgl] = useState(hasWebGL)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  /** Which renderer plays the opening; fixed at the moment the guest opens it. */
  const [renderer, setRenderer] = useState<'3d' | 'css' | null>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const completeRef = useRef(onComplete)
  useEffect(() => {
    completeRef.current = onComplete
  })

  const can3D = webgl && !sceneFailed && !reduced
  const show3D = can3D && sceneReady && renderer !== 'css'
  const idle = phase === 'idle'

  useEffect(() => {
    lock()
    window.scrollTo(0, 0)
    ctaRef.current?.focus({ preventScroll: true })
    return () => unlock()
  }, [lock, unlock])

  const open = useCallback(() => {
    if (phase !== 'idle') return
    setRenderer(show3D ? '3d' : 'css')
    setPhase('opening')
  }, [phase, show3D])

  const handleRevealed = useCallback(() => setPhase('card'), [])

  useEffect(() => {
    if (phase !== 'card') return
    const t = setTimeout(() => completeRef.current(), reduced ? 700 : CARD_HOLD_MS)
    return () => clearTimeout(t)
  }, [phase, reduced])

  // If WebGL dies mid-opening, don't leave the guest stuck — go straight to the site.
  useEffect(() => {
    if (sceneFailed && renderer === '3d') completeRef.current()
  }, [sceneFailed, renderer])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') completeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const date = parseDate(wedding.weddingDateTime)
  const { partnerOne, partnerTwo } = wedding.couple

  return (
    <motion.section
      aria-label="Wedding invitation"
      className="on-dark fixed inset-0 z-[60] overflow-hidden text-ivory select-none"
      style={{
        background: 'radial-gradient(ellipse 85% 70% at 50% 46%, #4f1828 0%, #2b0c17 52%, #14060b 100%)',
      }}
      exit={{ opacity: 0, scale: reduced ? 1 : 1.04, transition: { duration: reduced ? 0.3 : 1.05, ease: easeInOut } }}
    >
      {/* Atmosphere: mandala, foil frame, corner florals, warm key light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_38%_at_50%_42%,rgba(255,214,160,0.16),transparent_70%)]" />
        <motion.div
          className="absolute left-1/2 top-1/2 w-[150vmin] -translate-x-1/2 -translate-y-1/2 text-gold-soft/[0.09]"
          animate={{ rotate: idle ? 0 : 25, scale: idle ? 1 : 1.12 }}
          transition={{ duration: 4, ease: easeInOut }}
        >
          <Mandala className="w-full" />
        </motion.div>
        <div className="absolute inset-3 border border-gold-soft/25 sm:inset-5" />
        <div className="absolute inset-[18px] border border-gold-soft/10 sm:inset-[26px]" />
        {[
          'left-2 top-2',
          'right-2 top-2 -scale-x-100',
          'bottom-2 left-2 -scale-y-100',
          'bottom-2 right-2 -scale-100',
        ].map((pos) => (
          <CornerFloral key={pos} className={`absolute size-24 text-gold-soft/45 sm:size-36 ${pos}`} />
        ))}
      </div>

      {/* 3D invitation */}
      {can3D && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: show3D ? 1 : 0 }} transition={{ duration: 0.9 }}>
          <SceneErrorBoundary onError={() => setSceneFailed(true)}>
            <Suspense fallback={null}>
              <InvitationScene
                phase={renderer === 'css' ? 'idle' : phase}
                tier={tier}
                onReady={() => setSceneReady(true)}
                onRevealed={handleRevealed}
                onContextLost={() => setSceneFailed(true)}
              />
            </Suspense>
          </SceneErrorBoundary>
        </motion.div>
      )}

      {/* CSS invitation (fallback / reduced motion / while 3D loads) */}
      <AnimatePresence>
        {!show3D && (
          <motion.div
            key="css-envelope"
            className="absolute inset-0 flex translate-y-[6svh] items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8, delay: can3D ? 0.6 : 0 } }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <CssEnvelope phase={phase} onRevealed={handleRevealed} reduced={reduced} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Large tap target over the envelope (the visible button below is the accessible control) */}
      {idle && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={open}
          className="absolute inset-x-0 top-[24%] bottom-[20%] cursor-pointer short:top-[28%] short:bottom-[24%]"
        />
      )}

      {/* Title */}
      <motion.header
        className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[max(env(safe-area-inset-top),0px)] text-center"
        initial={{ opacity: 0, y: reduced ? 0 : -12 }}
        animate={{ opacity: idle ? 1 : 0, y: idle || reduced ? 0 : -24 }}
        transition={transition.base}
      >
        <div className="mt-[clamp(3.5rem,11vh,7rem)] short:mt-7">
          <p className="eyebrow short:hidden">The wedding celebration of</p>
          <p className="display mt-3 text-[clamp(2.4rem,8.5vw,4.6rem)] text-gold-soft short:mt-0 short:text-[2.2rem]">
            {partnerOne} <span className="mx-[0.05em] italic text-gold">&amp;</span> {partnerTwo}
          </p>
          {date && (
            <p className="mt-3 text-[0.72rem] tracking-[0.38em] text-ivory/70 uppercase short:mt-1">
              {formatDotted(date)} <span className="mx-2 text-gold">◆</span> {wedding.city}
            </p>
          )}
        </div>
      </motion.header>

      {/* Call to action */}
      <motion.div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom)+clamp(1.75rem,7vh,4rem))] short:pb-4"
        initial={{ opacity: 0, y: reduced ? 0 : 16 }}
        animate={{ opacity: idle ? 1 : 0, y: idle || reduced ? 0 : 16 }}
        transition={{ ...transition.base, delay: idle ? 0.3 : 0 }}
      >
        <button
          ref={ctaRef}
          type="button"
          onClick={open}
          disabled={!idle}
          className="btn btn-gold relative shadow-[0_10px_40px_-10px_rgba(233,200,126,0.6)]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-gold-soft [animation:seal-pulse_2.6s_ease-in-out_infinite]"
          />
          <MailOpen className="size-4" aria-hidden="true" />
          Open your invitation
        </button>
        <p className="text-[0.7rem] tracking-[0.2em] text-ivory/55 uppercase short:hidden">Tap the seal or press Enter</p>
      </motion.div>

      {/* Skip */}
      <button
        type="button"
        onClick={() => completeRef.current()}
        className="absolute right-[max(env(safe-area-inset-right),1.25rem)] top-[max(env(safe-area-inset-top),1.25rem)] z-10 inline-flex min-h-11 items-center gap-1 rounded-full px-4 text-[0.7rem] font-medium tracking-[0.22em] text-ivory/75 uppercase transition-colors hover:text-ivory sm:right-8 sm:top-8"
      >
        Skip intro <ChevronRight className="size-3.5" aria-hidden="true" />
      </button>

      <p className="sr-only" aria-live="polite">
        {phase === 'card'
          ? `Your invitation is open. ${wedding.invitationCard.preface}, ${partnerOne} and ${partnerTwo} ${wedding.invitationCard.request}.`
          : ''}
      </p>
    </motion.section>
  )
}
