import Horse, { CURRENCIES, HORSE_GENDERS, HORSE_STATUSES, MAX_HORSE_IMAGES } from '../models/Horse.js'
import { deleteImages, uploadImages } from '../services/cloudinaryService.js'
import ApiError from '../utils/ApiError.js'
import { containsRegex } from '../utils/search.js'
import { validateHorse } from '../utils/validateHorse.js'

const IMAGE_FOLDER = 'horses'

// Only admins (the center) create and manage listings; the routes enforce
// this. ownerId records which admin created the listing.
const isAdmin = (user) => user?.role === 'admin'

function assertValid(errors) {
  if (Object.keys(errors).length) throw new ApiError(400, 'البيانات المدخلة غير صالحة', errors)
}

async function findHorseOr404(id) {
  const horse = await Horse.findById(id)
  if (!horse) throw new ApiError(404, 'الإعلان غير موجود')
  return horse
}

// GET /api/horses?q=&breed=&gender=&location=&minPrice=&maxPrice=&currency=&status=&sort=&page=&limit=
// Public. Inactive listings are hidden unless an admin asks for scope=all.
export async function listHorses(req, res) {
  const { q, breed, gender, location, minPrice, maxPrice, currency, status, sort, scope } = req.query
  const filter = {}
  const adminAll = isAdmin(req.user) && scope === 'all'

  if (typeof status === 'string' && HORSE_STATUSES.includes(status) && (status !== 'inactive' || adminAll)) {
    filter.status = status
  } else if (!adminAll) {
    filter.status = { $ne: 'inactive' }
  }

  if (typeof q === 'string' && q.trim()) {
    const re = containsRegex(q)
    filter.$or = [{ name: re }, { breed: re }, { color: re }, { location: re }, { description: re }]
  }
  if (typeof breed === 'string' && breed.trim()) filter.breed = containsRegex(breed, 60)
  if (typeof location === 'string' && location.trim()) filter.location = containsRegex(location, 80)
  if (HORSE_GENDERS.includes(gender)) filter.gender = gender
  if (CURRENCIES.includes(currency)) filter.currency = currency

  const min = Number(minPrice)
  const max = Number(maxPrice)
  if (minPrice !== undefined && minPrice !== '' && Number.isFinite(min)) filter.price = { $gte: min }
  if (maxPrice !== undefined && maxPrice !== '' && Number.isFinite(max)) filter.price = { ...filter.price, $lte: max }

  const sorts = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
  }
  const sortBy = sorts[sort] || sorts.newest

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 48)
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)

  const [horses, total] = await Promise.all([
    Horse.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit),
    Horse.countDocuments(filter),
  ])

  res.json({ horses, total, page, pages: Math.max(Math.ceil(total / limit), 1) })
}

// GET /api/horses/:id — public, but an inactive listing is only visible to admins.
export async function getHorse(req, res) {
  const horse = await Horse.findById(req.params.id)
  if (!horse || (horse.status === 'inactive' && !isAdmin(req.user))) {
    throw new ApiError(404, 'الإعلان غير موجود')
  }
  res.json({ horse, canManage: isAdmin(req.user) })
}

// POST /api/horses — admin. multipart/form-data with fields + `images` files.
export async function createHorse(req, res) {
  const { errors, data } = validateHorse(req.body)
  const files = req.files || []
  if (files.length === 0) errors.images = 'أضف صورة واحدة على الأقل'
  if (files.length > MAX_HORSE_IMAGES) errors.images = `الحد الأقصى ${MAX_HORSE_IMAGES} صور`
  assertValid(errors)

  const images = await uploadImages(files, IMAGE_FOLDER)
  try {
    const horse = await Horse.create({ ...data, images, ownerId: req.user._id })
    res.status(201).json({ horse })
  } catch (err) {
    await deleteImages(images) // don't leave orphaned uploads behind
    throw err
  }
}

// PUT /api/horses/:id — admin. JSON or multipart.
// Images: `keepImages` is a JSON array of publicIds to keep (in display
// order); new files in `images` are appended. Omit keepImages to keep all.
export async function updateHorse(req, res) {
  const horse = await findHorseOr404(req.params.id)
  const { errors, data } = validateHorse(req.body, { partial: true })

  let kept = horse.images
  if (req.body.keepImages !== undefined) {
    let ids
    try {
      ids = JSON.parse(req.body.keepImages)
    } catch {
      ids = null
    }
    if (!Array.isArray(ids)) errors.images = 'قائمة الصور غير صالحة'
    else {
      const byId = new Map(horse.images.map((img) => [img.publicId, img]))
      // Only ids that already belong to this horse can be kept.
      kept = ids.filter((id) => byId.has(id)).map((id) => byId.get(id))
    }
  }

  const files = req.files || []
  const totalImages = kept.length + files.length
  if (totalImages === 0) errors.images = 'يجب أن يحتوي الإعلان على صورة واحدة على الأقل'
  if (totalImages > MAX_HORSE_IMAGES) errors.images = `الحد الأقصى ${MAX_HORSE_IMAGES} صور`
  assertValid(errors)

  const added = await uploadImages(files, IMAGE_FOLDER)
  const keptIds = new Set(kept.map((img) => img.publicId))
  const removed = horse.images.filter((img) => !keptIds.has(img.publicId))

  horse.set(data)
  horse.images = [...kept.map((img) => ({ url: img.url, publicId: img.publicId })), ...added]
  try {
    await horse.save()
  } catch (err) {
    await deleteImages(added)
    throw err
  }

  // Only delete old images once the new state is safely saved.
  await deleteImages(removed)
  res.json({ horse })
}

// DELETE /api/horses/:id — admin.
export async function deleteHorse(req, res) {
  const horse = await findHorseOr404(req.params.id)

  await horse.deleteOne()
  await deleteImages(horse.images)
  res.json({ message: 'تم حذف الإعلان' })
}
