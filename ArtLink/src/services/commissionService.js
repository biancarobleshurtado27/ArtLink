import apiClient, { getServiceError } from './apiClient'

const resource = 'comisiones'

export async function getCommissions(params = {}) {
  try { return (await apiClient.get('/commissions', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getCommissionById(id) {
  try { return (await apiClient.get(`/commissions/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createCommission(commission) {
  try { return (await apiClient.post('/commissions', commission)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateCommission(id, changes) {
  try { return (await apiClient.patch(`/commissions/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteCommission(id) {
  try { return (await apiClient.delete(`/commissions/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
