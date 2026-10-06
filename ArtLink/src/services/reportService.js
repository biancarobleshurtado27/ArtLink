import apiClient, { getServiceError } from './apiClient'

const resource = 'reportes'

/**
 * Obtiene la lista de reportes e incidencias registradas en la plataforma.
 * @param {Object} params Filtros opcionales de consulta.
 * @returns {Promise<Array>}
 */
export async function getReports(params = {}) {
  try {
    return (await apiClient.get('/reports', { params })).data
  } catch (error) {
    // Si la colección aún no existe o el endpoint falla, devolver array vacío sin tumbar la interfaz
    if (error?.response?.status === 404) {
      return []
    }
    throw getServiceError(error, resource)
  }
}

/**
 * Obtiene un reporte por su ID.
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export async function getReportById(id) {
  try {
    return (await apiClient.get(`/reports/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

/**
 * Registra un nuevo reporte en la plataforma.
 * @param {Object} report
 * @returns {Promise<Object>}
 */
export async function createReport(report) {
  const payload = {
    ...report,
    status: report.status || 'pending',
    priority: report.priority || 'medium',
    createdAt: report.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  try {
    return (await apiClient.post('/reports', payload)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

/**
 * Actualiza el estado o resolución de un reporte existente.
 * @param {string|number} id
 * @param {Object} changes
 * @returns {Promise<Object>}
 */
export async function updateReport(id, changes) {
  const payload = {
    ...changes,
    updatedAt: new Date().toISOString(),
  }
  try {
    return (await apiClient.patch(`/reports/${id}`, payload)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

/**
 * Elimina un reporte del sistema.
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export async function deleteReport(id) {
  try {
    return (await apiClient.delete(`/reports/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
