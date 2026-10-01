/**
 * Utilidades para la serialización, versionado, saneamiento y validación
 * de datos persistentes en ArtLink.
 */

export const STORAGE_SCHEMA_VERSION = 1

/**
 * Envuelve los datos en una estructura versionada con marca de tiempo.
 * @param {*} data Datos a almacenar.
 * @param {number} [version] Versión del esquema.
 * @returns {Object} Sobre de datos versionado.
 */
export function wrapVersionedData(data, version = STORAGE_SCHEMA_VERSION) {
  return {
    version,
    updatedAt: new Date().toISOString(),
    data,
  }
}

/**
 * Desenvuelve datos versionados o devuelve los datos tal cual si provienen de formatos anteriores.
 * @param {*} raw Objeto leído de almacenamiento.
 * @returns {*} Datos desempaquetados.
 */
export function unwrapVersionedData(raw) {
  if (!raw || typeof raw !== 'object') return raw

  // Si tiene el formato versionado formal { version, updatedAt, data }
  if ('version' in raw && 'data' in raw) {
    // Si la versión fuera obsoleta, aquí se ejecutan migraciones
    return raw.data
  }

  // Compatibilidad hacia atrás con datos guardados sin sobre versionado
  return raw
}

/**
 * Clona profundamente un objeto serializable por JSON.
 * @param {*} item
 * @returns {*}
 */
export function deepClone(item) {
  if (item === undefined || item === null) return item
  try {
    return JSON.parse(JSON.stringify(item))
  } catch {
    return item
  }
}

/**
 * Valida la estructura mínima requerida para una sesión de usuario.
 * No debe contener contraseñas ni campos sensibles.
 * @param {*} session
 * @returns {boolean}
 */
export function isValidSession(session) {
  if (!session || typeof session !== 'object') return false
  if (!session.id || typeof session.id !== 'string') return false
  return true
}

/**
 * Sanitiza un objeto de usuario para guardarlo en la sesión local.
 * Elimina contraseñas y campos sensibles.
 * @param {Object} user
 * @returns {Object|null}
 */
export function sanitizeSessionUser(user) {
  if (!user || typeof user !== 'object') return null
  if (!user.id) return null

  let normalizedRole = user.role || 'cliente'
  if (normalizedRole === 'client') normalizedRole = 'cliente'
  if (normalizedRole === 'artist') normalizedRole = 'artista'
  if (normalizedRole === 'admin') normalizedRole = 'administrador'

  const sanitized = {
    id: String(user.id),
    name: user.name || (user.email ? user.email.split('@')[0] : 'Usuario'),
    role: normalizedRole,
  }

  if (user.email) {
    sanitized.email = String(user.email).trim().toLowerCase()
  }
  if (user.artistProfileId) {
    sanitized.artistProfileId = user.artistProfileId
  }

  return sanitized
}
