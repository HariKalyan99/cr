import { wedding } from '../../data/wedding'
import { formatLongDate, formatWeekday, parseDate } from '../../lib/dates'
import { CornerFloral } from '../ui/ornaments'

/** DOM version of the printed card (CSS fallback). Sized with container units so it scales with the card. */
export function InvitationCardContent() {
  const date = parseDate(wedding.weddingDateTime)
  const { partnerOne, partnerTwo, monogram } = wedding.couple
  return (
    <div className="@container absolute inset-0 flex flex-col items-center justify-center bg-[#fbf6ec] text-center text-ink">
      <div className="pointer-events-none absolute inset-[3%] border-[0.5cqw] border-gold/70" />
      <div className="pointer-events-none absolute inset-[4.2%] border border-gold/50" />
      <CornerFloral src="/vines/6.svg" className="pointer-events-none absolute top-[4.5%] right-[4.5%] w-[13%] opacity-80" />
      <CornerFloral src="/vines/6.svg" className="pointer-events-none absolute bottom-[4.5%] left-[4.5%] w-[13%] -scale-100 opacity-80" />
      <div className="flex size-[9cqw] items-center justify-center rounded-full border border-gold font-display text-[4cqw] italic text-gold-deep">
        {monogram[0]}
        <span className="mx-[0.3cqw] text-[3cqw]">&amp;</span>
        {monogram[1]}
      </div>
      <p className="mt-[3cqw] text-[1.6cqw] font-medium uppercase tracking-[0.4em] text-ink-soft">{wedding.invitationCard.preface}</p>
      <p className="mt-[1.5cqw] font-script text-[7.2cqw] leading-none text-gold-deep">
        {partnerOne} <span className="font-display text-[0.7em] font-light italic">&amp;</span> {partnerTwo}
      </p>
      <p className="mt-[2cqw] max-w-[62%] font-display text-[2.7cqw] leading-snug italic">{wedding.invitationCard.request}</p>
      <p className="mt-[3cqw] text-[1.7cqw] font-medium uppercase tracking-[0.3em]">
        {date ? `${formatWeekday(date)} · ${formatLongDate(date)}` : 'Date to be announced'}
      </p>
      <p className="mt-[0.8cqw] text-[1.45cqw] uppercase tracking-[0.4em] text-ink-soft">{wedding.city}</p>
    </div>
  )
}
