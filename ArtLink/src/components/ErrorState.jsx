import { TriangleAlert } from 'lucide-react'

export default function ErrorState({ message = 'No pudimos cargar este contenido.', onRetry }) {
  return <div className="state-panel error-state" role="alert"><TriangleAlert size={28} aria-hidden="true" /><h2>Algo salió mal</h2><p>{message}</p>{onRetry && <button className="button button-outline" type="button" onClick={onRetry}>Intentar de nuevo</button>}</div>
}
