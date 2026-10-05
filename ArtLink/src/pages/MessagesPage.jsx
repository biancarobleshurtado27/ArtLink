import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bot,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  MessageSquare,
  Paperclip,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  User,
  Volume2,
  X,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import usePrivateRequests from '../hooks/usePrivateRequests'
import apiClient from '../services/apiClient'
import AssistantPanel from '../components/AssistantPanel'
import artieAvatar from '../assets/artie-avatar.png'
import { triggerNotificationsUpdate } from '../hooks/useNotificationBadges'
import {
  checkParticipantOnline,
  getPresenceRegistry,
  PRESENCE_CHANGE_EVENT,
  setUserOnline,
} from '../services/presenceService'
import {
  createConversationIfNeeded,
  findConversationBetweenUsers,
  getConversationById,
  getMessagesByConversation,
  listConversationsForUser,
  markConversationAsRead,
  sendMessage,
} from '../services/conversationService'
import { getUsers, getUserById } from '../services/userService'
import { getArtists, getArtistById } from '../services/artistService'
import {
  getMessageDraft,
  saveMessageDraft,
  removeMessageDraft,
} from '../services/persistence/syncService'
import { handleImageError } from '../utils/imageFallback'
import '../styles/chatPop.css'

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.22)
  } catch {}
}

const CHAT_THEMES = [
  { name: 'purple', bg: '#8B5CF6', text: '#FFFFFF', time: '#7C3AED' },
  { name: 'cyan', bg: '#06B6D4', text: '#FFFFFF', time: '#0891B2' },
  { name: 'mint', bg: '#2DD4BF', text: '#0F3A33', time: '#0D9488' },
  { name: 'emerald', bg: '#10B981', text: '#FFFFFF', time: '#059669' },
  { name: 'amber', bg: '#F59E0B', text: '#1E192B', time: '#D97706' },
  { name: 'indigo', bg: '#6366F1', text: '#FFFFFF', time: '#4F46E5' },
  { name: 'yellow', bg: '#FEF08A', text: '#1E192B', time: '#B45309' },
  { name: 'violet', bg: '#7C3AED', text: '#FFFFFF', time: '#5B21B6' },
  { name: 'teal', bg: '#14B8A6', text: '#FFFFFF', time: '#0D9488' },
  { name: 'lilac', bg: '#DDD0FF', text: '#1E192B', time: '#45208F' },
]

