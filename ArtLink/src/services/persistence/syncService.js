/**
 * Servicio de sincronización y orquestación entre JSON Server (fuente principal)
 * y localStorage (sesión, preferencias, borradores y respaldo local).
 */

import {
  readLocal,
  saveLocal,
  removeLocal,
} from './localStorageService'
import {
  ACTIVE_CONVERSATION_ID_KEY,
  GLOBAL_SETTINGS_KEY,
  getCommissionDraftKey,
  getFiltersStorageKey,
  getMessageDraftKey,
  getReviewDraftKey,
  getSettingsStorageKey,
} from './storageKeys'

/**
 * Guarda el borrador de una comisión para un usuario y artista específicos.
 */
export function saveCommissionDraft(userId, artistProfileId, commissionId, draftData) {
  const key = getCommissionDraftKey(userId, artistProfileId, commissionId)
  return saveLocal(key, draftData)
}

/**
 * Recupera el borrador de una comisión.
 */
export function getCommissionDraft(userId, artistProfileId, commissionId) {
  const key = getCommissionDraftKey(userId, artistProfileId, commissionId)
  return readLocal(key, null)
}

/**
 * Elimina el borrador de una comisión tras un envío exitoso.
 */
export function removeCommissionDraft(userId, artistProfileId, commissionId) {
  const key = getCommissionDraftKey(userId, artistProfileId, commissionId)
  return removeLocal(key)
}

/**
 * Guarda el borrador de una reseña.
 */
export function saveReviewDraft(userId, artistProfileId, draftData) {
  const key = getReviewDraftKey(userId, artistProfileId)
  return saveLocal(key, draftData)
}

/**
 * Recupera el borrador de una reseña.
 */
export function getReviewDraft(userId, artistProfileId) {
  const key = getReviewDraftKey(userId, artistProfileId)
  return readLocal(key, null)
}

/**
 * Elimina el borrador de una reseña.
 */
export function removeReviewDraft(userId, artistProfileId) {
  const key = getReviewDraftKey(userId, artistProfileId)
  return removeLocal(key)
}

/**
 * Guarda el borrador de un mensaje en una conversación específica.
 */
export function saveMessageDraft(userId, conversationId, text) {
  const key = getMessageDraftKey(userId, conversationId)
  return saveLocal(key, text)
}

/**
 * Recupera el borrador de un mensaje.
 */
export function getMessageDraft(userId, conversationId) {
  const key = getMessageDraftKey(userId, conversationId)
  return readLocal(key, '')
}

/**
 * Elimina el borrador de un mensaje.
 */
export function removeMessageDraft(userId, conversationId) {
  const key = getMessageDraftKey(userId, conversationId)
  return removeLocal(key)
}

/**
 * Guarda los filtros recientes del catálogo para el usuario o invitado.
 */
export function saveCatalogFilters(userId, filters) {
  const key = getFiltersStorageKey(userId)
  return saveLocal(key, filters)
}

/**
 * Recupera los filtros del catálogo guardados o devuelve los valores predeterminados.
 */
export function getCatalogFilters(userId, defaultFilters = {}) {
  const key = getFiltersStorageKey(userId)
  return readLocal(key, defaultFilters)
}

/**
 * Guarda los ajustes de accesibilidad y apariencia tanto a nivel global como de usuario.
 */
export function saveAppSettings(userId, settings) {
  saveLocal(GLOBAL_SETTINGS_KEY, settings)
  if (userId && userId !== 'guest') {
    const userKey = getSettingsStorageKey(userId)
    saveLocal(userKey, settings)
  }
}

/**
 * Recupera los ajustes guardados para el usuario o los globales por defecto.
 */
export function getAppSettings(userId, defaultSettings) {
  if (userId && userId !== 'guest') {
    const userKey = getSettingsStorageKey(userId)
    const userSpecific = readLocal(userKey, null)
    if (userSpecific) return userSpecific
  }
  return readLocal(GLOBAL_SETTINGS_KEY, defaultSettings)
}

/**
 * Obtiene el ID de la conversación actualmente activa en el chatbot.
 */
export function getActiveConversationId() {
  return readLocal(ACTIVE_CONVERSATION_ID_KEY, null)
}

/**
 * Define el ID de la conversación actualmente activa.
 */
export function setActiveConversationId(convoId) {
  return saveLocal(ACTIVE_CONVERSATION_ID_KEY, convoId)
}

