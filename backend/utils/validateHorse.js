import { CURRENCIES, HORSE_GENDERS, HORSE_STATUSES } from '../models/Horse.js'

// Validates horse fields from a JSON or multipart body (multipart sends
// every value as a string). With { partial: true } only the fields that
// are present are checked, for updates.
//
// Returns { errors, data }: data holds only the cleaned, allowed fields,
// so things like ownerId or images can never be set from the body.
export function validateHorse(body = {}, { partial = false } = {}) {
  const errors = {}
  const data = {}
  const has = (key) => body[key] !== undefined
  const str = (key) => (typeof body[key] === 'string' ? body[key].trim() : '')

  const text = (key, { required = false, max, label }) => {
    if (!has(key) && partial) return
    const value = str(key)
    if (required && !value) errors[key] = `${label} مطلوب`
    else if (value.length > max) errors[key] = `${label} يجب ألا يتجاوز ${max} حرفًا`
    else data[key] = value
  }

  const number = (key, { required = false, min, max, label }) => {
    if (!has(key) && partial) return
    const raw = typeof body[key] === 'number' ? String(body[key]) : str(key)
    if (raw === '') {
      if (required) errors[key] = `${label} مطلوب`
      else data[key] = null
      return
    }
    const value = Number(raw)
    if (!Number.isFinite(value) || value < min || value > max) {
      errors[key] = `${label} يجب أن يكون رقمًا بين ${min} و ${max.toLocaleString('en')}`
    } else data[key] = value
  }

  const choice = (key, options, { required = false, label }) => {
    if (!has(key) && partial) return
    const value = str(key)
    if (!value) {
      if (required) errors[key] = `${label} مطلوب`
      return
    }
    if (!options.includes(value)) errors[key] = `${label} غير صالح`
    else data[key] = value
  }

  text('name', { required: true, max: 80, label: 'اسم الخيل' })
  number('age', { min: 0, max: 40, label: 'العمر' })
  text('breed', { max: 60, label: 'السلالة' })
  choice('gender', HORSE_GENDERS, { required: true, label: 'الجنس' })
  text('color', { max: 40, label: 'اللون' })
  number('price', { required: true, min: 0, max: 100_000_000, label: 'السعر' })
  choice('currency', CURRENCIES, { label: 'العملة' })
  text('description', { max: 3000, label: 'الوصف' })
  text('location', { max: 80, label: 'الموقع' })
  choice('status', HORSE_STATUSES, { label: 'الحالة' })

  return { errors, data }
}
