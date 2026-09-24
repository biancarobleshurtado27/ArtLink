import { Link } from 'react-router-dom'

export default function AccessDeniedPage() {
  return <section className="auth-panel placeholder" aria-labelledby="denied-title"><p className="eyebrow">ArtLink / permisos</p><h1 id="denied-title">Acceso denegado</h1><p>Tu cuenta no tiene el rol necesario para ver esta sección.</p><Link className="button button-primary" to="/">Volver al inicio</Link></section>
}