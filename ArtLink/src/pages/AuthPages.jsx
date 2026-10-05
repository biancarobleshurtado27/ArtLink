import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Briefcase, CheckCircle2, LogIn, Palette, UserPlus } from 'lucide-react'
import logoArtLink from '../assets/logo-artlink.png'
import { ROLES } from '../utils/roles'
import useAuth from '../hooks/useAuth'
import FloatingStars from '../components/FloatingStars'

function AuthAside({ title, text, tips }) {
  return (
    <aside className="auth-aside" aria-hidden="true">
      <div className="auth-aside-tape" />
      <p className="eyebrow">Nota de estudio</p>
      <h2>{title}</h2>
      <p>{text}</p>
      <ul>
        {tips.map((tip) => <li key={tip}><CheckCircle2 size={16} /> {tip}</li>)}
      </ul>
    </aside>
  )
}

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
      const loggedUser = await loginWithCredentials(form.email.trim(), form.passwordDemo)
      const isAdmin = loggedUser?.role === ROLES.ADMIN || loggedUser?.role === 'admin' || loggedUser?.role === 'administrador'
      const fallback = isAdmin ? '/admin' : '/solicitudes'
      navigate(location.state?.from?.pathname || fallback, { replace: true })
    } catch {
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <FloatingStars variant="subtle" />
      <div className="auth-card paper-card">
        <div className="auth-brand-badge">
          <Link to="/" className="auth-brand-link" aria-label="Ir al inicio de ArtLink">
            <img src={logoArtLink} alt="Logo de ArtLink" className="auth-logo" />
            <span className="brand-text">
              <strong>ArtLink</strong>
              <small>Conecta tu arte</small>
            </span>
          </Link>
        </div>
        <p className="eyebrow">ArtLink / acceso</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder a tu cuenta.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Correo electrónico<input id="login-email" type="email" autoComplete="email" placeholder="tu@correo.com" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label htmlFor="login-password">Contraseña<span className="sr-only"> demo</span><input id="login-password" type="password" autoComplete="current-password" required value={form.passwordDemo} onChange={(event) => setForm({ ...form, passwordDemo: event.target.value })} /></label>
          {error && <p className="form-message form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Validando...' : 'Iniciar sesión'} <LogIn size={16} aria-hidden="true" /></button>
        </form>
        <p className="auth-switch">¿Todavía no tienes cuenta? <Link to="/registro">Crear perfil</Link></p>
      </div>
      <AuthAside
        title="Retoma tu idea donde quedó"
        text="Tu sesión recupera tus solicitudes, mensajes y artistas guardados."
        tips={['Acceso seguro a tu panel', 'Roles distintos con paneles distintos', 'Protección de tus solicitudes']}
      />
    </section>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    email: '',
    passwordDemo: '',
    role: searchParams.get('role') === 'artist' ? ROLES.ARTIST : ROLES.CLIENT,
    acceptTerms: false,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.acceptTerms) {
      setError('Debes aceptar las condiciones para crear tu cuenta.')
      return
    }

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

  const roleOptions = [
    { value: ROLES.CLIENT, label: 'Cliente', icon: Briefcase, hint: 'Quiero encargar arte' },
    { value: ROLES.ARTIST, label: 'Artista', icon: Palette, hint: 'Quiero recibir encargos' },
  ]

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <FloatingStars variant="subtle" />
      <div className="auth-card paper-card">
        <div className="auth-brand-badge">
          <Link to="/" className="auth-brand-link" aria-label="Ir al inicio de ArtLink">
            <img src={logoArtLink} alt="Logo de ArtLink" className="auth-logo" />
            <span className="brand-text">
              <strong>ArtLink</strong>
              <small>Conecta tu arte</small>
            </span>
          </Link>
        </div>
        <p className="eyebrow">ArtLink / acceso</p>
        <h1 id="register-title">Crear cuenta</h1>
        <p className="auth-subtitle">Regístrate como cliente o artista. Si vienes desde “Para artistas”, el rol ya viene elegido.</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-name">Nombre<input id="register-name" type="text" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label htmlFor="register-email">Correo electrónico<input id="register-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label htmlFor="register-password">Contraseña<span className="sr-only"> demo</span><input id="register-password" type="password" autoComplete="new-password" minLength="6" required value={form.passwordDemo} onChange={(event) => setForm({ ...form, passwordDemo: event.target.value })} /></label>
          <fieldset className="role-options">
            <legend>Quiero registrarme como</legend>
            <div className="role-options-grid" role="radiogroup" aria-label="Quiero registrarme como">
              {roleOptions.map(({ value, label, icon: Icon, hint }) => (
                <button
                  key={value}
                  className={`role-card ${form.role === value ? 'is-selected' : ''}`}
                  type="button"
                  role="radio"
                  aria-checked={form.role === value}
                  onClick={() => setForm({ ...form, role: value })}
                >
                  <Icon size={22} aria-hidden="true" />
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <div className={`terms-checkbox-group ${error && !form.acceptTerms ? 'has-error' : ''}`}>
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              required
              checked={form.acceptTerms}
              onChange={(event) => {
                const checked = event.target.checked
                setForm((prev) => ({ ...prev, acceptTerms: checked }))
                if (checked && error === 'Debes aceptar las condiciones para crear tu cuenta.') {
                  setError('')
                }
              }}
              aria-invalid={Boolean(error && !form.acceptTerms)}
              aria-describedby={error ? 'terms-error-message' : undefined}
              className="terms-checkbox-input"
            />
            <label htmlFor="acceptTerms" className="terms-checkbox-label">
              Acepto los{' '}
              <Link to="/terminos" target="_blank" rel="noopener noreferrer" className="terms-link">
                Términos de uso
              </Link>
              , la{' '}
              <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="terms-link">
                Política de privacidad
              </Link>{' '}
              y las{' '}
              <Link to="/comunidad" target="_blank" rel="noopener noreferrer" className="terms-link">
                Políticas de comunidad
              </Link>{' '}
              de ArtLink.
            </label>
          </div>

          {error && (
            <p id="terms-error-message" className="form-message form-error" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
            aria-disabled={!form.acceptTerms}
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'} <UserPlus size={16} aria-hidden="true" />
          </button>
        </form>
        <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link> · <Link to="/como-funciona">Ver cómo funciona <ArrowRight size={13} aria-hidden="true" /></Link></p>
      </div>
      <AuthAside
        title="Tu vitrina lista para publicar"
        text="Al crear un perfil de artista entras directo a tu panel de trabajo."
        tips={['Portafolio y tarifas en un panel', 'Cupos y disponibilidad a tu control', 'Solicitudes ordenadas']}
      />
    </section>
  )
}