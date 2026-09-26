import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ticketsApi } from '../services/api'
import { formatTicketPrice } from '../utils/event'
import { MAX_TICKETS_PER_RESERVATION } from '../utils/ticket'
import ErrorMessage from './ErrorMessage'

// Quantity picker + "reserve" button for a bookable event.
export default function ReserveBox({ event }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const max = Math.min(MAX_TICKETS_PER_RESERVATION, event.availableTickets)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function reserve() {
    setError('')
    setSubmitting(true)
    try {
      const { ticket, instructions } = await ticketsApi.reserve(event._id, quantity)
      navigate(`/tickets/${ticket._id}`, { state: { justBooked: true, instructions } })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const stepBtn =
    'flex size-10 items-center justify-center rounded-full border border-line text-xl text-cream transition hover:border-gold disabled:opacity-30'

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        متبقٍ <span className="font-bold text-gold">{event.availableTickets}</span> من {event.totalTickets} تذكرة
      </p>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-gold-soft">عدد التذاكر</span>
        <div className="flex items-center gap-3">
          <button type="button" className={stepBtn} onClick={() => setQuantity((q) => q - 1)} disabled={quantity <= 1} aria-label="إنقاص">
            −
          </button>
          <span className="min-w-8 text-center text-xl font-extrabold text-cream" aria-live="polite">
            {quantity}
          </span>
          <button type="button" className={stepBtn} onClick={() => setQuantity((q) => q + 1)} disabled={quantity >= max} aria-label="زيادة">
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-muted">المجموع</span>
        <span className="text-2xl font-extrabold text-gold">{formatTicketPrice(event.ticketPrice * quantity, event.currency)}</span>
      </div>

      <ErrorMessage>{error}</ErrorMessage>

      {user ? (
        <button type="button" className="btn btn--gold w-full" onClick={reserve} disabled={submitting}>
          {submitting ? 'جارٍ الحجز…' : event.ticketPrice > 0 ? 'احجز الآن — الدفع في المركز' : 'احجز مجانًا'}
        </button>
      ) : (
        <Link className="btn btn--gold w-full" to="/login" state={{ from: location }}>
          سجّل الدخول للحجز
        </Link>
      )}
      {event.ticketPrice > 0 && (
        <p className="text-xs text-dim">يُثبَّت الحجز بعد الدفع في المركز. يمكنك إلغاء الحجز غير المدفوع من صفحة «تذاكري».</p>
      )}
    </div>
  )
}
