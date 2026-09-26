import mongoose from 'mongoose'
import { CURRENCIES } from './Horse.js'

// reserved  -> booked, not paid yet (pay at the center)
// confirmed -> paid, or a free event
// used      -> checked in at the gate
// cancelled -> seats returned to the event; final
export const TICKET_STATUSES = ['reserved', 'confirmed', 'used', 'cancelled']
export const ACTIVE_TICKET_STATUSES = ['reserved', 'confirmed', 'used']
export const MAX_TICKETS_PER_RESERVATION = 10

const ticketSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quantity: { type: Number, required: true, min: 1, max: MAX_TICKETS_PER_RESERVATION },
    // Price at the time of booking, so later price changes don't affect it.
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: CURRENCIES, default: 'ILS' },
    ticketCode: { type: String, required: true, unique: true },
    status: { type: String, enum: TICKET_STATUSES, default: 'reserved', index: true },
    // Which payment flow handled this ticket (see services/paymentService.js).
    paymentProvider: { type: String, default: 'manual' },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
)

ticketSchema.index({ createdAt: -1 })

ticketSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Ticket', ticketSchema)
