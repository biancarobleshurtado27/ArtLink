/**
 * Servicio para la gestión de artistas favoritos en ArtLink.
 * JSON Server es la fuente principal (/favorites) con respaldo y cache en localStorage.
 */

import apiClient, { getServiceError } from './apiClient'
import { readLocal, saveLocal } from './persistence/localStorageService'
import { getUserScopedKey } from './persistence/storageKeys'

const resource = 'favoritos'

/**
 * Obtiene la lista de IDs de artistas favoritos de un usuario.
 * @param {string|null} userId
 * @returns {Promise<string[]>}
 */
export async function getFavoritesByUser(userId) {
  const cacheKey = getUserScopedKey(userId, 'favorites')
  const cached = readLocal(cacheKey, [])

  if (!userId || userId === 'guest') {
    return Array.isArray(cached) ? cached : []
  }

  try {
    const { data } = await apiClient.get('/favorites', {
      params: { userId: String(userId) },
    })
    const artistIds = (data || []).map((item) => String(item.artistId))
    // Actualizar cache local
    saveLocal(cacheKey, artistIds)
    return artistIds
  } catch (error) {
    console.warn(`[favoriteService] Error al consultar favoritos en JSON Server, usando cache local:`, error?.message)
    return Array.isArray(cached) ? cached : []
  }
}

/**
 * Agrega un artista a los favoritos del usuario en JSON Server.
 * @param {string} userId
 * @param {string} artistId
 */
export async function addFavorite(userId, artistId) {
  if (!artistId) throw new Error('Se requiere el ID del artista para marcar favorito.')

  const cacheKey = getUserScopedKey(userId, 'favorites')
  const current = readLocal(cacheKey, [])
  const next = Array.from(new Set([...current, String(artistId)]))
  saveLocal(cacheKey, next)

  if (!userId || userId === 'guest') {
    return { success: true, isGuest: true }
  }

  try {
    // Verificar si ya existe en JSON Server
    const { data: existing } = await apiClient.get('/favorites', {
      params: { userId: String(userId), artistId: String(artistId) },
    })

    if (existing && existing.length > 0) {
      return { success: true, item: existing[0] }
    }

    const newFav = {
      id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: String(userId),
      artistId: String(artistId),
      createdAt: new Date().toISOString(),
    }

    const { data: created } = await apiClient.post('/favorites', newFav)
    return { success: true, item: created }
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

/**
 * Elimina un artista de los favoritos del usuario en JSON Server.
 * @param {string} userId
 * @param {string} artistId
 */
export async function removeFavorite(userId, artistId) {
  if (!artistId) return { success: true }

  const cacheKey = getUserScopedKey(userId, 'favorites')
  const current = readLocal(cacheKey, [])
  const next = current.filter((id) => String(id) !== String(artistId))
  saveLocal(cacheKey, next)

  if (!userId || userId === 'guest') {
    return { success: true, isGuest: true }
  }

  try {
    const { data: existing } = await apiClient.get('/favorites', {
      params: { userId: String(userId), artistId: String(artistId) },
    })

    if (existing && existing.length > 0) {
      for (const item of existing) {
        await apiClient.delete(`/favorites/${item.id}`)
      }
    }

    return { success: true }
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
