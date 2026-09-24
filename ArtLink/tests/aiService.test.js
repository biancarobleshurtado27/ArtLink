import { describe, expect, it } from 'vitest'
import { fallbackResponse, validateResponse } from '../src/services/aiService'

describe('aiService', () => {
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
})
