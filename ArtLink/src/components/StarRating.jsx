import { Star } from 'lucide-react'

/**
 * Componente StarRating accesible para calificaciones por estrellas.
 * Soporta valor numérico, estrellas llenas/parciales/vacías y etiquetas accesibles (ARIA).
 */
export default function StarRating({
  value = 0,
  max = 5,
  size = 16,
  readOnly = true,
  label,
  className = '',
}) {
  const numericValue = Math.min(Math.max(Number(value) || 0, 0), max)
  const maxStars = Number(max) || 5
  const ariaText = label || `${numericValue.toFixed(1)} de ${maxStars} estrellas`

  const stars = Array.from({ length: maxStars }, (_, index) => {
    const starNumber = index + 1
    let fillPercent = 0

    if (numericValue >= starNumber) {
      fillPercent = 100
    } else if (numericValue > index) {
      fillPercent = Math.round((numericValue - index) * 100)
    }

    return { index, fillPercent }
  })

  return (
    <div
      className={`star-rating-container ${readOnly ? 'read-only' : 'interactive'} ${className}`}
      role={readOnly ? 'img' : 'group'}
      aria-label={ariaText}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
    >
      <div className="star-rating-stars" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }} aria-hidden="true">
        {stars.map(({ index, fillPercent }) => (
          <span
            key={index}
            className={`star-wrapper ${fillPercent === 100 ? 'full' : fillPercent > 0 ? 'partial' : 'empty'}`}
            style={{ width: size, height: size, display: 'inline-flex', position: 'relative', flexShrink: 0 }}
          >
            {/* Estrella de fondo / vacía */}
            <Star
              size={size}
              className="star-icon star-empty"
              fill="var(--star-empty-fill, rgba(139, 92, 246, 0.15))"
              stroke="var(--star-stroke, #8B5CF6)"
              strokeWidth={1.5}
            />

            {/* Capa de relleno parcial o total */}
            {fillPercent > 0 && (
              <span
                className="star-filled-clip"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${fillPercent}%`,
                  height: '100%',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  display: 'inline-flex',
                }}
              >
                <Star
                  size={size}
                  className="star-icon star-filled"
                  fill="var(--star-fill, #8B5CF6)"
                  stroke="var(--star-stroke, #8B5CF6)"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        ))}
      </div>
      <span className="star-rating-text-value" aria-hidden="true" style={{ fontSize: '0.85em', fontWeight: 700, marginLeft: '0.2rem' }}>
        {numericValue.toFixed(1)}
      </span>
      <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
        {ariaText}
      </span>
    </div>
  )
}
