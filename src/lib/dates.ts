import { wedding } from '../data/wedding'

const zone = wedding.timeZone

export function parseDate(iso: string | undefined | null): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, ...options })

const weekdayFmt = fmt({ weekday: 'long' })
const longDateFmt = fmt({ day: 'numeric', month: 'long', year: 'numeric' })
const shortDateFmt = fmt({ day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' })
const partsFmt = fmt({ day: '2-digit', month: '2-digit', year: 'numeric' })
const monthFmt = fmt({ month: 'long' })
const dayFmt = fmt({ day: 'numeric' })
const yearFmt = fmt({ year: 'numeric' })

/** "Friday" */
export const formatWeekday = (d: Date) => weekdayFmt.format(d)
/** "12 February 2027" */
export const formatLongDate = (d: Date) => longDateFmt.format(d)
/** "12 Feb" */
export const formatShortDate = (d: Date) => shortDateFmt.format(d)
/** "6:30 PM" */
export const formatTime = (d: Date) => timeFmt.format(d)
/** "February" */
export const formatMonth = (d: Date) => monthFmt.format(d)
/** "12" */
export const formatDay = (d: Date) => dayFmt.format(d)
/** "2027" */
export const formatYear = (d: Date) => yearFmt.format(d)

/** `2026-10-27` in the wedding time zone. */
export function istDateKey(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

/** The next calendar day after a `YYYY-MM-DD` key, without a time-zone shift. */
export function nextDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  return next.toISOString().slice(0, 10)
}

/** True while the event's calendar day has not ended in the wedding time zone. */
export function isEventDayCurrent(startIso: string, today = new Date()) {
  const start = parseDate(startIso)
  if (!start) return true
  return istDateKey(start) >= istDateKey(today)
}

/** "12 · 02 · 2027" */
export function formatDotted(d: Date) {
  const parts = Object.fromEntries(partsFmt.formatToParts(d).map((p) => [p.type, p.value]))
  return `${parts.day} · ${parts.month} · ${parts.year}`
}

/** Formats a yyyy-mm-dd string without shifting it across time zones. */
export function formatPlainDate(isoDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null
  const d = parseDate(`${isoDate}T12:00:00Z`)
  return d ? new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(d) : null
}
