import { createContext } from 'react'

// Kept separate from AuthProvider so React Fast Refresh works.
export const AuthContext = createContext(null)
