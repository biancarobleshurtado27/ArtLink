import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCheck,
  FileText,
  Lock,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  User,
  X,
} from 'lucide-react'
import { sendMessageToChatbot } from '../services/n8nChatService'
import { checkN8nHealth } from '../services/n8nService'
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
    '¡Hola, creador! Soy el Asistente de ArtLink con tecnología Gemini. ¿Buscas un ilustrador para tu proyecto, necesitas calcular el presupuesto de un encargo o resolver dudas sobre el sistema de custodia Escrow Shield?',
  time: `Hoy a las ${getFormattedTime()}`,
  provider: 'system',
}

const QUICK_PROMPTS = [
  {
    id: 'anime',
    icon: Search,
    text: 'Encontrar ilustradores de anime o manga',
    styleClass: 'prompt-pill-pink',
  },
  {
    id: 'escrow',
    icon: ShieldCheck,
    text: '¿Cómo funciona el pago seguro Escrow Shield?',
    styleClass: 'prompt-pill-mint',
  },
  {
    id: 'fast',
    icon: Sparkles,
    text: 'Artistas con comisiones abiertas y entrega rápida',
    styleClass: 'prompt-pill-lavender',
  },
  {
    id: 'brief',
    icon: FileText,
    text: '¿Cómo solicito una comisión y redacto el brief?',
    styleClass: 'prompt-pill-yellow',
  },
]

