import apiClient, { getServiceError } from './apiClient'

const resource = 'solicitudes'

export async function getRequests(params = {}) {
  try { return (await apiClient.get('/requests', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getRequestById(id) {
  try { return (await apiClient.get(`/requests/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createRequest(request) {
  try { return (await apiClient.post('/requests', { ...request, createdAt: request.createdAt || new Date().toISOString() })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateRequest(id, changes) {
  try { return (await apiClient.patch(`/requests/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteRequest(id) {
  try { return (await apiClient.delete(`/requests/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
