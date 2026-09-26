import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi, tokenStore } from '../services/api'
import { AuthContext } from './authContextObject'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // True until we know whether a saved token is still valid, so protected
  // routes don't redirect to /login on a page refresh.
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  useEffect(() => {
    if (!tokenStore.get()) return
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear()) // expired or invalid token
      .finally(() => setLoading(false))
  }, [])

  const startSession = useCallback(({ token, user }) => {
    tokenStore.set(token)
    setUser(user)
    return user
  }, [])

  const login = useCallback(
    async (email, password) => startSession(await authApi.login(email, password)),
    [startSession],
  )

  const register = useCallback(
    async (data) => startSession(await authApi.register(data)),
    [startSession],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  // Profile edits: keep the same session, show the new name/phone.
  const updateProfile = useCallback(async (data) => {
    const { user } = await authApi.updateMe(data)
    setUser(user)
    return user
  }, [])

  // The server logs out other sessions and returns a fresh token for this one.
  const changePassword = useCallback(
    async (currentPassword, newPassword) => startSession(await authApi.changePassword(currentPassword, newPassword)),
    [startSession],
  )

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', login, register, logout, updateProfile, changePassword }),
    [user, loading, login, register, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
