import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import Pagination from '../components/Pagination'
import { useAuth } from '../hooks/useAuth'
import { usersApi } from '../services/api'

const control =
  'rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-cream outline-none focus:border-gold'

const ROLES = { customer: 'عميل', admin: 'مدير' }

// Admin: list users, change role, deactivate / reactivate.
// The server blocks changes to your own account and removing the last admin.
export default function AdminUsers() {
  const { user: me } = useAuth()
  const [query, setQuery] = useState({ q: '', role: '', status: '', page: 1 })
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(
    () =>
      usersApi
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

  async function change(u, changes, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return
    setBusyId(u._id)
    setError('')
    try {
      const { user } = await usersApi.update(u._id, changes)
      setResult((r) => ({ ...r, users: r.users.map((x) => (x._id === u._id ? { ...x, ...user } : x)) }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const set = (patch) => setQuery((q) => ({ ...q, ...patch, page: 1 }))

  return (
    <>
      <PageHead title="المستخدمون" crumb="لوحة التحكم / المستخدمون" text="الحسابات المسجلة، أدوارها، وإيقافها أو تفعيلها." />
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
              <input className={`${control} min-w-56 flex-1`} placeholder="الاسم، البريد أو الهاتف…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className={control} value={query.role} onChange={(e) => set({ role: e.target.value })} aria-label="الدور">
                <option value="" className="bg-green-900">كل الأدوار</option>
                <option value="customer" className="bg-green-900">العملاء</option>
                <option value="admin" className="bg-green-900">المديرون</option>
              </select>
              <select className={control} value={query.status} onChange={(e) => set({ status: e.target.value })} aria-label="الحالة">
                <option value="" className="bg-green-900">كل الحالات</option>
                <option value="active" className="bg-green-900">نشط</option>
                <option value="inactive" className="bg-green-900">موقوف</option>
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
              <p className="text-sm text-muted">{result.total} مستخدم</p>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[820px] border-collapse text-right text-sm">
                  <thead className="bg-white/[0.05] text-xs text-gold-soft">
                    <tr>
                      <th className="p-3 font-bold">المستخدم</th>
                      <th className="p-3 font-bold">الهاتف</th>
                      <th className="p-3 font-bold">الحجوزات</th>
                      <th className="p-3 font-bold">التسجيل</th>
                      <th className="p-3 font-bold">الدور</th>
                      <th className="p-3 font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted">
                          لا يوجد مستخدمون مطابقون.
                        </td>
                      </tr>
                    )}
                    {result.users.map((u) => {
                      const isMe = u._id === me._id
                      const busy = busyId === u._id
                      return (
                        <tr key={u._id} className={`border-t border-line align-middle ${u.isActive ? '' : 'opacity-60'}`}>
                          <td className="p-3">
                            <div className="font-bold text-cream">
                              {u.name} {isMe && <span className="text-xs font-normal text-gold">(أنت)</span>}
                            </div>
                            <div className="text-xs text-dim" dir="ltr">
                              {u.email}
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap text-muted" dir="ltr">
                            {u.phone || '—'}
                          </td>
                          <td className="p-3 text-muted">
                            {u.bookings > 0 ? (
                              <Link to={`/admin/tickets?q=${encodeURIComponent(u.email)}`} className="hover:text-gold">
                                <span className="text-cream">{u.bookings}</span> ({u.seats} مقعد)
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap text-muted">{new Date(u.createdAt).toLocaleDateString('ar')}</td>
                          <td className="p-3">
                            <select
                              aria-label="تغيير الدور"
                              className={`${control} py-1.5`}
                              value={u.role}
                              disabled={busy || isMe}
                              title={isMe ? 'لا يمكنك تغيير دورك' : undefined}
                              onChange={(e) =>
                                change(
                                  u,
                                  { role: e.target.value },
                                  e.target.value === 'admin'
                                    ? `منح "${u.name}" صلاحيات المدير؟ سيتمكن من إدارة كل الموقع.`
                                    : `إزالة صلاحيات المدير من "${u.name}"؟`,
                                )
                              }
                            >
                              {Object.entries(ROLES).map(([v, l]) => (
                                <option key={v} value={v} className="bg-green-900">
                                  {l}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Badge tone={u.isActive ? 'green' : 'red'}>{u.isActive ? 'نشط' : 'موقوف'}</Badge>
                              {!isMe && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  className={`btn btn--sm ${u.isActive ? 'text-red-300 hover:bg-red-500/15' : 'text-emerald-300 hover:bg-emerald-500/15'}`}
                                  onClick={() =>
                                    change(
                                      u,
                                      { isActive: !u.isActive },
                                      u.isActive ? `إيقاف حساب "${u.name}"؟ لن يتمكن من تسجيل الدخول وسيُسجَّل خروجه فورًا.` : null,
                                    )
                                  }
                                >
                                  {u.isActive ? 'إيقاف' : 'تفعيل'}
                                </button>
                              )}
                            </div>
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
