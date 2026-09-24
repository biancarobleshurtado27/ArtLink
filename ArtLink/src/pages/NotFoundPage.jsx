import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="placeholder" aria-labelledby="not-found-title">
      <h1 id="not-found-title">Página no encontrada</h1>
      <Link className="button" to="/">Volver al inicio</Link>
    </section>
  )
}
