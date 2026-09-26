import { createContext } from 'react'

// Kept separate from SettingsProvider so React Fast Refresh works.
export const SettingsContext = createContext(null)
