import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, CircleCheck, Loader2, MessageCircle, Minus, Plus, TriangleAlert } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { wedding } from '../../data/wedding'
import { formatPlainDate, formatShortDate, isEventDayCurrent, parseDate } from '../../lib/dates'
import { transition } from '../../lib/motion'
import { isRsvpEndpointConfigured, normalizePhone, rsvpWhatsappUrl, submitRsvp, type RsvpData, type RsvpResult } from '../../lib/rsvp'
import { mediaUrl } from '../../lib/media'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { CornerFloral } from '../ui/ornaments'
import { SectionHeading } from '../ui/SectionHeading'

type Errors = Partial<Record<'name' | 'phone' | 'attending' | 'events' | 'message', string>>

const MAX_MESSAGE = 500

function validate(data: Omit<RsvpData, 'attending'> & { attending: RsvpData['attending'] | '' }): Errors {
  const errors: Errors = {}
  if (data.name.trim().length < 2) errors.name = 'Please enter your full name.'
  if (!normalizePhone(data.phone)) errors.phone = 'Please enter a 10-digit mobile number.'
  if (!data.attending) errors.attending = 'Please let us know whether you can attend.'
  if (data.attending === 'yes' && data.events.length === 0) errors.events = 'Please choose at least one celebration.'
  if (data.message.length > MAX_MESSAGE) errors.message = `Please keep your note under ${MAX_MESSAGE} characters.`
  return errors
}

