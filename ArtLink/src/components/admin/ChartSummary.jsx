import { Info } from 'lucide-react'

/**
 * Componente accesible para mostrar resúmenes textuales de gráficas.
 * Cumple con WCAG asegurando que la información cuantitativa esté disponible
 * sin depender exclusivamente de estímulos visuales o colores.
 */
export default function ChartSummary({ text, extraNote, tag }) {
  if (!text) return null

  return (
    <div
      className="chart-accessible-summary"
      role="region"
      aria-label="Resumen accesible de datos"
    >
      <div className="summary-header">
        <span className="summary-label">
          <Info size={14} aria-hidden="true" />
          Resumen descriptivo
        </span>
        {tag && <span className="summary-tag">{tag}</span>}
      </div>
      <p className="summary-text">{text}</p>
      {extraNote && <p className="summary-note">{extraNote}</p>}
    </div>
  )
}
