import mongoose from 'mongoose'

export const HORSE_STATUSES = ['available', 'pending', 'sold', 'inactive']
export const HORSE_GENDERS = ['stallion', 'mare', 'gelding', 'colt', 'filly']
export const CURRENCIES = ['ILS', 'USD', 'JOD']
export const MAX_HORSE_IMAGES = 8

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
)

const horseSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    age: { type: Number, min: 0, max: 40 },
    breed: { type: String, trim: true, maxlength: 60, default: '' },
    gender: { type: String, enum: HORSE_GENDERS, required: true },
    color: { type: String, trim: true, maxlength: 40, default: '' },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: CURRENCIES, default: 'ILS' },
    description: { type: String, trim: true, maxlength: 3000, default: '' },
    location: { type: String, trim: true, maxlength: 80, default: '' },
    images: {
      type: [imageSchema],
      validate: [(v) => v.length <= MAX_HORSE_IMAGES, `الحد الأقصى ${MAX_HORSE_IMAGES} صور`],
    },
    // "inactive" hides the listing from the public; the owner and admins
    // still see it.
    status: { type: String, enum: HORSE_STATUSES, default: 'available', index: true },
  },
  { timestamps: true },
)

horseSchema.index({ createdAt: -1 })
horseSchema.index({ price: 1 })

horseSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Horse', horseSchema)
