import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('../src/services/apiClient', () => ({
  default: { get: getMock, post: postMock },
  getServiceError: (error) => error,
}))

vi.mock('../src/services/n8nService', () => ({
  isN8nConfigured: () => false,
  registerUserViaN8n: vi.fn(),
}))

import { register } from '../src/services/authService'

describe('authService.register - Validación y persistencia de condiciones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rechaza el registro sin realizar peticiones HTTP si acceptTerms es falso o ausente', async () => {
    await expect(register({
      name: 'Usuario Test',
      email: 'sin-terminos@artlink.test',
      passwordDemo: 'demo123456',
      acceptTerms: false,
    })).rejects.toThrow('Debes aceptar las condiciones para crear tu cuenta.')

    expect(getMock).not.toHaveBeenCalled()
    expect(postMock).not.toHaveBeenCalled()
  })

  it('guarda termsAccepted, termsAcceptedAt y termsVersion cuando el registro es exitoso', async () => {
    getMock.mockResolvedValueOnce({ data: [] }) // Sin correo duplicado
    postMock.mockImplementationOnce((_url, payload) => Promise.resolve({ data: { id: 'u-nuevo', ...payload } }))

    const result = await register({
      name: 'Usuario Conforme',
      email: 'conforme@artlink.test',
      role: 'cliente',
      passwordDemo: 'demo123456',
      acceptTerms: true,
    })

    expect(result.termsAccepted).toBe(true)
    expect(typeof result.termsAcceptedAt).toBe('string')
    expect(result.termsVersion).toBe('1.0')
    expect(postMock).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({
        email: 'conforme@artlink.test',
        termsAccepted: true,
        termsVersion: '1.0',
      })
    )
  })
})
