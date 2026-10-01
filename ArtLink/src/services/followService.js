import apiClient, { getServiceError } from './apiClient'
import { readLocal, saveLocal } from './persistence/localStorageService'
import { getUserScopedKey } from './persistence/storageKeys'

const resource = 'seguimientos'

export async function getFollowStatus(followerId, artistId) {
  if (!followerId || !artistId) return { isFollowing: false, follow: null }

  const cacheKey = getUserScopedKey(followerId, 'follows')
  const cached = readLocal(cacheKey, [])
  const cachedMatch = (cached || []).find((f) => String(f.artistId) === String(artistId))

  try {
    const { data } = await apiClient.get('/follows', {
      params: {
        followerId: String(followerId),
        artistId: String(artistId),
      },
    })
    const match = (data || []).find(
      (f) => String(f.followerId) === String(followerId) && String(f.artistId) === String(artistId)
    )
    return { isFollowing: Boolean(match), follow: match || null }
  } catch (error) {
    if (cachedMatch) return { isFollowing: true, follow: cachedMatch }
    throw getServiceError(error, resource)
  }
}

export async function followArtist(followerId, artistId) {
  if (!followerId || !artistId) throw new Error('Faltan identificadores para seguir al artista')
  if (String(followerId) === String(artistId)) {
    throw new Error('Un artista no puede seguirse a sí mismo')
  }

  const cacheKey = getUserScopedKey(followerId, 'follows')
  const current = readLocal(cacheKey, [])
  const newFollow = {
    id: `fol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    followerId: String(followerId),
    artistId: String(artistId),
    createdAt: new Date().toISOString(),
  }
  const next = [...current.filter((f) => String(f.artistId) !== String(artistId)), newFollow]
  saveLocal(cacheKey, next)

  try {
    const { isFollowing } = await getFollowStatus(followerId, artistId)
    if (isFollowing) return { success: true, message: 'Ya sigues a este artista' }

    const { data } = await apiClient.post('/follows', newFollow)
    return data
  } catch (error) {
    return newFollow
  }
}

export async function unfollowArtist(followerId, artistId) {
  if (!followerId || !artistId) return { success: true }

  const cacheKey = getUserScopedKey(followerId, 'follows')
  const current = readLocal(cacheKey, [])
  const next = current.filter((f) => String(f.artistId) !== String(artistId))
  saveLocal(cacheKey, next)

  try {
    const { follow } = await getFollowStatus(followerId, artistId)
    if (!follow) return { success: true }
    await apiClient.delete(`/follows/${follow.id}`)
    return { success: true }
  } catch (error) {
    return { success: true }
  }
}

export async function getArtistFollowerCount(artistId) {
  if (!artistId) return 0
  try {
    const { data } = await apiClient.get('/follows', {
      params: { artistId: String(artistId) },
    })
    return (data || []).filter((f) => String(f.artistId) === String(artistId)).length
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getFollowingByUser(followerId) {
  if (!followerId) return []
  const cacheKey = getUserScopedKey(followerId, 'follows')
  const cached = readLocal(cacheKey, [])

  try {
    const { data } = await apiClient.get('/follows', {
      params: { followerId: String(followerId) },
    })
    const list = (data || []).filter((f) => String(f.followerId) === String(followerId))
    if (list.length > 0) {
      saveLocal(cacheKey, list)
      return list
    }
    if (Array.isArray(cached) && cached.length > 0) {
      return cached
    }
    saveLocal(cacheKey, [])
    return []
  } catch (error) {
    return Array.isArray(cached) ? cached : []
  }
}
