import { Link } from 'react-router-dom'
import { formatAge, formatPrice, GENDERS } from '../utils/horse'
import HorseStatusBadge from './HorseStatusBadge'

// Listing card used on the marketplace and "My horses" pages.
// `actions` renders extra buttons (edit/delete) under the card.
export default function HorseCard({ horse, actions }) {
  const cover = horse.images?.[0]?.url
  const meta = [horse.breed, GENDERS[horse.gender], formatAge(horse.age)].filter(Boolean)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.035] transition hover:-translate-y-1 hover:border-line-strong hover:shadow-2xl">
      <Link to={`/horses/${horse._id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-green-800">
          {cover ? (
            <img
              src={cover}
              alt={horse.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-5xl" aria-hidden="true">
              🐎
            </span>
          )}
          {horse.status !== 'available' && (
            <HorseStatusBadge status={horse.status} className="absolute top-3 right-3" />
          )}
          {horse.images?.length > 1 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-cream">
              📷 {horse.images.length}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-lg text-cream">{horse.name}</h3>
          {meta.length > 0 && <p className="text-sm text-muted">{meta.join(' · ')}</p>}
          {horse.location && <p className="text-sm text-dim">📍 {horse.location}</p>}
          <p className="mt-auto pt-2 text-xl font-extrabold text-gold">
            {formatPrice(horse.price, horse.currency)}
          </p>
        </div>
      </Link>
      {actions && <div className="flex flex-wrap justify-end gap-2 border-t border-line p-4">{actions}</div>}
    </article>
  )
}
