import apiClient, { getServiceError } from './apiClient'
import { readLocal, saveLocal } from './persistence/localStorageService'
import { getUserScopedKey } from './persistence/storageKeys'

const resource = 'me gusta'

export async function getLikeStatus(userId, portfolioItemId) {
  if (!userId || !portfolioItemId) return { isLiked: false, like: null }

  const cacheKey = getUserScopedKey(userId, 'likes')
  const cachedLikes = readLocal(cacheKey, [])
  const cachedMatch = (cachedLikes || []).find((l) => String(l.portfolioItemId) === String(portfolioItemId))

  try {
    const { data } = await apiClient.get('/likes', {
      params: {
        userId: String(userId),
        portfolioItemId: String(portfolioItemId),
      },
    })
    const match = (data || []).find(
      (item) => String(item.userId) === String(userId) && String(item.portfolioItemId) === String(portfolioItemId)
    )
    return { isLiked: Boolean(match), like: match || null }
  } catch (error) {
    if (cachedMatch) return { isLiked: true, like: cachedMatch }
    throw getServiceError(error, resource)
  }
}

export async function likeArtwork(userId, portfolioItemId) {
  if (!userId || !portfolioItemId) throw new Error('Faltan identificadores para registrar el me gusta')

  const cacheKey = getUserScopedKey(userId, 'likes')
  const current = readLocal(cacheKey, [])
  const newLike = {
    id: `like-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: String(userId),
    portfolioItemId: String(portfolioItemId),
    createdAt: new Date().toISOString(),
  }
  const next = [...current.filter((l) => String(l.portfolioItemId) !== String(portfolioItemId)), newLike]
  saveLocal(cacheKey, next)

  try {
    const { isLiked } = await getLikeStatus(userId, portfolioItemId)
    if (isLiked) return { success: true, message: 'La obra ya tiene me gusta' }

    const { data } = await apiClient.post('/likes', newLike)
    return data
  } catch (error) {
    // Si falla el servidor, se mantiene el like guardado localmente
    return newLike
  }
}

export async function unlikeArtwork(userId, portfolioItemId) {
  if (!userId || !portfolioItemId) return { success: true }

  const cacheKey = getUserScopedKey(userId, 'likes')
  const current = readLocal(cacheKey, [])
  const next = current.filter((l) => String(l.portfolioItemId) !== String(portfolioItemId))
  saveLocal(cacheKey, next)

  try {
    const { data } = await apiClient.get('/likes', {
      params: {
        userId: String(userId),
        portfolioItemId: String(portfolioItemId),
      },
    })
    const matches = (data || []).filter(
      (item) => String(item.userId) === String(userId) && String(item.portfolioItemId) === String(portfolioItemId)
    )
    if (matches.length > 0) {
      await Promise.all(matches.map((m) => apiClient.delete(`/likes/${m.id}`).catch(() => {})))
    }
    return { success: true }
  } catch (error) {
    return { success: true }
  }
}

export async function getArtworkLikeCount(portfolioItemId) {
  if (!portfolioItemId) return 0
  try {
    const { data } = await apiClient.get('/likes', {
      params: { portfolioItemId: String(portfolioItemId) },
    })
    return (data || []).filter((item) => String(item.portfolioItemId) === String(portfolioItemId)).length
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getAllLikes() {
  try {
    const { data } = await apiClient.get('/likes')
    return data || []
  } catch (error) {
    return []
  }
}

export async function getLikesByUser(userId) {
  if (!userId) return []
  const cacheKey = getUserScopedKey(userId, 'likes')
  const cached = readLocal(cacheKey, [])

  try {
    const { data } = await apiClient.get('/likes', {
      params: { userId: String(userId) },
    })
    const userLikes = (data || []).filter((item) => String(item.userId) === String(userId))
    if (userLikes.length > 0) {
      saveLocal(cacheKey, userLikes)
      return userLikes
    }
    // Si la petición devuelve vacío pero existían datos persistidos, conservar datos locales
    if (Array.isArray(cached) && cached.length > 0) {
      return cached
    }
    saveLocal(cacheKey, [])
    return []
  } catch (error) {
    return Array.isArray(cached) ? cached : []
  }
}
