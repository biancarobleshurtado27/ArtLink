import apiClient, { getServiceError } from './apiClient'
import { isN8nConfigured, registerUserViaN8n } from './n8nService'

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
  if (!userData?.acceptTerms) {
    throw new Error('Debes aceptar las condiciones para crear tu cuenta.')
  }

  const termsMetadata = {
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),
    termsVersion: '1.0',
  }

  const payload = {
    ...userData,
    ...termsMetadata,
  }

  if (isN8nConfigured()) {
    try {
      const n8nResult = await registerUserViaN8n(payload)
      let registeredUser = null
      if (n8nResult?.user) registeredUser = { ...n8nResult.user, ...termsMetadata }
      else if (n8nResult?.userId) registeredUser = { ...payload, id: n8nResult.userId }
      else if (n8nResult?.success) registeredUser = { ...payload, id: `user-n8n-${Date.now()}` }

      if (registeredUser) {
        if (registeredUser.role === 'artista') {
          try {
            const { data: existingProfiles } = await apiClient.get('/artistProfiles', { params: { userId: registeredUser.id } })
            if (!existingProfiles.length) {
              await apiClient.post('/artistProfiles', {
                userId: registeredUser.id,
                displayName: registeredUser.name,
                username: registeredUser.email.split('@')[0],
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
          } catch (profileErr) {
            console.warn('Perfil de artista no pudo ser sincronizado tras N8N:', profileErr)
          }
        }
        return registeredUser
      }
    } catch (n8nError) {
      const n8nResponse = n8nError.response?.data
      if (n8nResponse?.error) {
        throw new Error(n8nResponse.error, { cause: n8nError })
      }
      if (n8nError.response?.status === 409) {
        throw new Error('Ese correo ya está registrado', { cause: n8nError })
      }
      if (n8nError.response?.status === 400) {
        throw new Error(n8nResponse?.message || 'Datos de registro inválidos', { cause: n8nError })
      }
      console.warn('N8N no está escuchando el webhook o no está disponible. Continuando registro con base de datos interna:', n8nError.message)
    }
  }

  try {
    const { data: existingUsers } = await apiClient.get('/users', { params: { email: payload.email } })
    if (existingUsers.length) throw new Error('Ese correo ya está registrado')
    const { data } = await apiClient.post('/users', { ...payload, active: true, createdAt: new Date().toISOString() })
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
