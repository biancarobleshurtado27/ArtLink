import apiClient, { getServiceError } from './apiClient'

const resource = 'me gusta'

export async function getLikeStatus(userId, portfolioItemId) {
  if (!userId || !portfolioItemId) return { isLiked: false, like: null }
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
    throw getServiceError(error, resource)
  }
}

export async function likeArtwork(userId, portfolioItemId) {
  if (!userId || !portfolioItemId) throw new Error('Faltan identificadores para registrar el me gusta')
  try {
    const { isLiked } = await getLikeStatus(userId, portfolioItemId)
    if (isLiked) return { success: true, message: 'La obra ya tiene me gusta' }

    const newLike = {
      id: `like-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: String(userId),
      portfolioItemId: String(portfolioItemId),
      createdAt: new Date().toISOString(),
    }
    const { data } = await apiClient.post('/likes', newLike)
    return data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function unlikeArtwork(userId, portfolioItemId) {
  if (!userId || !portfolioItemId) return { success: true }
  try {
    const { like } = await getLikeStatus(userId, portfolioItemId)
    if (!like) return { success: true }
    await apiClient.delete(`/likes/${like.id}`)
    return { success: true }
  } catch (error) {
    throw getServiceError(error, resource)
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
    throw getServiceError(error, resource)
  }
}

export async function getLikesByUser(userId) {
  if (!userId) return []
  try {
    const { data } = await apiClient.get('/likes', {
      params: { userId: String(userId) },
    })
    return (data || []).filter((item) => String(item.userId) === String(userId))
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
