const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const EVENTS = new Set(['Haldi', 'Mehendi', 'Sangeet', 'Reception', 'Muhurtham'])
const MAX_GUESTS = 6
const MAX_MESSAGE = 500
const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,79}$/u

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function parseRsvp(input: unknown) {
  if (!input || typeof input !== 'object') return { error: 'Please send your RSVP as JSON.' }
  const body = input as Record<string, unknown>
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = normalizePhone(typeof body.phone === 'string' ? body.phone : '')
  const attending = body.attending
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const events = Array.isArray(body.events) ? body.events : []
  const guests = body.guests

  if (!NAME.test(name)) return { error: 'Please enter your full name.' }
  if (!phone) return { error: 'Please enter a 10-digit mobile number.' }
  if (attending !== 'yes' && attending !== 'no') return { error: 'Please let us know whether you can attend.' }
  if (message.length > MAX_MESSAGE) return { error: `Please keep your note under ${MAX_MESSAGE} characters.` }

  if (attending === 'no') {
    return { name, phone, attending, guests: 0, events: [] as string[], message }
  }

  if (typeof guests !== 'number' || !Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    return { error: `Please choose between 1 and ${MAX_GUESTS} guests.` }
  }
  if (events.length === 0 || events.length > EVENTS.size) return { error: 'Please choose at least one celebration.' }
  const chosen = [...new Set(events)]
  if (!chosen.every((event) => typeof event === 'string' && EVENTS.has(event))) {
    return { error: 'Please choose a celebration from the invitation.' }
  }
  return { name, phone, attending, guests, events: chosen, message }
}

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '')
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits
  return /^[6-9]\d{9}$/.test(local) ? local : ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' })

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return json(400, { error: 'Please send your RSVP as JSON.' })
  }

  const parsed = parseRsvp(payload)
  if ('error' in parsed) return json(400, { error: parsed.error })

  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return json(500, { error: 'The RSVP service is not configured.' })

  const saved = await fetch(`${url}/rest/v1/rsvps`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: parsed.name,
      phone: parsed.phone,
      attending: parsed.attending === 'yes',
      guests: parsed.guests,
      events: parsed.events,
      message: parsed.message,
    }),
  })

  if (!saved.ok) {
    console.error('rsvp insert failed', saved.status, await saved.text())
    return json(502, { error: 'We could not save your RSVP. Please try again.' })
  }

  return json(200, { status: 'saved' })
})
