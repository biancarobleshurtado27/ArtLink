import apiClient, { getServiceError } from './apiClient'

const resource = 'seguimientos'

export async function getFollowStatus(followerId, artistId) {
  if (!followerId || !artistId) return { isFollowing: false, follow: null }
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
    throw getServiceError(error, resource)
  }
}

export async function followArtist(followerId, artistId) {
  if (!followerId || !artistId) throw new Error('Faltan identificadores para seguir al artista')
  if (String(followerId) === String(artistId)) {
    throw new Error('Un artista no puede seguirse a sí mismo')
  }
  try {
    const { isFollowing } = await getFollowStatus(followerId, artistId)
    if (isFollowing) return { success: true, message: 'Ya sigues a este artista' }

    const newFollow = {
      id: `fol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      followerId: String(followerId),
      artistId: String(artistId),
      createdAt: new Date().toISOString(),
    }
    const { data } = await apiClient.post('/follows', newFollow)
    return data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function unfollowArtist(followerId, artistId) {
  if (!followerId || !artistId) return { success: true }
  try {
    const { follow } = await getFollowStatus(followerId, artistId)
    if (!follow) return { success: true }
    await apiClient.delete(`/follows/${follow.id}`)
    return { success: true }
  } catch (error) {
    throw getServiceError(error, resource)
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
  try {
    const { data } = await apiClient.get('/follows', {
      params: { followerId: String(followerId) },
    })
    return (data || []).filter((f) => String(f.followerId) === String(followerId))
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
