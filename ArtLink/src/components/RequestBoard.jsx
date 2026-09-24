import { Eye, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import Button from './Button'
import Modal from './Modal'

const statuses = ['pending', 'in_review', 'accepted', 'in_progress', 'completed', 'rejected']
const labels = { pending: 'Pendiente', in_review: 'En revisión', accepted: 'Aceptada', in_progress: 'En progreso', completed: 'Completada', rejected: 'Rechazada' }

export default function RequestBoard({ requests, onStatusChange, busy }) {
  const [selected, setSelected] = useState(null)
  return <div className="request-board"><div className="request-table-wrap"><table className="request-table"><caption className="sr-only">Solicitudes recibidas</caption><thead><tr><th scope="col">Solicitud</th><th scope="col">Presupuesto</th><th scope="col">Fecha</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><th scope="row">{request.description.slice(0, 48)}{request.description.length > 48 ? '...' : ''}</th><td>${request.budget} USD</td><td>{request.desiredDate}</td><td><Badge tone={request.status === 'rejected' ? 'closed' : request.status === 'completed' ? 'mint' : 'violet'}>{labels[request.status] || request.status}</Badge></td><td><div className="request-actions"><Button variant="outline" className="icon-button" type="button" onClick={() => setSelected(request)} aria-label="Ver detalles de solicitud"><Eye size={16} aria-hidden="true" /></Button><label className="sr-only" htmlFor={`status-${request.id}`}>Cambiar estado</label><select id={`status-${request.id}`} value={request.status} disabled={busy} onChange={(event) => onStatusChange(request, event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{labels[status]}</option>)}</select><Link className="button button-secondary icon-button" to={`/mensajes?requestId=${request.id}`} aria-label="Abrir conversación"><MessageCircle size={16} aria-hidden="true" /></Link></div></td></tr>)}</tbody></table></div><Modal open={Boolean(selected)} title="Detalle de solicitud" onClose={() => setSelected(null)}>{selected && <div className="request-detail"><p>{selected.description}</p><strong>Presupuesto: ${selected.budget} USD</strong><p>Fecha deseada: {selected.desiredDate}</p>{selected.references?.length > 0 && <p>Referencias: {selected.references.join(', ')}</p>}</div>}</Modal></div>
}
