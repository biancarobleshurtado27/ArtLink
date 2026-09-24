import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLES } from '../utils/roles'
import useAuth from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithCredentials } = useAuth()
  const [form, setForm] = useState({ email: '', passwordDemo: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await loginWithCredentials(form.email.trim(), form.passwordDemo)
      navigate(location.state?.from?.pathname || '/solicitudes', { replace: true })
    } catch {
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña demo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-panel placeholder" aria-labelledby="login-title">
      <p className="eyebrow">ArtLink / acceso</p>
      <h1 id="login-title">Iniciar sesión</h1>
      <p>Usa una cuenta de prueba de JSON Server para entrar.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Correo electrónico<input id="login-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label htmlFor="login-password">Contraseña demo<input id="login-password" type="password" autoComplete="current-password" required value={form.passwordDemo} onChange={(event) => setForm({ ...form, passwordDemo: event.target.value })} /></label>
        {error && <p className="form-message form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Validando...' : 'Iniciar sesión'}</button>
      </form>
    </section>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', passwordDemo: '', role: ROLES.CLIENT })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      navigate(form.role === ROLES.ARTIST ? '/artista/panel' : '/solicitudes', { replace: true })
    } catch (registerError) {
      setError(registerError.message || 'No pudimos crear tu cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-panel placeholder" aria-labelledby="register-title">
      <p className="eyebrow">ArtLink / acceso</p>
      <h1 id="register-title">Crear cuenta</h1>
      <p>Crea una cuenta demo como cliente o artista.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register-name">Nombre<input id="register-name" type="text" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label htmlFor="register-email">Correo electrónico<input id="register-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label htmlFor="register-password">Contraseña demo<input id="register-password" type="password" autoComplete="new-password" minLength="6" required value={form.passwordDemo} onChange={(event) => setForm({ ...form, passwordDemo: event.target.value })} /></label>
        <label htmlFor="register-role">Quiero registrarme como<select id="register-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value={ROLES.CLIENT}>Cliente</option><option value={ROLES.ARTIST}>Artista</option></select></label>
        {error && <p className="form-message form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Creando cuenta...' : 'Crear cuenta'}</button>
      </form>
    </section>
  )
}
