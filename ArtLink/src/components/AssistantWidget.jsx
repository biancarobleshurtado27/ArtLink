import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bot } from 'lucide-react'
import AssistantPanel from './AssistantPanel'

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  if (location.pathname.startsWith('/mensajes')) {
    return null
  }

  return (
    <>
      {open && (
        <div
          className="chatbot-backdrop-blur"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="assistant-widget">
        <button
          className="assistant-trigger"
          type="button"
          onClick={() => setOpen((visible) => !visible)}
          aria-expanded={open}
          aria-controls="assistant-panel"
          aria-label={open ? 'Cerrar Asistente ArtLink' : 'Abrir Asistente ArtLink'}
        >
          <Bot size={21} aria-hidden="true" />
          <span>Asistente ArtLink</span>
        </button>
        {open && (
          <div id="assistant-panel">
            <AssistantPanel onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  )
}