function getChatTheme(convoId = '') {
  let hash = 0
  for (let i = 0; i < convoId.length; i++) {
    hash = convoId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CHAT_THEMES[Math.abs(hash) % CHAT_THEMES.length]
}

export default function MessagesPage() {
  const { conversationId } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { requests = [] } = usePrivateRequests()

  const isNewRoute = location.pathname.startsWith('/mensajes/nuevo')
  const newRecipientId = searchParams.get('recipientId')
  const newArtistProfileId = searchParams.get('artistProfileId')

  // Estados de datos principales
  const [conversations, setConversations] = useState([])
  const [usersMap, setUsersMap] = useState({})
  const [artistsMap, setArtistsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mensajes de la conversación activa
  const [activeMessages, setActiveMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Estado para nuevo chat en /mensajes/nuevo
  const [draftRecipientUser, setDraftRecipientUser] = useState(null)
  const [draftRecipientArtist, setDraftRecipientArtist] = useState(null)

  // UI States
  const [unreadByConvoMap, setUnreadByConvoMap] = useState({})
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showInboxSettings, setShowInboxSettings] = useState(false)
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)
  const threadEndRef = useRef(null)

  // Presencia
  const [presenceRegistry, setPresenceRegistry] = useState(getPresenceRegistry)

  useEffect(() => {
    function handlePresenceUpdate() {
      setPresenceRegistry(getPresenceRegistry())
    }
    window.addEventListener(PRESENCE_CHANGE_EVENT, handlePresenceUpdate)
    window.addEventListener('storage', handlePresenceUpdate)
    const timer = setInterval(handlePresenceUpdate, 5000)
    return () => {
      window.removeEventListener(PRESENCE_CHANGE_EVENT, handlePresenceUpdate)
      window.removeEventListener('storage', handlePresenceUpdate)
      clearInterval(timer)
    }
  }, [])

  // Limpiar conversaciones demo quemadas guardadas en localStorage
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('chat_conversations') || key.includes('conversations'))) {
          try {
            const item = JSON.parse(localStorage.getItem(key))
            if (Array.isArray(item)) {
              const hasDemo = item.some(
                (c) =>
                  c.isDemoData ||
                  c.id === 'mythosforge' ||
                  c.id === 'aetherconcept' ||
                  c.id === 'pixelfoundry' ||
                  c.id === 'convo-artie' ||
                  c.id === 'artie_ai'
              )
              if (hasDemo) {
                localStorage.removeItem(key)
              }
            }
          } catch {}
        }
      }
    } catch {}
  }, [])

  // Ajustes de la bandeja y el chat
  const [chatSettings, setChatSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('artlink_chat_settings')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      compactView: false,
      soundEnabled: true,
      onlyActiveOrders: false,
      sendOnEnter: true,
      autoScroll: true,
      showFullTimestamps: false,
    }
  })

  function toggleSetting(key) {
    setChatSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem('artlink_chat_settings', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  // Cargar conversaciones reales del usuario
  const loadConversationsData = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [convos, usersList, artistsList] = await Promise.all([
        listConversationsForUser(user.id),
        getUsers().catch(() => []),
        getArtists().catch(() => []),
      ])

      const uMap = {}
      ;(usersList || []).forEach((u) => {
        if (u && u.id) uMap[String(u.id)] = u
      })
      setUsersMap(uMap)

      const aMap = {}
      ;(artistsList || []).forEach((a) => {
        if (a && a.id) aMap[String(a.id)] = a
        if (a && a.userId) aMap[`user-${a.userId}`] = a
      })
      setArtistsMap(aMap)

      const safeCurrentUserId = String(user.id)
      const validConvos = (convos || []).filter(
        (c) =>
          !c.isDemoData &&
          Array.isArray(c.participantIds) &&
          c.participantIds.map(String).includes(safeCurrentUserId)
      )

      setConversations(validConvos)

      // Contar mensajes sin leer por conversación para el usuario actual
      try {
        const { data: allMsgs } = await apiClient.get('/messages')
        if (Array.isArray(allMsgs)) {
          const map = {}
          allMsgs.forEach((m) => {
            if (
              !m.isDemoData &&
              String(m.receiverId) === safeCurrentUserId &&
              !m.read &&
              !m.readAt
            ) {
              const cId = String(m.conversationId)
              map[cId] = (map[cId] || 0) + 1
            }
          })
          setUnreadByConvoMap(map)
        }
      } catch {}
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar tus conversaciones.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadConversationsData()
  }, [loadConversationsData])

  // Manejar resolución de ruta /mensajes/nuevo
  useEffect(() => {
    if (!isNewRoute) return
    if (!newRecipientId) return
    if (!user?.id) return

    let active = true

    async function resolveNewChat() {
      try {
        // 1. Reutilizar conversación existente si ya existe
        const existing = await findConversationBetweenUsers(user.id, newRecipientId)
        if (existing && existing.id && active) {
          navigate(`/mensajes/${existing.id}`, { replace: true })
          return
        }

        // 2. Cargar datos del destinatario
        const [recUser, recArtist] = await Promise.all([
          getUserById(newRecipientId).catch(() => null),
          newArtistProfileId ? getArtistById(newArtistProfileId).catch(() => null) : null,
        ])

        if (active) {
          setDraftRecipientUser(recUser)
          setDraftRecipientArtist(recArtist)
          setActiveMessages([])
        }
      } catch (err) {
        console.warn('Error resolviendo nuevo chat:', err?.message)
      }
    }

    resolveNewChat()

    return () => {
      active = false
    }
  }, [isNewRoute, newRecipientId, newArtistProfileId, user?.id, navigate])

  // Determinar si el chatbot de ArtLink está seleccionado
  const isChatbotSelected =
    conversationId === 'asistente' ||
    conversationId === 'chatbot' ||
    conversationId === 'artie' ||
    conversationId === 'artlink-ai' ||
    (!conversationId && !isNewRoute && conversations.length === 0)

  // Determinar la conversación activa
  const activeConvo = conversations.find(
    (c) => conversationId && String(c.id) === String(conversationId)
  )

  // Si se está en /mensajes sin ID y existen conversaciones, redirigir a la primera en pantallas de escritorio
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) return
    if (!loading && !isNewRoute && !conversationId && conversations.length > 0) {
      navigate(`/mensajes/${conversations[0].id}`, { replace: true })
    }
  }, [loading, isNewRoute, conversationId, conversations, navigate])

  // Cargar mensajes de la conversación activa y marcar como leídos
  useEffect(() => {
    if (isNewRoute || isChatbotSelected) return
    if (!activeConvo?.id || !user?.id) {
      setActiveMessages([])
      return
    }

    let active = true
    setMessagesLoading(true)

    getMessagesByConversation(activeConvo.id, user.id)
      .then((msgs) => {
        if (!active) return
        setActiveMessages(msgs || [])
        // Marcar como leídos en servidor y actualizar estado de no leídos
        markConversationAsRead(activeConvo.id, user.id)
          .then(() => {
            setUnreadByConvoMap((prev) => ({ ...prev, [String(activeConvo.id)]: 0 }))
            triggerNotificationsUpdate()
          })
          .catch(() => {})
      })
      .catch((err) => {
        console.warn('Error al cargar mensajes:', err?.message)
      })
      .finally(() => {
        if (active) setMessagesLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeConvo?.id, user?.id, isNewRoute, isChatbotSelected])

  // Cargar borrador persistente del mensaje
  useEffect(() => {
    const convoKey = isNewRoute ? `new-${newRecipientId}` : activeConvo?.id
    if (!convoKey || !user?.id) return
    const draft = getMessageDraft(user.id, convoKey)
    setMessageInput(draft || '')
  }, [activeConvo?.id, user?.id, isNewRoute, newRecipientId])

  function handleDraftChange(val) {
    setMessageInput(val)
    const convoKey = isNewRoute ? `new-${newRecipientId}` : activeConvo?.id
    if (convoKey && user?.id) {
      saveMessageDraft(user.id, convoKey, val)
    }
  }

  // Interlocutor de la conversación activa
  const otherUserId = activeConvo
    ? activeConvo.participantIds.find((pid) => String(pid) !== String(user?.id))
    : newRecipientId

  const otherUser = usersMap[String(otherUserId)] || draftRecipientUser || {}
  const relatedArtist = activeConvo?.relatedArtistProfileId
    ? artistsMap[String(activeConvo.relatedArtistProfileId)]
    : draftRecipientArtist

  const relatedRequest = requests.find((r) =>
    activeConvo?.relatedRequestId
      ? String(r.id) === String(activeConvo.relatedRequestId)
      : String(r.clientId) === String(otherUserId) || String(r.artistId) === String(otherUserId)
  )

  const otherParticipantDisplay = {
    name:
      otherUser?.name ||
      relatedArtist?.displayName ||
      relatedArtist?.name ||
      'Usuario de ArtLink',
    username:
      otherUser?.username ||
      relatedArtist?.username ||
      otherUser?.email?.split('@')[0] ||
      'usuario',
    avatar:
      otherUser?.avatar ||
      relatedArtist?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        otherUser?.name || relatedArtist?.displayName || 'Usuario'
      )}&background=random`,
    role: otherUser?.role || (relatedArtist ? 'artista' : 'cliente'),
    verified: Boolean(relatedArtist?.verified),
    userId: otherUserId,
    artistProfileId: activeConvo?.relatedArtistProfileId || newArtistProfileId || relatedArtist?.id,
  }

  const activePresence = checkParticipantOnline(
    {
      userId: otherUserId,
      id: otherUserId,
      username: otherParticipantDisplay.username,
      name: otherParticipantDisplay.name,
    },
    presenceRegistry
  )

  const activeTheme = getChatTheme(activeConvo?.id || 'default')

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (chatSettings.autoScroll && typeof threadEndRef.current?.scrollIntoView === 'function') {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeMessages, chatSettings.autoScroll])

  // Adjuntar archivos locales
  function handleFileSelect(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: reader.result,
          },
        ])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  function removeAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Enviar mensaje
  async function handleSendMessage(e) {
    if (e && e.preventDefault) e.preventDefault()
    const text = messageInput.trim()
    if (!text && attachments.length === 0) return

    if (!user || !user.id) {
      setSendError('Inicia sesión para enviar mensajes.')
      return
    }

    if (text.length > 3000) {
      setSendError('El mensaje supera el límite de 3000 caracteres.')
      return
    }

    if (sendLoading) return

    setSendLoading(true)
    setSendError(null)

    try {
      let targetConvoId = activeConvo?.id
      let targetReceiverId = otherUserId

      // En modo nuevo chat, crear conversación primero
      if (isNewRoute) {
        if (!newRecipientId) {
          throw new Error('No se pudo determinar el destinatario.')
        }
        if (String(user.id) === String(newRecipientId)) {
          throw new Error('No puedes enviarte un mensaje a ti mismo.')
        }

        const convo = await createConversationIfNeeded(user.id, newRecipientId, {
          artistProfileId: newArtistProfileId,
          requestId: searchParams.get('requestId'),
        })

        targetConvoId = convo.id
        targetReceiverId = newRecipientId
      }

      if (!targetConvoId || !targetReceiverId) {
        throw new Error('Error al identificar la conversación de destino.')
      }

      // Enviar mensaje a JSON Server
      const createdMsg = await sendMessage(targetConvoId, user.id, targetReceiverId, text)

      // Limpiar borrador de texto y adjuntos
      setMessageInput('')
      removeMessageDraft(user.id, isNewRoute ? `new-${newRecipientId}` : targetConvoId)
      setAttachments([])

      if (chatSettings.soundEnabled) {
        playNotificationSound()
      }

      if (isNewRoute) {
        await loadConversationsData()
        navigate(`/mensajes/${targetConvoId}`)
      } else {
        setActiveMessages((prev) => [...prev, createdMsg])
        // Actualizar preview en la lista local de conversaciones
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(targetConvoId)
              ? { ...c, lastMessageId: createdMsg.id, updatedAt: createdMsg.createdAt }
              : c
          )
        )
      }
    } catch (err) {
      setSendError(err?.message || 'Error al enviar el mensaje. Conservamos tu texto.')
    } finally {
      setSendLoading(false)
    }
  }

  // Filtrar conversaciones de la bandeja
  const filteredConversations = conversations.filter((c) => {
    const q = sidebarSearch.trim().toLowerCase()
    if (!q) return true

    const pId = c.participantIds.find((pid) => String(pid) !== String(user?.id))
    const pUser = usersMap[String(pId)]
    const pArtist = c.relatedArtistProfileId ? artistsMap[String(c.relatedArtistProfileId)] : null

    const matchName =
      (pUser?.name && pUser.name.toLowerCase().includes(q)) ||
      (pArtist?.displayName && pArtist.displayName.toLowerCase().includes(q))
    const matchUser = pUser?.username && pUser.username.toLowerCase().includes(q)

    return matchName || matchUser
  })

  // ── ESTADO 1: CARGANDO ──
  if (loading) {
    return (
      <main
        className="chat-view-container"
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cargando conversaciones...</p>
        </div>
      </main>
    )
  }

  // ── ESTADO 2: ERROR ──
  if (error) {
    return (
      <main
        className="chat-view-container"
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AlertTriangle
            size={40}
            color="#DC2626"
            style={{ margin: '0 auto 1rem' }}
            aria-hidden="true"
          />
          <p
            style={{
              color: '#DC2626',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            No se pudieron cargar tus conversaciones.
          </p>
          <button
            type="button"
            onClick={loadConversationsData}
            style={{
              background: '#8B5CF6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.4rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      </main>
    )
  }

  const totalUnreadMessages = Object.values(unreadByConvoMap).reduce((a, b) => a + b, 0)
  const hasActiveChat = Boolean(conversationId || isNewRoute)

  return (
    <div className="chat-view-container">
      <div className={`chat-three-column-grid ${!showOrderDetails ? 'is-details-closed' : ''} ${hasActiveChat ? 'has-active-chat' : 'is-inbox-view'}`}>
        {/* ══════════════════════════════════════════════════════════════════
            COLUMNA 1: BANDEJA DE CONVERSACIONES REALES
            ══════════════════════════════════════════════════════════════════ */}
        <aside className="chat-column-box chat-col-sidebar" aria-label="Bandeja de conversaciones">
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-title-row">
              <span>Bandeja</span>
              <span
                className="chat-count-badge"
                style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}
              >
                {filteredConversations.length + 1}{' '}
                {filteredConversations.length === 0 ? 'chat' : 'chats'}
              </span>
              {totalUnreadMessages > 0 && (
                <span
                  className="chat-convo-unread-circle"
                  style={{ marginLeft: '0.35rem' }}
                  title={`${totalUnreadMessages} mensajes sin leer`}
                  aria-label={`${totalUnreadMessages} mensajes sin leer`}
                >
                  {totalUnreadMessages}
                </span>
              )}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: user ? '#F0FDF4' : '#F3F4F6',
                border: `1.5px solid ${user ? '#10B981' : '#D1D5DB'}`,
                padding: '0.18rem 0.55rem',
                borderRadius: 9999,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: user ? '#065F46' : '#6B7280',
              }}
              title={user ? `Sesión activa: ${user.name || user.email}` : 'Sin sesión activa'}
            >
              <span
                className={`chat-online-dot ${user ? 'is-online' : 'is-offline'}`}
                style={{ width: 7, height: 7 }}
              />
              <span>{user ? 'En línea' : 'Desconectado'}</span>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="chat-sidebar-search-row">
            <div className="chat-sidebar-search-box">
              <Search size={15} color="#6B7280" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
              {sidebarSearch && (
                <button
                  type="button"
                  className="chat-search-clear-btn"
                  onClick={() => setSidebarSearch('')}
                  title="Borrar búsqueda"
                  aria-label="Borrar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div
            className={`chat-conversations-scroll-list ${
              chatSettings.compactView ? 'is-compact-inbox' : ''
            }`}
          >
            {/* 0. ArtLink AI Chatbot Pinned Conversation */}
            {(!sidebarSearch ||
              'artlink ai asistente virtual gemini bot'
                .toLowerCase()
                .includes(sidebarSearch.trim().toLowerCase())) && (
              <button
                type="button"
                className={`chat-convo-item-btn chat-bot-convo-item ${
                  isChatbotSelected ? 'is-selected' : ''
                }`}
                onClick={() => navigate('/mensajes/asistente')}
              >
                <div className="chat-avatar-wrapper">
                  <img
                    src={artieAvatar}
                    alt="ArtLink AI"
                    className="chat-convo-avatar-img"
                  />
                  <span
                    className="chat-avatar-badge-dot is-online"
                    title="En línea 24/7 con Gemini"
                  />
                </div>

                <div className="chat-convo-info-col">
                  <div className="chat-convo-top-row">
                    <div className="chat-convo-name-group">
                      <span className="chat-convo-name-text">ArtLink AI</span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          background: '#EDE9FE',
                          color: '#6D28D9',
                          border: '1.2px solid #1E192B',
                          borderRadius: 9999,
                          padding: '0.05rem 0.4rem',
                          fontWeight: 800,
                        }}
                      >
                        Agente
                      </span>
                    </div>
                    <span className="chat-convo-time">
                      <span
                        style={{
                          color: '#059669',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <span
                          className="chat-online-dot is-online"
                          style={{ width: 6, height: 6 }}
                        />
                        En línea
                      </span>
                    </span>
                  </div>

                  <p className="chat-convo-preview-msg">
                    Asistente oficial con Gemini 24/7
                  </p>

                  <div className="chat-convo-bottom-row">
                    <span className="chat-convo-tag tag-pink">Asistente AI</span>
                  </div>
                </div>
              </button>
            )}

            {filteredConversations.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: '0.82rem',
                }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {sidebarSearch
                    ? 'No se encontraron otros chats'
                    : 'Aún no tienes chats con otros creadores'}
                </p>
                <span
                  style={{
                    fontSize: '0.75rem',
                    display: 'block',
                    margin: '0.35rem 0 0.8rem',
                  }}
                >
                  {sidebarSearch
                    ? 'Intenta con otro término de búsqueda.'
                    : '¡Chatea con ArtLink AI arriba o explora artistas!'}
                </span>
                {!sidebarSearch && (
                  <Link
                    to="/explorar"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#8B5CF6',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: '0.78rem',
                    }}
                  >
                    <Search size={13} aria-hidden="true" />
                    <span>Explorar creadores</span>
                  </Link>
                )}
              </div>
            ) : (
              filteredConversations.map((item) => {
                const isSelected = !isNewRoute && !isChatbotSelected && item.id === activeConvo?.id
                const pId = item.participantIds.find((pid) => String(pid) !== String(user?.id))
                const pUser = usersMap[String(pId)]
                const pArtist = item.relatedArtistProfileId
                  ? artistsMap[String(item.relatedArtistProfileId)]
                  : null

                const pName = pUser?.name || pArtist?.displayName || 'Usuario de ArtLink'
                const pAvatar =
                  pUser?.avatar ||
                  pArtist?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(pName)}&background=random`

                const pPresence = checkParticipantOnline(
                  { userId: pId, id: pId, name: pName },
                  presenceRegistry
                )

                const timeLabel = item.updatedAt
                  ? new Date(item.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Reciente'

                const unreadCount = unreadByConvoMap[String(item.id)] || 0

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`chat-convo-item-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => navigate(`/mensajes/${item.id}`)}
                  >
                    <div className="chat-avatar-wrapper">
                      <img
                        src={pAvatar}
                        alt={pName}
                        onError={handleImageError}
                        className="chat-convo-avatar-img"
                      />
                      <span
                        className={`chat-avatar-badge-dot ${pPresence.badgeClass}`}
                        title={pPresence.statusText}
                      />
                    </div>

                    <div className="chat-convo-info-col">
                      <div className="chat-convo-top-row">
                        <div className="chat-convo-name-group">
                          <span className="chat-convo-name-text" title={pName}>
                            {pName}
                          </span>
                          {pArtist?.verified && (
                            <BadgeCheck
                              size={14}
                              color="#8B5CF6"
                              fill="#EDE9FE"
                              aria-label="Verificado"
                              title="Verificado"
                              className="chat-convo-badge-icon"
                            />
                          )}
                        </div>
                        <span className="chat-convo-time">
                          {pPresence.isOnline ? (
                            <span
                              style={{
                                color: '#059669',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <span
                                className="chat-online-dot is-online"
                                style={{ width: 6, height: 6 }}
                              />
                              En línea
                            </span>
                          ) : (
                            timeLabel
                          )}
                        </span>
                      </div>

                      <p className="chat-convo-preview-msg">
                        {item.lastMessageId
                          ? 'Mensaje registrado'
                          : 'Conversación activa'}
                      </p>

                      <div
                        className="chat-convo-bottom-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span className="chat-convo-tag tag-cyan">
                          {pArtist ? 'Artista' : 'Contacto'}
                        </span>
                        {unreadCount > 0 && (
                          <span
                            className="chat-convo-unread-circle"
                            title={`${unreadCount} mensajes sin leer`}
                            aria-label={`${unreadCount} mensajes sin leer`}
                          >
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <footer className="chat-sidebar-footer">
            <div className="chat-socket-indicator">
              <span className="chat-online-dot is-online" />
              <span>Sincronizado vía ArtLink Data</span>
            </div>
            <button
              type="button"
              className="chat-tool-btn"
              title="Ajustes de la bandeja y el chat"
              onClick={() => setShowInboxSettings(true)}
            >
              <Sliders size={14} aria-hidden="true" />
            </button>
          </footer>
        </aside>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMNA 2: HILO DE MENSAJES Y FORMULARIO DE ENVÍO
            ══════════════════════════════════════════════════════════════════ */}
        <section className="chat-column-box chat-col-center" aria-label="Hilo de conversación">
          {isChatbotSelected ? (
            <AssistantPanel embedded={true} />
          ) : (
            <>
              {/* Encabezado del chat */}
              <header className="chat-center-header">
                {hasActiveChat && (
                  <button
                    type="button"
                    className="chat-mobile-back-btn"
                    onClick={() => navigate('/mensajes')}
                    title="Volver a lista de chats"
                    aria-label="Volver a lista de chats"
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                  </button>
                )}
                <div className="chat-active-artist-info">
              <div className="chat-avatar-wrapper">
                <img
                  src={otherParticipantDisplay.avatar}
                  alt={otherParticipantDisplay.name}
                  onError={handleImageError}
                  className="chat-active-artist-avatar"
                />
                <span
                  className={`chat-avatar-badge-dot ${activePresence.badgeClass}`}
                  title={activePresence.statusText}
                />
              </div>

              <div className="chat-artist-titles">
                <div
                  className="chat-artist-name-line"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}
                >
                  <strong>{otherParticipantDisplay.name}</strong>
                  {otherParticipantDisplay.verified && (
                    <BadgeCheck
                      size={17}
                      color="#8B5CF6"
                      fill="#EDE9FE"
                      aria-label="Verificado"
                      title="Verificado"
                    />
                  )}
                  <span className="chat-artist-handle-light">
                    @{otherParticipantDisplay.username}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 9999,
                      background:
                        otherParticipantDisplay.role === 'artista' ? '#EDE9FE' : '#FEF3C7',
                      color: otherParticipantDisplay.role === 'artista' ? '#6D28D9' : '#92400E',
                      fontWeight: 700,
                      border: '1.5px solid #1E192B',
                    }}
                  >
                    {otherParticipantDisplay.role === 'artista' ? 'Artista' : 'Cliente'}
                  </span>
                </div>

                <span className="chat-artist-substatus">
                  <span
                    className={`chat-online-dot ${activePresence.badgeClass}`}
                    style={{ width: 8, height: 8 }}
                  />
                  <span
                    style={{
                      color: activePresence.isOnline ? '#059669' : '#6B7280',
                      fontWeight: activePresence.isOnline ? 700 : 500,
                    }}
                  >
                    {activePresence.statusText}
                  </span>
                </span>
              </div>
            </div>

            <div
              className="chat-center-header-actions"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              {otherParticipantDisplay.artistProfileId && (
                <Link
                  to={`/artista/${otherParticipantDisplay.artistProfileId}`}
                  className="chat-btn-header-action"
                  title="Ver perfil completo del artista"
                  style={{ textDecoration: 'none' }}
                >
                  <User size={15} aria-hidden="true" />
                  <span>Ver perfil</span>
                </Link>
              )}

              <button
                type="button"
                className={`chat-btn-header-action ${showOrderDetails ? 'is-active' : ''}`}
                onClick={() => setShowOrderDetails((prev) => !prev)}
                title={showOrderDetails ? 'Ocultar detalles' : 'Ver información del contacto'}
              >
                <FileText size={15} aria-hidden="true" />
                <span>Detalles</span>
              </button>
            </div>
          </header>

          {/* Área de mensajes con scroll */}
          <div className="chat-thread-scroll-box">
            {messagesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                <p>Cargando mensajes...</p>
              </div>
            ) : isNewRoute || activeMessages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  color: 'var(--muted)',
                  margin: 'auto 0',
                }}
              >
                <MessageSquare
                  size={36}
                  color="#8B5CF6"
                  style={{ margin: '0 auto 0.5rem', opacity: 0.7 }}
                  aria-hidden="true"
                />
                <p style={{ fontWeight: 600, color: 'var(--ink)', margin: '0 0 0.3rem' }}>
                  Inicia la conversación con {otherParticipantDisplay.name}
                </p>
                <span style={{ fontSize: '0.85rem' }}>
                  Escribe un mensaje a continuación para abrir el canal directo.
                </span>
              </div>
            ) : (
              activeMessages.map((msg) => {
                const isMine = String(msg.senderId) === String(user?.id)
                const formattedTime = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : msg.time || ''

                const isRead = Boolean(msg.readAt || msg.read)

                if (isMine) {
                  return (
                    <div key={msg.id} className="chat-bubble-outgoing-wrap">
                      <div
                        className="chat-bubble-purple"
                        style={{
                          backgroundColor: activeTheme.bg,
                          color: activeTheme.text,
                          borderColor: '#1E192B',
                        }}
                      >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem',
                              marginBottom: msg.content || msg.text ? '0.45rem' : 0,
                            }}
                          >
                            {msg.attachments.map((att, idx) => (
                              <div key={idx}>
                                {att.dataUrl && att.type?.startsWith('image/') ? (
                                  <img
                                    src={att.dataUrl}
                                    alt={att.name}
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: 220,
                                      borderRadius: 6,
                                      border: '1.5px solid #1E192B',
                                      display: 'block',
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      background: 'rgba(0, 0, 0, 0.18)',
                                      padding: '0.3rem 0.6rem',
                                      borderRadius: 6,
                                      fontSize: '0.8rem',
                                    }}
                                  >
                                    <Paperclip size={13} aria-hidden="true" />
                                    <span style={{ fontWeight: 600 }}>{att.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.content || msg.text}
                      </div>
                      <div className="chat-msg-time-out">
                        <span>{formattedTime}</span>
                        {isRead ? (
                          <CheckCheck
                            size={14}
                            color={activeTheme.time}
                            title="Leído"
                            aria-label="Mensaje leído"
                          />
                        ) : (
                          <Check
                            size={14}
                            color="#9CA3AF"
                            title="Enviado"
                            aria-label="Mensaje enviado"
                          />
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className="chat-bubble-incoming-wrap">
                    <div className="chat-bubble-white">
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            marginBottom: msg.content || msg.text ? '0.45rem' : 0,
                          }}
                        >
                          {msg.attachments.map((att, idx) => (
                            <div key={idx}>
                              {att.dataUrl && att.type?.startsWith('image/') ? (
                                <img
                                  src={att.dataUrl}
                                  alt={att.name}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: 220,
                                    borderRadius: 6,
                                    border: '1.5px solid #1E192B',
                                    display: 'block',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: 'rgba(0, 0, 0, 0.05)',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: 6,
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  <Paperclip size={13} aria-hidden="true" />
                                  <span style={{ fontWeight: 600 }}>{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.content || msg.text}
                    </div>
                    <div className="chat-msg-time-in">
                      <span>{formattedTime}</span>
                    </div>
                  </div>
                )
              })
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Formulario de entrada de mensaje */}
          <div className="chat-input-outer-box" style={{ position: 'relative' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
              accept="image/*,.pdf,.zip,.psd,.clip"
            />

            {sendError && (
              <div
                role="alert"
                style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  color: '#B91C1C',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  margin: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <span>{sendError}</span>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  style={{
                    background: '#B91C1C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 4,
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Reintentar
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="chat-input-card">
              {attachments.length > 0 && (
                <div className="chat-attachments-preview-strip">
                  {attachments.map((att, idx) => (
                    <div key={att.id || idx} className="chat-attachment-chip">
                      <Paperclip size={12} aria-hidden="true" />
                      <span className="chat-attachment-chip-name">{att.name}</span>
                      <span className="chat-attachment-chip-size">
                        ({(att.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        className="chat-attachment-remove-btn"
                        onClick={() => removeAttachment(idx)}
                        title="Eliminar archivo"
                        aria-label="Eliminar archivo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                className="chat-textarea-field"
                placeholder={`Escribe tu mensaje a ${otherParticipantDisplay.name}...`}
                value={messageInput}
                maxLength={3000}
                onChange={(e) => handleDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (chatSettings.sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />

              <div className="chat-input-toolbar-row">
                <div className="chat-input-tools-left" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="chat-tool-btn"
                    title="Adjuntar archivos desde tu equipo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={16} aria-hidden="true" />
                  </button>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: messageInput.length > 2800 ? '#DC2626' : '#9CA3AF',
                      fontWeight: 600,
                      marginLeft: 8,
                    }}
                  >
                    {messageInput.length} / 3000
                  </span>
                </div>

                <button
                  type="submit"
                  className="chat-btn-send-main"
                  disabled={
                    (!messageInput.trim() && attachments.length === 0) || sendLoading || !user
                  }
                >
                  <span>{sendLoading ? 'Enviando...' : 'Enviar'}</span>
                  <Send size={15} aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
          </>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMNA 3: DETALLES DEL CONTACTO Y DEL ENCARGO
            ══════════════════════════════════════════════════════════════════ */}
        {showOrderDetails && (
          <aside className="chat-column-box chat-col-details" aria-label="Detalles del contacto">
            <div className="chat-details-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="chat-details-heading-label">Información</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderDetails(false)}
                className="chat-details-close-btn"
                title="Cerrar panel de detalles"
                aria-label="Cerrar panel de detalles"
              >
                <X size={15} />
              </button>
            </div>

            {isChatbotSelected ? (
              <>
                <div className="chat-order-title-block">
                  <h3>ArtLink AI</h3>
                  <p>@artlink_ai · Asistente Oficial</p>
                </div>
                <div
                  style={{
                    background: 'var(--surface-soft)',
                    border: '1.5px solid var(--line)',
                    borderRadius: 8,
                    padding: '0.85rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    color: 'var(--ink)',
                  }}
                >
                  <div>
                    <strong>Rol: </strong>
                    <span>Asistente Creativo & Guía de Comisiones</span>
                  </div>
                  <div>
                    <strong>Motor de Inteligencia: </strong>
                    <span>Gemini AI vía n8n</span>
                  </div>
                  <div>
                    <strong>Disponibilidad: </strong>
                    <span style={{ color: '#059669', fontWeight: 700 }}>En línea 24/7</span>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: 8,
                    background: '#EDE9FE',
                    border: '1.5px solid #8B5CF6',
                    fontSize: '0.78rem',
                    color: '#5B21B6',
                    lineHeight: 1.4,
                  }}
                >
                  Pregúntale a ArtLink AI sobre recomendaciones de creadores, cómo cotizar un encargo o el funcionamiento de la protección de fondos con Escrow.
                </div>
              </>
            ) : (
              <>
                <div className="chat-order-title-block">
                  <h3>{otherParticipantDisplay.name}</h3>
                  <p>@{otherParticipantDisplay.username}</p>
                </div>

                {relatedArtist && (
              <div
                style={{
                  background: 'var(--surface-soft)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 8,
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  color: 'var(--ink)',
                }}
              >
                <div>
                  <strong>Disciplina: </strong>
                  <span>{relatedArtist.disciplines?.join(', ') || 'Arte digital'}</span>
                </div>
                {relatedArtist.basePrice && (
                  <div>
                    <strong>Tarifa base: </strong>
                    <span>${relatedArtist.basePrice} USD</span>
                  </div>
                )}
                {relatedArtist.bio && (
                  <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.4 }}>
                    {relatedArtist.bio}
                  </p>
                )}
              </div>
            )}

            {relatedRequest && (
              <div
                style={{
                  background: 'var(--surface-soft)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 8,
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  marginTop: '0.85rem',
                  color: 'var(--ink)',
                }}
              >
                <strong>Solicitud Vinculada:</strong>
                <div>
                  {relatedRequest.commissionTitle || relatedRequest.title || 'Comisión'}
                </div>
                <div>
                  <strong>Presupuesto:</strong> ${relatedRequest.budget || relatedRequest.price || 0}{' '}
                  USD
                </div>
                <div>
                  <strong>Estado:</strong>{' '}
                  {relatedRequest.status === 'completed'
                    ? 'Finalizada'
                    : relatedRequest.status === 'in_progress'
                    ? 'En progreso'
                    : 'En espera'}
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: 8,
                background: '#ECFDF5',
                border: '1.5px solid #059669',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: '#065F46',
              }}
            >
              <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                Conversación segura y respaldada en ArtLink. Recuerda no compartir información
                bancaria por chat directo.
              </span>
            </div>

            {otherParticipantDisplay.artistProfileId && (
              <div className="chat-details-actions-group" style={{ marginTop: '1.25rem' }}>
                <Link
                  to={`/artista/${otherParticipantDisplay.artistProfileId}`}
                  className="chat-btn-action-white"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Ver perfil de artista</span>
                </Link>
              </div>
            )}
            </>
            )}
          </aside>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: AJUSTES DE BANDEJA Y CHAT
          ══════════════════════════════════════════════════════════════════ */}
      {showInboxSettings && (
        <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
          <div className="chat-modal-window">
            <div className="chat-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} />
                <h3>Ajustes de Bandeja y Chat</h3>
              </div>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => setShowInboxSettings(false)}
                title="Cerrar ajustes"
                aria-label="Cerrar ajustes"
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-modal-body">
              <div className="chat-settings-section">
                <h4 className="chat-settings-title">Bandeja de Entrada</h4>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Vista compacta</strong>
                    <span>Muestra más conversaciones con espaciado reducido.</span>
                  </div>
                  <button
                    type="button"
                    className={`chat-toggle-switch ${chatSettings.compactView ? 'is-on' : ''}`}
                    onClick={() => toggleSetting('compactView')}
                    aria-label="Alternar vista compacta"
                  >
                    <span className="chat-toggle-handle" />
                  </button>
                </div>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Sonidos de notificación</strong>
                    <span>Aviso auditivo al enviar o recibir mensajes.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="chat-btn-action-white"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                      onClick={playNotificationSound}
                      title="Probar sonido"
                    >
                      <Volume2 size={12} style={{ display: 'inline', marginRight: 3 }} />
                      Probar
                    </button>
                    <button
                      type="button"
                      className={`chat-toggle-switch ${chatSettings.soundEnabled ? 'is-on' : ''}`}
                      onClick={() => toggleSetting('soundEnabled')}
                      aria-label="Alternar sonido"
                    >
                      <span className="chat-toggle-handle" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="chat-settings-section">
                <h4 className="chat-settings-title">Comportamiento del Chat</h4>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Enviar mensajes con Enter</strong>
                    <span>Enter para enviar; Shift + Enter para salto de línea.</span>
                  </div>
                  <button
                    type="button"
                    className={`chat-toggle-switch ${chatSettings.sendOnEnter ? 'is-on' : ''}`}
                    onClick={() => toggleSetting('sendOnEnter')}
                    aria-label="Alternar enviar con Enter"
                  >
                    <span className="chat-toggle-handle" />
                  </button>
                </div>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Desplazamiento automático</strong>
                    <span>Baja automáticamente al último mensaje al recibir nuevas respuestas.</span>
                  </div>
                  <button
                    type="button"
                    className={`chat-toggle-switch ${chatSettings.autoScroll ? 'is-on' : ''}`}
                    onClick={() => toggleSetting('autoScroll')}
                    aria-label="Alternar auto scroll"
                  >
                    <span className="chat-toggle-handle" />
                  </button>
                </div>
              </div>
            </div>

            <div className="chat-modal-footer">
              <button
                type="button"
                className="chat-btn-approve-wip"
                style={{ flex: 'none', padding: '0.5rem 1.25rem', background: '#8B5CF6' }}
                onClick={() => setShowInboxSettings(false)}
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
