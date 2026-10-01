import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children }) {
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button ref={closeButtonRef} className="icon-button" type="button" onClick={() => onCloseRef.current?.()} aria-label="Cerrar ventana">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
