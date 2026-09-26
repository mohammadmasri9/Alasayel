import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import HorseCard from '../components/HorseCard'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import Pagination from '../components/Pagination'
import { useAuth } from '../hooks/useAuth'
import { horsesApi } from '../services/api'
import { CURRENCIES, GENDERS } from '../utils/horse'

const FILTER_KEYS = ['q', 'gender', 'breed', 'location', 'minPrice', 'maxPrice', 'currency']
const SORTS = {
  newest: 'الأحدث',
  price_asc: 'السعر: من الأقل',
  price_desc: 'السعر: من الأعلى',
}

// Filters live in the URL (?q=...&gender=...), so results can be shared
// and the back button works.
export default function Horses() {
  const { isAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])))
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const queryString = params.toString()
  useEffect(() => {
    let cancelled = false
    horsesApi
      .list(Object.fromEntries(new URLSearchParams(queryString)))
      .then((data) => {
        if (cancelled) return
        setResult(data)
        setError('')
      })
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [queryString])

  function update(next) {
    const merged = { ...Object.fromEntries(params), ...next }
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '' && v != null)))
  }

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  function applyFilters(e) {
    e.preventDefault()
    update({ ...form, page: '' })
    setShowFilters(false)
  }

  function clearFilters() {
    const empty = Object.fromEntries(FILTER_KEYS.map((k) => [k, '']))
    setForm(empty)
    update({ ...empty, page: '' })
  }

  const activeFilters = FILTER_KEYS.filter((k) => params.get(k)).length

  return (
    <>
      <PageHead
        title="سوق الخيول"
        text="خيول مختارة يعرضها مركز الأصايل للبيع. تواصل معنا للاستفسار أو لترتيب زيارة."
      />

      <section className="section pt-12!">
        <div className="container">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link to="/admin/horses/new" className="btn btn--gold">
                + إضافة خيل
              </Link>
            )}
            <button
              type="button"
              className="btn btn--ghost lg:hidden!"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              تصفية {activeFilters > 0 && `(${activeFilters})`}
            </button>
            <label className="ms-auto flex items-center gap-2 text-sm text-muted">
              ترتيب:
              <select
                value={params.get('sort') || 'newest'}
                onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value, page: '' })}
                className="rounded-full border border-line bg-white/5 px-4 py-2 text-cream outline-none focus:border-gold"
              >
                {Object.entries(SORTS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-green-900">
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Filters */}
            <form
              onSubmit={applyFilters}
              className={`${showFilters ? 'flex' : 'hidden'} h-fit flex-col gap-4 rounded-2xl border border-line bg-white/[0.035] p-5 lg:sticky lg:top-28 lg:flex`}
            >
              <FormField label="بحث" name="q" placeholder="اسم، سلالة، لون…" value={form.q} onChange={onChange} />
              <FormField as="select" label="الجنس" name="gender" value={form.gender} onChange={onChange}>
                <option value="" className="bg-green-900">الكل</option>
                {Object.entries(GENDERS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-green-900">
                    {label}
                  </option>
                ))}
              </FormField>
              <FormField label="السلالة" name="breed" placeholder="مثال: عربي أصيل" value={form.breed} onChange={onChange} />
              <FormField label="الموقع" name="location" placeholder="مثال: أريحا" value={form.location} onChange={onChange} />
              <div className="grid grid-cols-2 gap-3">
                <FormField label="السعر من" name="minPrice" type="number" min="0" dir="ltr" value={form.minPrice} onChange={onChange} />
                <FormField label="إلى" name="maxPrice" type="number" min="0" dir="ltr" value={form.maxPrice} onChange={onChange} />
              </div>
              <FormField as="select" label="العملة" name="currency" value={form.currency} onChange={onChange}>
                <option value="" className="bg-green-900">الكل</option>
                {Object.entries(CURRENCIES).map(([value, label]) => (
                  <option key={value} value={value} className="bg-green-900">
                    {label}
                  </option>
                ))}
              </FormField>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn--gold btn--sm flex-1">
                  تطبيق
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
                  مسح
                </button>
              </div>
            </form>

            {/* Results */}
            <div>
              <ErrorMessage>{error}</ErrorMessage>
              {!result && !error && <Loading />}
              {result && (
                <>
                  <p className="mb-4 text-sm text-muted">{result.total} إعلان</p>
                  {result.horses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">
                      <p className="mb-2 text-4xl">🐎</p>
                      لا توجد خيول مطابقة.
                      {activeFilters > 0 && (
                        <button type="button" className="ms-2 font-bold text-gold hover:underline" onClick={clearFilters}>
                          مسح التصفية
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {result.horses.map((horse) => (
                        <HorseCard key={horse._id} horse={horse} />
                      ))}
                    </div>
                  )}
                  <Pagination
                    page={result.page}
                    pages={result.pages}
                    onChange={(page) => {
                      update({ page: page === 1 ? '' : String(page) })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
