import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import HorseStatusBadge from '../components/HorseStatusBadge'
import Loading from '../components/Loading'
import { useSettings } from '../hooks/useSettings'
import { horsesApi } from '../services/api'
import { formatAge, formatPrice, GENDERS } from '../utils/horse'

// Keyed by id so navigating from one horse to another starts with fresh state.
export default function HorseDetailsPage() {
  const { id } = useParams()
  return <HorseDetails key={id} id={id} />
}

function HorseDetails({ id }) {
  const { settings: site } = useSettings()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    horsesApi
      .get(id)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err))
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن ذلك.')) return
    setDeleting(true)
    try {
      await horsesApi.remove(id)
      navigate('/admin/horses', { replace: true })
    } catch (err) {
      setError(err)
      setDeleting(false)
    }
  }

  if (error && !data) {
    return (
      <section className="notfound">
        <div className="container">
          <p className="notfound__code">{error.status === 404 || error.status === 400 ? '٤٠٤' : '!'}</p>
          <h1 className="section-title">{error.status === 404 || error.status === 400 ? 'الإعلان غير موجود' : error.message}</h1>
          <div className="btn-row" style={{ justifyContent: 'center', marginBlockStart: '2rem' }}>
            <Link className="btn btn--gold" to="/horses">
              العودة إلى سوق الخيول
            </Link>
          </div>
        </div>
      </section>
    )
  }
  if (!data) return <Loading />

  const { horse, canManage } = data
  const images = horse.images || []

  const facts = [
    ['السلالة', horse.breed],
    ['الجنس', GENDERS[horse.gender]],
    ['العمر', formatAge(horse.age)],
    ['اللون', horse.color],
    ['الموقع', horse.location],
    ['تاريخ النشر', new Date(horse.createdAt).toLocaleDateString('ar')],
  ].filter(([, v]) => v)

  return (
    <section className="section pt-32!">
      <div className="container">
        <p className="page-head__crumb mb-6">
          <Link to="/">الرئيسية</Link>
          <span aria-hidden="true">/</span>
          <Link to="/horses">سوق الخيول</Link>
          <span aria-hidden="true">/</span>
          <span>{horse.name}</span>
        </p>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-green-800">
              {images[active] ? (
                <img src={images[active].url} alt={horse.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-7xl">🐎</span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="الصورة السابقة"
                    onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                    className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-cream hover:bg-black/75"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    aria-label="الصورة التالية"
                    onClick={() => setActive((i) => (i + 1) % images.length)}
                    className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-cream hover:bg-black/75"
                  >
                    ‹
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {images.map((img, i) => (
                  <button
                    key={img.publicId}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`الصورة ${i + 1}`}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                      i === active ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <HorseStatusBadge status={horse.status} />
              <h1 className="mt-3 font-display text-4xl text-cream">{horse.name}</h1>
              <p className="mt-3 text-3xl font-extrabold text-gold">{formatPrice(horse.price, horse.currency)}</p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              {facts.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-white/[0.035] p-3">
                  <dt className="text-xs text-dim">{label}</dt>
                  <dd className="m-0 font-bold text-cream">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Contact the center */}
            <div className="rounded-2xl border border-line-strong bg-white/[0.05] p-5">
              <p className="text-sm text-muted">للاستفسار والشراء</p>
              <p className="mb-4 text-lg font-bold text-cream">{site.siteName}</p>
              <div className="btn-row">
                <a
                  className="btn btn--gold"
                  href={site.whatsappLink(`مرحبًا، أنا مهتم بالخيل "${horse.name}" المعروض على موقع الأصايل`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  واتساب
                </a>
                <a className="btn btn--ghost" href={site.phoneHref} dir="ltr">
                  {site.contactPhone}
                </a>
              </div>
            </div>

            {canManage && (
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line p-5">
                <p className="text-sm text-muted">إدارة الإعلان</p>
                <ErrorMessage>{error?.message}</ErrorMessage>
                <div className="btn-row">
                  <Link className="btn btn--ghost btn--sm" to={`/admin/horses/${horse._id}/edit`}>
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
        </div>

        {horse.description && (
          <div className="mt-12 max-w-3xl">
            <h2 className="mb-3 text-2xl text-cream">الوصف</h2>
            <p className="whitespace-pre-line text-muted">{horse.description}</p>
          </div>
        )}
      </div>
    </section>
  )
}
