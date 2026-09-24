import apiClient, { getServiceError } from './apiClient'

const resource = 'autenticación'

export async function login(email, passwordDemo) {
  try {
    const { data } = await apiClient.get('/users', { params: { email, passwordDemo, active: true } })
    if (!data.length) throw new Error('Credenciales demo inválidas')
    return data[0]
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function register(userData) {
  try {
    const { data } = await apiClient.post('/users', { ...userData, active: true, createdAt: new Date().toISOString() })
    return data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getUserSession(userId) {
  try {
    const { data } = await apiClient.get(`/users/${userId}`)
    return data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
