import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  ExternalLink,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { isAdminUser, sendAdminAiQuery } from '../../services/adminAiService'

const DEFAULT_WIDTH = 460
const MIN_WIDTH = 340
const MAX_WIDTH = 1100
const EXPANDED_WIDTH = 840


const INITIAL_WELCOME_MESSAGE = {
  id: 'admin-ai-welcome',
  role: 'assistant',
  content:
    'Hola, Administrador. Soy el asistente de análisis y navegación de ArtLink impulsado por Gemini. ' +
    'Puedo ayudarte a revisar métricas, detectar inconsistencias en el catálogo, analizar solicitudes en cola o preparar el resumen para la presentación académica.\n\n' +
    '¿Qué área del sistema deseas supervisar?',
  actions: [
    { label: 'Resumir Estado General', query: 'Resumir estado de la plataforma' },
    { label: 'Explicar Métricas', query: 'Explicar las métricas del dashboard' },
    { label: 'Detectar Inconsistencias', query: 'Detectar problemas o inconsistencias' },
    { label: 'Resumen para Presentación', query: 'Resumen para la presentación académica' },
  ],
  timestamp: new Date().toISOString(),
}

const QUICK_PROMPTS = [
  'Resumir estado general',
  'Explicar métricas del dashboard',
  'Detectar problemas o inconsistencias',
  'Analizar solicitudes pendientes',
  'Resumen para presentación académica',
  'Sugerir acciones administrativas',
]

