import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bot,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Lock,
  Maximize2,
  MoreVertical,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sliders,
  Smile,
  Sparkles,
  User,
  Volume2,
  X,
  ZoomIn,
} from 'lucide-react'
import usePrivateRequests from '../hooks/usePrivateRequests'
import useAuth from '../hooks/useAuth'
import { interpretNeed } from '../services/aiService'
import {
  checkParticipantOnline,
  getPresenceRegistry,
  PRESENCE_CHANGE_EVENT,
  savePresenceRegistry,
  setUserOnline,
} from '../services/presenceService'
import artieAvatar from '../assets/artie-avatar.png'
import '../styles/chatPop.css'
import { readLocal, saveLocal } from '../services/persistence/localStorageService'
import { getUserScopedKey } from '../services/persistence/storageKeys'
import {
  getMessageDraft,
  saveMessageDraft,
  removeMessageDraft,
} from '../services/persistence/syncService'
import { createMessage } from '../services/messageService'

const EMOJI_LIST = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅',
  '😊', '😍', '🥰', '😘', '😎', '🤩', '🥳',
  '🎨', '🖌️', '🖍️', '🎭', '🖼️', '✨', '🌟',
  '💡', '🔥', '🚀', '🎉', '💯', '👏', '🙌',
  '👍', '❤️', '💖', '⭐', '🤝', '☕', '👀',
]

const QUICK_PROMPTS = [
  {
    id: 'anime',
    icon: Search,
    text: 'Encontrar ilustradores de anime/manga',
    styleClass: 'pill-pink',
  },
  {
    id: 'escrow',
    icon: ShieldCheck,
    text: '¿Cómo funciona el pago seguro Escrow?',
    styleClass: 'pill-mint',
  },
  {
    id: 'fast',
    icon: Sparkles,
    text: 'Artistas con cupos abiertos y entrega rápida',
    styleClass: 'pill-lavender',
  },
  {
    id: 'brief',
    icon: FileText,
    text: 'Ayúdame a redactar el brief de mi encargo',
    styleClass: 'pill-yellow',
  },
]

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
  { name: 'pink', bg: '#EC4899', text: '#FFFFFF', time: '#DB2777' },
  { name: 'emerald', bg: '#10B981', text: '#FFFFFF', time: '#059669' },
  { name: 'amber', bg: '#F59E0B', text: '#1E192B', time: '#D97706' },
  { name: 'indigo', bg: '#6366F1', text: '#FFFFFF', time: '#4F46E5' },
  { name: 'rose', bg: '#F43F5E', text: '#FFFFFF', time: '#E11D48' },
  { name: 'violet', bg: '#A855F7', text: '#FFFFFF', time: '#9333EA' },
  { name: 'teal', bg: '#14B8A6', text: '#FFFFFF', time: '#0D9488' },
  { name: 'lime', bg: '#84CC16', text: '#1E192B', time: '#65A30D' },
]

