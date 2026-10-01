/**
 * Servicio centralizado para interactuar de forma segura con localStorage.
 * Aplica sobre versionado, manejo de cuotas, tolerancia a fallos y saneamiento de datos.
 */

import { STORAGE_PREFIX, getUserScopedKey } from './storageKeys'
import { unwrapVersionedData, wrapVersionedData } from './persistenceUtils'

export { getUserScopedKey }

/**
 * Guarda un valor en localStorage envuelto en estructura versionada.
 *
 * @param {string} key Clave de almacenamiento.
 * @param {*} value Valor serializable.
 * @returns {boolean} True si se guardó con éxito, false en caso contrario.
 */
export function saveLocal(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return false
  if (!key || typeof key !== 'string') return false

  try {
    const wrapped = wrapVersionedData(value)
    const serialized = JSON.stringify(wrapped)
    window.localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    // Si la cuota de localStorage está llena, intentar limpiar claves no críticas
    if (error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn(`[localStorageService] Cuota de almacenamiento excedida para la clave "${key}".`)
    }
    return false
  }
}

/**
 * Lee un valor de localStorage y lo desenvuelve de su estructura versionada.
 * Si la clave no existe o contiene JSON corrupto, devuelve el valor fallback de forma segura.
 *
 * @param {string} key Clave de almacenamiento.
 * @param {*} fallback Valor por defecto en caso de error o ausencia.
 * @returns {*}
 */
export function readLocal(key, fallback = null) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback
  if (!key || typeof key !== 'string') return fallback

  try {
    const item = window.localStorage.getItem(key)
    if (item === null || item === undefined) return fallback

    const parsed = JSON.parse(item)
    const unwrapped = unwrapVersionedData(parsed)
    return unwrapped !== undefined ? unwrapped : fallback
  } catch {
    // Si los datos están corruptos, limpiar esa clave específica para evitar errores recurrentes
    try {
      window.localStorage.removeItem(key)
    } catch {}
    return fallback
  }
}

/**
 * Elimina una clave de localStorage.
 *
 * @param {string} key
 * @returns {boolean}
 */
export function removeLocal(key) {
  if (typeof window === 'undefined' || !window.localStorage) return false
  if (!key || typeof key !== 'string') return false

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Elimina todos los datos locales asociados a un usuario específico,
 * sin afectar a otros usuarios ni a las preferencias del sistema.
 *
 * @param {string} userId
 */
export function clearUserLocalData(userId) {
  if (typeof window === 'undefined' || !window.localStorage) return
  if (!userId) return

  const userPrefix = `${STORAGE_PREFIX}:user:${userId}:`
  try {
    const keysToRemove = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith(userPrefix)) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k))
  } catch (error) {
    console.error(`[localStorageService] Error al limpiar datos del usuario ${userId}:`, error)
  }
}

/**
 * Limpieza manual de todos los datos locales pertenecientes exclusivamente a ArtLink
 * (aquellas claves que comienzan con el prefijo "artlink").
 * Esta función no se ejecuta automáticamente.
 */
export function clearArtlinkLocalData() {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    const keysToRemove = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && (k.startsWith(`${STORAGE_PREFIX}:`) || k.startsWith('artlink_'))) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k))
    console.info(`[localStorageService] Se eliminaron ${keysToRemove.length} claves locales de ArtLink.`)
  } catch (error) {
    console.error('[localStorageService] Error durante la limpieza manual de ArtLink:', error)
  }
}

if (typeof window !== 'undefined') {
  window.clearArtlinkLocalData = clearArtlinkLocalData
}

