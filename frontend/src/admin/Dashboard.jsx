import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import { useAuth } from '../hooks/useAuth'
import { adminApi } from '../services/api'
import { eventDateBadge, formatEventDate } from '../utils/event'
import { formatPrice } from '../utils/horse'

const SECTIONS = [
  { label: 'الخيول', to: '/admin/horses', icon: '🐎' },
  { label: 'الفعاليات', to: '/admin/events', icon: '🏆' },
  { label: 'التذاكر', to: '/admin/tickets', icon: '🎟️' },
  { label: 'المستخدمون', to: '/admin/users', icon: '👥' },
  { label: 'إعدادات الموقع', to: '/admin/settings', icon: '⚙️' },
]

const ACTIVITY = {
  user: { icon: '👤', label: 'مستخدم جديد' },
  booking: { icon: '🎟️', label: 'حجز جديد' },
  cancel: { icon: '✕', label: 'إلغاء حجز' },
  horse: { icon: '🐎', label: 'خيل جديد' },
  event: { icon: '🏆', label: 'فعالية جديدة' },
}

const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' })
function timeAgo(date) {
  const secs = (new Date(date) - Date.now()) / 1000
  const steps = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [30, 'day'],
    [12, 'month'],
  ]
  let value = secs
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) return rtf.format(Math.round(value), unit)
    value /= size
  }
  return rtf.format(Math.round(value), 'year')
}

const money = (list) => (list.length ? list.map((r) => formatPrice(r.amount, r.currency)).join(' + ') : '—')

function StatCard({ label, value, sub, to }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-gold">{value}</p>
      {sub && <p className="mt-1 text-xs text-dim">{sub}</p>}
    </>
  )
  const cls = 'rounded-2xl border border-line bg-white/[0.035] p-5 transition'
  return to ? (
    <Link to={to} className={`${cls} hover:border-line-strong`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <PageHead title="لوحة التحكم" crumb="لوحة التحكم" text={`مرحبًا ${user.name}`} />
      <section className="section pt-12!">
        <div className="container flex flex-col gap-8">
          {/* Sections + quick actions */}
          <div className="flex flex-wrap gap-3">
            {SECTIONS.map((s) => (
              <Link key={s.to} to={s.to} className="btn btn--ghost btn--sm">
                <span aria-hidden="true">{s.icon}</span> {s.label}
              </Link>
            ))}
            <span className="grow" />
            <Link to="/admin/events/new" className="btn btn--gold btn--sm">
              + فعالية
            </Link>
            <Link to="/admin/horses/new" className="btn btn--gold btn--sm">
              + خيل
            </Link>
          </div>

          <ErrorMessage>{error}</ErrorMessage>
          {!stats && !error && <Loading />}

          {stats && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="العملاء"
                  value={stats.users.customers}
                  sub={`+${stats.users.newThisMonth} خلال آخر 30 يومًا${stats.users.inactive ? ` · ${stats.users.inactive} موقوف` : ''}`}
                  to="/admin/users"
                />
                <StatCard
                  label="فعاليات قادمة"
                  value={stats.events.upcoming}
                  sub={`${stats.events.drafts} مسودة · ${stats.events.past} سابقة`}
                  to="/admin/events"
                />
                <StatCard
                  label="تذاكر مؤكدة"
                  value={stats.tickets.confirmed.seats + stats.tickets.used.seats}
                  sub={`${stats.tickets.reserved.seats} بانتظار الدفع · ${stats.tickets.used.seats} دخلت`}
                  to="/admin/tickets"
                />
                <StatCard
                  label="خيول معروضة للبيع"
                  value={stats.horses.available + stats.horses.pending}
                  sub={`${stats.horses.sold} مُباع · ${stats.horses.inactive} مخفي`}
                  to="/admin/horses"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-5">
                  <p className="text-sm text-muted">الإيرادات المحصّلة (تذاكر مدفوعة)</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-300">{money(stats.revenue.paid)}</p>
                </div>
                <Link
                  to="/admin/tickets"
                  className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] p-5 transition hover:border-amber-400/50"
                >
                  <p className="text-sm text-muted">بانتظار الدفع في المركز</p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-200">{money(stats.revenue.awaitingPayment)}</p>
                </Link>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                {/* Upcoming events occupancy */}
                <div className="rounded-2xl border border-line bg-white/[0.035] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg text-cream">الفعاليات القادمة — نسبة الحجز</h2>
                    <Link to="/admin/events" className="text-sm text-gold hover:underline">
                      الكل
                    </Link>
                  </div>
                  {stats.nextEvents.length === 0 ? (
                    <p className="py-6 text-center text-sm text-dim">لا توجد فعاليات قادمة بحجز تذاكر.</p>
                  ) : (
                    <ul className="m-0 flex list-none flex-col gap-4 p-0">
                      {stats.nextEvents.map((e) => {
                        const pct = Math.round((e.sold / e.totalTickets) * 100)
                        const { day, month } = eventDateBadge(e.date)
                        return (
                          <li key={e._id}>
                            <Link to={`/admin/tickets?eventId=${e._id}`} className="flex items-center gap-3 hover:text-gold">
                              <span className="flex min-w-12 flex-col items-center rounded-lg bg-green-800 py-1 leading-tight">
                                <span className="font-extrabold text-gold">{day}</span>
                                <span className="text-[11px] text-cream">{month}</span>
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex justify-between gap-2 text-sm">
                                  <span className="truncate text-cream">{e.title}</span>
                                  <span className="shrink-0 text-muted">
                                    {e.sold}/{e.totalTickets}
                                  </span>
                                </span>
                                <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% محجوز`}>
                                  <span className={`block h-full rounded-full ${pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-300' : 'bg-gold'}`} style={{ width: `${pct}%` }} />
                                </span>
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                {/* Recent activity */}
                <div className="rounded-2xl border border-line bg-white/[0.035] p-5">
                  <h2 className="mb-4 text-lg text-cream">آخر النشاطات</h2>
                  {stats.activity.length === 0 ? (
                    <p className="py-6 text-center text-sm text-dim">لا يوجد نشاط بعد.</p>
                  ) : (
                    <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
                      {stats.activity.map((a, i) => (
                        <li key={i}>
                          <Link to={a.link} className="flex items-start gap-3 py-2.5 hover:text-gold">
                            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm ${a.type === 'cancel' ? 'bg-red-500/15 text-red-300' : 'bg-white/[0.06]'}`} aria-hidden="true">
                              {ACTIVITY[a.type]?.icon}
                            </span>
                            <span className="min-w-0 flex-1 text-sm">
                              <span className="block text-cream">
                                <span className="text-dim">{ACTIVITY[a.type]?.label}: </span>
                                {a.title}
                              </span>
                              {a.detail && <span className="block truncate text-xs text-muted">{a.detail}</span>}
                            </span>
                            <time className="shrink-0 text-xs text-dim" dateTime={a.at} title={formatEventDate(a.at)}>
                              {timeAgo(a.at)}
                            </time>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
