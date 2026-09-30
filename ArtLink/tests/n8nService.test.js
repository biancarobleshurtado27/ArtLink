import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import {
  isN8nConfigured,
  checkN8nHealth,
  registerUserViaN8n,
  createCommissionRequestViaN8n,
} from '../src/services/n8nService'

vi.mock('axios')

describe('n8nService HTTP and webhook client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('determina si N8N está configurado', () => {
    const configured = isN8nConfigured()
    expect(typeof configured).toBe('boolean')
  })

  it('verifica la disponibilidad de la instancia N8N en /healthz', async () => {
    axios.get.mockResolvedValueOnce({ data: { status: 'ok' } })
    const isHealthy = await checkN8nHealth()
    expect(isHealthy).toBe(true)
    expect(axios.get).toHaveBeenCalledWith('/n8n-proxy/healthz', expect.any(Object))

    axios.get.mockRejectedValueOnce(new Error('Connection refused'))
    const isOffline = await checkN8nHealth()
    expect(isOffline).toBe(false)
  })

  it('envía payload de registro al webhook correspondiente', async () => {
    const payload = {
      name: 'Valeria Castro',
      email: 'valeria@artlink.test',
      role: 'cliente',
      passwordDemo: 'demo123456',
    }
    const mockResponse = { success: true, user: { id: 'u-1', ...payload } }
    axios.post.mockResolvedValueOnce({ data: mockResponse })

    const result = await registerUserViaN8n(payload)
    expect(result).toEqual(mockResponse)
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/artlink-registro-usuario'),
      payload,
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    )
  })

  it('envía propuesta de comisión al webhook correspondiente', async () => {
    const requestData = {
      artistId: 'artist-001',
      clientId: 'user-client-001',
      budget: 95,
      description: 'Retrato con detalles dorados y estilo victoriano.',
    }
    const mockResponse = { success: true, requestId: 'req-n8n-1', escrowStatus: 'held_in_escrow' }
    axios.post.mockResolvedValueOnce({ data: mockResponse })

    const result = await createCommissionRequestViaN8n(requestData)
    expect(result).toEqual(mockResponse)
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/artlink-solicitud-comision'),
      requestData,
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    )
  })
})
