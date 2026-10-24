import { Volume2, VolumeX } from 'lucide-react'
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

/** Small mute control. Pass a positioning class when it should float over the invitation. */
export function SoundToggle({ className = '' }: { className?: string }) {
  const { on, toggle } = useWeddingMusic()
  const Icon = on ? Volume2 : VolumeX
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute music' : 'Play music'}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/55 bg-ivory/92 text-burgundy shadow-[0_8px_18px_-10px_rgba(42,14,20,0.55)] backdrop-blur-sm transition-colors hover:border-gold ${className}`}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}
