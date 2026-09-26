import { DEFAULT_IMAGES, DEFAULT_SETTINGS, IMAGE_FIELDS } from '../config/defaultSettings.js'
import WebsiteSettings from '../models/WebsiteSettings.js'
import { deleteImage, uploadImage } from '../services/cloudinaryService.js'
import ApiError from '../utils/ApiError.js'
import { validateSettings } from '../utils/validateSettings.js'

const IMAGE_FOLDER = 'website'

// Saved values over defaults. null/undefined -> default; an empty string
// is a deliberate "hide this" (e.g. no YouTube link).
function toPublic(doc) {
  const saved = doc || {}
  const out = {}
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    if (key === 'socialLinks') {
      out.socialLinks = Object.fromEntries(
        Object.entries(def).map(([k, v]) => [k, saved.socialLinks?.[k] ?? v]),
      )
    } else {
      out[key] = saved[key] ?? def
    }
  }
  for (const field of IMAGE_FIELDS) {
    const img = saved[field]
    out[field] = img?.url
      ? { url: img.url, isDefault: false }
      : { url: DEFAULT_IMAGES[field], isDefault: true }
  }
  out.updatedAt = saved.updatedAt || null
  return out
}

// GET /api/settings — public. The site loads this on every visit, so
// changes show up immediately without redeploying the frontend.
export async function getSettings(_req, res) {
  const doc = await WebsiteSettings.findOne({ key: 'main' }).lean()
  res.set('Cache-Control', 'no-cache')
  res.json({ settings: toPublic(doc) })
}

// PUT /api/settings — admin. multipart/form-data:
//   text fields (see utils/validateSettings.js), socialLinks / openingHours
//   as JSON strings, image files: logo, heroImage, aboutImage, eventBanner,
//   resetImages: JSON array of image fields to put back to the default.
export async function updateSettings(req, res) {
  const { errors, data } = validateSettings(req.body)

  let resetImages = []
  if (req.body.resetImages !== undefined) {
    try {
      resetImages = JSON.parse(req.body.resetImages)
    } catch {
      errors.resetImages = 'قائمة غير صالحة'
    }
    if (!Array.isArray(resetImages)) errors.resetImages = 'قائمة غير صالحة'
  }
  if (Object.keys(errors).length) throw new ApiError(400, 'البيانات المدخلة غير صالحة', errors)

  const doc = (await WebsiteSettings.findOne({ key: 'main' })) || new WebsiteSettings({ key: 'main' })

  // Upload new images first; remember which old ones to delete after saving.
  const uploaded = []
  const toDelete = []
  try {
    for (const field of IMAGE_FIELDS) {
      const file = req.files?.[field]?.[0]
      const oldId = doc[field]?.publicId
      if (file) {
        const img = await uploadImage(file, IMAGE_FOLDER)
        uploaded.push(img.publicId)
        doc[field] = img
        if (oldId) toDelete.push(oldId)
      } else if (resetImages.includes(field)) {
        doc[field] = null
        if (oldId) toDelete.push(oldId)
      }
    }

    const { socialLinks, ...rest } = data
    doc.set(rest)
    if (socialLinks) {
      for (const [k, v] of Object.entries(socialLinks)) doc.set(`socialLinks.${k}`, v)
    }
    doc.updatedBy = req.user._id
    await doc.save()
  } catch (err) {
    await Promise.all(uploaded.map((id) => deleteImage(id)))
    throw err
  }

  await Promise.all(toDelete.map((id) => deleteImage(id)))
  res.json({ settings: toPublic(doc.toObject()) })
}
