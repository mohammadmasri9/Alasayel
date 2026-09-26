import Event from '../models/Event.js'
import Horse, { HORSE_STATUSES } from '../models/Horse.js'
import Ticket, { TICKET_STATUSES } from '../models/Ticket.js'
import User from '../models/User.js'
import { todayUTC } from '../utils/validateEvent.js'

const DAY = 24 * 60 * 60 * 1000

// { a: 3, b: 1 } from [{ _id: 'a', n: 3 }, …], with every key present.
const countBy = (rows, keys) => Object.fromEntries(keys.map((k) => [k, rows.find((r) => r._id === k)?.n ?? 0]))

// Money per currency, e.g. [{ currency: 'ILS', amount: 1250 }].
const sumByCurrency = (match) =>
  Ticket.aggregate([
    { $match: match },
    { $group: { _id: '$currency', amount: { $sum: '$totalPrice' } } },
    { $match: { amount: { $gt: 0 } } },
    { $sort: { amount: -1 } },
  ]).then((rows) => rows.map((r) => ({ currency: r._id, amount: r.amount })))

// GET /api/admin/stats — numbers and recent activity for the dashboard.
export async function getStats(_req, res) {
  const today = todayUTC()
  const monthAgo = new Date(Date.now() - 30 * DAY)

  const [
    usersTotal, customers, inactiveUsers, newUsers,
    horseRows, upcomingEvents, draftEvents, pastEvents,
    ticketRows, revenue, awaitingPayment,
    nextEvents,
    recentUsers, recentBookings, recentCancels, recentHorses, recentEvents,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: monthAgo } }),

    Horse.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Event.countDocuments({ status: { $in: ['published', 'closed'] }, date: { $gte: today } }),
    Event.countDocuments({ status: 'draft' }),
    Event.countDocuments({ date: { $lt: today } }),

    Ticket.aggregate([{ $group: { _id: '$status', n: { $sum: 1 }, seats: { $sum: '$quantity' } } }]),
    sumByCurrency({ status: { $in: ['confirmed', 'used'] } }),
    sumByCurrency({ status: 'reserved' }),

    // How full the next bookable events are
    Event.find({ status: { $in: ['published', 'closed'] }, date: { $gte: today }, totalTickets: { $gt: 0 } })
      .sort({ date: 1, startTime: 1 })
      .limit(5)
      .select('title date startTime status totalTickets availableTickets')
      .lean(),

    User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).select('name createdAt').lean(),
    Ticket.find().sort({ createdAt: -1 }).limit(8).populate('userId', 'name').populate('eventId', 'title').lean(),
    Ticket.find({ status: 'cancelled', cancelledAt: { $ne: null } })
      .sort({ cancelledAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('eventId', 'title')
      .lean(),
    Horse.find().sort({ createdAt: -1 }).limit(3).select('name createdAt').lean(),
    Event.find().sort({ createdAt: -1 }).limit(3).select('title createdAt').lean(),
  ])

  const ticketsByStatus = Object.fromEntries(
    TICKET_STATUSES.map((s) => {
      const row = ticketRows.find((r) => r._id === s)
      return [s, { tickets: row?.n ?? 0, seats: row?.seats ?? 0 }]
    }),
  )

  // One timeline, newest first. `link` is a frontend path.
  const activity = [
    ...recentUsers.map((u) => ({ type: 'user', at: u.createdAt, title: u.name, link: '/admin/users' })),
    ...recentBookings.map((t) => ({
      type: 'booking',
      at: t.createdAt,
      title: t.userId?.name || 'مستخدم محذوف',
      detail: `${t.eventId?.title || 'فعالية محذوفة'} · ${t.quantity} تذكرة`,
      link: `/tickets/${t._id}`,
    })),
    ...recentCancels.map((t) => ({
      type: 'cancel',
      at: t.cancelledAt,
      title: t.userId?.name || 'مستخدم محذوف',
      detail: `${t.eventId?.title || 'فعالية محذوفة'} · ${t.quantity} تذكرة`,
      link: `/tickets/${t._id}`,
    })),
    ...recentHorses.map((h) => ({ type: 'horse', at: h.createdAt, title: h.name, link: `/horses/${h._id}` })),
    ...recentEvents.map((e) => ({ type: 'event', at: e.createdAt, title: e.title, link: `/events/${e._id}` })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 12)

  res.json({
    users: { total: usersTotal, customers, admins: usersTotal - customers, inactive: inactiveUsers, newThisMonth: newUsers },
    horses: { total: horseRows.reduce((n, r) => n + r.n, 0), ...countBy(horseRows, HORSE_STATUSES) },
    events: { upcoming: upcomingEvents, drafts: draftEvents, past: pastEvents },
    tickets: ticketsByStatus,
    revenue: { paid: revenue, awaitingPayment },
    nextEvents: nextEvents.map((e) => ({ ...e, sold: e.totalTickets - e.availableTickets })),
    activity,
  })
}
