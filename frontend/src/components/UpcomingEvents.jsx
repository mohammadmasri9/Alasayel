import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsApi } from '../services/api'
import EventCard from './EventCard'

// Grid of the next `limit` upcoming events, loaded from the API.
// Used on the Home, Championships and Events pages.
export default function UpcomingEvents({ limit = 3 }) {
  const [events, setEvents] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    eventsApi
      .list({ when: 'upcoming', limit })
      .then(({ events }) => setEvents(events))
      .catch(() => setFailed(true))
  }, [limit])

  if (failed) return null

  if (!events) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: limit }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl border border-line bg-white/[0.035]" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
        <p className="mb-2 text-4xl">🗓️</p>
        سيتم الإعلان عن الفعاليات والبطولات القادمة قريبًا.
        <Link to="/contact" className="ms-2 font-bold text-gold hover:underline">
          تواصل معنا
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  )
}
