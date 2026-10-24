import { parseDate } from './dates'

export interface CalendarEntry {
  id: string
  title: string
  start: string
  end: string
  location: string
  description: string
}

/** 20270212T130000Z */
const toUtcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function googleCalendarUrl(entry: CalendarEntry) {
  const start = parseDate(entry.start)
  const end = parseDate(entry.end)
  if (!start || !end) return null
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: entry.title,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: entry.description,
    location: entry.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const escapeIcs = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

/** RFC 5545 requires lines longer than 75 octets to be folded. */
function foldLine(line: string) {
  const out: string[] = []
  let rest = line
  while (rest.length > 74) {
    out.push(rest.slice(0, 74))
    rest = ' ' + rest.slice(74)
  }
  out.push(rest)
  return out.join('\r\n')
}

export function buildIcs(entry: CalendarEntry) {
  const start = parseDate(entry.start)
  const end = parseDate(entry.end)
  if (!start || !end) return null
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${entry.id}@wedding-invitation`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeIcs(entry.title)}`,
    `DESCRIPTION:${escapeIcs(entry.description)}`,
    `LOCATION:${escapeIcs(entry.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

/** Triggers a download of an .ics file (opens Calendar directly on iOS/macOS). */
export function downloadIcs(entry: CalendarEntry) {
  const ics = buildIcs(entry)
  if (!ics) return false
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entry.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
