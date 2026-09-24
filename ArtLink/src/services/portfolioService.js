import apiClient, { getServiceError } from './apiClient'

const resource = 'portafolio'

export async function getPortfolioItems(params = {}) {
  try { return (await apiClient.get('/portfolioItems', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getPortfolioItemById(id) {
  try { return (await apiClient.get(`/portfolioItems/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createPortfolioItem(item) {
  try { return (await apiClient.post('/portfolioItems', item)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updatePortfolioItem(id, changes) {
  try { return (await apiClient.patch(`/portfolioItems/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deletePortfolioItem(id) {
  try { return (await apiClient.delete(`/portfolioItems/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
