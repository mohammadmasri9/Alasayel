import { CURRENCIES } from '../models/Horse.js'
import { EVENT_STATUSES } from '../models/Event.js'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

// "2026-10-15" -> Date at midnight UTC, or null if not a real date.
export function parseDay(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return null
  const d = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : d
}

// Today's date in Palestine, as midnight UTC, for "upcoming vs past".
export function todayUTC(timeZone = 'Asia/Hebron') {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())
  return new Date(`${ymd}T00:00:00Z`)
}

// Same idea as validateHorse: returns { errors, data } with only allowed,
// cleaned fields. { partial: true } checks only fields that are present.
export function validateEvent(body = {}, { partial = false } = {}) {
  const errors = {}
  const data = {}
  const has = (key) => body[key] !== undefined
  const str = (key) => (typeof body[key] === 'string' ? body[key].trim() : String(body[key] ?? '').trim())
  const skip = (key) => !has(key) && partial

  if (!skip('title')) {
    const v = str('title')
    if (!v) errors.title = 'عنوان الفعالية مطلوب'
    else if (v.length > 120) errors.title = 'العنوان يجب ألا يتجاوز 120 حرفًا'
    else data.title = v
  }

  if (!skip('description')) {
    const v = str('description')
    if (v.length > 5000) errors.description = 'الوصف يجب ألا يتجاوز 5000 حرف'
    else data.description = v
  }

  if (!skip('location')) {
    const v = str('location')
    if (v.length > 120) errors.location = 'الموقع يجب ألا يتجاوز 120 حرفًا'
    else data.location = v
  }

  if (!skip('date')) {
    const d = parseDay(str('date'))
    if (!d) errors.date = 'التاريخ مطلوب (يوم/شهر/سنة)'
    else data.date = d
  }

  for (const key of ['startTime', 'endTime']) {
    if (skip(key)) continue
    const v = str(key)
    if (v && !TIME_RE.test(v)) errors[key] = 'الوقت غير صالح'
    else data[key] = v
  }
  if (data.startTime && data.endTime && data.endTime <= data.startTime) {
    errors.endTime = 'وقت الانتهاء يجب أن يكون بعد وقت البدء'
  }

  if (!skip('ticketPrice')) {
    const raw = str('ticketPrice')
    const v = raw === '' ? 0 : Number(raw)
    if (!Number.isFinite(v) || v < 0 || v > 1_000_000) errors.ticketPrice = 'سعر التذكرة غير صالح'
    else data.ticketPrice = v
  }

  if (!skip('currency')) {
    const v = str('currency') || 'ILS'
    if (!CURRENCIES.includes(v)) errors.currency = 'العملة غير صالحة'
    else data.currency = v
  }

  if (!skip('totalTickets')) {
    const raw = str('totalTickets')
    const v = Number(raw)
    if (raw === '') errors.totalTickets = 'عدد التذاكر مطلوب'
    else if (!Number.isInteger(v) || v < 0 || v > 100_000) errors.totalTickets = 'عدد التذاكر يجب أن يكون رقمًا صحيحًا بين 0 و 100,000'
    else data.totalTickets = v
  }

  if (!skip('status')) {
    const v = str('status') || 'draft'
    if (!EVENT_STATUSES.includes(v)) errors.status = 'الحالة غير صالحة'
    else data.status = v
  }

  return { errors, data }
}
