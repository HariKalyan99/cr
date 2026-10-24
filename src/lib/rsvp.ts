import { wedding } from '../data/wedding'
import { whatsappUrl } from './links'

export interface RsvpData {
  name: string
  /** Ten-digit Indian mobile, digits only. */
  phone: string
  attending: 'yes' | 'no'
  guests: number
  events: string[]
  message: string
}

/** Accepts a 10-digit mobile, with an optional 0 or 91 prefix. */
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '')
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits
  return /^[6-9]\d{9}$/.test(local) ? local : ''
}

export function formatPhone(phone: string) {
  return phone.length === 10 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone
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

const supabaseUrl = () => (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '')
const supabaseAnonKey = () => (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** The Supabase `rsvp` edge function, unless `wedding.rsvp.endpoint` names another HTTPS URL. */
export function rsvpEndpoint() {
  const override = wedding.rsvp.endpoint.trim()
  if (/^https:\/\//.test(override)) return override
  const base = supabaseUrl()
  return /^https:\/\//.test(base) ? `${base}/functions/v1/rsvp` : ''
}

export const isRsvpEndpointConfigured = () => {
  const endpoint = rsvpEndpoint()
  if (!/^https:\/\//.test(endpoint)) return false
  if (endpoint.endsWith('/functions/v1/rsvp')) return supabaseAnonKey().length > 0
  return true
}

/**
 * Posts the RSVP to the Supabase edge function. The anon key only authorises the
 * call; the function writes the row with the service role.
 */
export async function submitRsvp(data: RsvpData): Promise<RsvpResult> {
  const endpoint = rsvpEndpoint()
  if (!isRsvpEndpointConfigured()) return { status: 'not-configured' }
  const anon = supabaseAnonKey()
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(anon ? { apikey: anon, Authorization: `Bearer ${anon}` } : {}),
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      let message = `The RSVP service responded with ${res.status}.`
      try {
        const body = (await res.json()) as { error?: unknown }
        if (typeof body.error === 'string' && body.error.length > 0 && body.error.length < 200) message = body.error
      } catch {
        // The status line is enough when the body is not JSON.
      }
      return { status: 'error', message }
    }
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
    `Phone: ${formatPhone(data.phone)}`,
    data.attending === 'yes' ? `Attending: Joyfully accepts (${data.guests} ${data.guests === 1 ? 'guest' : 'guests'})` : 'Attending: Regretfully declines',
  ]
  if (data.attending === 'yes' && data.events.length) lines.push(`Celebrations: ${data.events.join(', ')}`)
  if (data.message.trim()) lines.push(`Note: ${data.message.trim()}`)
  return lines.join('\n')
}

export function rsvpWhatsappUrl(data: RsvpData) {
  return whatsappUrl(wedding.rsvp.whatsappNumber, rsvpWhatsappMessage(data))
}
