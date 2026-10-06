import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { SparkleStar } from './FloatingStars'

export default function Modal({ open, title, onClose, children }) {
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    previousFocusRef.current = document.activeElement
    
    // Enfocar inicialmente el botón de cerrar solo al abrirse
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current?.()
      }
      if (event.key !== 'Tab') return
      const focusable = event.currentTarget.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => { 
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus() 
    }
  }, [open])

  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => onCloseRef.current?.()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        {/* Estrellitas de esquina decorativas estilo scrapbook pastel */}
        <span className="floating-alert-decor decor-top-left" aria-hidden="true">
          <SparkleStar size={16} color="#F472B6" />
        </span>
        <span className="floating-alert-decor decor-top-right" aria-hidden="true">
          <SparkleStar size={18} color="#2DD4BF" />
        </span>

        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            ref={closeButtonRef}
            className="floating-alert-close-x modal-close-btn"
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Cerrar ventana"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
