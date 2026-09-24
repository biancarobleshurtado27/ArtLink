import { Bot, MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import Button from './Button'

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)

  return <div className="assistant-widget"><button className="assistant-trigger" type="button" onClick={() => setOpen((visible) => !visible)} aria-expanded={open} aria-controls="assistant-panel" aria-label={open ? 'Cerrar Asistente ArtLink' : 'Abrir Asistente ArtLink'}><Bot size={21} aria-hidden="true" /><span>Asistente ArtLink</span></button>{open && <div className="assistant-panel" id="assistant-panel" role="dialog" aria-labelledby="assistant-title"><div className="assistant-panel-header"><h2 id="assistant-title">Hola, soy Link ✦</h2><button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Cerrar asistente"><X size={18} aria-hidden="true" /></button></div><p>Te ayudaré a encontrar un estilo, artista o comisión para empezar.</p><Button variant="secondary" onClick={() => setOpen(false)}><MessageCircle size={16} aria-hidden="true" /> Próximamente</Button></div>}</div>
}
