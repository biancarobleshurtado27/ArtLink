import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Heart,
  HelpCircle,
  Inbox,
  Laptop,
  Lock,
  MessageCircle,
  Paperclip,
  Search,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  User,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import useAuth from '../hooks/useAuth'
import usePrivateRequests from '../hooks/usePrivateRequests'
import { updateRequest } from '../services/requestService'
import { getNotificationsByUser, markNotificationAsRead, createNotification } from '../services/notificationService'
import { triggerNotificationsUpdate, NOTIFICATIONS_CHANGED_EVENT } from '../hooks/useNotificationBadges'
import useAlert from '../hooks/useAlert'
import FloatingStars, { DecorativeStar } from '../components/FloatingStars'
import '../styles/requestsPop.css'

export default function PrivateRequestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const { requests, loading: requestsLoading, error: requestsError, reload: reloadRequests } = usePrivateRequests()

  // Notificaciones reales del usuario
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  // Filtros y búsqueda
  const [activeTab, setActiveTab] = useState('all') // 'all', 'commissions', 'wip', 'escrow', 'community'
  const [searchTerm, setSearchTerm] = useState('')
  const [orderMode, setOrderMode] = useState('Prioridad Crítica') // 'Prioridad Crítica', 'Más Recientes', 'Mayor Monto'
  const [noticeMode, setNoticeMode] = useState('push') // 'push', 'email'

  // Filtros de entrada checkbox (sidebar)
  const [sidebarFilters, setSidebarFilters] = useState({
    commissions: true,
    wip: true,
    escrow: true,
    dms: true,
    mentions: true,
  })

  // Modales interactivos con datos reales
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [showEscrowProofModal, setShowEscrowProofModal] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')
  const [showBotTemplatesModal, setShowBotTemplatesModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const [allReadMarked, setAllReadMarked] = useState(() => {
    try {
      return localStorage.getItem('artlink_requests_all_read') === 'true'
    } catch {
      return false
    }
  })

  // Cargar notificaciones reales del usuario autenticado
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      return
    }
    setNotificationsLoading(true)
    try {
      const data = await getNotificationsByUser(user.id)
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadNotifications()
    const handleUpdate = () => {
      loadNotifications()
      reloadRequests()
    }
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleUpdate)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleUpdate)
  }, [loadNotifications, reloadRequests])

  // Disparar toast temporal
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Marcar todo como leído
  const handleMarkAllAsRead = async () => {
    setAllReadMarked(true)
    try {
      localStorage.setItem('artlink_requests_all_read', 'true')
    } catch {}

    if (user?.id && notifications.length > 0) {
      try {
        await Promise.all(
          notifications.filter((n) => !n.read).map((n) => markNotificationAsRead(n.id, user.id))
        )
      } catch {}
    }
    loadNotifications()
    triggerNotificationsUpdate()
    triggerToast('Todas las alertas y notificaciones fueron marcadas como leídas')
  }

  // Alternar orden
  const cycleOrder = () => {
    if (orderMode === 'Prioridad Crítica') setOrderMode('Más Recientes')
    else if (orderMode === 'Más Recientes') setOrderMode('Mayor Monto')
    else setOrderMode('Prioridad Crítica')
  }

  // Alternar checkboxes del sidebar
  const toggleSidebarFilter = (key) => {
    setSidebarFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Restablecer filtros del sidebar
  const resetSidebarFilters = () => {
    setSidebarFilters({
      commissions: true,
      wip: true,
      escrow: true,
      dms: true,
      mentions: true,
    })
    setActiveTab('all')
    setSearchTerm('')
    triggerToast('Filtros restablecidos al valor predeterminado')
  }

  // Acciones reales sobre solicitudes
  const handleAcceptRequest = async (req) => {
    try {
      await updateRequest(req.id, { status: 'in_progress', escrowStatus: 'held_in_escrow' })

      // Notificar formalmente al cliente solicitante
      await createNotification({
        userId: req.clientId,
        type: 'request_accepted',
        title: '¡Propuesta de comisión aceptada!',
        message: `${req.artistName || user?.name || 'El artista'} ha aceptado tu propuesta #${req.id.slice(-6)}. El encargo se encuentra en desarrollo con fondos protegidos en custodia Escrow.`,
        requestId: req.id,
        read: false,
        createdAt: new Date().toISOString(),
      }).catch(() => {})

      setShowAcceptModal(false)
      setSelectedRequest(null)
      showAlert({
        type: 'success',
        title: '¡Solicitud aceptada!',
        message: `Has aceptado la propuesta #${req.id.slice(-6)}. El encargo se encuentra en desarrollo con fondos protegidos en custodia Escrow.`,
        eyebrow: 'ArtLink / solicitud aceptada',
      })
      reloadRequests()
      triggerNotificationsUpdate()
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Error al aceptar solicitud',
        message: 'Error al aceptar la solicitud: ' + (err.message || 'Error del servidor'),
        eyebrow: 'ArtLink / error',
      })
    }
  }

  const handleRejectRequest = async (req) => {
    try {
      await updateRequest(req.id, { status: 'cancelled' })

      // Notificar formalmente al cliente solicitante
      await createNotification({
        userId: req.clientId,
        type: 'request_rejected',
        title: 'Propuesta de comisión no aceptada',
        message: `${req.artistName || user?.name || 'El artista'} no puede tomar tu encargo #${req.id.slice(-6)} en este momento. La reserva de fondos ha sido liberada.`,
        requestId: req.id,
        read: false,
        createdAt: new Date().toISOString(),
      }).catch(() => {})

      showAlert({
        type: 'info',
        title: 'Solicitud rechazada',
        message: `La solicitud #${req.id.slice(-6)} ha sido cancelada amablemente. La reserva de fondos del cliente fue liberada.`,
        eyebrow: 'ArtLink / solicitud rechazada',
      })
      reloadRequests()
      triggerNotificationsUpdate()
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Error al cancelar solicitud',
        message: 'Error al cancelar la solicitud: ' + (err.message || 'Error del servidor'),
        eyebrow: 'ArtLink / error',
      })
    }
  }

  const handleApproveMilestone = async (req) => {
    try {
      await updateRequest(req.id, { status: 'completed', escrowStatus: 'released' })

      const targetArtist = req.artistUserId || req.artistId
      await createNotification({
        userId: targetArtist,
        type: 'commission_completed',
        title: '¡Entrega aprobada y fondos liberados!',
        message: `${req.clientName || user?.name || 'El cliente'} ha aprobado la entrega del encargo #${req.id.slice(-6)}. Los fondos en custodia han sido liberados.`,
        requestId: req.id,
        read: false,
        createdAt: new Date().toISOString(),
      }).catch(() => {})

      showAlert({
        type: 'success',
        title: 'Cambio de estado: ¡Entrega aprobada!',
        message: `Entrega de encargo #${req.id.slice(-6)} aprobada satisfactoriamente. Los fondos bajo custodia Escrow han sido liberados al artista.`,
        eyebrow: 'ArtLink / estado de comisión',
      })
      reloadRequests()
      triggerNotificationsUpdate()
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Error al aprobar entrega',
        message: 'Error al aprobar entrega: ' + (err.message || 'Error del servidor'),
        eyebrow: 'ArtLink / error',
      })
    }
  }

  const handleSendRevision = async () => {
    if (!selectedRequest) return
    try {
      await updateRequest(selectedRequest.id, { status: 'in_progress', revisionRequested: true })

      const targetArtist = selectedRequest.artistUserId || selectedRequest.artistId
      await createNotification({
        userId: targetArtist,
        type: 'revision_requested',
        title: 'Solicitud de ajustes en comisión',
        message: `${selectedRequest.clientName || user?.name || 'El cliente'} ha solicitado ajustes en el encargo #${selectedRequest.id.slice(-6)}: "${revisionNotes.slice(0, 80)}"`,
        requestId: selectedRequest.id,
        read: false,
        createdAt: new Date().toISOString(),
      }).catch(() => {})

      setShowRevisionModal(false)
      setRevisionNotes('')
      showAlert({
        type: 'info',
        title: 'Cambio de estado: Observaciones enviadas',
        message: `Observaciones enviadas para el encargo #${selectedRequest.id.slice(-6)}. El estado continúa en progreso con ajustes solicitados.`,
        eyebrow: 'ArtLink / estado de comisión',
      })
      reloadRequests()
      triggerNotificationsUpdate()
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Error al solicitar ajustes',
        message: 'Error al solicitar ajustes: ' + (err.message || 'Error del servidor'),
        eyebrow: 'ArtLink / error',
      })
    }
  }

  // Exportar CSV dinámicamente con datos reales
  const handleExportCSV = () => {
    if (requests.length === 0 && notifications.length === 0) {
      triggerToast('No hay solicitudes ni notificaciones registradas para exportar')
      return
    }

    const header = 'ID,Tipo,Contraparte,Monto_USD,Estado,Fecha\n'
    const rows = requests.map((r) => {
      const isClient = String(user?.id) === String(r.clientId)
      const partner = isClient ? (r.artistName || 'Artista') : (r.clientName || 'Cliente')
      const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Reciente'
      const amount = (r.budget || r.price || 0).toFixed(2)
      return `"#${r.id.slice(-6)}","Solicitud Encargo","${partner}",${amount},"${r.status || 'pendiente'}","${date}"`
    })

    const notifRows = notifications.map((n) => {
      const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Reciente'
      return `"${n.id}","Notificación","${n.title || 'ArtLink'}","0.00","${n.read ? 'Leída' : 'Nueva'}","${date}"`
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + header + [...rows, ...notifRows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ArtLink_Historial_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Historial real descargado en formato CSV')
  }

  // Exportar PDF / Reporte
  const handleExportPDF = () => {
    window.print()
  }

  // ── CÁLCULO DE MÉTRICAS Y LISTAS FILTRADAS CON DATOS REALES ──
  const userIdStr = String(user?.id || '')

  // Filtrado de solicitudes
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Búsqueda de texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchTitle = (req.commissionTitle || '').toLowerCase().includes(query)
        const matchDesc = (req.description || '').toLowerCase().includes(query)
        const matchArtist = (req.artistName || '').toLowerCase().includes(query)
        const matchClient = (req.clientName || '').toLowerCase().includes(query)
        const matchId = String(req.id).toLowerCase().includes(query)
        if (!matchTitle && !matchDesc && !matchArtist && !matchClient && !matchId) {
          return false
        }
      }

      // Filtro por tab
      if (activeTab === 'commissions') {
        return req.status === 'pending' || req.status === 'waitlist' || req.status === 'in_progress' || req.status === 'completed'
      }
      if (activeTab === 'wip') {
        return req.status === 'in_review' || req.status === 'in_progress'
      }
      if (activeTab === 'escrow') {
        return req.escrowStatus === 'held_in_escrow' || Number(req.budget) > 0
      }
      if (activeTab === 'community') {
        return false // Las interacciones comunitarias son notificaciones
      }

      // Tab 'all' - validar contra sidebar checkboxes
      const isCommission = req.status === 'pending' || req.status === 'waitlist' || req.status === 'completed'
      const isWip = req.status === 'in_review' || req.status === 'in_progress'
      const isEscrow = req.escrowStatus === 'held_in_escrow'

      if (isCommission && !sidebarFilters.commissions) return false
      if (isWip && !sidebarFilters.wip) return false
      if (isEscrow && !sidebarFilters.escrow) return false

      return true
    }).sort((a, b) => {
      if (orderMode === 'Prioridad Crítica') {
        const aCritical = a.status === 'pending' || a.status === 'waitlist' || a.status === 'in_review'
        const bCritical = b.status === 'pending' || b.status === 'waitlist' || b.status === 'in_review'
        if (aCritical && !bCritical) return -1
        if (!aCritical && bCritical) return 1
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
      if (orderMode === 'Mayor Monto') {
        return (Number(b.budget) || 0) - (Number(a.budget) || 0)
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [requests, activeTab, searchTerm, sidebarFilters, orderMode])

  // Filtrado de notificaciones
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchTitle = (notif.title || '').toLowerCase().includes(query)
        const matchMsg = (notif.message || notif.body || '').toLowerCase().includes(query)
        if (!matchTitle && !matchMsg) return false
      }

      if (activeTab === 'commissions') {
        return notif.type === 'commission' || notif.type === 'solicitud'
      }
      if (activeTab === 'wip') {
        return notif.type === 'wip' || notif.type === 'revision'
      }
      if (activeTab === 'escrow') {
        return notif.type === 'escrow' || notif.type === 'payment'
      }
      if (activeTab === 'community') {
        return notif.type === 'community' || notif.type === 'mention' || notif.type === 'like' || notif.type === 'follow' || !notif.type
      }

      // Tab 'all' - validar contra sidebar checkboxes
      if (notif.type === 'mention' && !sidebarFilters.mentions) return false
      if (notif.type === 'dms' && !sidebarFilters.dms) return false

      return true
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [notifications, activeTab, searchTerm, sidebarFilters])

  // Métricas reales
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'pending' || r.status === 'waitlist')
  }, [requests])

  const inReviewRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'in_review')
  }, [requests])

  const activeEscrowTotal = useMemo(() => {
    return requests
      .filter((r) => r.escrowStatus === 'held_in_escrow' || r.status === 'in_progress' || r.status === 'in_review')
      .reduce((sum, r) => sum + (Number(r.budget) || Number(r.price) || 0), 0)
  }, [requests])

  // Conteo de elementos que requieren atención hoy
  const actionRequiredRequests = useMemo(() => {
    return requests.filter((r) => {
      const isArtist = r.isArtist ?? (String(r.artistId) === userIdStr || String(r.artistUserId) === userIdStr)
      const isClient = r.isClient ?? (String(r.clientId) === userIdStr)
      if (isArtist && (r.status === 'pending' || r.status === 'waitlist')) return true
      if (isClient && r.status === 'in_review') return true
      return false
    })
  }, [requests, userIdStr])

  const pendingActionCount = allReadMarked
    ? 0
    : actionRequiredRequests.length + notifications.filter((n) => !n.read).length

  // Conteos por categoría para tabs
  const tabCounts = useMemo(() => {
    const commissionsCount = requests.filter(
      (r) => r.status === 'pending' || r.status === 'waitlist' || r.status === 'in_progress' || r.status === 'completed'
    ).length
    const wipCount = requests.filter((r) => r.status === 'in_review' || r.status === 'in_progress').length
    const escrowCount = requests.filter((r) => r.escrowStatus === 'held_in_escrow' || Number(r.budget) > 0).length
    const communityCount = notifications.filter(
      (n) => n.type === 'community' || n.type === 'mention' || n.type === 'like' || n.type === 'follow'
    ).length
    const allCount = requests.length + notifications.length

    return {
      all: allCount,
      commissions: commissionsCount,
      wip: wipCount,
      escrow: escrowCount,
      community: communityCount,
    }
  }, [requests, notifications])

  const loading = requestsLoading || notificationsLoading

  if (loading && requests.length === 0 && notifications.length === 0) {
    return <LoadingState label="Cargando solicitudes y notificaciones..." />
  }

  if (requestsError) {
    return <ErrorState message={requestsError.message || 'Error al cargar las solicitudes'} />
  }

  const hasAnyItems = requests.length > 0 || notifications.length > 0
  const hasFilteredItems = filteredRequests.length > 0 || filteredNotifications.length > 0

  return (
    <div className="req-page-container">
      <FloatingStars variant="requests" />
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: '#1E192B',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: 8,
            boxShadow: '3px 3px 0 #8B5CF6',
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. TOP HEADER ROW ── */}
      <header className="req-header-top-row">
        <div className="req-title-group">
          <h1 className="req-main-title">Solicitudes y Notificaciones</h1>
          <div className="req-title-badges">
            <span className="req-badge-action-pending">
              <span className="req-badge-dot-pink" />
              {pendingActionCount === 0
                ? '0 pendientes de acción'
                : `${pendingActionCount} ${pendingActionCount === 1 ? 'pendiente' : 'pendientes'} de acción`}
            </span>
            <span className="req-badge-escrow-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <DecorativeStar size={11} color="#7C3AED" /> ESCROW SHIELD ACTIVO
            </span>
          </div>
        </div>

        <div className="req-header-quick-actions">
          <button
            type="button"
            className="req-btn-mark-read"
            onClick={handleMarkAllAsRead}
          >
            <Check size={15} aria-hidden="true" />
            <span>Marcar todo como leído</span>
          </button>
          <button
            type="button"
            className="req-btn-icon-settings"
            title="Restablecer filtros"
            onClick={resetSidebarFilters}
          >
            <Sliders size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <p className="req-header-subtitle">
        Gestiona encargos entrantes, aprobaciones de hitos en custodia y actualizaciones de tu comunidad creativa independiente.
      </p>

      {/* ── 2. SEARCH & QUICK ORDER ROW ── */}
      <div className="req-search-order-row">
        <div className="req-search-box">
          <Search size={16} color="#6B7280" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por artista, cliente, etiqueta o # de encargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="req-quick-view-wrapper">
          <span className="req-quick-view-label">VISTA RÁPIDA:</span>
          <button
            type="button"
            className="req-quick-order-btn"
            onClick={cycleOrder}
            title="Cambiar criterio de ordenación"
          >
            Orden: {orderMode}
          </button>
        </div>
      </div>

      {/* ── 3. FILTER TABS BAR (DYNAMIC COUNTS) ── */}
      <nav className="req-filter-tabs-bar" aria-label="Categorías de alertas">
        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>Todas las Alertas</span>
          <span className="req-tab-count-badge">{tabCounts.all}</span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'commissions' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('commissions')}
        >
          <span>Solicitudes de Comisión</span>
          <span className="req-tab-count-badge">
            {tabCounts.commissions > 0 ? `${tabCounts.commissions} activas` : '0'}
          </span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'wip' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('wip')}
        >
          <span>Revisiones & Entregas WIP</span>
          <span className="req-tab-count-badge badge-cyan">{tabCounts.wip}</span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'escrow' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('escrow')}
        >
          <Shield size={13} aria-hidden="true" />
          <span>Pagos y Escrow Shield</span>
          <span className="req-tab-count-badge badge-green">{tabCounts.escrow}</span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'community' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <span>Interacciones de Comunidad</span>
          <span className="req-tab-count-badge">{tabCounts.community}</span>
        </button>
      </nav>

      {/* ── 4. THREE TOP KPI METRIC CARDS (DYNAMIC VALUES) ── */}
      <section className="req-kpi-cards-grid" aria-label="Métricas clave de atención">
        {/* Card 1: Cola de Encargos */}
        <div className="req-kpi-card kpi-yellow">
          <div className="req-washi-tape tape-yellow" aria-hidden="true" />
          <div>
            <div className="req-kpi-top-row">
              <span className="req-kpi-eyebrow">COLA DE ENCARGOS</span>
              <div className="req-kpi-icon-circle icon-yellow">
                <Inbox size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="req-kpi-main-value">
              {pendingRequests.length} {pendingRequests.length === 1 ? 'Pendiente' : 'Pendientes'}
            </div>
          </div>
          <p className="req-kpi-subtext">
            <Clock size={13} aria-hidden="true" />
            {pendingRequests.length > 0 ? (
              <span>Encargos por confirmar respuesta</span>
            ) : (
              <span>Sin solicitudes pendientes</span>
            )}
          </p>
        </div>

        {/* Card 2: Revisión Requerida */}
        <div className="req-kpi-card kpi-lavender">
          <div className="req-washi-tape tape-cyan" aria-hidden="true" />
          <div>
            <div className="req-kpi-top-row">
              <span className="req-kpi-eyebrow">REVISIÓN REQUERIDA</span>
              <div className="req-kpi-icon-circle icon-purple">
                <Edit3 size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="req-kpi-main-value">
              {inReviewRequests.length} {inReviewRequests.length === 1 ? 'En Revisión' : 'En Revisión'}
            </div>
          </div>
          <p className="req-kpi-subtext">
            <FileText size={13} aria-hidden="true" />
            {inReviewRequests.length > 0 ? (
              <span>Bocetos e hitos aguardando aprobación</span>
            ) : (
              <span>Todas las revisiones al día</span>
            )}
          </p>
        </div>

        {/* Card 3: Custodia Activa */}
        <div className="req-kpi-card kpi-mint">
          <div className="req-washi-tape tape-mint" aria-hidden="true" />
          <div>
            <div className="req-kpi-top-row">
              <span className="req-kpi-eyebrow">CUSTODIA ACTIVA</span>
              <div className="req-kpi-icon-circle icon-mint">
                <ShieldCheck size={19} aria-hidden="true" />
              </div>
            </div>
            <div className="req-kpi-main-value">
              ${activeEscrowTotal.toFixed(2)} USD
            </div>
          </div>
          <p className="req-kpi-subtext">
            <Lock size={13} aria-hidden="true" />
            {activeEscrowTotal > 0 ? (
              <span>Fondos asegurados hasta tu aprobación</span>
            ) : (
              <span>Sin depósitos en custodia activos</span>
            )}
          </p>
        </div>
      </section>

      {/* ── 5. MAIN TWO-COLUMN CONTENT GRID ── */}
      <div className="req-main-two-columns">
        {/* ══════════════════════════════════════════════════════════════════
           LEFT COLUMN: FEED DE ACCIONES & NOTIFICACIONES REALES
           ══════════════════════════════════════════════════════════════════ */}
        <main className="req-feed-column" id="main-content">
          {!hasAnyItems ? (
            /* ESTADO VACÍO CUANDO NO HAY SOLICITUDES NI NOTIFICACIONES EN LA CUENTA */
            <div className="req-empty-state-box">
              <div className="req-empty-icon-wrap">
                <Inbox size={38} aria-hidden="true" />
              </div>
              <h2 className="req-empty-title">No tienes solicitudes ni notificaciones activas</h2>
              <p className="req-empty-desc">
                Cuando envíes o recibas solicitudes de comisión, o tengas actualizaciones sobre tus proyectos y pagos en custodia, aparecerán aquí en tiempo real.
              </p>
              <div className="req-empty-actions">
                <Link to="/explorar" className="req-btn-primary-purple" style={{ textDecoration: 'none' }}>
                  <Sparkles size={16} aria-hidden="true" />
                  <span>Explorar Creadores</span>
                </Link>
                <Link to="/solicitudes/nueva" className="req-btn-secondary-pink" style={{ textDecoration: 'none' }}>
                  <FileText size={16} aria-hidden="true" />
                  <span>Crear Solicitud</span>
                </Link>
              </div>
            </div>
          ) : !hasFilteredItems ? (
            /* ESTADO VACÍO TRAS APLICAR FILTROS O BÚSQUEDA */
            <div className="req-empty-state-box">
              <div className="req-empty-icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Search size={38} aria-hidden="true" />
              </div>
              <h2 className="req-empty-title">Sin resultados para esta vista</h2>
              <p className="req-empty-desc">
                No hay solicitudes o alertas que coincidan con el término de búsqueda o filtros seleccionados.
              </p>
              <div className="req-empty-actions">
                <button
                  type="button"
                  className="req-btn-primary-purple"
                  onClick={resetSidebarFilters}
                >
                  Restablecer filtros
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── SECCIÓN 1: ACCIÓN REQUERIDA HOY (SOLICITUDES PENDIENTES DE APROBACIÓN) ── */}
              {actionRequiredRequests.length > 0 && (
                <section aria-label="Acciones requeridas hoy">
                  <div className="req-section-header-row">
                    <div className="req-section-badge-title">
                      <span className="req-section-badge-dark">+ ACCIÓN REQUERIDA HOY</span>
                      <span className="req-section-time-hint">REQUIERE TU CONFIRMACIÓN</span>
                    </div>
                  </div>

                  {actionRequiredRequests.map((req) => {
                    const isArtist = req.isArtist ?? (String(req.artistId) === userIdStr || String(req.artistUserId) === userIdStr)
                    const isClient = req.isClient ?? (String(req.clientId) === userIdStr)
                    const counterparty = isClient ? (req.artistName || 'Artista') : (req.clientName || 'Cliente')
                    const counterpartyHandle = isClient ? (req.artistUsername || 'artista') : (req.clientUsername || 'cliente')
                    const counterpartyAvatar = isClient ? req.artistAvatar : req.clientAvatar

                    return (
                      <article key={req.id} className="req-action-card-box">
                        <span className="req-card-washi-tape-tag tag-pink">
                          {req.status === 'in_review' ? 'HITO POR APROBAR' : 'SOLICITUD PENDIENTE'}
                        </span>

                        <div className="req-card-user-row">
                          <div className="req-user-avatar-meta">
                            <div className="req-user-avatar-wrap">
                              <img
                                src={counterpartyAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(counterparty)}&background=random`}
                                alt={counterparty}
                                className="req-user-avatar-img"
                              />
                              <span className="req-user-check-badge">
                                <Check size={11} aria-hidden="true" />
                              </span>
                            </div>
                            <div className="req-user-titles">
                              <div className="req-user-name-line">
                                <strong>{counterparty}</strong>
                                <span className="req-user-handle">@{counterpartyHandle}</span>
                                <span className="req-order-id-badge">Encargo #{req.id.slice(-6)}</span>
                              </div>
                              <p className="req-card-statement">
                                {req.commissionTitle || req.description || 'Comisión personalizada ArtLink'}
                              </p>
                            </div>
                          </div>

                          <div className="req-price-time-box">
                            <span className="req-price-amount">${(req.budget || req.price || 0).toFixed(2)} USD</span>
                            {req.desiredDate && (
                              <span className="req-price-deadline">
                                <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                                Plazo: {req.desiredDate}
                              </span>
                            )}
                          </div>
                        </div>

                        {req.description && (
                          <div className="req-briefing-note-box">
                            <div className="req-brief-inner-col">
                              <div className="req-brief-tag-title">
                                <FileText size={12} /> NOTA DEL BRIEFING
                              </div>
                              <p className="req-brief-quote">&quot;{req.description}&quot;</p>
                            </div>
                          </div>
                        )}

                        {/* Botones de acción real */}
                        <div className="req-card-actions-row">
                          {isArtist && (req.status === 'pending' || req.status === 'waitlist') && (
                            <>
                              <button
                                type="button"
                                className="req-btn-primary-purple"
                                onClick={() => {
                                  setSelectedRequest(req)
                                  setShowAcceptModal(true)
                                }}
                              >
                                <Check size={16} aria-hidden="true" />
                                <span>Aceptar Solicitud</span>
                              </button>
                              <button
                                type="button"
                                className="req-btn-secondary-pink"
                                onClick={() => {
                                  setSelectedRequest(req)
                                  setShowRoadmapModal(true)
                                }}
                              >
                                <Eye size={15} aria-hidden="true" />
                                <span>Ver Hoja de Ruta</span>
                              </button>
                              <button
                                type="button"
                                className="req-btn-link-action"
                                onClick={() => handleRejectRequest(req)}
                              >
                                <X size={14} style={{ display: 'inline', marginRight: 2 }} />
                                Rechazar amablemente
                              </button>
                            </>
                          )}

                          {isClient && req.status === 'in_review' && (
                            <>
                              <button
                                type="button"
                                className="req-btn-mint-approve"
                                onClick={() => handleApproveMilestone(req)}
                              >
                                <Check size={16} aria-hidden="true" />
                                <span>Aprobar Entrega & Liberar Custodia</span>
                              </button>
                              <button
                                type="button"
                                className="req-btn-white-outline"
                                onClick={() => {
                                  setSelectedRequest(req)
                                  setShowRevisionModal(true)
                                }}
                              >
                                <Edit3 size={15} aria-hidden="true" />
                                <span>Pedir Modificaciones</span>
                              </button>
                            </>
                          )}

                          <Link
                            to={`/mensajes?requestId=${req.id}`}
                            className="req-btn-link-purple"
                          >
                            <MessageCircle size={15} />
                            <span>Abrir Conversación</span>
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </section>
              )}

              {/* ── SECCIÓN 2: HISTORIAL DE SOLICITUDES REALES ── */}
              {filteredRequests.length > 0 && (
                <section aria-label="Historial de solicitudes activas" style={{ marginTop: '1rem' }}>
                  <div className="req-section-header-row">
                    <div className="req-section-badge-title">
                      <span className="req-section-badge-neutral">
                        + SOLICITUDES Y ENCARGOS ACTIVOS ({filteredRequests.length})
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {filteredRequests.map((req) => {
                      const isClient = req.isClient ?? (String(req.clientId) === userIdStr)
                      const counterparty = isClient ? (req.artistName || 'Artista') : (req.clientName || 'Cliente')
                      const amount = Number(req.budget || req.price || 0)

                      return (
                        <article key={req.id} className="req-recent-event-card">
                          <div className="req-event-icon-circle circle-green">
                            <ShieldCheck size={22} />
                          </div>
                          <div className="req-event-info-col">
                            <div className="req-event-top-line">
                              <strong>{req.commissionTitle || req.description || 'Comisión ArtLink'}</strong>
                              <span className="req-event-escrow-badge">#{req.id.slice(-6)}</span>
                            </div>
                            <p className="req-event-desc-p">
                              Contraparte: <strong>{counterparty}</strong> • Monto: <strong>${amount.toFixed(2)} USD</strong> • Estado:{' '}
                              <strong style={{ color: req.status === 'completed' ? '#16A34A' : '#7C3AED' }}>
                                {req.status === 'in_progress' ? 'En Progreso' : req.status === 'completed' ? 'Completado' : req.status}
                              </strong>
                              {req.escrowStatus === 'held_in_escrow' && ' (Fondos retenidos en Escrow)'}
                            </p>
                            <div className="req-event-meta-line">
                              <button
                                type="button"
                                className="req-event-link-text"
                                onClick={() => {
                                  setSelectedRequest(req)
                                  setShowEscrowProofModal(true)
                                }}
                                style={{ background: 'none', border: 'none', padding: 0 }}
                              >
                                Ver comprobante de custodia Escrow
                              </button>
                              <span>•</span>
                              <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Activa'}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="req-btn-roadmap"
                              onClick={() => setSelectedRequest(req)}
                            >
                              Detalles
                            </button>
                            <Link
                              to={`/mensajes?requestId=${req.id}`}
                              className="req-btn-roadmap"
                              style={{ textDecoration: 'none', background: '#EDE9FE', color: '#6D28D9' }}
                            >
                              Chat
                            </Link>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* ── SECCIÓN 3: NOTIFICACIONES REALES DEL SISTEMA ── */}
              {filteredNotifications.length > 0 && (
                <section aria-label="Notificaciones del sistema" style={{ marginTop: '1.25rem' }}>
                  <div className="req-section-header-row">
                    <div className="req-section-badge-title">
                      <span className="req-section-badge-neutral">
                        + NOTIFICACIONES ({filteredNotifications.length})
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {filteredNotifications.map((notif) => (
                      <article
                        key={notif.id}
                        className="req-recent-event-card"
                        style={{ opacity: notif.read ? 0.85 : 1 }}
                      >
                        <div
                          className={`req-event-icon-circle ${
                            notif.type === 'escrow' ? 'circle-green' : 'circle-purple'
                          }`}
                        >
                          {notif.type === 'escrow' ? (
                            <ShieldCheck size={20} />
                          ) : notif.type === 'like' ? (
                            <Heart size={20} />
                          ) : (
                            <FileText size={20} />
                          )}
                        </div>
                        <div className="req-event-info-col">
                          <div className="req-event-top-line">
                            <strong>{notif.title || 'Actualización de ArtLink'}</strong>
                            {!notif.read && (
                              <span className="req-badge-action-pending" style={{ padding: '0.1rem 0.5rem', fontSize: '0.72rem' }}>
                                Nueva
                              </span>
                            )}
                          </div>
                          <p className="req-event-desc-p">
                            {notif.message || notif.body || notif.description || 'Tienes una nueva actualización en tu cuenta.'}
                          </p>
                          <div className="req-event-meta-line">
                            <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Reciente'}</span>
                          </div>
                        </div>
                        {notif.link && (
                          <Link
                            to={notif.link}
                            className="req-btn-roadmap"
                            style={{ textDecoration: 'none' }}
                          >
                            Ver
                          </Link>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* ══════════════════════════════════════════════════════════════════
           RIGHT COLUMN: SIDEBAR FILTERS, BOT TIP & EXPORT
           ══════════════════════════════════════════════════════════════════ */}
        <aside className="req-sidebar-column" aria-label="Filtros y utilidades">
          {/* Card 1: Filtros de Entrada con Conteos Reales */}
          <div className="req-sidebar-box">
            <div className="req-washi-tape tape-pink" style={{ left: '50%' }} aria-hidden="true" />
            <div className="req-sidebar-header-row">
              <h2 className="req-sidebar-title">Filtros de Entrada</h2>
              <button
                type="button"
                className="req-sidebar-reset-btn"
                onClick={resetSidebarFilters}
              >
                RESTABLECER
              </button>
            </div>

            <div className="req-checkbox-list">
              <label className="req-checkbox-row">
                <span className="req-checkbox-label-group">
                  <span
                    className={`req-custom-checkbox ${sidebarFilters.commissions ? 'is-checked' : ''}`}
                    onClick={() => toggleSidebarFilter('commissions')}
                  >
                    {sidebarFilters.commissions && <Check size={13} />}
                  </span>
                  <span>Encargos y Solicitudes</span>
                </span>
                <span className="req-filter-badge-count count-purple">
                  {tabCounts.commissions}
                </span>
              </label>

              <label className="req-checkbox-row">
                <span className="req-checkbox-label-group">
                  <span
                    className={`req-custom-checkbox ${sidebarFilters.wip ? 'is-checked' : ''}`}
                    onClick={() => toggleSidebarFilter('wip')}
                  >
                    {sidebarFilters.wip && <Check size={13} />}
                  </span>
                  <span>Revisiones & Entregas WIP</span>
                </span>
                <span className="req-filter-badge-count count-cyan">
                  {tabCounts.wip}
                </span>
              </label>

              <label className="req-checkbox-row">
                <span className="req-checkbox-label-group">
                  <span
                    className={`req-custom-checkbox ${sidebarFilters.escrow ? 'is-checked' : ''}`}
                    onClick={() => toggleSidebarFilter('escrow')}
                  >
                    {sidebarFilters.escrow && <Check size={13} />}
                  </span>
                  <span>Alertas de Pago & Escrow</span>
                </span>
                <span className="req-filter-badge-count count-pink">
                  {tabCounts.escrow}
                </span>
              </label>

              <label className="req-checkbox-row">
                <span className="req-checkbox-label-group">
                  <span
                    className={`req-custom-checkbox ${sidebarFilters.dms ? 'is-checked' : ''}`}
                    onClick={() => toggleSidebarFilter('dms')}
                  >
                    {sidebarFilters.dms && <Check size={13} />}
                  </span>
                  <span>Mensajes Directos</span>
                </span>
                <span className="req-filter-badge-count count-gray">
                  {notifications.filter((n) => n.type === 'message' || n.type === 'dm').length}
                </span>
              </label>

              <label className="req-checkbox-row">
                <span className="req-checkbox-label-group">
                  <span
                    className={`req-custom-checkbox ${sidebarFilters.mentions ? 'is-checked' : ''}`}
                    onClick={() => toggleSidebarFilter('mentions')}
                  >
                    {sidebarFilters.mentions && <Check size={13} />}
                  </span>
                  <span>Menciones & Comunidad</span>
                </span>
                <span className="req-filter-badge-count count-gray">
                  {tabCounts.community}
                </span>
              </label>
            </div>

            {/* Selector Modo de Aviso */}
            <div className="req-notice-mode-block">
              <span className="req-notice-mode-label">MODO DE AVISO</span>
              <div className="req-segmented-control" role="group" aria-label="Modo de aviso">
                <button
                  type="button"
                  className={`req-segment-btn ${noticeMode === 'push' ? 'is-active' : ''}`}
                  onClick={() => {
                    setNoticeMode('push')
                    triggerToast('Notificaciones configuradas para App Push en tiempo real')
                  }}
                >
                  En App (Push)
                </button>
                <button
                  type="button"
                  className={`req-segment-btn ${noticeMode === 'email' ? 'is-active' : ''}`}
                  onClick={() => {
                    setNoticeMode('email')
                    triggerToast('Resumen diario por correo activado')
                  }}
                >
                  Correo Diario
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Consejo de Artie Bot */}
          <div className="req-artie-tip-box">
            <div className="req-artie-header">
              <div className="req-artie-icon-badge">
                <Bot size={22} />
              </div>
              <div className="req-artie-title-block">
                <span className="req-artie-tag-top">CONSEJO DE ARTIE BOT</span>
                <h3 className="req-artie-title-main">Optimiza tu Flujo</h3>
              </div>
            </div>
            <p className="req-artie-body-text" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
              <DecorativeStar size={13} color="#7C3AED" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Dato pro:</strong> Responder oportunamente y registrar avances de bocetos protege el cronograma del encargo y asegura la liberación puntual de fondos en custodia.</span>
            </p>
            <button
              type="button"
              className="req-artie-link-action"
              onClick={() => setShowBotTemplatesModal(true)}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <span>Ver plantillas de respuesta</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Exportar Historial Real */}
          <div className="req-export-box">
            <div className="req-export-header">
              <div className="req-export-icon">
                <Download size={20} />
              </div>
              <strong>Exportar Historial</strong>
            </div>
            <p className="req-export-desc">
              Descarga un registro oficial de tus comisiones y auditoría de fondos en custodia.
            </p>
            <div className="req-export-btns-row">
              <button
                type="button"
                className="req-export-btn"
                onClick={handleExportCSV}
              >
                <FileSpreadsheet size={15} color="#059669" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                className="req-export-btn"
                onClick={handleExportPDF}
              >
                <FileText size={15} color="#DC2626" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         MODALES INTERACTIVOS DINÁMICOS
         ══════════════════════════════════════════════════════════════════ */}

      {/* 1. Modal Aceptar Solicitud */}
      {selectedRequest && (
        <Modal
          open={showAcceptModal}
          title={`Aceptar Solicitud de Comisión #${selectedRequest.id.slice(-6)}`}
          onClose={() => setShowAcceptModal(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.92rem' }}>
              Al aceptar esta solicitud de <strong>{selectedRequest.clientName || 'Cliente'}</strong>, se activará el contrato con fondos en custodia Escrow por <strong>${(selectedRequest.budget || selectedRequest.price || 0).toFixed(2)} USD</strong>.
            </p>
            <div style={{ background: '#F0FDF4', border: '1.5px solid #16A34A', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#166534' }}>
              ✓ Los fondos permanecen protegidos bajo ArtLink Escrow Shield hasta la entrega final aprobada.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setShowAcceptModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => handleAcceptRequest(selectedRequest)}
              >
                Confirmar y Aceptar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Modal Pedir Modificaciones */}
      {selectedRequest && (
        <Modal
          open={showRevisionModal}
          title={`Solicitar Modificaciones para Encargo #${selectedRequest.id.slice(-6)}`}
          onClose={() => setShowRevisionModal(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9rem' }}>
              Indica los ajustes o revisiones necesarias que el artista debe realizar antes de autorizar la entrega final:
            </p>
            <textarea
              rows={4}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Describe detalladamente los cambios deseados..."
              style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--line)', background: 'var(--surface-soft)', color: 'var(--ink)', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setShowRevisionModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={handleSendRevision}
              >
                Enviar Observaciones
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Modal Hoja de Ruta Dinámica */}
      {selectedRequest && (
        <Modal
          open={showRoadmapModal}
          title={`Hoja de Ruta: Encargo #${selectedRequest.id.slice(-6)}`}
          onClose={() => setShowRoadmapModal(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid var(--line)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>
                  {selectedRequest.commissionTitle || selectedRequest.description || 'Comisión personalizada'}
                </strong>
                <small style={{ color: 'var(--muted)' }}>
                  Presupuesto: ${(selectedRequest.budget || selectedRequest.price || 0).toFixed(2)} USD • Fecha acordada: {selectedRequest.desiredDate || 'Flexible'}
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { num: '1', title: 'Revisión y Aceptación de Briefing', status: selectedRequest.status === 'pending' ? 'Actual' : 'Completado' },
                { num: '2', title: 'Desarrollo de Boceto Preliminar', status: selectedRequest.status === 'in_progress' ? 'Actual' : 'Pendiente' },
                { num: '3', title: 'Revisión y Ajustes de Cliente', status: selectedRequest.status === 'in_review' ? 'Actual' : 'Pendiente' },
                { num: '4', title: 'Entrega Final y Liberación de Fondos Escrow', status: selectedRequest.status === 'completed' ? 'Completado' : 'Pendiente' },
              ].map((step) => (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    border: '1.5px solid var(--line)',
                    borderRadius: 8,
                    background: step.status === 'Actual' ? 'var(--lilac)' : 'var(--paper)',
                    color: 'var(--ink)',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: step.status === 'Actual' ? '#7C3AED' : '#1E192B',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {step.num}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>{step.title}</strong>
                    <small style={{ color: 'var(--muted)' }}>Estado: {step.status}</small>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setShowRoadmapModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. Modal Comprobante de Depósito Escrow Shield */}
      {selectedRequest && (
        <Modal
          open={showEscrowProofModal}
          title="Certificado de Retención en Custodia Escrow"
          onClose={() => setShowEscrowProofModal(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#ECFDF5', border: '2px solid #059669', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <ShieldCheck size={36} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ margin: '0 0 0.25rem', fontFamily: 'var(--font-heading, sans-serif)', fontSize: '1.25rem', color: '#065F46' }}>
                Depósito en Custodia Activo
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>
                Código de custodia: ESC-{selectedRequest.id.slice(-6).toUpperCase()}-ARTLK
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'var(--surface-soft)', border: '1.5px solid var(--line)', padding: '0.65rem', borderRadius: 6, color: 'var(--ink)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>Monto asegurado:</span>
                <strong style={{ fontSize: '1.1rem' }}>${(selectedRequest.budget || selectedRequest.price || 0).toFixed(2)} USD</strong>
              </div>
              <div style={{ background: 'var(--surface-soft)', border: '1.5px solid var(--line)', padding: '0.65rem', borderRadius: 6, color: 'var(--ink)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>Contraparte:</span>
                <strong>{selectedRequest.artistName || selectedRequest.clientName || 'Creador ArtLink'}</strong>
              </div>
              <div style={{ background: 'var(--surface-soft)', border: '1.5px solid var(--line)', padding: '0.65rem', borderRadius: 6, color: 'var(--ink)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>Garantía:</span>
                <strong>Satisfacción o reembolso 100%</strong>
              </div>
              <div style={{ background: 'var(--surface-soft)', border: '1.5px solid var(--line)', padding: '0.65rem', borderRadius: 6, color: 'var(--ink)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>Estado de Escrow:</span>
                <strong style={{ color: '#059669' }}>{selectedRequest.escrowStatus || 'Protegido'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setShowEscrowProofModal(false)}
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Modal Plantillas de Respuesta de Artie Bot */}
      <Modal
        open={showBotTemplatesModal}
        title="Plantillas de Respuesta Rápida ArtLink"
        onClose={() => setShowBotTemplatesModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.88rem' }}>
            Selecciona una plantilla predeterminada para responder cotizaciones en menos de 2 minutos y asegurar la insignia de <em>Respuesta Veloz</em>:
          </p>

          {[
            {
              title: 'Aceptación inmediata de encargo',
              text: '¡Hola! Muchas gracias por pensar en mí para este encargo. Revisé tu brief y referencias y estaré encantado/a de trabajar en él. El plazo y tarifa propuestos son perfectos. ¡Comenzamos!',
            },
            {
              title: 'Solicitud de más referencias / Moodboard',
              text: '¡Hola! Me encanta el concepto de tu comisión. Para asegurarme de capturar exactamente tu visión, ¿podrías compartirme 1 o 2 referencias adicionales de paleta de colores o pose?',
            },
            {
              title: 'Ajuste de calendario por alta demanda',
              text: '¡Hola! Actualmente tengo una cola de comisiones en progreso. Me encantaría hacer tu encargo con un inicio programado para dentro de unos días para dedicarle el 100% de atención.',
            },
          ].map((tpl, i) => (
            <div
              key={i}
              style={{
                border: '1.5px solid var(--line)',
                borderRadius: 8,
                padding: '0.75rem',
                background: 'var(--surface-soft)',
                color: 'var(--ink)',
              }}
            >
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                {tpl.title}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                {tpl.text}
              </p>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => {
                  setShowBotTemplatesModal(false)
                  triggerToast(`Plantilla "${tpl.title}" copiada`)
                }}
              >
                Usar en Conversación
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setShowBotTemplatesModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* 6. Modal de Detalle Completo para Solicitud Seleccionada */}
      <Modal
        open={Boolean(selectedRequest && !showAcceptModal && !showRevisionModal && !showRoadmapModal && !showEscrowProofModal)}
        title="Detalle de Solicitud de Comisión"
        onClose={() => setSelectedRequest(null)}
      >
        {selectedRequest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800 }}>ID: #{selectedRequest.id.slice(-6)}</span>
              <span className="req-event-escrow-badge">{selectedRequest.status || 'Activa'}</span>
            </div>

            <div>
              <strong>Descripción / Brief:</strong>
              <p style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 6, padding: '0.75rem', marginTop: '0.25rem' }}>
                {selectedRequest.description || selectedRequest.commissionTitle || 'Sin descripción detallada provista.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <small style={{ color: 'var(--muted)', display: 'block' }}>Presupuesto:</small>
                <strong style={{ fontSize: '1.2rem', color: '#6D28D9' }}>
                  ${(selectedRequest.budget || selectedRequest.price || 0).toFixed(2)} USD
                </strong>
              </div>
              <div>
                <small style={{ color: 'var(--muted)', display: 'block' }}>Fecha acordada:</small>
                <strong>{selectedRequest.desiredDate || 'No definida'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Link
                to={`/mensajes?requestId=${selectedRequest.id}`}
                className="button button-primary"
                onClick={() => setSelectedRequest(null)}
              >
                <MessageCircle size={15} /> Ir a la conversación
              </Link>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setSelectedRequest(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
