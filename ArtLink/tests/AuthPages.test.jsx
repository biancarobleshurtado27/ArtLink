import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../src/context/AuthContext'
import { LoginPage, RegisterPage } from '../src/pages/AuthPages'

const loginMock = vi.fn()
const registerMock = vi.fn()
vi.mock('../src/services/authService', () => ({
  login: (...args) => loginMock(...args),
  register: (...args) => registerMock(...args),
}))

function renderLogin() {
  return render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>)
}

function renderRegister(initialEntry = '/registro') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>
  )
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

describe('RegisterPage - Términos y Condiciones', () => {
  beforeEach(() => {
    registerMock.mockReset()
    localStorage.clear()
  })

  it('muestra el checkbox obligatorio con id, name, required y enlaces funcionales a las tres políticas', () => {
    renderRegister()

    const checkbox = screen.getByRole('checkbox', {
      name: /Acepto los Términos de uso, la Política de privacidad y las Políticas de comunidad de ArtLink\./i,
    })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('id', 'acceptTerms')
    expect(checkbox).toHaveAttribute('name', 'acceptTerms')
    expect(checkbox).toBeRequired()
    expect(checkbox).not.toBeChecked()

    const terminosLink = screen.getByRole('link', { name: 'Términos de uso' })
    const privacidadLink = screen.getByRole('link', { name: 'Política de privacidad' })
    const comunidadLink = screen.getByRole('link', { name: 'Políticas de comunidad' })

    expect(terminosLink).toHaveAttribute('href', '/terminos')
    expect(privacidadLink).toHaveAttribute('href', '/privacidad')
    expect(comunidadLink).toHaveAttribute('href', '/comunidad')
  })

  it('bloquea el registro y muestra error accesible si no se acepta el checkbox', async () => {
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Nombre'), 'Valeria')
    await user.type(screen.getByLabelText('Correo electrónico'), 'valeria@artlink.test')
    await user.type(screen.getByLabelText('Contraseña demo'), 'password123')

    const submitBtn = screen.getByRole('button', { name: /Crear cuenta/i })
    await user.click(submitBtn)

    const alertMessage = await screen.findByRole('alert')
    expect(alertMessage).toHaveTextContent('Debes aceptar las condiciones para crear tu cuenta.')
    expect(alertMessage).toHaveAttribute('id', 'terms-error-message')

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error-message')
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')

    expect(registerMock).not.toHaveBeenCalled()
  })

  it('permite el registro y envía la aceptación de términos cuando el checkbox está marcado', async () => {
    registerMock.mockResolvedValueOnce({
      id: 'u-valeria',
      name: 'Valeria',
      email: 'valeria@artlink.test',
      role: 'cliente',
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: '1.0',
    })

    const user = userEvent.setup()
    renderRegister('/registro?role=artist')

    await user.type(screen.getByLabelText('Nombre'), 'Valeria Artista')
    await user.type(screen.getByLabelText('Correo electrónico'), 'valeria@artista.test')
    await user.type(screen.getByLabelText('Contraseña demo'), 'password123')

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    const submitBtn = screen.getByRole('button', { name: /Crear cuenta/i })
    await user.click(submitBtn)

    expect(registerMock).toHaveBeenCalledTimes(1)
    expect(registerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Valeria Artista',
        email: 'valeria@artista.test',
        role: 'artista',
        acceptTerms: true,
      })
    )
  })
})
