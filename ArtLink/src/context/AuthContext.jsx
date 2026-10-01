import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './context'
import { login as loginWithCredentials, register as registerUser } from '../services/authService'
import { setUserOffline, setUserOnline } from '../services/presenceService'

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
  delete safeUser.password
  if (safeUser.role === 'client') safeUser.role = 'cliente'
  if (safeUser.role === 'artist') safeUser.role = 'artista'
  if (safeUser.role === 'admin') safeUser.role = 'administrador'
  return safeUser
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredSession)

  function saveSession(nextUser) {
    const safeUser = sanitizeUser(nextUser)
    if (safeUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser))
      setUserOnline(safeUser)
    } else {
      if (user) setUserOffline(user)
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
    setUser(safeUser)
    return safeUser
  }

  // Heartbeat de presencia activa mientras el usuario mantenga sesión iniciada
  useEffect(() => {
    if (!user) return

    setUserOnline(user)
    const interval = setInterval(() => {
      setUserOnline(user)
    }, 20000)

    function handleUnload() {
      // Al cerrar la pestaña, marcar última desconexión
      setUserOnline(user)
    }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [user])

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
      updateUser: (newData) => saveSession({ ...user, ...newData }),
      logout: () => saveSession(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

