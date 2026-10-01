// Servicio de presencia y estado "En línea" para ArtLink
export const PRESENCE_STORAGE_KEY = 'artlink_presence_registry'
export const PRESENCE_CHANGE_EVENT = 'artlink_presence_change'

// Leer registro de presencia desde localStorage
export function getPresenceRegistry() {
  try {
    const raw = localStorage.getItem(PRESENCE_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

// Guardar registro de presencia en localStorage
export function savePresenceRegistry(registry) {
  try {
    localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(registry))
    window.dispatchEvent(new CustomEvent(PRESENCE_CHANGE_EVENT, { detail: registry }))
  } catch (err) {
    console.warn('No se pudo guardar registro de presencia:', err)
  }
}

// Marcar un usuario como activo/en línea
export function setUserOnline(user, customStatusText = 'En línea') {
  if (!user || !user.id) return
  const registry = getPresenceRegistry()
  const now = Date.now()

  const entry = {
    userId: String(user.id),
    name: user.name || 'Usuario ArtLink',
    role: user.role || 'cliente',
    email: user.email || '',
    username: user.username || user.email?.split('@')[0] || String(user.id),
    isOnline: true,
    statusText: customStatusText,
    lastSeen: now,
  }

  // Registrar por ID principal y aliases (username, email)
  registry[String(user.id)] = entry
  if (entry.username) registry[entry.username.toLowerCase()] = entry
  if (entry.email) registry[entry.email.toLowerCase()] = entry

  savePresenceRegistry(registry)
  return registry
}

// Marcar un usuario como desconectado
export function setUserOffline(user) {
  if (!user || !user.id) return
  const registry = getPresenceRegistry()
  const now = Date.now()

  const targetKey = String(user.id)
  if (registry[targetKey]) {
    registry[targetKey] = {
      ...registry[targetKey],
      isOnline: false,
      statusText: 'Desconectado',
      lastSeen: now,
    }
  }

  if (user.username && registry[user.username.toLowerCase()]) {
    registry[user.username.toLowerCase()].isOnline = false
    registry[user.username.toLowerCase()].statusText = 'Desconectado'
    registry[user.username.toLowerCase()].lastSeen = now
  }

  savePresenceRegistry(registry)
  return registry
}

// Determinar si un participante está en línea
export function checkParticipantOnline(participant, registry = null) {
  if (!participant) return { isOnline: false, statusText: 'Desconectado', badgeClass: 'is-offline' }

  // El bot Artie siempre está disponible 24/7
  if (participant.isBot || participant.id === 'artie_ai' || participant.id === 'convo-artie') {
    return {
      isOnline: true,
      statusText: 'Asistente IA • En línea',
      badgeClass: 'is-online',
    }
  }

  const reg = registry || getPresenceRegistry()
  const keysToTry = [
    participant.userId,
    participant.id,
    participant.username?.toLowerCase(),
    participant.email?.toLowerCase(),
  ].filter(Boolean)

  for (const k of keysToTry) {
    const entry = reg[String(k)]
    if (entry) {
      const isRecent = Date.now() - (entry.lastSeen || 0) < 180000 // Activo en los últimos 3 minutos
      if (entry.isOnline && isRecent) {
        return {
          isOnline: true,
          statusText: entry.statusText || 'En línea',
          badgeClass: 'is-online',
          lastSeen: entry.lastSeen,
        }
      } else {
        const minsAgo = Math.floor((Date.now() - (entry.lastSeen || Date.now())) / 60000)
        const timeText = minsAgo < 1 ? 'Visto recién' : minsAgo < 60 ? `Visto hace ${minsAgo}m` : 'Desconectado'
        return {
          isOnline: false,
          statusText: timeText,
          badgeClass: 'is-offline',
          lastSeen: entry.lastSeen,
        }
      }
    }
  }

  // Si no está registrado en presencia activa, está desconectado
  return {
    isOnline: false,
    statusText: 'Desconectado',
    badgeClass: 'is-offline',
  }
}
