import { useMemo, useState } from 'react'
import { AuthContext } from './context'
import { login as loginWithCredentials, register as registerUser } from '../services/authService'

export const SESSION_STORAGE_KEY = 'artlink_session'

function readStoredSession() {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

function sanitizeUser(user) {
  if (!user) return null
  const safeUser = { ...user }
  delete safeUser.passwordDemo
  return safeUser
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredSession)

  function saveSession(nextUser) {
    const safeUser = sanitizeUser(nextUser)
    if (safeUser) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser))
    else localStorage.removeItem(SESSION_STORAGE_KEY)
    setUser(safeUser)
    return safeUser
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: (nextUser) => saveSession(nextUser),
      loginWithCredentials: async (email, passwordDemo) => {
        const authenticatedUser = await loginWithCredentials(email, passwordDemo)
        return saveSession(authenticatedUser)
      },
      register: async (userData) => {
        const createdUser = await registerUser(userData)
        return saveSession(createdUser)
      },
      logout: () => saveSession(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

