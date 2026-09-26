import { useContext } from 'react'
import { SettingsContext } from '../context/settingsContextObject'

// Website content edited by admins in Website Settings, plus ready-made
// links (tel:, WhatsApp, maps). See context/SettingsContext.jsx.
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
