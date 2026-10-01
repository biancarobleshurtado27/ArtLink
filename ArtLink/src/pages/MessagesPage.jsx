import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Headphones,
  Lock,
  Maximize2,
  MoreVertical,
  Palette,
  Paperclip,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sliders,
  Smile,
  Sparkles,
  Star,
  User,
  Volume2,
  X,
  ZoomIn,
} from 'lucide-react'
import usePrivateRequests from '../hooks/usePrivateRequests'
import useAuth from '../hooks/useAuth'
import '../styles/chatPop.css'

const DEFAULT_CONVERSATIONS = [
  {
    id: 'convo-1082',
    orderId: '1082',
    artist: {
      name: 'Mía Soler',
      username: 'miasoler_art',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      rating: 5.0,
      reviewsCount: 148,
      verified: true,
      statusText: 'Activa ahora • Tiempo resp. <2h',
    },
    title: 'Ilustración Escénica Completa',
    subtitle: 'Twitch Banner Horizontal + OC con pose dinámica y fondo de neón pastel.',
    tag: 'Encargo #1082 • En progreso',
    tagColor: 'tag-cyan',
    unread: 1,
    time: '14:24',
    preview: '¡Hola! Acabo de subir el boceto d...',
    filterCategory: 'pending_sketch',
    type: 'orders',
    escrowAmount: 160.0,
    escrowDaysLeft: 7,
    escrowDeadline: '31 Oct',
    phase: 'FASE 2 DE 4: REVISIÓN DE BOCETO',
    milestones: [
      {
        id: 1,
        title: '1. Brief & Depósito',
        date: '18 Oct',
        desc: 'Depósito en custodia y especificaciones aprobadas.',
        status: 'done',
      },
      {
        id: 2,
        title: '2. Boceto & Composición',
        date: 'Hoy',
        desc: 'Boceto subido hoy. Esperando feedback del cliente.',
        status: 'current',
        badge: 'En revisión',
      },
      {
        id: 3,
        title: '3. Color & Sombreado',
        date: '',
        desc: 'Aplicación de paleta, luces volumétricas y efectos.',
        status: 'upcoming',
      },
      {
        id: 4,
        title: '4. Entrega de Archivos PSD/PNG',
        date: '',
        desc: 'Liberación final de pago por satisfacción.',
        status: 'upcoming',
      },
    ],
    files: [
      { id: 'f1', name: 'Ref_Chica_Bunny.jpg', img: '/images/hero/soramoon.jpg' },
      { id: 'f2', name: 'Paleta_Pastel.jpg', img: '/images/hero/thumbs/sora-1.jpg' },
      { id: 'f3', name: 'Concepto_Escena.jpg', img: '/images/hero/thumbs/sora-4.jpg' },
    ],
    messages: [
      {
        id: 'msg-1',
        sender: 'me',
        text: '¡Hola Mía! Te compartí las referencias de vestuario y la paleta pastel para el avatar de Twitch. ¿Pudiste revisarlas? Quedo atento a tus observaciones sobre las orejitas de conejo.',
        time: '11:15',
        status: 'read',
      },
      {
        id: 'msg-2',
        sender: 'artist',
        text: '¡Hola Alex! Sí, me encantaron los detalles de los destellos y la gama cromática. Ya armé la primera propuesta de composición y pose dinámica con el fondo en perspectiva.',
        time: '11:42',
      },
      {
        id: 'msg-3',
        type: 'wip_delivery',
        phaseTag: '✦ NUEVA ENTREGA FASE 2 ✦',
        versionTag: 'VERSIÓN 1.2',
        title: 'ENTREGA DE PROGRESO (WIP)',
        filename: 'v1.2_lineart_rough_composition.png',
        desc: 'Lineart limpio preliminar, distribución de elementos escénicos (pantalla, snacks flotantes y avatar central). Formato nativo 3840 x 2160 px.',
        img: '/images/wip_sketch.jpg',
        filesize: '14.8 MB',
        resolution: 'PNG de alta resolución',
        watermarkTitle: 'BOCETO FASE 2 • ARTIE ESCROW',
        watermarkSub: 'Solo previsualización de aprobación',
        adjustmentsLeft: 2,
        time: '11:43',
      },
    ],
  },
  {
    id: 'convo-1040',
    orderId: '1040',
    artist: {
      name: 'Renzo Miyazaki',
      username: 'renzomiyazaki',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      rating: 4.9,
      reviewsCount: 92,
      verified: true,
      statusText: 'Desconectado recientemente',
    },
    title: 'Modelo Live2D Chibi',
    subtitle: 'Rigging facial completo con expresiones para stream.',
    tag: 'Encargo #1040 • Finalizado',
    tagColor: 'tag-gray',
    unread: 0,
    time: 'Ayer',
    preview: 'Detalles de la entrega del modelo ...',
    filterCategory: 'active_orders',
    type: 'orders',
    escrowAmount: 220.0,
    escrowDaysLeft: 0,
    escrowDeadline: 'Finalizado',
    phase: 'FASE 4 DE 4: ENTREGADO Y LIBERADO',
    milestones: [
      { id: 1, title: '1. Brief', status: 'done', desc: 'Aprobado.' },
      { id: 2, title: '2. Modelo 2D', status: 'done', desc: 'Completado.' },
      { id: 3, title: '3. Rigging', status: 'done', desc: 'Completado.' },
      { id: 4, title: '4. Entrega', status: 'done', desc: 'Fondos liberados.' },
    ],
    files: [{ id: 'f4', name: 'Entrega_Final.zip', img: '/images/hero/magic_shop.jpg' }],
    messages: [
      { id: 'm-201', sender: 'artist', text: '¡Hola! Ya quedaron configuradas todas las físicas del cabello y los emotes.', time: 'Ayer 16:30' },
      { id: 'm-202', sender: 'me', text: '¡Quedó espectacular Renzo! Fondos liberados. Muchas gracias.', time: 'Ayer 17:15', status: 'read' },
    ],
  },
  {
    id: 'convo-artie',
    orderId: 'BOT-AI',
    isBot: true,
    artist: {
      name: 'Artie Assistant ♦',
      username: 'artie_ai',
      avatar: '/artie-avatar.png',
      isBot: true,
      statusText: 'Asistente IA de ArtLink • En línea 24/7',
    },
    title: 'Asistente de Cotizaciones y Brief',
    subtitle: 'Cálculo de presupuestos, recomendaciones de estilo y protección Escrow.',
    tag: 'Asistencia Cotización',
    tagColor: 'tag-pink',
    unread: 0,
    time: '2d',
    preview: 'Te ayudé a calcular el presupuesto ...',
    filterCategory: 'bot',
    type: 'direct',
    escrowAmount: 0.0,
    phase: 'ASISTENTE DE ORIENTACIÓN',
    milestones: [],
    files: [],
    messages: [
      {
        id: 'bot-1',
        sender: 'artist',
        text: '¡Hola! Soy Artie, tu asistente de ArtLink. Puedo orientarte en el cálculo de tarifas de mercado para comisiones de ilustración, modelado 3D o pixel art, y responder tus dudas sobre la custodia de fondos en Escrow.',
        time: 'Hace 2 días',
      },
    ],
  },
  {
    id: 'convo-sora',
    orderId: '1095',
    artist: {
      name: 'Sora Lin',
      username: 'soralin_art',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
      rating: 4.8,
      reviewsCount: 37,
      verified: true,
      statusText: 'Activa hace 15m',
    },
    title: 'Set de Emotes y Stickers para Discord',
    subtitle: '5 expresiones chibi personalizadas con fondo transparente.',
    tag: 'Cotización enviada',
    tagColor: 'tag-warm',
    unread: 0,
    time: '12 Oct',
    preview: '¿Te gustaría agregar stickers adici...',
    filterCategory: 'active_orders',
    type: 'direct',
    escrowAmount: 65.0,
    escrowDaysLeft: 12,
    escrowDeadline: '24 Oct',
    phase: 'FASE 1 DE 3: ACEPTACIÓN DE COTIZACIÓN',
    milestones: [
      { id: 1, title: '1. Cotización y Pago', status: 'current', desc: 'En espera de depósito en custodia.' },
      { id: 2, title: '2. Bocetos Chibi', status: 'upcoming', desc: '5 expresiones.' },
      { id: 3, title: '3. Exportación PNG', status: 'upcoming', desc: 'Archivos optimizados.' },
    ],
    files: [],
    messages: [
      { id: 's-1', sender: 'artist', text: '¡Hola Alex! Ya revisé tu pedido de emotes. ¿Te gustaría agregar stickers adicionales con expresiones de festejo?', time: '12 Oct 10:15' },
    ],
  },
  {
    id: 'convo-kaelen',
    orderId: '1077',
    artist: {
      name: 'Kaelen Woods',
      username: 'kaelenwoods',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      rating: 5.0,
      reviewsCount: 64,
      verified: true,
      statusText: 'En sesión de dibujo',
    },
    title: 'Splash Art Sci-Fi Ciberpunk',
    subtitle: 'Ilustración en perspectiva de una estación orbital.',
    tag: 'En espera',
    tagColor: 'tag-gray',
    unread: 0,
    time: '08 Oct',
    preview: 'Fondos recibidos en Escrow Shiel...',
    filterCategory: 'archived',
    type: 'orders',
    escrowAmount: 190.0,
    escrowDaysLeft: 5,
    escrowDeadline: '15 Oct',
    phase: 'FASE 3 DE 4: COLOR DIGITAL',
    milestones: [],
    files: [],
    messages: [
      { id: 'k-1', sender: 'artist', text: 'Fondos recibidos en Escrow Shield. Inicio la sesión de color hoy mismo.', time: '08 Oct 14:02' },
    ],
  },
]

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { requests } = usePrivateRequests()

  // State
  const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS)
  const [selectedConvoId, setSelectedConvoId] = useState(
    searchParams.get('requestId') || 'convo-1082'
  )
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'active', 'pending_sketch', 'bot', 'archived'
  const [channelType, setChannelType] = useState('orders') // 'direct', 'orders'
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [topSearch, setTopSearch] = useState('')
  const [messageInput, setMessageInput] = useState('')

  // Modals & Panels
  const [showBriefModal, setShowBriefModal] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState(1)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustText, setAdjustText] = useState('')
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false)
  const [showMediationModal, setShowMediationModal] = useState(false)
  const [showNewQueryModal, setShowNewQueryModal] = useState(false)
  const [showPalettePicker, setShowPalettePicker] = useState(false)
  const [selectedColors, setSelectedColors] = useState([])

  const threadEndRef = useRef(null)
  const topSearchInputRef = useRef(null)

  // Keyboard shortcut Ctrl+K listener for top search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        topSearchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-scroll when messages change
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, selectedConvoId])

  const activeConvo =
    conversations.find((c) => c.id === selectedConvoId) || conversations[0]

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Channel filter
    if (channelType === 'direct' && c.type !== 'direct') return false
    if (channelType === 'orders' && c.type !== 'orders' && c.id !== 'convo-artie') return false

    // Filter chip
    if (activeFilter === 'active' && c.filterCategory !== 'active_orders' && c.filterCategory !== 'pending_sketch') return false
    if (activeFilter === 'pending_sketch' && c.filterCategory !== 'pending_sketch') return false
    if (activeFilter === 'bot' && !c.isBot) return false
    if (activeFilter === 'archived' && c.filterCategory !== 'archived') return false

    // Search query
    const q = (sidebarSearch || topSearch).trim().toLowerCase()
    if (q) {
      const matchName = c.artist.name.toLowerCase().includes(q)
      const matchUser = c.artist.username.toLowerCase().includes(q)
      const matchTitle = c.title.toLowerCase().includes(q)
      const matchTag = c.tag.toLowerCase().includes(q)
      return matchName || matchUser || matchTitle || matchTag
    }
    return true
  })

  // Handle Send Message
  function handleSendMessage(e) {
    e?.preventDefault()
    if (!messageInput.trim()) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            preview: newMsg.text,
            time: 'Ahora',
          }
        }
        return c
      })
    )
    setMessageInput('')
  }

  // Handle Quick Reply Click
  function handleQuickReply(text) {
    if (text === 'Ver en pantalla completa') {
      setShowLightbox(true)
      return
    }
    setMessageInput(text)
  }

  // Handle Approve Lineart Milestone
  function handleApproveMilestone() {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          const updatedMilestones = c.milestones.map((m) => {
            if (m.id === 2) return { ...m, status: 'done', badge: 'Aprobado' }
            if (m.id === 3) return { ...m, status: 'current', badge: 'En progreso' }
            return m
          })

          const approvalNotice = {
            id: `msg-${Date.now()}`,
            sender: 'me',
            text: '¡Boceto de la Fase 2 aprobado con éxito! Se autorizó a Mía Soler a iniciar la etapa de Color & Sombreado bajo la protección del Escrow.',
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
          }

          return {
            ...c,
            phase: 'FASE 3 DE 4: COLOR & SOMBREADO',
            filterCategory: 'active_orders',
            milestones: updatedMilestones,
            messages: [...c.messages, approvalNotice],
          }
        }
        return c
      })
    )
    setShowApprovalConfirm(false)
  }

  // Handle Request Adjustments
  function handleSubmitAdjustments(e) {
    e.preventDefault()
    if (!adjustText.trim()) return

    const adjustMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: `Solicitud de Ajustes en Boceto: ${adjustText.trim()}`,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          return {
            ...c,
            messages: [...c.messages, adjustMsg],
          }
        }
        return c
      })
    )
    setAdjustText('')
    setShowAdjustModal(false)
  }

  return (
    <div className="chat-view-container">
      {/* ── 1. TOP HEADER & FILTER BAR ── */}
      <header className="chat-top-header">
        <div className="chat-header-row">
          <div className="chat-title-group">
            <h1 className="chat-main-title">Mensajes y Encargos Activos</h1>
            <span className="chat-count-badge">
              <Sparkles size={13} aria-hidden="true" />
              + 3 conversaciones activas
            </span>
          </div>

          <div className="chat-header-actions">
            <div className="chat-search-pill-box">
              <Search size={15} color="#6B7280" aria-hidden="true" />
              <input
                ref={topSearchInputRef}
                type="text"
                placeholder="Buscar en mensajes..."
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                aria-label="Buscar en mensajes"
              />
              <span className="chat-kbd-hint">Ctrl+K</span>
            </div>

            <button
              type="button"
              className="chat-btn-new-query"
              onClick={() => setShowNewQueryModal(true)}
            >
              <Plus size={16} aria-hidden="true" />
              Nueva Consulta
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="chat-filters-chips-bar" role="tablist" aria-label="Filtros de conversaciones">
          <button
            type="button"
            className={`chat-filter-chip ${activeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Todos ({conversations.length})
          </button>
          <button
            type="button"
            className={`chat-filter-chip ${activeFilter === 'active' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Encargos Activos (3)
          </button>
          <button
            type="button"
            className={`chat-filter-chip chip-mint ${activeFilter === 'pending_sketch' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('pending_sketch')}
          >
            Pendiente de Boceto (1)
          </button>
          <button
            type="button"
            className={`chat-filter-chip chip-pink ${activeFilter === 'bot' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('bot')}
          >
            <Bot size={13} aria-hidden="true" /> Artie AI Bot (1)
          </button>
          <button
            type="button"
            className={`chat-filter-chip chip-gray ${activeFilter === 'archived' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('archived')}
          >
            Archivados
          </button>
        </div>
      </header>

      {/* ── 2. THREE-COLUMN CHAT GRID ── */}
      <div className="chat-three-column-grid">
        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 1: BANDEJA (Conversations Sidebar)
            ══════════════════════════════════════════════════════════════════ */}
        <aside className="chat-column-box chat-col-sidebar" aria-label="Bandeja de conversaciones">
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-title-row">
              <span>Bandeja</span>
              <span className="chat-online-dot" title="En línea" />
            </div>

            <div className="chat-view-switch-capsule">
              <button
                type="button"
                className={`chat-switch-btn ${channelType === 'direct' ? 'is-active' : ''}`}
                onClick={() => setChannelType('direct')}
              >
                Directos
              </button>
              <button
                type="button"
                className={`chat-switch-btn ${channelType === 'orders' ? 'is-active' : ''}`}
                onClick={() => setChannelType('orders')}
              >
                Encargos
              </button>
            </div>
          </div>

          <div className="chat-sidebar-search-row">
            <div className="chat-sidebar-search-box">
              <Filter size={14} color="#6B7280" aria-hidden="true" />
              <input
                type="text"
                placeholder="Filtrar por artista o tag..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-conversations-scroll-list">
            {filteredConversations.map((item) => {
              const isSelected = item.id === activeConvo.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`chat-convo-item-btn ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedConvoId(item.id)}
                >
                  <div className="chat-avatar-wrapper">
                    <img
                      src={item.artist.avatar}
                      alt={item.artist.name}
                      className="chat-convo-avatar-img"
                    />
                    {item.isBot ? (
                      <span className="chat-avatar-bot-tag">BOT</span>
                    ) : (
                      <span className="chat-avatar-badge-dot" />
                    )}
                  </div>

                  <div className="chat-convo-info-col">
                    <div className="chat-convo-top-row">
                      <div className="chat-convo-name-group">
                        <span>{item.artist.name}</span>
                        {item.artist.verified && (
                          <Check size={14} color="#8B5CF6" aria-label="Artista verificado" />
                        )}
                      </div>
                      <span className="chat-convo-time">{item.time}</span>
                    </div>

                    <p className="chat-convo-preview-msg">{item.preview}</p>

                    <div className="chat-convo-bottom-row">
                      <span className={`chat-convo-tag ${item.tagColor || 'tag-gray'}`}>
                        {item.tag}
                      </span>
                      {item.unread > 0 && (
                        <span className="chat-unread-count-pill">{item.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <footer className="chat-sidebar-footer">
            <div className="chat-socket-indicator">
              <span className="chat-online-dot" />
              <span>Sincronizado vía Socket ArtLink</span>
            </div>
            <button
              type="button"
              className="chat-tool-btn"
              title="Configuración de socket"
              onClick={() => setActiveFilter('all')}
            >
              <Sliders size={14} aria-hidden="true" />
            </button>
          </footer>
        </aside>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 2: CHAT PANEL (Thread, WIP Card, Actions)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="chat-column-box chat-col-center" aria-label="Hilo de conversación">
          {/* Header */}
          <header className="chat-center-header">
            <div className="chat-active-artist-info">
              <div className="chat-avatar-wrapper">
                <img
                  src={activeConvo.artist.avatar}
                  alt={activeConvo.artist.name}
                  className="chat-active-artist-avatar"
                />
                <span className="chat-avatar-badge-dot" />
              </div>

              <div className="chat-artist-titles">
                <div className="chat-artist-name-line">
                  <strong>{activeConvo.artist.name}</strong>
                  <span className="chat-artist-handle-light">@{activeConvo.artist.username}</span>
                  {activeConvo.artist.rating && (
                    <span className="chat-rating-pill">
                      <Star size={11} fill="#F59E0B" color="#F59E0B" /> {activeConvo.artist.rating} ({activeConvo.artist.reviewsCount})
                    </span>
                  )}
                </div>
                <span className="chat-artist-substatus">
                  <span className="chat-online-dot" style={{ width: 7, height: 7 }} />
                  {activeConvo.artist.statusText || 'En línea'}
                </span>
              </div>
            </div>

            <div className="chat-center-header-actions">
              <button
                type="button"
                className="chat-btn-header-action"
                onClick={() => setShowBriefModal(true)}
              >
                <FileText size={14} aria-hidden="true" />
                Ver Brief
              </button>
              <button
                type="button"
                className="chat-btn-header-action"
                onClick={() => setShowVoiceModal(true)}
              >
                <Headphones size={14} aria-hidden="true" />
                Revisión Voz
              </button>
              <button
                type="button"
                className="chat-btn-header-action"
                style={{ padding: '0.4rem 0.5rem' }}
                title="Más opciones"
                onClick={() => setShowMediationModal(true)}
              >
                <MoreVertical size={16} aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Escrow Shield Banner */}
          <div className="chat-escrow-shield-banner">
            <div className="chat-shield-text-wrap">
              <ShieldCheck size={18} color="#0F766E" aria-hidden="true" />
              <span>
                <strong>✦ ArtLink Escrow Shield activo:</strong> Tu pago de{' '}
                <strong>${activeConvo.escrowAmount?.toFixed(2) || '160.00'} USD</strong> está protegido en custodia.
                Nunca compartas datos bancarios externos.
              </span>
            </div>
            <button
              type="button"
              className="chat-shield-btn-details"
              onClick={() => setShowMediationModal(true)}
            >
              Detalles
            </button>
          </div>

          {/* Thread messages area */}
          <div className="chat-thread-scroll-box">
            <div className="chat-date-separator">
              <span className="chat-date-pill">Hoy, 24 de Octubre</span>
            </div>

            {activeConvo.messages.map((msg) => {
              if (msg.type === 'wip_delivery') {
                return (
                  <article key={msg.id} className="chat-wip-card-box">
                    <div className="chat-wip-card-header">
                      <div className="chat-wip-badge-row">
                        <span className="chat-wip-tag-phase">{msg.phaseTag}</span>
                        <span className="chat-wip-tag-version">{msg.versionTag}</span>
                      </div>
                      <div className="chat-wip-header-titles">
                        <h3 className="chat-wip-title-main">{msg.filename}</h3>
                        <p className="chat-wip-desc-text">{msg.desc}</p>
                      </div>
                    </div>

                    <div className="chat-wip-img-wrapper">
                      <img src={msg.img} alt={msg.filename} className="chat-wip-img" />
                      <div className="chat-wip-watermark-overlay">
                        <span className="chat-wip-watermark-title">{msg.watermarkTitle}</span>
                        <span className="chat-wip-watermark-sub">{msg.watermarkSub}</span>
                      </div>
                      <button
                        type="button"
                        className="chat-wip-expand-btn"
                        title="Ver en pantalla completa"
                        onClick={() => setShowLightbox(true)}
                      >
                        <Maximize2 size={16} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="chat-wip-meta-bar">
                      <span>{msg.resolution} • {msg.filesize}</span>
                      <button
                        type="button"
                        className="chat-wip-download-link"
                        onClick={() => setShowLightbox(true)}
                      >
                        <Download size={12} style={{ display: 'inline', marginRight: 3 }} />
                        Descargar con marca de agua
                      </button>
                    </div>

                    <div className="chat-wip-actions-row">
                      <button
                        type="button"
                        className="chat-btn-approve-wip"
                        onClick={() => setShowApprovalConfirm(true)}
                      >
                        <Check size={18} aria-hidden="true" />
                        Aprobar Boceto y Pasar a Color
                      </button>
                      <button
                        type="button"
                        className="chat-btn-adjust-wip"
                        onClick={() => setShowAdjustModal(true)}
                      >
                        <Sliders size={16} aria-hidden="true" />
                        Solicitar Ajustes ({msg.adjustmentsLeft || 2} libres)
                      </button>
                    </div>
                  </article>
                )
              }

              if (msg.sender === 'me') {
                return (
                  <div key={msg.id} className="chat-bubble-outgoing-wrap">
                    <div className="chat-bubble-purple">
                      {msg.text}
                    </div>
                    <div className="chat-msg-time-out">
                      <span>{msg.time}</span>
                      <CheckCheck size={14} color="#8B5CF6" aria-hidden="true" />
                    </div>
                  </div>
                )
              }

              return (
                <div key={msg.id} className="chat-bubble-incoming-wrap">
                  <div className="chat-bubble-white">
                    {msg.text}
                  </div>
                  <div className="chat-msg-time-in">
                    <span>{msg.time}</span>
                  </div>
                </div>
              )
            })}
            <div ref={threadEndRef} />
          </div>

          {/* Quick Replies Row */}
          <div className="chat-quick-replies-bar">
            <span>Respuestas rápidas:</span>
            <button
              type="button"
              className="chat-quick-pill pill-pink"
              onClick={() => handleQuickReply('¡Me encanta, aprobado!')}
            >
              <Sparkles size={12} style={{ display: 'inline', marginRight: 3 }} />
              ¡Me encanta, aprobado!
            </button>
            <button
              type="button"
              className="chat-quick-pill"
              onClick={() => handleQuickReply('Por favor ajustar color de ojos a tono violeta neón')}
            >
              <Palette size={12} style={{ display: 'inline', marginRight: 3 }} />
              Ajustar color de ojos
            </button>
            <button
              type="button"
              className="chat-quick-pill"
              onClick={() => setShowLightbox(true)}
            >
              <Eye size={12} style={{ display: 'inline', marginRight: 3 }} />
              Ver en pantalla completa
            </button>
          </div>

          {/* Input Box Card */}
          <div className="chat-input-outer-box">
            <form onSubmit={handleSendMessage} className="chat-input-card">
              <textarea
                className="chat-textarea-field"
                placeholder={`Escribe tu mensaje a ${activeConvo.artist.name}... (puedes arrastrar archivos directamente aquí)`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />

              <div className="chat-input-toolbar-row">
                <div className="chat-input-tools-left">
                  <button
                    type="button"
                    className="chat-tool-btn"
                    title="Adjuntar referencia o archivo"
                    onClick={() => setMessageInput((prev) => prev + ' [Archivo adjunto: referencia_paleta.png]')}
                  >
                    <Paperclip size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="chat-tool-btn"
                    title="Insertar emoji o reacción"
                    onClick={() => setMessageInput((prev) => prev + ' ✨ ')}
                  >
                    <Smile size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="chat-tool-btn"
                    title="Paleta de colores del encargo"
                    onClick={() => setShowPalettePicker((prev) => !prev)}
                  >
                    <Palette size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="chat-tool-btn"
                    title="Anotar sobre el boceto"
                    onClick={() => setShowLightbox(true)}
                  >
                    <Edit3 size={16} aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="submit"
                  className="chat-btn-send-main"
                  disabled={!messageInput.trim()}
                >
                  <span>Enviar</span>
                  <Send size={15} aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* Floating Palette Tool */}
            {showPalettePicker && (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '2px solid #1E192B',
                  borderRadius: 8,
                  padding: '0.65rem 0.85rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '2px 2px 0 #1E192B',
                  fontSize: '0.8rem',
                }}
              >
                <strong>Paleta pastel:</strong>
                {[
                  { name: 'Rosa Neón', color: '#F472B6' },
                  { name: 'Lila Mágico', color: '#C084FC' },
                  { name: 'Menta Pastel', color: '#A7F3D0' },
                  { name: 'Sol Suave', color: '#FEF08A' },
                ].map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => {
                      setMessageInput((prev) => `${prev} [Color ${swatch.name}: ${swatch.color}] `)
                      setShowPalettePicker(false)
                    }}
                    style={{
                      background: swatch.color,
                      border: '1.5px solid #1E192B',
                      borderRadius: 4,
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {swatch.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 3: DETALLES DEL ENCARGO (Sidebar Right)
            ══════════════════════════════════════════════════════════════════ */}
        <aside className="chat-column-box chat-col-details" aria-label="Detalles del encargo">
          <div className="chat-details-header-row">
            <span className="chat-details-heading-label">Detalles del Encargo</span>
            <span className="chat-order-id-pill">#{activeConvo.orderId}</span>
          </div>

          <div className="chat-phase-tag-banner">
            {activeConvo.phase || 'FASE 2 DE 4: REVISIÓN DE BOCETO'}
          </div>

          <div className="chat-order-title-block">
            <h3>{activeConvo.title}</h3>
            <p>{activeConvo.subtitle}</p>
          </div>

          {/* Financial Escrow Box */}
          <div className="chat-financial-escrow-box">
            <div className="chat-financial-top-line">
              <span className="chat-escrow-label">Precio Total (Escrow)</span>
              <span className="chat-escrow-status-pill">Protegido 100%</span>
            </div>
            <div className="chat-financial-amount-row">
              <span className="chat-escrow-total-amount">
                ${activeConvo.escrowAmount?.toFixed(2) || '160.00'} USD
              </span>
              <span className="chat-escrow-time-rest">
                {activeConvo.escrowDeadline} ({activeConvo.escrowDaysLeft || 7} días rest.)
              </span>
            </div>
          </div>

          {/* Milestones timeline */}
          <div className="chat-milestones-block">
            <h4 className="chat-milestones-title">Hitos del Proyecto</h4>

            <div className="chat-milestones-list">
              {(activeConvo.milestones || []).map((m) => {
                const isDone = m.status === 'done'
                const isCurrent = m.status === 'current'
                return (
                  <div key={m.id} className="chat-milestone-step-item">
                    <span
                      className={`chat-step-indicator-circle ${
                        isDone ? 'is-done' : isCurrent ? 'is-current' : ''
                      }`}
                    >
                      {isDone ? <Check size={11} /> : m.id}
                    </span>

                    <div className="chat-milestone-name-row">
                      <span>{m.title}</span>
                      {m.badge && (
                        <span className="chat-milestone-state-badge">{m.badge}</span>
                      )}
                      {m.date && <span className="chat-milestone-date-tag">{m.date}</span>}
                    </div>

                    <p className="chat-milestone-subinfo">{m.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="chat-details-actions-group">
            <button
              type="button"
              className="chat-btn-action-disabled"
              disabled
              title="El pago se libera automáticamente tras la entrega final aprobada"
            >
              <Lock size={14} aria-hidden="true" />
              Liberar Pago Anticipado (Bloqueado)
            </button>

            <button
              type="button"
              className="chat-btn-action-white"
              onClick={() => setShowBriefModal(true)}
            >
              <Calendar size={14} aria-hidden="true" />
              Extender Plazo / Modificar Brief
            </button>

            <button
              type="button"
              className="chat-link-mediation-warning"
              onClick={() => setShowMediationModal(true)}
            >
              <AlertTriangle size={13} aria-hidden="true" />
              ¿Problemas? Solicitar Mediación ArtLink
            </button>
          </div>

          {/* Files section */}
          <div className="chat-files-attached-card">
            <div className="chat-files-top-line">
              <span className="chat-files-title">
                Archivos del Encargo ({activeConvo.files?.length || 3})
              </span>
              <button
                type="button"
                className="chat-link-see-all"
                onClick={() => setShowLightbox(true)}
              >
                Ver todo
              </button>
            </div>

            <div className="chat-files-thumbs-grid">
              {(activeConvo.files || []).map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className="chat-file-thumb-btn"
                  onClick={() => setShowLightbox(true)}
                  title={file.name}
                >
                  <img src={file.img} alt={file.name} />
                </button>
              ))}
            </div>

            <div className="chat-files-security-badge">
              <ShieldCheck size={16} color="#0F766E" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Archivos originales respaldados con hash criptográfico SHA-256 para verificación de entrega.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODALS & FUNCTIONALITIES
          ══════════════════════════════════════════════════════════════════ */}

      {/* 1. Modal Ver Brief */}
      {showBriefModal && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal-window">
            <div className="chat-modal-header">
              <h3>Brief del Encargo #{activeConvo.orderId}</h3>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => setShowBriefModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-modal-body">
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#1E192B' }}>
                  {activeConvo.title}
                </strong>
                <p style={{ margin: '0.2rem 0', color: '#4B5563' }}>{activeConvo.subtitle}</p>
              </div>

              <div style={{ background: '#F9FAFB', border: '1.5px solid #1E192B', borderRadius: 8, padding: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div><strong>Presupuesto:</strong> ${activeConvo.escrowAmount?.toFixed(2)} USD</div>
                  <div><strong>Fecha límite:</strong> {activeConvo.escrowDeadline || '31 Octubre'}</div>
                  <div><strong>Resolución:</strong> 3840 x 2160 px (4K)</div>
                  <div><strong>Uso:</strong> Comercial (Streaming)</div>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>
                  Paleta de Color Solicitada:
                </strong>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { label: 'Rosa Neón', code: '#F472B6' },
                    { label: 'Lila Mágico', code: '#C084FC' },
                    { label: 'Menta Pastel', code: '#A7F3D0' },
                    { label: 'Sol Suave', code: '#FEF08A' },
                  ].map((p) => (
                    <span
                      key={p.code}
                      style={{
                        background: p.code,
                        border: '1px solid #1E192B',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                Este brief formal rige los términos de entrega de la obra. Todas las revisiones se cotejan con estos requerimientos iniciales.
              </p>
            </div>

            <div className="chat-modal-footer">
              <button
                type="button"
                className="chat-btn-action-white"
                onClick={() => setShowBriefModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Revisión Voz */}
      {showVoiceModal && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal-window">
            <div className="chat-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Headphones size={18} color="#8B5CF6" />
                <h3>Nota de Voz de Mía Soler</h3>
              </div>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => {
                  setShowVoiceModal(false)
                  setIsPlayingAudio(false)
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-modal-body">
              <p style={{ margin: 0, color: '#4B5563' }}>
                Mía adjuntó un comentario en audio explicando la perspectiva del lineart y la distribución de los snacks flotantes:
              </p>

              <div className="chat-audio-wave-player">
                <button
                  type="button"
                  className="chat-audio-play-btn"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                >
                  {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
                </button>

                <div className="chat-audio-wave-bars">
                  {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 75, 35, 85, 65, 90, 55, 70, 40].map(
                    (val, idx) => (
                      <div
                        key={idx}
                        className={`chat-wave-bar ${idx < 8 ? 'is-played' : ''} ${
                          isPlayingAudio ? 'animating' : ''
                        }`}
                        style={{ height: `${val}%`, animationDelay: `${idx * 0.05}s` }}
                      />
                    )
                  )}
                </div>

                <span className="chat-audio-time-label">
                  {isPlayingAudio ? '0:24 / 0:42' : '0:42'}
                </span>

                <button
                  type="button"
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #1E192B',
                    borderRadius: 4,
                    padding: '0.2rem 0.45rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={() => setAudioPlaybackSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
                >
                  {audioPlaybackSpeed}x
                </button>
              </div>

              <div style={{ background: '#FFFDF8', border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem' }}>
                <em>"¡Hola Alex! En este boceto ubiqué el ángulo un poco más alto para que las orejitas y los monitores de fondo tengan profundidad. Fíjate en los detalles de la tableta gráfica..."</em>
              </div>
            </div>

            <div className="chat-modal-footer">
              <button
                type="button"
                className="chat-btn-action-white"
                onClick={() => {
                  setShowVoiceModal(false)
                  setIsPlayingAudio(false)
                }}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Confirmar Aprobación de Boceto */}
      {showApprovalConfirm && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal-window">
            <div className="chat-modal-header" style={{ background: '#A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={20} color="#065F46" />
                <h3 style={{ color: '#065F46' }}>Aprobar Boceto de Fase 2</h3>
              </div>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => setShowApprovalConfirm(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-modal-body">
              <p>
                Al aprobar la <strong>Fase 2: Boceto & Composición</strong>, confirmas que la pose, proporciones y elementos del lineart cumplen con tus especificaciones.
              </p>
              <div style={{ background: '#F0FDF4', border: '1.5px solid #059669', borderRadius: 8, padding: '0.85rem', fontSize: '0.85rem' }}>
                <strong>Próximo paso:</strong> Mía Soler comenzará inmediatamente la <strong>Fase 3: Color & Sombreado</strong> aplicando la paleta acordada.
              </div>
              <small style={{ color: '#6B7280' }}>
                Los fondos de esta etapa continúan protegidos bajo custodia Escrow hasta la entrega final del proyecto.
              </small>
            </div>

            <div className="chat-modal-footer">
              <button
                type="button"
                className="chat-btn-action-white"
                onClick={() => setShowApprovalConfirm(false)}
              >
                Revisar más tarde
              </button>
              <button
                type="button"
                className="chat-btn-approve-wip"
                style={{ flex: 'none', padding: '0.5rem 1.25rem' }}
                onClick={handleApproveMilestone}
              >
                Confirmar Aprobación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Solicitar Ajustes */}
      {showAdjustModal && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal-window">
            <div className="chat-modal-header">
              <h3>Solicitar Ajustes en el Boceto</h3>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => setShowAdjustModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustments}>
              <div className="chat-modal-body">
                <p style={{ margin: 0, color: '#4B5563' }}>
                  Tienes <strong>2 revisiones libres</strong> incluidas en tu comisión. Especifica claramente qué elementos deseas corregir:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Ajustar tamaño o ángulo de las orejitas de conejo',
                    'Modificar la expresión facial de la chica',
                    'Cambiar la posición de los snacks flotantes',
                    'Variar el fondo de monitores',
                  ].map((preset) => (
                    <label
                      key={preset}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdjustText((prev) => (prev ? `${prev}, ${preset}` : preset))
                          }
                        }}
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                </div>

                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Detalles adicionales:
                  <textarea
                    rows={3}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      border: '1.5px solid #1E192B',
                      borderRadius: 8,
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                    }}
                    placeholder="Describe con precisión qué cambios necesitas..."
                    value={adjustText}
                    onChange={(e) => setAdjustText(e.target.value)}
                  />
                </label>
              </div>

              <div className="chat-modal-footer">
                <button
                  type="button"
                  className="chat-btn-action-white"
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="chat-btn-send-main"
                  disabled={!adjustText.trim()}
                >
                  Enviar Ajustes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Lightbox Pantalla Completa */}
      {showLightbox && (
        <div
          className="chat-modal-backdrop"
          style={{ background: 'rgba(15, 12, 25, 0.92)' }}
          role="dialog"
          aria-modal="true"
          onClick={() => setShowLightbox(false)}
        >
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="chat-modal-close-btn"
              style={{ position: 'absolute', top: -14, right: -14, zIndex: 10 }}
              onClick={() => setShowLightbox(false)}
            >
              <X size={16} />
            </button>

            <img
              src="/images/wip_sketch.jpg"
              alt="Boceto en pantalla completa"
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 12,
                border: '3px solid #1E192B',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'block',
              }}
            />

            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(30, 25, 43, 0.88)',
                color: '#FFF',
                padding: '0.4rem 1rem',
                borderRadius: 9999,
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1.5px solid #FFF',
              }}
            >
              BOCETO FASE 2 • ARTIE ESCROW • PREVISUALIZACIÓN DE ALTA RESOLUCIÓN
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Mediación Escrow */}
      {showMediationModal && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal-window">
            <div className="chat-modal-header" style={{ background: '#FECDD3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#9F1239" />
                <h3 style={{ color: '#9F1239' }}>Protección y Mediación ArtLink</h3>
              </div>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => setShowMediationModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-modal-body">
              <p>
                Tu encargo cuenta con la protección de <strong>ArtLink Escrow Shield</strong>. El artista no recibe el pago hasta que apruebes los entregables finales.
              </p>
              <div style={{ background: '#FFFDF8', border: '1.5px solid #1E192B', borderRadius: 8, padding: '0.85rem' }}>
                <strong>Garantías del sistema:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', fontSize: '0.82rem' }}>
                  <li>Retención de fondos de ${activeConvo.escrowAmount?.toFixed(2)} USD protegidos.</li>
                  <li>Revisión de bocetos y correcciones conforme al brief acordado.</li>
                  <li>Soporte técnico y mediación gratuita en caso de desacuerdo.</li>
                </ul>
              </div>
              <small style={{ color: '#6B7280' }}>
                Si tienes alguna discrepancia con la entrega, un mediador del equipo revisará el historial de mensajes y archivos adjuntos para garantizar un acuerdo justo.
              </small>
            </div>

            <div className="chat-modal-footer">
              <button
                type="button"
                className="chat-btn-action-white"
                onClick={() => setShowMediationModal(false)}
              >
                Entendido
              </button>
              <button
                type="button"
                className="chat-btn-action-white"
                style={{ color: '#9F1239', borderColor: '#9F1239' }}
                onClick={() => {
                  alert('Se ha registrado tu solicitud de contacto con el equipo de soporte de ArtLink.')
                  setShowMediationModal(false)
                }}
              >
                Contactar a Mediador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Nueva Consulta */}
      {showNewQueryModal && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal-window">
            <div className="chat-modal-header">
              <h3>Iniciar Nueva Consulta</h3>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => setShowNewQueryModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-modal-body">
              <p style={{ margin: 0, color: '#4B5563' }}>
                Selecciona con quién deseas comunicarte para iniciar una nueva conversación:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    style={{
                      background: '#FFFDF8',
                      border: '1.5px solid #1E192B',
                      borderRadius: 8,
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      setSelectedConvoId(c.id)
                      setShowNewQueryModal(false)
                    }}
                  >
                    <img
                      src={c.artist.avatar}
                      alt={c.artist.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{c.artist.name}</strong>
                      <small style={{ color: '#6B7280' }}>{c.title}</small>
                    </div>
                    <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#6B7280' }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="chat-modal-footer">
              <button
                type="button"
                className="chat-btn-action-white"
                onClick={() => setShowNewQueryModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
