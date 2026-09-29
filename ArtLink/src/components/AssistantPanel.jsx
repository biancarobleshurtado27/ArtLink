import { useEffect, useRef, useState } from 'react'
import {
  Check,
  CheckCheck,
  FileText,
  LoaderCircle,
  Lock,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { interpretNeed } from '../services/aiService'
import Button from './Button'
import DecorativeStar from './DecorativeStar'
import artieAvatar from '../assets/artie-avatar.png'

function getFormattedTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const initialMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola, creador! Soy Artie. ¿Buscas un ilustrador para tu proyecto, necesitas calcular el presupuesto de un encargo o resolver dudas sobre el sistema de custodia Escrow Shield?',
  time: `Hoy a las ${getFormattedTime()}`,
  mode: 'info',
}

const QUICK_PROMPTS = [
  {
    id: 'anime',
    icon: Search,
    text: 'Encontrar ilustradores de anime/manga',
    styleClass: 'prompt-pill-pink',
  },
  {
    id: 'escrow',
    icon: ShieldCheck,
    text: '¿Cómo funciona el pago seguro Escrow?',
    styleClass: 'prompt-pill-mint',
  },
  {
    id: 'fast',
    icon: Sparkles,
    text: 'Artistas con cupos abiertos y entrega rápida',
    styleClass: 'prompt-pill-lavender',
  },
  {
    id: 'brief',
    icon: FileText,
    text: 'Ayúdame a redactar el brief de mi encargo',
    styleClass: 'prompt-pill-yellow',
  },
]

