import apiClient, { getServiceError } from './apiClient'
import { isN8nConfigured, createCommissionRequestViaN8n } from './n8nService'

const resource = 'solicitudes'

export async function getRequests(params = {}) {
  try { return (await apiClient.get('/requests', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getRequestById(id) {
  try { return (await apiClient.get(`/requests/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createRequest(request) {
  if (isN8nConfigured()) {
    try {
      const n8nResult = await createCommissionRequestViaN8n(request)
      if (n8nResult?.request) return n8nResult.request
      if (n8nResult?.success) return { ...request, id: n8nResult.requestId || `req-n8n-${Date.now()}` }
    } catch (n8nError) {
      const n8nResponse = n8nError.response?.data
      if (n8nResponse?.error) {
        throw new Error(n8nResponse.error, { cause: n8nError })
      }
      if (n8nError.response?.status === 400) {
        throw new Error(n8nResponse?.message || 'El presupuesto o datos de la solicitud no cumplen las condiciones requeridas', { cause: n8nError })
      }
      console.warn('N8N no está escuchando o no está disponible. Guardando solicitud directamente en base de datos interna:', n8nError.message)
    }
  }

  try { return (await apiClient.post('/requests', { ...request, createdAt: request.createdAt || new Date().toISOString() })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateRequest(id, changes) {
  try { return (await apiClient.patch(`/requests/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteRequest(id) {
  try { return (await apiClient.delete(`/requests/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
