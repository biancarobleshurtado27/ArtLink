import apiClient, { getServiceError } from './apiClient'

const resource = 'perfiles de artistas'

export async function getArtists(params = {}) {
  try { return (await apiClient.get('/artistProfiles', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getArtistById(id) {
  try { return (await apiClient.get(`/artistProfiles/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getArtistByUserId(userId) {
  try { return (await apiClient.get('/artistProfiles', { params: { userId } })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createArtist(artist) {
  try { return (await apiClient.post('/artistProfiles', artist)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateArtist(id, changes) {
  try { return (await apiClient.patch(`/artistProfiles/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteArtist(id) {
  try { return (await apiClient.delete(`/artistProfiles/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
