import { startTransition, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import PageHead from '../components/PageHead'
import { useAuth } from '../hooks/useAuth'

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-line bg-white/[0.035] p-6 sm:p-8">
      <h2 className="mb-5 text-xl text-cream">{title}</h2>
      {children}
    </div>
  )
}

const Saved = ({ children }) => (
  <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100" role="status">
    {children}
  </p>
)

function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const onChange = (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)
    try {
      await updateProfile(form)
      setSaved(true)
    } catch (err) {
      setErrors(err.errors)
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {saved && <Saved>✓ تم حفظ بياناتك.</Saved>}
      <ErrorMessage>{message}</ErrorMessage>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="الاسم الكامل" name="name" autoComplete="name" value={form.name} onChange={onChange} error={errors.name} />
        <FormField label="رقم الهاتف" name="phone" type="tel" dir="ltr" autoComplete="tel" value={form.phone} onChange={onChange} error={errors.phone} />
      </div>
      <FormField label="البريد الإلكتروني" name="email" dir="ltr" value={user.email} disabled hint="لا يمكن تغيير البريد الإلكتروني" />
      <button type="submit" className="btn btn--gold self-start" disabled={saving}>
        {saving ? 'جارٍ الحفظ…' : 'حفظ البيانات'}
      </button>
    </form>
  )
}

function PasswordForm() {
  const { changePassword } = useAuth()
  const empty = { currentPassword: '', newPassword: '', confirm: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const onChange = (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    if (form.newPassword !== form.confirm) {
      setErrors({ confirm: 'كلمتا المرور غير متطابقتين' })
      return
    }
    setSaving(true)
    try {
      await changePassword(form.currentPassword, form.newPassword)
      setForm(empty)
      setSaved(true)
    } catch (err) {
      setErrors(err.errors)
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {saved && <Saved>✓ تم تغيير كلمة المرور، وتم تسجيل الخروج من الأجهزة الأخرى.</Saved>}
      <ErrorMessage>{message}</ErrorMessage>
      <FormField label="كلمة المرور الحالية" name="currentPassword" type="password" dir="ltr" autoComplete="current-password" value={form.currentPassword} onChange={onChange} error={errors.currentPassword} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="كلمة المرور الجديدة" name="newPassword" type="password" dir="ltr" autoComplete="new-password" hint="8 أحرف على الأقل" value={form.newPassword} onChange={onChange} error={errors.newPassword} />
        <FormField label="تأكيد كلمة المرور الجديدة" name="confirm" type="password" dir="ltr" autoComplete="new-password" value={form.confirm} onChange={onChange} error={errors.confirm} />
      </div>
      <button type="submit" className="btn btn--ghost self-start" disabled={saving}>
        {saving ? 'جارٍ التغيير…' : 'تغيير كلمة المرور'}
      </button>
    </form>
  )
}

export default function Profile() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  // Both updates in one transition, so this protected page never renders
  // with a logged-out user (which would redirect to /login instead of home).
  function handleLogout() {
    startTransition(() => {
      navigate('/', { replace: true })
      logout()
    })
  }

  return (
    <>
      <PageHead title="حسابي" text={`مرحبًا ${user.name}`} />
      <section className="section pt-12!">
        <div className="container flex max-w-3xl flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-line-strong bg-white/[0.05] p-5">
            <div className="me-auto">
              <p className="font-bold text-cream">{user.name}</p>
              <p className="text-xs text-dim">
                {isAdmin ? 'مدير' : 'عميل'} · عضو منذ {new Date(user.createdAt).toLocaleDateString('ar')}
              </p>
            </div>
            <Link className="btn btn--gold btn--sm" to="/my-tickets">
              تذاكري
            </Link>
            {isAdmin && (
              <Link className="btn btn--gold btn--sm" to="/admin">
                لوحة التحكم
              </Link>
            )}
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          </div>

          <Card title="البيانات الشخصية">
            <ProfileForm />
          </Card>
          <Card title="كلمة المرور">
            <PasswordForm />
          </Card>
        </div>
      </section>
    </>
  )
}
