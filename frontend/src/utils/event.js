import { formatPrice } from './horse'

// Keys must match backend/models/Event.js
export const EVENT_STATUSES = {
  draft: 'مسودة',
  published: 'منشورة',
  closed: 'الحجز مغلق',
  cancelled: 'ملغاة',
}

// Event dates are stored as midnight UTC, so always format in UTC or
// the day can shift for visitors in other time zones.
const dayFormat = new Intl.DateTimeFormat('ar-u-nu-latn', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const dayParts = new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', month: 'short', timeZone: 'UTC' })

export const formatEventDate = (date) => dayFormat.format(new Date(date))

// { day: '15', month: 'أكتوبر' } for the date badge on cards
export function eventDateBadge(date) {
  const parts = dayParts.formatToParts(new Date(date))
  return {
    day: parts.find((p) => p.type === 'day')?.value,
    month: parts.find((p) => p.type === 'month')?.value,
  }
}

// "16:00" -> "4:00 م"
export function formatTime(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h < 12 ? 'ص' : 'م'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatTimeRange(start, end) {
  if (start && end) return `${formatTime(start)} — ${formatTime(end)}`
  return formatTime(start || end)
}

export function formatTicketPrice(price, currency) {
  return price > 0 ? formatPrice(price, currency) : 'دخول مجاني'
}

// "YYYY-MM-DD" for <input type="date"> from a stored event date
export const toDateInput = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '')

// Past = before today in Palestine
export function isPastEvent(date) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hebron' }).format(new Date())
  return toDateInput(date) < today
}
