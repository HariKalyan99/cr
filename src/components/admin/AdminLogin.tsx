import { Loader2, LogOut } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { formatLongDate, formatTime, parseDate } from '../../lib/dates'
import { formatPhone } from '../../lib/rsvp'
import { supabase } from '../../lib/supabase'

type Reply = {
  id: string
  name: string
  phone: string
  attending: boolean
  guests: number
  events: string[]
  message: string
  submitted_at: string
}

type Enroll = { qr: string; secret: string }

const field =
  'mt-2 w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-lg text-ink placeholder:text-ink-soft/60 focus:border-gold-deep focus:ring-0 focus:outline-none'

function when(iso: string) {
  const date = parseDate(iso)
  return date ? `${formatLongDate(date)} · ${formatTime(date)} IST` : ''
}

/** Moves a signed-in session to the authenticator step, or to the reply list once the code is accepted. */
async function enter(alive: () => boolean, apply: {
  factorId: (value: string) => void
  enroll: (value: Enroll | null) => void
  replies: (value: Reply[] | null) => void
  error: (value: string) => void
}) {
  if (!supabase) return
  const level = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (!alive()) return
  if (level.error) {
    apply.error(level.error.message)
    return
  }
  const household = await supabase.rpc('is_household')
  if (!alive()) return
  if (household.error) {
    apply.error(household.error.message)
    return
  }
  if (!household.data) {
    await supabase.auth.signOut()
    if (!alive()) return
    apply.replies(null)
    apply.factorId('')
    apply.enroll(null)
    apply.error('This login cannot set up an authenticator.')
    return
  }

  if (level.data.currentLevel === 'aal2') {
    const allowed = await supabase.rpc('is_rsvp_admin')
    if (!alive()) return
    if (allowed.error) {
      apply.error(allowed.error.message)
      return
    }
    if (!allowed.data) {
      await supabase.auth.signOut()
      if (!alive()) return
      apply.replies(null)
      apply.factorId('')
      apply.enroll(null)
      apply.error('This login cannot view replies.')
      return
    }
    const rows = await supabase
      .from('rsvps')
      .select('id, name, phone, attending, guests, events, message, submitted_at')
      .order('submitted_at', { ascending: false })
    if (!alive()) return
    if (rows.error) {
      apply.error(rows.error.message)
      return
    }
    apply.replies((rows.data ?? []) as Reply[])
    return
  }

  const listed = await supabase.auth.mfa.listFactors()
  if (!alive()) return
  if (listed.error) {
    apply.error(listed.error.message)
    return
  }
  for (const factor of listed.data.all) {
    if (factor.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: factor.id })
  }
  if (!alive()) return
  const verified = listed.data.totp.find((factor) => factor.status === 'verified')
  if (verified) {
    apply.factorId(verified.id)
    apply.enroll(null)
    return
  }
  const enrolled = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Charan & Rakshitha', friendlyName: 'Replies' })
  if (!alive()) return
  if (enrolled.error || !enrolled.data.totp) {
    apply.error(enrolled.error?.message ?? 'The authenticator could not be prepared.')
    return
  }
  apply.factorId(enrolled.data.id)
  apply.enroll({ qr: enrolled.data.totp.qr_code, secret: enrolled.data.totp.secret })
}

