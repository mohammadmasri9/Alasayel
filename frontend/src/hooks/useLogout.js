import { startTransition, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

// Log out and go to the home page. Both updates happen in one transition,
// so a protected page (profile, admin…) never re-renders with a logged-out
// user, which would redirect to /login instead of home.
export function useLogout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return useCallback(() => {
    startTransition(() => {
      navigate('/', { replace: true })
      logout()
    })
  }, [logout, navigate])
}
