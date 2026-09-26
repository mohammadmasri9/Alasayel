import { isProduction } from '../config/env.js'

export function notFound(req, res) {
  res.status(404).json({ message: `المسار غير موجود: ${req.method} ${req.originalUrl}` })
}

// Central error handler: every thrown/rejected error ends up here.
// Express 5 forwards errors from async handlers automatically.
export function errorHandler(err, _req, res, _next) {
  let status = err.status || err.statusCode || 500
  let message = err.message
  let details = err.details

  if (err.name === 'ValidationError') {
    // Mongoose schema validation
    status = 400
    message = 'البيانات المدخلة غير صالحة'
    details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    )
  } else if (err.name === 'CastError') {
    status = 400
    message = 'معرّف غير صالح'
  } else if (err.code === 11000) {
    // Duplicate unique key
    status = 409
    const field = Object.keys(err.keyValue || {})[0]
    message = field === 'email' ? 'البريد الإلكتروني مستخدم مسبقًا' : 'القيمة مستخدمة مسبقًا'
    details = field ? { [field]: message } : undefined
  } else if (err.name === 'MulterError') {
    // File upload limits (see middleware/upload.js)
    status = 400
    message =
      {
        LIMIT_FILE_SIZE: 'حجم الصورة كبير جدًا (الحد الأقصى 5 ميغابايت)',
        LIMIT_FILE_COUNT: 'عدد الصور أكبر من المسموح',
        LIMIT_UNEXPECTED_FILE: 'عدد الصور أكبر من المسموح',
      }[err.code] || 'خطأ في رفع الملف'
    details = { images: message }
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'صيغة JSON غير صالحة'
  } else if (err.type === 'entity.too.large') {
    status = 413
    message = 'حجم الطلب كبير جدًا'
  }

  if (status >= 500) {
    console.error(err)
    // Don't leak internals to clients in production
    if (isProduction) message = 'حدث خطأ في الخادم'
  }

  res.status(status).json({ message, ...(details && { errors: details }) })
}
