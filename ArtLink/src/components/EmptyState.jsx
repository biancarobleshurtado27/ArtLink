import { Sparkles } from 'lucide-react'

export default function EmptyState({ title = 'Todavía no hay nada aquí', description = 'Vuelve pronto para descubrir novedades.' }) {
  return <div className="state-panel empty-state"><Sparkles size={28} aria-hidden="true" /><h2>{title}</h2><p>{description}</p></div>
}
