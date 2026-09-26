const tones = {
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  amber: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  red: 'bg-red-500/15 text-red-200 border-red-400/30',
  gray: 'bg-white/10 text-muted border-white/20',
}

// Small rounded status label.
export default function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold backdrop-blur ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
