/**
 * Utilidades para seleccionar imagenes reales desde el dispositivo del usuario
 * (computadora, telefono o galeria). No se generan ni se sustituyen imagenes:
 * el unico origen permitido es el archivo que el usuario elige desde su dispositivo.
 */

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

/** Limites por defecto para no desbordar la cuota de localStorage al guardar la sesion. */
export const AVATAR_MAX_BYTES = 1.5 * 1024 * 1024
export const BANNER_MAX_BYTES = 3 * 1024 * 1024

export const IMAGE_ACCEPT_ATTRIBUTE = [...ACCEPTED_IMAGE_EXTENSIONS, ...ACCEPTED_IMAGE_TYPES].join(',')

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isAcceptedImageFile(file) {
  if (!file || typeof file.type !== 'string') return false
  const type = file.type.toLowerCase()
  if (ACCEPTED_IMAGE_TYPES.includes(type)) return true
  // Algunos moviles reportan type vacio pero conservan la extension real del archivo.
  const name = typeof file.name === 'string' ? file.name.toLowerCase() : ''
  return ACCEPTED_IMAGE_EXTENSIONS.some((extension) => name.endsWith(extension))
}

/**
 * Valida el archivo elegido y lo convierte a Data URL (base64) para persistirlo
 * junto al resto de datos del perfil.
 *
 * @param {File} file Archivo Proveniente de un input[type="file"].
 * @param {{ maxBytes?: number }} [options]
 * @returns {Promise<string>} Data URL de la imagen.
 */
export function readImageFileAsDataUrl(file, options = {}) {
  const maxBytes = options.maxBytes || BANNER_MAX_BYTES

  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se selecciono ningun archivo.'))
      return
    }

    if (!isAcceptedImageFile(file)) {
      reject(new Error('El archivo debe ser una imagen JPG, PNG, WebP o GIF.'))
      return
    }

    if (typeof file.size === 'number' && file.size > maxBytes) {
      reject(new Error(`La imagen supera el limite de ${formatBytes(maxBytes)}.`))
      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'))
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result !== 'string' || !result.startsWith('data:image/')) {
        reject(new Error('El archivo seleccionado no es una imagen valida.'))
        return
      }
      resolve(result)
    }

    reader.readAsDataURL(file)
  })
}