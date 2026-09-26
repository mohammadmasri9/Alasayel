import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import SingleImageField from '../components/SingleImageField'
import { fallbackSettings } from '../data/site'
import { useSettings } from '../hooks/useSettings'
import { settingsApi } from '../services/api'

const TEXT_FIELDS = [
  'siteName', 'siteNameEn', 'tagline', 'slogan', 'footerAbout',
  'heroBadge', 'heroTitle', 'heroTitleHighlight', 'heroDescription',
  'aboutTitle', 'aboutTitleHighlight', 'aboutDescription',
  'contactPhone', 'whatsappNumber', 'contactEmail', 'address', 'mapEmbedUrl', 'mapLinkUrl',
]
const IMAGE_FIELDS = ['logo', 'heroImage', 'aboutImage', 'eventBanner']
const SOCIAL = [
  ['facebook', 'فيسبوك'],
  ['instagram', 'إنستغرام'],
  ['youtube', 'يوتيوب'],
  ['tiktok', 'تيك توك'],
]

function Card({ title, text, children }) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line bg-white/[0.035] p-6 sm:p-8">
      <div>
        <h2 className="text-xl text-cream">{title}</h2>
        {text && <p className="mt-1 text-sm text-dim">{text}</p>}
      </div>
      {children}
    </section>
  )
}

