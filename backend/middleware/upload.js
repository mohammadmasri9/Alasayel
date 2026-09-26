import multer from 'multer'
import ApiError from '../utils/ApiError.js'

export const MAX_IMAGE_SIZE_MB = 5
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Files stay in memory and are streamed straight to Cloudinary;
// nothing is written to the server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 10 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      const message = 'نوع الصورة غير مدعوم. المسموح: JPG, PNG, WEBP'
      return cb(new ApiError(400, message, { images: message }))
    }
    cb(null, true)
  },
})

// The browser-supplied MIME type can be faked, so also check the file's
// first bytes ("magic numbers") match a real JPEG / PNG / WEBP.
function looksLikeImage(buf) {
  if (!buf || buf.length < 12) return false
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  const png = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const webp = buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP'
  return jpeg || png || webp
}

function verifyImages(req, _res, next) {
  // req.files is an array (upload.array) or { field: [files] } (upload.fields)
  const files = Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat()
  if (files.some((f) => !looksLikeImage(f.buffer))) {
    throw new ApiError(400, 'أحد الملفات ليس صورة صالحة', { images: 'أحد الملفات ليس صورة صالحة' })
  }
  next()
}

// Accept up to `max` images in the multipart field `field`.
export function imagesUpload(field, max) {
  return [upload.array(field, max), verifyImages]
}

// Accept at most one image in each of the named fields.
// Files end up in req.files[fieldName][0].
export function imageFieldsUpload(fields) {
  return [upload.fields(fields.map((name) => ({ name, maxCount: 1 }))), verifyImages]
}
