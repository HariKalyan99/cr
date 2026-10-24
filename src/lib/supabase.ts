import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '')
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** Browser client. The anon key only identifies the project; RSVP reads still require an admin session. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null
