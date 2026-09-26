import Ticket from '../models/Ticket.js'
import User, { ROLES } from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { containsRegex } from '../utils/search.js'

// GET /api/users?q=&role=&status=active|inactive&page=&limit= — admin.
// Each user comes with their number of (non-cancelled) bookings.
export async function listUsers(req, res) {
  const { q, role, status } = req.query
  const filter = {}
  if (ROLES.includes(role)) filter.role = role
  if (status === 'active') filter.isActive = true
  if (status === 'inactive') filter.isActive = false
  if (typeof q === 'string' && q.trim()) {
    const re = containsRegex(q)
    filter.$or = [{ name: re }, { email: re }, { phone: re }]
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100)
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ])

  const counts = await Ticket.aggregate([
    { $match: { userId: { $in: users.map((u) => u._id) }, status: { $ne: 'cancelled' } } },
    { $group: { _id: '$userId', bookings: { $sum: 1 }, seats: { $sum: '$quantity' } } },
  ])
  const byUser = new Map(counts.map((c) => [c._id.toString(), c]))

  res.json({
    users: users.map((u) => {
      const c = byUser.get(u._id.toString())
      return { ...u.toJSON(), bookings: c?.bookings ?? 0, seats: c?.seats ?? 0 }
    }),
    total,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
  })
}

// PUT /api/users/:id { role?, isActive? } — admin.
// Safety rules: an admin can't change their own role/status (no locking
// yourself out), and the last active admin can't be demoted or disabled.
export async function updateUser(req, res) {
  const { role, isActive } = req.body || {}
  const changes = {}
  if (role !== undefined) {
    if (!ROLES.includes(role)) throw new ApiError(400, 'الدور غير صالح')
    changes.role = role
  }
  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') throw new ApiError(400, 'الحالة غير صالحة')
    changes.isActive = isActive
  }
  if (!Object.keys(changes).length) throw new ApiError(400, 'لا توجد تغييرات')

  const user = await User.findById(req.params.id)
  if (!user) throw new ApiError(404, 'المستخدم غير موجود')
  if (user._id.equals(req.user._id)) {
    throw new ApiError(400, 'لا يمكنك تغيير دورك أو إيقاف حسابك بنفسك')
  }

  const losesAdmin = user.role === 'admin' && user.isActive && (changes.role === 'customer' || changes.isActive === false)
  if (losesAdmin) {
    const otherAdmins = await User.countDocuments({ _id: { $ne: user._id }, role: 'admin', isActive: true })
    if (otherAdmins === 0) throw new ApiError(400, 'لا يمكن إزالة آخر مدير نشط')
  }

  user.set(changes)
  await user.save()
  res.json({ user })
}