function getChatTheme(convoId = '') {
  let hash = 0
  for (let i = 0; i < convoId.length; i++) {
    hash = convoId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CHAT_THEMES[Math.abs(hash) % CHAT_THEMES.length]
}

const DEFAULT_CONVERSATIONS = [
  {
    id: 'mythosforge',
    orderId: 'q_D0R_iTERI',
    allOrderIds: ['q_D0R_iTERI', 'req-103'],
    artist: {
      id: 'artist-demo-108',
      userId: 'artist-demo-108',
      name: 'Mythos Character Forge',
      username: 'mythosforge',
      avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80',
      verified: true,
      role: 'artista',
      statusText: 'Desconectado',
    },
    title: 'Diseño de Personaje Original Completo',
    subtitle: 'Modelado y diseño de personajes heroicos, criaturas fantásticas y atuendos estilizados.',
    tag: 'Encargo #q_D0R_iTERI • En progreso',
    tagColor: 'tag-cyan',
    unread: 0,
    time: '11:42',
    preview: '¡Hola! Ya estoy trabajando en la estructura anatómica...',
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
        desc: 'Desarrollo visual y proporciones anatómicas.',
        status: 'current',
        badge: 'En progreso',
      },
      {
        id: 3,
        title: '3. Color & Sombreado',
        date: '',
        desc: 'Aplicación de paleta, luces volumétricas y texturas.',
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
      { id: 'f1', name: 'Ref_Personaje.jpg', img: '/images/hero/soramoon.jpg' },
      { id: 'f2', name: 'Paleta_Heroica.jpg', img: '/images/hero/thumbs/sora-1.jpg' },
    ],
    messages: [
      {
        id: 'msg-1',
        sender: 'me',
        text: '¡Hola! Te compartí las referencias de vestuario y la silueta heroica para el diseño del personaje. Quedo atento a tus observaciones.',
        time: '11:15',
        status: 'read',
      },
      {
        id: 'msg-2',
        sender: 'artist',
        text: '¡Hola! Sí, me encantaron los detalles de los destellos y la gama cromática. Ya armé la primera propuesta de composición y pose dinámica con el fondo en perspectiva.',
        time: '11:42',
      },
    ],
  },
  {
    id: 'aetherconcept',
    orderId: 'req-102',
    allOrderIds: ['req-102'],
    artist: {
      id: 'artist-demo-104',
      userId: 'artist-demo-104',
      name: 'Aether Concept Art',
      username: 'aetherconcept',
      avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
      verified: true,
      role: 'artista',
      statusText: 'Desconectado',
    },
    title: 'Ilustración Conceptual Sci-Fi',
    subtitle: 'Conceptualización de mundos de ciencia ficción y atmósferas fantásticas de gran escala.',
    tag: 'Encargo #req-102 • En progreso',
    tagColor: 'tag-cyan',
    unread: 0,
    time: 'Ayer',
    preview: 'Avanzamos con el render de perspectiva...',
    escrowAmount: 220.0,
    escrowDaysLeft: 5,
    escrowDeadline: '28 Oct',
    phase: 'FASE 2 DE 4: BOCETO Y PERSPECTIVA',
    milestones: [
      { id: 1, title: '1. Brief', status: 'done', desc: 'Aprobado y depositado.' },
      { id: 2, title: '2. Composición', status: 'current', desc: 'Boceto de perspectiva en revisión.' },
      { id: 3, title: '3. Renderizado', status: 'upcoming', desc: 'Luces y texturas atmosféricas.' },
      { id: 4, title: '4. Entrega', status: 'upcoming', desc: 'Archivos finales en 4K.' },
    ],
    files: [{ id: 'f4', name: 'Estacion_Orbital_Ref.jpg', img: '/images/hero/magic_shop.jpg' }],
    messages: [
      { id: 'm-201', sender: 'artist', text: '¡Hola! Ya quedaron configuradas todas las fuentes de iluminación planetaria y el diseño de la estación.', time: 'Ayer 16:30' },
      { id: 'm-202', sender: 'me', text: '¡Quedó espectacular! La escala se siente inmensa. Quedo a la espera del renderizado final.', time: 'Ayer 17:15', status: 'read' },
    ],
  },
  {
    id: 'pixelfoundry',
    orderId: 'req-101',
    allOrderIds: ['req-101'],
    artist: {
      id: 'artist-demo-101',
      userId: 'artist-demo-101',
      name: 'Pixel Foundry',
      username: 'pixelfoundry',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
      verified: true,
      role: 'artista',
      statusText: 'Desconectado',
    },
    title: 'Hoja de Sprites de Personaje 16-Bit',
    subtitle: 'Taller de creación de pixel art para videojuegos retro, sprites 16-bit e interfaces vintage.',
    tag: 'Encargo #req-101 • Finalizado',
    tagColor: 'tag-gray',
    unread: 0,
    time: '20 Mar',
    preview: 'Spritesheet final exportado en PNG...',
    escrowAmount: 80.0,
    escrowDaysLeft: 0,
    escrowDeadline: 'Finalizado',
    phase: 'FASE 4 DE 4: ENTREGADO Y LIBERADO',
    milestones: [
      { id: 1, title: '1. Especificaciones', status: 'done', desc: 'Paleta y dimensiones aprobadas.' },
      { id: 2, title: '2. Animación Base', status: 'done', desc: 'Ciclos de caminata y salto listos.' },
      { id: 3, title: '3. Efectos y Ataques', status: 'done', desc: 'Sprites secundarios finalizados.' },
      { id: 4, title: '4. Entrega de Archivos', status: 'done', desc: 'Archivos PSD y PNG entregados.' },
    ],
    files: [{ id: 'f5', name: 'Spritesheet_Final.png', img: '/images/hero/thumbs/sora-4.jpg' }],
    messages: [
      { id: 'p-1', sender: 'artist', text: '¡Hola! Ya subí el archivo ZIP con todos los frames separados por capas y el atlas listo para Unity.', time: '20 Mar 11:20' },
      { id: 'p-2', sender: 'me', text: '¡Excelente calidad en las animaciones! Fondos liberados con éxito.', time: '20 Mar 14:05', status: 'read' },
    ],
  },
  {
    id: 'voxelstudio',
    orderId: 'comm-102',
    allOrderIds: ['comm-102', '102'],
    artist: {
      id: 'artist-demo-102',
      userId: 'artist-demo-102',
      name: 'Voxel Studio Lab',
      username: 'voxelstudio',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
      verified: true,
      role: 'artista',
      statusText: 'Desconectado',
    },
    title: 'Diorama 3D Voxel Art',
    subtitle: 'Laboratorio de experimentación volumétrica y dioramas 3D low-poly para maquetas y juegos.',
    tag: 'Encargo #102 • En espera',
    tagColor: 'tag-warm',
    unread: 0,
    time: '15 Oct',
    preview: '¿Deseas agregar iluminación volumétrica...',
    escrowAmount: 120.0,
    escrowDaysLeft: 10,
    escrowDeadline: '25 Oct',
    phase: 'FASE 1 DE 3: ACEPTACIÓN DE COTIZACIÓN',
    milestones: [
      { id: 1, title: '1. Cotización y Pago', status: 'current', desc: 'En espera de depósito en custodia.' },
      { id: 2, title: '2. Modelado Voxel', status: 'upcoming', desc: 'Construcción isométrica 3D.' },
      { id: 3, title: '3. Render Final', status: 'upcoming', desc: 'Exportación OBJ/GLTF.' },
    ],
    files: [],
    messages: [
      { id: 'v-1', sender: 'artist', text: '¡Hola! Ya revisé las especificaciones del diorama isométrico. ¿Te gustaría que agreguemos efectos de niebla volumétrica?', time: '15 Oct 12:30' },
    ],
  },
  {
    id: 'convo-artie',
    orderId: 'BOT-AI',
    allOrderIds: ['BOT-AI', 'convo-artie'],
    isBot: true,
    artist: {
      id: 'artie_ai',
      name: 'Artie Assistant ♦',
      username: 'artie_ai',
      avatar: artieAvatar,
      isBot: true,
      verified: true,
      statusText: 'Asistente IA • En línea',
    },
    title: 'Asistente Inteligente Artie',
    subtitle: 'Orientación de presupuestos, recomendaciones de estilo y protección Escrow Shield.',
    tag: 'Asistente Virtual IA',
    tagColor: 'tag-pink',
    unread: 0,
    time: 'En línea',
    preview: '¡Hola, creador! Soy Artie. ¿En qué puedo orientarte hoy?',
    escrowAmount: 0.0,
    phase: 'ASISTENTE DE ORIENTACIÓN INTELIGENTE',
    milestones: [],
    files: [],
    messages: [
      {
        id: 'bot-welcome',
        sender: 'artist',
        text: '¡Hola, creador! Soy Artie. ¿Buscas un ilustrador para tu proyecto, necesitas calcular el presupuesto de un encargo o resolver dudas sobre el sistema de custodia Escrow Shield?',
        time: '10:00',
      },
    ],
  },
]

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { requests } = usePrivateRequests()

  // State: única conversación por usuario/artista
  const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS)
  const [selectedConvoId, setSelectedConvoId] = useState(
    searchParams.get('requestId') || DEFAULT_CONVERSATIONS[0].id
  )
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isBotThinking, setIsBotThinking] = useState(false)

  // Cargar conversaciones guardadas previamente para el usuario
  useEffect(() => {
    const saved = readLocal(getUserScopedKey(user?.id, 'chat_conversations'), null)
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setConversations(saved)
    }
  }, [user?.id])

  // Persistir conversaciones modificadas para evitar pérdida de mensajes al recargar
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      saveLocal(getUserScopedKey(user?.id, 'chat_conversations'), conversations)
    }
  }, [conversations, user?.id])

  // Cargar y sincronizar borrador de mensaje de la conversación activa
  useEffect(() => {
    const draft = getMessageDraft(user?.id, selectedConvoId)
    setMessageInput(draft || '')
  }, [selectedConvoId, user?.id])

  function handleDraftChange(val) {
    setMessageInput(val)
    saveMessageDraft(user?.id, selectedConvoId, val)
  }

  // Registro de presencia en tiempo real para artistas y clientes ("En línea" / "Desconectado")
  const [presenceRegistry, setPresenceRegistry] = useState(getPresenceRegistry)

  useEffect(() => {
    function handlePresenceUpdate() {
      setPresenceRegistry(getPresenceRegistry())
    }
    window.addEventListener(PRESENCE_CHANGE_EVENT, handlePresenceUpdate)
    window.addEventListener('storage', handlePresenceUpdate)

    const timer = setInterval(handlePresenceUpdate, 4000)
    return () => {
      window.removeEventListener(PRESENCE_CHANGE_EVENT, handlePresenceUpdate)
      window.removeEventListener('storage', handlePresenceUpdate)
      clearInterval(timer)
    }
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

  // Modals & Panels
  const [showInboxSettings, setShowInboxSettings] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const [showBriefModal, setShowBriefModal] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustText, setAdjustText] = useState('')
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false)
  const [showMediationModal, setShowMediationModal] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  const threadEndRef = useRef(null)

  // Cerrar selector de emojis al hacer clic fuera
  useEffect(() => {
    function handleOutside(e) {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showEmojiPicker])

  // Sincronizar solicitudes reales de la base de datos SIN duplicar chats (un solo chat por artista/usuario)
  useEffect(() => {
    if (!requests || requests.length === 0) return

    setConversations((prev) => {
      const map = new Map()

      // 1. Conservar las conversaciones existentes mapeadas por id de artista o identificador único
      prev.forEach((c) => {
        const key = c.isBot
          ? 'artie_ai'
          : c.artist?.id || c.artist?.username?.toLowerCase() || c.id
        map.set(key, { ...c })
      })

      const isCurrentUserArtist = user?.role === 'artista' || user?.role === 'artist'

      // 2. Mapear cada solicitud al interlocutor correspondiente (si el usuario actual es artista, el interlocutor es el cliente)
      requests.forEach((req) => {
        const participantId = isCurrentUserArtist
          ? (req.clientId || `client-${req.id}`)
          : (req.artistId || `artist-${req.id}`)

        const key = isCurrentUserArtist
          ? (req.clientId || (req.clientUsername ? req.clientUsername.toLowerCase() : String(req.id)))
          : (req.artistId || (req.artistUsername ? req.artistUsername.toLowerCase() : String(req.id)))

        const participantName = isCurrentUserArtist
          ? (req.clientName || 'Cliente ArtLink')
          : (req.artistName || 'Artista ArtLink')

        const participantUsername = isCurrentUserArtist
          ? (req.clientUsername || 'cliente')
          : (req.artistUsername || (req.artistName ? req.artistName.toLowerCase().replace(/\s+/g, '') : 'artista'))

        const participantAvatar = isCurrentUserArtist
          ? (req.clientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=random`)
          : (req.artistAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80')

        const existing = map.get(key)

        if (existing) {
          // Si ya existe conversación con este usuario/artista, actualizar datos del encargo
          const allOrders = new Set(existing.allOrderIds || [existing.orderId, existing.id])
          allOrders.add(String(req.id))

          const isMoreRecent = req.createdAt
            ? !existing.rawCreatedAt || new Date(req.createdAt) > new Date(existing.rawCreatedAt)
            : false

          if (isMoreRecent || !existing.isRealRequest) {
            existing.orderId = String(req.id)
            existing.rawCreatedAt = req.createdAt
            existing.title = req.commissionTitle || req.title || existing.title
            existing.subtitle = req.description || existing.subtitle
            existing.tag = `Encargo #${req.id} • ${
              req.status === 'completed'
                ? 'Finalizado'
                : req.status === 'in_progress'
                ? 'En progreso'
                : 'En espera'
            }`
            existing.tagColor =
              req.status === 'completed'
                ? 'tag-gray'
                : req.status === 'in_progress'
                ? 'tag-cyan'
                : 'tag-warm'
            existing.escrowAmount = Number(req.budget || req.price || existing.escrowAmount)
            if (req.desiredDate) {
              existing.escrowDeadline = new Date(req.desiredDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })
            }
          }
          existing.allOrderIds = Array.from(allOrders)
          map.set(key, existing)
        } else {
          // Contacto nuevo: crear exactamente 1 conversación para él
          const newConvo = {
            id: isCurrentUserArtist ? `client-${req.clientId || req.id}` : `artist-${req.artistId || req.id}`,
            orderId: String(req.id),
            allOrderIds: [String(req.id)],
            isRealRequest: true,
            rawCreatedAt: req.createdAt,
            artist: {
              id: participantId,
              userId: isCurrentUserArtist ? req.clientId : req.artistId,
              name: participantName,
              username: participantUsername,
              avatar: participantAvatar,
              verified: isCurrentUserArtist ? false : (req.artistVerified ?? true),
              role: isCurrentUserArtist ? 'cliente' : 'artista',
              statusText: 'Desconectado',
            },
            title: req.commissionTitle || req.title || 'Encargo personalizado',
            subtitle: req.description || 'Especificaciones del encargo acordadas bajo custodia Escrow.',
            tag: `Encargo #${req.id} • ${
              req.status === 'completed'
                ? 'Finalizado'
                : req.status === 'in_progress'
                ? 'En progreso'
                : 'En espera'
            }`,
            tagColor:
              req.status === 'completed'
                ? 'tag-gray'
                : req.status === 'in_progress'
                ? 'tag-cyan'
                : 'tag-warm',
            unread: 0,
            time: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })
              : 'Reciente',
            preview: req.description
              ? req.description.length > 35
                ? req.description.slice(0, 35) + '...'
                : req.description
              : 'Conversación iniciada.',
            escrowAmount: Number(req.budget || req.price || 0),
            escrowDaysLeft: 7,
            escrowDeadline: req.desiredDate
              ? new Date(req.desiredDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })
              : '7 días',
            phase:
              req.status === 'completed'
                ? 'FASE 4 DE 4: ENTREGADO Y LIBERADO'
                : req.status === 'in_progress'
                ? 'FASE 2 DE 4: PROGRESO Y REVISIÓN'
                : 'FASE 1 DE 4: BRIEF Y DEPÓSITO',
            milestones: [
              {
                id: 1,
                title: '1. Brief & Depósito',
                date: 'Aprobado',
                desc: 'Depósito en custodia y especificaciones aprobadas.',
                status: 'done',
              },
              {
                id: 2,
                title: '2. Boceto & Composición',
                date: 'En curso',
                desc: 'Desarrollo visual inicial.',
                status:
                  req.status === 'in_progress' || req.status === 'completed'
                    ? 'done'
                    : 'current',
              },
              {
                id: 3,
                title: '3. Color & Acabado',
                date: '',
                desc: 'Detalles finales y paleta.',
                status:
                  req.status === 'completed'
                    ? 'done'
                    : req.status === 'in_progress'
                    ? 'current'
                    : 'upcoming',
              },
              {
                id: 4,
                title: '4. Entrega de Archivos',
                date: '',
                desc: 'Liberación de fondos y satisfacción.',
                status: req.status === 'completed' ? 'done' : 'upcoming',
              },
            ],
            files: [],
            messages: [
              {
                id: `init-${req.id}`,
                sender: 'me',
                text:
                  req.description ||
                  `¡Hola! He creado la solicitud para el encargo "${
                    req.commissionTitle || 'Comisión personalizada'
                  }" por un presupuesto de $${req.budget || req.price || 0} USD.`,
                time: req.createdAt
                  ? new Date(req.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '10:00',
                status: 'read',
              },
              {
                id: `reply-${req.id}`,
                sender: 'artist',
                text: `¡Hola! He recibido los detalles de tu encargo. Cualquier duda o referencia adicional que quieras compartirme, puedes enviarla directamente por este chat.`,
                time: '10:05',
              },
            ],
          }
          map.set(key, newConvo)
        }
      })

      return Array.from(map.values())
    })
  }, [requests, user])

  // Conversación seleccionada activa (con fallback garantizado)
  const activeConvo =
    conversations.find((c) => c.id === selectedConvoId) ||
    conversations[0] ||
    DEFAULT_CONVERSATIONS[0]

  // Estado de presencia real del interlocutor del chat activo ("En línea" o "Desconectado")
  const activePresence = checkParticipantOnline(activeConvo?.artist, presenceRegistry)

  // Conmutar presencia de un contacto manualmente para pruebas en vivo
  function toggleParticipantPresence(participant) {
    if (!participant || participant.isBot) return
    const reg = getPresenceRegistry()
    const key = participant.userId || participant.id || participant.username
    const current = checkParticipantOnline(participant, reg)
    const nextOnline = !current.isOnline

    const entry = {
      userId: String(key),
      name: participant.name,
      role: participant.role || 'artista',
      isOnline: nextOnline,
      statusText: nextOnline ? 'En línea' : 'Desconectado',
      lastSeen: nextOnline ? Date.now() : Date.now() - 360000,
    }

    reg[String(key)] = entry
    if (participant.username) reg[participant.username.toLowerCase()] = entry
    if (participant.id) reg[String(participant.id)] = entry

    savePresenceRegistry(reg)
    setPresenceRegistry(reg)
  }

  // Color de tema aleatorio por chat
  const activeTheme = getChatTheme(activeConvo?.id || 'default')

  // Auto-scroll al último mensaje al cambiar de chat o recibir mensaje
  useEffect(() => {
    if (chatSettings.autoScroll && typeof threadEndRef.current?.scrollIntoView === 'function') {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversations, selectedConvoId, chatSettings.autoScroll])

  // Filtrar conversaciones de la bandeja (búsqueda unificada y filtro de órdenes activas)
  const filteredConversations = conversations.filter((c) => {
    if (chatSettings.onlyActiveOrders && !c.isBot) {
      if (c.tag?.toLowerCase().includes('finalizado')) return false
    }

    const q = sidebarSearch.trim().toLowerCase()
    if (!q) return true

    const matchName = c.artist?.name?.toLowerCase().includes(q)
    const matchUser = c.artist?.username?.toLowerCase().includes(q)
    const matchTitle = c.title?.toLowerCase().includes(q)
    const matchSubtitle = c.subtitle?.toLowerCase().includes(q)
    const matchTag = c.tag?.toLowerCase().includes(q)
    const matchOrder = c.orderId?.toLowerCase().includes(q)
    const matchMsg = c.messages?.some((m) => (m.text || '').toLowerCase().includes(q))
    return matchName || matchUser || matchTitle || matchSubtitle || matchTag || matchOrder || matchMsg
  })

  // Seleccionar archivos reales desde el equipo
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
            url: reader.result,
          },
        ])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  // Quitar archivo adjunto de la tira previa
  function removeAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Enviar mensaje en el chat
  async function handleSendMessage(e) {
    if (e && e.preventDefault) e.preventDefault()
    const text = messageInput.trim()
    if (!text && attachments.length === 0) return
    if (isBotThinking) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: text,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      attachments: [...attachments],
    }

    const currentConvoId = activeConvo.id
    const isTargetBot = Boolean(activeConvo.isBot)

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvoId) {
          return {
            ...c,
            messages: [...(c.messages || []), newMsg],
            preview: text || (attachments[0]?.name ? `Archivo: ${attachments[0].name}` : 'Archivo adjunto'),
            time: newMsg.time,
          }
        }
        return c
      })
    )

    setMessageInput('')
    removeMessageDraft(user?.id, currentConvoId)
    setAttachments([])

    // Persistir mensaje enviado en JSON Server
    try {
      createMessage({
        conversationId: currentConvoId,
        senderId: user?.id || 'guest',
        senderRole: user?.role || 'client',
        text: text,
        time: newMsg.time,
        attachments: attachments.map((a) => ({ name: a.name, type: a.type })),
        createdAt: new Date().toISOString(),
      }).catch((err) => console.warn('JSON Server message sync notice:', err))
    } catch {}

    if (chatSettings.soundEnabled) {
      playNotificationSound()
    }

    if (isTargetBot) {
      setIsBotThinking(true)
      try {
        const aiResponse = await interpretNeed(text)
        const botMsg = {
          id: `bot-reply-${Date.now()}`,
          sender: 'artist',
          text: aiResponse?.summary || 'He recibido tu mensaje. ¿Hay algo específico en lo que pueda orientarte sobre encargos o presupuestos?',
          explanation: aiResponse?.explanation,
          suggestedFilters: aiResponse?.suggestedFilters,
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        }

        try {
          createMessage({
            conversationId: currentConvoId,
            senderId: 'artie_ai',
            senderName: 'Artie AI',
            text: botMsg.text,
            time: botMsg.time,
            createdAt: new Date().toISOString(),
          }).catch(() => {})
        } catch {}

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvoId) {
              return {
                ...c,
                messages: [...(c.messages || []), botMsg],
                preview: botMsg.text.length > 40 ? botMsg.text.slice(0, 40) + '...' : botMsg.text,
                time: botMsg.time,
              }
            }
            return c
          })
        )
        if (chatSettings.soundEnabled) {
          playNotificationSound()
        }
      } catch (err) {
        console.error('Error con Artie AI:', err)
        const fallbackMsg = {
          id: `bot-fallback-${Date.now()}`,
          sender: 'artist',
          text: 'Puedo orientarte con presupuestos, protección de custodia Escrow Shield o recomendarte ilustradores en nuestro catálogo.',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        }
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvoId) {
              return {
                ...c,
                messages: [...(c.messages || []), fallbackMsg],
              }
            }
            return c
          })
        )
      } finally {
        setIsBotThinking(false)
      }
    }
  }

  // Enviar prompt predeterminado al Asistente Artie
  async function handleSendTextMessage(text) {
    if (!text || isBotThinking) return
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: text,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    }

    const currentConvoId = activeConvo.id
    const isTargetBot = Boolean(activeConvo.isBot)

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvoId) {
          return {
            ...c,
            messages: [...(c.messages || []), newMsg],
            preview: text,
            time: newMsg.time,
          }
        }
        return c
      })
    )

    if (chatSettings.soundEnabled) {
      playNotificationSound()
    }

    if (isTargetBot) {
      setIsBotThinking(true)
      try {
        const aiResponse = await interpretNeed(text)
        const botMsg = {
          id: `bot-reply-${Date.now()}`,
          sender: 'artist',
          text: aiResponse?.summary || 'Entendido. Te muestro las mejores sugerencias para este requerimiento.',
          explanation: aiResponse?.explanation,
          suggestedFilters: aiResponse?.suggestedFilters,
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        }

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvoId) {
              return {
                ...c,
                messages: [...(c.messages || []), botMsg],
                preview: botMsg.text.length > 40 ? botMsg.text.slice(0, 40) + '...' : botMsg.text,
                time: botMsg.time,
              }
            }
            return c
          })
        )
        if (chatSettings.soundEnabled) {
          playNotificationSound()
        }
      } catch (err) {
        console.error('Error con Artie AI:', err)
      } finally {
        setIsBotThinking(false)
      }
    }
  }

  // Confirmar aprobación del hito de boceto
  function handleApproveMilestone() {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvo.id) {
          const updatedMilestones = (c.milestones || []).map((m) => {
            if (m.id === 2) return { ...m, status: 'done', badge: 'Aprobado' }
            if (m.id === 3) return { ...m, status: 'current', badge: 'En progreso' }
            return m
          })

          const approvalNotice = {
            id: `msg-${Date.now()}`,
            sender: 'me',
            text: '¡Boceto de la Fase 2 aprobado con éxito! Se autorizó el inicio de la etapa de Color & Sombreado bajo la custodia Escrow.',
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
          }

          return {
            ...c,
            phase: 'FASE 3 DE 4: COLOR & SOMBREADO',
            milestones: updatedMilestones,
            messages: [...(c.messages || []), approvalNotice],
          }
        }
        return c
      })
    )
    setShowApprovalConfirm(false)
  }

  // Enviar solicitud de ajustes en boceto
  function handleSubmitAdjustments(e) {
    if (e && e.preventDefault) e.preventDefault()
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
            messages: [...(c.messages || []), adjustMsg],
          }
        }
        return c
      })
    )
    setAdjustText('')
    setShowAdjustModal(false)
  }

  // Marcar todos los chats como leídos
  function handleMarkAllAsRead() {
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        unread: 0,
      }))
    )
    setShowInboxSettings(false)
  }

  // Reiniciar conversación del bot Artie
  function handleResetArtieChat() {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === 'convo-artie') {
          return {
            ...c,
            messages: [
              {
                id: 'bot-welcome',
                sender: 'artist',
                text: '¡Hola, creador! Soy Artie. ¿Buscas un ilustrador para tu proyecto, necesitas calcular el presupuesto de un encargo o resolver dudas sobre el sistema de custodia Escrow Shield?',
                time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              },
            ],
            preview: '¡Hola, creador! Soy Artie. ¿En qué puedo orientarte hoy?',
            time: 'En línea',
          }
        }
        return c
      })
    )
    setShowInboxSettings(false)
  }

  return (
    <div className="chat-view-container">
      {/* ── THREE-COLUMN CHAT GRID ── */}
      <div className={`chat-three-column-grid ${!showOrderDetails ? 'is-details-closed' : ''}`}>
        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 1: BANDEJA (Conversations Sidebar - Un solo chat por usuario)
            ══════════════════════════════════════════════════════════════════ */}
        <aside className="chat-column-box chat-col-sidebar" aria-label="Bandeja de conversaciones">
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-title-row">
              <span>Bandeja</span>
              <span className="chat-count-badge" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                {filteredConversations.length} {filteredConversations.length === 1 ? 'chat' : 'chats'}
              </span>
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
              <span className={`chat-online-dot ${user ? 'is-online' : 'is-offline'}`} style={{ width: 7, height: 7 }} />
              <span>{user ? 'En línea' : 'Desconectado'}</span>
            </div>
          </div>

          {/* Barra de búsqueda unificada para chats y mensajes */}
          <div className="chat-sidebar-search-row">
            <div className="chat-sidebar-search-box">
              <Search size={15} color="#6B7280" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar chats y mensajes..."
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

          <div className={`chat-conversations-scroll-list ${chatSettings.compactView ? 'is-compact-inbox' : ''}`}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#6B7280', fontSize: '0.82rem' }}>
                <p style={{ margin: 0, fontWeight: 700 }}>No se encontraron chats</p>
                <span style={{ fontSize: '0.75rem' }}>Intenta con otro término de búsqueda.</span>
              </div>
            ) : (
              filteredConversations.map((item) => {
                const isSelected = item.id === activeConvo.id
                const itemPresence = checkParticipantOnline(item.artist, presenceRegistry)
                const hasMessageMatch =
                  sidebarSearch &&
                  item.messages?.some((m) =>
                    (m.text || '').toLowerCase().includes(sidebarSearch.toLowerCase())
                  )

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
                        <span
                          className={`chat-avatar-badge-dot ${itemPresence.badgeClass}`}
                          title={itemPresence.statusText}
                        />
                      )}
                    </div>

                    <div className="chat-convo-info-col">
                      <div className="chat-convo-top-row">
                        <div className="chat-convo-name-group">
                          <span className="chat-convo-name-text" title={item.artist.name}>
                            {item.artist.name}
                          </span>
                          {item.artist.verified && (
                            <BadgeCheck
                              size={14}
                              color="#8B5CF6"
                              fill="#EDE9FE"
                              aria-label="Verificado"
                              title="Verificado"
                              className="chat-convo-badge-icon"
                            />
                          )}
                          {item.artist.role === 'cliente' && (
                            <span className="chat-convo-client-badge">
                              Cliente
                            </span>
                          )}
                        </div>
                        <span className="chat-convo-time">
                          {itemPresence.isOnline && !item.isBot ? (
                            <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span className="chat-online-dot is-online" style={{ width: 6, height: 6 }} />
                              En línea
                            </span>
                          ) : (
                            item.time
                          )}
                        </span>
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

                      {hasMessageMatch && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: '#7C3AED',
                            fontWeight: 700,
                            background: '#EDE9FE',
                            padding: '0.1rem 0.35rem',
                            borderRadius: 4,
                            display: 'inline-block',
                            marginTop: 4,
                          }}
                        >
                          💬 Coincidencia en mensaje
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <footer className="chat-sidebar-footer">
            <div className="chat-socket-indicator">
              <span className="chat-online-dot is-online" />
              <span>Sincronizado vía Socket ArtLink</span>
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
                {activeConvo.isBot ? (
                  <span className="chat-avatar-bot-tag" style={{ top: -2, right: -2 }}>BOT</span>
                ) : (
                  <span
                    className={`chat-avatar-badge-dot ${activePresence.badgeClass}`}
                    title={activePresence.statusText}
                  />
                )}
              </div>

              <div className="chat-artist-titles">
                <div
                  className="chat-artist-name-line"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}
                >
                  <strong>{activeConvo.artist.name}</strong>
                  {activeConvo.artist.verified && (
                    <BadgeCheck
                      size={17}
                      color="#8B5CF6"
                      fill="#EDE9FE"
                      aria-label="Verificado"
                      title="Verificado"
                    />
                  )}
                  <span className="chat-artist-handle-light">@{activeConvo.artist.username}</span>
                  {activeConvo.artist.role && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 9999,
                        background: activeConvo.artist.role === 'artista' ? '#EDE9FE' : '#FEF3C7',
                        color: activeConvo.artist.role === 'artista' ? '#6D28D9' : '#92400E',
                        fontWeight: 700,
                        border: '1px solid #1E192B',
                      }}
                    >
                      {activeConvo.artist.role === 'artista' ? 'Artista' : 'Cliente'}
                    </span>
                  )}
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
              <button
                type="button"
                className={`chat-btn-header-action ${showOrderDetails ? 'is-active' : ''}`}
                onClick={() => setShowOrderDetails((prev) => !prev)}
                title={
                  showOrderDetails
                    ? 'Ocultar detalles'
                    : activeConvo.isBot
                    ? 'Ver guía y tips de Artie AI'
                    : 'Ver detalles del encargo'
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.42rem 0.75rem',
                  background: showOrderDetails ? '#8B5CF6' : '#FFFFFF',
                  color: showOrderDetails ? '#FFFFFF' : '#1E192B',
                  border: '1.5px solid #1E192B',
                  borderRadius: 8,
                  boxShadow: '1.5px 1.5px 0 #1E192B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={15} aria-hidden="true" />
                <span>{activeConvo.isBot ? 'Asistente' : 'Encargo'}</span>
              </button>

              <button
                type="button"
                className="chat-btn-header-action"
                style={{ padding: '0.42rem 0.55rem' }}
                title="Más opciones de seguridad"
                onClick={() => setShowMediationModal(true)}
              >
                <MoreVertical size={16} aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Thread messages area */}
          <div className="chat-thread-scroll-box">
            <div className="chat-date-separator">
              <span className="chat-date-pill">
                {activeConvo.isBot ? 'Asistente Artie con Inteligencia Artificial' : 'Hoy, 24 de Octubre'}
              </span>
            </div>

            {/* Si es Artie AI y hay pocos mensajes, mostrar sugerencias rápidas directamente */}
            {activeConvo.isBot && (activeConvo.messages || []).length <= 2 && (
              <div
                className="chat-artie-prompts-tray"
                style={{ justifyContent: 'center', margin: '0.25rem 0 0.85rem' }}
              >
                {QUICK_PROMPTS.map((prompt) => {
                  const Icon = prompt.icon
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      className={`chat-artie-prompt-chip ${prompt.styleClass}`}
                      onClick={() => handleSendTextMessage(prompt.text)}
                      disabled={isBotThinking}
                    >
                      <Icon size={13} aria-hidden="true" />
                      <span>{prompt.text}</span>
                    </button>
                  )
                })}
              </div>
            )}

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
                            marginBottom: msg.text ? '0.45rem' : 0,
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
                                  <Paperclip size={13} />
                                  <span style={{ fontWeight: 600 }}>{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.text}
                    </div>
                    <div className="chat-msg-time-out">
                      <span>{msg.time}</span>
                      <CheckCheck size={14} color={activeTheme.time} aria-hidden="true" />
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
                          marginBottom: msg.text ? '0.45rem' : 0,
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
                                  background: '#F3F4F6',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: 6,
                                  fontSize: '0.8rem',
                                }}
                              >
                                <Paperclip size={13} />
                                <span style={{ fontWeight: 600 }}>{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.text}

                    {/* Explicación orientativa de Artie AI */}
                    {msg.explanation && (
                      <small
                        style={{
                          display: 'block',
                          marginTop: '0.4rem',
                          color: '#6B7280',
                          fontSize: '0.78rem',
                          fontStyle: 'italic',
                          lineHeight: 1.35,
                        }}
                      >
                        {msg.explanation}
                      </small>
                    )}

                    {/* Sugerencias de filtros convertidos por Artie AI */}
                    {msg.suggestedFilters && (
                      <div className="chat-artie-suggestions-box">
                        <span className="chat-artie-suggestions-title">
                          Sugerencias de Búsqueda ArtLink
                        </span>
                        <div className="chat-artie-tags-group">
                          {msg.suggestedFilters.disciplines?.map((d) => (
                            <span key={d} className="chat-artie-tag-pill">🎨 {d}</span>
                          ))}
                          {msg.suggestedFilters.styles?.map((s) => (
                            <span key={s} className="chat-artie-tag-pill">✨ {s}</span>
                          ))}
                          {msg.suggestedFilters.maxPrice && (
                            <span className="chat-artie-tag-pill">💰 Hasta ${msg.suggestedFilters.maxPrice} USD</span>
                          )}
                        </div>
                        <Link
                          to={`/explorar?${new URLSearchParams({
                            ...(msg.suggestedFilters.disciplines?.[0]
                              ? { discipline: msg.suggestedFilters.disciplines[0] }
                              : {}),
                            ...(msg.suggestedFilters.styles?.[0]
                              ? { style: msg.suggestedFilters.styles[0] }
                              : {}),
                          }).toString()}`}
                          className="chat-artie-action-btn"
                        >
                          <Search size={13} />
                          <span>Explorar artistas con estos filtros</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="chat-msg-time-in">
                    <span>{msg.time}</span>
                  </div>
                </div>
              )
            })}

            {/* Burbuja animada de pensamiento de Artie AI */}
            {isBotThinking && activeConvo.isBot && (
              <div className="chat-bubble-incoming-wrap">
                <div className="chat-bubble-white chat-bot-thinking-bubble">
                  <span className="chat-thinking-dot dot-1" />
                  <span className="chat-thinking-dot dot-2" />
                  <span className="chat-thinking-dot dot-3" />
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: '#6B7280',
                      marginLeft: '0.45rem',
                      fontWeight: 600,
                    }}
                  >
                    Artie está pensando...
                  </span>
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Input Box Card */}
          <div className="chat-input-outer-box" style={{ position: 'relative' }}>
            {/* Input oculto para cargar archivos reales */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
              accept="image/*,.pdf,.zip,.psd,.clip"
            />

            {/* Barra de prompts rápidos para Artie AI */}
            {activeConvo.isBot && (
              <div
                className="chat-artie-prompts-tray"
                style={{
                  padding: '0.4rem 0.85rem',
                  background: '#FFFDF8',
                  borderBottom: '1.5px solid #E5E7EB',
                }}
              >
                {QUICK_PROMPTS.map((prompt) => {
                  const Icon = prompt.icon
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      className={`chat-artie-prompt-chip ${prompt.styleClass}`}
                      onClick={() => handleSendTextMessage(prompt.text)}
                      disabled={isBotThinking}
                    >
                      <Icon size={12} />
                      <span>{prompt.text}</span>
                    </button>
                  )
                })}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="chat-input-card">
              {/* Tira de archivos adjuntos pendientes de enviar */}
              {attachments.length > 0 && (
                <div className="chat-attachments-preview-strip">
                  {attachments.map((att, idx) => (
                    <div key={att.id || idx} className="chat-attachment-chip">
                      <Paperclip size={12} />
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
                placeholder={
                  activeConvo.isBot
                    ? 'Pregunta a Artie sobre estilos, tarifas o cómo funciona Escrow...'
                    : `Escribe tu mensaje a ${activeConvo.artist.name}...`
                }
                value={messageInput}
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

                  <button
                    type="button"
                    className={`chat-tool-btn ${showEmojiPicker ? 'is-active' : ''}`}
                    title="Insertar emoji"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <Smile size={16} aria-hidden="true" />
                  </button>

                  {/* Popover de emojis */}
                  {showEmojiPicker && (
                    <div className="chat-emoji-popover" ref={emojiPickerRef}>
                      <div className="chat-emoji-header">
                        <span>Seleccionar emoji</span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 2,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="chat-emoji-grid">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="chat-emoji-btn"
                            onClick={() => handleDraftChange(messageInput + emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="chat-btn-send-main"
                  disabled={(!messageInput.trim() && attachments.length === 0) || isBotThinking}
                >
                  <span>Enviar</span>
                  <Send size={15} aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 3: DETALLES DEL ENCARGO O GUÍA DE ARTIE (Sidebar Right)
            ══════════════════════════════════════════════════════════════════ */}
        {showOrderDetails && (
          activeConvo.isBot ? (
            <aside className="chat-column-box chat-col-details" aria-label="Detalles del asistente Artie">
              <div className="chat-details-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="chat-details-heading-label">Asistente Artie</span>
                  <span
                    className="chat-order-id-pill"
                    style={{ background: '#EDE9FE', color: '#6D28D9' }}
                  >
                    AI BOT
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderDetails(false)}
                  className="chat-details-close-btn"
                  title="Cerrar panel de asistente"
                  aria-label="Cerrar panel de asistente"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="chat-phase-tag-banner" style={{ background: '#8B5CF6' }}>
                ASISTENTE DE ORIENTACIÓN INTELIGENTE
              </div>

              <div className="chat-order-title-block">
                <h3>¿En qué puede ayudarte Artie?</h3>
                <p>
                  Artie es el asistente de IA oficial de ArtLink diseñado para guiarte en cada paso
                  de tu encargo o búsqueda de talento.
                </p>
              </div>

              <div className="chat-milestones-block">
                <h4 className="chat-milestones-title">Capacidades Principales</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1.5px solid #1E192B',
                      borderRadius: 8,
                      padding: '0.65rem',
                    }}
                  >
                    <strong style={{ color: '#6D28D9' }}>🔍 Búsqueda de Artistas:</strong>
                    <p style={{ margin: '0.2rem 0 0', color: '#4B5563' }}>
                      Escribe la idea de tu proyecto (ej: "Ilustración anime de fantasía con presupuesto de 150 USD") y Artie te dará recomendaciones y filtros directos.
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1.5px solid #1E192B',
                      borderRadius: 8,
                      padding: '0.65rem',
                    }}
                  >
                    <strong style={{ color: '#0F766E' }}>🛡️ Protección Escrow Shield:</strong>
                    <p style={{ margin: '0.2rem 0 0', color: '#4B5563' }}>
                      Pregúntale cómo funciona la retención segura de fondos por hitos de entrega antes de que el artista cobre.
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1.5px solid #1E192B',
                      borderRadius: 8,
                      padding: '0.65rem',
                    }}
                  >
                    <strong style={{ color: '#B45309' }}>📝 Ayuda para Briefs:</strong>
                    <p style={{ margin: '0.2rem 0 0', color: '#4B5563' }}>
                      Aprende a especificar resoluciones, paletas y formatos para evitar confusiones en tu pedido.
                    </p>
                  </div>
                </div>
              </div>

              <div className="chat-details-actions-group">
                <Link
                  to="/explorar"
                  className="chat-btn-action-white"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Search size={14} />
                  Ver Catálogo de Artistas
                </Link>
                <button
                  type="button"
                  className="chat-btn-action-white"
                  onClick={handleResetArtieChat}
                >
                  <RotateCcw size={14} />
                  Reiniciar Conversación con Artie
                </button>
              </div>
            </aside>
          ) : (
            <aside className="chat-column-box chat-col-details" aria-label="Detalles del encargo">
              <div className="chat-details-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="chat-details-heading-label">Detalles del Encargo</span>
                  <span className="chat-order-id-pill">#{activeConvo.orderId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderDetails(false)}
                  className="chat-details-close-btn"
                  title="Cerrar detalles del encargo"
                  aria-label="Cerrar detalles del encargo"
                >
                  <X size={15} />
                </button>
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
                  <span>
                    Archivos originales respaldados con hash criptográfico SHA-256 para verificación
                    de entrega.
                  </span>
                </div>
              </div>
            </aside>
          )
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
                <Sliders size={18} color="#1E192B" />
                <h3>Ajustes de Bandeja y Chat</h3>
              </div>
              <button
                type="button"
                className="chat-modal-close-btn"
                onClick={() => setShowInboxSettings(false)}
                title="Cerrar ventana de ajustes"
                aria-label="Cerrar ajustes"
              >
                <X size={16} />
              </button>
            </div>

            <div className="chat-modal-body">
              {/* Sección 1: Bandeja de Entrada */}
              <div className="chat-settings-section">
                <h4 className="chat-settings-title">Bandeja de Entrada</h4>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Vista compacta de conversaciones</strong>
                    <span>Muestra más conversaciones en pantalla con espaciado reducido.</span>
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
                    <span>Reproduce un aviso auditivo al enviar o recibir mensajes.</span>
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
                      aria-label="Alternar sonidos de notificación"
                    >
                      <span className="chat-toggle-handle" />
                    </button>
                  </div>
                </div>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Solo encargos activos</strong>
                    <span>Oculta automáticamente conversaciones de encargos ya finalizados.</span>
                  </div>
                  <button
                    type="button"
                    className={`chat-toggle-switch ${chatSettings.onlyActiveOrders ? 'is-on' : ''}`}
                    onClick={() => toggleSetting('onlyActiveOrders')}
                    aria-label="Alternar solo encargos activos"
                  >
                    <span className="chat-toggle-handle" />
                  </button>
                </div>
              </div>

              {/* Sección 2: Comportamiento del Chat */}
              <div className="chat-settings-section">
                <h4 className="chat-settings-title">Comportamiento del Chat</h4>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Enviar mensajes con Enter</strong>
                    <span>Presiona Enter para enviar; usa Shift + Enter para un salto de línea.</span>
                  </div>
                  <button
                    type="button"
                    className={`chat-toggle-switch ${chatSettings.sendOnEnter ? 'is-on' : ''}`}
                    onClick={() => toggleSetting('sendOnEnter')}
                    aria-label="Alternar enviar con tecla Enter"
                  >
                    <span className="chat-toggle-handle" />
                  </button>
                </div>

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Desplazamiento automático (Auto-scroll)</strong>
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

                <div className="chat-settings-row">
                  <div className="chat-settings-label">
                    <strong>Marcas de tiempo completas</strong>
                    <span>Muestra fecha y hora detalladas en cada burbuja de mensaje.</span>
                  </div>
                  <button
                    type="button"
                    className={`chat-toggle-switch ${chatSettings.showFullTimestamps ? 'is-on' : ''}`}
                    onClick={() => toggleSetting('showFullTimestamps')}
                    aria-label="Alternar marcas de tiempo completas"
                  >
                    <span className="chat-toggle-handle" />
                  </button>
                </div>
              </div>

              {/* Sección 3: Estado de Presencia y Conexión en Tiempo Real */}
              <div className="chat-settings-section">
                <h4 className="chat-settings-title">Estado de Presencia y Conexión</h4>
                <div style={{ background: '#F9FAFB', border: '1.5px solid #1E192B', borderRadius: 8, padding: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', display: 'block' }}>Tu cuenta ({user?.name || user?.email || 'Invitado'}):</strong>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span className={`chat-online-dot ${user ? 'is-online' : 'is-offline'}`} style={{ width: 8, height: 8 }} />
                        <span style={{ fontSize: '0.8rem', color: user ? '#059669' : '#6B7280', fontWeight: 700 }}>
                          {user ? 'En línea (Sesión activa en tu cuenta)' : 'Sin sesión iniciada'}
                        </span>
                      </div>
                    </div>
                    {user && (
                      <button
                        type="button"
                        className="chat-btn-action-white"
                        style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
                        onClick={() => {
                          setUserOnline(user, 'En línea')
                          setPresenceRegistry(getPresenceRegistry())
                        }}
                      >
                        Revalidar mi estado en línea
                      </button>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.65rem' }}>
                    <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
                      Conmutar presencia de contactos (Prueba interactiva):
                    </strong>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                      Haz clic en cualquier contacto para simular su entrada o salida de la cuenta y comprobar en tiempo real cómo cambia su indicador a "En línea" o "Desconectado":
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {conversations.filter((c) => !c.isBot).map((c) => {
                        const p = c.artist
                        const pStatus = checkParticipantOnline(p, presenceRegistry)
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className="chat-btn-action-white"
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.25rem 0.55rem',
                              borderColor: pStatus.isOnline ? '#059669' : '#D1D5DB',
                              background: pStatus.isOnline ? '#ECFDF5' : '#FFFFFF',
                              color: pStatus.isOnline ? '#065F46' : '#6B7280',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                            }}
                            onClick={() => toggleParticipantPresence(p)}
                            title={`Clic para alternar estado de ${p.name}`}
                          >
                            <span className={`chat-online-dot ${pStatus.badgeClass}`} style={{ width: 7, height: 7 }} />
                            <span>{p.name}: {pStatus.isOnline ? 'En línea' : 'Desconectado'}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 4: Acciones rápidas de mantenimiento */}
              <div className="chat-settings-section">
                <h4 className="chat-settings-title">Acciones de Mantenimiento</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="chat-btn-action-white"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck size={14} />
                    Marcar todos como leídos
                  </button>
                  <button
                    type="button"
                    className="chat-btn-action-white"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    onClick={handleResetArtieChat}
                  >
                    <RotateCcw size={14} />
                    Reiniciar conversación con Artie
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
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}
