import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CoupleStory } from './components/story/CoupleStory'
import { ClosingScene } from './components/closing/ClosingScene'
import { WeddingCountdown } from './components/countdown/WeddingCountdown'
import { WeddingEvents } from './components/events/WeddingEvents'
import { WeddingGallery } from './components/gallery/WeddingGallery'
import { WeddingHero } from './components/hero/WeddingHero'
import { WeddingMusic } from './components/audio/WeddingMusic'
import { InvitationIntro } from './components/invitation/InvitationIntro'
import { SiteNav } from './components/layout/SiteNav'
import { SmoothScroll } from './components/providers/SmoothScroll'
import { RSVPForm } from './components/rsvp/RSVPForm'
import { ArchClipDefs } from './components/ui/ornaments'
import { VenueSection } from './components/venue/VenueSection'
import { ScrollTrigger } from './lib/gsap'

const OPENED_KEY = 'invitation-opened'

function readOpened() {
  try {
    return sessionStorage.getItem(OPENED_KEY) === '1' || new URLSearchParams(location.search).has('skip-intro')
  } catch {
    return false
  }
}

function Experience() {
  // Returning within the same browser session skips straight to the site.
  const [introOpen, setIntroOpen] = useState(() => !readOpened())
  const heading = useRef<HTMLHeadingElement>(null)
  const [revealed, setRevealed] = useState(!introOpen)

  const finishIntro = useCallback(() => {
    setIntroOpen(false)
    setRevealed(true)
    try {
      sessionStorage.setItem(OPENED_KEY, '1')
    } catch {
      /* storage unavailable (private mode) — the intro simply shows again next time */
    }
  }, [])

  const replayIntro = useCallback(() => {
    setRevealed(false)
    setIntroOpen(true)
  }, [])

  // Hand focus to the page heading once the intro closes, and re-measure scroll triggers.
  useEffect(() => {
    if (introOpen) return
    heading.current?.focus({ preventScroll: true })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [introOpen])

  return (
    <>
      <ArchClipDefs />
      <AnimatePresence>{introOpen && <InvitationIntro key="intro" onComplete={finishIntro} />}</AnimatePresence>
      <SiteNav visible={!introOpen} />
      <main id="main" inert={introOpen}>
        <WeddingHero revealed={revealed} headingRef={heading} />
        <CoupleStory />
        <WeddingGallery />
        <WeddingEvents />
        <WeddingCountdown />
        <VenueSection />
        <RSVPForm />
        <ClosingScene onReplay={replayIntro} />
      </main>
    </>
  )
}

export default function App() {
  return (
    <WeddingMusic>
      <SmoothScroll>
        <Experience />
      </SmoothScroll>
    </WeddingMusic>
  )
}
