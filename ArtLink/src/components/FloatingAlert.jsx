import { useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Info, Sparkles, X, Clock } from 'lucide-react'
import { SparkleStar } from './FloatingStars'

/**
 * FloatingAlert
 * Componente de alerta flotante sobre la página con fondo difuminado (backdrop blur).
 * Proporciona máxima visibilidad para acciones críticas: reseñas, propuestas y cambios de estado.
 */
export default function FloatingAlert({
  open = true,
  type = 'success',
  title = '',
  message = '',
  eyebrow = '',
  action = null,
  closeLabel = 'Entendido',
  onClose = () => {},
  autoCloseMs = null,
  children = null,
}) {
  const closeBtnRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement
    closeBtnRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !autoCloseMs || autoCloseMs <= 0) return undefined
    const timer = setTimeout(() => {
      onClose?.()
    }, autoCloseMs)
    return () => clearTimeout(timer)
  }, [open, autoCloseMs, onClose])

  if (!open) return null

  // Icono semántico sin emojis según el tipo
  const renderIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={32} className="floating-alert-icon icon-error" aria-hidden="true" />
      case 'info':
        return <Info size={32} className="floating-alert-icon icon-info" aria-hidden="true" />
      case 'status':
        return <Clock size={32} className="floating-alert-icon icon-status" aria-hidden="true" />
      case 'success':
      default:
        return <CheckCircle2 size={32} className="floating-alert-icon icon-success" aria-hidden="true" />
    }
  }

  const defaultEyebrow = () => {
    if (eyebrow) return eyebrow
    switch (type) {
      case 'error':
        return 'ArtLink / error'
      case 'info':
      case 'status':
        return 'ArtLink / actualización'
      case 'success':
      default:
        return 'ArtLink / confirmación'
    }
  }

  return (
    <div
      className="floating-alert-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className={`floating-alert-card floating-alert-${type}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="floating-alert-title"
        aria-describedby="floating-alert-message"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Estrellitas de esquina decorativas estilo scrapbook pastel */}
        <span className="floating-alert-decor decor-top-left" aria-hidden="true">
          <SparkleStar size={16} color={type === 'error' ? '#FDA4AF' : '#F472B6'} />
        </span>
        <span className="floating-alert-decor decor-top-right" aria-hidden="true">
          <SparkleStar size={18} color={type === 'error' ? '#FCA5A5' : '#2DD4BF'} />
        </span>

        {/* Botón X superior de cierre */}
        <button
          type="button"
          className="floating-alert-close-x"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Cabecera con icono badge */}
        <div className={`floating-alert-badge-wrap badge-type-${type}`}>
          {renderIcon()}
        </div>

        {/* Eyebrow descriptivo */}
        <p className="floating-alert-eyebrow">
          <Sparkles size={13} aria-hidden="true" />
          <span>{defaultEyebrow()}</span>
        </p>

        {/* Título y Mensaje */}
        {title && (
          <h2 id="floating-alert-title" className="floating-alert-title">
            {title}
          </h2>
        )}

        {message && (
          <p id="floating-alert-message" className="floating-alert-message">
            {message}
          </p>
        )}

        {/* Contenido adicional opcional */}
        {children && <div className="floating-alert-body">{children}</div>}

        {/* Acciones de cierre y navegación */}
        <div className="floating-alert-actions">
          {action && (
            <button
              type="button"
              className="button button-primary floating-alert-action-btn"
              onClick={() => {
                action.onClick?.()
                onClose?.()
              }}
            >
              {action.label}
            </button>
          )}

          <button
            ref={closeBtnRef}
            type="button"
            className={action ? 'button button-secondary floating-alert-close-btn' : 'button button-primary floating-alert-close-btn'}
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