// Admin: all customer-facing texts, images and contact details.
// Saving updates the live site immediately (no redeploy).
export default function WebsiteSettings() {
  const { replace } = useSettings()
  const [form, setForm] = useState(null)
  const [images, setImages] = useState({})
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  function load(s) {
    setForm({
      ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, s[k] ?? ''])),
      socialLinks: { ...s.socialLinks },
      openingHours: s.openingHours.map((h) => ({ ...h })),
    })
    setImages(
      Object.fromEntries(
        IMAGE_FIELDS.map((k) => [k, { current: { ...s[k], defaultUrl: fallbackSettings[k].url }, file: null, reset: false }]),
      ),
    )
  }

  useEffect(() => {
    settingsApi
      .get()
      .then(({ settings }) => load(settings))
      .catch((err) => setLoadError(err.message))
  }, [])

  if (loadError) return <div className="container pt-40"><ErrorMessage>{loadError}</ErrorMessage></div>
  if (!form) return <Loading />

  const onChange = (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }
  const setSocial = (key, value) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }))
  const setHour = (i, key, value) =>
    setForm((f) => ({ ...f, openingHours: f.openingHours.map((h, j) => (j === i ? { ...h, [key]: value } : h)) }))
  const setImage = (key, patch) => {
    setSaved(false)
    setImages((imgs) => ({ ...imgs, [key]: { ...imgs[key], ...patch } }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaved(false)

    const fd = new FormData()
    for (const key of TEXT_FIELDS) fd.append(key, form[key].trim())
    fd.append('socialLinks', JSON.stringify(form.socialLinks))
    fd.append('openingHours', JSON.stringify(form.openingHours))
    const resetImages = []
    for (const key of IMAGE_FIELDS) {
      if (images[key].file) fd.append(key, images[key].file)
      else if (images[key].reset) resetImages.push(key)
    }
    fd.append('resetImages', JSON.stringify(resetImages))

    setSaving(true)
    try {
      const { settings } = await settingsApi.update(fd)
      load(settings)
      replace(settings) // the whole site updates right away
      setSaved(true)
    } catch (err) {
      setErrors(err.errors)
      setMessage(err.message)
    } finally {
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const field = (name, label, props = {}) => (
    <FormField label={label} name={name} value={form[name]} onChange={onChange} error={errors[name]} {...props} />
  )

  return (
    <>
      <PageHead title="إعدادات الموقع" crumb="لوحة التحكم / إعدادات الموقع" text="غيّر الشعار والصور والنصوص ومعلومات التواصل. تظهر التغييرات للزوار فور الحفظ." />
      <section className="section pt-12!">
        <form onSubmit={onSubmit} noValidate className="container flex max-w-4xl flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin" className="btn btn--ghost btn--sm">
              → لوحة التحكم
            </Link>
            <a href="/" target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
              عرض الموقع ↗
            </a>
          </div>

          {saved && (
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-100" role="status">
              ✓ تم الحفظ. التغييرات ظاهرة الآن للزوار.
            </p>
          )}
          <ErrorMessage>{message}</ErrorMessage>

          <Card title="الهوية" text="الاسم والشعار كما يظهران في أعلى وأسفل كل صفحة.">
            <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
              <SingleImageField
                label="الشعار"
                aspect="aspect-square"
                fit="object-contain p-3"
                hint="صورة مربعة، يفضَّل بخلفية شفافة (PNG)"
                {...images.logo}
                onChange={(p) => setImage('logo', p)}
                error={errors.logo}
              />
              <div className="flex flex-col gap-5">
                {field('siteName', 'اسم الموقع *')}
                {field('siteNameEn', 'الاسم بالإنجليزية', { dir: 'ltr' })}
                {field('tagline', 'العبارة التعريفية')}
                {field('slogan', 'الشعار النصي (أسفل الصفحة)')}
              </div>
            </div>
            {field('footerAbout', 'نبذة أسفل الصفحة', { as: 'textarea', rows: 3 })}
          </Card>

          <Card title="الواجهة الرئيسية" text="أول ما يراه الزائر في الصفحة الرئيسية.">
            <div className="grid gap-5 sm:grid-cols-[1fr_240px]">
              <div className="flex flex-col gap-5">
                {field('heroBadge', 'الشارة الصغيرة', { hint: 'مثال: أريحا — فلسطين' })}
                <div className="grid gap-5 sm:grid-cols-2">
                  {field('heroTitle', 'العنوان *')}
                  {field('heroTitleHighlight', 'الجزء الذهبي من العنوان', { hint: 'يظهر في سطر ثانٍ باللون الذهبي' })}
                </div>
                {field('heroDescription', 'الوصف', { as: 'textarea', rows: 4 })}
              </div>
              <SingleImageField label="الصورة الرئيسية" aspect="aspect-[4/5]" hint="صورة طولية" {...images.heroImage} onChange={(p) => setImage('heroImage', p)} error={errors.heroImage} />
            </div>
          </Card>

          <Card title="قسم «عن المركز»" text="القسم التعريفي في الصفحة الرئيسية.">
            <div className="grid gap-5 sm:grid-cols-[1fr_280px]">
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {field('aboutTitle', 'العنوان')}
                  {field('aboutTitleHighlight', 'الجزء الملوَّن من العنوان')}
                </div>
                {field('aboutDescription', 'النص', { as: 'textarea', rows: 8, hint: 'اترك سطرًا فارغًا بين الفقرات' })}
              </div>
              <SingleImageField label="صورة القسم" aspect="aspect-[4/3]" {...images.aboutImage} onChange={(p) => setImage('aboutImage', p)} error={errors.aboutImage} />
            </div>
          </Card>

          <Card title="بانر الفعاليات" text="صورة خلفية لعنوان صفحة الفعاليات (اختيارية).">
            <SingleImageField label="البانر" aspect="aspect-[3/1]" hint="صورة أفقية عريضة" {...images.eventBanner} onChange={(p) => setImage('eventBanner', p)} error={errors.eventBanner} />
          </Card>

          <Card title="معلومات التواصل" text="تظهر في صفحة التواصل وأسفل الموقع وأزرار واتساب.">
            <div className="grid gap-5 sm:grid-cols-2">
              {field('contactPhone', 'رقم الهاتف', { dir: 'ltr', type: 'tel' })}
              {field('whatsappNumber', 'رقم واتساب', { dir: 'ltr', type: 'tel', hint: 'بالصيغة الدولية، مثل +970 59…' })}
              {field('contactEmail', 'البريد الإلكتروني', { dir: 'ltr', type: 'email' })}
              {field('address', 'العنوان')}
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-gold-soft">ساعات العمل</span>
              {form.openingHours.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input className="w-2/5 rounded-xl border border-line bg-white/5 px-4 py-2.5 text-cream outline-none focus:border-gold" placeholder="الأيام" value={h.day} onChange={(e) => setHour(i, 'day', e.target.value)} aria-label="الأيام" />
                  <input className="flex-1 rounded-xl border border-line bg-white/5 px-4 py-2.5 text-cream outline-none focus:border-gold" placeholder="الوقت" value={h.time} onChange={(e) => setHour(i, 'time', e.target.value)} aria-label="الوقت" />
                  <button type="button" className="btn btn--sm text-red-300" aria-label="حذف السطر" onClick={() => setForm((f) => ({ ...f, openingHours: f.openingHours.filter((_, j) => j !== i) }))}>
                    ✕
                  </button>
                </div>
              ))}
              {form.openingHours.length < 10 && (
                <button type="button" className="btn btn--ghost btn--sm self-start" onClick={() => setForm((f) => ({ ...f, openingHours: [...f.openingHours, { day: '', time: '' }] }))}>
                  + إضافة سطر
                </button>
              )}
              {errors.openingHours && <span className="text-xs text-red-300">{errors.openingHours}</span>}
            </div>

            {field('mapEmbedUrl', 'خريطة Google (رابط التضمين)', {
              dir: 'ltr',
              hint: 'في خرائط Google: مشاركة ← تضمين خريطة ← انسخ HTML والصقه هنا كما هو',
            })}
            {field('mapLinkUrl', 'رابط «احصل على الاتجاهات»', { dir: 'ltr', hint: 'رابط موقع المركز في خرائط Google' })}
          </Card>

          <Card title="وسائل التواصل الاجتماعي" text="اترك الرابط فارغًا لإخفاء الأيقونة.">
            <div className="grid gap-5 sm:grid-cols-2">
              {SOCIAL.map(([key, label]) => (
                <FormField
                  key={key}
                  label={label}
                  name={`social-${key}`}
                  dir="ltr"
                  placeholder="https://"
                  value={form.socialLinks[key]}
                  onChange={(e) => setSocial(key, e.target.value)}
                  error={errors[`socialLinks.${key}`]}
                />
              ))}
            </div>
          </Card>

          <div className="sticky bottom-4 z-10 flex justify-end">
            <button type="submit" className="btn btn--gold shadow-2xl" disabled={saving}>
              {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