export function AdminLogin() {
  const formId = useId()
  const started = useRef(false)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [enroll, setEnroll] = useState<Enroll | null>(null)
  const [replies, setReplies] = useState<Reply[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const apply = {
    factorId: setFactorId,
    enroll: setEnroll,
    replies: setReplies,
    error: setError,
  }

  useEffect(() => {
    const previous = document.title
    document.title = 'Replies · Charan Raj & Rakshitha H'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setReady(true)
      return
    }
    const client = supabase
    let cancel = false
    const open = async (session: { access_token: string } | null) => {
      if (cancel) return
      if (!session) {
        setReady(true)
        return
      }
      if (started.current) return
      started.current = true
      try {
        await enter(() => !cancel, apply)
      } finally {
        if (!cancel) setReady(true)
      }
    }
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      void open(session)
    })
    return () => {
      cancel = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  const sendCode = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setError('')
    setBusy(true)
    const allowed = await supabase.rpc('may_request_login', { target: email.trim() })
    if (allowed.error) {
      setError(allowed.error.message)
      setBusy(false)
      return
    }
    if (!allowed.data) {
      setError('This email cannot view replies.')
      setBusy(false)
      return
    }
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/login` },
    })
    if (sendError) {
      const message = /signups not allowed|user not found|not allowed/i.test(sendError.message)
        ? 'This email cannot view replies.'
        : /rate limit/i.test(sendError.message)
          ? 'A sign-in email was just sent. Wait a few minutes, then try again.'
          : sendError.message
      setError(message)
      setBusy(false)
      return
    }
    setEmailSent(true)
    setBusy(false)
  }

  const confirmCode = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase || !factorId) return
    setError('')
    setBusy(true)
    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error || !challenge.data) {
      setError(challenge.error?.message ?? 'The authenticator could not be checked.')
      setBusy(false)
      return
    }
    const verified = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code: code.trim() })
    if (verified.error) {
      setError('That code is not valid. Check the authenticator app.')
      setBusy(false)
      return
    }
    setEnroll(null)
    setCode('')
    await enter(() => true, apply)
    setBusy(false)
  }

  const copySecret = async () => {
    if (!enroll) return
    try {
      await navigator.clipboard.writeText(enroll.secret)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const signOut = async () => {
    setBusy(true)
    await supabase?.auth.signOut()
    setReplies(null)
    setEnroll(null)
    setFactorId('')
    setCode('')
    setEmailSent(false)
    setError('')
    setBusy(false)
  }

  const accepts = replies?.filter((reply) => reply.attending) ?? []
  const guestTotal = accepts.reduce((sum, reply) => sum + reply.guests, 0)

  return (
    <main className="paper-grain min-h-svh bg-ivory text-ink">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 py-10 sm:px-10 sm:py-16">
        <p className="eyebrow">Household</p>
        <h1 className="display mt-3 text-[clamp(3rem,8vw,4.75rem)] text-ink">Replies</h1>
        <p className="lede mt-3 max-w-xl">The replies sent from the invitation, for the two of you.</p>

        {!supabase && (
          <p className="mt-10 text-sm text-burgundy">The Supabase address and anon key are missing from this build, so sign-in cannot start.</p>
        )}

        {supabase && !ready && (
          <p className="mt-12 inline-flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Checking the session
          </p>
        )}

        {supabase && ready && replies === null && (
          <section className="mt-12 max-w-md border border-gold/40 bg-paper/70 px-5 py-8 sm:px-8">
            {enroll || factorId ? (
              <form onSubmit={confirmCode} className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl italic">{enroll ? 'Set up the authenticator' : 'Authenticator code'}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {enroll
                      ? 'Scan this with an authenticator app, then enter the 6-digit code it shows.'
                      : 'Enter the 6-digit code from the authenticator app for this login.'}
                  </p>
                </div>
                {enroll && (
                  <div>
                    <img src={enroll.qr} alt="QR code for the authenticator app" className="h-44 w-44 bg-ivory p-2" />
                    <p className="mt-4 text-xs text-ink-soft">Or enter this key manually.</p>
                    <p className="mt-1 font-mono text-sm break-all text-ink">{enroll.secret}</p>
                    <button type="button" onClick={copySecret} className="btn btn-outline mt-3">
                      {copied ? 'Copied' : 'Copy key'}
                    </button>
                  </div>
                )}
                <div>
                  <label htmlFor={`${formId}-code`} className="eyebrow">
                    6-digit code
                  </label>
                  <input
                    id={`${formId}-code`}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => {
                      setError('')
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }}
                    className={`${field} tabular-nums tracking-[0.3em]`}
                  />
                </div>
                {error && <p className="text-sm text-burgundy">{error}</p>}
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={busy || code.length !== 6} className="btn btn-solid">
                    {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Continue
                  </button>
                  <button type="button" onClick={signOut} className="btn btn-outline">
                    Sign out
                  </button>
                </div>
              </form>
            ) : emailSent ? (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl italic">Check your email</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Open the sign-in link sent to {email.trim()}. It has to be opened in this browser.
                  </p>
                </div>
                {error && <p className="text-sm text-burgundy">{error}</p>}
                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false)
                    setError('')
                  }}
                  className="btn btn-outline"
                >
                  Use another email
                </button>
              </div>
            ) : (
              <form onSubmit={sendCode} className="space-y-8">
                <div>
                  <label htmlFor={`${formId}-email`} className="eyebrow">
                    Email
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setError('')
                      setEmail(e.target.value)
                    }}
                    className={field}
                    placeholder="name@email.com"
                  />
                </div>
                {error && <p className="text-sm text-burgundy">{error}</p>}
                <button type="submit" disabled={busy} className="btn btn-solid">
                  {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Email me a link
                </button>
              </form>
            )}
          </section>
        )}

        {replies && (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="text-sm break-all text-ink-soft">{email.trim()}</p>
              <button type="button" onClick={signOut} disabled={busy} className="btn btn-outline">
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
            {error && <p className="mt-6 text-sm text-burgundy">{error}</p>}
            {replies.length > 0 && (
              <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-gold/35 py-5">
                <div>
                  <dt className="eyebrow">Replies</dt>
                  <dd className="mt-1 font-display text-4xl">{replies.length}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Accepts</dt>
                  <dd className="mt-1 font-display text-4xl">{accepts.length}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Guests</dt>
                  <dd className="mt-1 font-display text-4xl">{guestTotal}</dd>
                </div>
              </dl>
            )}
            {replies.length === 0 ? (
              <p className="mt-10 font-display text-2xl italic text-ink-soft">No replies yet.</p>
            ) : (
              <ul className="mt-8 divide-y divide-gold/30">
                {replies.map((reply) => (
                  <li key={reply.id} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h2 className="font-display text-3xl">{reply.name}</h2>
                      <p className="text-sm text-ink-soft">{when(reply.submitted_at)}</p>
                    </div>
                    <p className="mt-2 text-sm">
                      <a href={`tel:+91${reply.phone}`} className="tabular-nums text-gold-deep">
                        {formatPhone(reply.phone)}
                      </a>
                      <span className="text-ink-soft">
                        {' '}
                        · {reply.attending ? `Accepts · ${reply.guests} ${reply.guests === 1 ? 'guest' : 'guests'}` : 'Declines'}
                      </span>
                    </p>
                    {reply.attending && reply.events.length > 0 && <p className="mt-2 text-sm text-ink-soft">{reply.events.join(' · ')}</p>}
                    {reply.message && <p className="mt-3 text-sm leading-relaxed">{reply.message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
