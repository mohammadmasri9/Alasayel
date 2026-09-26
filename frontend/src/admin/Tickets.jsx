import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import Pagination from '../components/Pagination'
import { eventsApi, ticketsApi } from '../services/api'
import { formatEventDate, formatTicketPrice } from '../utils/event'
import { TICKET_STATUSES_SHORT } from '../utils/ticket'

const control =
  'rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-cream outline-none focus:border-gold'

// The one-click next step for a ticket at the desk / gate.
const NEXT_ACTION = {
  reserved: { status: 'confirmed', label: 'تأكيد الدفع' },
  confirmed: { status: 'used', label: 'تسجيل الدخول' },
}

const SUMMARY_TONE = {
  reserved: 'text-amber-200',
  confirmed: 'text-emerald-300',
  used: 'text-cream',
  cancelled: 'text-red-300',
}

// Admin: all reservations. ?eventId= preselects an event (linked from the
// events table); ?q= prefills the search (linked from the users table).
export default function AdminTickets() {
  const [params] = useSearchParams()
  const [query, setQuery] = useState({ eventId: params.get('eventId') || '', status: '', q: params.get('q') || '', page: 1 })
  const [search, setSearch] = useState(params.get('q') || '')
  const [events, setEvents] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    eventsApi
      .list({ scope: 'all', when: 'all', limit: 50 })
      .then(({ events }) => setEvents(events))
      .catch(() => {})
  }, [])

  const load = useCallback(
    () =>
      ticketsApi
        .list({ limit: 25, ...query })
        .then((data) => {
          setResult(data)
          setError('')
        })
        .catch((err) => setError(err.message)),
    [query],
  )

  useEffect(() => {
    load()
  }, [load])

  async function changeStatus(ticket, status) {
    if (status === 'cancelled' && !window.confirm(`إلغاء التذكرة ${ticket.ticketCode}؟ ستُعاد ${ticket.quantity} مقاعد للبيع ولا يمكن التراجع.`)) {
      return
    }
    setBusyId(ticket._id)
    setError('')
    try {
      await ticketsApi.setStatus(ticket._id, status)
      await load() // refresh rows and the summary
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const set = (patch) => setQuery((q) => ({ ...q, ...patch, page: 1 }))

  return (
    <>
      <PageHead title="إدارة التذاكر" crumb="لوحة التحكم / التذاكر" text="الحجوزات، تأكيد الدفع، وتسجيل الدخول عند البوابة." />
      <section className="section pt-12!">
        <div className="container flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin" className="btn btn--ghost btn--sm">
              → لوحة التحكم
            </Link>
            <form
              className="flex flex-1 flex-wrap gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                set({ q: search.trim() })
              }}
            >
              <input
                className={`${control} min-w-56 flex-1`}
                placeholder="رمز التذكرة، اسم العميل، البريد أو الهاتف…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className={`${control} max-w-64`} value={query.eventId} onChange={(e) => set({ eventId: e.target.value })} aria-label="الفعالية">
                <option value="" className="bg-green-900">كل الفعاليات</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id} className="bg-green-900">
                    {ev.title} — {formatEventDate(ev.date)}
                  </option>
                ))}
              </select>
              <select className={control} value={query.status} onChange={(e) => set({ status: e.target.value })} aria-label="الحالة">
                <option value="" className="bg-green-900">كل الحالات</option>
                {Object.entries(TICKET_STATUSES_SHORT).map(([v, l]) => (
                  <option key={v} value={v} className="bg-green-900">
                    {l}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn--gold btn--sm">
                بحث
              </button>
            </form>
          </div>

          <ErrorMessage>{error}</ErrorMessage>
          {!result && !error && <Loading />}

          {result && (
            <>
              {/* Seats per status for the current search/event */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(TICKET_STATUSES_SHORT).map(([status, label]) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set({ status: query.status === status ? '' : status })}
                    className={`rounded-2xl border p-4 text-right transition ${query.status === status ? 'border-gold bg-white/[0.07]' : 'border-line bg-white/[0.035] hover:border-line-strong'}`}
                  >
                    <span className="block text-xs text-muted">{label}</span>
                    <span className={`text-2xl font-extrabold ${SUMMARY_TONE[status]}`}>{result.summary[status].seats}</span>
                    <span className="ms-1 text-xs text-dim">مقعد · {result.summary[status].tickets} حجز</span>
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[900px] border-collapse text-right text-sm">
                  <thead className="bg-white/[0.05] text-xs text-gold-soft">
                    <tr>
                      <th className="p-3 font-bold">الرمز</th>
                      <th className="p-3 font-bold">العميل</th>
                      <th className="p-3 font-bold">الفعالية</th>
                      <th className="p-3 font-bold">العدد</th>
                      <th className="p-3 font-bold">المجموع</th>
                      <th className="p-3 font-bold">الحالة</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {result.tickets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted">
                          لا توجد تذاكر مطابقة.
                        </td>
                      </tr>
                    )}
                    {result.tickets.map((t) => {
                      const next = NEXT_ACTION[t.status]
                      const busy = busyId === t._id
                      return (
                        <tr key={t._id} className={`border-t border-line align-middle ${t.status === 'cancelled' ? 'opacity-55' : ''}`}>
                          <td className="p-3">
                            <Link to={`/tickets/${t._id}`} className="font-mono font-bold text-gold hover:underline" dir="ltr">
                              {t.ticketCode}
                            </Link>
                            <span className="block text-xs text-dim">{new Date(t.createdAt).toLocaleDateString('ar')}</span>
                          </td>
                          <td className="p-3">
                            <div className="text-cream">{t.userId?.name || '—'}</div>
                            <div className="text-xs text-dim" dir="ltr">
                              {t.userId?.phone || t.userId?.email}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-cream">{t.eventId?.title || 'فعالية محذوفة'}</div>
                            {t.eventId && <div className="text-xs text-dim">{formatEventDate(t.eventId.date)}</div>}
                          </td>
                          <td className="p-3 text-cream">{t.quantity}</td>
                          <td className="p-3 whitespace-nowrap text-gold">{formatTicketPrice(t.totalPrice, t.currency)}</td>
                          <td className="p-3">
                            <select
                              aria-label="تغيير الحالة"
                              className={`${control} py-1.5`}
                              value={t.status}
                              disabled={busy || t.status === 'cancelled'}
                              onChange={(e) => changeStatus(t, e.target.value)}
                            >
                              {Object.entries(TICKET_STATUSES_SHORT).map(([v, l]) => (
                                <option key={v} value={v} className="bg-green-900">
                                  {l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            {next && (
                              <button type="button" className="btn btn--gold btn--sm whitespace-nowrap" disabled={busy} onClick={() => changeStatus(t, next.status)}>
                                {next.label}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={result.page} pages={result.pages} onChange={(page) => setQuery((q) => ({ ...q, page }))} />
            </>
          )}
        </div>
      </section>
    </>
  )
}
