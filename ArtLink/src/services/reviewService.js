import apiClient, { getServiceError } from './apiClient'

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
  try {
    return (await apiClient.get('/reviews', { params: { artistId } })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function createReview(review) {
  try {
    return (await apiClient.post('/reviews', review)).data
  } catch (error) {
    throw getServiceError(error, resource)
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
