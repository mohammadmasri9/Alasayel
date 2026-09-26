// Small hand-written validators. Each returns an object of field -> message
// (in Arabic, shown directly in the UI). An empty object means valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const asString = (value) => (typeof value === 'string' ? value.trim() : '')

export function validateRegister(body = {}) {
  const errors = {}
  const name = asString(body.name)
  const email = asString(body.email).toLowerCase()
  const phone = asString(body.phone)
  const password = typeof body.password === 'string' ? body.password : ''

  if (name.length < 2 || name.length > 80) errors.name = 'الاسم يجب أن يكون بين 2 و 80 حرفًا'
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'البريد الإلكتروني غير صالح'
  if (password.length < 8 || password.length > 128)
    errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
  if (phone && !/^[+\d\s-]{6,30}$/.test(phone)) errors.phone = 'رقم الهاتف غير صالح'

  return { errors, data: { name, email, phone, password } }
}

// PUT /api/auth/me — only name and phone can be changed by the user.
export function validateProfile(body = {}) {
  const errors = {}
  const data = {}
  if (body.name !== undefined) {
    const name = asString(body.name)
    if (name.length < 2 || name.length > 80) errors.name = 'الاسم يجب أن يكون بين 2 و 80 حرفًا'
    else data.name = name
  }
  if (body.phone !== undefined) {
    const phone = asString(body.phone)
    if (phone && !/^[+\d\s-]{6,30}$/.test(phone)) errors.phone = 'رقم الهاتف غير صالح'
    else data.phone = phone
  }
  return { errors, data }
}

export function validatePasswordChange(body = {}) {
  const errors = {}
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
  if (!currentPassword) errors.currentPassword = 'كلمة المرور الحالية مطلوبة'
  if (newPassword.length < 8 || newPassword.length > 128) errors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
  else if (newPassword === currentPassword) errors.newPassword = 'اختر كلمة مرور مختلفة عن الحالية'
  return { errors, data: { currentPassword, newPassword } }
}

export function validateLogin(body = {}) {
  const errors = {}
  const email = asString(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email) errors.email = 'البريد الإلكتروني مطلوب'
  if (!password) errors.password = 'كلمة المرور مطلوبة'

  return { errors, data: { email, password } }
}