export function RSVPForm() {
  const root = useRef<HTMLElement>(null)
  const formId = useId()
  const errorSummary = useRef<HTMLDivElement>(null)
  const { rsvp, events, couple } = wedding
  const openEvents = events.filter((event) => isEventDayCurrent(event.start))
  useScrollReveal(root)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [attending, setAttending] = useState<RsvpData['attending'] | ''>('')
  const [guests, setGuests] = useState(1)
  const [chosen, setChosen] = useState<string[]>(() => openEvents.map((e) => e.name))
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<RsvpResult | null>(null)

  const data: RsvpData = { name: name.trim(), phone: normalizePhone(phone), attending: attending || 'no', guests, events: chosen, message }
  const whatsapp = attending ? rsvpWhatsappUrl(data) : null
  const whatsappConfigured = rsvpWhatsappUrl({ ...data, attending: 'yes' }) !== null
  const respondBy = formatPlainDate(rsvp.respondBy)

  const check = () => {
    const next = validate({ name, phone, attending, guests, events: chosen, message })
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() => errorSummary.current?.focus())
      return false
    }
    return true
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setResult(null)
    if (!check()) return
    setSubmitting(true)
    const res = await submitRsvp(data)
    setSubmitting(false)
    setResult(res)
  }

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

  const toggleEvent = (eventName: string) => {
    clearError('events')
    setChosen((prev) => (prev.includes(eventName) ? prev.filter((n) => n !== eventName) : [...prev, eventName]))
  }

  const field = 'mt-2 w-full rounded-none border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-lg text-ink placeholder:text-ink-soft/60 focus:border-gold-deep focus:ring-0 focus:outline-none'
  const errorCount = Object.keys(errors).length

  return (
    <section id="rsvp" ref={root} aria-labelledby="rsvp-title" className="paper-grain relative overflow-hidden bg-champagne/60 py-[clamp(5.5rem,13vw,11rem)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <SectionHeading
          id="rsvp-title"
          eyebrow={respondBy ? `Kindly respond by ${respondBy}` : 'Kindly respond'}
          title="Will you join us?"
          lede="Your presence would make our celebration complete."
        />

        <div className="relative mx-auto mt-14 max-w-2xl sm:mt-20" data-reveal>
          <div className="relative bg-ivory px-5 pt-16 pb-10 shadow-[0_40px_80px_-40px_rgba(61,18,32,0.45)] sm:px-14 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-2.5 border border-gold/45 sm:inset-4" />
            <CornerFloral src={mediaUrl('vines/6.svg')} aria-hidden="true" className="pointer-events-none absolute top-1 right-1 size-12 opacity-80 sm:size-16" />
            <CornerFloral src={mediaUrl('vines/6.svg')} aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1 size-12 -scale-100 opacity-80 sm:size-16" />

            <h3 className="relative text-center font-script text-[2.7rem] leading-none text-gold-deep sm:text-5xl">Kindly reply</h3>
            <p className="mt-2 text-center text-sm text-ink-soft">
              {couple.partnerOne} &amp; {couple.partnerTwo}
            </p>

            <form id={formId} noValidate onSubmit={onSubmit} className="relative mt-10 space-y-9">
              {errorCount > 0 && (
                <div ref={errorSummary} tabIndex={-1} role="alert" className="flex gap-3 border-l-2 border-burgundy bg-burgundy/5 p-4 text-sm text-burgundy outline-none">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Please check {errorCount === 1 ? 'one detail' : `${errorCount} details`} below.</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor={`${formId}-name`} className="eyebrow">
                  Full name
                </label>
                <input
                  id={`${formId}-name`}
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    clearError('name')
                    setName(e.target.value)
                  }}
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                  className={field}
                />
                {errors.name && (
                  <p id={`${formId}-name-error`} className="mt-2 text-sm text-burgundy">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={`${formId}-phone`} className="eyebrow">
                  Mobile number
                </label>
                <input
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    clearError('phone')
                    setPhone(e.target.value)
                  }}
                  placeholder="10-digit mobile number"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? `${formId}-phone-error` : undefined}
                  className={field}
                />
                {errors.phone && (
                  <p id={`${formId}-phone-error`} className="mt-2 text-sm text-burgundy">
                    {errors.phone}
                  </p>
                )}
              </div>

              <fieldset aria-describedby={errors.attending ? `${formId}-attending-error` : undefined}>
                <legend className="eyebrow">Will you attend?</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 'yes' as const, label: 'Joyfully accepts' },
                    { value: 'no' as const, label: 'Regretfully declines' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex min-h-14 cursor-pointer items-center gap-3 border px-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep ${
                        attending === opt.value ? 'border-burgundy bg-burgundy text-ivory' : 'border-ink/20 hover:border-gold-deep'
                      }`}
                    >
                      <input
                        type="radio"
                        name="attending"
                        value={opt.value}
                        checked={attending === opt.value}
                        onChange={() => {
                          clearError('attending')
                          setAttending(opt.value)
                        }}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`flex size-5 items-center justify-center rounded-full border ${attending === opt.value ? 'border-gold-soft bg-gold-soft text-burgundy' : 'border-ink/30'}`}
                      >
                        {attending === opt.value && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className="font-display text-xl italic">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.attending && (
                  <p id={`${formId}-attending-error`} className="mt-2 text-sm text-burgundy">
                    {errors.attending}
                  </p>
                )}
              </fieldset>

              <AnimatePresence initial={false}>
                {attending === 'yes' && (
                  <motion.div
                    key="attending-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={transition.quick}
                    className="space-y-9 overflow-hidden"
                  >
                    <div>
                      <p id={`${formId}-guests-label`} className="eyebrow">
                        Number of guests (including you)
                      </p>
                      <div className="mt-3 flex items-center gap-5" role="group" aria-labelledby={`${formId}-guests-label`}>
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          disabled={guests <= 1}
                          aria-label="Fewer guests"
                          className="flex size-11 items-center justify-center rounded-full border border-ink/25 transition-colors hover:border-gold-deep disabled:opacity-35"
                        >
                          <Minus className="size-4" />
                        </button>
                        <output aria-live="polite" className="min-w-10 text-center font-display text-4xl tabular">
                          {guests}
                        </output>
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.min(rsvp.maxGuests, g + 1))}
                          disabled={guests >= rsvp.maxGuests}
                          aria-label="More guests"
                          className="flex size-11 items-center justify-center rounded-full border border-ink/25 transition-colors hover:border-gold-deep disabled:opacity-35"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </div>

                    <fieldset aria-describedby={errors.events ? `${formId}-events-error` : undefined}>
                      <legend className="eyebrow">Celebrations you will attend</legend>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {openEvents.map((ev) => {
                          const on = chosen.includes(ev.name)
                          const start = parseDate(ev.start)
                          return (
                            <label
                              key={ev.id}
                              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep ${
                                on ? 'border-gold-deep bg-gold-soft/35 text-ink' : 'border-ink/20 text-ink-soft hover:border-gold-deep'
                              }`}
                            >
                              <input type="checkbox" checked={on} onChange={() => toggleEvent(ev.name)} className="sr-only" />
                              {on && <Check className="size-3.5 text-gold-deep" aria-hidden="true" />}
                              {ev.name}
                              {start && <span className="text-xs text-ink-soft">{formatShortDate(start)}</span>}
                            </label>
                          )
                        })}
                      </div>
                      {errors.events && (
                        <p id={`${formId}-events-error`} className="mt-2 text-sm text-burgundy">
                          {errors.events}
                        </p>
                      )}
                    </fieldset>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor={`${formId}-message`} className="eyebrow">
                  Dietary needs or a note for the couple <span className="tracking-normal normal-case text-ink-soft">(optional)</span>
                </label>
                <textarea
                  id={`${formId}-message`}
                  name="message"
                  rows={3}
                  value={message}
                  onChange={(e) => {
                    clearError('message')
                    setMessage(e.target.value)
                  }}
                  maxLength={MAX_MESSAGE + 50}
                  aria-invalid={!!errors.message}
                  aria-describedby={`${formId}-message-count${errors.message ? ` ${formId}-message-error` : ''}`}
                  className={`${field} resize-none`}
                  placeholder="Allergies, accessibility needs, or your blessings"
                />
                <div className="mt-2 flex justify-between text-xs text-ink-soft">
                  <span id={`${formId}-message-error`} className="text-burgundy">
                    {errors.message}
                  </span>
                  <span id={`${formId}-message-count`} className="tabular">
                    {message.length}/{MAX_MESSAGE}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center">
                <button type="submit" disabled={submitting} className="btn btn-solid w-full sm:w-auto">
                  {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
                  {submitting ? 'Sending…' : 'Send RSVP'}
                </button>
                {whatsappConfigured && (
                  <a
                    href={whatsapp ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!check()) e.preventDefault()
                    }}
                    className="btn btn-outline w-full sm:w-auto"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Reply on WhatsApp
                  </a>
                )}
              </div>

              <div aria-live="polite">
                <AnimatePresence mode="wait">
                  {result && (
                    <motion.div key={result.status} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={transition.quick}>
                      <RsvpResultMessage result={result} name={data.name} attending={data.attending} whatsapp={whatsapp} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isRsvpEndpointConfigured() && !result && (
                <p className="text-center text-xs leading-relaxed text-ink-soft">
                  {whatsappConfigured
                    ? 'Online RSVPs are not connected yet — please use “Reply on WhatsApp” so the family receives your response.'
                    : 'Online RSVPs are not connected yet, so responses here are not saved.'}
                </p>
              )}
              {import.meta.env.DEV && !whatsappConfigured && (
                <p className="border border-dashed border-gold/60 p-3 text-xs text-ink-soft">
                  <strong>Setup (visible in development only):</strong> add <code>rsvp.whatsappNumber</code> and/or <code>rsvp.endpoint</code> in{' '}
                  <code>src/data/wedding.ts</code> to receive RSVPs.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function RsvpResultMessage({ result, name, attending, whatsapp }: { result: RsvpResult; name: string; attending: RsvpData['attending']; whatsapp: string | null }) {
  if (result.status === 'saved') {
    return (
      <div className="flex gap-3 border border-gold/50 bg-gold-soft/20 p-5">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden="true" />
        <div>
          <p className="font-display text-2xl italic">Thank you, {name.split(' ')[0]}.</p>
          <p className="mt-1 text-sm text-ink-soft">
            {attending === 'yes' ? 'Your RSVP has been received — we can’t wait to celebrate with you.' : 'Your reply has been received. You will be missed, and we are grateful for your blessings.'}
          </p>
        </div>
      </div>
    )
  }
  if (result.status === 'not-configured') {
    return (
      <div className="flex gap-3 border border-burgundy/30 bg-burgundy/5 p-5">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-burgundy" aria-hidden="true" />
        <div className="text-sm text-ink">
          <p className="font-medium">Your RSVP has not been sent yet.</p>
          <p className="mt-1 text-ink-soft">
            Online RSVPs aren’t connected for this invitation, so nothing was saved.{' '}
            {whatsapp ? 'Please send your reply on WhatsApp instead — it’s already written for you.' : 'Please reply to the family directly.'}
          </p>
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-solid mt-4">
              <MessageCircle className="size-4" aria-hidden="true" />
              Send on WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3 border border-burgundy/30 bg-burgundy/5 p-5">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-burgundy" aria-hidden="true" />
      <div className="text-sm">
        <p className="font-medium text-burgundy">We couldn’t send your RSVP.</p>
        <p className="mt-1 text-ink-soft">
          {result.message} Please try again{whatsapp ? ', or reply on WhatsApp.' : '.'}
        </p>
      </div>
    </div>
  )
}
