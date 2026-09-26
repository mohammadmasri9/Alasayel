// Arabic labels and formatting for horse listings. The keys must match
// the enums in backend/models/Horse.js.

export const GENDERS = {
  stallion: 'حصان (فحل)',
  mare: 'فرس',
  gelding: 'حصان مخصي',
  colt: 'مُهر (ذكر)',
  filly: 'مُهرة (أنثى)',
}

export const STATUSES = {
  available: 'متاح للبيع',
  pending: 'قيد البيع',
  sold: 'تم البيع',
  inactive: 'مخفي',
}

export const CURRENCIES = {
  ILS: 'شيكل',
  USD: 'دولار',
  JOD: 'دينار',
}

export const MAX_IMAGES = 8
export const MAX_IMAGE_MB = 5
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Latin digits, Arabic currency name: "15,000 US$" style numbers are easier
// to scan in prices than Arabic-Indic digits.
export function formatPrice(price, currency = 'ILS') {
  try {
    return new Intl.NumberFormat('ar-u-nu-latn', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `${price} ${CURRENCIES[currency] || currency}`
  }
}

export function formatAge(age) {
  if (age === null || age === undefined) return null
  if (age === 0) return 'أقل من سنة'
  if (age === 1) return 'سنة واحدة'
  if (age === 2) return 'سنتان'
  if (age <= 10) return `${age} سنوات`
  return `${age} سنة`
}

