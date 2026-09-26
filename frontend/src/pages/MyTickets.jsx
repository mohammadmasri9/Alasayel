import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import TicketStatusBadge from '../components/TicketStatusBadge'
import { ticketsApi } from '../services/api'
import { eventDateBadge, formatEventDate, formatTicketPrice, isPastEvent } from '../utils/event'

export default function MyTickets() {
  const [tickets, setTickets] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    ticketsApi
      .mine()
      .then(({ tickets }) => setTickets(tickets))
      .catch((err) => setError(err.message))
  }, [])

  // Upcoming, still-valid tickets first; everything else under "previous".
  const isCurrent = (t) => t.eventId && !isPastEvent(t.eventId.date) && t.status !== 'cancelled'
  const current = tickets?.filter(isCurrent) ?? []
  const previous = tickets?.filter((t) => !isCurrent(t)) ?? []

  return (
    <>
      <PageHead title="تذاكري" text="حجوزاتك في فعاليات وبطولات مركز الأصايل." />
      <section className="section pt-12!">
        <div className="container flex max-w-3xl flex-col gap-8">
          <ErrorMessage>{error}</ErrorMessage>
          {!tickets && !error && <Loading />}
          {tickets?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">
              <p className="mb-2 text-4xl">🎟️</p>
              لا توجد لديك حجوزات بعد.
              <Link to="/events" className="ms-2 font-bold text-gold hover:underline">
                تصفّح الفعاليات
              </Link>
            </div>
          )}
          {current.length > 0 && <TicketList title="القادمة" tickets={current} />}
          {previous.length > 0 && <TicketList title="السابقة والملغاة" tickets={previous} dim />}
        </div>
      </section>
    </>
  )
}

function TicketList({ title, tickets, dim }) {
  return (
    <div>
      <h2 className="mb-4 text-xl text-cream">{title}</h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {tickets.map((t) => {
          const ev = t.eventId
          const badge = ev && eventDateBadge(ev.date)
          return (
            <li key={t._id}>
              <Link
                to={`/tickets/${t._id}`}
                className={`flex items-center gap-4 rounded-2xl border border-line bg-white/[0.035] p-4 transition hover:border-line-strong ${dim ? 'opacity-70' : ''}`}
              >
                <div className="flex min-w-16 flex-col items-center rounded-xl bg-green-800 px-2 py-2 leading-tight">
                  <span className="text-xl font-extrabold text-gold">{badge?.day ?? '—'}</span>
                  <span className="text-xs text-cream">{badge?.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-cream">{ev?.title || 'فعالية محذوفة'}</p>
                  <p className="text-xs text-muted">
                    {ev && formatEventDate(ev.date)} · {t.quantity} تذكرة · {formatTicketPrice(t.totalPrice, t.currency)}
                  </p>
                  <p className="font-mono text-xs text-dim" dir="ltr">
                    {t.ticketCode}
                  </p>
                </div>
                <TicketStatusBadge status={t.status} />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
