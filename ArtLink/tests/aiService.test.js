import { beforeEach, describe, expect, it, vi } from 'vitest'

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }))
vi.mock('axios', () => ({ default: { post: postMock } }))

import { fallbackResponse, interpretNeed, validateResponse } from '../src/services/aiService'

describe('aiService', () => {
  beforeEach(() => { postMock.mockReset(); vi.unstubAllEnvs() })

  it('interprets common needs deterministically without credentials', () => {
    const result = fallbackResponse('Busco una ilustración de fantasía, presupuesto de 80 dólares y entrega en dos semanas')
    expect(result.mode).toBe('demo')
    expect(result.suggestedFilters.disciplines).toContain('Ilustración 2D')
    expect(result.suggestedFilters.styles).toContain('Fantasía')
    expect(result.suggestedFilters.maxPrice).toBe(80)
    expect(result.suggestedFilters.availability).toBe('open')
  })

  it('rejects incomplete AI responses', () => {
    expect(() => validateResponse({ summary: 'ok' })).toThrow('incompleta')
    expect(validateResponse({ summary: 'ok', suggestedFilters: { disciplines: ['Ilustración 2D'], styles: [], maxPrice: 80, availability: 'open' }, explanation: 'orientativo' }).mode).toBe('ai')
  })

  it('processes a valid configured AI response', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'https://ai.test/interpret')
    vi.stubEnv('VITE_AI_API_KEY', 'test-key')
    postMock.mockResolvedValue({ data: { summary: 'Ilustración fantástica', suggestedFilters: { disciplines: ['Ilustración 2D'], styles: ['Fantasía'], maxPrice: 80, availability: 'open' }, explanation: 'Coincide con tu necesidad.' } })
    await expect(interpretNeed('Ilustración fantástica de 80 dólares')).resolves.toMatchObject({ mode: 'ai', suggestedFilters: { maxPrice: 80 } })
    expect(postMock).toHaveBeenCalledWith('https://ai.test/interpret', expect.objectContaining({ prompt: expect.stringContaining('JSON válido') }), expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) }))
  })

  it('uses the local fallback when the configured AI request fails', async () => {
    vi.stubEnv('VITE_AI_API_URL', 'https://ai.test/interpret')
    vi.stubEnv('VITE_AI_API_KEY', 'test-key')
    postMock.mockRejectedValue(new Error('offline'))
    await expect(interpretNeed('Busco pixel art hasta 50 dólares')).resolves.toMatchObject({ mode: 'demo-fallback', suggestedFilters: { maxPrice: 50 } })
  })
})
