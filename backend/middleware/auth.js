import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { verifyToken } from '../utils/token.js'

function bearerToken(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  return scheme === 'Bearer' && token ? token : null
}

// Requires a valid "Authorization: Bearer <token>" header.
// On success, attaches the current user document to req.user.
export async function requireAuth(req, _res, next) {
  const token = bearerToken(req)
  if (!token) throw new ApiError(401, 'يجب تسجيل الدخول أولًا')

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw new ApiError(401, 'انتهت الجلسة، يرجى تسجيل الدخول مجددًا')
  }

  const user = await User.findById(payload.sub).select('+passwordChangedAt')
  if (!user || !user.isActive) {
    throw new ApiError(401, 'الحساب غير موجود أو موقوف')
  }
  if (issuedBeforePasswordChange(user, payload)) {
    throw new ApiError(401, 'تم تغيير كلمة المرور، يرجى تسجيل الدخول مجددًا')
  }

  req.user = user
  next()
}

// JWT "iat" is in whole seconds, so allow the same second as the change
// (the fresh token returned by the password change itself).
function issuedBeforePasswordChange(user, payload) {
  if (!user.passwordChangedAt) return false
  return payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
}

// For public endpoints that show extra data to logged-in users (e.g. an
// owner can see their own hidden listing). Never fails: an invalid or
// missing token just means req.user stays undefined.
export async function optionalAuth(req, _res, next) {
  const token = bearerToken(req)
  if (token) {
    try {
      const payload = verifyToken(token)
      const user = await User.findById(payload.sub).select('+passwordChangedAt')
      if (user?.isActive && !issuedBeforePasswordChange(user, payload)) req.user = user
    } catch {
      // ignore: treat as anonymous
    }
  }
  next()
}
