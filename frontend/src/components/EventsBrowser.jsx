import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { eventsApi } from '../services/api'
import ErrorMessage from './ErrorMessage'
import EventCard from './EventCard'
import Loading from './Loading'
import Pagination from './Pagination'

const TABS = { upcoming: 'القادمة', past: 'السابقة' }

// Upcoming / past events with tabs and pages, kept in the URL
// (?when=past&page=2) so the back button works.
export default function EventsBrowser() {
  const [params, setParams] = useSearchParams()
  const when = params.get('when') === 'past' ? 'past' : 'upcoming'
  const page = Number(params.get('page')) || 1
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    eventsApi
      .list({ when, page, limit: 9 })
      .then((data) => {
        if (cancelled) return
        setResult({ ...data, when })
        setError('')
      })
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [when, page])

  const tabClass = (active) =>
    `rounded-full px-5 py-2 text-sm font-bold transition ${active ? 'bg-gold text-green-950' : 'text-muted hover:text-cream'}`

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex gap-1 rounded-full border border-line bg-white/[0.035] p-1" role="tablist">
        {Object.entries(TABS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={when === key}
            className={tabClass(when === key)}
            onClick={() => setParams(key === 'upcoming' ? {} : { when: key }, { preventScrollReset: true })}
          >
            {label}
          </button>
        ))}
      </div>

      <ErrorMessage>{error}</ErrorMessage>
      {/* Show the spinner until results for the selected tab arrive */}
      {(!result || result.when !== when) && !error && <Loading />}
      {result && result.when === when && (
        <>
          {result.events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
              <p className="mb-2 text-4xl">🗓️</p>
              {when === 'upcoming' ? 'لا توجد فعاليات قادمة حاليًا. تابعنا لمعرفة المواعيد فور الإعلان عنها.' : 'لا توجد فعاليات سابقة.'}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
          <Pagination
            page={result.page}
            pages={result.pages}
            onChange={(p) => setParams({ ...(when === 'past' && { when }), ...(p > 1 && { page: String(p) }) })}
          />
        </>
      )}
    </div>
  )
}
