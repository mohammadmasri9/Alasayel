import { useSettings } from '../hooks/useSettings'

// Centered card layout shared by the Login and Register pages.
export default function AuthCard({ title, subtitle, children, footer }) {
  const { settings } = useSettings()
  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto mt-16 w-full max-w-md rounded-3xl border border-line bg-white/[0.035] p-6 shadow-2xl sm:p-10">
          <div className="mb-8 text-center">
            <img src={settings.logo.url} alt="" className="mx-auto mb-4 h-16 w-16 object-contain" />
            <h1 className="font-display text-3xl text-cream">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </section>
  )
}