export default function AdminAssistantDrawer({ open, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const threadEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Estado de ancho personalizable para agrandar o achicar la ventana
  const [drawerWidth, setDrawerWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('artlink_admin_ai_width')
      const parsed = saved ? parseInt(saved, 10) : null
      if (parsed && !isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        return parsed
      }
    } catch {
      // Ignorar fallos de localStorage en entornos restringidos
    }
    return DEFAULT_WIDTH
  })
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef({ startX: 0, startWidth: DEFAULT_WIDTH })

  // Guardar preferencia de ancho
  useEffect(() => {
    try {
      localStorage.setItem('artlink_admin_ai_width', String(drawerWidth))
    } catch {
      // Ignorar
    }
  }, [drawerWidth])

  const isEnlarged = drawerWidth >= 700

  // Alternar entre tamaño estándar y tamaño ampliado
  function handleToggleSize() {
    if (isEnlarged) {
      setDrawerWidth(DEFAULT_WIDTH)
    } else {
      const targetWidth = Math.min(EXPANDED_WIDTH, typeof window !== 'undefined' ? window.innerWidth - 40 : EXPANDED_WIDTH)
      setDrawerWidth(targetWidth)
    }
  }

  // Redimensionamiento mediante cursor (arrastrar borde izquierdo)
  function handleMouseDownResize(e) {
    e.preventDefault()
    resizeRef.current = {
      startX: e.clientX,
      startWidth: drawerWidth,
    }
    setIsResizing(true)
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    const handleMouseMove = (moveEvent) => {
      // Al estar anclado a la derecha, mover a la izquierda aumenta el ancho
      const deltaX = resizeRef.current.startX - moveEvent.clientX
      const calculatedWidth = resizeRef.current.startWidth + deltaX
      const maxAllowed = Math.min(MAX_WIDTH, typeof window !== 'undefined' ? window.innerWidth - 30 : MAX_WIDTH)
      const clamped = Math.max(MIN_WIDTH, Math.min(maxAllowed, calculatedWidth))
      setDrawerWidth(clamped)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (typeof document !== 'undefined') {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Soporte táctil para redimensionar en tablets
  function handleTouchStartResize(e) {
    if (!e.touches || e.touches.length === 0) return
    resizeRef.current = {
      startX: e.touches[0].clientX,
      startWidth: drawerWidth,
    }
    setIsResizing(true)

    const handleTouchMove = (moveEvent) => {
      if (!moveEvent.touches || moveEvent.touches.length === 0) return
      const deltaX = resizeRef.current.startX - moveEvent.touches[0].clientX
      const calculatedWidth = resizeRef.current.startWidth + deltaX
      const maxAllowed = Math.min(MAX_WIDTH, typeof window !== 'undefined' ? window.innerWidth - 20 : MAX_WIDTH)
      const clamped = Math.max(MIN_WIDTH, Math.min(maxAllowed, calculatedWidth))
      setDrawerWidth(clamped)
    }

    const handleTouchEnd = () => {
      setIsResizing(false)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }

    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
  }

  // Acceso exclusivo por rol: solo admin / administrator
  const hasAccess = isAdminUser(user)

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (open) {
      if (typeof threadEndRef.current?.scrollIntoView === 'function') {
        threadEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [messages, open])

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!hasAccess || !open) {
    return null
  }

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg = {
      id: `admin-usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setError(null)
    setLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const result = await sendAdminAiQuery({
        message: query,
        history: historyPayload,
        user,
        signal: controller.signal,
      })

      const botMsg = {
        id: `admin-ai-${Date.now()}`,
        role: 'assistant',
        content: result.message,
        actions: result.actions || [],
        quickReplies: result.quickReplies || [],
        provider: result.provider || 'gemini',
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      if (err.name === 'AbortError') return
      setError('No se pudo procesar la consulta con el agente de IA. Intenta nuevamente.')
      const fallbackMsg = {
        id: `admin-err-${Date.now()}`,
        role: 'assistant',
        content: 'Ocurrió un error al consultar el agente de IA. Por favor verifica que el servicio de N8N se encuentre en ejecución o intenta con otra consulta.',
        actions: [{ label: 'Ir al Dashboard', url: '/admin' }],
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  function handleReset() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setMessages([INITIAL_WELCOME_MESSAGE])
    setInput('')
    setError(null)
    setLoading(false)
  }

  function handleActionClick(action) {
    if (action.url) {
      navigate(action.url)
      onClose?.()
    } else if (action.query) {
      handleSend(action.query)
    }
  }

  return (
    <>
      {/* Fondo oscuro para cerrar en clic exterior */}
      <div
        className="admin-ai-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`admin-ai-drawer ${isResizing ? 'is-resizing' : ''} ${isEnlarged ? 'is-enlarged' : ''}`}
        style={{ width: `${drawerWidth}px` }}
        role="dialog"
        aria-modal="true"
        aria-label="Asistente de IA Administrativa"
      >
        {/* Tirador para arrastrar y agrandar/achicar */}
        <div
          className="admin-ai-resize-handle"
          onMouseDown={handleMouseDownResize}
          onTouchStart={handleTouchStartResize}
          title="Arrastra hacia la izquierda o derecha para cambiar el tamaño"
          aria-label="Arrastrar para redimensionar"
          role="separator"
          aria-orientation="vertical"
        >
          <div className="admin-ai-resize-grip" />
        </div>

        {/* Cabecera del Drawer */}
        <header className="admin-ai-header">
          <div className="admin-ai-title-wrap">
            <div className="admin-ai-avatar-ring">
              <Bot size={22} className="admin-ai-bot-icon" aria-hidden="true" />
            </div>
            <div className="admin-ai-headings">
              <div className="admin-ai-badge-row">
                <h2 className="admin-ai-main-title">Asistente IA</h2>
                <span className="admin-ai-tag-gemini">GEMINI · N8N</span>
              </div>
              <p className="admin-ai-subtitle">Consola de análisis y supervisión</p>
            </div>
          </div>

          <div className="admin-ai-header-btns">
            <button
              type="button"
              className="admin-ai-btn-icon"
              onClick={handleToggleSize}
              title={isEnlarged ? 'Achicar ventana (modo normal)' : 'Agrandar ventana (modo amplio)'}
              aria-label={isEnlarged ? 'Achicar ventana' : 'Agrandar ventana'}
            >
              {isEnlarged ? (
                <Minimize2 size={15} aria-hidden="true" />
              ) : (
                <Maximize2 size={15} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="admin-ai-btn-icon"
              onClick={handleReset}
              title="Reiniciar conversación"
              aria-label="Reiniciar conversación"
            >
              <RotateCcw size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="admin-ai-btn-icon admin-ai-btn-close"
              onClick={onClose}
              title="Cerrar panel de asistencia"
              aria-label="Cerrar panel de asistencia"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Banner de Regla de Seguridad */}
        <div className="admin-ai-security-banner" role="note">
          <ShieldAlert size={15} className="admin-ai-shield-icon" aria-hidden="true" />
          <span>
            <strong>Asistente consultivo:</strong> Analiza datos y sugiere rutas. No realiza cambios destructivos de forma automática.
          </span>
        </div>

        {/* Barra de Atajos Rápidos */}
        <div className="admin-ai-quick-strip" aria-label="Consultas predefinidas">
          <span className="admin-ai-quick-label">
            <Compass size={13} aria-hidden="true" /> Acciones rápidas:
          </span>
          <div className="admin-ai-quick-scroll">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="admin-ai-chip-btn"
                onClick={() => handleSend(prompt)}
                disabled={loading}
              >
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hilo de Mensajes */}
        <div className="admin-ai-chat-body" tabIndex={0} aria-live="polite">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant'
            return (
              <div
                key={msg.id}
                className={`admin-ai-msg-row ${isBot ? 'is-bot' : 'is-user'}`}
              >
                <div className="admin-ai-msg-avatar">
                  {isBot ? (
                    <Bot size={16} aria-hidden="true" />
                  ) : (
                    <User size={16} aria-hidden="true" />
                  )}
                </div>

                <div className="admin-ai-bubble-wrap">
                  <div className="admin-ai-bubble">
                    <div className="admin-ai-bubble-markdown">
                      {msg.content.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.startsWith('### ')) {
                          return (
                            <h3 key={pIdx} className="admin-ai-p-title">
                              {paragraph.replace('### ', '')}
                            </h3>
                          )
                        }
                        return (
                          <p key={pIdx} className="admin-ai-p">
                            {paragraph.split('\n').map((line, lIdx) => (
                              <span key={lIdx}>
                                {line}
                                {lIdx < paragraph.split('\n').length - 1 && <br />}
                              </span>
                            ))}
                          </p>
                        )
                      })}
                    </div>
                  </div>

                  {/* Acciones y Enlaces de Navegación Seguros */}
                  {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                    <div className="admin-ai-actions-row">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          className="admin-ai-action-btn"
                          onClick={() => handleActionClick(act)}
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={13} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Respuestas Rápidas Sugeridas */}
                  {Array.isArray(msg.quickReplies) && msg.quickReplies.length > 0 && (
                    <div className="admin-ai-replies-row">
                      {msg.quickReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          className="admin-ai-reply-pill"
                          onClick={() => handleSend(reply)}
                          disabled={loading}
                        >
                          <Sparkles size={11} aria-hidden="true" />
                          <span>{reply}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="admin-ai-msg-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="admin-ai-msg-row is-bot">
              <div className="admin-ai-msg-avatar">
                <Bot size={16} aria-hidden="true" />
              </div>
              <div className="admin-ai-bubble-wrap">
                <div className="admin-ai-bubble admin-ai-thinking-bubble">
                  <RefreshCw size={14} className="spin" aria-hidden="true" />
                  <span>Consultando agente Gemini y auditando plataforma...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="admin-ai-error-box">
              <AlertTriangle size={15} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Barra de Entrada de Texto */}
        <form
          className="admin-ai-input-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }}
        >
          <div className="admin-ai-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="admin-ai-text-field"
              placeholder="Pregunta sobre métricas, solicitudes, errores o presentación..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              aria-label="Mensaje para el Asistente IA Administrativo"
            />
            <button
              type="submit"
              className="admin-ai-send-btn"
              disabled={loading || !input.trim()}
              title="Enviar consulta"
              aria-label="Enviar consulta"
            >
              <Send size={15} aria-hidden="true" />
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
