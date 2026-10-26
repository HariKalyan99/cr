import { Loader2, LogOut, RefreshCw, Search, X } from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { wedding } from '../../data/wedding'
import { formatLongDate, formatTime, parseDate } from '../../lib/dates'
import { formatPhone } from '../../lib/rsvp'

export type Reply = {
  id: string
  name: string
  phone: string
  attending: boolean
  guests: number
  events: string[]
  message: string
  submitted_at: string
}

type Attendance = 'all' | 'accepts' | 'declines'
type SortKey = 'latest' | 'oldest' | 'name' | 'name-desc' | 'guests'

const celebrations = wedding.events.map((event) => event.name)
const pageSize = 25

const chipClass =
  'inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-full px-3.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase active:scale-[0.98] sm:tracking-[0.14em]'

function when(iso: string) {
  const date = parseDate(iso)
  return date ? `${formatLongDate(date)} · ${formatTime(date)} IST` : ''
}

function party(reply: Reply) {
  return reply.events ?? []
}

function matchesQuery(reply: Reply, query: string) {
  const text = query.trim().toLowerCase()
  if (!text) return true
  const haystack = `${reply.name} ${reply.message} ${party(reply).join(' ')}`.toLowerCase()
  if (haystack.includes(text)) return true
  const digits = text.replace(/\D/g, '')
  return digits.length >= 2 && reply.phone.includes(digits)
}

function bySort(sort: SortKey) {
  return (a: Reply, b: Reply) => {
    if (sort === 'oldest') return a.submitted_at.localeCompare(b.submitted_at)
    if (sort === 'name') return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || b.submitted_at.localeCompare(a.submitted_at)
    if (sort === 'name-desc') return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }) || b.submitted_at.localeCompare(a.submitted_at)
    if (sort === 'guests') return b.guests - a.guests || b.submitted_at.localeCompare(a.submitted_at)
    return b.submitted_at.localeCompare(a.submitted_at)
  }
}

function Chip({
  pressed,
  onClick,
  children,
  label,
}: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={
        pressed
          ? `${chipClass} bg-burgundy text-ivory`
          : `${chipClass} border border-gold/45 text-ink hover:border-gold-deep hover:bg-champagne/40`
      }
    >
      {children}
    </button>
  )
}

