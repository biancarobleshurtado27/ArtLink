import { useEffect, useRef, useState } from 'react'
import { Bot, Check, LoaderCircle, Send, Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { interpretNeed } from '../services/aiService'
import Button from './Button'

const initialMessage = { id: 'welcome', role: 'assistant', content: 'Cuéntame qué quieres crear y te ayudaré a convertirlo en filtros para explorar artistas.', mode: 'info' }

export default function AssistantPanel({ onClose }) {
  const navigate = useNavigate()
  const closeButtonRef = useRef(null)
  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function submit(event) {
    event.preventDefault()
    const text = input.trim()
    if (!text || thinking) return
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', content: text }])
    setInput('')
    setError('')
    setSuggestion(null)
    setThinking(true)
    try {
      const result = await interpretNeed(text)
      setSuggestion(result)
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: result.summary, explanation: result.explanation, mode: result.mode }])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setThinking(false)
    }
  }

  function applyFilters() {
    if (!suggestion) return
    const params = new URLSearchParams()
    const filters = suggestion.suggestedFilters
    if (filters.disciplines[0]) params.set('discipline', filters.disciplines[0])
    if (filters.styles[0]) params.set('style', filters.styles[0])
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.availability) params.set('availability', filters.availability)
    navigate(`/explorar?${params.toString()}`)
    onClose?.()
  }

  const hasFilters = suggestion && Object.values(suggestion.suggestedFilters).some((value) => Array.isArray(value) ? value.length : value)

  return (
    <section className="assistant-dialog" role="dialog" aria-modal="true" aria-labelledby="assistant-title">
      <header className="assistant-dialog-header"><div><Bot size={20} aria-hidden="true" /><div><h2 id="assistant-title">Asistente ArtLink</h2><span>Recomendaciones orientativas</span></div></div><button ref={closeButtonRef} className="icon-button" type="button" onClick={onClose} aria-label="Cerrar asistente"><X size={19} aria-hidden="true" /></button></header>
      <div className="assistant-history" aria-live="polite">{messages.map((message) => <article className={`assistant-message ${message.role}`} key={message.id}><span className="assistant-message-icon" aria-hidden="true">{message.role === 'assistant' ? <Sparkles size={14} /> : 'Tú'}</span><div><p>{message.content}</p>{message.explanation && <small>{message.explanation}</small>}</div></article>)}{thinking && <div className="assistant-message assistant"><span className="assistant-message-icon"><LoaderCircle className="spin" size={14} aria-hidden="true" /></span><p role="status">Pensando una sugerencia...</p></div>}</div>
      {suggestion && hasFilters && <div className="assistant-suggestion"><strong>Filtros sugeridos</strong><div className="assistant-filter-list">{suggestion.suggestedFilters.disciplines.map((item) => <span key={item}>{item}</span>)}{suggestion.suggestedFilters.styles.map((item) => <span key={item}>{item}</span>)}{suggestion.suggestedFilters.maxPrice && <span>Hasta ${suggestion.suggestedFilters.maxPrice}</span>}{suggestion.suggestedFilters.availability && <span>{suggestion.suggestedFilters.availability}</span>}</div><Button type="button" variant="secondary" onClick={applyFilters}><Check size={15} aria-hidden="true" /> Aplicar filtros</Button></div>}
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      <form className="assistant-input" onSubmit={submit}><label className="sr-only" htmlFor="assistant-input">Escribe tu necesidad</label><input id="assistant-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ej. Ilustración de fantasía, $80..." disabled={thinking} /><button type="submit" aria-label="Enviar consulta" disabled={thinking || !input.trim()}><Send size={17} aria-hidden="true" /></button></form>
      <p className="assistant-disclaimer">Las recomendaciones son orientativas y no realizan compras, reservas ni operaciones externas.</p>
    </section>
  )
}
