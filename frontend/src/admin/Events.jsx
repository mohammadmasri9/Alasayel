import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import Pagination from '../components/Pagination'
import { eventsApi } from '../services/api'
import { EVENT_STATUSES, formatEventDate, formatTicketPrice, isPastEvent } from '../utils/event'

const control =
  'rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-cream outline-none focus:border-gold'

const WHEN = { upcoming: 'القادمة', past: 'السابقة', all: 'الكل' }

// Admin: all events, including drafts.
export default function AdminEvents() {
  const [query, setQuery] = useState({ when: 'upcoming', status: '', q: '', page: 1 })
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(
    () =>
      eventsApi
        .list({ scope: 'all', limit: 20, ...query })
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

  async function changeStatus(event, status) {
    setBusyId(event._id)
    setError('')
    try {
      const { event: updated } = await eventsApi.update(event._id, { status })
      setResult((r) => ({ ...r, events: r.events.map((e) => (e._id === event._id ? updated : e)) }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function remove(event) {
    if (!window.confirm(`حذف فعالية "${event.title}" نهائيًا؟`)) return
    setBusyId(event._id)
    setError('')
    try {
      await eventsApi.remove(event._id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const set = (patch) => setQuery((q) => ({ ...q, ...patch, page: 1 }))

  return (
    <>
      <PageHead title="إدارة الفعاليات" crumb="لوحة التحكم / الفعاليات" text="أنشئ البطولات والفعاليات، وانشرها أو أغلق الحجز أو ألغها." />
      <section className="section pt-12!">
        <div className="container flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin" className="btn btn--ghost btn--sm">
              → لوحة التحكم
            </Link>
            <Link to="/admin/events/new" className="btn btn--gold btn--sm">
              + فعالية جديدة
            </Link>
            <form
              className="flex flex-1 flex-wrap gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                set({ q: search.trim() })
              }}
            >
              <input className={`${control} min-w-48 flex-1`} placeholder="بحث بالعنوان أو المكان…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className={control} value={query.when} onChange={(e) => set({ when: e.target.value })} aria-label="الفترة">
                {Object.entries(WHEN).map(([v, l]) => (
                  <option key={v} value={v} className="bg-green-900">
                    {l}
                  </option>
                ))}
              </select>
              <select className={control} value={query.status} onChange={(e) => set({ status: e.target.value })} aria-label="الحالة">
                <option value="" className="bg-green-900">كل الحالات</option>
                {Object.entries(EVENT_STATUSES).map(([v, l]) => (
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
              <p className="text-sm text-muted">{result.total} فعالية</p>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[760px] border-collapse text-right text-sm">
                  <thead className="bg-white/[0.05] text-xs text-gold-soft">
                    <tr>
                      <th className="p-3 font-bold">الفعالية</th>
                      <th className="p-3 font-bold">التاريخ</th>
                      <th className="p-3 font-bold">التذاكر</th>
                      <th className="p-3 font-bold">السعر</th>
                      <th className="p-3 font-bold">الحالة</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {result.events.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted">
                          لا توجد فعاليات.{' '}
                          <Link to="/admin/events/new" className="font-bold text-gold hover:underline">
                            أنشئ فعالية
                          </Link>
                        </td>
                      </tr>
                    )}
                    {result.events.map((event) => (
                      <tr key={event._id} className="border-t border-line align-middle">
                        <td className="p-3">
                          <Link to={`/events/${event._id}`} className="flex items-center gap-3 hover:text-gold">
                            {event.coverImage?.url ? (
                              <img src={event.coverImage.url} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-green-800">🏆</span>
                            )}
                            <span className="font-bold text-cream">{event.title}</span>
                          </Link>
                        </td>
                        <td className={`p-3 whitespace-nowrap ${isPastEvent(event.date) ? 'text-dim' : 'text-muted'}`}>
                          {formatEventDate(event.date)}
                          {event.startTime && <span className="block text-xs" dir="ltr">{event.startTime}</span>}
                        </td>
                        <td className="p-3 whitespace-nowrap text-muted">
                          {event.totalTickets > 0 ? (
                            <Link to={`/admin/tickets?eventId=${event._id}`} className="hover:text-gold" title="عرض الحجوزات">
                              <span className="text-cream">{event.totalTickets - event.availableTickets}</span> / {event.totalTickets}
                              <span className="block text-xs text-dim underline">محجوز / السعة</span>
                            </Link>
                          ) : (
                            <span className="text-xs text-dim">بدون حجز</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap text-gold">{formatTicketPrice(event.ticketPrice, event.currency)}</td>
                        <td className="p-3">
                          <select
                            aria-label="تغيير الحالة"
                            className={`${control} py-1.5`}
                            value={event.status}
                            disabled={busyId === event._id}
                            onChange={(e) => changeStatus(event, e.target.value)}
                          >
                            {Object.entries(EVENT_STATUSES).map(([v, l]) => (
                              <option key={v} value={v} className="bg-green-900">
                                {l}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/events/${event._id}/edit`} className="btn btn--ghost btn--sm">
                              تعديل
                            </Link>
                            <button
                              type="button"
                              disabled={busyId === event._id}
                              onClick={() => remove(event)}
                              className="btn btn--sm border border-red-400/40 text-red-300 hover:bg-red-500/15"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
