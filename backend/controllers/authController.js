import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { signToken } from '../utils/token.js'
import { validateLogin, validatePasswordChange, validateProfile, validateRegister } from '../utils/validate.js'

// POST /api/auth/register
// Public registration always creates a customer. Admins are created with
// `npm run create-admin` (see scripts/createAdmin.js), never through the API.
export async function register(req, res) {
  const { errors, data } = validateRegister(req.body)
  if (Object.keys(errors).length) throw new ApiError(400, 'البيانات المدخلة غير صالحة', errors)

  const exists = await User.exists({ email: data.email })
  if (exists) {
    throw new ApiError(409, 'البريد الإلكتروني مستخدم مسبقًا', {
      email: 'البريد الإلكتروني مستخدم مسبقًا',
    })
  }

  const user = await User.create({ ...data, role: 'customer' })
  res.status(201).json({ token: signToken(user), user })
}

// POST /api/auth/login
export async function login(req, res) {
  const { errors, data } = validateLogin(req.body)
  if (Object.keys(errors).length) throw new ApiError(400, 'البيانات المدخلة غير صالحة', errors)

  const user = await User.findOne({ email: data.email }).select('+password')
  // Same message for unknown email and wrong password, so the API
  // doesn't reveal which emails are registered.
  if (!user || !(await user.comparePassword(data.password))) {
    throw new ApiError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
  }
  if (!user.isActive) throw new ApiError(403, 'هذا الحساب موقوف، يرجى التواصل مع الإدارة')

  res.json({ token: signToken(user), user })
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: req.user })
}

// PUT /api/auth/me — update my name / phone. Email and role can't be
// changed here (role only by an admin, via /api/users/:id).
export async function updateMe(req, res) {
  const { errors, data } = validateProfile(req.body)
  if (Object.keys(errors).length) throw new ApiError(400, 'البيانات المدخلة غير صالحة', errors)
  req.user.set(data)
  await req.user.save()
  res.json({ user: req.user })
}

// PUT /api/auth/password — change my password. Every other session is
// logged out; this one gets a fresh token.
export async function changePassword(req, res) {
  const { errors, data } = validatePasswordChange(req.body)
  if (Object.keys(errors).length) throw new ApiError(400, 'البيانات المدخلة غير صالحة', errors)

  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.comparePassword(data.currentPassword))) {
    throw new ApiError(400, 'كلمة المرور الحالية غير صحيحة', { currentPassword: 'كلمة المرور الحالية غير صحيحة' })
  }
  user.password = data.newPassword
  await user.save()
  res.json({ token: signToken(user), user })
}
