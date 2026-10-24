import { wedding } from '../data/wedding'
import { whatsappUrl } from './links'

export interface RsvpData {
  name: string
  attending: 'yes' | 'no'
  guests: number
  events: string[]
  message: string
}

/**
 * Honest result of a submission attempt:
 * - `saved`: the configured endpoint accepted the response.
 * - `not-configured`: no endpoint is set, so nothing was stored anywhere.
 * - `error`: the endpoint rejected the request or was unreachable.
 */
export type RsvpResult =
  | { status: 'saved' }
  | { status: 'not-configured' }
  | { status: 'error'; message: string }

export const isRsvpEndpointConfigured = () => /^https:\/\//.test(wedding.rsvp.endpoint)

/**
 * Submission adapter. Posts JSON to `wedding.rsvp.endpoint`, which works out of the
 * box with Formspree and most form/back-end services (Google Apps Script, Netlify
 * functions, Supabase edge functions…). Swap this function to integrate anything else.
 */
export async function submitRsvp(data: RsvpData): Promise<RsvpResult> {
  if (!isRsvpEndpointConfigured()) return { status: 'not-configured' }
  try {
    const res = await fetch(wedding.rsvp.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
    })
    if (!res.ok) return { status: 'error', message: `The RSVP service responded with ${res.status}.` }
    return { status: 'saved' }
  } catch {
    return { status: 'error', message: 'We could not reach the RSVP service. Please check your connection.' }
  }
}

export function rsvpWhatsappMessage(data: RsvpData) {
  const { partnerOne, partnerTwo } = wedding.couple
  const lines = [
    `RSVP · ${partnerOne} & ${partnerTwo}'s wedding`,
    '',
    `Name: ${data.name}`,
    data.attending === 'yes' ? `Attending: Joyfully accepts (${data.guests} ${data.guests === 1 ? 'guest' : 'guests'})` : 'Attending: Regretfully declines',
  ]
  if (data.attending === 'yes' && data.events.length) lines.push(`Celebrations: ${data.events.join(', ')}`)
  if (data.message.trim()) lines.push(`Note: ${data.message.trim()}`)
  return lines.join('\n')
}

export function rsvpWhatsappUrl(data: RsvpData) {
  return whatsappUrl(wedding.rsvp.whatsappNumber, rsvpWhatsappMessage(data))
}
