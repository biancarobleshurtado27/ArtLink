import apiClient, { getServiceError } from './apiClient'

const resource = 'categorías'

export async function getCategories(params = {}) {
  try { return (await apiClient.get('/categories', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getCategoryById(id) {
  try { return (await apiClient.get(`/categories/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createCategory(category) {
  try { return (await apiClient.post('/categories', category)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateCategory(id, changes) {
  try { return (await apiClient.patch(`/categories/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteCategory(id) {
  try { return (await apiClient.delete(`/categories/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
