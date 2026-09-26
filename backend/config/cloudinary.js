import { v2 as cloudinary } from 'cloudinary'
import { isProduction } from './env.js'

export const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

// Root folder in the Cloudinary media library, e.g. alasayel/horses
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'alasayel'

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
} else if (isProduction) {
  console.warn('WARNING: Cloudinary is not configured. Image uploads will be rejected.')
} else {
  console.warn('Cloudinary is not configured: images are saved to backend/uploads/ (development only).')
}

export default cloudinary
