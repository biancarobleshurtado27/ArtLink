import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AdminDashboardPage, AdminResourcePage, sanitizeAdminItem } from '../src/pages/AdminPages'
import { isWithinPeriod } from '../src/utils/adminChartUtils'

const mocks = vi.hoisted(() => ({
  getUsers: vi.fn(), createUser: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn(),
  getArtists: vi.fn(), createArtist: vi.fn(), updateArtist: vi.fn(), deleteArtist: vi.fn(),
  getCategories: vi.fn(), createCategory: vi.fn(), updateCategory: vi.fn(), deleteCategory: vi.fn(),
  getRequests: vi.fn(), createRequest: vi.fn(), updateRequest: vi.fn(), deleteRequest: vi.fn(),
  getPortfolioItems: vi.fn(),
  getReports: vi.fn(), createReport: vi.fn(), updateReport: vi.fn(), deleteReport: vi.fn(),
  getMessages: vi.fn(),
  getCommissions: vi.fn(),
}))

vi.mock('../src/services/userService', () => ({
  getUsers: mocks.getUsers,
  createUser: mocks.createUser,
  updateUser: mocks.updateUser,
  deleteUser: mocks.deleteUser
}))

vi.mock('../src/services/artistService', () => ({
  getArtists: mocks.getArtists,
  createArtist: mocks.createArtist,
  updateArtist: mocks.updateArtist,
  deleteArtist: mocks.deleteArtist
}))

vi.mock('../src/services/categoryService', () => ({
  getCategories: mocks.getCategories,
  createCategory: mocks.createCategory,
  updateCategory: mocks.updateCategory,
  deleteCategory: mocks.deleteCategory
}))

vi.mock('../src/services/requestService', () => ({
  getRequests: mocks.getRequests,
  createRequest: mocks.createRequest,
  updateRequest: mocks.updateRequest,
  deleteRequest: mocks.deleteRequest
}))

vi.mock('../src/services/portfolioService', () => ({
  getPortfolioItems: mocks.getPortfolioItems
}))

vi.mock('../src/services/reportService', () => ({
  getReports: mocks.getReports,
  createReport: mocks.createReport,
  updateReport: mocks.updateReport,
  deleteReport: mocks.deleteReport
}))

vi.mock('../src/services/messageService', () => ({
  getMessages: mocks.getMessages
}))

vi.mock('../src/services/commissionService', () => ({
  getCommissions: mocks.getCommissions
}))

