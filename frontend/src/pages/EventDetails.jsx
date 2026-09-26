import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import EventStatusBadge from '../components/EventStatusBadge'
import Loading from '../components/Loading'
import ReserveBox from '../components/ReserveBox'
import { useAuth } from '../hooks/useAuth'
import { eventsApi } from '../services/api'
import { formatEventDate, formatTicketPrice, formatTimeRange, isPastEvent } from '../utils/event'

// Keyed by id so moving between events starts with fresh state.
export default function EventDetailsPage() {
  const { id } = useParams()
  return <EventDetails key={id} id={id} />
}

function EventDetails({ id }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    eventsApi
      .get(id)
      .then(({ event }) => !cancelled && setEvent(event))
      .catch((err) => !cancelled && setError(err))
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!window.confirm('حذف هذه الفعالية نهائيًا؟ لا يمكن التراجع عن ذلك.')) return
    setDeleting(true)
    try {
      await eventsApi.remove(id)
      navigate('/admin/events', { replace: true })
    } catch (err) {
      setError(err)
      setDeleting(false)
    }
  }

  if (error && !event) {
    const notFound = error.status === 404 || error.status === 400
    return (
      <section className="notfound">
        <div className="container">
          <p className="notfound__code">{notFound ? '٤٠٤' : '!'}</p>
          <h1 className="section-title">{notFound ? 'الفعالية غير موجودة' : error.message}</h1>
          <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: '2rem' }}>
            <Link className="btn btn--gold" to="/events">
              كل الفعاليات
            </Link>
          </div>
        </div>
      </section>
    )
  }
  if (!event) return <Loading />

  const past = isPastEvent(event.date)
  const time = formatTimeRange(event.startTime, event.endTime)
  const limited = event.totalTickets > 0
  const soldOut = limited && event.availableTickets === 0

  // What the visitor can do right now, in priority order.
  let notice = null
  if (event.status === 'cancelled') notice = { tone: 'red', text: 'تم إلغاء هذه الفعالية.' }
  else if (past) notice = { tone: 'gray', text: 'انتهت هذه الفعالية.' }
  else if (event.status === 'closed') notice = { tone: 'amber', text: 'الحجز مغلق لهذه الفعالية.' }
  else if (soldOut) notice = { tone: 'red', text: 'نفدت جميع التذاكر.' }
  else if (event.status === 'draft') notice = { tone: 'gray', text: 'مسودة: هذه الفعالية غير ظاهرة للزوار.' }
  else if (!limited) notice = { tone: 'green', text: 'الدخول بدون حجز مسبق. نراكم هناك!' }

  const noticeStyles = {
    green: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    red: 'border-red-400/30 bg-red-500/10 text-red-200',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    gray: 'border-white/15 bg-white/5 text-muted',
  }

  const facts = [
    ['📅 التاريخ', formatEventDate(event.date)],
    ['🕓 الوقت', time],
    ['📍 المكان', event.location],
    ['🎟️ سعر التذكرة', formatTicketPrice(event.ticketPrice, event.currency)],
  ].filter(([, v]) => v)

  return (
    <section className="section pt-32!">
      <div className="container">
        <p className="page-head__crumb mb-6">
          <Link to="/">الرئيسية</Link>
          <span aria-hidden="true">/</span>
          <Link to="/events">الفعاليات</Link>
          <span aria-hidden="true">/</span>
          <span>{event.title}</span>
        </p>

        {/* Phones: cover, details, description. Desktop: cover + description
            on the right, details in a sticky column on the left. */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-x-10">
          <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-green-700 to-green-950">
            {event.coverImage?.url ? (
              <img src={event.coverImage.url} alt={event.title} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-7xl opacity-60">🏆</span>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:row-span-2 lg:self-start">
            <div>
              {event.status !== 'published' && <EventStatusBadge status={event.status} />}
              <h1 className="mt-3 font-display text-4xl leading-snug text-cream">{event.title}</h1>
            </div>

            <dl className="flex flex-col gap-3">
              {facts.map(([label, value]) => (
                <div key={label} className="flex flex-wrap justify-between gap-2 rounded-xl border border-line bg-white/[0.035] px-4 py-3">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="m-0 font-bold text-cream">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="rounded-2xl border border-line-strong bg-white/[0.05] p-5">
              {notice ? (
                <p className={`rounded-xl border px-4 py-3 text-sm ${noticeStyles[notice.tone]}`}>{notice.text}</p>
              ) : (
                <ReserveBox event={event} />
              )}
            </div>

            {isAdmin && (
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line p-5">
                <p className="text-sm text-muted">إدارة الفعالية</p>
                <ErrorMessage>{error?.message}</ErrorMessage>
                <div className="btn-row">
                  <Link className="btn btn--ghost btn--sm" to={`/admin/events/${event._id}/edit`}>
                    تعديل
                  </Link>
                  <button
                    type="button"
                    className="btn btn--sm border border-red-400/40 text-red-300 hover:bg-red-500/15"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'جارٍ الحذف…' : 'حذف'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div>
              <h2 className="mb-3 text-2xl text-cream">عن الفعالية</h2>
              <p className="whitespace-pre-line text-muted">{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
