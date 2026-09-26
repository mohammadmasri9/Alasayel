import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cloudinary, { CLOUDINARY_FOLDER, cloudinaryEnabled } from '../config/cloudinary.js'
import { isProduction } from '../config/env.js'
import ApiError from '../utils/ApiError.js'

// All image storage goes through this file. Controllers only ever see
// { url, publicId } objects, which is what gets stored in MongoDB.
//
// Without Cloudinary credentials, in development only, files are written
// to backend/uploads/ so the app can be tried without an account.
// Their publicId starts with "local:".

// UPLOADS_DIR can be overridden (the test runner uses a temporary folder).
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads')
const LOCAL_PREFIX = 'local:'

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUDINARY_FOLDER}/${folder}`,
        resource_type: 'image',
        // Cap the stored size; Cloudinary serves resized versions on demand.
        transformation: [{ width: 2000, height: 2000, crop: 'limit', quality: 'auto' }],
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    )
    stream.end(buffer)
  })
}

async function uploadToDisk(file, folder) {
  const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype]
  const name = `${folder}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
  await fs.writeFile(path.join(UPLOADS_DIR, name), file.buffer)
  return { url: `/uploads/${name}`, publicId: LOCAL_PREFIX + name }
}

// Upload one multer file (memory storage). Returns { url, publicId }.
export async function uploadImage(file, folder) {
  if (cloudinaryEnabled) {
    try {
      const result = await uploadToCloudinary(file.buffer, folder)
      return { url: result.secure_url, publicId: result.public_id }
    } catch (err) {
      console.error('Cloudinary upload failed:', err.message)
      throw new ApiError(502, 'تعذّر رفع الصورة، يرجى المحاولة مجددًا')
    }
  }
  if (isProduction) throw new ApiError(503, 'رفع الصور غير مُفعّل على الخادم')
  return uploadToDisk(file, folder)
}

// Upload several files. If any upload fails, the ones that succeeded are
// deleted again so nothing is left orphaned.
export async function uploadImages(files, folder) {
  const results = await Promise.allSettled(files.map((f) => uploadImage(f, folder)))
  const uploaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
  const failed = results.find((r) => r.status === 'rejected')
  if (failed) {
    await deleteImages(uploaded)
    throw failed.reason
  }
  return uploaded
}

// Best-effort delete: a failure is logged but never breaks the request,
// because the database change has already happened.
export async function deleteImage(publicId) {
  if (!publicId) return
  try {
    if (publicId.startsWith(LOCAL_PREFIX)) {
      const name = path.basename(publicId.slice(LOCAL_PREFIX.length))
      await fs.rm(path.join(UPLOADS_DIR, name), { force: true })
    } else if (cloudinaryEnabled) {
      await cloudinary.uploader.destroy(publicId, { invalidate: true })
    }
  } catch (err) {
    console.error(`Could not delete image ${publicId}:`, err.message)
  }
}

export function deleteImages(images = []) {
  return Promise.all(images.map((img) => deleteImage(img.publicId)))
}
