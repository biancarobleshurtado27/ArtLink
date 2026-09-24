export default function LoadingState({ label = 'Cargando contenido' }) {
  return <div className="state-panel" role="status" aria-live="polite"><span className="loading-dots" aria-hidden="true">•••</span><p>{label}</p></div>
}
