import apiClient, { getServiceError } from './apiClient'
import { readLocal, saveLocal } from './persistence/localStorageService'
import { getUserScopedKey } from './persistence/storageKeys'
import { removeReviewDraft } from './persistence/syncService'

const resource = 'reseñas'

export async function getReviews(params = {}) {
  try {
    return (await apiClient.get('/reviews', { params })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getReviewById(id) {
  try {
    return (await apiClient.get(`/reviews/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getReviewsByArtistId(artistId) {
  if (!artistId) return []
  const cacheKey = getUserScopedKey(artistId, 'artist_reviews')
  const cached = readLocal(cacheKey, [])

  try {
    const list = (await apiClient.get('/reviews', { params: { artistId } })).data
    if (Array.isArray(list)) {
      saveLocal(cacheKey, list)
      return list
    }
    return []
  } catch (error) {
    return Array.isArray(cached) ? cached : []
  }
}

export async function createReview(review) {
  const artistId = review?.artistId
  const userId = review?.userId
  if (artistId) {
    const cacheKey = getUserScopedKey(artistId, 'artist_reviews')
    const current = readLocal(cacheKey, [])
    saveLocal(cacheKey, [review, ...current])
  }
  if (userId && artistId) {
    removeReviewDraft(userId, artistId)
  }

  try {
    return (await apiClient.post('/reviews', review)).data
  } catch (error) {
    return review
  }
}

export async function updateReview(id, changes) {
  try {
    return (await apiClient.patch(`/reviews/${id}`, changes)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function deleteReview(id) {
  try {
    return (await apiClient.delete(`/reviews/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
