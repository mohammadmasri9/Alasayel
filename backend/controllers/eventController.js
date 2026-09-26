import Event, { EVENT_STATUSES, PUBLIC_EVENT_STATUSES } from '../models/Event.js'
import Ticket, { ACTIVE_TICKET_STATUSES } from '../models/Ticket.js'
import { deleteImage, uploadImage } from '../services/cloudinaryService.js'
import ApiError from '../utils/ApiError.js'
import { containsRegex } from '../utils/search.js'
import { todayUTC, validateEvent } from '../utils/validateEvent.js'

const IMAGE_FOLDER = 'events'
const isAdmin = (user) => user?.role === 'admin'

function assertValid(errors) {
  if (Object.keys(errors).length) throw new ApiError(400, 'البيانات المدخلة غير صالحة', errors)
}

// GET /api/events?when=upcoming|past|all&status=&q=&page=&limit=
// Public: published / closed / cancelled events. Drafts only with
// scope=all for admins.
export async function listEvents(req, res) {
  const { when = 'upcoming', status, q, scope } = req.query
  const adminAll = isAdmin(req.user) && scope === 'all'
  const filter = {}

  const allowed = adminAll ? EVENT_STATUSES : PUBLIC_EVENT_STATUSES
  filter.status = allowed.includes(status) ? status : { $in: allowed }

  const today = todayUTC()
  if (when === 'upcoming') filter.date = { $gte: today }
  else if (when === 'past') filter.date = { $lt: today }

  if (typeof q === 'string' && q.trim()) {
    const re = containsRegex(q)
    filter.$or = [{ title: re }, { location: re }, { description: re }]
  }

  // Upcoming: soonest first. Past / all: most recent first.
  const sort = when === 'upcoming' ? { date: 1, startTime: 1 } : { date: -1, startTime: -1 }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50)
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)

  const [events, total] = await Promise.all([
    Event.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Event.countDocuments(filter),
  ])
  res.json({ events, total, page, pages: Math.max(Math.ceil(total / limit), 1) })
}

// GET /api/events/:id — drafts are visible to admins only.
export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id)
  if (!event || (event.status === 'draft' && !isAdmin(req.user))) {
    throw new ApiError(404, 'الفعالية غير موجودة')
  }
  res.json({ event })
}

// POST /api/events — admin. multipart/form-data, optional `coverImage` file.
export async function createEvent(req, res) {
  const { errors, data } = validateEvent(req.body)
  assertValid(errors)

  const file = req.files?.[0]
  const coverImage = file ? await uploadImage(file, IMAGE_FOLDER) : null
  try {
    const event = await Event.create({
      ...data,
      coverImage,
      availableTickets: data.totalTickets,
      createdBy: req.user._id,
    })
    res.status(201).json({ event })
  } catch (err) {
    if (coverImage) await deleteImage(coverImage.publicId)
    throw err
  }
}

// PUT /api/events/:id — admin. JSON or multipart.
// A new `coverImage` file replaces the old one; removeCover=true removes it.
export async function updateEvent(req, res) {
  const event = await Event.findById(req.params.id)
  if (!event) throw new ApiError(404, 'الفعالية غير موجودة')

  const { errors, data } = validateEvent(req.body, { partial: true })

  // Compare times against the saved values when only one of them changes.
  const start = data.startTime ?? event.startTime
  const end = data.endTime ?? event.endTime
  if (!errors.startTime && !errors.endTime && start && end && end <= start) {
    errors.endTime = 'وقت الانتهاء يجب أن يكون بعد وقت البدء'
  }

  // Changing the capacity keeps already-reserved tickets reserved:
  // available = newTotal - alreadySold, and newTotal can't go below alreadySold.
  if (data.totalTickets !== undefined) {
    const sold = event.totalTickets - event.availableTickets
    if (data.totalTickets < sold) {
      errors.totalTickets = `لا يمكن أن يقل العدد عن التذاكر المحجوزة (${sold})`
    } else {
      data.availableTickets = data.totalTickets - sold
    }
  }
  assertValid(errors)

  const oldCoverId = event.coverImage?.publicId
  const file = req.files?.[0]
  const removeCover = req.body.removeCover === 'true' || req.body.removeCover === true
  const newCover = file ? await uploadImage(file, IMAGE_FOLDER) : null

  event.set(data)
  if (newCover) event.coverImage = newCover
  else if (removeCover) event.coverImage = null

  try {
    await event.save()
  } catch (err) {
    if (newCover) await deleteImage(newCover.publicId)
    throw err
  }

  // Delete the old cover only after the change is saved.
  if (oldCoverId && (newCover || removeCover)) await deleteImage(oldCoverId)
  res.json({ event })
}

// DELETE /api/events/:id — admin.
export async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.id)
  if (!event) throw new ApiError(404, 'الفعالية غير موجودة')

  // Customers' tickets must never disappear: an event with active tickets
  // has to be cancelled instead. Leftover cancelled tickets are removed.
  const active = await Ticket.countDocuments({ eventId: event._id, status: { $in: ACTIVE_TICKET_STATUSES } })
  if (active > 0) {
    throw new ApiError(409, `لا يمكن حذف فعالية عليها ${active} حجز. غيّر حالتها إلى «ملغاة» بدلًا من ذلك`)
  }
  await Ticket.deleteMany({ eventId: event._id })
  await event.deleteOne()
  if (event.coverImage?.publicId) await deleteImage(event.coverImage.publicId)
  res.json({ message: 'تم حذف الفعالية' })
}
