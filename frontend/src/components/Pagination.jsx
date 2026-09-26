export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null

  const btn =
    'min-w-10 rounded-full border border-line px-3 py-1.5 text-sm transition hover:border-gold disabled:pointer-events-none disabled:opacity-40'

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="الصفحات">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        السابق
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? 'page' : undefined}
          className={`${btn} ${n === page ? 'border-gold bg-gold text-green-950 font-bold' : 'text-muted'}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button type="button" className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        التالي
      </button>
    </nav>
  )
}
