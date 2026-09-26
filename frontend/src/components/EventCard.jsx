import { Link } from 'react-router-dom'
import { eventDateBadge, formatEventDate, formatTicketPrice, formatTimeRange } from '../utils/event'
import EventStatusBadge from './EventStatusBadge'

export default function EventCard({ event }) {
  const { day, month } = eventDateBadge(event.date)
  const time = formatTimeRange(event.startTime, event.endTime)
  const soldOut = event.status === 'published' && event.totalTickets > 0 && event.availableTickets === 0

  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.035] transition hover:-translate-y-1 hover:border-line-strong hover:shadow-2xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-green-700 to-green-950">
        {event.coverImage?.url ? (
          <img
            src={event.coverImage.url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-5xl opacity-60" aria-hidden="true">
            🏆
          </span>
        )}
        <div className="absolute top-3 right-3 flex min-w-14 flex-col items-center rounded-xl bg-green-950/85 px-2 py-1.5 leading-tight backdrop-blur">
          <span className="text-xl font-extrabold text-gold">{day}</span>
          <span className="text-xs text-cream">{month}</span>
        </div>
        {event.status !== 'published' && <EventStatusBadge status={event.status} className="absolute top-3 left-3" />}
        {soldOut && (
          <span className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white">
            نفدت التذاكر
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg text-cream">{event.title}</h3>
        <p className="text-sm text-muted">
          🗓️ {formatEventDate(event.date)}
          {time && <span className="block">🕓 {time}</span>}
        </p>
        {event.location && <p className="text-sm text-dim">📍 {event.location}</p>}
        <p className="mt-auto pt-2 font-extrabold text-gold">{formatTicketPrice(event.ticketPrice, event.currency)}</p>
      </div>
    </Link>
  )
}
