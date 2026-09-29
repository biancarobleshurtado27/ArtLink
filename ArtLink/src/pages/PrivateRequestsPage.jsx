import { useState, useMemo } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  MessageCircle,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import DecorativeStar from '../components/DecorativeStar'
import usePrivateRequests from '../hooks/usePrivateRequests'

const STATUS_CONFIG = {
  all: { label: 'Todas', tone: 'soft', icon: Filter },
  pending: { label: 'Pendiente', tone: 'violet', icon: Clock },
  in_review: { label: 'En revisión', tone: 'violet', icon: FileText },
  accepted: { label: 'Aceptada', tone: 'mint', icon: CheckCircle2 },
  in_progress: { label: 'En progreso', tone: 'violet', icon: Zap },
  completed: { label: 'Completada', tone: 'mint', icon: CheckCircle2 },
  rejected: { label: 'Rechazada', tone: 'closed', icon: XCircle },
  waitlist: { label: 'Lista de espera', tone: 'yellow', icon: Clock },
}

export default function PrivateRequestsPage() {
  const { clientRequests, loading, error } = usePrivateRequests()
  const [selected, setSelected] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // En /solicitudes mostramos solo las solicitudes realizadas por este usuario como cliente
  const userClientRequests = useMemo(() => {
    return clientRequests || []
  }, [clientRequests])

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return userClientRequests
    return userClientRequests.filter((req) => req.status === statusFilter)
  }, [userClientRequests, statusFilter])

  if (loading) return <LoadingState label="Cargando tus solicitudes de comisión..." />
  if (error) return <ErrorState message={error.message} />

  return (
    <section className="private-page" aria-labelledby="private-requests-title">
      <div className="private-header">
        <div>
          <span className="sticker sticker-purple" style={{ display: 'inline-flex', marginBottom: '0.4rem' }}>
            <DecorativeStar size={12} color="#1E192B" /> SEGUIMIENTO EN VIVO
          </span>
          <h1 id="private-requests-title">Mis Solicitudes de Comisión</h1>
          <p className="private-intro">
            Revisa el estado de tus encargos, los presupuestos en custodia y comunícate directamente con tus artistas.
          </p>
        </div>
      </div>

      {/* Barra de Filtros por Estado */}
      <div className="filter-bar" aria-label="Filtro de solicitudes por estado" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <span className="filter-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
          <Filter size={15} /> Filtrar por estado:
        </span>
        <div className="filter-pills" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = key === 'all'
              ? userClientRequests.length
              : userClientRequests.filter((r) => r.status === key).length

            const IconComp = config.icon

            return (
              <button
                key={key}
                type="button"
                className={`filter-pill ${statusFilter === key ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <IconComp size={13} aria-hidden="true" />
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? 'Aún no tienes solicitudes registradas' : `No hay solicitudes en estado "${STATUS_CONFIG[statusFilter]?.label || statusFilter}"`}
          description={
            statusFilter === 'all'
              ? 'Explora el catálogo de artistas y encarga tu primera pieza de arte personalizada.'
              : 'Selecciona la opción "Todas" para revisar el historial completo de encargos.'
          }
          action={
            <Link to="/explorar" className="button button-primary">
              Explorar artistas
            </Link>
          }
        />
      ) : (
        <div className="private-request-list">
          {filteredRequests.map((request) => {
            const config = STATUS_CONFIG[request.status] || { label: request.status, tone: 'violet', icon: Clock }
            const StatusIcon = config.icon

            return (
              <article className="private-request-card paper-card" key={request.id}>
                <div className="card-top">
                  <div className="card-meta">
                    <span className="request-id">ID: #{request.id.slice(-6)}</span>
                    <span className="card-date">
                      <Calendar size={13} aria-hidden="true" /> {request.createdAt ? request.createdAt.slice(0, 10) : 'Reciente'}
                    </span>
                  </div>
                  <Badge tone={config.tone}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <StatusIcon size={13} aria-hidden="true" />
                      {config.label}
                    </span>
                  </Badge>
                </div>

                <div className="card-body">
                  <div style={{ marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--violet-dark)', fontWeight: 600 }}>
                    Artista: {request.artistName || 'Artista ArtLink'}
                  </div>
                  <h2>{request.description}</h2>
                  <div className="card-financials" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <span><DollarSign size={14} aria-hidden="true" /> <strong>${request.budget} USD</strong></span>
                    <span>Fecha estimada: <strong>{request.desiredDate}</strong></span>
                    {request.references && request.references.length > 0 && (
                      <span className="references-count">{request.references.length} ref.</span>
                    )}
                  </div>
                </div>

                <div className="private-request-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    className="button button-outline button-small"
                    type="button"
                    onClick={() => setSelected(request)}
                  >
                    <Eye size={15} aria-hidden="true" /> Detalles
                  </button>
                  <Link
                    className="button button-primary button-small"
                    to={`/mensajes?requestId=${request.id}`}
                  >
                    <MessageCircle size={15} aria-hidden="true" /> Abrir Conversación
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Modal accesible de detalle completo */}
      <Modal open={Boolean(selected)} title="Detalle de la solicitud" onClose={() => setSelected(null)}>
        {selected && (
          <div className="request-modal-content">
            <div className="modal-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="request-id">Solicitud #{selected.id}</span>
              <Badge tone={STATUS_CONFIG[selected.status]?.tone || 'violet'}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  {STATUS_CONFIG[selected.status]?.icon && (
                    <span aria-hidden="true">
                      {(() => {
                        const Icon = STATUS_CONFIG[selected.status].icon
                        return <Icon size={13} />
                      })()}
                    </span>
                  )}
                  {STATUS_CONFIG[selected.status]?.label || selected.status}
                </span>
              </Badge>
            </div>

            <div className="modal-section" style={{ marginBottom: '1rem' }}>
              <h3>Descripción detallada del encargo</h3>
              <p className="description-box" style={{ background: 'rgba(30, 25, 43, 0.04)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.3rem' }}>
                {selected.description}
              </p>
            </div>

            <div className="modal-grid-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <strong>Presupuesto propuesto:</strong>
                <p className="price-highlight" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--violet-dark)' }}>
                  ${selected.budget} USD
                </p>
              </div>
              <div>
                <strong>Fecha acordada:</strong>
                <p>{selected.desiredDate}</p>
              </div>
            </div>

            {selected.references && selected.references.length > 0 && (
              <div className="modal-section" style={{ marginBottom: '1rem' }}>
                <h3>Previsualizaciones de referencias visuales</h3>
                <div className="references-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem', marginTop: '0.5rem' }}>
                  {selected.references.map((ref, idx) => (
                    <a
                      href={ref.startsWith('http') ? ref : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={idx}
                      style={{ display: 'block', borderRadius: '0.4rem', overflow: 'hidden', border: '1px solid #1E192B', height: '80px', background: '#FFF' }}
                    >
                      {ref.startsWith('http') || ref.startsWith('data:') ? (
                        <img src={ref} alt={`Previsualización referencia ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.75rem', padding: '0.3rem', textAlign: 'center' }}>
                          <ExternalLink size={14} /> {ref}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
