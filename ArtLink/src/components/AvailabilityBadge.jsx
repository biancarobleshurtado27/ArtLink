import Badge from './Badge'

const labels = { open: 'Disponible', waitlist: 'Lista de espera', closed: 'Agenda cerrada' }

export default function AvailabilityBadge({ status }) {
  return <Badge tone={status}>{labels[status] || status}</Badge>
}
