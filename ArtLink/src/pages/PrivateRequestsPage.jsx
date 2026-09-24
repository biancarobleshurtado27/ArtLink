import { useState } from 'react'
import { MessageCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import usePrivateRequests from '../hooks/usePrivateRequests'

const labels = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  rejected: 'Rechazada',
  waitlist: 'Lista de espera',
}

function badgeTone(status) {
  if (status === 'rejected') return 'closed'
  if (status === 'completed') return 'mint'
  return 'violet'
}

export default function PrivateRequestsPage() {
  const { requests, loading, error } = usePrivateRequests()
  const [selected, setSelected] = useState(null)

  if (loading) return <LoadingState label="Cargando tus solicitudes" />
  if (error) return <ErrorState message={error.message} />

  return (
    <section className="private-page" aria-labelledby="private-requests-title">
      <p className="eyebrow">ArtLink / seguimiento</p>
      <h1 id="private-requests-title">Mis solicitudes</h1>
      <p className="private-intro">Consulta el estado de cada encargo y abre su conversación asociada.</p>

      {requests.length === 0 ? (
        <EmptyState
          title="Aún no tienes solicitudes"
          description="Cuando envíes una comisión aparecerá aquí."
        />
      ) : (
        <div className="private-request-list">
          {requests.map((request) => (
            <article className="private-request-card" key={request.id}>
              <div>
                <p className="eyebrow">{request.createdAt.slice(0, 10)}</p>
                <h2>{request.description.slice(0, 60)}</h2>
                <p>Presupuesto: ${request.budget} USD · Fecha: {request.desiredDate}</p>
              </div>
              <Badge tone={badgeTone(request.status)}>
                {labels[request.status] || request.status}
              </Badge>
              <div className="private-request-actions">
                <button
                  className="button button-outline button-small"
                  type="button"
                  onClick={() => setSelected(request)}
                >
                  <Eye size={15} aria-hidden="true" /> Detalles
                </button>
                <Link
                  className="button button-secondary button-small"
                  to={`/mensajes?requestId=${request.id}`}
                >
                  <MessageCircle size={15} aria-hidden="true" /> Conversación
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      <Modal open={Boolean(selected)} title="Detalle de solicitud" onClose={() => setSelected(null)}>
        {selected && (
          <div className="request-detail">
            <p>{selected.description}</p>
            <strong>Estado: {labels[selected.status] || selected.status}</strong>
            <p>Presupuesto: ${selected.budget} USD</p>
            <p>Fecha deseada: {selected.desiredDate}</p>
            <p>
              Referencias:{' '}
              {selected.references?.length ? selected.references.join(', ') : 'Sin referencias'}
            </p>
          </div>
        )}
      </Modal>
    </section>
  )
}
