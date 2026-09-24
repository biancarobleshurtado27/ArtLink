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
    const { data: existingUsers } = await apiClient.get('/users', { params: { email: userData.email } })
    if (existingUsers.length) throw new Error('Ese correo ya está registrado')
    const { data } = await apiClient.post('/users', { ...userData, active: true, createdAt: new Date().toISOString() })
    if (data.role === 'artista') {
      await apiClient.post('/artistProfiles', {
        userId: data.id,
        displayName: data.name,
        username: data.email.split('@')[0],
        bio: 'Perfil nuevo en ArtLink.',
        disciplines: [],
        styles: [],
        location: '',
        availability: 'open',
        slots: 1,
        rating: 0,
        verified: false,
        basePrice: 0,
        socialLinks: {},
      })
    }
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
