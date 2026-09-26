import mongoose from 'mongoose'
import Event from '../models/Event.js'
import Ticket, { ACTIVE_TICKET_STATUSES, MAX_TICKETS_PER_RESERVATION, TICKET_STATUSES } from '../models/Ticket.js'
import User from '../models/User.js'
import { paymentService } from '../services/paymentService.js'
import ApiError from '../utils/ApiError.js'
import { containsRegex } from '../utils/search.js'
import { generateTicketCode } from '../utils/ticketCode.js'
import { todayUTC } from '../utils/validateEvent.js'

const EVENT_FIELDS = 'title date startTime endTime location coverImage status ticketPrice currency'
const isAdmin = (user) => user?.role === 'admin'

// Explains why a reservation was refused, after the atomic update failed.
async function reservationError(eventId, quantity) {
  const event = await Event.findById(eventId)
  if (!event || event.status === 'draft') return new ApiError(404, 'الفعالية غير موجودة')
  if (event.status === 'cancelled') return new ApiError(409, 'تم إلغاء هذه الفعالية')
  if (event.status === 'closed') return new ApiError(409, 'الحجز مغلق لهذه الفعالية')
  if (event.date < todayUTC()) return new ApiError(409, 'انتهت هذه الفعالية')
  if (event.totalTickets === 0) return new ApiError(409, 'هذه الفعالية لا تتطلب حجزًا مسبقًا')
  if (event.availableTickets === 0) return new ApiError(409, 'نفدت جميع التذاكر')
  return new ApiError(409, `متبقٍ ${event.availableTickets} تذكرة فقط`, {
    quantity: `الحد الأقصى المتاح ${Math.min(event.availableTickets, quantity)}`,
  })
}

// POST /api/tickets  { eventId, quantity } — any logged-in user.
export async function reserveTickets(req, res) {
  const { eventId } = req.body || {}
  const quantity = Number(req.body?.quantity)
  if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, 'الفعالية غير صالحة')
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TICKETS_PER_RESERVATION) {
    throw new ApiError(400, 'عدد التذاكر غير صالح', {
      quantity: `اختر من 1 إلى ${MAX_TICKETS_PER_RESERVATION} تذاكر`,
    })
  }

  // Take the seats in ONE atomic update: it only succeeds if the event is
  // bookable and still has enough seats, so two customers can never both
  // get the last seat.
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: 'published',
      date: { $gte: todayUTC() },
      totalTickets: { $gt: 0 },
      availableTickets: { $gte: quantity },
    },
    { $inc: { availableTickets: -quantity } },
    { returnDocument: 'after' },
  )
  if (!event) throw await reservationError(eventId, quantity)

  const totalPrice = event.ticketPrice * quantity
  let ticket
  let payment
  try {
    payment = await paymentService.startPayment({ totalPrice })
    // Retry in the (very unlikely) case of a duplicate ticket code.
    for (let attempt = 0; !ticket; attempt++) {
      try {
        ticket = await Ticket.create({
          eventId: event._id,
          userId: req.user._id,
          quantity,
          unitPrice: event.ticketPrice,
          totalPrice,
          currency: event.currency,
          ticketCode: generateTicketCode(),
          status: payment.status,
          paymentProvider: paymentService.name,
        })
      } catch (err) {
        if (err.code !== 11000 || attempt >= 4) throw err
      }
    }
  } catch (err) {
    // Give the seats back if the ticket couldn't be created.
    await Event.updateOne({ _id: event._id }, { $inc: { availableTickets: quantity } })
    throw err
  }

  await ticket.populate('eventId', EVENT_FIELDS)
  res.status(201).json({ ticket, instructions: payment.instructions })
}

// GET /api/tickets/my — the logged-in user's tickets, newest first.
export async function myTickets(req, res) {
  const tickets = await Ticket.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('eventId', EVENT_FIELDS)
  res.json({ tickets })
}

// GET /api/tickets/:id — the ticket's owner or an admin.
export async function getTicket(req, res) {
  const ticket = await Ticket.findById(req.params.id)
    .populate('eventId', EVENT_FIELDS)
    .populate('userId', 'name email phone')
  // 404 (not 403) for other people's tickets, so ids can't be probed.
  if (!ticket || (!isAdmin(req.user) && ticket.userId?._id.toString() !== req.user._id.toString())) {
    throw new ApiError(404, 'التذكرة غير موجودة')
  }
  res.json({ ticket })
}

