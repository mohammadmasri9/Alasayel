export default function Loading({ label = 'جارٍ التحميل…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted" role="status">
      <span className="size-10 animate-spin rounded-full border-2 border-line border-t-gold" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
