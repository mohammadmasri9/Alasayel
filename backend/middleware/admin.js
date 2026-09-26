import ApiError from '../utils/ApiError.js'

// Use after requireAuth. Allows the request only for the given roles.
//   router.get('/', requireAuth, requireRole('admin'), handler)
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) throw new ApiError(401, 'يجب تسجيل الدخول أولًا')
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'ليست لديك صلاحية للوصول إلى هذا المورد')
    }
    next()
  }
}

export const requireAdmin = requireRole('admin')
