import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../src/context/AuthContext'
import { LoginPage } from '../src/pages/AuthPages'

const loginMock = vi.fn()
vi.mock('../src/services/authService', () => ({ login: (...args) => loginMock(...args), register: vi.fn() }))

function renderLogin() {
  return render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => { loginMock.mockReset(); localStorage.clear() })

  it('associates labels and required validation with login fields', () => {
    renderLogin()
    expect(screen.getByLabelText('Correo electrónico')).toBeRequired()
    expect(screen.getByLabelText('Contraseña demo')).toBeRequired()
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('type', 'email')
  })

  it('shows an accessible error when credentials are rejected', async () => {
    loginMock.mockRejectedValue(new Error('invalid'))
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText('Correo electrónico'), 'wrong@example.com')
    await user.type(screen.getByLabelText('Contraseña demo'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos iniciar sesión')
  })
})
