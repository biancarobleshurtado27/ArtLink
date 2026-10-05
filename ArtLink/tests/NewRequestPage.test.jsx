import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import NewRequestPage from '../src/pages/NewRequestPage'

vi.mock('../src/hooks/useArtistProfile', () => ({ default: () => ({ profile: { id: 'artist-1', displayName: 'Mateo Ríos', username: 'mateorios', avatar: '', availability: 'open', slots: 2 }, commissions: [{ id: 'commission-1', title: 'Retrato', price: 80, deliveryDays: 7, status: 'active' }], loading: false, error: null }) }))
vi.mock('../src/hooks/useAuth', () => ({ default: () => ({ user: { id: 'client-1', name: 'Cliente Prueba', role: 'cliente' } }) }))
vi.mock('../src/services/requestService', () => ({ createRequest: vi.fn().mockResolvedValue({ id: 'req-test-1', status: 'waitlist', budget: 80 }) }))
vi.mock('../src/services/notificationService', () => ({
  createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
  getNotificationsByUser: vi.fn().mockResolvedValue([]),
}))

describe('NewRequestPage', () => {
  it('exposes required request validation and terms controls', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/solicitudes/nueva/artist-1']}><NewRequestPage /></MemoryRouter>)
    expect(screen.getByLabelText(/Descripción del encargo/)).toBeRequired()
    expect(screen.getByLabelText(/Presupuesto propuesto/)).toBeRequired()
    expect(screen.getByLabelText(/Fecha deseada/)).toBeRequired()
    expect(screen.getByLabelText(/Entiendo que esta solicitud/)).toBeRequired()
    await user.click(screen.getByRole('button', { name: /Enviar propuesta de comisión/ }))
    expect(screen.queryByText('Tu idea ya está en camino.')).not.toBeInTheDocument()
  })

  it('permite enviar la propuesta, llama a createRequest y notifica al artista', async () => {
    const { createRequest } = await import('../src/services/requestService')
    const { createNotification } = await import('../src/services/notificationService')
    const user = userEvent.setup()

    render(<MemoryRouter initialEntries={['/solicitudes/nueva/artist-1']}><NewRequestPage /></MemoryRouter>)

    const descInput = screen.getByLabelText(/Descripción del encargo/)
    await user.type(descInput, 'Necesito una ilustración de personaje con armadura completa y fondo estelar.')

    const submitBtn = screen.getByRole('button', { name: /Enviar propuesta de comisión/ })
    await user.click(submitBtn)

    expect(createRequest).toHaveBeenCalled()
    expect(createNotification).toHaveBeenCalled()
    expect(await screen.findByText(/¡Propuesta de comisión enviada con éxito!/i)).toBeInTheDocument()
  })
})
