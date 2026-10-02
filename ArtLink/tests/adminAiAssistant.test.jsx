import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import AdminAssistantDrawer from '../src/components/admin/AdminAssistantDrawer'
import {
  isAdminUser,
  auditPlatformInconsistencies,
  generateLocalAdminAnalysis,
  sendAdminAiQueryToN8n,
} from '../src/services/adminAiService'

// Mock globalThis.fetch para pruebas de integración con el webhook administrativo de N8N
const originalFetch = globalThis.fetch
beforeEach(() => {
  globalThis.fetch = vi.fn().mockImplementation((url, options) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: '### Estado General de la Plataforma ArtLink\n\nBalance general del sistema...',
        actions: [{ label: 'Ir al Dashboard', url: '/admin' }],
        quickReplies: ['Explicar métricas del dashboard'],
        provider: 'gemini-admin',
      }),
    })
  })
})

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.clearAllMocks()
})

vi.mock('../src/hooks/useAuth', () => ({
  default: () => ({
    user: { id: 'admin-1', name: 'Administrador ArtLink', role: 'admin' },
  }),
}))

vi.mock('../src/services/userService', () => ({
  getUsers: vi.fn().mockResolvedValue([{ id: '1', role: 'cliente' }]),
}))
vi.mock('../src/services/artistService', () => ({
  getArtists: vi.fn().mockResolvedValue([{ id: '1', availability: 'open' }]),
}))
vi.mock('../src/services/categoryService', () => ({
  getCategories: vi.fn().mockResolvedValue([{ id: '1' }]),
}))
vi.mock('../src/services/requestService', () => ({
  getRequests: vi.fn().mockResolvedValue([{ id: '1', status: 'pending' }]),
}))
vi.mock('../src/services/portfolioService', () => ({
  getPortfolioItems: vi.fn().mockResolvedValue([{ id: '1', artistId: '1' }]),
}))
vi.mock('../src/services/commissionService', () => ({
  getCommissions: vi.fn().mockResolvedValue([{ id: '1', price: 100, deliveryDays: 5 }]),
}))
vi.mock('../src/services/n8nChatService', () => ({
  sendMessageToChatbot: vi.fn().mockResolvedValue({
    success: true,
    message: '### Estado General de la Plataforma ArtLink\n\nBalance general del sistema...',
  }),
  isN8nChatbotConfigured: () => true,
}))

describe('Asistente de IA Administrativa - adminAiService', () => {
  it('valida acceso exclusivo por rol (admin / administrator)', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true)
    expect(isAdminUser({ role: 'administrator' })).toBe(true)
    expect(isAdminUser({ role: 'administrador' })).toBe(true)
    expect(isAdminUser({ role: 'cliente' })).toBe(false)
    expect(isAdminUser({ role: 'artista' })).toBe(false)
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser({})).toBe(false)
  })

  it('detecta inconsistencias en artistas sin portafolio y comisiones sin precio o plazo', () => {
    const mockData = {
      artists: [
        { id: 'art-1', displayName: 'Artista Uno' },
        { id: 'art-2', displayName: 'Artista Dos' },
      ],
      portfolioItems: [
        { id: 'item-1', artistId: 'art-1' },
        { id: 'item-2', artistId: 'art-1' },
      ],
      commissions: [
        { id: 'c-1', price: 0, deliveryDays: 5 },
        { id: 'c-2', price: 100 },
      ],
      requests: [{ id: 'req-1', status: 'pending' }],
      users: [{ id: 'u-1', active: false }],
    }

    const issues = auditPlatformInconsistencies(mockData)
    expect(issues.length).toBeGreaterThanOrEqual(3)

    const portfolioIssue = issues.find((i) => i.id === 'artists-incomplete-portfolio')
    expect(portfolioIssue).toBeDefined()
    expect(portfolioIssue.affectedItems.some((a) => a.id === 'art-2')).toBe(true)

    const commissionIssue = issues.find((i) => i.id === 'commissions-missing-details')
    expect(commissionIssue).toBeDefined()

    const requestIssue = issues.find((i) => i.id === 'requests-pending-backlog')
    expect(requestIssue).toBeDefined()
  })

  it('genera resumen analítico para presentación académica con arquitectura y métricas', () => {
    const mockData = {
      users: [{ id: '1', role: 'cliente' }, { id: '2', role: 'artista' }],
      artists: [{ id: '1', availability: 'open' }],
      categories: [{ id: 'cat-1' }],
      requests: [{ id: 'req-1', status: 'completed' }],
      portfolioItems: [{ id: 'p-1' }],
      commissions: [{ id: 'c-1' }],
    }

    const result = generateLocalAdminAnalysis('resumen para presentacion academica', mockData)
    expect(result.message).toContain('Resumen Ejecutivo para la Presentación Académica')
    expect(result.message).toContain('Arquitectura Técnica Destacada')
    expect(result.message).toContain('React')
    expect(result.actions.length).toBeGreaterThan(0)
    expect(result.message).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u)
  })

  it('explica detalladamente las métricas del dashboard sin cambios destructivos', () => {
    const mockData = {
      users: [{ id: '1', role: 'cliente' }],
      artists: [{ id: '1', availability: 'open' }],
      requests: [{ id: 'r-1', status: 'pending' }],
    }

    const result = generateLocalAdminAnalysis('explicar metricas del dashboard', mockData)
    expect(result.message).toContain('Explicación de las Métricas del Dashboard')
    expect(result.message).toContain('Usuarios registrados')
    expect(result.message).toContain('Artistas activos')
    expect(result.message).toContain('Solicitudes enviadas')
  })

  it('conecta con el webhook administrativo de N8N enviando payload enriquecido y validación de rol', async () => {
    const adminUser = { id: 'admin-99', name: 'Super Admin', role: 'admin' }
    const platformData = {
      users: [{ id: 'u-1' }],
      artists: [{ id: 'a-1' }],
      requests: [{ id: 'r-1', status: 'pending' }],
    }

    const res = await sendAdminAiQueryToN8n({
      message: 'resumen del estado',
      user: adminUser,
      platformData,
    })

    expect(res.success).toBe(true)
    expect(res.message).toContain('Estado General')
    expect(globalThis.fetch).toHaveBeenCalled()
    const callArgs = globalThis.fetch.mock.calls[0]
    expect(callArgs[0]).toContain('/artlink-admin-assistant')
    const bodySent = JSON.parse(callArgs[1].body)
    expect(bodySent.role).toBe('admin')
    expect(bodySent.platformSummary.usersCount).toBe(1)
  })

  it('maneja respuesta de error 403 de N8N si las credenciales o rol no son válidos', async () => {
    globalThis.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          message: 'Acceso denegado: se requiere rol de administrador autenticado.',
        }),
      })
    )

    const res = await sendAdminAiQueryToN8n({
      message: 'consulta sin rol',
      user: { role: 'cliente' },
    })

    expect(res.success).toBe(false)
    expect(res.errorCode).toBe('FORBIDDEN')
  })
})

