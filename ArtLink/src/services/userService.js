import apiClient, { getServiceError } from './apiClient'

const resource = 'usuarios'

export async function getUsers(params = {}) {
  try { return (await apiClient.get('/users', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getUserById(id) {
  try { return (await apiClient.get(`/users/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createUser(user) {
  try { return (await apiClient.post('/users', user)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateUser(id, changes) {
  try { return (await apiClient.patch(`/users/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteUser(id) {
  try { return (await apiClient.delete(`/users/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
