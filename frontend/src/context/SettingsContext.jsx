import { useCallback, useEffect, useMemo, useState } from 'react'
import { fallbackSettings } from '../data/site'
import { settingsApi } from '../services/api'
import { SettingsContext } from './settingsContextObject'

// If the API is slow (e.g. a sleeping free server), show the site with the
// built-in content after this long instead of waiting forever.
const MAX_WAIT_MS = 2500

const digits = (s = '') => s.replace(/\D/g, '').replace(/^00/, '')

// Ready-to-use links derived from the raw settings.
function withLinks(s) {
  const wa = digits(s.whatsappNumber)
  return {
    ...s,
    phoneHref: s.contactPhone ? `tel:+${digits(s.contactPhone)}` : null,
    whatsappUrl: wa ? `https://wa.me/${wa}` : null,
    whatsappLink: (text) => (wa ? `https://wa.me/${wa}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null),
    aboutParagraphs: (s.aboutDescription || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS)
    settingsApi
      .get()
      .then(({ settings }) => setSettings(settings))
      .catch(() => setTimedOut(true)) // API down: keep the built-in content
      .finally(() => clearTimeout(timer))
    return () => clearTimeout(timer)
  }, [])

  const current = settings || fallbackSettings

  useEffect(() => {
    document.title = current.address ? `${current.siteName} | ${current.address}` : current.siteName
  }, [current.siteName, current.address])

  // Called by the admin page after saving, so the new content shows at once.
  const replace = useCallback((next) => setSettings(next), [])
  const value = useMemo(() => ({ settings: withLinks(current), replace }), [current, replace])

  if (!settings && !timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="جارٍ التحميل">
        <span className="size-10 animate-spin rounded-full border-2 border-line border-t-gold" />
      </div>
    )
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
