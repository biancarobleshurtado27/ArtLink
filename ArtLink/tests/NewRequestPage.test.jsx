import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import NewRequestPage from '../src/pages/NewRequestPage'

vi.mock('../src/hooks/useArtistProfile', () => ({ default: () => ({ profile: { id: 'artist-1', displayName: 'Mateo Ríos', username: 'mateorios', avatar: '', availability: 'open', slots: 2 }, commissions: [{ id: 'commission-1', title: 'Retrato', price: 80, deliveryDays: 7, status: 'active' }], loading: false, error: null }) }))
vi.mock('../src/hooks/useAuth', () => ({ default: () => ({ user: { id: 'client-1', role: 'cliente' } }) }))
vi.mock('../src/services/requestService', () => ({ createRequest: vi.fn() }))

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
})