export default function AssistantPanel({ onClose }) {
  const closeButtonRef = useRef(null)
  const historyRef = useRef(null)
  const panelRef = useRef(null)
  const abortControllerRef = useRef(null)
  const conversationIdRef = useRef(`artlink-chat-${Date.now()}`)

  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const [lastFailedMessage, setLastFailedMessage] = useState(null)
  const [n8nAvailable, setN8nAvailable] = useState(true)

  // Estado de tamaño y posición de la ventana
  const [size, setSize] = useState({ width: 410, height: 590 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Verificar disponibilidad de N8N al montar
  useEffect(() => {
    let isMounted = true
    checkN8nHealth()
      .then((isHealthy) => {
        if (isMounted) setN8nAvailable(isHealthy)
      })
      .catch(() => {
        if (isMounted) setN8nAvailable(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

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

  // Redimensionar suavemente por los bordes y esquinas
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

      if (direction.includes('top')) {
        newH = Math.min(Math.max(minH, startH - deltaY), maxH)
      }

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
  }, [messages, thinking, error])

  // Envío del mensaje al webhook de N8N que conecta con Gemini
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
    setLastFailedMessage(null)
    setThinking(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    // Historial limitado a un máximo de 10 mensajes previos
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }))

    try {
      const result = await sendMessageToChatbot({
        message: trimmed,
        conversationId: conversationIdRef.current,
        history: historyPayload,
        signal: controller.signal,
      })

      if (result.isFallback) {
        setN8nAvailable(false)
      } else {
        setN8nAvailable(true)
      }

      if (!result.success && !result.isFallback) {
        setError(result.message || 'Error al comunicarse con el asistente de IA.')
        setLastFailedMessage(trimmed)
      } else {
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: result.message,
            provider: result.provider,
            model: result.model,
            isFallback: Boolean(result.isFallback),
            time: getFormattedTime(),
          },
        ])
      }
    } catch (requestError) {
      if (requestError.name === 'AbortError') {
        setMessages((current) => [
          ...current,
          {
            id: `assistant-cancelled-${Date.now()}`,
            role: 'assistant',
            content: 'Consulta cancelada por el usuario.',
            isCancelled: true,
            time: getFormattedTime(),
          },
        ])
      } else {
        setError(requestError.message || 'Ocurrió un error al conectar con el Asistente.')
        setLastFailedMessage(trimmed)
      }
    } finally {
      setThinking(false)
      abortControllerRef.current = null
    }
  }

  function handleCancel() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Cancelado por el usuario')
      abortControllerRef.current = null
    }
    setThinking(false)
  }

  function handleRetry() {
    if (lastFailedMessage) {
      const msg = lastFailedMessage
      setLastFailedMessage(null)
      setError('')
      handleSendText(msg)
    }
  }

  function submit(event) {
    event.preventDefault()
    handleSendText(input)
  }

  function handleReset() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    conversationIdRef.current = `artlink-chat-${Date.now()}`
    setMessages([
      {
        ...initialMessage,
        id: `welcome-${Date.now()}`,
        time: `Hoy a las ${getFormattedTime()}`,
      },
    ])
    setInput('')
    setError('')
    setLastFailedMessage(null)
    setThinking(false)
  }

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
      {/* ── ZONAS INVISIBLES DE REDIMENSIONAMIENTO ── */}
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

      {/* ── 1. ENCABEZADO SUPERIOR (Arrastrable) ── */}
      <header className="artie-chat-header" onMouseDown={handleHeaderMouseDown}>
        <div className="artie-brand-left">
          <div className="artie-avatar-box">
            <img src={artieAvatar} alt="Asistente de ArtLink" className="artie-avatar-img" />
            <span
              className={`artie-online-dot ${n8nAvailable ? 'is-active' : 'is-fallback'}`}
              aria-label={n8nAvailable ? 'N8N en línea' : 'Modo respaldo'}
            />
          </div>
          <div className="artie-brand-text">
            <div className="artie-title-row">
              <h2 id="assistant-title" className="artie-bot-name">
                Asistente de ArtLink
              </h2>
              <span className="artie-pill-badge">
                Gemini AI <Sparkles size={9} color="#7C3AED" aria-hidden="true" />
              </span>
            </div>
            <div className="artie-sub-text">
              <span className={`artie-status-pill ${n8nAvailable ? 'is-connected' : 'is-offline'}`}>
                <Radio size={9} aria-hidden="true" />
                {n8nAvailable ? 'N8N + Gemini en línea' : 'N8N no disponible (Respaldo local)'}
              </span>
            </div>
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
                  <img src={artieAvatar} alt="Asistente de ArtLink" className="artie-msg-avatar-img" />
                ) : (
                  <User size={13} />
                )}
              </div>

              <div className="artie-msg-bubble-wrap">
                <article className="artie-msg-bubble">
                  <p className="artie-msg-text">{message.content}</p>

                  {/* Distinción explícita de origen de la respuesta */}
                  {message.isFallback && (
                    <div className="artie-msg-fallback-tag">
                      <AlertCircle size={11} aria-hidden="true" />
                      <span>Respuesta local de respaldo; Gemini no está disponible.</span>
                    </div>
                  )}

                  {message.provider === 'gemini' && (
                    <div className="artie-msg-provider-tag">
                      <Sparkles size={10} aria-hidden="true" />
                      <span>Gemini ({message.model || 'Flash'}) vía N8N</span>
                    </div>
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

        {/* Sugerencias Rápidas */}
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
                  disabled={thinking}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span>{prompt.text}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Indicador de carga con botón de cancelación */}
        {thinking && (
          <div className="artie-message-row is-artie">
            <div className="artie-msg-avatar" aria-hidden="true">
              <img src={artieAvatar} alt="Procesando" className="artie-msg-avatar-img" />
            </div>
            <div className="artie-msg-bubble-wrap">
              <div className="artie-msg-bubble artie-thinking-bubble">
                <span className="artie-thinking-dot dot-1" />
                <span className="artie-thinking-dot dot-2" />
                <span className="artie-thinking-dot dot-3" />
                <span className="sr-only">Consultando a Gemini vía N8N...</span>
              </div>
              <div className="artie-thinking-cancel-row">
                <button
                  type="button"
                  className="artie-cancel-req-btn"
                  onClick={handleCancel}
                  title="Cancelar solicitud en curso"
                >
                  <Square size={10} aria-hidden="true" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error controlado con botón de reintento */}
        {error && (
          <div className="artie-error-card" role="alert">
            <div className="artie-error-header">
              <AlertCircle size={15} color="#DC2626" aria-hidden="true" />
              <strong>No se pudo completar la consulta</strong>
            </div>
            <p className="artie-error-desc">{error}</p>
            {lastFailedMessage && (
              <div className="artie-error-actions">
                <button
                  type="button"
                  className="artie-retry-action-btn"
                  onClick={handleRetry}
                  disabled={thinking}
                >
                  <RefreshCw size={12} aria-hidden="true" />
                  <span>Reintentar</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. CÁPSULA DE ENTRADA (Input directo + Botón Enviar) ── */}
      <form className="artie-input-form" onSubmit={submit}>
        <div className="artie-input-capsule">
          <label className="sr-only" htmlFor="artie-input-field">
            Escribe tu consulta sobre arte, creadores o comisiones
          </label>
          <input
            id="artie-input-field"
            className="artie-text-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              thinking
                ? 'Esperando respuesta de Gemini...'
                : 'Escribe tu consulta sobre arte, creadores o comisiones'
            }
            disabled={thinking}
            maxLength={2000}
          />

          {input.trim() && !thinking && (
            <button
              type="button"
              className="artie-clear-btn"
              onClick={() => setInput('')}
              aria-label="Limpiar campo"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}

          {thinking ? (
            <button
              type="button"
              className="artie-send-button artie-cancel-submit-btn"
              onClick={handleCancel}
              title="Cancelar solicitud"
            >
              <Square size={13} aria-hidden="true" />
              <span>Cancelar</span>
            </button>
          ) : (
            <button
              type="submit"
              className="artie-send-button"
              disabled={!input.trim()}
              aria-label="Enviar consulta"
            >
              <span>Enviar</span>
              <Send size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* ── 4. PIE DE PÁGINA DE SEGURIDAD ── */}
      <div className="artie-security-footnote">
        <Lock size={11} aria-hidden="true" />
        <span>Asistente oficial con Gemini. Las claves y llamadas se procesan de forma segura en N8N.</span>
      </div>
    </section>
  )
}
