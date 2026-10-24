import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const SRC = '/music/wed1.mp3'

type MusicControls = {
  /** True while the track is playing and not muted. */
  on: boolean
  /** Start from the beginning, looping, in the same turn as the seal tap. */
  start: () => void
  toggle: () => void
}

const MusicContext = createContext<MusicControls | null>(null)

export function useWeddingMusic() {
  const music = useContext(MusicContext)
  if (!music) throw new Error('Wedding music is only available inside WeddingMusic')
  return music
}

export function WeddingMusic({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [on, setOn] = useState(false)

  const start = useCallback(() => {
    const el = audio.current
    if (!el) return
    el.loop = true
    el.muted = false
    try {
      el.currentTime = 0
    } catch {
      /* The file may not be seekable on the first instant of the tap. */
    }
    const pending = el.play()
    setOn(true)
    pending?.catch(() => setOn(false))
  }, [])

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el) return
    if (el.paused || el.muted) {
      el.loop = true
      el.muted = false
      const pending = el.play()
      setOn(true)
      pending?.catch(() => setOn(false))
      return
    }
    el.muted = true
    setOn(false)
  }, [])

  return (
    <MusicContext.Provider value={{ on, start, toggle }}>
      <audio ref={audio} src={SRC} loop preload="auto" />
      {children}
    </MusicContext.Provider>
  )
}

/** Three arcs that grow outward. They rest lighter while the music is silent. */
function WaveIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-6 ${muted ? 'opacity-45' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M3.5 9.4a4.4 4.4 0 0 1 0 5.2" />
      <path d="M8.2 6.2a8.2 8.2 0 0 1 0 11.6" />
      <path d="M13 3a12 12 0 0 1 0 18" />
    </svg>
  )
}

/** Small mute control, fixed to the corner by the caller. */
export function SoundToggle({ className = '' }: { className?: string }) {
  const { on, toggle } = useWeddingMusic()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute music' : 'Play music'}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/55 bg-ivory/92 text-burgundy shadow-[0_8px_18px_-10px_rgba(42,14,20,0.55)] backdrop-blur-sm transition-colors hover:border-gold ${className}`}
    >
      <WaveIcon muted={!on} />
    </button>
  )
}
