import { useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from './context'
import { login as loginWithCredentials, register as registerUser } from '../services/authService'
import { setUserOffline, setUserOnline } from '../services/presenceService'
import { readLocal, removeLocal, saveLocal } from '../services/persistence/localStorageService'
import {
  ACTIVE_SESSION_KEY,
  SESSION_LAST_ACTIVITY_KEY,
  INACTIVITY_TIMEOUT_MS,
  ACTIVITY_THROTTLE_MS,
} from '../services/persistence/storageKeys'
import { isValidSession, sanitizeSessionUser } from '../services/persistence/persistenceUtils'
import { migrateGuestChatToUser } from '../services/chatPersistenceService'
import apiClient from '../services/apiClient'

export const SESSION_STORAGE_KEY = 'artlink_session'
export { INACTIVITY_TIMEOUT_MS, ACTIVITY_THROTTLE_MS, SESSION_LAST_ACTIVITY_KEY }

function clearStoredSession() {
  removeLocal(ACTIVE_SESSION_KEY)
  removeLocal(SESSION_LAST_ACTIVITY_KEY)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
      window.localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY)
    }
  } catch {}
}

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
    clearStoredSession()
    return null
  }

  // Verificación de expiración por inactividad (regla de 20 minutos)
  let lastActivity = Number(readLocal(SESSION_LAST_ACTIVITY_KEY, null))
  if (!lastActivity && typeof window !== 'undefined' && window.localStorage) {
    const raw = window.localStorage.getItem(SESSION_LAST_ACTIVITY_KEY)
    if (raw) lastActivity = Number(raw)
  }

  if (lastActivity && Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) {
    clearStoredSession()
    return null
  }

  return sanitizeSessionUser(stored)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredSession)
  const currentUserRef = useRef(user)
  currentUserRef.current = user
  const lastRenewedRef = useRef(Date.now())

  function saveSession(nextUser) {
    const safeUser = sanitizeSessionUser(nextUser)

    if (safeUser) {
      const now = Date.now()
      lastRenewedRef.current = now
      saveLocal(ACTIVE_SESSION_KEY, safeUser)
      saveLocal(SESSION_LAST_ACTIVITY_KEY, now)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser))
          window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now))
        }
      } catch {}
      setUserOnline(safeUser)

      // Migrar chat de invitado a la cuenta si existía
      migrateGuestChatToUser(safeUser.id).catch((err) => {
        console.warn('[AuthContext] Error menor migrando chat de invitado:', err?.message)
      })
    } else {
      if (currentUserRef.current) setUserOffline(currentUserRef.current)
      clearStoredSession()
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
        // Actualizar datos no sensibles si cambiaron (avatar, artistProfileId, name, bio, etc.)
        const updated = sanitizeSessionUser({
          ...user,
          name: freshUser.name || user.name,
          role: freshUser.role || user.role,
          avatar: freshUser.avatar || user.avatar,
          avatarUrl: freshUser.avatarUrl || user.avatarUrl,
          bio: freshUser.bio ?? user.bio,
          description: freshUser.description ?? user.description,
          phone: freshUser.phone ?? user.phone,
          location: freshUser.location ?? user.location,
          website: freshUser.website ?? user.website,
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

  // Detección de actividad del usuario y temporizador de 20 minutos de inactividad
  useEffect(() => {
    if (!user) return

    // Registrar o refrescar la marca de actividad al iniciar sesión o montar
    const initialNow = Date.now()
    lastRenewedRef.current = initialNow
    saveLocal(SESSION_LAST_ACTIVITY_KEY, initialNow)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(initialNow))
      }
    } catch {}

    function getLastRecordedActivity() {
      let recorded = Number(readLocal(SESSION_LAST_ACTIVITY_KEY, null))
      if (!recorded && typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(SESSION_LAST_ACTIVITY_KEY)
        if (raw) recorded = Number(raw)
      }
      return recorded || lastRenewedRef.current
    }

    function checkInactivity() {
      const lastActivity = getLastRecordedActivity()
      const elapsed = Date.now() - lastActivity
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        saveSession(null)
      }
    }

    function renewActivity() {
      const currentTime = Date.now()
      const lastActivity = getLastRecordedActivity()

      // Si ya transcurrieron 20 minutos de inactividad, no renovar: cerrar sesión
      if (currentTime - lastActivity >= INACTIVITY_TIMEOUT_MS) {
        saveSession(null)
        return
      }

      // Renovación controlada: actualizar si han transcurrido al menos ACTIVITY_THROTTLE_MS
      if (currentTime - lastRenewedRef.current >= ACTIVITY_THROTTLE_MS) {
        lastRenewedRef.current = currentTime
        saveLocal(SESSION_LAST_ACTIVITY_KEY, currentTime)
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(currentTime))
          }
        } catch {}
      }
    }

    // Intervalo periódico para comprobar inactividad si el usuario deja la aplicación abierta sin interactuar
    const intervalId = setInterval(checkInactivity, 5000)

    // Eventos de interacción del usuario para registrar actividad válida
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, renewActivity, { passive: true })
    })

    function handleFocusOrVisibility() {
      checkInactivity()
      renewActivity()
    }
    window.addEventListener('focus', handleFocusOrVisibility)
    document.addEventListener('visibilitychange', handleFocusOrVisibility)

    // Sincronización entre pestañas abiertas
    function handleStorage(event) {
      if (event.key === SESSION_LAST_ACTIVITY_KEY && event.newValue) {
        const parsed = Number(event.newValue)
        if (parsed) {
          lastRenewedRef.current = parsed
        }
      } else if (
        (event.key === ACTIVE_SESSION_KEY || event.key === SESSION_STORAGE_KEY) &&
        !event.newValue
      ) {
        setUser(null)
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      clearInterval(intervalId)
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, renewActivity)
      })
      window.removeEventListener('focus', handleFocusOrVisibility)
      document.removeEventListener('visibilitychange', handleFocusOrVisibility)
      window.removeEventListener('storage', handleStorage)
    }
  }, [user?.id])

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
      renewSessionActivity: () => {
        const now = Date.now()
        lastRenewedRef.current = now
        saveLocal(SESSION_LAST_ACTIVITY_KEY, now)
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now))
          }
        } catch {}
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