export function ReplyBoard({
  replies,
  email,
  error,
  busy,
  refreshing,
  onSignOut,
  onRefresh,
}: {
  replies: Reply[]
  email: string
  error: string
  busy: boolean
  refreshing: boolean
  onSignOut: () => void
  onRefresh: () => void
}) {
  const searchId = useId()
  const sortId = useId()
  const [query, setQuery] = useState('')
  const [attendance, setAttendance] = useState<Attendance>('all')
  const [event, setEvent] = useState<string | null>(null)
  const [notes, setNotes] = useState(false)
  const [sort, setSort] = useState<SortKey>('latest')
  const scope = `${query}\0${attendance}\0${event ?? ''}\0${notes}\0${sort}`
  const [page, setPage] = useState({ scope: '', limit: pageSize })
  const limit = page.scope === scope ? page.limit : pageSize

  const queried = useMemo(() => replies.filter((reply) => matchesQuery(reply, query)), [replies, query])

  const eventGuests = useMemo(() => {
    const counts = new Map<string, number>()
    for (const name of celebrations) counts.set(name, 0)
    for (const reply of queried) {
      if (!reply.attending) continue
      for (const name of party(reply)) counts.set(name, (counts.get(name) ?? 0) + reply.guests)
    }
    return counts
  }, [queried])

  const shown = useMemo(() => {
    const rows = queried.filter((reply) => {
      if (attendance === 'accepts' && !reply.attending) return false
      if (attendance === 'declines' && reply.attending) return false
      if (notes && !reply.message.trim()) return false
      if (event && attendance !== 'declines' && !party(reply).includes(event)) return false
      return true
    })
    return rows.sort(bySort(sort))
  }, [queried, attendance, notes, event, sort])

  const guestTotal = shown.reduce((sum, reply) => sum + (reply.attending ? reply.guests : 0), 0)
  const totalAccepts = replies.filter((reply) => reply.attending).length
  const totalDeclines = replies.length - totalAccepts
  const householdGuests = replies.reduce((sum, reply) => sum + (reply.attending ? reply.guests : 0), 0)
  const viewAccepts = shown.filter((reply) => reply.attending).length
  const viewDeclines = shown.length - viewAccepts
  const filtered = query.trim() !== '' || attendance !== 'all' || event !== null || notes
  const noteCount = queried.filter((reply) => {
    if (attendance === 'accepts' && !reply.attending) return false
    if (attendance === 'declines' && reply.attending) return false
    if (event && attendance !== 'declines' && !party(reply).includes(event)) return false
    return reply.message.trim().length > 0
  }).length

  const visible = shown.slice(0, limit)
  const remaining = shown.length - visible.length
  const order =
    sort === 'oldest' ? 'Oldest first' : sort === 'guests' ? 'Largest party first' : sort === 'name-desc' ? 'Name, Z to A' : sort === 'name' ? 'Name, A to Z' : 'Newest first'

  const clear = () => {
    setQuery('')
    setAttendance('all')
    setEvent(null)
    setNotes(false)
    setSort('latest')
    setPage({ scope: '', limit: pageSize })
  }

  const loadMore = () => setPage({ scope, limit: limit + pageSize })

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm break-all text-ink-soft">{email.trim()}</p>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <button type="button" onClick={onRefresh} disabled={refreshing} className="btn btn-outline w-full disabled:opacity-60 sm:w-auto">
            {refreshing ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
            Refresh
          </button>
          <button type="button" onClick={onSignOut} disabled={busy} className="btn btn-outline w-full disabled:opacity-60 sm:w-auto">
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
      {error && <p className="mt-6 text-sm text-burgundy">{error}</p>}

      {replies.length === 0 ? (
        <p className="mt-10 font-display text-2xl italic text-ink-soft">No replies yet.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 border-y border-gold/35 sm:grid-cols-4">
            <Stat
              label="Replies"
              value={shown.length}
              hint={shown.length === replies.length ? undefined : `of ${replies.length}`}
              pressed={attendance === 'all'}
              onClick={() => setAttendance('all')}
            />
            <Stat
              label="Accepts"
              value={viewAccepts}
              hint={viewAccepts === totalAccepts ? undefined : `of ${totalAccepts}`}
              pressed={attendance === 'accepts'}
              onClick={() => setAttendance(attendance === 'accepts' ? 'all' : 'accepts')}
            />
            <Stat
              label="Declines"
              value={viewDeclines}
              hint={viewDeclines === totalDeclines ? undefined : `of ${totalDeclines}`}
              pressed={attendance === 'declines'}
              onClick={() => {
                setAttendance(attendance === 'declines' ? 'all' : 'declines')
                setEvent(null)
              }}
            />
            <Stat label="Guests" value={guestTotal} hint={guestTotal === householdGuests ? undefined : `of ${householdGuests}`} />
          </div>

          <div className="py-5">
            <label htmlFor={searchId} className="eyebrow">
              Search
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-gold-deep" aria-hidden="true" />
              <input
                id={searchId}
                type="text"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, phone, or note"
                className="w-full border-0 border-b border-ink/25 bg-transparent py-3 pr-12 pl-7 text-lg text-ink placeholder:text-ink-soft/60 focus:border-gold-deep focus:ring-0 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center text-ink-soft hover:text-ink"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Celebration">
                <Chip pressed={event === null} onClick={() => setEvent(null)} label="All celebrations">
                  All celebrations
                </Chip>
                {celebrations.map((name) => (
                  <Chip
                    key={name}
                    pressed={event === name}
                    onClick={() => {
                      setEvent(event === name ? null : name)
                      if (attendance === 'declines') setAttendance('all')
                    }}
                    label={`${name}, ${eventGuests.get(name) ?? 0} ${eventGuests.get(name) === 1 ? 'guest' : 'guests'}`}
                  >
                    {name}
                    <span className="tracking-normal tabular-nums">{eventGuests.get(name) ?? 0}</span>
                  </Chip>
                ))}
                <Chip pressed={notes} onClick={() => setNotes((value) => !value)} label={`With a note, ${noteCount}`}>
                  With a note
                  <span className="tracking-normal tabular-nums">{noteCount}</span>
                </Chip>
              </div>
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <label htmlFor={sortId} className="eyebrow shrink-0">
                  Sort
                </label>
                <select
                  id={sortId}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="min-h-11 w-full min-w-0 flex-1 border-0 border-b border-ink/25 bg-transparent py-2 pr-2 text-base text-ink focus:border-gold-deep focus:ring-0 focus:outline-none sm:w-auto sm:flex-none sm:text-sm"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name, A to Z</option>
                  <option value="name-desc">Name, Z to A</option>
                  <option value="guests">Largest party</option>
                </select>
              </div>
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft" aria-live="polite">
              <span>
                {visible.length < shown.length
                  ? `Showing ${visible.length} of ${shown.length} · ${order}`
                  : filtered
                    ? `Showing ${shown.length} of ${replies.length}${guestTotal > 0 ? ` · ${guestTotal} ${guestTotal === 1 ? 'guest' : 'guests'}` : ''}`
                    : order}
              </span>
              {(filtered || sort !== 'latest') && (
                <button type="button" onClick={clear} className="inline-flex min-h-11 items-center text-gold-deep underline-offset-4 hover:underline">
                  Clear
                </button>
              )}
            </p>
          </div>

          {shown.length === 0 ? (
            <p className="mt-6 font-display text-2xl italic text-ink-soft">Nothing matches.</p>
          ) : (
            <>
            <ul className="divide-y divide-gold/30">
              {visible.map((reply) => (
                <li key={reply.id} className="py-5 sm:py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="font-display text-[1.75rem] leading-none break-words sm:text-3xl">{reply.name}</h2>
                    <p className="text-sm text-ink-soft">{when(reply.submitted_at)}</p>
                  </div>
                  <p className="mt-2 text-sm">
                    <a href={`tel:+91${reply.phone}`} className="inline-flex min-h-11 items-center tabular-nums text-gold-deep">
                      {formatPhone(reply.phone)}
                    </a>
                    <span className="text-ink-soft">
                      {' '}
                      · {reply.attending ? `Accepts · ${reply.guests} ${reply.guests === 1 ? 'guest' : 'guests'}` : 'Declines'}
                    </span>
                  </p>
                  {reply.attending && party(reply).length > 0 && <p className="mt-1 text-sm break-words text-ink-soft">{party(reply).join(' · ')}</p>}
                  {reply.message.trim() && <p className="mt-3 text-sm leading-relaxed break-words">{reply.message}</p>}
                </li>
              ))}
            </ul>
            {remaining > 0 && (
              <div className="mt-8">
                <button type="button" onClick={loadMore} className="btn btn-outline w-full sm:w-auto">
                  {remaining < pageSize ? `Load ${remaining} more` : 'Load more'}
                </button>
              </div>
            )}
            </>
          )}
        </>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
  hint,
  pressed = false,
  onClick,
}: {
  label: string
  value: number
  hint?: string
  pressed?: boolean
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="eyebrow">{label}</span>
      <span className="mt-1 block font-display text-4xl text-ink lining-nums tabular-nums">{value}</span>
      <span className="mt-1 block h-4 text-xs text-ink-soft">{hint ?? ''}</span>
      <span className={`mt-2 block h-px w-8 ${pressed ? 'bg-gold-deep' : 'bg-transparent'}`} aria-hidden="true" />
    </>
  )
  if (!onClick) return <div className="px-1 py-5 text-left">{inner}</div>
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className="min-h-11 w-full touch-manipulation px-1 py-5 text-left">
      {inner}
    </button>
  )
}
