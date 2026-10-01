import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './context'
import { login as loginWithCredentials, register as registerUser } from '../services/authService'
import { setUserOffline, setUserOnline } from '../services/presenceService'
import { readLocal, removeLocal, saveLocal } from '../services/persistence/localStorageService'
import { ACTIVE_SESSION_KEY } from '../services/persistence/storageKeys'
import { isValidSession, sanitizeSessionUser } from '../services/persistence/persistenceUtils'
import { migrateGuestChatToUser } from '../services/chatPersistenceService'
import apiClient from '../services/apiClient'

export const SESSION_STORAGE_KEY = 'artlink_session'

function readStoredSession() {
  let stored = readLocal(ACTIVE_SESSION_KEY, null)
  if (!stored) {
    stored = readLocal(SESSION_STORAGE_KEY, null)
  }
  if (!stored && typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch {}
  }
  if (!stored) return null

  if (!isValidSession(stored)) {
    return null
  }

  return sanitizeSessionUser(stored)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredSession)

  function saveSession(nextUser) {
    const safeUser = sanitizeSessionUser(nextUser)

    if (safeUser) {
      saveLocal(ACTIVE_SESSION_KEY, safeUser)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser))
        }
      } catch {}
      setUserOnline(safeUser)

      // Migrar chat de invitado a la cuenta si existía
      migrateGuestChatToUser(safeUser.id).catch((err) => {
        console.warn('[AuthContext] Error menor migrando chat de invitado:', err?.message)
      })
    } else {
      if (user) setUserOffline(user)
      removeLocal(ACTIVE_SESSION_KEY)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY)
        }
      } catch {}
    }

    setUser(safeUser)
    return safeUser
  }

  // Refrescar datos del usuario en segundo plano desde JSON Server si la sesión es válida
  useEffect(() => {
    let active = true
    if (!user?.id) return

    apiClient
      .get(`/users/${user.id}`)
      .then((res) => {
        if (!active || !res?.data) return
        const freshUser = res.data
        // Actualizar datos no sensibles si cambiaron (avatar, artistProfileId, name)
        const updated = sanitizeSessionUser({
          ...user,
          name: freshUser.name || user.name,
          role: freshUser.role || user.role,
          artistProfileId: freshUser.artistProfileId || user.artistProfileId || null,
        })
        if (JSON.stringify(updated) !== JSON.stringify(user)) {
          saveLocal(ACTIVE_SESSION_KEY, updated)
          setUser(updated)
        }
      })
      .catch(() => {
        // Si JSON Server está apagado, se conserva la sesión local intacta
      })

    return () => {
      active = false
    }
  }, [user?.id])

  // Heartbeat de presencia activa mientras el usuario mantenga sesión iniciada
  useEffect(() => {
    if (!user) return

    setUserOnline(user)
    const interval = setInterval(() => {
      setUserOnline(user)
    }, 20000)

    function handleUnload() {
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
