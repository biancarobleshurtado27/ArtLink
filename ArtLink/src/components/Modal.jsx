import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><h2 id="modal-title">{title}</h2><button ref={closeButtonRef} className="icon-button" type="button" onClick={onClose} aria-label="Cerrar ventana"><X size={20} aria-hidden="true" /></button></div>
        {children}
      </section>
    </div>
  )
}
