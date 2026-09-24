import Badge from './Badge'
import { CheckCircle2, Clock3, LockKeyhole } from 'lucide-react'

const statuses = {
  open: { label: 'Abierto', icon: CheckCircle2 },
  waitlist: { label: 'Lista de espera', icon: Clock3 },
  closed: { label: 'Cerrado', icon: LockKeyhole },
}

export default function AvailabilityBadge({ status }) {
  const { label, icon: Icon } = statuses[status] || { label: status, icon: LockKeyhole }
  return <Badge tone={status}><Icon size={13} aria-hidden="true" /> {label}</Badge>
}
