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
  let created = null

  if (isN8nConfigured()) {
    try {
      const n8nResult = await createCommissionRequestViaN8n(request)
      if (n8nResult?.request) {
        created = n8nResult.request
      } else if (n8nResult?.success) {
        created = { ...request, id: n8nResult.requestId || `req-n8n-${Date.now()}` }
      }
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

  // Si N8N no guardó la solicitud, persistirla directamente en la base de datos interna
  if (!created) {
    try {
      created = (await apiClient.post('/requests', {
        ...request,
        status: request.status || 'waitlist',
        escrowStatus: request.escrowStatus || 'held_in_escrow',
        createdAt: request.createdAt || new Date().toISOString(),
      })).data
    } catch (error) {
      throw getServiceError(error, resource)
    }
  } else {
    // Si N8N guardó la solicitud en el backend, asegurar que contenga los campos de cliente y artista
    const needsPatch = (!created.clientName && request.clientName) || (!created.artistUserId && request.artistUserId)
    if (needsPatch && created.id) {
      try {
        const patched = (await apiClient.patch(`/requests/${created.id}`, {
          clientName: request.clientName || created.clientName,
          clientEmail: request.clientEmail || created.clientEmail,
          clientAvatar: request.clientAvatar || created.clientAvatar,
          artistUserId: request.artistUserId || created.artistUserId,
          artistName: request.artistName || created.artistName,
          artistAvatar: request.artistAvatar || created.artistAvatar,
        })).data
        created = { ...created, ...patched }
      } catch {
        // En caso de que no requiera parche adicional
      }
    }
  }

  return created
}
export async function updateRequest(id, changes) {
  try { return (await apiClient.patch(`/requests/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteRequest(id) {
  try { return (await apiClient.delete(`/requests/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
