import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import ImagePicker from '../components/ImagePicker'
import Loading from '../components/Loading'
import PageHead from '../components/PageHead'
import { horsesApi } from '../services/api'
import { CURRENCIES, GENDERS, STATUSES } from '../utils/horse'

const EMPTY = {
  name: '',
  gender: '',
  age: '',
  breed: '',
  color: '',
  price: '',
  currency: 'ILS',
  location: '',
  description: '',
  status: 'available',
}

const FIELDS = Object.keys(EMPTY)

// Admin only (see App.jsx):
// /admin/horses/new        -> create a listing
// /admin/horses/:id/edit   -> edit a listing
export default function PostHorse() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    horsesApi
      .get(id)
      .then(({ horse, canManage }) => {
        if (!canManage) {
          setLoadError('لا يمكنك تعديل إعلان لا تملكه')
          return
        }
        setForm(Object.fromEntries(FIELDS.map((k) => [k, horse[k] ?? ''])))
        setExistingImages(horse.images)
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    if (existingImages.length + newFiles.length === 0) {
      setErrors({ images: 'أضف صورة واحدة على الأقل' })
      return
    }

    const fd = new FormData()
    for (const key of FIELDS) {
      if (key === 'status' && !isEdit) continue
      fd.append(key, String(form[key] ?? '').trim())
    }
    if (isEdit) fd.append('keepImages', JSON.stringify(existingImages.map((img) => img.publicId)))
    newFiles.forEach((file) => fd.append('images', file))

    setSubmitting(true)
    try {
      const { horse } = isEdit ? await horsesApi.update(id, fd) : await horsesApi.create(fd)
      navigate(`/horses/${horse._id}`)
    } catch (err) {
      setErrors(err.errors)
      setMessage(err.message)
      setSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) return <Loading />

  const title = isEdit ? 'تعديل الإعلان' : 'إضافة خيل للبيع'

  return (
    <>
      <PageHead title={title} crumb={title} text={isEdit ? form.name : 'أضف صورًا واضحة ومعلومات دقيقة عن الخيل.'} />
      <section className="section pt-12!">
        <div className="container">
          {loadError ? (
            <div className="mx-auto max-w-xl text-center">
              <ErrorMessage>{loadError}</ErrorMessage>
              <Link to="/horses" className="btn btn--ghost mt-6">
                العودة إلى سوق الخيول
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
                existing={existingImages}
                files={newFiles}
                onExistingChange={setExistingImages}
                onFilesChange={setNewFiles}
                error={errors.images}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="اسم الخيل *" name="name" required value={form.name} onChange={onChange} error={errors.name} />
                <FormField as="select" label="الجنس *" name="gender" required value={form.gender} onChange={onChange} error={errors.gender}>
                  <option value="" disabled className="bg-green-900">
                    اختر…
                  </option>
                  {Object.entries(GENDERS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-green-900">
                      {label}
                    </option>
                  ))}
                </FormField>
                <FormField label="السلالة" name="breed" placeholder="مثال: عربي أصيل" value={form.breed} onChange={onChange} error={errors.breed} />
                <FormField label="العمر (بالسنوات)" name="age" type="number" min="0" max="40" dir="ltr" value={form.age} onChange={onChange} error={errors.age} />
                <FormField label="اللون" name="color" placeholder="مثال: أشهب" value={form.color} onChange={onChange} error={errors.color} />
                <FormField label="الموقع" name="location" placeholder="مثال: أريحا" value={form.location} onChange={onChange} error={errors.location} />
                <FormField label="السعر *" name="price" type="number" min="0" dir="ltr" required value={form.price} onChange={onChange} error={errors.price} />
                <FormField as="select" label="العملة" name="currency" value={form.currency} onChange={onChange} error={errors.currency}>
                  {Object.entries(CURRENCIES).map(([value, label]) => (
                    <option key={value} value={value} className="bg-green-900">
                      {label}
                    </option>
                  ))}
                </FormField>
                {isEdit && (
                  <FormField as="select" label="حالة الإعلان" name="status" value={form.status} onChange={onChange} error={errors.status}
                    hint="«مخفي» يخفي الإعلان عن الزوار دون حذفه">
                    {Object.entries(STATUSES).map(([value, label]) => (
                      <option key={value} value={value} className="bg-green-900">
                        {label}
                      </option>
                    ))}
                  </FormField>
                )}
              </div>

              <FormField
                as="textarea"
                label="الوصف"
                name="description"
                rows={6}
                maxLength={3000}
                placeholder="النسب، مستوى التدريب، الحالة الصحية، الإنجازات…"
                value={form.description}
                onChange={onChange}
                error={errors.description}
              />

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn--gold" disabled={submitting}>
                  {submitting ? 'جارٍ الحفظ ورفع الصور…' : isEdit ? 'حفظ التعديلات' : 'نشر الإعلان'}
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