describe('Panel Administrativo - 13 Métricas y Filtros de Periodo', () => {
  const mockUsers = [
    { id: 'u1', name: 'Admin', email: 'admin@artlink.com', role: 'admin', password: 'secret_admin_pwd', passwordDemo: '123', createdAt: '2026-10-05T10:00:00Z' },
    { id: 'u2', name: 'Cliente Ana', email: 'ana@client.com', role: 'cliente', password: 'secret_client_pwd', createdAt: '2026-10-05T09:00:00Z' },
    { id: 'u3', name: 'Cliente Carlos', email: 'carlos@client.com', role: 'cliente', password: 'secret_client_pwd', createdAt: '2026-09-20T10:00:00Z' },
    { id: 'u4', name: 'Artista Sora', email: 'sora@art.com', role: 'artista', password: 'secret_artist_pwd', createdAt: '2026-09-01T10:00:00Z' }
  ]

  const mockArtists = [
    { id: 'art-1', displayName: 'Sora Moon', username: 'soramoon', availability: 'open', verified: true, disciplines: ['Ilustración 2D'] },
    { id: 'art-2', displayName: 'Renzo 3D', username: 'renzo', availability: 'closed', verified: false, disciplines: ['Modelado 3D'] }
  ]

  const mockRequests = [
    { id: 'req-1', status: 'pending', budget: 150, createdAt: '2026-10-05T12:00:00Z', desiredDate: '2026-10-20' },
    { id: 'req-2', status: 'accepted', budget: 220, createdAt: '2026-10-04T10:00:00Z', desiredDate: '2026-10-25' },
    { id: 'req-3', status: 'completed', budget: 300, createdAt: '2026-09-15T10:00:00Z', desiredDate: '2026-09-30' }
  ]

  const mockCategories = [
    { id: 'cat-1', name: 'Ilustración Digital' }
  ]

  const mockPortfolioItems = [
    { id: 'port-1', title: 'Guerrera Estelar' },
    { id: 'port-2', title: 'Cyberpunk Alley' },
    { id: 'port-3', title: 'Retrato Neón' }
  ]

  const mockReports = [
    { id: 'rep-1', title: 'Copia no autorizada', reporterName: 'Cliente 1', type: 'licensing', priority: 'high', status: 'pending', reason: 'Copia directa' },
    { id: 'rep-2', title: 'Demora en entrega', reporterName: 'Cliente 2', type: 'delay', priority: 'medium', status: 'resolved', reason: 'Resuelto por mutuo acuerdo' }
  ]

  const mockMessages = [
    { id: 'msg-1', content: 'Consulta soporte', read: false },
    { id: 'msg-2', content: 'Agradecimiento', read: true }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUsers.mockResolvedValue(mockUsers)
    mocks.getArtists.mockResolvedValue(mockArtists)
    mocks.getRequests.mockResolvedValue(mockRequests)
    mocks.getCategories.mockResolvedValue(mockCategories)
    mocks.getPortfolioItems.mockResolvedValue(mockPortfolioItems)
    mocks.getReports.mockResolvedValue(mockReports)
    mocks.getMessages.mockResolvedValue(mockMessages)
    mocks.getCommissions.mockResolvedValue([])
  })

  it('calcula y muestra las 13 métricas oficiales del panel administrativo con datos reales', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    )

    // Esperar a que cargue el dashboard
    expect(await screen.findByRole('heading', { level: 1, name: 'Panel administrativo' })).toBeInTheDocument()

    // 1. Usuarios registrados (Total = 4)
    expect(screen.getByText('Usuarios registrados')).toBeInTheDocument()
    expect(screen.getAllByText('4').length).toBeGreaterThan(0)

    // 2. Clientes activos (2 clientes)
    expect(screen.getByText('Clientes activos')).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)

    // 3. Artistas activos (2 artistas)
    expect(screen.getByText('Artistas activos')).toBeInTheDocument()

    // 4. Artistas con comisiones abiertas (1 con availability: open)
    expect(screen.getByText('Artistas con comisiones abiertas')).toBeInTheDocument()

    // 5. Nuevos registros del periodo seleccionado
    expect(screen.getByText('Nuevos registros del periodo')).toBeInTheDocument()

    // 6. Solicitudes creadas
    expect(screen.getByText('Solicitudes creadas')).toBeInTheDocument()

    // 7. Solicitudes pendientes
    expect(screen.getByText('Solicitudes pendientes')).toBeInTheDocument()

    // 8. Solicitudes aceptadas
    expect(screen.getByText('Solicitudes aceptadas')).toBeInTheDocument()

    // 9. Solicitudes completadas
    expect(screen.getByText('Solicitudes completadas')).toBeInTheDocument()

    // 10. Reportes pendientes (1 con status: pending)
    expect(screen.getByText('Reportes pendientes')).toBeInTheDocument()

    // 11. Obras publicadas (3 obras)
    expect(screen.getByText('Obras publicadas')).toBeInTheDocument()
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)

    // 12. Artistas verificados (1 con verified: true)
    expect(screen.getByText('Artistas verificados')).toBeInTheDocument()

    // 13. Mensajes o incidencias abiertas (1 reporte pendiente + 1 mensaje no leído = 2)
    expect(screen.getByText('Mensajes o incidencias abiertas')).toBeInTheDocument()
  })

  it('permite cambiar el filtro de periodo por Hoy, 7 días, 30 días, 90 días y Todo el periodo', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'Panel administrativo' })).toBeInTheDocument()

    // Botones de filtro presentes
    const btnHoy = screen.getByRole('radio', { name: 'Hoy' })
    const btn7d = screen.getByRole('radio', { name: 'Últimos 7 días' })
    const btn30d = screen.getByRole('radio', { name: 'Últimos 30 días' })
    const btn90d = screen.getByRole('radio', { name: 'Últimos 90 días' })
    const btnAll = screen.getByRole('radio', { name: 'Todo el periodo' })

    expect(btnHoy).toBeInTheDocument()
    expect(btn7d).toBeInTheDocument()
    expect(btn30d).toBeInTheDocument()
    expect(btn90d).toBeInTheDocument()
    expect(btnAll).toBeInTheDocument()

    // Cambiar a "Hoy"
    fireEvent.click(btnHoy)
    expect(btnHoy).toHaveClass('is-active')
    expect(screen.getByText(/Mostrando datos:/i)).toHaveTextContent('Hoy')

    // Cambiar a "Últimos 7 días"
    fireEvent.click(btn7d)
    expect(btn7d).toHaveClass('is-active')
    expect(screen.getByText(/Mostrando datos:/i)).toHaveTextContent('Últimos 7 días')
  })

  it('sanitiza la información sensible y nunca muestra contraseñas o tokens', () => {
    const rawUser = {
      id: 'usr-99',
      name: 'Super User',
      email: 'secret@user.com',
      password: 'super_secret_password',
      passwordDemo: 'demo_password',
      token: 'jwt.token.abc',
      apiKey: 'xyz-secret-key',
      role: 'admin'
    }

    const clean = sanitizeAdminItem(rawUser)
    expect(clean.password).toBeUndefined()
    expect(clean.passwordDemo).toBeUndefined()
    expect(clean.token).toBeUndefined()
    expect(clean.apiKey).toBeUndefined()
    expect(clean.name).toBe('Super User')
    expect(clean.email).toBe('secret@user.com')
  })

  it('permite gestionar y ver reportes de moderación desde AdminResourcePage', async () => {
    mocks.getReports.mockResolvedValue(mockReports)

    render(
      <MemoryRouter>
        <AdminResourcePage resource="reportes" />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'Reportes e Incidencias' })).toBeInTheDocument()
    expect((await screen.findAllByText('Copia no autorizada')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Demora en entrega').length).toBeGreaterThan(0)
  })
})
