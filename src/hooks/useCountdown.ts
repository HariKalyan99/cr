import { useEffect, useState } from 'react'
import { parseDate } from '../lib/dates'

export type CountdownState =
  | { status: 'pending' }
  | { status: 'invalid' }
  | { status: 'counting'; days: number; hours: number; minutes: number; seconds: number }
  | { status: 'today' }
  | { status: 'passed' }

const DAY = 86_400_000

function compute(target: Date | null, now: number): CountdownState {
  if (!target) return { status: 'invalid' }
  const diff = target.getTime() - now
  if (diff <= 0) {
    // Treat the 24 hours after the start as "the day itself".
    return -diff < DAY ? { status: 'today' } : { status: 'passed' }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    status: 'counting',
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

/**
 * Live countdown. The first render is always `pending` so the markup is identical
 * on the server and the client if this project ever adopts SSR; the real values
 * arrive in an effect. The ticker re-aligns to wall-clock seconds to avoid drift.
 */
export function useCountdown(targetIso: string): CountdownState {
  const [state, setState] = useState<CountdownState>({ status: 'pending' })

  useEffect(() => {
    const target = parseDate(targetIso)
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const now = Date.now()
      const next = compute(target, now)
      setState(next)
      if (next.status === 'counting' || next.status === 'today') {
        timer = setTimeout(tick, 1000 - (now % 1000) + 5)
      }
    }
    tick()

    // Background tabs throttle timers; resync as soon as the page is visible again.
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer)
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [targetIso])

  return state
}
