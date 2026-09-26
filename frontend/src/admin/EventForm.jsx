import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import ImagePicker from '../components/ImagePicker'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import { eventsApi } from '../services/api'
import { EVENT_STATUSES, toDateInput } from '../utils/event'
import { CURRENCIES } from '../utils/horse'

const EMPTY = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  location: 'مركز الأصايل للفروسية — أريحا',
  ticketPrice: '',
  currency: 'ILS',
  totalTickets: '',
  description: '',
  status: 'draft',
}
const FIELDS = Object.keys(EMPTY)

const STATUS_HINTS = {
  draft: 'لن تظهر للزوار حتى تنشرها.',
  published: 'ظاهرة للزوار ويمكن حجز التذاكر.',
  closed: 'ظاهرة للزوار لكن الحجز مغلق.',
  cancelled: 'ظاهرة للزوار مع إشارة «ملغاة».',
}

// /admin/events/new and /admin/events/:id/edit
export default function EventForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [cover, setCover] = useState([]) // saved cover: [] or [{ url, publicId }]
  const [newCover, setNewCover] = useState([]) // [] or [File]
  const [sold, setSold] = useState(0)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    eventsApi
      .get(id)
      .then(({ event }) => {
        setForm({
          ...Object.fromEntries(FIELDS.map((k) => [k, event[k] ?? ''])),
          date: toDateInput(event.date),
        })
        setCover(event.coverImage ? [event.coverImage] : [])
        setSold(event.totalTickets - event.availableTickets)
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')

    const fd = new FormData()
    for (const key of FIELDS) fd.append(key, String(form[key] ?? '').trim())
    if (newCover[0]) fd.append('coverImage', newCover[0])
    else if (isEdit && cover.length === 0) fd.append('removeCover', 'true')

    setSubmitting(true)
    try {
      const { event } = isEdit ? await eventsApi.update(id, fd) : await eventsApi.create(fd)
      navigate(`/events/${event._id}`)
    } catch (err) {
      setErrors(err.errors)
      setMessage(err.message)
      setSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) return <Loading />

  const title = isEdit ? 'تعديل الفعالية' : 'فعالية جديدة'
  const option = (value, label) => (
    <option key={value} value={value} className="bg-green-900">
      {label}
    </option>
  )

  return (
    <>
      <PageHead title={title} crumb={`لوحة التحكم / ${title}`} text={isEdit ? form.title : 'أضف بطولة أو فعالية لتظهر في صفحة الفعاليات والصفحة الرئيسية.'} />
      <section className="section pt-12!">
        <div className="container">
          {loadError ? (
            <div className="mx-auto max-w-xl text-center">
              <ErrorMessage>{loadError}</ErrorMessage>
              <Link to="/admin/events" className="btn btn--ghost mt-6">
                العودة إلى الفعاليات
              </Link>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              noValidate
              className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border border-line bg-white/[0.035] p-6 sm:p-10"
            >
              <ErrorMessage>{message}</ErrorMessage>

              <ImagePicker
                max={1}
                label="صورة الغلاف (اختيارية)"
                hint="صورة أفقية تظهر في بطاقة الفعالية وصفحتها. JPG أو PNG أو WEBP حتى 5 ميغابايت."
                existing={cover}
                files={newCover}
                onExistingChange={setCover}
                onFilesChange={setNewCover}
                error={errors.coverImage}
              />

              <FormField label="عنوان الفعالية *" name="title" required value={form.title} onChange={onChange} error={errors.title} />

              <div className="grid gap-5 sm:grid-cols-3">
                <FormField label="التاريخ *" name="date" type="date" dir="ltr" required value={form.date} onChange={onChange} error={errors.date} />
                <FormField label="من الساعة" name="startTime" type="time" dir="ltr" value={form.startTime} onChange={onChange} error={errors.startTime} />
                <FormField label="حتى الساعة" name="endTime" type="time" dir="ltr" value={form.endTime} onChange={onChange} error={errors.endTime} />
              </div>

              <FormField label="المكان" name="location" value={form.location} onChange={onChange} error={errors.location} />

              <div className="grid gap-5 sm:grid-cols-3">
                <FormField
                  label="سعر التذكرة"
                  name="ticketPrice"
                  type="number"
                  min="0"
                  dir="ltr"
                  hint="اتركه فارغًا أو 0 للدخول المجاني"
                  value={form.ticketPrice}
                  onChange={onChange}
                  error={errors.ticketPrice}
                />
                <FormField as="select" label="العملة" name="currency" value={form.currency} onChange={onChange} error={errors.currency}>
                  {Object.entries(CURRENCIES).map(([v, l]) => option(v, l))}
                </FormField>
                <FormField
                  label="عدد التذاكر *"
                  name="totalTickets"
                  type="number"
                  min={sold}
                  dir="ltr"
                  required
                  hint={sold > 0 ? `محجوز حتى الآن: ${sold}` : 'السعة الكاملة. 0 = دخول بدون حجز'}
                  value={form.totalTickets}
                  onChange={onChange}
                  error={errors.totalTickets}
                />
              </div>

              <FormField as="select" label="الحالة" name="status" value={form.status} onChange={onChange} error={errors.status} hint={STATUS_HINTS[form.status]}>
                {Object.entries(EVENT_STATUSES).map(([v, l]) => option(v, l))}
              </FormField>

              <FormField
                as="textarea"
                label="الوصف"
                name="description"
                rows={7}
                maxLength={5000}
                placeholder="تفاصيل البرنامج، الفئات المشاركة، شروط الدخول…"
                value={form.description}
                onChange={onChange}
                error={errors.description}
              />

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn--gold" disabled={submitting}>
                  {submitting ? 'جارٍ الحفظ…' : isEdit ? 'حفظ التعديلات' : 'إنشاء الفعالية'}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)} disabled={submitting}>
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
