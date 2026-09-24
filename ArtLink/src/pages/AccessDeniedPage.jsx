import { Link } from 'react-router-dom'
import { ArrowLeft, LogIn } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <section className="auth-panel" aria-labelledby="denied-title">
      <p className="eyebrow">ArtLink / permisos</p>
      <h1 id="denied-title">Acceso denegado</h1>
      <p className="private-intro">Tu cuenta no tiene el rol necesario para ver esta sección. Prueba con una cuenta de prueba con los permisos adecuados.</p>
      <div className="hero-actions">
        <Link className="button button-primary" to="/login"><LogIn size={16} aria-hidden="true" /> Iniciar con otra cuenta</Link>
        <Link className="button button-secondary" to="/"><ArrowLeft size={16} aria-hidden="true" /> Volver al inicio</Link>
      </div>
    </section>
  )
}