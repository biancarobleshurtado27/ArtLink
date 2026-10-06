import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Grid,
  Inbox,
  Layers,
  LayoutDashboard,
  List,
  Lock,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  UploadCloud,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import CommissionForm from '../components/CommissionForm'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PortfolioForm from '../components/PortfolioForm'
import FloatingStars, { DecorativeStar } from '../components/FloatingStars'
import useArtistWorkspace from '../hooks/useArtistWorkspace'
import useAlert from '../hooks/useAlert'
import { handleImageError } from '../utils/imageFallback'
import '../styles/artistDashboard.css'

export default function ArtistPanelPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const workspace = useArtistWorkspace()
  const { profile, portfolio, commissions, requests, loading, busy, error, actions } = workspace

  // Sub-navigation sections
  const section = location.pathname.endsWith('portafolio')
    ? 'portfolio'
    : location.pathname.endsWith('comisiones')
    ? 'commissions'
    : location.pathname.endsWith('solicitudes')
    ? 'requests'
    : 'overview'

  // Portfolio & Commissions editing
  const [editingPortfolio, setEditingPortfolio] = useState(null)
  const [editingCommission, setEditingCommission] = useState(null)

  // Profile data defaults & state
  const artistName = profile?.displayName || profile?.name || 'Creador ArtLink'
  const artistHandle = (profile?.username || 'artista').toUpperCase()
  const artistAvatar =
    profile?.avatar ||
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=8B5CF6&color=fff`

  // Availability & slots
  const [isPaused, setIsPaused] = useState(profile?.availability === 'closed' || false)
  const [totalSlots, setTotalSlots] = useState(profile?.slots || 5)
  const [occupiedSlots, setOccupiedSlots] = useState(0)

  // Escrow balance with localStorage persistence
  const [availableBalance, setAvailableBalance] = useState(() => {
    const saved = localStorage.getItem('artlink_artist_balance')
    return saved !== null ? Number(saved) : 0.0
  })

  const [escrowCustody, setEscrowCustody] = useState(0.0)

  // Feedback flotante unificado
  const showToast = (msg, type = 'info') => {
    showAlert({
      type,
      title: 'Notificación de Taller',
      message: msg,
      eyebrow: 'ArtLink / taller',
      autoCloseMs: 3500,
    })
  }

  // Active Kanban Pipeline Orders
  const [kanbanOrders, setKanbanOrders] = useState([])

  // Completed Orders (Col 4)
  const [completedOrders, setCompletedOrders] = useState([])

  // Formats in Store (Right column)
  const [formatsInStore, setFormatsInStore] = useState([])

  // Recent Activity Log
  const [activityList, setActivityList] = useState([])

  // Sincronizar formatos en tienda a partir de comisiones reales del catálogo
  useEffect(() => {
    if (Array.isArray(commissions) && commissions.length > 0) {
      setFormatsInStore(
        commissions.map((c, idx) => ({
          id: c.id || `fmt-${idx + 1}`,
          name: c.title || 'Formato de Comisión',
          price: c.price || 0,
          active: c.status !== 'paused',
          color: idx % 3 === 0 ? 'purple' : idx % 3 === 1 ? 'green' : 'coral',
          thumb: c.examples?.[0] || c.image || '/images/catalog/character_design_01.jpg',
        }))
      )
    } else {
      setFormatsInStore([])
    }
  }, [commissions])

  // Derivar pedidos activos, cupos y balance en custodia de solicitudes reales
  useEffect(() => {
    if (!Array.isArray(requests) || requests.length === 0) {
      setKanbanOrders([])
      setCompletedOrders([])
      setOccupiedSlots(0)
      setEscrowCustody(0.0)
      return
    }

    const activeList = requests.filter((r) =>
      ['pending', 'waitlist', 'accepted', 'in_progress', 'review'].includes(r.status)
    )
    setOccupiedSlots(activeList.length)

    const inEscrowTotal = requests
      .filter((r) => r.escrowStatus === 'held_in_escrow' || r.status === 'in_progress' || r.status === 'review')
      .reduce((sum, r) => sum + Number(r.price || r.budget || 0), 0)
    setEscrowCustody(inEscrowTotal)

    const mapped = requests
      .filter((r) => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected')
      .map((r) => {
        let col = 'col1'
        if (r.status === 'in_progress') col = 'col2'
        if (r.status === 'review') col = 'col3'

        return {
          id: r.id,
          col,
          clientHandle: r.clientUsername ? `@${r.clientUsername}` : (r.clientName || 'Cliente'),
          clientName: r.clientName || 'Cliente ArtLink',
          clientInitials: (r.clientName || 'CL').slice(0, 2).toUpperCase(),
          price: r.price || r.budget || 0,
          title: r.commissionTitle || r.title || 'Comisión personalizada',
          deadline: r.desiredDate ? `Para ${r.desiredDate}` : 'Plazo estándar',
          attachmentsText: r.references?.length ? `${r.references.length} referencias` : 'Sin adjuntos',
          briefDetails: {
            specs: r.description || 'Detalles del encargo acordados.',
            description: r.description || '',
            clientNotes: r.notes || '',
          },
          timeRemaining: 'En curso',
        }
      })
    setKanbanOrders(mapped)

    const completed = requests
      .filter((r) => r.status === 'completed')
      .map((r) => ({
        id: r.id,
        clientHandle: r.clientUsername ? `@${r.clientUsername}` : (r.clientName || 'Cliente'),
        amount: r.price || r.budget || 0,
        label: 'Fondos liberados',
      }))
    setCompletedOrders(completed)
  }, [requests])

  // View Mode: 'kanban' or 'list'
  const [viewMode, setViewMode] = useState('kanban')
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false)

  // Artie Bot Advice
  const [artieApplied, setArtieApplied] = useState(false)

  // Modals state
  const [selectedBriefOrder, setSelectedBriefOrder] = useState(null)
  const [showUploadWipModal, setShowUploadWipModal] = useState(false)
  const [targetWipOrder, setTargetWipOrder] = useState(null)
  const [showFinalRenderModal, setShowFinalRenderModal] = useState(false)
  const [targetRenderOrder, setTargetRenderOrder] = useState(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showNewFormatModal, setShowNewFormatModal] = useState(false)
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const [showBillingHistoryModal, setShowBillingHistoryModal] = useState(false)

  // Synchronize available balance in localStorage
  useEffect(() => {
    localStorage.setItem('artlink_artist_balance', availableBalance.toString())
  }, [availableBalance])

  // Toggle availability
  const togglePauseSolicitudes = async () => {
    const nextStatus = !isPaused
    setIsPaused(nextStatus)
    try {
      if (actions?.updateAvailability) {
        await actions.updateAvailability(nextStatus ? 'closed' : 'open', totalSlots)
      }
    } catch {
      // Optimistic update
    }
    showToast(
      nextStatus
        ? 'Solicitudes pausadas. Tu agenda figura como completa temporalmente.'
        : 'Solicitudes reanudadas. Los clientes ya pueden solicitarte nuevos encargos.'
    )
  }

  // Apply Artie Bot Suggestion
  const applyArtieSuggestion = () => {
    if (artieApplied) return
    setTotalSlots((prev) => prev + 1)
    setArtieApplied(true)
    showToast('¡Sugerencia de Artie aplicada! Se añadió +1 cupo libre y se optimizó tu tarifa base a $250 USD.')
  }

  // Toggle Format Switch in Store
  const toggleFormatActive = (formatId) => {
    setFormatsInStore((prev) =>
      prev.map((f) => {
        if (f.id === formatId) {
          const updated = { ...f, active: !f.active }
          showToast(
            updated.active
              ? `✔ Formato "${f.name}" activado en tu tienda.`
              : `⏸ Formato "${f.name}" pausado temporalmente.`
          )
          return updated
        }
        return f
      })
    )
  }

  // Advance Order 1 (Brief Aprobado -> En Boceto)
  const startOrderWork = (order) => {
    setKanbanOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              col: 'col2',
              wipVersion: 'Boceto v1.0 en desarrollo',
              isUrgent: false,
              hasFeedback: false,
              wipImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
              timeRemaining: '72 hrs para primera revisión',
            }
          : o
      )
    )
    setSelectedBriefOrder(null)
    showToast(`¡Comenzaste el encargo de ${order.clientHandle}! Movido a "En Boceto / WIP".`)
    showAlert({
      type: 'success',
      title: 'Cambio de estado: En Boceto / WIP',
      message: `¡Comenzaste el encargo de ${order.clientHandle}! Se ha trasladado a la etapa de desarrollo y bocetos preliminares.`,
      eyebrow: 'ArtLink / estado de comisión',
    })
  }

  // Open WIP upload modal
  const openWipUpload = (order) => {
    setTargetWipOrder(order || kanbanOrders.find((o) => o.col === 'col2') || kanbanOrders[0])
    setShowUploadWipModal(true)
  }

  // Submit WIP
  const handleUploadWipSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const version = form.get('version') || 'v1.3'
    const notes = form.get('notes') || 'Nueva versión con ajustes solicitados'

    if (targetWipOrder) {
      setKanbanOrders((prev) =>
        prev.map((o) =>
          o.id === targetWipOrder.id
            ? {
                ...o,
                wipVersion: `Boceto ${version} subido`,
                hasFeedback: false,
                timeRemaining: '48 hrs para feedback del cliente',
              }
            : o
        )
      )
    }

    setActivityList((prev) => [
      {
        id: `act-${Date.now()}`,
        iconType: 'mint',
        title: `Entregable ${version} subido para ${targetWipOrder?.clientHandle || '@AlexR'}`,
        sub: notes,
        time: 'Hace un momento',
      },
      ...prev,
    ])

    setShowUploadWipModal(false)
    showToast(`Entregable ${version} subido exitosamente y notificado al cliente`)
    showAlert({
      type: 'success',
      title: 'Cambio de estado: Entregable WIP subido',
      message: `¡Entregable ${version} subido exitosamente y notificado al cliente!`,
      eyebrow: 'ArtLink / estado de comisión',
    })
  }

  // Submit Final Render
  const handleFinalRenderSubmit = (e) => {
    e.preventDefault()
    const order = targetRenderOrder || kanbanOrders.find((o) => o.col === 'col3')
    if (!order) return

    // Move from active to completed
    setKanbanOrders((prev) => prev.filter((o) => o.id !== order.id))
    setCompletedOrders((prev) => [
      { id: `term-${Date.now()}`, clientHandle: order.clientHandle, amount: order.price, label: 'Fondos liberados' },
      ...prev,
    ])

    // Update balances
    setAvailableBalance((prev) => prev + order.price)
    setEscrowCustody((prev) => Math.max(0, prev - order.price))

    // Activity log
    setActivityList((prev) => [
      {
        id: `act-${Date.now()}`,
        iconType: 'pink',
        title: `Entrega final completada para ${order.clientHandle}`,
        sub: `Pago de $${order.price}.00 USD liberado automáticamente a tu balance disponible`,
        time: 'Hace un momento',
      },
      ...prev,
    ])

    setShowFinalRenderModal(false)
    showToast(`¡Render final entregado! Se liberaron $${order.price}.00 USD a tu balance disponible.`)
    showAlert({
      type: 'success',
      title: 'Cambio de estado: ¡Entrega final completada!',
      message: `¡Render final entregado con éxito! Se liberaron $${order.price}.00 USD a tu balance disponible.`,
      eyebrow: 'ArtLink / estado de comisión',
    })
  }

  // Withdrawal Submit
  const handleWithdrawSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const amount = Number(form.get('amount'))
    const method = form.get('method') || 'PayPal'

    if (isNaN(amount) || amount <= 0) {
      alert('Ingresa un monto válido para retirar.')
      return
    }
    if (amount > availableBalance) {
      alert('El monto ingresado excede tu balance disponible.')
      return
    }

    setAvailableBalance((prev) => prev - amount)
    setActivityList((prev) => [
      {
        id: `act-${Date.now()}`,
        iconType: 'purple',
        title: `Retiro procesado a tu cuenta de ${method}`,
        sub: `Transferencia de $${amount.toFixed(2)} USD en camino a tu cuenta vinculada`,
        time: 'Hace un momento',
      },
      ...prev,
    ])

    setShowWithdrawModal(false)
    showToast(`💳 ¡Retiro de $${amount.toFixed(2)} USD procesado con éxito vía ${method}!`)
  }

  // New Format Submit
  const handleNewFormatSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = form.get('name')
    const priceVal = Number(form.get('price'))

    const newFmt = {
      id: `fmt-${Date.now()}`,
      name,
      price: priceVal,
      active: true,
      color: 'purple',
      thumb: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&q=80',
    }

    setFormatsInStore((prev) => [...prev, newFmt])
    setShowNewFormatModal(false)
    showToast(`¡Nuevo formato "${name}" ($${priceVal} USD) añadido a tu tienda!`)
  }

  // Update total slots
  const handleSlotsSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const val = Number(form.get('slots'))
    setTotalSlots(val)
    setShowSlotsModal(false)
    showToast(`⚙ Capacidad de cupos actualizada a ${val} encargos simultáneos.`)
  }

  // If loading or error states
  if (loading && !profile) return <LoadingState label="Cargando tu panel de creadora en ArtLink..." />
  if (error && !profile) return <ErrorState message={error.message} onRetry={workspace.reload} />

  // Filtered orders for Kanban
  const visibleOrders = kanbanOrders.filter((o) => {
    if (filterUrgentOnly && !o.isUrgent) return false
    return true
  })

  return (
    <div className="art-dash-container" aria-label="Panel de Creador ArtLink">
      <FloatingStars variant="artist-panel" />

      {/* 1. NAVBAR EN CÁPSULA ESTILO HOME PAGE */}
      <div className="art-dash-nav-capsule-wrap">
        <nav className="art-dash-nav-capsule-bar" aria-label="Navegación del panel de creador">
          <Link
            className={`art-dash-nav-pill ${section === 'overview' ? 'active' : ''}`}
            to="/artista/panel"
          >
            <LayoutDashboard size={16} />
            <span>Panel de Creador & Flujo</span>
          </Link>
          <Link
            className={`art-dash-nav-pill ${section === 'requests' ? 'active' : ''}`}
            to="/artista/solicitudes"
          >
            <Inbox size={16} />
            <span>Todas las Solicitudes</span>
            <span className="art-dash-nav-pill-badge">{requests.length}</span>
          </Link>
          <Link
            className={`art-dash-nav-pill ${section === 'portfolio' ? 'active' : ''}`}
            to="/artista/portafolio"
          >
            <Sparkles size={16} />
            <span>Mi Portafolio</span>
            <span className="art-dash-nav-pill-badge">{portfolio.length}</span>
          </Link>
          <Link
            className={`art-dash-nav-pill ${section === 'commissions' ? 'active' : ''}`}
            to="/artista/comisiones"
          >
            <Layers size={16} />
            <span>Catálogo de Tarifas</span>
            <span className="art-dash-nav-pill-badge">{commissions.length}</span>
          </Link>
        </nav>
      </div>

      {/* 2. SUB-PÁGINA: TODAS LAS SOLICITUDES */}
      {section === 'requests' && (
        <section className="art-dash-activity-section" style={{ marginTop: '0', marginBottom: '2.5rem' }}>
          <div className="art-dash-activity-header">
            <div>
              <span className="art-dash-kpi-badge-pill" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                BANDEJA GENERAL DE ENCARGOS
              </span>
              <h2 className="art-dash-activity-title" style={{ fontSize: '1.45rem' }}>
                Todas las Solicitudes Recibidas ({requests.length})
              </h2>
            </div>
            <Link to="/artista/panel" className="art-dash-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
              Volver al Tablero Principal
            </Link>
          </div>

          {requests.length > 0 ? (
            <div className="art-dash-activity-list">
              {requests.map((req) => (
                <div className="art-dash-activity-row" key={req.id}>
                  <div className="art-dash-activity-left">
                    <div className="art-dash-activity-icon purple">
                      <FileText size={18} />
                    </div>
                    <div className="art-dash-activity-desc">
                      <span className="art-dash-activity-main-text">
                        {req.commissionTitle || req.title || 'Solicitud de Encargo'} — <strong>ID: {req.id}</strong>
                      </span>
                      <span className="art-dash-activity-sub-text">
                        Estado: {req.status} • Presupuesto acordado: ${req.budget || req.price || 0} USD
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link
                      to="/solicitudes"
                      className="art-dash-btn-primary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      Gestionar en Solicitudes
                    </Link>
                    <button
                      type="button"
                      className="art-dash-btn-card-outline"
                      onClick={() => navigate('/mensajes')}
                    >
                      <MessageSquare size={13} /> Ver Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tienes solicitudes pendientes"
              description="Cuando los clientes te soliciten nuevos encargos privados, figurarán en esta bandeja."
            />
          )}
        </section>
      )}

      {/* 3. SUB-PÁGINA: GESTIÓN DE PORTAFOLIO */}
      {section === 'portfolio' && (
        <section className="art-dash-activity-section" style={{ marginTop: '0', marginBottom: '2.5rem' }}>
          <div className="art-dash-activity-header">
            <div>
              <span className="art-dash-kpi-badge-pill" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                GALERÍA PÚBLICA
              </span>
              <h2 className="art-dash-activity-title" style={{ fontSize: '1.45rem' }}>
                Piezas de tu Portafolio ({portfolio.length})
              </h2>
            </div>
            <Link to="/artista/panel" className="art-dash-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
              Volver al Tablero Principal
            </Link>
          </div>

          <PortfolioForm
            item={editingPortfolio}
            onSubmit={editingPortfolio ? actions.updatePortfolio : actions.createPortfolio}
            onCancel={() => setEditingPortfolio(null)}
            busy={busy}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.2rem', marginTop: '1.5rem' }}>
            {portfolio.map((item) => (
              <article className="art-dash-order-card" key={item.id} style={{ padding: '0.9rem' }}>
                <img
                  src={item.image}
                  onError={handleImageError}
                  alt={item.title}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.75rem', border: '1.5px solid #1E192B' }}
                />
                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 800 }}>{item.title}</h4>
                  <p style={{ margin: 0, color: '#6D657B', fontSize: '0.78rem' }}>{item.category}</p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                    <Button variant="outline" type="button" onClick={() => setEditingPortfolio(item)}>Editar</Button>
                    <Button variant="secondary" type="button" onClick={() => actions.deletePortfolio(item)}>Eliminar</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. SUB-PÁGINA: GESTIÓN DE COMISIONES */}
      {section === 'commissions' && (
        <section className="art-dash-activity-section" style={{ marginTop: '0', marginBottom: '2.5rem' }}>
          <div className="art-dash-activity-header">
            <div>
              <span className="art-dash-kpi-badge-pill" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                TARIFAS Y FORMATOS
              </span>
              <h2 className="art-dash-activity-title" style={{ fontSize: '1.45rem' }}>
                Catálogo de Comisiones ({commissions.length})
              </h2>
            </div>
            <Link to="/artista/panel" className="art-dash-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
              Volver al Tablero Principal
            </Link>
          </div>

          <CommissionForm
            commission={editingCommission}
            onSubmit={editingCommission ? actions.updateCommission : actions.createCommission}
            onCancel={() => setEditingCommission(null)}
            busy={busy}
          />
        </section>
      )}

      {/* 5. TABLERO PRINCIPAL / OVERVIEW (Fiel a la imagen de referencia) */}
      {section === 'overview' && (
        <>
          {/* TOP PROFILE HERO CARD */}
          <div className="art-dash-hero-wrap">
            <span className="art-dash-top-badge">
              <Star size={13} fill="#FFFFFF" color="#FFFFFF" /> TALLER PRO
            </span>

            <div className="art-dash-hero">
              <div className="art-dash-hero-accent-strip" />

              <div className="art-dash-hero-left">
                {/* Avatar with PRO badge */}
                <div className="art-dash-avatar-box">
                  <img
                    src={artistAvatar}
                    alt={artistName}
                    className="art-dash-avatar-img"
                    onError={handleImageError}
                  />
                  <span className="art-dash-pro-pill">
                    <Zap size={10} color="#EA580C" fill="#EA580C" /> PRO
                  </span>
                </div>

                {/* Hero Information */}
                <div className="art-dash-hero-info">
                  <div className="art-dash-hero-title-row">
                    <h1 className="art-dash-hero-title">¡Hola de nuevo, {artistName}!</h1>
                    <span className="art-dash-handle-pill">@{artistHandle}</span>
                  </div>
                  <p className="art-dash-hero-subtitle">
                    Panel de Creador • Gestiona tus encargos, entregas de bocetos e ingresos asegurados en Escrow Shield.
                  </p>

                  <div className="art-dash-hero-chips">
                    <div className="art-dash-slots-chip">
                      <span className={`art-dash-dot-indicator ${isPaused ? '' : 'is-open'}`} />
                      <span>
                        Cupos de Comisión: <strong>{occupiedSlots}/{totalSlots} Ocupados</strong> ({isPaused ? 'Pausado' : 'Abierto'})
                      </span>
                      <button
                        type="button"
                        className="art-dash-slots-btn"
                        title="Ajustar cupos de comisión"
                        onClick={() => setShowSlotsModal(true)}
                        aria-label="Ajustar cupos"
                      >
                        <Sliders size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className={`art-dash-pause-btn ${isPaused ? 'is-paused' : ''}`}
                      onClick={togglePauseSolicitudes}
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle size={14} color="#059669" /> REANUDAR SOLICITUDES
                        </>
                      ) : (
                        <>
                          <PauseCircle size={14} color="#6D28D9" /> PAUSAR SOLICITUDES
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons Right Stack */}
              <div className="art-dash-hero-actions">
                <button
                  type="button"
                  className="art-dash-btn-primary"
                  onClick={() => setShowNewFormatModal(true)}
                >
                  <Plus size={16} /> Nuevo Formato
                </button>
                <button
                  type="button"
                  className="art-dash-btn-teal"
                  onClick={() => openWipUpload(null)}
                >
                  <UploadCloud size={16} /> Subir Entregable / WIP
                </button>
                <button
                  type="button"
                  className="art-dash-btn-lavender"
                  onClick={() => navigate(`/artista/${profile?.id || 'artist-001'}`)}
                >
                  <Eye size={16} /> Ver Mi Portafolio
                </button>
              </div>
            </div>
          </div>

          {/* 4 KPI METRIC CARDS ROW */}
          <div className="art-dash-kpi-grid">
            {/* Card 1: En Custodia Escrow */}
            <div className="art-dash-kpi-card">
              <div className="art-dash-kpi-top">
                <span className="art-dash-kpi-label">PROTECCIÓN ACTIVA</span>
                <div className="art-dash-kpi-icon-bubble purple">
                  <ShieldCheck size={17} />
                </div>
              </div>
              <div>
                <h3 className="art-dash-kpi-title">En Custodia Escrow</h3>
                <p className="art-dash-kpi-val purple">${escrowCustody.toFixed(2)} USD</p>
              </div>
              <div className="art-dash-kpi-footer">
                <span className="art-dash-dot-indicator" />
                <span>{escrowCustody > 0 ? `${kanbanOrders.length} proyectos con fondos en custodia` : 'Sin proyectos en custodia activa'}</span>
              </div>
            </div>

            {/* Card 2: Disponible Retiro */}
            <div className="art-dash-kpi-card art-dash-kpi-card-cyan-accent">
              <div className="art-dash-kpi-top">
                <span className="art-dash-kpi-label">BALANCE DE CREADOR</span>
                <div className="art-dash-kpi-icon-bubble cyan">
                  <Wallet size={17} />
                </div>
              </div>
              <div>
                <h3 className="art-dash-kpi-title">Disponible Retiro</h3>
                <p className="art-dash-kpi-val emerald">${availableBalance.toFixed(2)} USD</p>
              </div>
              <button
                type="button"
                className="art-dash-kpi-withdraw-btn"
                onClick={() => setShowWithdrawModal(true)}
              >
                <DollarSign size={14} /> RETIRAR FONDOS
              </button>
            </div>

            {/* Card 3: Calidad & Tiempo */}
            <div className="art-dash-kpi-card">
              <div className="art-dash-kpi-top">
                <span className="art-dash-kpi-label">REPUTACIÓN ARTLINK</span>
                <span className="art-dash-kpi-badge-pill">PERFIL VERIFICADO</span>
              </div>
              <div>
                <h3 className="art-dash-kpi-title">Calidad & Tiempo</h3>
                <p className="art-dash-kpi-val purple" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>0.0</span>
                  <Star size={16} fill="currentColor" color="#F59E0B" aria-hidden="true" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#6D657B' }}>(0 reseñas)</span>
                </p>
              </div>
              <div className="art-dash-kpi-footer">
                <span className="art-dash-kpi-tag-pill">
                  <CheckCircle2 size={13} color="#7C3AED" /> Sin entregas calificadas aún
                </span>
              </div>
            </div>

            {/* Card 4: Tasa de Aceptación */}
            <div className="art-dash-kpi-card art-dash-kpi-card-coral-accent">
              <div className="art-dash-kpi-top">
                <span className="art-dash-kpi-label">EFICIENCIA DE TALLER</span>
                <div className="art-dash-kpi-icon-bubble orange">
                  <Clock size={17} />
                </div>
              </div>
              <div>
                <h3 className="art-dash-kpi-title">Tasa de Aceptación</h3>
                <p className="art-dash-kpi-val dark">— <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#6D657B' }}>sin encargos</span></p>
              </div>
              <div className="art-dash-kpi-footer">
                <Zap size={14} color="#EA580C" />
                <span>Sin solicitudes previas</span>
              </div>
            </div>
          </div>

          {/* MAIN TWO-COLUMN LAYOUT */}
          <div className="art-dash-main-grid">
            {/* LEFT COLUMN: KANBAN & RECENT ACTIVITY */}
            <div className="art-dash-main-left">
              {/* KANBAN SECTION: Flujo de Encargos Activos */}
              <section className="art-dash-kanban-section" aria-labelledby="kanban-heading">
                <div className="art-dash-kanban-header">
                  <div className="art-dash-kanban-header-left">
                    <h2 id="kanban-heading" className="art-dash-kanban-title">Flujo de Encargos Activos</h2>
                    <span className="art-dash-kanban-count-pill">{visibleOrders.length} EN CURSO</span>
                  </div>

                  <div className="art-dash-kanban-tools">
                    <button
                      type="button"
                      className={`art-dash-tool-btn ${filterUrgentOnly ? 'is-active' : ''}`}
                      title={filterUrgentOnly ? 'Ver todos los encargos' : 'Filtrar solo urgentes'}
                      onClick={() => setFilterUrgentOnly((p) => !p)}
                      aria-label="Filtrar encargos"
                    >
                      <Filter size={15} />
                    </button>
                    <button
                      type="button"
                      className={`art-dash-tool-btn ${viewMode === 'kanban' ? 'is-active' : ''}`}
                      title="Vista en columnas Kanban"
                      onClick={() => setViewMode('kanban')}
                      aria-label="Vista Kanban"
                    >
                      <Grid size={15} />
                    </button>
                    <button
                      type="button"
                      className={`art-dash-tool-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                      title="Vista en lista detallada"
                      onClick={() => setViewMode('list')}
                      aria-label="Vista en lista"
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>

                {/* 4 COLUMNS KANBAN BOARD */}
                {viewMode === 'kanban' ? (
                  <div className="art-dash-kanban-columns">
                    {/* COLUMN 1: 1. Brief Aprobado */}
                    <div className="art-dash-kanban-col">
                      <div className="art-dash-col-header">
                        <div className="art-dash-col-title-wrap">
                          <span className="art-dash-col-dot purple" />
                          <h4 className="art-dash-col-name">1. Brief Aprobado</h4>
                        </div>
                        <span className="art-dash-col-badge">
                          {visibleOrders.filter((o) => o.col === 'col1').length}
                        </span>
                      </div>

                      {visibleOrders.filter((o) => o.col === 'col1').length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: '#6D657B', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Sin nuevos briefs por iniciar
                        </div>
                      )}

                      {visibleOrders
                        .filter((o) => o.col === 'col1')
                        .map((order) => (
                          <div className="art-dash-order-card" key={order.id}>
                            <div className="art-dash-order-card-top">
                              <div className="art-dash-client-info">
                                <div className="art-dash-client-avatar-badge">{order.clientInitials}</div>
                                <span className="art-dash-client-handle">{order.clientHandle}</span>
                              </div>
                              <span className="art-dash-order-price purple">${order.price}</span>
                            </div>

                            <h5 className="art-dash-order-title">{order.title}</h5>

                            <div className="art-dash-order-meta">
                              <div className="art-dash-meta-row">
                                <Calendar size={13} color="#6D657B" />
                                <span>Límite: <strong>{order.deadline}</strong></span>
                              </div>
                              <div className="art-dash-meta-row">
                                <FileText size={13} color="#6D657B" />
                                <span>Archivos: {order.attachmentsText}</span>
                              </div>
                            </div>

                            <div className="art-dash-card-actions">
                              <button
                                type="button"
                                className="art-dash-btn-card-outline"
                                onClick={() => setSelectedBriefOrder(order)}
                              >
                                <Eye size={13} /> Ver Brief
                              </button>
                              <button
                                type="button"
                                className="art-dash-btn-card-purple"
                                onClick={() => startOrderWork(order)}
                              >
                                <PlayCircle size={13} /> Comenzar
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* COLUMN 2: 2. En Boceto / WIP */}
                    <div className="art-dash-kanban-col">
                      <div className="art-dash-col-header">
                        <div className="art-dash-col-title-wrap">
                          <span className="art-dash-col-dot green" />
                          <h4 className="art-dash-col-name">2. En Boceto / WIP</h4>
                        </div>
                        <span className="art-dash-col-badge urgent">URGENTE</span>
                      </div>

                      {visibleOrders.filter((o) => o.col === 'col2').length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: '#6D657B', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Sin bocetos pendientes de revisión
                        </div>
                      )}

                      {visibleOrders
                        .filter((o) => o.col === 'col2')
                        .map((order) => (
                          <div className="art-dash-order-card" key={order.id}>
                            <div className="art-dash-order-card-top">
                              <div className="art-dash-client-info">
                                <div className="art-dash-client-avatar-badge teal">{order.clientInitials}</div>
                                <span className="art-dash-client-handle">{order.clientHandle}</span>
                              </div>
                              <span className="art-dash-order-price teal">${order.price}</span>
                            </div>

                            <h5 className="art-dash-order-title">{order.title}</h5>

                            {/* WIP Preview Box */}
                            <div className="art-dash-wip-preview-box">
                              <img
                                src={order.wipImage}
                                alt="WIP Preview"
                                className="art-dash-wip-img"
                                onError={handleImageError}
                              />
                              <div className="art-dash-wip-overlay-left">
                                <FileText size={11} /> {order.wipVersion}
                              </div>
                              {order.hasFeedback && (
                                <div className="art-dash-wip-overlay-right">FEEDBACK</div>
                              )}
                            </div>

                            {/* Response timer */}
                            <div className="art-dash-wip-timer">
                              <Clock size={13} />
                              <span>Respuesta del cliente: <strong>{order.timeRemaining}</strong></span>
                            </div>

                            <div className="art-dash-card-actions">
                              <button
                                type="button"
                                className="art-dash-btn-card-outline"
                                onClick={() => navigate('/mensajes')}
                              >
                                <MessageSquare size={13} /> Chat Cliente
                              </button>
                              <button
                                type="button"
                                className="art-dash-btn-card-teal"
                                onClick={() => openWipUpload(order)}
                              >
                                <UploadCloud size={13} /> Nueva Versión
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* COLUMN 3: 3. Color & Render */}
                    <div className="art-dash-kanban-col">
                      <div className="art-dash-col-header">
                        <div className="art-dash-col-title-wrap">
                          <span className="art-dash-col-dot coral" />
                          <h4 className="art-dash-col-name">3. Color & Render</h4>
                        </div>
                        <span className="art-dash-col-badge">
                          {visibleOrders.filter((o) => o.col === 'col3').length}
                        </span>
                      </div>

                      {visibleOrders.filter((o) => o.col === 'col3').length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: '#6D657B', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Sin piezas en fase de render
                        </div>
                      )}

                      {visibleOrders
                        .filter((o) => o.col === 'col3')
                        .map((order) => (
                          <div className="art-dash-order-card" key={order.id}>
                            <div className="art-dash-order-card-top">
                              <div className="art-dash-client-info">
                                <div className="art-dash-client-avatar-badge peach">{order.clientInitials}</div>
                                <span className="art-dash-client-handle">{order.clientHandle}</span>
                              </div>
                              <span className="art-dash-order-price coral">${order.price}</span>
                            </div>

                            <h5 className="art-dash-order-title">{order.title}</h5>

                            {/* Progress info */}
                            <div className="art-dash-progress-wrap">
                              <div className="art-dash-progress-labels">
                                <span>{order.phaseName}</span>
                                <strong>{order.progress}% completado</strong>
                              </div>
                              <div className="art-dash-progress-bar-bg">
                                <div
                                  className="art-dash-progress-bar-fill"
                                  style={{ width: `${order.progress}%` }}
                                />
                              </div>
                            </div>

                            <div style={{ marginTop: '0.35rem' }}>
                              <button
                                type="button"
                                className="art-dash-btn-card-coral-full"
                                onClick={() => {
                                  setTargetRenderOrder(order)
                                  setShowFinalRenderModal(true)
                                }}
                              >
                                <UploadCloud size={14} /> Subir Render Final (PNG / PSD)
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* COLUMN 4: 4. Terminados Este Mes */}
                    <div className="art-dash-kanban-col">
                      <div className="art-dash-col-header">
                        <div className="art-dash-col-title-wrap">
                          <span className="art-dash-col-dot lavender" />
                          <h4 className="art-dash-col-name">4. Terminados Este Mes</h4>
                        </div>
                        <span className="art-dash-col-badge success">
                          {completedOrders.length} EXITOSOS
                        </span>
                      </div>

                      <div className="art-dash-completed-card">
                        {completedOrders.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '1.8rem 0.5rem', color: '#6D657B', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Sin entregas finalizadas todavía
                          </div>
                        ) : (
                          <div className="art-dash-completed-list">
                            {completedOrders.map((item) => (
                              <div className="art-dash-completed-item" key={item.id}>
                                <div className="art-dash-completed-left">
                                  <CheckCircle2 size={16} className="art-dash-check-icon" />
                                  <span>{item.clientHandle}</span>
                                </div>
                                <div className="art-dash-completed-right">
                                  <span className="art-dash-completed-amount">+${item.amount}</span>
                                  <span className="art-dash-completed-sub">{item.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          className="art-dash-billing-link"
                          onClick={() => setShowBillingHistoryModal(true)}
                        >
                          Ver historial de facturación completa →
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LIST DETAILED VIEW OF ACTIVE ORDERS */
                  <div className="art-dash-activity-section" style={{ marginTop: '0.5rem' }}>
                    <div className="art-dash-activity-list">
                      {visibleOrders.map((o) => (
                        <div className="art-dash-activity-row" key={o.id}>
                          <div className="art-dash-activity-left">
                            <div className="art-dash-activity-icon purple">
                              <FileText size={18} />
                            </div>
                            <div className="art-dash-activity-desc">
                              <span className="art-dash-activity-main-text">
                                {o.title} — <strong>{o.clientHandle}</strong>
                              </span>
                              <span className="art-dash-activity-sub-text">
                                Fase actual:{' '}
                                {o.col === 'col1'
                                  ? '1. Brief Aprobado'
                                  : o.col === 'col2'
                                  ? '2. En Boceto / WIP'
                                  : '3. Color & Render'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <strong style={{ fontFamily: 'var(--heading)', color: '#7C3AED', fontSize: '1.1rem' }}>
                              ${o.price} USD
                            </strong>
                            <button
                              type="button"
                              className="art-dash-btn-card-outline"
                              onClick={() => {
                                if (o.col === 'col1') setSelectedBriefOrder(o)
                                else if (o.col === 'col2') openWipUpload(o)
                                else {
                                  setTargetRenderOrder(o)
                                  setShowFinalRenderModal(true)
                                }
                              }}
                            >
                              Gestionar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* REGISTRO DE ACTIVIDAD RECIENTE */}
              <section className="art-dash-activity-section" aria-labelledby="activity-heading">
                <div className="art-dash-activity-header">
                  <h3 id="activity-heading" className="art-dash-activity-title">
                    <Zap size={18} color="#7C3AED" /> Registro de Actividad Reciente
                  </h3>
                  <span className="art-dash-activity-sync-time">Actualizado recientemente</span>
                </div>

                <div className="art-dash-activity-list">
                  {activityList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6D657B', fontSize: '0.85rem' }}>
                      No hay actividad reciente registrada en tu taller.
                    </div>
                  ) : (
                    activityList.map((act) => (
                      <div className="art-dash-activity-row" key={act.id}>
                        <div className="art-dash-activity-left">
                          <div className={`art-dash-activity-icon ${act.iconType}`}>
                            {act.iconType === 'pink' && <ShieldCheck size={18} />}
                            {act.iconType === 'purple' && <Lock size={18} />}
                            {act.iconType === 'mint' && <Star size={18} />}
                          </div>
                          <div className="art-dash-activity-desc">
                            <span className="art-dash-activity-main-text">{act.title}</span>
                            <span className="art-dash-activity-sub-text">{act.sub}</span>
                          </div>
                        </div>
                        <span className="art-dash-activity-time">{act.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN SIDEBAR */}
            <aside className="art-dash-sidebar" aria-label="Información complementaria del taller">
              {/* CARD 1: Próximas Entregas (7 DÍAS) */}
              <div className="art-dash-upcoming-card">
                <div className="art-dash-upcoming-header">
                  <h4 className="art-dash-upcoming-title">
                    <Calendar size={18} color="#7C3AED" /> Próximas Entregas
                  </h4>
                  <span className="art-dash-upcoming-pill">PROGRAMACIÓN</span>
                </div>

                <div className="art-dash-upcoming-list">
                  {kanbanOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: '#6D657B', fontSize: '0.82rem' }}>
                      No hay entregas pendientes programadas.
                    </div>
                  ) : (
                    kanbanOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="art-dash-upcoming-item"
                        onClick={() => openWipUpload(order)}
                        title={`Click para gestionar ${order.clientHandle}`}
                      >
                        <div className="art-dash-date-badge cyan">
                          <span className="art-dash-date-day">ENC</span>
                          <span className="art-dash-date-num">#</span>
                        </div>
                        <div className="art-dash-upcoming-info">
                          <span className="art-dash-upcoming-name">{order.title}</span>
                          <span className="art-dash-upcoming-sub">{order.clientHandle}</span>
                          <span className="art-dash-upcoming-tag green">{order.deadline}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CARD 2: CONSEJO DE ARTIE BOT */}
              <div className="art-dash-artie-card">
                <div className="art-dash-artie-header">
                  <div className="art-dash-artie-icon-wrap">
                    <Bot size={17} />
                  </div>
                  <span className="art-dash-artie-label">CONSEJO DE ARTIE BOT</span>
                </div>

                <p className="art-dash-artie-quote">
                  "¡La demanda de <strong>Modelos VTuber</strong> creció un 34% esta semana! Te sugiero abrir 1 cupo adicional o ajustar tu tarifa base a <strong>$250 USD</strong> para maximizar tus ingresos sin sobrecargarte."
                </p>

                <button
                  type="button"
                  className="art-dash-artie-btn"
                  onClick={applyArtieSuggestion}
                  disabled={artieApplied}
                  style={artieApplied ? { opacity: 0.6, cursor: 'default' } : {}}
                >
                  {artieApplied ? 'SUGERENCIA APLICADA ✔' : 'APLICAR SUGERENCIA →'}
                </button>
              </div>

              {/* CARD 3: Formatos en Tienda */}
              <div className="art-dash-formats-card">
                <div className="art-dash-formats-header">
                  <h4 className="art-dash-formats-title">Formatos en Tienda</h4>
                  <button
                    type="button"
                    className="art-dash-formats-edit-link"
                    onClick={() => navigate('/artista/comisiones')}
                  >
                    Editar Todos
                  </button>
                </div>

                <div className="art-dash-formats-list">
                  {formatsInStore.map((fmt) => (
                    <div className="art-dash-format-item" key={fmt.id}>
                      <div className="art-dash-format-left">
                        <img
                          src={fmt.thumb}
                          alt={fmt.name}
                          className="art-dash-format-thumb"
                          onError={handleImageError}
                        />
                        <div className="art-dash-format-info">
                          <span className="art-dash-format-name">{fmt.name}</span>
                          <span className="art-dash-format-price">${fmt.price} USD</span>
                        </div>
                      </div>

                      {/* Custom Neo Switch */}
                      <label className="art-dash-toggle-wrap">
                        <input
                          type="checkbox"
                          checked={fmt.active}
                          onChange={() => toggleFormatActive(fmt.id)}
                        />
                        <span className={`art-dash-toggle-slider ${fmt.color}`} />
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="art-dash-add-format-btn"
                  onClick={() => setShowNewFormatModal(true)}
                >
                  <Plus size={15} /> Añadir Variación o Add-on
                </button>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* ====================================================================
          MODALS & DIALOGS
          ==================================================================== */}

      {/* 1. BRIEF DETAILS MODAL */}
      {selectedBriefOrder && (
        <div className="art-dash-modal-backdrop" onClick={() => setSelectedBriefOrder(null)}>
          <div className="art-dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="art-dash-modal-header">
              <div>
                <span className="art-dash-handle-pill" style={{ marginBottom: '0.3rem', display: 'inline-block' }}>
                  {selectedBriefOrder.clientHandle}
                </span>
                <h3 className="art-dash-modal-title">{selectedBriefOrder.title}</h3>
              </div>
              <button
                type="button"
                className="art-dash-modal-close-btn"
                onClick={() => setSelectedBriefOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem' }}>
              <div style={{ background: '#F3EEFF', padding: '0.75rem', borderRadius: '0.65rem', border: '1.5px solid #1E192B' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6D28D9', marginBottom: '0.2rem' }}>
                  <DecorativeStar size={12} color="#6D28D9" /> Fondos asegurados en Escrow: ${selectedBriefOrder.price}.00 USD
                </strong>
                <span style={{ color: '#6D657B', fontSize: '0.78rem' }}>
                  El pago ya fue depositado y está resguardado por ArtLink Shield.
                </span>
              </div>

              <div>
                <strong>Especificaciones técnicas requeridas:</strong>
                <p style={{ margin: '0.3rem 0 0', color: '#1E192B' }}>
                  {selectedBriefOrder.briefDetails?.specs || 'Resolución 300 DPI, archivo PSD con capas editables.'}
                </p>
              </div>

              <div>
                <strong>Descripción del encargo:</strong>
                <p style={{ margin: '0.3rem 0 0', color: '#6D657B' }}>
                  {selectedBriefOrder.briefDetails?.description || 'Encargo personalizado acordado entre artista y cliente.'}
                </p>
              </div>

              <div>
                <strong>Archivos adjuntos:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="art-dash-slots-chip" style={{ fontSize: '0.75rem' }}>📄 moodboard_concept.pdf</span>
                  <span className="art-dash-slots-chip" style={{ fontSize: '0.75rem' }}>🖼 color_palette_refs.png</span>
                  <span className="art-dash-slots-chip" style={{ fontSize: '0.75rem' }}>📁 live2d_layer_specs.txt</span>
                </div>
              </div>
            </div>

            <div className="art-dash-modal-actions">
              <button
                type="button"
                className="art-dash-btn-card-outline"
                onClick={() => setSelectedBriefOrder(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="art-dash-btn-primary"
                onClick={() => startOrderWork(selectedBriefOrder)}
              >
                <PlayCircle size={15} /> Comenzar Trabajo y Mover a WIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBIR ENTREGABLE / WIP MODAL */}
      {showUploadWipModal && (
        <div className="art-dash-modal-backdrop" onClick={() => setShowUploadWipModal(false)}>
          <div className="art-dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="art-dash-modal-header">
              <h3 className="art-dash-modal-title">Subir Entregable / Avance WIP</h3>
              <button
                type="button"
                className="art-dash-modal-close-btn"
                onClick={() => setShowUploadWipModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadWipSubmit}>
              <div className="art-dash-form-group">
                <label>Proyecto / Encargo Activo</label>
                <select
                  defaultValue={targetWipOrder?.id || 'order-102'}
                  onChange={(e) => {
                    const sel = kanbanOrders.find((o) => o.id === e.target.value)
                    if (sel) setTargetWipOrder(sel)
                  }}
                >
                  {kanbanOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title} ({o.clientHandle}) — ${o.price} USD
                    </option>
                  ))}
                </select>
              </div>

              <div className="art-dash-form-group">
                <label>Identificador de Fase / Versión</label>
                <input
                  type="text"
                  name="version"
                  placeholder="Ej: v1.3 - Líneas limpias y sombras"
                  defaultValue="v1.3"
                  required
                />
              </div>

              <div className="art-dash-form-group">
                <label>Archivo de Imagen (Vista previa PNG / JPG / PSD)</label>
                <input
                  type="file"
                  accept="image/*"
                  style={{ background: '#FFFDF8', cursor: 'pointer' }}
                />
                <small style={{ color: '#6D657B', fontSize: '0.74rem' }}>
                  Formatos soportados: PNG, JPG, PSD o ZIP (Máx. 250 MB).
                </small>
              </div>

              <div className="art-dash-form-group">
                <label>Notas explicativas para el cliente</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Explica qué cambios realizaste, qué paleta de color aplicaste o qué feedback requieres..."
                  defaultValue="Ajusté la paleta de iluminación y los detalles del rostro según tu feedback previo."
                />
              </div>

              <div className="art-dash-modal-actions">
                <button
                  type="button"
                  className="art-dash-btn-card-outline"
                  onClick={() => setShowUploadWipModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="art-dash-btn-teal">
                  <UploadCloud size={15} /> Notificar y Subir Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SUBIR RENDER FINAL MODAL */}
      {showFinalRenderModal && (
        <div className="art-dash-modal-backdrop" onClick={() => setShowFinalRenderModal(false)}>
          <div className="art-dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="art-dash-modal-header">
              <div>
                <span className="art-dash-kpi-badge-pill" style={{ marginBottom: '0.2rem', display: 'inline-block' }}>
                  FASE DE CIERRE Y PAGO
                </span>
                <h3 className="art-dash-modal-title">Subir Render Final y Liberar Custodia</h3>
              </div>
              <button
                type="button"
                className="art-dash-modal-close-btn"
                onClick={() => setShowFinalRenderModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFinalRenderSubmit}>
              <div style={{ background: '#FEF08A', border: '1.5px solid #1E192B', borderRadius: '0.65rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DecorativeStar size={14} color="#7C3AED" />
                <span>
                  Al subir el render final, los fondos de ${targetRenderOrder?.price || 45}.00 USD en custodia Escrow se transferirán inmediatamente a tu <strong>Balance Disponible de Retiro</strong>.
                </span>
              </div>

              <div className="art-dash-form-group">
                <label>Paquete de Archivos Finales (PNG full-res + PSD con capas)</label>
                <input type="file" required style={{ background: '#FFFDF8' }} />
              </div>

              <div className="art-dash-form-group">
                <label>Mensaje de despedida y agradecimiento al cliente</label>
                <textarea
                  rows={3}
                  defaultValue="¡Muchas gracias por confiar en mi taller! Ha sido un placer ilustrar esta pieza para ti. Quedo a tu disposición para futuros proyectos."
                />
              </div>

              <div className="art-dash-modal-actions">
                <button
                  type="button"
                  className="art-dash-btn-card-outline"
                  onClick={() => setShowFinalRenderModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="art-dash-btn-primary">
                  <CheckCircle size={15} /> Confirmar Entrega y Cobrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. RETIRAR FONDOS MODAL */}
      {showWithdrawModal && (
        <div className="art-dash-modal-backdrop" onClick={() => setShowWithdrawModal(false)}>
          <div className="art-dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="art-dash-modal-header">
              <div>
                <span className="art-dash-handle-pill" style={{ marginBottom: '0.2rem', display: 'inline-block' }}>
                  ESCROW PAYOUT
                </span>
                <h3 className="art-dash-modal-title">Retirar Fondos de Taller</h3>
              </div>
              <button
                type="button"
                className="art-dash-modal-close-btn"
                onClick={() => setShowWithdrawModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              <div style={{ background: '#CCFBF1', border: '1.5px solid #1E192B', borderRadius: '0.75rem', padding: '0.85rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F766E', textTransform: 'uppercase' }}>
                  Balance Disponible
                </span>
                <h2 style={{ fontFamily: 'var(--heading)', color: '#059669', fontSize: '1.75rem', margin: '0.2rem 0 0' }}>
                  ${availableBalance.toFixed(2)} USD
                </h2>
              </div>

              <div className="art-dash-form-group">
                <label>Monto a Retirar (USD)</label>
                <input
                  type="number"
                  name="amount"
                  min="10"
                  max={availableBalance}
                  defaultValue={Math.min(availableBalance, 500)}
                  required
                />
              </div>

              <div className="art-dash-form-group">
                <label>Método de Pago Vinculado</label>
                <select name="method">
                  <option value="PayPal (miasoler.artist@gmail.com)">PayPal (miasoler.artist@gmail.com)</option>
                  <option value="Stripe Direct Express (Banco)">Transferencia Bancaria Directa (SPEI / IBAN)</option>
                  <option value="Wise Multi-Divisas">Cuenta Wise USD</option>
                </select>
              </div>

              <div className="art-dash-modal-actions">
                <button
                  type="button"
                  className="art-dash-btn-card-outline"
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="art-dash-btn-teal">
                  <DollarSign size={15} /> Confirmar Retiro Inmediato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. NUEVO FORMATO / VARIACIÓN MODAL */}
      {showNewFormatModal && (
        <div className="art-dash-modal-backdrop" onClick={() => setShowNewFormatModal(false)}>
          <div className="art-dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="art-dash-modal-header">
              <h3 className="art-dash-modal-title">Añadir Nuevo Formato de Comisión</h3>
              <button
                type="button"
                className="art-dash-modal-close-btn"
                onClick={() => setShowNewFormatModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleNewFormatSubmit}>
              <div className="art-dash-form-group">
                <label>Nombre del Formato o Servicio</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ej: Emotes Chibi para Twitch / Discord"
                  required
                />
              </div>

              <div className="art-dash-form-group">
                <label>Precio Base (USD)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Ej: 35"
                  min="5"
                  required
                />
              </div>

              <div className="art-dash-form-group">
                <label>Días promedio de entrega</label>
                <input type="number" name="days" defaultValue={7} min="1" />
              </div>

              <div className="art-dash-form-group">
                <label>Descripción del entregable</label>
                <textarea
                  name="desc"
                  rows={3}
                  placeholder="Detalla qué incluye este paquete (revisiones, fondos, formatos)..."
                />
              </div>

              <div className="art-dash-modal-actions">
                <button
                  type="button"
                  className="art-dash-btn-card-outline"
                  onClick={() => setShowNewFormatModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="art-dash-btn-primary">
                  <Plus size={15} /> Guardar en Mi Tienda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. AJUSTAR CAPACIDAD DE CUPOS MODAL */}
      {showSlotsModal && (
        <div className="art-dash-modal-backdrop" onClick={() => setShowSlotsModal(false)}>
          <div className="art-dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="art-dash-modal-header">
              <h3 className="art-dash-modal-title">Capacidad Máxima de Cupos</h3>
              <button
                type="button"
                className="art-dash-modal-close-btn"
                onClick={() => setShowSlotsModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSlotsSubmit}>
              <p style={{ color: '#6D657B', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                Establece cuántos encargos activos simultáneos puedes atender antes de que tu agenda se cierre automáticamente.
              </p>

              <div className="art-dash-form-group">
                <label>Total de Cupos Habilitados</label>
                <input
                  type="number"
                  name="slots"
                  min="1"
                  max="20"
                  defaultValue={totalSlots}
                  required
                />
              </div>

              <div className="art-dash-modal-actions">
                <button
                  type="button"
                  className="art-dash-btn-card-outline"
                  onClick={() => setShowSlotsModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="art-dash-btn-primary">
                  Guardar Capacidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. FACTURACIÓN HISTÓRICA MODAL */}
      {showBillingHistoryModal && (
        <div className="art-dash-modal-backdrop" onClick={() => setShowBillingHistoryModal(false)}>
          <div className="art-dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="art-dash-modal-header">
              <div>
                <span className="art-dash-kpi-badge-pill" style={{ marginBottom: '0.2rem', display: 'inline-block' }}>
                  RECIBOS OFICIALES ARTLINK
                </span>
                <h3 className="art-dash-modal-title">Historial de Facturación y Liquidaciones</h3>
              </div>
              <button
                type="button"
                className="art-dash-modal-close-btn"
                onClick={() => setShowBillingHistoryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              {completedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6D657B' }}>
                  No existen comprobantes ni liquidaciones de facturación aún.
                </div>
              ) : (
                completedOrders.map((ord, idx) => (
                  <div
                    key={ord.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#FFFDF8',
                      border: '1.5px solid #1E192B',
                      borderRadius: '0.65rem',
                    }}
                  >
                    <div>
                      <strong>Encargo #{1080 - idx} — {ord.clientHandle}</strong>
                      <div style={{ color: '#6D657B', fontSize: '0.74rem' }}>
                        Custodia Escrow Shield liberada con éxito
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--heading)', fontWeight: 800, color: '#059669' }}>
                        +${ord.amount}.00 USD
                      </span>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7C3AED',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'block',
                        }}
                        onClick={() => showToast('Descargando comprobante fiscal en PDF...')}
                      >
                        Descargar Recibo
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="art-dash-modal-actions">
              <button
                type="button"
                className="art-dash-btn-primary"
                onClick={() => setShowBillingHistoryModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
