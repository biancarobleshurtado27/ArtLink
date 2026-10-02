import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import PrivateRequestsPage from '../src/pages/PrivateRequestsPage'
import * as useAuthModule from '../src/hooks/useAuth'
import * as usePrivateRequestsModule from '../src/hooks/usePrivateRequests'
import * as notificationService from '../src/services/notificationService'

describe('PrivateRequestsPage - Sin datos quemados / Real data only', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(notificationService, 'getNotificationsByUser').mockResolvedValue([])
  })

  it('muestra estado vacío y no tarjetas quemadas cuando el usuario no tiene solicitudes ni notificaciones', async () => {
    vi.spyOn(useAuthModule, 'default').mockReturnValue({
      user: { id: 'test-user-empty', name: 'Usuario Nuevo', role: 'client' },
    })

    vi.spyOn(usePrivateRequestsModule, 'default').mockReturnValue({
      requests: [],
      clientRequests: [],
      loading: false,
      error: null,
      reload: vi.fn(),
    })

    render(
      <MemoryRouter>
        <PrivateRequestsPage />
      </MemoryRouter>
    )

    // Debe mostrar el estado vacío
    await waitFor(() => {
      expect(screen.getByText('No tienes solicitudes ni notificaciones activas')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Cuando envíes o recibas solicitudes de comisión/i)
    ).toBeInTheDocument()

    // No debe mostrar ningún dato quemado
    expect(screen.queryByText('Kaelen Vance')).not.toBeInTheDocument()
    expect(screen.queryByText('Mía Soler')).not.toBeInTheDocument()
    expect(screen.queryByText('Renzo Miyazaki')).not.toBeInTheDocument()
    expect(screen.queryByText('Encargo #1094')).not.toBeInTheDocument()
    expect(screen.queryByText('Encargo #1082')).not.toBeInTheDocument()
    expect(screen.queryByText('Escrow Shield #ESC-8921')).not.toBeInTheDocument()

    // Los contadores KPI deben ser 0 o reflejar el estado vacío
    expect(screen.getByText('0 Pendientes')).toBeInTheDocument()
    expect(screen.getByText('0 En Revisión')).toBeInTheDocument()
    expect(screen.getByText('$0.00 USD')).toBeInTheDocument()
  })

  it('muestra únicamente las solicitudes reales del usuario', async () => {
    const realRequest = {
      id: 'req-real-999',
      clientId: 'user-client-123',
      artistId: 'user-artist-456',
      artistName: 'Artista Real Pro',
      artistUsername: 'artistareal',
      clientName: 'Cliente Real',
      commissionTitle: 'Logo Fantasía Personalizado',
      description: 'Creación de logotipo ilustrado para mi canal',
      budget: 350,
      price: 350,
      status: 'pending',
      escrowStatus: 'held_in_escrow',
      createdAt: '2026-10-02T10:00:00Z',
    }

    vi.spyOn(useAuthModule, 'default').mockReturnValue({
      user: { id: 'user-client-123', name: 'Cliente Real', role: 'client' },
    })

    vi.spyOn(usePrivateRequestsModule, 'default').mockReturnValue({
      requests: [realRequest],
      clientRequests: [realRequest],
      loading: false,
      error: null,
      reload: vi.fn(),
    })

    render(
      <MemoryRouter>
        <PrivateRequestsPage />
      </MemoryRouter>
    )

    // No debe mostrar estado vacío
    await waitFor(() => {
      expect(screen.queryByText('No tienes solicitudes ni notificaciones activas')).not.toBeInTheDocument()
    })

    // Debe mostrar la solicitud real
    expect(screen.getByText('Logo Fantasía Personalizado')).toBeInTheDocument()
    expect(screen.getAllByText('$350.00 USD').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('#al-999')).toBeInTheDocument()

    // No debe contener datos de ejemplo anteriores
    expect(screen.queryByText('Kaelen Vance')).not.toBeInTheDocument()
    expect(screen.queryByText('Mía Soler')).not.toBeInTheDocument()
  })
})
