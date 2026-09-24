import { useState, useMemo } from 'react'
import { MessageCircle, Eye, Calendar, DollarSign, ExternalLink, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import usePrivateRequests from '../hooks/usePrivateRequests'

const statusLabels = {
  all: 'Todas',
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
  if (status === 'accepted' || status === 'in_progress') return 'violet'
  if (status === 'waitlist') return 'yellow'
  return 'violet'
}

export default function PrivateRequestsPage() {
  const { requests, loading, error } = usePrivateRequests()
  const [selected, setSelected] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests
    return requests.filter((req) => req.status === statusFilter)
  }, [requests, statusFilter])

  if (loading) return <LoadingState label="Cargando el historial de tus solicitudes..." />
  if (error) return <ErrorState message={error.message} />

  return (
    <section className="private-page" aria-labelledby="private-requests-title">
      <div className="private-header">
        <div>
          <p className="eyebrow">ArtLink / Mis encargos</p>
          <h1 id="private-requests-title">Mis solicitudes</h1>
          <p className="private-intro">Sigue el estado de cada encargo, revisa los detalles y mantén comunicación directa con el artista.</p>
        </div>
      </div>

      {/* Filtros por estado */}
      <div className="filter-bar" aria-label="Filtro de solicitudes por estado">
        <span className="filter-label"><Filter size={15} /> Filtrar por estado:</span>
        <div className="filter-pills">
          {Object.entries(statusLabels).map(([key, label]) => {
            const count = key === 'all' ? requests.length : requests.filter((r) => r.status === key).length
            if (key !== 'all' && count === 0) return null
            return (
              <button
                key={key}
                type="button"
                className={`filter-pill ${statusFilter === key ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(key)}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? 'Aún no tienes solicitudes' : `No hay solicitudes en estado "${statusLabels[statusFilter]}"`}
          description={statusFilter === 'all' ? 'Cuando envíes una propuesta a un artista, aparecerá registrada en esta sección.' : 'Prueba a cambiar el filtro para ver tus otras solicitudes.'}
        />
      ) : (
        <div className="private-request-list">
          {filteredRequests.map((request) => (
            <article className="private-request-card" key={request.id}>
              <div className="card-top">
                <div className="card-meta">
                  <span className="request-id">ID: #{request.id.slice(-6)}</span>
                  <span className="card-date">
                    <Calendar size={13} aria-hidden="true" /> {request.createdAt ? request.createdAt.slice(0, 10) : 'Reciente'}
                  </span>
                </div>
                <Badge tone={badgeTone(request.status)}>
                  {statusLabels[request.status] || request.status}
                </Badge>
              </div>

              <div className="card-body">
                <h2>{request.description}</h2>
                <div className="card-financials">
                  <span><DollarSign size={14} aria-hidden="true" /> <strong>${request.budget} USD</strong></span>
                  <span>Entrega estimada: <strong>{request.desiredDate}</strong></span>
                  {request.references && request.references.length > 0 && (
                    <span className="references-count">📎 {request.references.length} ref.</span>
                  )}
                </div>
              </div>

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

      {/* Modal de detalle completo */}
      <Modal open={Boolean(selected)} title="Detalle de solicitud" onClose={() => setSelected(null)}>
        {selected && (
          <div className="request-modal-content">
            <div className="modal-badge-row">
              <span className="request-id">Solicitud #{selected.id}</span>
              <Badge tone={badgeTone(selected.status)}>
                {statusLabels[selected.status] || selected.status}
              </Badge>
            </div>

            <div className="modal-section">
              <h3>Descripción del encargo</h3>
              <p className="description-box">{selected.description}</p>
            </div>

            <div className="modal-grid-two">
              <div>
                <strong>Presupuesto propuesto</strong>
                <p>${selected.budget} USD</p>
              </div>
              <div>
                <strong>Fecha deseada</strong>
                <p>{selected.desiredDate}</p>
              </div>
            </div>

            {selected.references && selected.references.length > 0 && (
              <div className="modal-section">
                <h3>Referencias adjuntas</h3>
                <ul className="references-list">
                  {selected.references.map((ref, idx) => (
                    <li key={idx}>
                      {ref.startsWith('http') ? (
                        <a href={ref} target="_blank" rel="noopener noreferrer" className="ref-link">
                          <ExternalLink size={14} /> {ref}
                        </a>
                      ) : (
                        <span>{ref}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              <Link
                className="button button-primary"
                to={`/mensajes?requestId=${selected.id}`}
                onClick={() => setSelected(null)}
              >
                <MessageCircle size={16} aria-hidden="true" /> Ir a la conversación
              </Link>
              <button className="button button-outline" type="button" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

