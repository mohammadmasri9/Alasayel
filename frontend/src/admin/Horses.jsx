import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import Pagination from '../components/Pagination'
import { horsesApi } from '../services/api'
import { formatPrice, STATUSES } from '../utils/horse'

const control =
  'rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-cream outline-none focus:border-gold'

// Admin: every horse listing, including hidden ones.
export default function AdminHorses() {
  const [query, setQuery] = useState({ q: '', status: '', page: 1 })
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    return horsesApi
      .list({ scope: 'all', limit: 20, ...query })
      .then((data) => {
        setResult(data)
        setError('')
      })
      .catch((err) => setError(err.message))
  }, [query])

  useEffect(() => {
    load()
  }, [load])

  async function changeStatus(horse, status) {
    setBusyId(horse._id)
    setError('')
    try {
      const { horse: updated } = await horsesApi.update(horse._id, { status })
      setResult((r) => ({ ...r, horses: r.horses.map((h) => (h._id === horse._id ? { ...h, status: updated.status } : h)) }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function remove(horse) {
    if (!window.confirm(`حذف إعلان "${horse.name}" نهائيًا مع صوره؟`)) return
    setBusyId(horse._id)
    setError('')
    try {
      await horsesApi.remove(horse._id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHead title="إدارة الخيول" crumb="لوحة التحكم / الخيول" text="كل إعلانات الخيول، بما فيها المخفية." />
      <section className="section pt-12!">
        <div className="container flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin" className="btn btn--ghost btn--sm">
              → لوحة التحكم
            </Link>
            <Link to="/admin/horses/new" className="btn btn--gold btn--sm">
              + إضافة خيل
            </Link>
            <form
              className="flex flex-1 flex-wrap gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                setQuery((q) => ({ ...q, q: search.trim(), page: 1 }))
              }}
            >
              <input
                className={`${control} min-w-48 flex-1`}
                placeholder="بحث بالاسم أو السلالة…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className={control}
                value={query.status}
                onChange={(e) => setQuery((q) => ({ ...q, status: e.target.value, page: 1 }))}
              >
                <option value="" className="bg-green-900">كل الحالات</option>
                {Object.entries(STATUSES).map(([value, label]) => (
                  <option key={value} value={value} className="bg-green-900">
                    {label}
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
              <p className="text-sm text-muted">{result.total} إعلان</p>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[640px] border-collapse text-right text-sm">
                  <thead className="bg-white/[0.05] text-xs text-gold-soft">
                    <tr>
                      <th className="p-3 font-bold">الخيل</th>
                      <th className="p-3 font-bold">السعر</th>
                      <th className="p-3 font-bold">الحالة</th>
                      <th className="p-3 font-bold">تاريخ النشر</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {result.horses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted">
                          لا توجد إعلانات.
                        </td>
                      </tr>
                    )}
                    {result.horses.map((horse) => (
                      <tr key={horse._id} className="border-t border-line align-middle">
                        <td className="p-3">
                          <Link to={`/horses/${horse._id}`} className="flex items-center gap-3 hover:text-gold">
                            <img src={horse.images[0]?.url} alt="" className="size-12 shrink-0 rounded-lg bg-green-800 object-cover" />
                            <span className="font-bold text-cream">{horse.name}</span>
                          </Link>
                        </td>
                        <td className="p-3 whitespace-nowrap text-gold">{formatPrice(horse.price, horse.currency)}</td>
                        <td className="p-3">
                          <select
                            aria-label="تغيير الحالة"
                            className={`${control} py-1.5`}
                            value={horse.status}
                            disabled={busyId === horse._id}
                            onChange={(e) => changeStatus(horse, e.target.value)}
                          >
                            {Object.entries(STATUSES).map(([value, label]) => (
                              <option key={value} value={value} className="bg-green-900">
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 whitespace-nowrap text-muted">{new Date(horse.createdAt).toLocaleDateString('ar')}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/horses/${horse._id}/edit`} className="btn btn--ghost btn--sm">
                              تعديل
                            </Link>
                            <button
                              type="button"
                              disabled={busyId === horse._id}
                              onClick={() => remove(horse)}
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
