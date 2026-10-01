import { useState, useMemo } from 'react'
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
import usePrivateRequests from '../hooks/usePrivateRequests'
import '../styles/requestsPop.css'

export default function PrivateRequestsPage() {
  const navigate = useNavigate()
  const { clientRequests, loading, error } = usePrivateRequests()

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
    dms: false,
    mentions: false,
  })

  // Modales interactivos
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [showEscrowProofModal, setShowEscrowProofModal] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showBotTemplatesModal, setShowBotTemplatesModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Estado interactivo de acciones en pantalla
  const [kaelenStatus, setKaelenStatus] = useState('pending') // 'pending', 'accepted', 'rejected'
  const [miaStatus, setMiaStatus] = useState('in_review') // 'in_review', 'approved', 'revision_requested'
  const [allReadMarked, setAllReadMarked] = useState(false)

  // Disparar toast temporal
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Marcar todo como leído
  const handleMarkAllAsRead = () => {
    setAllReadMarked(true)
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
      dms: false,
      mentions: false,
    })
    setActiveTab('all')
    setSearchTerm('')
    triggerToast('Filtros restablecidos al valor predeterminado')
  }

  // Exportar CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Tipo,Contraparte,Monto_USD,Estado,Fecha\n' +
      '#1094,Solicitud Encargo,Kaelen Vance,220.00,Pendiente,Hoy\n' +
      '#1082,Entrega Hito 2 (WIP),Mía Soler,160.00,En Revisión,Hoy\n' +
      '#ESC-8921,Depósito en Custodia,ArtLink Escrow,160.00,Protegido,Ayer\n' +
      '#1040,Encargo Finalizado,Renzo Miyazaki,220.00,Aceptado,Hace 2 días\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'ArtLink_Historial_Solicitudes_Notificaciones.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Historial descargado en formato CSV')
  }

  // Exportar PDF / Reporte
  const handleExportPDF = () => {
    window.print()
  }

  if (loading) return <LoadingState label="Cargando solicitudes y notificaciones..." />
  if (error) return <ErrorState message={error.message} />

  return (
    <div className="req-page-container">
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
              {allReadMarked ? '0 pendientes de acción' : '4 pendientes de acción'}
            </span>
            <span className="req-badge-escrow-active">
              ✦ ESCROW SHIELD ACTIVO
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
            title="Configuración de filtros y alertas"
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

      {/* ── 3. FILTER TABS BAR ── */}
      <nav className="req-filter-tabs-bar" aria-label="Categorías de alertas">
        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>Todas las Alertas</span>
          <span className="req-tab-count-badge">12</span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'commissions' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('commissions')}
        >
          <span>Solicitudes de Comisión</span>
          <span className="req-tab-count-badge">3 nuevas</span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'wip' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('wip')}
        >
          <span>Revisiones & Entregas WIP</span>
          <span className="req-tab-count-badge badge-cyan">2</span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'escrow' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('escrow')}
        >
          <Shield size={13} aria-hidden="true" />
          <span>Pagos y Escrow Shield</span>
          <span className="req-tab-count-badge badge-green">1</span>
        </button>

        <button
          type="button"
          className={`req-tab-chip ${activeTab === 'community' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <span>Interacciones de Comunidad</span>
          <span className="req-tab-count-badge">6</span>
        </button>
      </nav>

      {/* ── 4. THREE TOP KPI METRIC CARDS (WITH WASHI TAPE) ── */}
      <section className="req-kpi-cards-grid" aria-label="Métricas clave de atención">
        {/* Card 1: Cola de Encargos */}
        <div className="req-kpi-card kpi-pink">
          <div className="req-washi-tape tape-pink" aria-hidden="true" />
          <div>
            <div className="req-kpi-top-row">
              <span className="req-kpi-eyebrow">COLA DE ENCARGOS</span>
              <div className="req-kpi-icon-circle icon-pink">
                <Laptop size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="req-kpi-main-value">3 Pendientes</div>
          </div>
          <p className="req-kpi-subtext">
            <Clock size={13} aria-hidden="true" />
            Tiempo prom. de respuesta: <strong>1.8 hrs</strong>
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
            <div className="req-kpi-main-value">1 Boceto Listo</div>
          </div>
          <p className="req-kpi-subtext">
            <FileText size={13} aria-hidden="true" />
            Encargo <strong>#1082</strong> de Mía Soler
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
            <div className="req-kpi-main-value">$340.00 USD</div>
          </div>
          <p className="req-kpi-subtext">
            <Lock size={13} aria-hidden="true" />
            Fondos asegurados hasta tu aprobación
          </p>
        </div>
      </section>

      {/* ── 5. MAIN TWO-COLUMN CONTENT GRID ── */}
      <div className="req-main-two-columns">
        {/* ══════════════════════════════════════════════════════════════════
           LEFT COLUMN: FEED DE ACCIONES & NOTIFICACIONES
           ══════════════════════════════════════════════════════════════════ */}
        <main className="req-feed-column" id="main-content">
          {/* ── SECCIÓN 1: ACCIÓN REQUERIDA HOY ── */}
          {(activeTab === 'all' || activeTab === 'commissions' || activeTab === 'wip') && (
            <section aria-label="Acciones requeridas hoy">
              <div className="req-section-header-row">
                <div className="req-section-badge-title">
                  <span className="req-section-badge-dark">+ ACCIÓN REQUERIDA HOY</span>
                  <span className="req-section-time-hint">VENCE EN MENOS DE 48 HRS</span>
                </div>
                <button
                  type="button"
                  className="req-link-resolve-all"
                  onClick={() => triggerToast('Iniciando resolución guiada de tareas pendientes')}
                >
                  Resolver todas (2)
                </button>
              </div>

              {/* CARD 1: Kaelen Vance - Solicitud de Comisión VTuber */}
              {(sidebarFilters.commissions || activeTab === 'commissions') && (
                <article className="req-action-card-box">
                  <span className="req-card-washi-tape-tag tag-pink">SOLICITUD NUEVA</span>

                  <div className="req-card-user-row">
                    <div className="req-user-avatar-meta">
                      <div className="req-user-avatar-wrap">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
                          alt="Kaelen Vance"
                          className="req-user-avatar-img"
                        />
                        <span className="req-user-check-badge">✓</span>
                      </div>
                      <div className="req-user-titles">
                        <div className="req-user-name-line">
                          <strong>Kaelen Vance</strong>
                          <span className="req-user-handle">@Kaelen_Design</span>
                          <span className="req-order-id-badge">Encargo #1094</span>
                        </div>
                        <p className="req-card-statement">
                          Solicita encargo personalizado: <strong>Diseño de Personaje VTuber 2D</strong>
                        </p>
                      </div>
                    </div>

                    <div className="req-price-time-box">
                      <span className="req-price-amount">$220.00 USD</span>
                      <span className="req-price-deadline">
                        <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                        Plazo: 16 días
                      </span>
                    </div>
                  </div>

                  {/* Nota del Briefing */}
                  <div className="req-briefing-note-box">
                    <div className="req-brief-inner-col">
                      <div className="req-brief-tag-title">
                        <FileText size={12} /> NOTA DEL BRIEFING
                      </div>
                      <p className="req-brief-quote">
                        &quot;¡Hola! Sigo tu trabajo desde hace meses. Busco un modelo VTuber anime de cuerpo medio con temática cósmica/astronómica, capa traslúcida y 3 expresiones clave (feliz, enojado y llorando chibi). Ya tengo la paleta de colores aprobada...&quot;
                      </p>
                      <div className="req-brief-attachment-line">
                        <Paperclip size={13} color="#6B7280" />
                        <span>moodboard_referencias.pdf</span> (3.4 MB) • Recibido hace 3 horas
                      </div>
                    </div>
                    <img
                      src="/images/hero/soramoon.jpg"
                      alt="Referencia de estilo VTuber"
                      className="req-brief-thumb-img"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&q=80'
                      }}
                    />
                  </div>

                  {/* Botones de acción de la solicitud */}
                  <div className="req-card-actions-row">
                    {kaelenStatus === 'pending' ? (
                      <>
                        <button
                          type="button"
                          className="req-btn-primary-purple"
                          onClick={() => setShowAcceptModal(true)}
                        >
                          <Check size={16} aria-hidden="true" />
                          <span>Aceptar Solicitud</span>
                        </button>
                        <button
                          type="button"
                          className="req-btn-secondary-pink"
                          onClick={() => setShowCounterOfferModal(true)}
                        >
                          <Edit3 size={15} aria-hidden="true" />
                          <span>Proponer Ajuste de Tarifa/Plazo</span>
                        </button>
                        <button
                          type="button"
                          className="req-btn-link-action"
                          onClick={() => {
                            setKaelenStatus('rejected')
                            triggerToast('Solicitud rechazada con mensaje de cortesía')
                          }}
                        >
                          <X size={14} style={{ display: 'inline', marginRight: 2 }} />
                          Rechazar amablemente
                        </button>
                      </>
                    ) : kaelenStatus === 'accepted' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="req-order-accepted-badge" style={{ background: '#DCFCE7', color: '#15803D' }}>
                          ✓ Solicitud Aceptada
                        </span>
                        <Link to="/mensajes?requestId=q_D0R_iTERI" className="req-btn-link-purple">
                          <MessageCircle size={15} /> Abrir chat con el artista
                        </Link>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 600 }}>
                        Solicitud archivada
                      </span>
                    )}
                  </div>
                </article>
              )}

              {/* CARD 2: Mía Soler - Hito por Aprobar */}
              {(sidebarFilters.wip || activeTab === 'wip') && (
                <article className="req-action-card-box">
                  <span className="req-card-washi-tape-tag tag-mint">HITO POR APROBAR</span>

                  <div className="req-card-user-row">
                    <div className="req-user-avatar-meta">
                      <div className="req-user-avatar-wrap">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80"
                          alt="Mía Soler"
                          className="req-user-avatar-img"
                        />
                        <span className="req-user-check-badge">✓</span>
                      </div>
                      <div className="req-user-titles">
                        <div className="req-user-name-line">
                          <strong>Mía Soler</strong>
                          <span className="req-user-handle">@miasoler_art</span>
                          <span className="req-order-id-badge">Encargo #1082</span>
                        </div>
                        <p className="req-card-statement">
                          Entregable de Hito 2: <strong>Boceto v1.2 con Ajustes de Iluminación y Pose</strong>
                        </p>
                      </div>
                    </div>

                    <div className="req-urgent-time-pill">
                      <Clock size={13} aria-hidden="true" />
                      <span>41:24 hrs para respuesta</span>
                    </div>
                  </div>

                  {/* Previsualización del boceto */}
                  <div className="req-wip-preview-row">
                    <div className="req-wip-thumb-wrap">
                      <img
                        src="/images/wip_sketch.jpg"
                        alt="Boceto entregado por Mía Soler"
                        className="req-wip-thumb-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
                        }}
                      />
                      <span className="req-wip-tag-floating">WIP FASE 2</span>
                    </div>

                    <div className="req-wip-info-col">
                      <p className="req-wip-desc-p">
                        &quot;Mía ha subido el archivo <span className="req-wip-filename-chip">ilusion_nocturna_boceto_v1.2.clip</span>. Se modificó el ángulo del brazo izquierdo y se agregaron las luciérnagas pastel solicitadas.&quot;
                      </p>
                      <div className="req-wip-escrow-pill-line">
                        <ShieldCheck size={14} color="#059669" />
                        <span>Hito cubierto por Escrow: <strong>$160.00 USD</strong> • 3 comentarios de revisión</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción del hito */}
                  <div className="req-card-actions-row">
                    {miaStatus === 'in_review' ? (
                      <>
                        <button
                          type="button"
                          className="req-btn-mint-approve"
                          onClick={() => {
                            setMiaStatus('approved')
                            triggerToast('Boceto de la Fase 2 aprobado con éxito en Escrow')
                          }}
                        >
                          <Check size={16} aria-hidden="true" />
                          <span>Revisar Boceto & Aprobar Hito</span>
                        </button>
                        <button
                          type="button"
                          className="req-btn-white-outline"
                          onClick={() => setShowRevisionModal(true)}
                        >
                          <Edit3 size={15} aria-hidden="true" />
                          <span>Pedir Modificaciones</span>
                        </button>
                        <Link
                          to="/mensajes?requestId=q_D0R_iTERI"
                          className="req-btn-link-purple"
                        >
                          <MessageCircle size={15} />
                          <span>Abrir en Chat de Mensajes</span>
                        </Link>
                      </>
                    ) : miaStatus === 'approved' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="req-order-accepted-badge" style={{ background: '#DCFCE7', color: '#15803D' }}>
                          ✓ Hito 2 Aprobado
                        </span>
                        <Link to="/mensajes?requestId=q_D0R_iTERI" className="req-btn-link-purple">
                          <MessageCircle size={15} /> Ver avance hacia Fase 3 en Mensajes
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="req-order-accepted-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>
                          Ajustes solicitados
                        </span>
                        <Link to="/mensajes?requestId=q_D0R_iTERI" className="req-btn-link-purple">
                          <MessageCircle size={15} /> Ver hilo con el artista
                        </Link>
                      </div>
                    )}
                  </div>
                </article>
              )}
            </section>
          )}

          {/* ── SECCIÓN 2: RECIENTES & PAGOS (ESTA SEMANA) ── */}
          {(activeTab === 'all' || activeTab === 'escrow' || activeTab === 'community') && (
            <section aria-label="Eventos recientes y pagos">
              <div className="req-section-header-row" style={{ marginTop: '0.5rem' }}>
                <div className="req-section-badge-title">
                  <span className="req-section-badge-neutral">+ RECIENTES & PAGOS (ESTA SEMANA)</span>
                </div>
                <span className="req-section-time-hint" style={{ textTransform: 'none', fontWeight: 600 }}>
                  Mostrando 3 de 10 eventos
                </span>
              </div>

              {/* Evento 1: Fondos Depositados en Custodia Segura */}
              {(sidebarFilters.escrow || activeTab === 'escrow') && (
                <article className="req-recent-event-card">
                  <div className="req-event-icon-circle circle-green">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="req-event-info-col">
                    <div className="req-event-top-line">
                      <strong>Fondos Depositados en Custodia Segura</strong>
                      <span className="req-event-escrow-badge">Escrow Shield #ESC-8921</span>
                    </div>
                    <p className="req-event-desc-p">
                      <strong>$160.00 USD</strong> fueron retenidos con éxito por la pasarela de ArtLink para el encargo con <strong>@miasoler_art</strong>. Tu dinero está 100% protegido hasta la entrega final del PSD/PNG comercial y tu visto bueno.
                    </p>
                    <div className="req-event-meta-line">
                      <button
                        type="button"
                        className="req-event-link-text"
                        onClick={() => setShowEscrowProofModal(true)}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                      >
                        Ver comprobante de depósito seguro
                      </button>
                      <span>•</span>
                      <span>Ayer a las 18:40</span>
                    </div>
                  </div>
                  <span className="req-event-pill-right">Protegido ✓</span>
                </article>
              )}

              {/* Evento 2: Renzo Miyazaki aceptó solicitud */}
              {(sidebarFilters.commissions || activeTab === 'commissions') && (
                <article className="req-recent-event-card">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
                    alt="Renzo Miyazaki"
                    className="req-user-avatar-img"
                    style={{ width: 44, height: 44 }}
                  />
                  <div className="req-event-info-col">
                    <div className="req-event-top-line">
                      <strong>Renzo Miyazaki</strong>
                      <span className="req-user-handle">@renzo_mecha</span>
                      <span className="req-order-accepted-badge">Aceptó tu solicitud</span>
                    </div>
                    <p className="req-event-desc-p">
                      Aceptó formalmente tu comisión para <strong>&quot;Mecha Cyber Samurai 3D + Texturizado PBR&quot;</strong>. El cronograma de 20 días ha comenzado.
                    </p>
                    <div className="req-event-meta-line">
                      <span>Fase 1: Briefing técnico y siluetas</span>
                      <span>•</span>
                      <span>Hace 2 días</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="req-btn-roadmap"
                    onClick={() => setShowRoadmapModal(true)}
                  >
                    Ver Hoja de Ruta
                  </button>
                </article>
              )}

              {/* Evento 3: Airi Hoshino & Vitrina Comunitaria */}
              {(sidebarFilters.mentions || activeTab === 'community') && (
                <article className="req-recent-event-card">
                  <div className="req-event-icon-square-pink">
                    <Heart size={20} fill="#E11D48" />
                  </div>
                  <div className="req-event-info-col">
                    <p className="req-event-desc-p" style={{ margin: 0, fontSize: '0.9rem' }}>
                      <strong>Airi Hoshino</strong> y <strong>14 creadores más</strong> guardaron tu obra <strong style={{ color: '#7C3AED' }}>&quot;Tardes de Lavanda&quot;</strong> en su carpeta de inspiración <em>&quot;Pastel Dreams 2025&quot;</em>.
                    </p>
                    <div className="req-event-meta-line" style={{ marginTop: '0.35rem' }}>
                      <span>Hace 3 días</span>
                      <span>•</span>
                      <span>Vitrina Comunitaria</span>
                    </div>
                  </div>
                  <img
                    src="/images/hero/soramoon.jpg"
                    alt="Tardes de Lavanda"
                    className="req-event-thumb-small"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&q=80'
                    }}
                  />
                </article>
              )}
            </section>
          )}

          {/* ── SECCIÓN 3: SOLICITUDES ADICIONALES DEL SERVIDOR (SI EXISTEN) ── */}
          {clientRequests && clientRequests.length > 0 && (
            <section aria-label="Otras solicitudes en tu cuenta" style={{ marginTop: '1rem' }}>
              <div className="req-section-header-row">
                <span className="req-section-badge-neutral">+ SOLICITUDES EN TU HISTORIAL ({clientRequests.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {clientRequests.map((req) => (
                  <article key={req.id} className="req-recent-event-card">
                    <div className="req-event-icon-circle circle-green">
                      <FileText size={20} />
                    </div>
                    <div className="req-event-info-col">
                      <div className="req-event-top-line">
                        <strong>{req.description}</strong>
                        <span className="req-event-escrow-badge">ID #{req.id.slice(-6)}</span>
                      </div>
                      <p className="req-event-desc-p">
                        Artista: <strong>{req.artistName || 'Creador ArtLink'}</strong> • Presupuesto: <strong>${req.budget} USD</strong> • Fecha: {req.desiredDate}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ══════════════════════════════════════════════════════════════════
           RIGHT COLUMN: SIDEBAR FILTERS, BOT TIP & EXPORT
           ══════════════════════════════════════════════════════════════════ */}
        <aside className="req-sidebar-column" aria-label="Filtros y utilidades">
          {/* Card 1: Filtros de Entrada */}
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
                <span className="req-filter-badge-count count-purple">3</span>
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
                <span className="req-filter-badge-count count-cyan">2</span>
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
                <span className="req-filter-badge-count count-pink">1</span>
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
                <span className="req-filter-badge-count count-gray">5</span>
              </label>

              <label className="req-checkbox-row">
                <span className="req-checkbox-label-group">
                  <span
                    className={`req-custom-checkbox ${sidebarFilters.mentions ? 'is-checked' : ''}`}
                    onClick={() => toggleSidebarFilter('mentions')}
                  >
                    {sidebarFilters.mentions && <Check size={13} />}
                  </span>
                  <span>Menciones & Favoritos</span>
                </span>
                <span className="req-filter-badge-count count-gray">8</span>
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
                <h3 className="req-artie-title-main">Optimiza tu Tienda</h3>
              </div>
            </div>
            <p className="req-artie-body-text">
              ✦ <strong>Dato pro:</strong> Los artistas que responden solicitudes de comisión en menos de <strong>4 horas</strong> tienen una tasa de cierre de contrato <strong>35% mayor</strong> y reciben insignia de <em>&apos;Respuesta Veloz&apos;</em>.
            </p>
            <button
              type="button"
              className="req-artie-link-action"
              onClick={() => setShowBotTemplatesModal(true)}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <span>Configurar plantillas de respuesta</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Exportar Historial */}
          <div className="req-export-box">
            <div className="req-export-header">
              <div className="req-export-icon">
                <Download size={20} />
              </div>
              <strong>Exportar Historial</strong>
            </div>
            <p className="req-export-desc">
              Descarga un registro oficial de comisiones cerradas, recibos de custodia y auditoría fiscal.
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
         MODALES INTERACTIVOS
         ══════════════════════════════════════════════════════════════════ */}

      {/* 1. Modal Aceptar Solicitud (Kaelen Vance) */}
      <Modal
        open={showAcceptModal}
        title="Aceptar Encargo Personalizado #1094"
        onClose={() => setShowAcceptModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, color: '#374151', fontSize: '0.92rem' }}>
            Al aceptar la solicitud de <strong>Kaelen Vance</strong>, se creará el contrato en custodia por <strong>$220.00 USD</strong> y se iniciará el plazo convenido de <strong>16 días</strong>.
          </p>
          <div style={{ background: '#F0FDF4', border: '1.5px solid #16A34A', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#166534' }}>
            ✓ Los fondos serán transferidos a ArtLink Escrow Shield inmediatamente tras la confirmación de Kaelen.
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
              onClick={() => {
                setKaelenStatus('accepted')
                setShowAcceptModal(false)
                triggerToast('¡Encargo #1094 aceptado! Notificación enviada a Kaelen')
              }}
            >
              Confirmar y Aceptar
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Modal Proponer Ajuste de Tarifa / Plazo */}
      <Modal
        open={showCounterOfferModal}
        title="Proponer Ajuste de Tarifa o Plazo"
        onClose={() => setShowCounterOfferModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem' }}>
            Puedes proponer un nuevo valor presupuestario o ajustar los días de entrega según tu carga de trabajo actual:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Nueva Tarifa Propuesta (USD):
              </label>
              <input
                type="number"
                defaultValue={250}
                style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #1E192B', borderRadius: 6, fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Nuevo Plazo (Días):
              </label>
              <input
                type="number"
                defaultValue={20}
                style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #1E192B', borderRadius: 6, fontWeight: 700 }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              Motivo o sugerencia para el cliente:
            </label>
            <textarea
              rows={3}
              defaultValue="Hola Kaelen, me interesa mucho el proyecto. Por el nivel de detalle de las 3 expresiones y la capa cósmica, propongo 20 días para garantizar la máxima calidad."
              style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #1E192B', borderRadius: 6, fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setShowCounterOfferModal(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                setShowCounterOfferModal(false)
                triggerToast('Contrapropuesta enviada exitosamente a Kaelen Vance')
              }}
            >
              Enviar Propuesta
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Modal Pedir Modificaciones para Boceto */}
      <Modal
        open={showRevisionModal}
        title="Solicitar Modificaciones del Boceto v1.2"
        onClose={() => setShowRevisionModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem' }}>
            Indica a Mía Soler los cambios específicos necesarios antes de autorizar el paso a la fase de Color &amp; Sombreado:
          </p>
          <textarea
            rows={4}
            placeholder="Ejemplo: Por favor inclinar ligeramente el rostro hacia la derecha y añadir más brillo a las luciérnagas..."
            style={{ width: '100%', padding: '0.65rem', border: '1.5px solid #1E192B', borderRadius: 8, fontSize: '0.88rem' }}
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
              onClick={() => {
                setMiaStatus('revision_requested')
                setShowRevisionModal(false)
                triggerToast('Solicitud de modificaciones enviada a Mía Soler')
              }}
            >
              Enviar Observaciones
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Modal Hoja de Ruta de Renzo Miyazaki */}
      <Modal
        open={showRoadmapModal}
        title="Hoja de Ruta: Mecha Cyber Samurai 3D"
        onClose={() => setShowRoadmapModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #E5E7EB' }}>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
              alt="Renzo Miyazaki"
              style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid #1E192B' }}
            />
            <div>
              <strong style={{ display: 'block' }}>Renzo Miyazaki (@renzo_mecha)</strong>
              <small style={{ color: '#6B7280' }}>Cronograma total: 20 días (Inicio: Hace 2 días)</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { num: '1', title: 'Briefing técnico y siluetas base', status: 'En progreso', badge: 'Actual', dates: 'Día 1 - 4' },
              { num: '2', title: 'Modelado High-Poly y armadura cyberpunk', status: 'Próximo', badge: 'Hito Escrow 1', dates: 'Día 5 - 10' },
              { num: '3', title: 'Retopología Low-Poly y mapas UV', status: 'Pendiente', badge: 'Hito Escrow 2', dates: 'Día 11 - 15' },
              { num: '4', title: 'Texturizado PBR 4K y entrega FBX/OBJ', status: 'Final', badge: 'Liberación total', dates: 'Día 16 - 20' },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  border: '1.5px solid #1E192B',
                  borderRadius: 8,
                  background: step.badge === 'Actual' ? '#EDE9FE' : '#FFFFFF',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: step.badge === 'Actual' ? '#7C3AED' : '#1E192B',
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
                  <small style={{ color: '#6B7280' }}>{step.dates} • {step.badge}</small>
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
              Entendido
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Modal Comprobante de Depósito Escrow Shield */}
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
              Código de transacción: ESC-8921-ARTLK-2026
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ background: '#FFFDF8', border: '1.5px solid #1E192B', padding: '0.65rem', borderRadius: 6 }}>
              <span style={{ color: '#6B7280', fontSize: '0.75rem', display: 'block' }}>Monto retenido:</span>
              <strong style={{ fontSize: '1.1rem' }}>$160.00 USD</strong>
            </div>
            <div style={{ background: '#FFFDF8', border: '1.5px solid #1E192B', padding: '0.65rem', borderRadius: 6 }}>
              <span style={{ color: '#6B7280', fontSize: '0.75rem', display: 'block' }}>Beneficiario condicional:</span>
              <strong>@miasoler_art</strong>
            </div>
            <div style={{ background: '#FFFDF8', border: '1.5px solid #1E192B', padding: '0.65rem', borderRadius: 6 }}>
              <span style={{ color: '#6B7280', fontSize: '0.75rem', display: 'block' }}>Garantía:</span>
              <strong>Satisfacción o reembolso 100%</strong>
            </div>
            <div style={{ background: '#FFFDF8', border: '1.5px solid #1E192B', padding: '0.65rem', borderRadius: 6 }}>
              <span style={{ color: '#6B7280', fontSize: '0.75rem', display: 'block' }}>Firma Criptográfica:</span>
              <code style={{ fontSize: '0.7rem' }}>SHA256: 7f83b165...</code>
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

      {/* 6. Modal Plantillas de Respuesta de Artie Bot */}
      <Modal
        open={showBotTemplatesModal}
        title="Plantillas de Respuesta Rápida ArtLink"
        onClose={() => setShowBotTemplatesModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ margin: 0, color: '#4B5563', fontSize: '0.88rem' }}>
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
              text: '¡Hola! Actualmente tengo una cola de 3 comisiones en progreso. Me encantaría hacer tu encargo con un inicio programado para dentro de 10 días para dedicarle el 100% de atención.',
            },
          ].map((tpl, i) => (
            <div
              key={i}
              style={{
                border: '1.5px solid #1E192B',
                borderRadius: 8,
                padding: '0.75rem',
                background: '#FFFDF8',
              }}
            >
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                {tpl.title}
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#4B5563', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                {tpl.text}
              </p>
              <button
                type="button"
                className="button button-outline button-small"
                onClick={() => {
                  setShowBotTemplatesModal(false)
                  triggerToast(`Plantilla "${tpl.title}" copiada al portapapeles`)
                }}
              >
                Copiar y Usar en Chat
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

      {/* 7. Modal de Detalle Completo para Solicitudes del Servidor */}
      <Modal
        open={Boolean(selectedRequest)}
        title="Detalle de Solicitud de Comisión"
        onClose={() => setSelectedRequest(null)}
      >
        {selectedRequest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800 }}>ID: #{selectedRequest.id}</span>
              <span className="req-event-escrow-badge">{selectedRequest.status}</span>
            </div>

            <div>
              <strong>Descripción:</strong>
              <p style={{ background: '#F9FAFB', border: '1px solid #1E192B', borderRadius: 6, padding: '0.75rem', marginTop: '0.25rem' }}>
                {selectedRequest.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <small style={{ color: '#6B7280', display: 'block' }}>Presupuesto:</small>
                <strong style={{ fontSize: '1.2rem', color: '#6D28D9' }}>${selectedRequest.budget} USD</strong>
              </div>
              <div>
                <small style={{ color: '#6B7280', display: 'block' }}>Fecha acordada:</small>
                <strong>{selectedRequest.desiredDate}</strong>
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
