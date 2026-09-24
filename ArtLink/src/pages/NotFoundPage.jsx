import { Link } from 'react-router-dom'
import { ArrowLeft, Palette } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <section className="auth-panel" aria-labelledby="not-found-title">
      <p className="eyebrow">ArtLink / error 404</p>
      <h1 id="not-found-title">Esta página no está en el lienzo</h1>
      <p className="private-intro">La dirección que buscaste no existe o se movió de lugar. Volvamos a algo bonito.</p>
      <div className="hero-actions">
        <Link className="button button-primary" to="/"><ArrowLeft size={16} aria-hidden="true" /> Volver al inicio</Link>
        <Link className="button button-secondary" to="/explorar"><Palette size={16} aria-hidden="true" /> Explorar artistas</Link>
      </div>
    </section>
  )
}