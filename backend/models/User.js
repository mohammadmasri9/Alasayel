import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

export const ROLES = ['admin', 'customer']

const SALT_ROUNDS = 12

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // bcrypt hash. `select: false` keeps it out of every query unless
    // explicitly requested with .select('+password').
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    role: { type: String, enum: ROLES, default: 'customer' },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Login tokens issued before this moment are rejected (see middleware/auth.js),
    // so changing the password logs out every other device.
    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true },
)

// Hash the password whenever it is set or changed.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
  if (!this.isNew) this.passwordChangedAt = new Date()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Never leak the password hash, even if it was selected.
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password
    delete ret.passwordChangedAt
    delete ret.__v
    return ret
  },
})

export default mongoose.model('User', userSchema)