describe('Componente AdminAssistantDrawer', () => {
  it('se renderiza correctamente para usuarios con rol de administrador', () => {
    render(
      <MemoryRouter>
        <AdminAssistantDrawer open={true} onClose={() => {}} />
      </MemoryRouter>
    )

    expect(screen.getByRole('dialog', { name: /Asistente de IA Administrativa/i })).toBeInTheDocument()
    expect(screen.getByText('Asistente IA')).toBeInTheDocument()
    expect(screen.getByText(/Consola de análisis y supervisión/i)).toBeInTheDocument()
    expect(screen.getByText(/Asistente consultivo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Pregunta sobre métricas, solicitudes/i)).toBeInTheDocument()
  })

  it('permite enviar una consulta mediante los botones de atajos rápidos', async () => {
    render(
      <MemoryRouter>
        <AdminAssistantDrawer open={true} onClose={() => {}} />
      </MemoryRouter>
    )

    const chipBtn = screen.getByRole('button', { name: 'Resumir estado general' })
    fireEvent.click(chipBtn)

    await waitFor(() => {
      expect(screen.getAllByText(/Estado General de la Plataforma ArtLink/i).length).toBeGreaterThan(0)
    })
  })

  it('permite agrandar y achicar la ventana mediante el botón de alternar tamaño y dispone del tirador de arrastre', () => {
    render(
      <MemoryRouter>
        <AdminAssistantDrawer open={true} onClose={() => {}} />
      </MemoryRouter>
    )

    const drawer = screen.getByRole('dialog', { name: /Asistente de IA Administrativa/i })
    const resizeHandle = screen.getByLabelText(/Arrastrar para redimensionar/i)
    expect(resizeHandle).toBeInTheDocument()

    // Botón para agrandar ventana
    const toggleBtn = screen.getByRole('button', { name: /Agrandar ventana/i })
    expect(toggleBtn).toBeInTheDocument()
    expect(drawer).toHaveStyle({ width: '460px' })

    // Clic para agrandar a modo amplio
    fireEvent.click(toggleBtn)
    expect(drawer.className).toContain('is-enlarged')

    // El botón cambia de etiqueta a achicar ventana
    const shrinkBtn = screen.getByRole('button', { name: /Achicar ventana/i })
    expect(shrinkBtn).toBeInTheDocument()

    // Clic para achicar de vuelta a tamaño estándar
    fireEvent.click(shrinkBtn)
    expect(drawer.className).not.toContain('is-enlarged')
    expect(drawer).toHaveStyle({ width: '460px' })
  })
})

