/**
 * Constantes y utilidades para las claves de almacenamiento de ArtLink en localStorage.
 * Las claves siguen el esquema estructurado de nombres jerárquicos por usuario o invitado.
 */

export const STORAGE_PREFIX = 'artlink'

// Claves globales y de sesión activa
export const ACTIVE_SESSION_KEY = `${STORAGE_PREFIX}:session:active`
export const SESSION_LAST_ACTIVITY_KEY = `${STORAGE_PREFIX}:session:last_activity`
export const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000 // 20 minutos de inactividad
export const ACTIVITY_THROTTLE_MS = 10 * 1000 // Renovación controlada cada 10 segundos
export const GLOBAL_THEME_KEY = `${STORAGE_PREFIX}:theme`
export const GLOBAL_TEXT_SIZE_KEY = `${STORAGE_PREFIX}:text_size`
export const GLOBAL_SETTINGS_KEY = `${STORAGE_PREFIX}:settings`
export const ACTIVE_CONVERSATION_ID_KEY = `${STORAGE_PREFIX}:active_conversation_id`

// Claves para modo invitado (sin sesión autenticada)
export const GUEST_USER_ID = 'guest'
export const GUEST_PREFIX = `${STORAGE_PREFIX}:guest`
export const GUEST_CHAT_KEY = `${GUEST_PREFIX}:chat`
export const GUEST_SETTINGS_KEY = `${GUEST_PREFIX}:settings`
export const GUEST_FILTERS_KEY = `${GUEST_PREFIX}:filters`
export const GUEST_FAVORITES_KEY = `${GUEST_PREFIX}:favorites`
export const GUEST_DRAFTS_PREFIX = `${GUEST_PREFIX}:draft`

/**
 * Genera una clave con ámbito de usuario específico.
 * Formato: artlink:user:{userId}:{key}
 *
 * @param {string|null} userId Identificador único del usuario o 'guest'.
 * @param {string} key Nombre de la clave específica.
 * @returns {string} Clave jerárquica con prefijo.
 */
export function getUserScopedKey(userId, key) {
  const safeUser = userId && String(userId).trim() ? String(userId).trim() : GUEST_USER_ID
  if (safeUser === GUEST_USER_ID) {
    return `${GUEST_PREFIX}:${key}`
  }
  return `${STORAGE_PREFIX}:user:${safeUser}:${key}`
}

/**
 * Genera una clave para la conversación de chatbot de un usuario.
 * @param {string|null} userId
 * @param {string} conversationId
 */
export function getChatStorageKey(userId, conversationId) {
  return getUserScopedKey(userId, `chat:${conversationId}`)
}

/**
 * Genera una clave para los ajustes del usuario.
 * @param {string|null} userId
 */
export function getSettingsStorageKey(userId) {
  return getUserScopedKey(userId, 'settings')
}

/**
 * Genera una clave para los filtros del catálogo del usuario.
 * @param {string|null} userId
 */
export function getFiltersStorageKey(userId) {
  return getUserScopedKey(userId, 'filters')
}

/**
 * Genera una clave para los borradores de cotización o encargo de comisión.
 * Formato: artlink:user:{userId}:draft:commission:{artistProfileId}:{commissionId}
 *
 * @param {string|null} userId
 * @param {string} artistProfileId
 * @param {string} commissionId
 */
export function getCommissionDraftKey(userId, artistProfileId, commissionId = 'default') {
  const safeArtist = artistProfileId || 'unknown'
  const safeComm = commissionId || 'default'
  return getUserScopedKey(userId, `draft:commission:${safeArtist}:${safeComm}`)
}

/**
 * Genera una clave para el borrador de reseña de un artista.
 * @param {string|null} userId
 * @param {string} artistProfileId
 */
export function getReviewDraftKey(userId, artistProfileId) {
  const safeArtist = artistProfileId || 'unknown'
  return getUserScopedKey(userId, `draft:review:${safeArtist}`)
}

/**
 * Genera una clave para el borrador de mensaje en una conversación privada.
 * @param {string|null} userId
 * @param {string} conversationId
 */
export function getMessageDraftKey(userId, conversationId) {
  const safeConvo = conversationId || 'new'
  return getUserScopedKey(userId, `draft:message:${safeConvo}`)
}
