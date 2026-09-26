import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import TicketStatusBadge from '../components/TicketStatusBadge'
import { useSettings } from '../hooks/useSettings'
import { ticketsApi } from '../services/api'
import { formatEventDate, formatTicketPrice, formatTimeRange, isPastEvent } from '../utils/event'
import { TICKET_STATUSES } from '../utils/ticket'

// /tickets/:id — the owner's ticket (or any ticket for admins).
// Shown right after booking, and printable.
export default function TicketDetailsPage() {
  const { id } = useParams()
  return <TicketDetails key={id} id={id} />
}

function TicketDetails({ id }) {
  const { settings: site } = useSettings()
  const location = useLocation()
  const justBooked = location.state?.justBooked
  const instructions = location.state?.instructions
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let cancelled = false
    ticketsApi
      .get(id)
      .then(({ ticket }) => !cancelled && setTicket(ticket))
      .catch((err) => !cancelled && setError(err))
    return () => {
      cancelled = true
    }
  }, [id])

  async function cancel() {
    if (!window.confirm('إلغاء هذا الحجز؟ ستُعاد المقاعد للبيع.')) return
    setCancelling(true)
    try {
      const { ticket: updated } = await ticketsApi.cancel(id)
      setTicket((t) => ({ ...t, ...updated, userId: t.userId }))
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setCancelling(false)
    }
  }

  if (error && !ticket) {
    return (
      <section className="notfound">
        <div className="container">
          <p className="notfound__code">٤٠٤</p>
          <h1 className="section-title">{error.status === 404 || error.status === 400 ? 'التذكرة غير موجودة' : error.message}</h1>
          <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: '2rem' }}>
            <Link className="btn btn--gold" to="/my-tickets">
              تذاكري
            </Link>
          </div>
        </div>
      </section>
    )
  }
  if (!ticket) return <Loading />

  const event = ticket.eventId // populated; null if the event was deleted
  const time = event && formatTimeRange(event.startTime, event.endTime)
  const canCancel = ticket.status === 'reserved' && event && !isPastEvent(event.date)
  const active = ticket.status === 'reserved' || ticket.status === 'confirmed'

  return (
    <section className="section pt-32!">
      <div className="container flex max-w-2xl flex-col gap-6">
        {justBooked && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-100 print:hidden" role="status">
            <p className="text-lg font-bold">✓ تم الحجز بنجاح!</p>
            {instructions && <p className="mt-1 text-sm">{instructions}</p>}
          </div>
        )}

        {/* The ticket */}
        <article className="overflow-hidden rounded-3xl border border-line-strong bg-gradient-to-br from-green-800 to-green-950 print:border-black print:bg-none print:text-black">
          <div className="flex items-center gap-4 border-b border-dashed border-line-strong p-6">
            <img src={site.logo.url} alt="" className="size-14 rounded-full bg-green-950 object-contain p-1" />
            <div className="flex-1">
              <p className="text-xs text-gold-soft">{site.siteName}</p>
              <h1 className="text-2xl text-cream print:text-black">{event?.title || 'فعالية محذوفة'}</h1>
            </div>
            <TicketStatusBadge status={ticket.status} className="print:hidden" />
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {event && (
                <>
                  <div className="col-span-2">
                    <dt className="text-dim">التاريخ</dt>
                    <dd className="m-0 font-bold text-cream print:text-black">{formatEventDate(event.date)}</dd>
                  </div>
                  {time && (
                    <div>
                      <dt className="text-dim">الوقت</dt>
                      <dd className="m-0 font-bold text-cream print:text-black">{time}</dd>
                    </div>
                  )}
                  {event.location && (
                    <div>
                      <dt className="text-dim">المكان</dt>
                      <dd className="m-0 font-bold text-cream print:text-black">{event.location}</dd>
                    </div>
                  )}
                </>
              )}
              <div>
                <dt className="text-dim">عدد التذاكر</dt>
                <dd className="m-0 font-bold text-cream print:text-black">{ticket.quantity}</dd>
              </div>
              <div>
                <dt className="text-dim">المجموع</dt>
                <dd className="m-0 font-bold text-gold print:text-black">{formatTicketPrice(ticket.totalPrice, ticket.currency)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-dim">الحالة</dt>
                <dd className="m-0 font-bold text-cream print:text-black">{TICKET_STATUSES[ticket.status]}</dd>
              </div>
            </dl>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-line-strong bg-green-950/60 px-6 py-5 text-center print:bg-none">
              <span className="text-xs text-dim">رمز التذكرة</span>
              <span className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-gold print:text-black" dir="ltr">
                {ticket.ticketCode}
              </span>
              <span className="mt-1 text-[11px] text-dim">أبرِز هذا الرمز عند الدخول</span>
            </div>
          </div>
        </article>

        {event?.status === 'cancelled' && active && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            تم إلغاء هذه الفعالية. تواصل مع المركز بخصوص الحجز.
          </p>
        )}
        {ticket.status === 'reserved' && !justBooked && (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            هذا الحجز بانتظار الدفع. يرجى الدفع في المركز قبل موعد الفعالية لتأكيده.
          </p>
        )}

        <ErrorMessage>{error?.message}</ErrorMessage>

        <div className="btn-row print:hidden">
          <button type="button" className="btn btn--gold" onClick={() => window.print()}>
            طباعة التذكرة
          </button>
          <Link className="btn btn--ghost" to="/my-tickets">
            كل تذاكري
          </Link>
          {event && (
            <Link className="btn btn--ghost" to={`/events/${event._id}`}>
              صفحة الفعالية
            </Link>
          )}
          {canCancel && (
            <button
              type="button"
              className="btn border border-red-400/40 text-red-300 hover:bg-red-500/15"
              onClick={cancel}
              disabled={cancelling}
            >
              {cancelling ? 'جارٍ الإلغاء…' : 'إلغاء الحجز'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
