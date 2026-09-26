export default function ErrorMessage({ children }) {
  if (!children) return null
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
    >
      {children}
    </p>
  )
}