async function releaseSeats(ticket) {
  await Event.updateOne({ _id: ticket.eventId._id ?? ticket.eventId }, { $inc: { availableTickets: ticket.quantity } })
}

// PUT /api/tickets/:id/cancel — the owner cancels an unpaid reservation
// before the event. Paid tickets are cancelled by the center (refunds).
export async function cancelMyTicket(req, res) {
  const existing = await Ticket.findOne({ _id: req.params.id, userId: req.user._id }).populate('eventId', 'date')
  if (!existing) throw new ApiError(404, 'التذكرة غير موجودة')
  if (existing.status !== 'reserved') {
    throw new ApiError(409, 'يمكن إلغاء الحجوزات غير المدفوعة فقط. للتذاكر المدفوعة تواصل مع المركز')
  }
  if (existing.eventId && existing.eventId.date < todayUTC()) throw new ApiError(409, 'انتهت الفعالية')

  // Atomic: only one request can move it out of "reserved", so seats are
  // never returned twice.
  const ticket = await Ticket.findOneAndUpdate(
    { _id: existing._id, status: 'reserved' },
    { status: 'cancelled', cancelledAt: new Date() },
    { returnDocument: 'after' },
  )
  if (!ticket) throw new ApiError(409, 'تم تعديل حالة التذكرة، يرجى تحديث الصفحة')
  await releaseSeats(ticket)
  await ticket.populate('eventId', EVENT_FIELDS)
  res.json({ ticket })
}

// GET /api/tickets?eventId=&status=&q=&page=&limit= — admin.
// q matches the ticket code, or the customer's name / email / phone.
export async function listTickets(req, res) {
  const { eventId, status, q } = req.query
  const filter = {}
  if (mongoose.isValidObjectId(eventId)) filter.eventId = new mongoose.Types.ObjectId(String(eventId))
  if (typeof q === 'string' && q.trim()) {
    const re = containsRegex(q)
    const users = await User.find({ $or: [{ name: re }, { email: re }, { phone: re }] }).select('_id').limit(200)
    filter.$or = [{ ticketCode: re }, { userId: { $in: users.map((u) => u._id) } }]
  }

  // Seat totals per status for the same filter (before the status filter),
  // e.g. to see how many seats are paid vs. unpaid for one event.
  const totals = await Ticket.aggregate([
    { $match: filter },
    { $group: { _id: '$status', seats: { $sum: '$quantity' }, tickets: { $sum: 1 } } },
  ])
  const summary = Object.fromEntries(TICKET_STATUSES.map((s) => [s, { seats: 0, tickets: 0 }]))
  for (const t of totals) summary[t._id] = { seats: t.seats, tickets: t.tickets }

  if (TICKET_STATUSES.includes(status)) filter.status = status
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100)
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('eventId', 'title date startTime')
      .populate('userId', 'name email phone'),
    Ticket.countDocuments(filter),
  ])
  res.json({ tickets, total, page, pages: Math.max(Math.ceil(total / limit), 1), summary })
}

// PUT /api/tickets/:id/status { status } — admin.
// Cancelling returns the seats to the event. Cancelled is final.
export async function updateTicketStatus(req, res) {
  const { status } = req.body || {}
  if (!TICKET_STATUSES.includes(status)) throw new ApiError(400, 'الحالة غير صالحة')

  const current = await Ticket.findById(req.params.id)
  if (!current) throw new ApiError(404, 'التذكرة غير موجودة')
  if (current.status === 'cancelled') {
    throw new ApiError(409, 'لا يمكن استعادة تذكرة ملغاة. أنشئ حجزًا جديدًا بدلًا منها')
  }

  let ticket = current
  if (status !== current.status) {
    const update = status === 'cancelled' ? { status, cancelledAt: new Date() } : { status }
    ticket = await Ticket.findOneAndUpdate(
      { _id: current._id, status: { $in: ACTIVE_TICKET_STATUSES } },
      update,
      { returnDocument: 'after' },
    )
    if (!ticket) throw new ApiError(409, 'تم تعديل حالة التذكرة، يرجى تحديث الصفحة')
    if (status === 'cancelled') await releaseSeats(ticket)
  }

  await ticket.populate([
    { path: 'eventId', select: 'title date startTime' },
    { path: 'userId', select: 'name email phone' },
  ])
  res.json({ ticket })
}
