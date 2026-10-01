import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCheck,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  Plus,
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
import useAuth from '../hooks/useAuth'
import {
  addMessageToConversation,
  createNewConversation,
  formatChatMessage,
  getActiveConversation,
  saveLocalConversation,
  updateMessageInConversation,
} from '../services/chatPersistenceService'
import { sendMessageToChatbot } from '../services/n8nChatService'
import { checkN8nHealth } from '../services/n8nService'
import artieAvatar from '../assets/artie-avatar.png'

function getFormattedTime(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const INITIAL_WELCOME_CONTENT =
  '¡Hola, creador! Soy el Agente de IA oficial de ArtLink. Puedo ayudarte a explorar artistas, gestionar comisiones y responder dudas educativas sobre dibujo, modelado 3D, VTubers y teoría del arte.'

const INITIAL_SUGGESTIONS = [
  '¿Cómo solicito una comisión en ArtLink?',
  'Buscar artistas de modelado 3D o VTuber',
  '¿Qué es el cel shading en arte digital?',
]

const INITIAL_QUICK_REPLIES = [
  'Explorar artistas',
  'Cómo pedir comisión',
  'Teoría del color',
]

const QUICK_PROMPTS = [
  {
    id: 'commission',
    icon: FileText,
    text: '¿Cómo solicito una comisión?',
    styleClass: 'prompt-pill-pink',
  },
  {
    id: '3d',
    icon: Search,
    text: 'Buscar artistas de modelado 3D',
    styleClass: 'prompt-pill-mint',
  },
  {
    id: 'vtuber',
    icon: Sparkles,
    text: 'Buscar modelos VTuber',
    styleClass: 'prompt-pill-lavender',
  },
  {
    id: 'shading',
    icon: HelpCircle,
    text: '¿Qué es el cel shading?',
    styleClass: 'prompt-pill-yellow',
  },
]

export default function AssistantPanel({ onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id || 'guest'

  const closeButtonRef = useRef(null)
  const historyRef = useRef(null)
  const panelRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Estado de la conversación persistente
  const [conversation, setConversation] = useState(null)
  const [loadingConversation, setLoadingConversation] = useState(true)

  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const [lastFailedMessage, setLastFailedMessage] = useState(null)
  const [n8nAvailable, setN8nAvailable] = useState(true)

  // Estado de tamaño y posición de la ventana
  const [size, setSize] = useState({ width: 410, height: 590 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Cargar o inicializar la conversación activa para este usuario / invitado
  useEffect(() => {
    let active = true
    setLoadingConversation(true)

    getActiveConversation(userId, window.location?.pathname || '/')
      .then((convo) => {
        if (!active) return

        // Si la conversación viene completamente vacía, insertar mensaje inicial de bienvenida
        if (!convo.messages || convo.messages.length === 0) {
          const welcomeMsg = formatChatMessage({
            id: 'welcome',
            role: 'assistant',
            content: INITIAL_WELCOME_CONTENT,
            provider: 'system',
            status: 'sent',
            suggestions: INITIAL_SUGGESTIONS,
            quickReplies: INITIAL_QUICK_REPLIES,
          })
          const initialized = addMessageToConversation(convo, welcomeMsg)
          setConversation(initialized)
        } else {
          setConversation(convo)
        }
      })
      .catch((err) => {
        console.error('[AssistantPanel] Error al recuperar conversación:', err)
      })
      .finally(() => {
        if (active) setLoadingConversation(false)
      })

    return () => {
      active = false
    }
  }, [userId])

  // Verificar disponibilidad del webhook de N8N
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

  // Auto-scroll al final del historial al recibir mensajes o cambiar estados
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [conversation?.messages, thinking, error])

  // Atajo de teclado Escape para cerrar
  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Arrastrar la ventana desde el encabezado
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
      const minW = 290
      const maxW = Math.min(800, window.innerWidth - 20)
      const minH = 360
      const maxH = Math.min(900, window.innerHeight - 36)

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

  // Envío de mensaje con persistencia inmediata y actualización de estados
  async function handleSendText(text) {
    const trimmed = text.trim()
    if (!trimmed || thinking || !conversation) return

    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

    // 1. Guardar mensaje del usuario antes de llamar a Gemini con estado 'sending'
    const pendingUserMsg = formatChatMessage({
      id: userMessageId,
      role: 'user',
      content: trimmed,
      status: 'sending',
    })

    const withUserMsg = addMessageToConversation(conversation, pendingUserMsg)
    setConversation(withUserMsg)

    setInput('')
    setError('')
    setLastFailedMessage(null)
    setThinking(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    // Historial limitado a los últimos 10 turnos necesarios para el webhook
    const historyPayload = (withUserMsg.messages || [])
      .filter((m) => m.id !== 'welcome' && m.id !== userMessageId)
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }))

    try {
      // 2. Llamar al Agente Gemini a través de N8N
      const result = await sendMessageToChatbot({
        message: trimmed,
        sessionId: withUserMsg.id,
        conversationId: withUserMsg.id,
        userId: user?.id || 'guest',
        userName: user?.name || 'Creador',
        role: user?.role === 'artista' ? 'artist' : 'client',
        page: window.location?.pathname || '/',
        history: historyPayload,
        signal: controller.signal,
      })

      if (result.isFallback) {
        setN8nAvailable(false)
      } else {
        setN8nAvailable(true)
      }

      // Marcar mensaje del usuario como 'sent'
      const conversationWithUserSent = updateMessageInConversation(withUserMsg, userMessageId, {
        status: 'sent',
      })

      if (!result.success && !result.isFallback) {
        setError(result.message || 'Error al comunicarse con el Agente de IA.')
        setLastFailedMessage(trimmed)
        // Guardar error en la conversación
        const errorAssistantMsg = formatChatMessage({
          role: 'assistant',
          content: result.message || 'No se pudo obtener respuesta del Agente.',
          provider: 'local-fallback',
          status: 'error',
        })
        const updatedWithError = addMessageToConversation(conversationWithUserSent, errorAssistantMsg)
        setConversation(updatedWithError)
      } else {
        // 3. Guardar la respuesta exitosa de Gemini
        const assistantMsg = formatChatMessage({
          role: 'assistant',
          content: result.message,
          provider: result.provider || 'gemini',
          status: 'sent',
          intent: result.intent,
          suggestions: result.suggestions || [],
          quickReplies: result.quickReplies || [],
          actions: result.actions || [],
        })
        const updatedWithAssistant = addMessageToConversation(conversationWithUserSent, assistantMsg)
        setConversation(updatedWithAssistant)
      }
    } catch (requestError) {
      if (requestError.name === 'AbortError') {
        const cancelledMsg = formatChatMessage({
          role: 'assistant',
          content: 'Consulta cancelada por el usuario.',
          provider: 'system',
          status: 'sent',
        })
        const updatedCancelled = addMessageToConversation(withUserMsg, cancelledMsg)
        setConversation(updatedCancelled)
      } else {
        // 4. Guardar errores controlados
        setError(requestError.message || 'Ocurrió un error al conectar con el Asistente.')
        setLastFailedMessage(trimmed)
        const errorMsg = formatChatMessage({
          role: 'assistant',
          content: `Error al procesar: ${requestError.message}`,
          provider: 'local-fallback',
          status: 'error',
        })
        const updatedError = addMessageToConversation(withUserMsg, errorMsg)
        setConversation(updatedError)
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

  // Iniciar una conversación completamente nueva
  function handleNewConversation() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    const freshConvo = createNewConversation({
      userId,
      page: window.location?.pathname || '/',
    })
    const welcomeMsg = formatChatMessage({
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: INITIAL_WELCOME_CONTENT,
      provider: 'system',
      status: 'sent',
      suggestions: INITIAL_SUGGESTIONS,
      quickReplies: INITIAL_QUICK_REPLIES,
    })
    const initialized = addMessageToConversation(freshConvo, welcomeMsg)
    setConversation(initialized)
    setInput('')
    setError('')
    setLastFailedMessage(null)
    setThinking(false)
  }

  function handleExecuteAction(action) {
    if (!action) return

    if (action.type === 'open_artist_profile' && action.artistProfileId) {
      navigate(`/artista/${action.artistProfileId}`)
      onClose?.()
      return
    }

    if (action.type === 'open_commission' && action.artistProfileId) {
      const commParam = action.commissionId ? `&commissionId=${action.commissionId}` : ''
      navigate(`/solicitar-comision?artistId=${action.artistProfileId}${commParam}`)
      onClose?.()
      return
    }

    if (action.type === 'open_explore') {
      const params = new URLSearchParams()
      if (action.filters?.discipline) params.set('discipline', action.filters.discipline)
      if (action.filters?.style) params.set('style', action.filters.style)
      if (action.filters?.maxPrice) params.set('maxPrice', action.filters.maxPrice)
      navigate(`/explorar?${params.toString()}`)
      onClose?.()
      return
    }

    if (action.url) {
      navigate(action.url)
      onClose?.()
    }
  }

  function handleConfirmAction() {
    handleSendText('Sí, confirmo la acción para continuar.')
  }

  function submit(event) {
    event.preventDefault()
    handleSendText(input)
  }

  const messagesList = conversation?.messages || []

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
      {/* Tiradores para redimensionar */}
      <div className="resize-handle resize-top" onMouseDown={(e) => startResize(e, 'top')} />
      <div className="resize-handle resize-right" onMouseDown={(e) => startResize(e, 'right')} />
      <div className="resize-handle resize-bottom" onMouseDown={(e) => startResize(e, 'bottom')} />
      <div className="resize-handle resize-left" onMouseDown={(e) => startResize(e, 'left')} />
      <div className="resize-handle resize-top-left" onMouseDown={(e) => startResize(e, 'top-left')} />
      <div className="resize-handle resize-top-right" onMouseDown={(e) => startResize(e, 'top-right')} />
      <div className="resize-handle resize-bottom-left" onMouseDown={(e) => startResize(e, 'bottom-left')} />
      <div className="resize-handle resize-bottom-right" onMouseDown={(e) => startResize(e, 'bottom-right')} />

      {/* Encabezado arrastrable */}
      <header className="assistant-header-premium" onMouseDown={handleHeaderMouseDown}>
        <div className="artie-avatar-frame-wrap">
          <div className="artie-avatar-ring">
            <img src={artieAvatar} alt="ArtLink AI Agent" className="artie-avatar-img" />
          </div>
          <span
            className={`artie-status-ping ${n8nAvailable ? 'status-ping-online' : 'status-ping-fallback'}`}
            title={n8nAvailable ? 'Agente Gemini Conectado' : 'Modo local de respaldo'}
          />
        </div>

        <div className="assistant-header-meta">
          <div className="artie-name-badge-row">
            <h2 id="assistant-title" className="assistant-name-text">
              ArtLink AI
            </h2>
            <span className="artie-pro-pill">Agente</span>
          </div>
          <p className="artie-status-desc">
            {thinking ? 'Pensando y consultando datos...' : n8nAvailable ? 'En línea con Gemini' : 'Modo respaldo local'}
          </p>
        </div>

        <div className="assistant-header-controls">
          <button
            type="button"
            className="artie-ctrl-btn"
            onClick={handleNewConversation}
            title="Nueva conversación"
            aria-label="Nueva conversación"
          >
            <Plus size={15} aria-hidden="true" />
          </button>
          <button
            ref={closeButtonRef}
            type="button"
            className="artie-ctrl-btn artie-close-btn"
            onClick={onClose}
            title="Cerrar asistente"
            aria-label="Cerrar asistente"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Banner de aviso cuando N8N opera en contingencia */}
      {!n8nAvailable && (
        <div className="artie-health-warning" role="alert">
          <AlertCircle size={13} aria-hidden="true" />
          <span>El agente opera con respuestas locales de respaldo.</span>
        </div>
      )}

      {/* Historial de conversación */}
      <div ref={historyRef} className="artie-messages-viewport" tabIndex={0} aria-label="Historial de mensajes">
        {loadingConversation ? (
          <div className="artie-loading-box">
            <RefreshCw size={20} className="artie-spin-icon" />
            <p>Cargando historial guardado...</p>
          </div>
        ) : (
          messagesList.map((message) => {
            const isUser = message.role === 'user'

            return (
              <div
                key={message.id}
                className={`artie-chat-row ${isUser ? 'artie-row-user' : 'artie-row-assistant'} ${
                  message.isCancelled ? 'artie-row-cancelled' : ''
                }`}
              >
                {!isUser && (
                  <div className="artie-msg-avatar-mini" aria-hidden="true">
                    <img src={artieAvatar} alt="" />
                  </div>
                )}

                <div className="artie-msg-bubble-wrap">
                  <article className="artie-msg-bubble">
                    <p className="artie-msg-text">{message.content}</p>

                    {/* Sugerencias contextuales */}
                    {Array.isArray(message.suggestions) && message.suggestions.length > 0 && (
                      <ul className="artie-agent-suggestions-list">
                        {message.suggestions.map((sug, i) => (
                          <li key={i} className="artie-suggestion-item">
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Acciones sugeridas en la interfaz */}
                    {Array.isArray(message.actions) && message.actions.length > 0 && (
                      <div className="artie-agent-actions-group">
                        {message.actions.map((act, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="artie-agent-action-pill"
                            onClick={() => handleExecuteAction(act)}
                          >
                            <ExternalLink size={11} aria-hidden="true" />
                            <span>{act.label || 'Ver en ArtLink'}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Respuestas rápidas interactivas (Quick Replies) */}
                    {Array.isArray(message.quickReplies) && message.quickReplies.length > 0 && (
                      <div className="artie-agent-quick-replies-group">
                        {message.quickReplies.map((reply, ridx) => (
                          <button
                            key={ridx}
                            type="button"
                            className="artie-quick-reply-pill"
                            onClick={() => handleSendText(reply)}
                            disabled={thinking}
                          >
                            <span>{reply}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Confirmación de Seguridad */}
                    {message.requiresConfirmation && (
                      <div className="artie-agent-confirm-card">
                        <div className="artie-agent-confirm-title">
                          <ShieldCheck size={14} color="#059669" />
                          <strong>Confirmación de Seguridad ArtLink</strong>
                        </div>
                        <p className="artie-agent-confirm-prompt">
                          Esta acción requiere tu confirmación explícita para continuar.
                        </p>
                        <div className="artie-agent-confirm-btns">
                          <button
                            type="button"
                            className="artie-confirm-yes-btn"
                            onClick={handleConfirmAction}
                          >
                            <Check size={12} />
                            <span>Confirmar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </article>

                  <div className="artie-msg-time-row">
                    <span className="artie-msg-time">{getFormattedTime(message.createdAt)}</span>
                    {isUser && (
                      <span className="artie-msg-check">
                        {message.status === 'sending' ? (
                          <RefreshCw size={10} className="artie-spin-icon" title="Enviando..." />
                        ) : message.status === 'error' ? (
                          <AlertCircle size={10} color="#ef4444" title="Error en el envío" />
                        ) : (
                          <CheckCheck size={11} aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="artie-msg-avatar-mini artie-user-avatar" aria-hidden="true">
                    <User size={13} />
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Indicador de pensamiento */}
        {thinking && (
          <div className="artie-chat-row artie-row-assistant artie-thinking-row" aria-live="polite">
            <div className="artie-msg-avatar-mini" aria-hidden="true">
              <img src={artieAvatar} alt="" />
            </div>
            <div className="artie-thinking-bubble">
              <div className="artie-typing-dots">
                <span className="artie-dot dot-1" />
                <span className="artie-dot dot-2" />
                <span className="artie-dot dot-3" />
              </div>
              <span className="artie-thinking-label">Consultando datos con Gemini...</span>
              <button
                type="button"
                className="artie-cancel-btn"
                onClick={handleCancel}
                title="Detener respuesta"
              >
                <Square size={10} aria-hidden="true" />
                <span>Detener</span>
              </button>
            </div>
          </div>
        )}

        {/* Indicador de error recuperable */}
        {error && (
          <div className="artie-chat-row artie-row-assistant" role="alert">
            <div className="artie-error-banner">
              <AlertCircle size={14} className="artie-error-icon" aria-hidden="true" />
              <div className="artie-error-content">
                <p className="artie-error-text">{error}</p>
                {lastFailedMessage && (
                  <button type="button" className="artie-retry-btn" onClick={handleRetry}>
                    <RotateCcw size={12} aria-hidden="true" />
                    <span>Reintentar envío</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prompts Rápidos (solo si hay pocos mensajes) */}
      {messagesList.length <= 2 && !thinking && (
        <nav className="artie-quick-prompts-bar" aria-label="Sugerencias iniciales">
          {QUICK_PROMPTS.map((prompt) => {
            const Icon = prompt.icon
            return (
              <button
                key={prompt.id}
                type="button"
                className={`prompt-pill ${prompt.styleClass}`}
                onClick={() => handleSendText(prompt.text)}
              >
                <Icon size={12} aria-hidden="true" />
                <span>{prompt.text}</span>
              </button>
            )
          })}
        </nav>
      )}

      {/* Pie con formulario de envío */}
      <footer className="artie-composer-area">
        <form onSubmit={submit} className="artie-composer-form">
          <input
            type="text"
            className="artie-input-field"
            placeholder="Escribe tu mensaje a la IA..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={thinking}
            maxLength={2000}
            aria-label="Mensaje para el agente"
          />
          <button
            type="submit"
            className="artie-send-btn"
            disabled={!input.trim() || thinking}
            aria-label="Enviar mensaje"
          >
            <Send size={15} aria-hidden="true" />
          </button>
        </form>

        <div className="artie-security-notice">
          <Lock size={10} aria-hidden="true" />
          <span>Tus datos y comisiones están protegidos bajo custodia Escrow de ArtLink.</span>
        </div>
      </footer>
    </section>
  )
}
