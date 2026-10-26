import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { mediaUrl } from '../../lib/media'

const SRC = mediaUrl('music/main_song.mp3')

/** Silence after the seal tap, before the first note. */
const START_DELAY_MS = 700
/** Rise from silence to full volume. */
const FADE_IN_MS = 1000

type MusicControls = {
  /** True while the track is playing and not muted. */
  on: boolean
  /** Start from the beginning, looping. The note waits, then fades in. */
  start: () => void
  toggle: () => void
}

const MusicContext = createContext<MusicControls | null>(null)

export function useWeddingMusic() {
  const music = useContext(MusicContext)
  if (!music) throw new Error('Wedding music is only available inside WeddingMusic')
  return music
}

type Hear = 'off' | 'waiting' | 'playing'

function audioContext() {
  const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  return Ctor ? new Ctor() : null
}

export function WeddingMusic({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const hear = useRef<Hear>('off')
  const delay = useRef(0)
  const [on, setOn] = useState(false)

  const clearDelay = () => {
    window.clearTimeout(delay.current)
    delay.current = 0
  }

  useEffect(() => clearDelay, [])

  /** One gain node so phones, which ignore element volume, still fade. */
  const wire = (el: HTMLAudioElement) => {
    if (gainRef.current) return gainRef.current
    try {
      const ctx = audioContext()
      if (!ctx) return null
      const source = ctx.createMediaElementSource(el)
      const gain = ctx.createGain()
      gain.gain.value = 0
      source.connect(gain)
      gain.connect(ctx.destination)
      ctxRef.current = ctx
      gainRef.current = gain
      return gain
    } catch {
      return null
    }
  }

  const silence = () => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    if (ctx && gain) {
      gain.gain.cancelScheduledValues(ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      return
    }
    if (audio.current) audio.current.volume = 0
  }

  const fadeIn = (ms: number) => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    if (ctx && gain) {
      const now = ctx.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(1, now + ms / 1000)
      return
    }
    const el = audio.current
    if (!el) return
    const started = performance.now()
    const step = (now: number) => {
      if (hear.current !== 'playing') return
      const t = Math.min(1, (now - started) / ms)
      el.volume = t
      if (t < 1) requestAnimationFrame(step)
    }
    el.volume = 0
    requestAnimationFrame(step)
  }

  /** `delayMs` is silence before the first note. Playback is unlocked on this call. */
  const playFrom = useCallback((delayMs: number, fromStart: boolean) => {
    const el = audio.current
    if (!el) return
    clearDelay()
    el.loop = true
    el.muted = false
    wire(el)
    silence()
    void ctxRef.current?.resume()
    setOn(true)

    const rewind = () => {
      if (!fromStart) return
      try {
        el.currentTime = 0
      } catch {
        /* The file may not be seekable on the first instant of the tap. */
      }
    }

    const begin = () => {
      if (hear.current === 'off') return
      hear.current = 'playing'
      rewind()
      void ctxRef.current?.resume()
      el.play()
        ?.then(() => fadeIn(FADE_IN_MS))
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          hear.current = 'off'
          setOn(false)
        })
    }

    rewind()
    if (delayMs <= 0) {
      hear.current = 'playing'
      begin()
      return
    }

    // Unlock in this gesture, then hold the start of the track until the delay ends.
    hear.current = 'waiting'
    el.play()
      ?.then(() => {
        if (hear.current !== 'waiting') return
        el.pause()
        rewind()
      })
      .catch((err: unknown) => {
        if (hear.current !== 'waiting') return
        if (err instanceof DOMException && err.name === 'AbortError') return
        hear.current = 'off'
        setOn(false)
      })

    delay.current = window.setTimeout(() => {
      delay.current = 0
      begin()
    }, delayMs)
  }, [])

  const start = useCallback(() => playFrom(START_DELAY_MS, true), [playFrom])

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el) return
    if (hear.current === 'off') {
      playFrom(0, false)
      return
    }
    clearDelay()
    hear.current = 'off'
    silence()
    el.pause()
    setOn(false)
  }, [playFrom])

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
