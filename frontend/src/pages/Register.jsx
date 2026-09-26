import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from?.pathname || '/profile'

  if (user) return <Navigate to={from} replace />

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    if (form.password !== form.confirm) {
      setErrors({ confirm: 'كلمتا المرور غير متطابقتين' })
      return
    }
    setSubmitting(true)
    try {
      const { confirm: _confirm, ...data } = form
      await register(data)
      navigate(from, { replace: true })
    } catch (err) {
      setErrors(err.errors)
      setMessage(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="إنشاء حساب"
      subtitle="انضم إلى مجتمع الأصايل لتصفح الخيول وحجز تذاكر الفعاليات"
      footer={
        <>
          لديك حساب بالفعل؟{' '}
          <Link to="/login" state={location.state} className="font-bold text-gold hover:text-gold-300">
            سجّل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <ErrorMessage>{message}</ErrorMessage>
        <FormField
          label="الاسم الكامل"
          name="name"
          autoComplete="name"
          required
          value={form.name}
          onChange={onChange}
          error={errors.name}
        />
        <FormField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
          error={errors.email}
        />
        <FormField
          label="رقم الهاتف (اختياري)"
          name="phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          value={form.phone}
          onChange={onChange}
          error={errors.phone}
        />
        <FormField
          label="كلمة المرور"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          required
          hint="8 أحرف على الأقل"
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />
        <FormField
          label="تأكيد كلمة المرور"
          name="confirm"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          required
          value={form.confirm}
          onChange={onChange}
          error={errors.confirm}
        />
        <button type="submit" className="btn btn--gold mt-2 w-full" disabled={submitting}>
          {submitting ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب'}
        </button>
      </form>
    </AuthCard>
  )
}
