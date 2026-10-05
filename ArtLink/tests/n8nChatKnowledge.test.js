import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  resolveArtLinkKnowledge,
  sendMessageToChatbot,
} from '../src/services/n8nChatService'

describe('n8nChatService - Motor de Conocimiento y Resolución Confiable', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Funciones de ArtLink según el rol del usuario', () => {
    it('explica detalladamente las funciones y accesos exclusivos para artistas', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Qué funciones tengo como artista?',
        role: 'artist',
        userName: 'Elena Ilustradora',
      })
      expect(res.intent).toBe('role_features')
      expect(res.message).toContain('/artista/panel')
      expect(res.message).toContain('/artista/comisiones')
      expect(res.message).toContain('/artista/portafolio')
      expect(res.message).toContain('Escrow Shield')
      expect(res.message).toContain('Rol Dual')
      expect(res.message).not.toContain('No pude generar una respuesta completa')
    })

    it('explica las funciones y herramientas del cliente', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Qué puedo hacer en mi cuenta de cliente?',
        role: 'client',
        userName: 'Carlos',
      })
      expect(res.intent).toBe('role_features')
      expect(res.message).toContain('/explorar')
      expect(res.message).toContain('Escrow Shield')
      expect(res.message).toContain('/solicitudes')
      expect(res.message).toContain('/mensajes')
    })

    it('explica los permisos y funciones del administrador', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cuáles son mis permisos de administrador?',
        role: 'admin',
        userName: 'Admin ArtLink',
      })
      expect(res.intent).toBe('role_features')
      expect(res.message).toContain('/admin')
      expect(res.message).toContain('/admin/usuarios')
      expect(res.message).toContain('Asistente IA de Analítica')
    })
  })

  describe('2. Preguntas generales sobre arte, técnicas, materiales y artistas reconocidos', () => {
    it('responde rigurosamente a la consulta sobre la técnica con acuarela', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cómo es la técnica con acuarela?',
      })
      expect(res.intent).toBe('art_technique')
      expect(res.message.toLowerCase()).toContain('acuarela')
      expect(res.message.toLowerCase()).toContain('goma arábiga')
      expect(res.message.toLowerCase()).toContain('transparencia')
      expect(res.message.toLowerCase()).toContain('húmedo sobre húmedo')
      expect(res.message).toContain('300 g/m²')
      expect(res.message).toContain('Multiplicar')
      expect(res.quickReplies.length).toBeGreaterThan(0)
    })

    it('responde sobre la técnica al óleo y la regla de graso sobre magro', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cómo se pinta al óleo?',
      })
      expect(res.intent).toBe('art_technique')
      expect(res.message.toLowerCase()).toContain('aceite de linaza')
      expect(res.message.toLowerCase()).toContain('graso sobre magro')
    })

    it('responde sobre arte digital y capas', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cómo es el flujo de trabajo en ilustración digital?',
      })
      expect(res.intent).toBe('digital_art_workflow')
      expect(res.message).toContain('Lineart')
      expect(res.message).toContain('Multiplicar')
      expect(res.message).toContain('300 DPI')
    })

    it('responde sobre modelado 3D y retopología', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Qué etapas tiene el modelado 3D?',
      })
      expect(res.intent).toBe('3d_art_help')
      expect(res.message).toContain('Retopología')
      expect(res.message).toContain('UV')
      expect(res.message).toContain('PBR')
    })

    it('responde sobre modelos VTuber y Live2D', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cómo funciona la creación de un modelo VTuber?',
      })
      expect(res.intent).toBe('vtuber_art_help')
      expect(res.message).toContain('Live2D Cubism')
      expect(res.message).toContain('Separación de capas')
    })

    it('responde sobre teoría del color y armonías', () => {
      const res = resolveArtLinkKnowledge({
        message: 'Explícame la teoría del color',
      })
      expect(res.intent).toBe('color_theory_help')
      expect(res.message).toContain('Complementarios')
      expect(res.message).toContain('Análogos')
    })

    it('responde sobre artistas famosos como Leonardo da Vinci y Van Gogh', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Quiénes fueron Leonardo da Vinci y Van Gogh?',
      })
      expect(res.intent).toBe('famous_artist_info')
      expect(res.message).toContain('sfumato')
      expect(res.message).toContain('van Gogh')
    })
  })

  describe('3. Navegación y uso de la plataforma', () => {
    it('explica cómo funciona el sistema de comisiones y Escrow Shield', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cómo solicito una comisión y cómo funciona el pago en custodia?',
      })
      expect(res.intent).toBe('explain_how_to_request')
      expect(res.message).toContain('Escrow Shield')
      expect(res.message).toContain('Entrega por hitos')
      expect(res.actions.length).toBeGreaterThan(0)
    })

    it('explica cómo buscar y explorar artistas', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cómo puedo buscar o explorar artistas en la galería?',
      })
      expect(res.intent).toBe('open_explore')
      expect(res.message).toContain('/explorar')
    })

    it('explica el seguimiento de solicitudes y notificaciones', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Dónde puedo ver mis solicitudes y pedidos?',
      })
      expect(res.intent).toBe('open_requests')
      expect(res.message).toContain('/solicitudes')
    })

    it('explica cómo cambiar apariencia y accesibilidad en ajustes', () => {
      const res = resolveArtLinkKnowledge({
        message: '¿Cómo activo el modo oscuro y alto contraste en ajustes?',
      })
      expect(res.intent).toBe('open_settings')
      expect(res.message).toContain('/ajustes')
    })
  })

  describe('4. Integración de sendMessageToChatbot ante fallos del webhook', () => {
    it('si el webhook devuelve la frase de error genérico, resuelve con el motor de conocimiento en vez de fallar', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'No pude generar una respuesta completa. Intenta escribir tu pregunta de otra forma.',
        }),
      })

      const res = await sendMessageToChatbot({
        message: '¿Cómo es la técnica con acuarela?',
        role: 'client',
      })

      expect(res.success).toBe(true)
      expect(res.message).toContain('acuarela')
      expect(res.message).toContain('goma arábiga')
      expect(res.message).not.toContain('No pude generar una respuesta completa')
    })

    it('si el webhook falla con error 503 (sobrecarga de Gemini), resuelve con respuesta útil y estructurada', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ message: 'Service Unavailable' }),
      })

      const res = await sendMessageToChatbot({
        message: '¿Qué funciones tengo como artista?',
        role: 'artist',
      })

      expect(res.success).toBe(true)
      expect(res.message).toContain('/artista/panel')
      expect(res.message).toContain('Escrow Shield')
      expect(res.quickReplies.length).toBeGreaterThan(0)
    })
  })
})
