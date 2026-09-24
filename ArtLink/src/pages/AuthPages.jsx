import { useNavigate } from 'react-router-dom'
import { ROLES } from '../utils/roles'
import useAuth from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  function handleDemoLogin() {
    login({ id: 'demo-client', name: 'Cliente demo', role: ROLES.CLIENT })
    navigate('/solicitudes')
  }

  return (
    <section className="placeholder" aria-labelledby="login-title">
      <p>ArtLink / acceso</p>
      <h1 id="login-title">Iniciar sesión</h1>
      <p>El formulario de autenticación se implementará en la siguiente etapa.</p>
      <button className="button" type="button" onClick={handleDemoLogin}>
        Entrar como cliente demo
      </button>
    </section>
  )
}

export function RegisterPage() {
  return (
    <section className="placeholder" aria-labelledby="register-title">
      <p>ArtLink / acceso</p>
      <h1 id="register-title">Crear cuenta</h1>
      <p>El registro de clientes y artistas se implementará en la siguiente etapa.</p>
    </section>
  )
}