export default function AssistantPanel({ onClose }) {
  const navigate = useNavigate()
  const closeButtonRef = useRef(null)
  const historyRef = useRef(null)
  const panelRef = useRef(null)

  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState(null)

  // Estado de tamaño y posición de la ventana
  const [size, setSize] = useState({ width: 410, height: 590 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Mover la ventana al arrastrar desde el encabezado
  function handleHeaderMouseDown(e) {
    if (e.target.closest('button')) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const initialX = position.x
    const initialY = position.y

    function onMouseMove(moveEvent) {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      setPosition({
        x: initialX + deltaX,
        y: initialY + deltaY,
      })
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Redimensionar suavemente por los bordes y esquinas (sin cuadros visibles)
  function startResize(e, direction) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startW = size.width
    const startH = size.height
    const startPosX = position.x
    const startPosY = position.y

    function onMouseMove(moveEvent) {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      const minW = 320
      const maxW = Math.min(800, window.innerWidth - 32)
      const minH = 380
      const maxH = Math.min(900, window.innerHeight - 40)

      let newW = startW
      let newH = startH
      let newX = startPosX
      let newY = startPosY

      // Cambio vertical desde borde superior
      if (direction.includes('top')) {
        newH = Math.min(Math.max(minH, startH - deltaY), maxH)
      }

      // Cambio horizontal desde borde izquierdo o derecho
      if (direction.includes('left')) {
        newW = Math.min(Math.max(minW, startW - deltaX), maxW)
      } else if (direction.includes('right')) {
        newW = Math.min(Math.max(minW, startW + deltaX), maxW)
        newX = startPosX + deltaX
      }

      setSize({ width: newW, height: newH })
      setPosition({ x: newX, y: newY })
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [messages, thinking])

  async function handleSendText(text) {
    const trimmed = text.trim()
    if (!trimmed || thinking) return

    const currentTime = getFormattedTime()
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        time: currentTime,
      },
    ])
    setInput('')
    setError('')
    setSuggestion(null)
    setThinking(true)

    try {
      const result = await interpretNeed(trimmed)
      setSuggestion(result)
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.summary,
          explanation: result.explanation,
          mode: result.mode,
          time: getFormattedTime(),
        },
      ])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setThinking(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    handleSendText(input)
  }

  function handleReset() {
    setMessages([
      {
        ...initialMessage,
        id: `welcome-${Date.now()}`,
        time: `Hoy a las ${getFormattedTime()}`,
      },
    ])
    setInput('')
    setError('')
    setSuggestion(null)
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

  const hasFilters =
    suggestion &&
    Object.values(suggestion.suggestedFilters).some((value) =>
      Array.isArray(value) ? value.length : value,
    )

  return (
    <section
      ref={panelRef}
      className="assistant-dialog chatbot-window"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* ── ZONAS INVISIBLES DE REDIMENSIONAMIENTO (Sin cuadros ni iconos) ── */}
      <div
        className="chatbot-edge-top"
        onMouseDown={(e) => startResize(e, 'top')}
        aria-hidden="true"
      />
      <div
        className="chatbot-edge-right"
        onMouseDown={(e) => startResize(e, 'right')}
        aria-hidden="true"
      />
      <div
        className="chatbot-edge-left"
        onMouseDown={(e) => startResize(e, 'left')}
        aria-hidden="true"
      />
      <div
        className="chatbot-corner-tr"
        onMouseDown={(e) => startResize(e, 'top-right')}
        aria-hidden="true"
      />
      <div
        className="chatbot-corner-tl"
        onMouseDown={(e) => startResize(e, 'top-left')}
        aria-hidden="true"
      />

      {/* ── 1. ENCABEZADO SUPERIOR (Arrastrable para mover la ventana) ── */}
      <header className="artie-chat-header" onMouseDown={handleHeaderMouseDown}>
        <div className="artie-brand-left">
          <div className="artie-avatar-box">
            <img src={artieAvatar} alt="Artie avatar" className="artie-avatar-img" />
            <span className="artie-online-dot" aria-label="Estado en línea" />
          </div>
          <div className="artie-brand-text">
            <div className="artie-title-row">
              <h2 id="assistant-title" className="artie-bot-name">
                Artie
              </h2>
              <span className="artie-pill-badge">
                AI Bot <DecorativeStar size={8} color="#7C3AED" />
              </span>
            </div>
            <span className="artie-sub-text">
              En línea • Búsqueda de arte & gestión de encargos
            </span>
          </div>
        </div>

        <div className="artie-header-actions">
          <button
            type="button"
            className="artie-icon-btn"
            onClick={handleReset}
            title="Reiniciar conversación"
            aria-label="Reiniciar conversación"
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
          <button
            ref={closeButtonRef}
            type="button"
            className="artie-icon-btn artie-close-btn"
            onClick={onClose}
            title="Cerrar asistente"
            aria-label="Cerrar asistente"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── 2. HISTORIAL DE MENSAJES & ACCIONES RÁPIDAS ── */}
      <div className="artie-chat-history" ref={historyRef} aria-live="polite">
        {messages.map((message) => {
          const isAssistant = message.role === 'assistant'
          return (
            <div
              key={message.id}
              className={`artie-message-row ${isAssistant ? 'is-artie' : 'is-user'}`}
            >
              <div className="artie-msg-avatar" aria-hidden="true">
                {isAssistant ? (
                  <img src={artieAvatar} alt="Artie" className="artie-msg-avatar-img" />
                ) : (
                  <User size={13} />
                )}
              </div>

              <div className="artie-msg-bubble-wrap">
                <article className="artie-msg-bubble">
                  <p className="artie-msg-text">{message.content}</p>
                  {message.explanation && (
                    <small className="artie-msg-explanation">{message.explanation}</small>
                  )}
                </article>

                <div className="artie-msg-meta">
                  <span>{message.time || getFormattedTime()}</span>
                  {!isAssistant && (
                    <CheckCheck size={13} className="artie-check-icon" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Sugerencias Rápidas / Pills si solo está el mensaje de bienvenida */}
        {messages.length === 1 && (
          <div className="artie-quick-prompts-group">
            {QUICK_PROMPTS.map((prompt) => {
              const Icon = prompt.icon
              return (
                <button
                  key={prompt.id}
                  type="button"
                  className={`artie-quick-prompt-pill ${prompt.styleClass}`}
                  onClick={() => handleSendText(prompt.text)}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span>{prompt.text}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Indicador de respuesta en curso */}
        {thinking && (
          <div className="artie-message-row is-artie">
            <div className="artie-msg-avatar" aria-hidden="true">
              <img src={artieAvatar} alt="Artie pensando" className="artie-msg-avatar-img" />
            </div>
            <div className="artie-msg-bubble-wrap">
              <div className="artie-msg-bubble artie-thinking-bubble">
                <span className="artie-thinking-dot dot-1" />
                <span className="artie-thinking-dot dot-2" />
                <span className="artie-thinking-dot dot-3" />
                <span className="sr-only">Artie está pensando...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de filtros sugeridos por la IA */}
        {suggestion && hasFilters && (
          <div className="artie-suggestion-card">
            <strong>Filtros sugeridos para tu búsqueda</strong>
            <div className="artie-filter-tags">
              {suggestion.suggestedFilters.disciplines.map((item) => (
                <span key={item}>{item}</span>
              ))}
              {suggestion.suggestedFilters.styles.map((item) => (
                <span key={item}>{item}</span>
              ))}
              {suggestion.suggestedFilters.maxPrice && (
                <span>Hasta ${suggestion.suggestedFilters.maxPrice}</span>
              )}
              {suggestion.suggestedFilters.availability && (
                <span>{suggestion.suggestedFilters.availability}</span>
              )}
            </div>
            <Button type="button" variant="secondary" onClick={applyFilters}>
              <Check size={14} aria-hidden="true" /> Ver artistas con estos filtros
            </Button>
          </div>
        )}

        {error && (
          <p className="form-message form-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* ── 3. CÁPSULA DE ENTRADA (Input directo + Botón Enviar) ── */}
      <form className="artie-input-form" onSubmit={submit}>
        <div className="artie-input-capsule">
          <label className="sr-only" htmlFor="artie-input-field">
            Escribe tu consulta sobre arte, creadores o presupuesto
          </label>
          <input
            id="artie-input-field"
            className="artie-text-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribe tu consulta sobre arte, creadores o presupuesto"
            disabled={thinking}
          />

          {input.trim() && (
            <button
              type="button"
              className="artie-clear-btn"
              onClick={() => setInput('')}
              aria-label="Limpiar campo"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            className="artie-send-button"
            disabled={thinking || !input.trim()}
            aria-label="Enviar consulta"
          >
            <span>Enviar</span>
            <Send size={14} aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* ── 4. PIE DE PÁGINA DE SEGURIDAD ── */}
      <div className="artie-security-footnote">
        <Lock size={11} aria-hidden="true" />
        <span>Artie te ayuda a encontrar creadores con transacciones 100% protegidas por Escrow Shield</span>
      </div>
    </section>
  )
}
