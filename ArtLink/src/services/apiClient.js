import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

export function getServiceError(error, resource) {
  const message = error.response?.data?.message || error.message || 'Error de red'
  return new Error(`No se pudo completar la operación de ${resource}: ${message}`, { cause: error })
}

export default apiClient
