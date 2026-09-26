// Payment abstraction. Ticketing code only calls these functions, so an
// online gateway can be added later without touching the reservation logic.
//
// Today there is only the "manual" provider: customers pay at the center
// and an admin marks the ticket as confirmed.
//
// To add a gateway later:
//   1. Add a provider object with the same functions (e.g. startPayment
//      returns a checkout URL from the gateway).
//   2. Add a webhook route that calls markPaid(ticket) when the gateway
//      confirms the payment (verify it with PAYMENT_WEBHOOK_SECRET).
//   3. Switch PAYMENT_PROVIDER in the environment.

const manual = {
  name: 'manual',

  // Called right after seats are reserved. Returns the ticket's first
  // status and what to tell the customer.
  async startPayment(ticket) {
    if (ticket.totalPrice === 0) {
      return { status: 'confirmed', instructions: null }
    }
    return {
      status: 'reserved',
      instructions: 'يرجى الدفع في المركز قبل موعد الفعالية لتأكيد الحجز، مع إبراز رمز التذكرة.',
    }
  },
}

const providers = { manual }

export const paymentService = providers[process.env.PAYMENT_PROVIDER] || manual
