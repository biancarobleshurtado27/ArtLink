import { useState } from 'react'
import { Eye, MessageCircle, Check, X, Calendar, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import Button from './Button'
import Modal from './Modal'

const statuses = ['pending', 'in_review', 'accepted', 'in_progress', 'completed', 'rejected']
const labels = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  rejected: 'Rechazada',
  waitlist: 'Lista de espera',
}

export default function RequestBoard({ requests, onStatusChange, busy }) {
  const [selected, setSelected] = useState(null)

  function getBadgeTone(status) {
    if (status === 'rejected') return 'closed'
    if (status === 'completed' || status === 'accepted') return 'mint'
    if (status === 'in_progress' || status === 'in_review') return 'violet'
    if (status === 'waitlist') return 'yellow'
    return 'violet'
  }

  return (
    <div className="request-board">
      <div className="request-table-wrap">
        <table className="request-table">
          <caption className="sr-only">Solicitudes recibidas de clientes</caption>
          <thead>
            <tr>
              <th scope="col">Solicitud / Idea</th>
              <th scope="col">Presupuesto</th>
              <th scope="col">Entrega deseada</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones rápidas</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const isPending = request.status === 'pending' || request.status === 'in_review' || request.status === 'waitlist'
              
              return (
                <tr key={request.id}>
                  <th scope="row">
                    <div className="request-cell-info">
                      <strong className="request-title-snippet">
                        {request.description.length > 55 ? `${request.description.slice(0, 55)}...` : request.description}
                      </strong>
                      <span className="request-id-sub">ID #{request.id.slice(-5)}</span>
                    </div>
                  </th>
                  <td>
                    <span className="price-tag">${request.budget} USD</span>
                  </td>
                  <td>
                    <span className="date-tag"><Calendar size={13} /> {request.desiredDate}</span>
                  </td>
                  <td>
                    <Badge tone={getBadgeTone(request.status)}>
                      {labels[request.status] || request.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="request-actions">
                      {/* Botón Aceptar rápido */}
                      {isPending && (
                        <button
                          className="button button-mint button-small"
                          type="button"
                          disabled={busy}
                          onClick={() => onStatusChange(request, 'accepted')}
                          title="Aceptar solicitud"
                        >
                          <Check size={14} aria-hidden="true" />
                          <span>Aceptar</span>
                        </button>
                      )}

                      {/* Botón Rechazar rápido */}
                      {isPending && (
                        <button
                          className="button button-outline button-small button-danger"
                          type="button"
                          disabled={busy}
                          onClick={() => onStatusChange(request, 'rejected')}
                          title="Rechazar solicitud"
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      )}

                      {/* Selector de estado */}
                      <label className="sr-only" htmlFor={`status-${request.id}`}>Cambiar estado</label>
                      <select
                        id={`status-${request.id}`}
                        value={request.status}
                        disabled={busy}
                        onChange={(event) => onStatusChange(request, event.target.value)}
                        className="status-selector"
                      >
                        {statuses.map((status) => (
                          <option value={status} key={status}>
                            {labels[status]}
                          </option>
                        ))}
                      </select>

                      {/* Ver detalles */}
                      <Button
                        variant="outline"
                        className="icon-button"
                        type="button"
                        onClick={() => setSelected(request)}
                        aria-label="Ver detalles completos de la solicitud"
                        title="Ver detalles"
                      >
                        <Eye size={15} aria-hidden="true" />
                      </Button>

                      {/* Enlace directo a chat */}
                      <Link
                        className="button button-secondary icon-button"
                        to={`/mensajes?requestId=${request.id}`}
                        aria-label="Abrir conversación en chat"
                        title="Abrir chat"
                      >
                        <MessageCircle size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      <Modal open={Boolean(selected)} title="Detalle de solicitud recibida" onClose={() => setSelected(null)}>
        {selected && (
          <div className="request-modal-content">
            <div className="modal-badge-row">
              <span className="request-id">ID #{selected.id}</span>
              <Badge tone={getBadgeTone(selected.status)}>
                {labels[selected.status] || selected.status}
              </Badge>
            </div>

            <div className="modal-section">
              <h3>Propuesta del cliente</h3>
              <p className="description-box">{selected.description}</p>
            </div>

            <div className="modal-grid-two">
              <div>
                <strong>Presupuesto ofrecido:</strong>
                <p className="price-highlight">${selected.budget} USD</p>
              </div>
              <div>
                <strong>Fecha estimada solicitada:</strong>
                <p>{selected.desiredDate}</p>
              </div>
            </div>

            {selected.references && selected.references.length > 0 && (
              <div className="modal-section">
                <h3>Referencias e inspiración proporcionadas</h3>
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
                <MessageCircle size={16} aria-hidden="true" /> Responder por Chat
              </Link>
              <button className="button button-outline" type="button" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

