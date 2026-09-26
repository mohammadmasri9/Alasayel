const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s-]{6,30}$/

// Text fields and their max lengths. Only fields present in the body
// are validated and returned (partial updates).
const TEXT_FIELDS = {
  siteName: 80,
  siteNameEn: 80,
  tagline: 150,
  slogan: 200,
  footerAbout: 400,
  heroBadge: 60,
  heroTitle: 60,
  heroTitleHighlight: 60,
  heroDescription: 600,
  aboutTitle: 80,
  aboutTitleHighlight: 80,
  aboutDescription: 3000,
  address: 150,
}
const REQUIRED = ['siteName', 'heroTitle']
const SOCIAL = ['facebook', 'instagram', 'youtube', 'tiktok']

const isHttpUrl = (v) => {
  try {
    const u = new URL(v)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

// Accepts either the embed URL or the whole <iframe …> snippet that
// Google Maps' "Share → Embed a map" gives you.
function extractMapEmbed(value) {
  const src = value.match(/src=["']([^"']+)["']/i)?.[1] ?? value
  return src.replace(/&amp;/g, '&').trim()
}

export function validateSettings(body = {}) {
  const errors = {}
  const data = {}
  const has = (k) => body[k] !== undefined
  const str = (k) => (typeof body[k] === 'string' ? body[k].trim() : '')

  for (const [key, max] of Object.entries(TEXT_FIELDS)) {
    if (!has(key)) continue
    const v = str(key)
    if (!v && REQUIRED.includes(key)) errors[key] = 'هذا الحقل مطلوب'
    else if (v.length > max) errors[key] = `الحد الأقصى ${max} حرفًا`
    else data[key] = v
  }

  if (has('contactEmail')) {
    const v = str('contactEmail').toLowerCase()
    if (v && !EMAIL_RE.test(v)) errors.contactEmail = 'البريد الإلكتروني غير صالح'
    else data.contactEmail = v
  }
  for (const key of ['contactPhone', 'whatsappNumber']) {
    if (!has(key)) continue
    const v = str(key)
    if (v && !PHONE_RE.test(v)) errors[key] = 'رقم الهاتف غير صالح'
    else if (key === 'whatsappNumber' && v && !v.startsWith('+') && !v.startsWith('00')) {
      errors[key] = 'اكتب الرقم بالصيغة الدولية، مثل +970 59…'
    } else data[key] = v
  }

  if (has('mapEmbedUrl')) {
    const v = extractMapEmbed(str('mapEmbedUrl'))
    if (v && !/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(v)) {
      errors.mapEmbedUrl = 'الصق رابط التضمين من خرائط Google (مشاركة ← تضمين خريطة)'
    } else data.mapEmbedUrl = v
  }
  if (has('mapLinkUrl')) {
    const v = str('mapLinkUrl')
    if (v && !isHttpUrl(v)) errors.mapLinkUrl = 'الرابط غير صالح'
    else data.mapLinkUrl = v
  }

  // socialLinks may arrive as a JSON string (multipart) or an object.
  if (has('socialLinks')) {
    let links = body.socialLinks
    if (typeof links === 'string') {
      try {
        links = JSON.parse(links)
      } catch {
        links = null
      }
    }
    if (!links || typeof links !== 'object') errors.socialLinks = 'روابط غير صالحة'
    else {
      data.socialLinks = {}
      for (const key of SOCIAL) {
        const v = typeof links[key] === 'string' ? links[key].trim() : ''
        if (v && (!isHttpUrl(v) || v.length > 300)) errors[`socialLinks.${key}`] = 'الرابط يجب أن يبدأ بـ https://'
        else data.socialLinks[key] = v
      }
    }
  }

  if (has('openingHours')) {
    let rows = body.openingHours
    if (typeof rows === 'string') {
      try {
        rows = JSON.parse(rows)
      } catch {
        rows = null
      }
    }
    if (!Array.isArray(rows) || rows.length > 10) errors.openingHours = 'ساعات العمل غير صالحة'
    else {
      data.openingHours = rows
        .map((r) => ({ day: String(r?.day ?? '').trim().slice(0, 60), time: String(r?.time ?? '').trim().slice(0, 60) }))
        .filter((r) => r.day || r.time)
    }
  }

  return { errors, data }
}
