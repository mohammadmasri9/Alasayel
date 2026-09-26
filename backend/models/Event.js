import mongoose from 'mongoose'
import { CURRENCIES } from './Horse.js'

// draft     -> only admins see it
// published -> public, tickets can be reserved (Milestone 4)
// closed    -> public, reservations closed
// cancelled -> public, marked as cancelled
export const EVENT_STATUSES = ['draft', 'published', 'closed', 'cancelled']
export const PUBLIC_EVENT_STATUSES = ['published', 'closed', 'cancelled']

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    // The calendar day, stored as midnight UTC (e.g. 2026-10-15T00:00:00Z).
    // Always format it with timeZone: 'UTC' so it never shifts a day.
    date: { type: Date, required: true, index: true },
    startTime: { type: String, default: '' }, // "HH:MM", 24h
    endTime: { type: String, default: '' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    coverImage: {
      type: new mongoose.Schema({ url: String, publicId: String }, { _id: false }),
      default: null,
    },
    ticketPrice: { type: Number, min: 0, default: 0 }, // 0 = free entry
    currency: { type: String, enum: CURRENCIES, default: 'ILS' },
    totalTickets: { type: Number, min: 0, required: true },
    availableTickets: { type: Number, min: 0, required: true },
    status: { type: String, enum: EVENT_STATUSES, default: 'draft', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

eventSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Event', eventSchema)
