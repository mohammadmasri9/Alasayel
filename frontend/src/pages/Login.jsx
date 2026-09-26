import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Where to go after login: the page that sent us here, or a default by role.
  const from = location.state?.from?.pathname

  if (user) return <Navigate to={from || (user.role === 'admin' ? '/admin' : '/profile')} replace />

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage('')
    try {
      const u = await login(form.email, form.password)
      navigate(from || (u.role === 'admin' ? '/admin' : '/profile'), { replace: true })
    } catch (err) {
      setErrors(err.errors)
      setMessage(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="تسجيل الدخول"
      subtitle="أهلًا بعودتك إلى مركز الأصايل للفروسية"
      footer={
        <>
          ليس لديك حساب؟{' '}
          <Link to="/register" state={location.state} className="font-bold text-gold hover:text-gold-300">
            أنشئ حسابًا جديدًا
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <ErrorMessage>{message}</ErrorMessage>
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
          label="كلمة المرور"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />
        <button type="submit" className="btn btn--gold mt-2 w-full" disabled={submitting}>
          {submitting ? 'جارٍ الدخول…' : 'دخول'}
        </button>
      </form>
    </AuthCard>
  )
}
