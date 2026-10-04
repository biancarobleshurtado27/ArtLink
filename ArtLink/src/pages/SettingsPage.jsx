import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Bell,
  Building,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Download,
  Eye,
  FileCheck,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Key,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Palette,
  PauseCircle,
  Radio,
  RotateCcw,
  Save,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Type,
  User,
  UserCheck,
  Volume2,
  X,
  Zap,
} from 'lucide-react'
import useSettings from '../hooks/useSettings'
import useAuth from '../hooks/useAuth'
import ReadAloudButton from '../components/ReadAloudButton'
import { getUserById, updateUser as updateUserService } from '../services/userService'
import { getArtistByUserId, updateArtist as updateArtistService } from '../services/artistService'
import '../styles/settingsStudio.css'

const ALL_DISCIPLINES = [
  'Ilustración Digital',
  'Concept Art',
  'Modelado 3D',
  'Pixel Art',
  'Voxel Art',
  'Animación 2D/3D',
  'UI/UX Design',
  'Arte Generativo',
]

const BANNER_PRESETS = [
  { label: 'Azure Isles', url: '/images/hero/azure_isles.jpg' },
  { label: 'Magic Studio', url: '/images/hero/magic_shop.jpg' },
  { label: 'Sora Moon Night', url: '/images/hero/soramoon.jpg' },
]

export default function SettingsPage({ initialTab }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUser, logout } = useAuth()
  const {
    settings,
    updateSetting,
    updateNotifications,
    updatePrivacy,
    updatePreferences,
    saveSettings,
    resetSettings,
    statusMessage,
  } = useSettings()

  const isProfileRoute =
    initialTab === 'perfil' ||
    location.pathname === '/settings/profile' ||
    location.pathname === '/ajustes/perfil' ||
    location.pathname.endsWith('/profile') ||
    location.pathname.endsWith('/perfil')

  // Tab activo para el índice lateral
  const [activeTab, setActiveTab] = useState(() => {
    if (isProfileRoute) return 'perfil'
    if (initialTab) return initialTab
    const params = new URLSearchParams(location.search)
    return params.get('tab') || 'perfil'
  })

  // Mensajes de feedback local
  const [localFeedback, setLocalFeedback] = useState({ type: '', text: '' })
  const [showTip, setShowTip] = useState(true)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)

  // ── ESTADO DEL TALLER Y PERFIL ──
  const [artistProfile, setArtistProfile] = useState(null)
  const [bannerUrl, setBannerUrl] = useState('/images/hero/azure_isles.jpg')
  const [displayName, setDisplayName] = useState('Mia Solar')
  const [username, setUsername] = useState('@miasolar_art')
  const [tagline, setTagline] = useState(
    'Ilustradora Digital 2D & Concept Artist especializada en personajes fantásticos y estética anime.'
  )
  const [bioExtended, setBioExtended] = useState(
    '¡Hola! Llevo más de 6 años ilustrando universos mágicos para juegos indie, portadas de novelas ligeras y comisiones personalizadas. Amante de las paletas soñadoras, los colores lila y los detalles minuciosos. ¡Hablemos de tu idea!'
  )
  const [locationStudio, setLocationStudio] = useState('Barcelona, España')
  const [languages, setLanguages] = useState('Español (Nativo), English (Fluent)')
  const [socialX, setSocialX] = useState('https://x.com/miasolar_art')
  const [socialInstagram, setSocialInstagram] = useState('https://instagram.com/miasolar.paint')
  const [socialArtstation, setSocialArtstation] = useState('https://artstation.com/miasolar')
  const [socialDiscord, setSocialDiscord] = useState('miasolar#8492')

  // ── ESTADOS DE COMISIÓN Y TALLER EN VIVO ──
  const [isStudioOpen, setIsStudioOpen] = useState(true)
  const [slotsCount, setSlotsCount] = useState(5)
  const [activeProjectsCount, setActiveProjectsCount] = useState(3)
  const [initialResponseTime, setInitialResponseTime] = useState('< 24 horas')
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('7 - 10 Días')
  const [reqVisualRefs, setReqVisualRefs] = useState(true)
  const [reqColorPaletteApproval, setReqColorPaletteApproval] = useState(true)
  const [reqCommercialUseDefault, setReqCommercialUseDefault] = useState(false)

  // ── FACTURACIÓN Y ESCROW ──
  const [bankAccount, setBankAccount] = useState('Banco Santander •••• 4121 (Retiros automáticos quincenales)')
  const [currency, setCurrency] = useState('USD')
  const [minWithdrawal, setMinWithdrawal] = useState('100')
  const [allowVoluntaryTips, setAllowVoluntaryTips] = useState(true)

  // ── NOTIFICACIONES EN VIVO (PUSH & EMAIL) ──
  const [liveNotifs, setLiveNotifs] = useState({
    requestsPush: true,
    requestsEmail: true,
    messagesPush: true,
    messagesEmail: false,
    escrowPush: true,
    escrowEmail: true,
    insightsPush: true,
    insightsEmail: false,
  })

  // ── SEGURIDAD Y CUENTA ──
  const [accountEmail, setAccountEmail] = useState(user?.email || 'mia.solar@artlink.demo')
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passFeedback, setPassFeedback] = useState('')
  const [isPausedForVacation, setIsPausedForVacation] = useState(false)

  // Texto muestra para accesibilidad
  const sampleText =
    'ArtLink es la plataforma donde puedes descubrir artistas digitales, encargar piezas personalizadas con tarifas claras y disponibilidad en vivo.'

  // Cargar datos reales de usuario y artista si están en sesión
  useEffect(() => {
    let mounted = true
    async function loadUserData() {
      if (!user?.id) return
      try {
        const freshUser = await getUserById(user.id).catch(() => null)
        if (!mounted) return
        const u = freshUser || user

        if (u.name) setDisplayName(u.name)
        if (u.email) setAccountEmail(u.email)
        if (u.bio) setBioExtended(u.bio)
        if (u.location) setLocationStudio(u.location)

        const profiles = await getArtistByUserId(user.id).catch(() => null)
        const profile = Array.isArray(profiles) ? profiles[0] : profiles
        if (profile && mounted) {
          setArtistProfile(profile)
          if (profile.displayName) setDisplayName(profile.displayName)
          if (profile.username) setUsername(profile.username.startsWith('@') ? profile.username : `@${profile.username}`)
          if (profile.tagline) setTagline(profile.tagline)
          if (profile.bio) setBioExtended(profile.bio)
          if (profile.location) setLocationStudio(profile.location)
          if (profile.bannerUrl) setBannerUrl(profile.bannerUrl)
          if (typeof profile.slots === 'number') setSlotsCount(profile.slots)
          if (profile.availability) setIsStudioOpen(profile.availability === 'open')
          if (profile.socialLinks?.x) setSocialX(profile.socialLinks.x)
          if (profile.socialLinks?.instagram) setSocialInstagram(profile.socialLinks.instagram)
        }
      } catch {
        // Fallback a los valores de demostración
      }
    }
    loadUserData()
    return () => {
      mounted = false
    }
  }, [user?.id])

  useEffect(() => {
    if (
      location.pathname === '/settings/profile' ||
      location.pathname === '/ajustes/perfil' ||
      location.pathname.endsWith('/profile') ||
      location.pathname.endsWith('/perfil')
    ) {
      setActiveTab('perfil')
    }
  }, [location.pathname])

  // Desplazamiento y activación de pestañas
  function handleTabClick(tabKey, targetElementId) {
    setActiveTab(tabKey)
    if (targetElementId && typeof document !== 'undefined') {
      const el = document.getElementById(targetElementId)
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Guardar todos los cambios (Global)
  async function handleGlobalSave() {
    try {
      saveSettings()

      if (user?.id) {
        await updateUserService(user.id, {
          name: displayName,
          email: accountEmail,
          bio: bioExtended,
          location: locationStudio,
        }).catch(() => null)

        if (updateUser) {
          updateUser({
            name: displayName,
            email: accountEmail,
            bio: bioExtended,
            location: locationStudio,
          })
        }

        if (artistProfile?.id) {
          await updateArtistService(artistProfile.id, {
            displayName,
            username: username.replace(/^@/, ''),
            tagline,
            bio: bioExtended,
            location: locationStudio,
            bannerUrl,
            slots: slotsCount,
            availability: isStudioOpen ? 'open' : 'closed',
            socialLinks: {
              ...artistProfile.socialLinks,
              x: socialX,
              instagram: socialInstagram,
            },
          }).catch(() => null)
        }
      }

      setLocalFeedback({
        type: 'success',
        text: '¡Ajustes de cuenta, taller y preferencias guardados con éxito!',
      })
      setTimeout(() => setLocalFeedback({ type: '', text: '' }), 5000)
    } catch {
      setLocalFeedback({
        type: 'error',
        text: 'Ocurrió un inconveniente al guardar. Se preservaron los cambios locales.',
      })
    }
  }

  // Descartar cambios y restaurar
  function handleDiscard() {
    resetSettings()
    setDisplayName(user?.name || 'Mia Solar')
    setUsername('@miasolar_art')
    setTagline('Ilustradora Digital 2D & Concept Artist especializada en personajes fantásticos y estética anime.')
    setBioExtended(
      '¡Hola! Llevo más de 6 años ilustrando universos mágicos para juegos indie, portadas de novelas ligeras y comisiones personalizadas. Amante de las paletas soñadoras, los colores lila y los detalles minuciosos. ¡Hablemos de tu idea!'
    )
    setLocationStudio('Barcelona, España')
    setBannerUrl('/images/hero/azure_isles.jpg')
    setIsStudioOpen(true)
    setSlotsCount(5)
    setLocalFeedback({
      type: 'info',
      text: 'Se han restaurado los valores predeterminados del taller.',
    })
    setTimeout(() => setLocalFeedback({ type: '', text: '' }), 4000)
  }

  // Cambio de contraseña
  function handleSavePassword(e) {
    e.preventDefault()
    if (!newPass || newPass.length < 4) {
      setPassFeedback('La nueva contraseña debe tener al menos 4 caracteres.')
      return
    }
    setPassFeedback('Contraseña actualizada con éxito.')
    setCurrentPass('')
    setNewPass('')
    setTimeout(() => setPassFeedback(''), 4000)
  }

  // Alternar disciplinas
  function handleToggleDiscipline(disc) {
    const current = settings.preferences?.favoriteDisciplines || []
    const next = current.includes(disc) ? current.filter((d) => d !== disc) : [...current, disc]
    updatePreferences('favoriteDisciplines', next)
  }

  // Exportar ZIP
  function handleExportStudioZip() {
    setLocalFeedback({
      type: 'success',
      text: 'Generando archivo .ZIP comprimido de tu taller (contratos, portafolio y comprobantes)...',
    })
    setTimeout(() => {
      setLocalFeedback({
        type: 'success',
        text: 'Descarga de ArtLink_Studio_Backup.zip iniciada.',
      })
    }, 1500)
  }

  // Pausar taller
  function handleTogglePauseStudio() {
    setIsPausedForVacation((prev) => !prev)
    setIsStudioOpen((prev) => !prev)
    setLocalFeedback({
      type: 'info',
      text: !isPausedForVacation
        ? 'El taller ha sido pausado por vacaciones. Se preservan tus reseñas.'
        : '¡Taller reactivado y visible para recibir nuevos encargos!',
    })
    setTimeout(() => setLocalFeedback({ type: '', text: '' }), 4000)
  }

  return (
    <div className="studio-settings-page" aria-labelledby="settings-main-heading">
      {/* ── ENCABEZADO SUPERIOR ── */}
      <header className="studio-settings-topbar">
        <div className="studio-header-main">
          <div className="studio-status-pills">
            <span className="studio-sync-pill">
              <span className="studio-live-dot" aria-hidden="true" />
              ENLACE ACTIVO & SINCRONIZADO
            </span>
            <span className="studio-version-pill">V2.4 PRO STUDIO</span>
          </div>
          <h1 id="settings-main-heading" className="studio-page-title">
            Ajustes de Cuenta y Taller
          </h1>
          <p className="studio-page-subtitle">
            Personaliza tu identidad de creador, políticas de comisiones, pagos en Escrow Shield y preferencias de
            privacidad.
          </p>
        </div>

        <div className="studio-header-actions">
          <button type="button" className="studio-btn-discard" onClick={handleDiscard}>
            <RotateCcw size={14} aria-hidden="true" /> DESCARTAR
          </button>
          <button type="button" className="studio-btn-save" onClick={handleGlobalSave}>
            <Save size={16} aria-hidden="true" /> Guardar Cambios
          </button>
        </div>
      </header>

      {/* Banner de estado para accesibilidad aria-live */}
      <div aria-live="polite" aria-atomic="true">
        {(localFeedback.text || statusMessage) && (
          <div
            className={`studio-alert-banner ${localFeedback.type === 'error' ? 'is-error' : ''}`}
            role="status"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{localFeedback.text || statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocalFeedback({ type: '', text: '' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              aria-label="Cerrar aviso"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* ── GRID DE DOS COLUMNAS ── */}
      <div className="studio-main-grid">
        {/* ── COLUMNA LATERAL (SIDEBAR) ── */}
        <aside className="studio-sidebar" aria-label="Navegación de secciones del taller">
          {/* Card 1: Índice del Taller */}
          <div className="studio-sidebar-card">
            <span className="studio-sidebar-tag">NAVEGACIÓN</span>
            <div className="studio-sidebar-header">
              <h2 className="studio-sidebar-title">Índice del Taller</h2>
              <span className="studio-sidebar-count-badge">6 Secciones</span>
            </div>

            <nav className="studio-nav-list" role="tablist" aria-label="Secciones de ajustes">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'perfil'}
                aria-label="Perfil & Vitrina (Mi perfil)"
                className={`studio-nav-item ${activeTab === 'perfil' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('perfil', 'section-perfil')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <Sparkles size={16} aria-hidden="true" />
                  </span>
                  <span>Perfil & Vitrina</span>
                </div>
                <ChevronRight size={14} className="studio-nav-arrow" aria-hidden="true" />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'comisiones'}
                aria-label="Comisiones & Cupos"
                className={`studio-nav-item ${activeTab === 'comisiones' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('comisiones', 'section-comisiones')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <FileText size={16} aria-hidden="true" />
                  </span>
                  <span>Comisiones & Cupos</span>
                </div>
                <span className="studio-nav-pill-badge studio-pill-cyan">EN VIVO</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'facturacion'}
                aria-label="Facturación & Escrow"
                className={`studio-nav-item ${activeTab === 'facturacion' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('facturacion', 'section-facturacion')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <CreditCard size={16} aria-hidden="true" />
                  </span>
                  <span>Facturación & Escrow</span>
                </div>
                <span className="studio-pill-dot" aria-label="Alerta de facturación" />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'notificaciones'}
                aria-label="Notificaciones & Avisos"
                className={`studio-nav-item ${activeTab === 'notificaciones' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('notificaciones', 'section-notificaciones')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <Bell size={16} aria-hidden="true" />
                  </span>
                  <span>Notificaciones & Avisos</span>
                </div>
                <span className="studio-nav-pill-badge studio-pill-mint">+</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'seguridad'}
                aria-label="Seguridad & Acceso"
                className={`studio-nav-item ${activeTab === 'seguridad' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('seguridad', 'section-seguridad')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <ShieldCheck size={16} aria-hidden="true" />
                  </span>
                  <span>Seguridad & Acceso</span>
                </div>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'apariencia'}
                aria-label="Integraciones de Arte (Apariencia y accesibilidad)"
                className={`studio-nav-item ${activeTab === 'apariencia' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('apariencia', 'section-apariencia')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <Palette size={16} aria-hidden="true" />
                  </span>
                  <span>Integraciones de Arte</span>
                </div>
                <span className="studio-nav-pill-badge studio-pill-pink">APPS</span>
              </button>
            </nav>

            {/* 4 Botones de herramientas rápidas */}
            <div className="studio-sidebar-quick-bar">
              <button
                type="button"
                className="studio-quick-tool-btn"
                title="Editar Portada y Datos"
                onClick={() => handleTabClick('perfil', 'section-perfil')}
              >
                <Sparkles size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="studio-quick-tool-btn"
                title="Ajustar Cupos y Disponibilidad"
                onClick={() => handleTabClick('comisiones', 'section-comisiones')}
              >
                <Sliders size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="studio-quick-tool-btn"
                title="Preferencias de Notificaciones"
                onClick={() => handleTabClick('notificaciones', 'section-notificaciones')}
              >
                <MessageSquare size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="studio-quick-tool-btn"
                title="Tema y Accesibilidad Visual"
                onClick={() => handleTabClick('apariencia', 'section-apariencia')}
              >
                <Sun size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 2: Tip de Arte */}
          {showTip && (
            <div className="studio-tip-card">
              <span className="studio-tip-top-badge">SUGERENCIA PRO</span>
              <div className="studio-tip-header-row">
                <div className="studio-tip-avatar-box">
                  <span role="img" aria-label="Paleta de artista">🎨</span>
                </div>
                <div>
                  <h3 className="studio-tip-title">
                    Tip de Arte <span className="studio-pro-badge">PRO</span>
                  </h3>
                </div>
              </div>
              <p className="studio-tip-body">
                Mantén actualizados tus términos de entrega y cupos disponibles. Los perfiles con{' '}
                <strong>100% de transparencia</strong> reciben 2.4x más solicitudes en la galería de exploración.
              </p>
              <div className="studio-tip-links">
                <button
                  type="button"
                  className="studio-tip-discard-link"
                  onClick={() => setShowTip(false)}
                >
                  Descartar este tip
                </button>
                <Link to="/como-funciona" className="studio-tip-action-link">
                  Consultar el kit de éxito &gt;
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* ── COLUMNA PRINCIPAL DE CONTENIDO (SECCIONES) ── */}
        <main className="studio-sections-column">
          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 1: IDENTIDAD Y VITRINA PÚBLICA
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-perfil" className="studio-card" aria-labelledby="heading-perfil">
            <span className="studio-card-tag">● PERFIL PÚBLICO</span>
            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-perfil" className="studio-card-title">
                  Identidad y Vitrina Pública
                  <span className="sr-only"> — Modificar perfil</span>
                </h2>
              </div>
              <span className="studio-card-badge-right studio-badge-coral">Visible en Directorio</span>
            </div>
            <p className="studio-card-subtitle">
              Configura la expresión de tus recursos, enlaces sociales y el avatar que verán tus visitantes cuando exploren
              tu catálogo.
            </p>

            {/* Portada y avatar */}
            <div className="studio-banner-section-label">PORTADA DEL ESTUDIO &amp; RETRATO DE ARTISTA</div>
            <div className="studio-banner-wrapper">
              <img
                src={bannerUrl}
                alt="Portada del estudio artístico"
                className="studio-banner-image"
                onError={(e) => {
                  e.currentTarget.src = '/images/hero/azure_isles.jpg'
                }}
              />
              <button
                type="button"
                className="studio-banner-update-btn"
                onClick={() => setShowBannerModal((v) => !v)}
              >
                <Camera size={14} aria-hidden="true" />
                <span>Actualizar Portada (1920x480)</span>
              </button>

              <div className="studio-avatar-overlap">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="studio-avatar-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="studio-avatar-fallback"
                  style={{ display: user?.avatar ? 'none' : 'flex' }}
                >
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="studio-banner-bottom-info">
              <span>PNG, JPG hasta 5MB. Relación recomendada 4:1</span>
              <button
                type="button"
                className="studio-btn-delete-banner"
                onClick={() => setBannerUrl('/images/hero/azure_isles.jpg')}
              >
                ELIMINAR
              </button>
            </div>

            {/* Modal / Selector de Portada */}
            {showBannerModal && (
              <div
                style={{
                  background: '#F5F3FF',
                  border: '1.5px solid #C4B5FD',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Elige una portada de galería o introduce una URL:
                </strong>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                  {BANNER_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className="studio-chip-btn"
                      onClick={() => {
                        setBannerUrl(p.url)
                        setShowBannerModal(false)
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="studio-input-wrap">
                  <input
                    type="url"
                    className="studio-input"
                    placeholder="https://ejemplo.com/mi-portada.jpg"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Campos del formulario de identidad */}
            <div className="studio-form-grid-two">
              <label className="studio-field-label">
                <span>Nombre para Mostrar</span>
                <input
                  type="text"
                  className="studio-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </label>

              <label className="studio-field-label">
                <span>Nombre de Usuario (Handle)</span>
                <input
                  type="text"
                  className="studio-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="studio-field-label">
                <span>Titular Profesional / Bio Breve</span>
                <input
                  type="text"
                  className="studio-input"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="studio-field-label">
                <div className="studio-label-with-counter">
                  <span>Biografía Extendida del Taller</span>
                  <span className="studio-char-counter">{bioExtended.length} / 600 Caracteres</span>
                </div>
                <textarea
                  className="studio-textarea"
                  maxLength={600}
                  value={bioExtended}
                  onChange={(e) => setBioExtended(e.target.value)}
                />
              </label>
            </div>

            <div className="studio-form-grid-two">
              <label className="studio-field-label">
                <span>Ubicación del Estudio</span>
                <div className="studio-input-wrap">
                  <MapPin size={16} className="studio-input-icon-prefix" aria-hidden="true" />
                  <input
                    type="text"
                    className="studio-input has-prefix"
                    value={locationStudio}
                    onChange={(e) => setLocationStudio(e.target.value)}
                  />
                </div>
              </label>

              <label className="studio-field-label">
                <span>Idiomas de Comunicación</span>
                <div className="studio-input-wrap">
                  <Globe size={16} className="studio-input-icon-prefix" aria-hidden="true" />
                  <input
                    type="text"
                    className="studio-input has-prefix"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Redes sociales */}
            <div style={{ marginTop: '1rem' }}>
              <span className="studio-reqs-section-title">Redes Sociales &amp; Portafolios Enlazados</span>
              <div className="studio-socials-grid">
                <div className="studio-input-wrap">
                  <span className="studio-input-icon-prefix" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    𝕏
                  </span>
                  <input
                    type="text"
                    className="studio-input has-prefix has-suffix"
                    value={socialX}
                    onChange={(e) => setSocialX(e.target.value)}
                  />
                  <ArrowUpRight size={14} className="studio-input-icon-suffix" aria-hidden="true" />
                </div>

                <div className="studio-input-wrap">
                  <span className="studio-input-icon-prefix" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    📸
                  </span>
                  <input
                    type="text"
                    className="studio-input has-prefix has-suffix"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                  />
                  <ArrowUpRight size={14} className="studio-input-icon-suffix" aria-hidden="true" />
                </div>

                <div className="studio-input-wrap">
                  <span className="studio-input-icon-prefix" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    🎨
                  </span>
                  <input
                    type="text"
                    className="studio-input has-prefix has-suffix"
                    value={socialArtstation}
                    onChange={(e) => setSocialArtstation(e.target.value)}
                  />
                  <ArrowUpRight size={14} className="studio-input-icon-suffix" aria-hidden="true" />
                </div>

                <div className="studio-input-wrap">
                  <span className="studio-input-icon-prefix" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    💬
                  </span>
                  <input
                    type="text"
                    className="studio-input has-prefix has-suffix"
                    value={socialDiscord}
                    onChange={(e) => setSocialDiscord(e.target.value)}
                  />
                  <ArrowUpRight size={14} className="studio-input-icon-suffix" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Disciplinas Artísticas */}
            <div style={{ marginTop: '1.25rem' }}>
              <span className="studio-reqs-section-title">Disciplinas Artísticas del Catálogo</span>
              <div className="studio-discipline-chips">
                {ALL_DISCIPLINES.map((disc) => {
                  const isFav = (settings.preferences?.favoriteDisciplines || []).includes(disc)
                  return (
                    <button
                      key={disc}
                      type="button"
                      className={`studio-chip-btn ${isFav ? 'is-selected' : ''}`}
                      onClick={() => handleToggleDiscipline(disc)}
                    >
                      {isFav && <Check size={13} aria-hidden="true" />}
                      <span>{disc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 2: DISPONIBILIDAD & NORMAS DE ENCARGO
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-comisiones" className="studio-card" aria-labelledby="heading-comisiones">
            <span className="studio-card-tag" style={{ background: '#FFE4E6', borderColor: '#FDA4AF', color: '#BE123C' }}>
              ● TALLER EN VIVO
            </span>
            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-comisiones" className="studio-card-title">
                  Disponibilidad &amp; Normas de Encargo
                </h2>
              </div>
              <span className="studio-card-badge-right studio-badge-cyan">Tiempo Real</span>
            </div>
            <p className="studio-card-subtitle">
              Controla cuántos proyectos admites al mes y los requisitos que cada cliente debe reunir antes de enviar una
              propuesta.
            </p>

            {/* Switch general del estado del taller */}
            <div className="studio-switch-card-main">
              <div className="studio-switch-left-info">
                <div className="studio-switch-circle-icon">
                  <Radio size={20} aria-hidden="true" />
                </div>
                <div className="studio-switch-text-wrap">
                  <strong>
                    Estado General del Taller
                    {isStudioOpen ? (
                      <span className="studio-state-pill-open">ABIERTO</span>
                    ) : (
                      <span className="studio-state-pill-closed">CERRADO</span>
                    )}
                  </strong>
                  <small>
                    {isStudioOpen
                      ? 'Actualmente aceptando nuevas solicitudes a través del formulario de vitrina.'
                      : 'Vitrina pausada. Los clientes no podrán enviar encargos por el momento.'}
                  </small>
                </div>
              </div>
              <label className="studio-toggle-switch">
                <input
                  type="checkbox"
                  checked={isStudioOpen}
                  onChange={(e) => setIsStudioOpen(e.target.checked)}
                  aria-label="Estado general del taller abierto o cerrado"
                />
                <span className="studio-toggle-slider" />
              </label>
            </div>

            {/* 3 Métricas en fila */}
            <div className="studio-metrics-three-grid">
              <div className="studio-metric-box">
                <div className="studio-metric-box-title">
                  <span>Cupos Simultáneos</span>
                  <span style={{ color: '#7C3AED', fontWeight: 800 }}>{slotsCount} Cupos</span>
                </div>
                <div className="studio-progress-bar-wrap">
                  <div
                    className="studio-progress-fill"
                    style={{ width: `${Math.min(100, (activeProjectsCount / slotsCount) * 100)}%` }}
                  />
                </div>
                <span className="studio-metric-subtext">
                  {activeProjectsCount} proyectos en proceso activo actualmente
                </span>
              </div>

              <div className="studio-metric-box">
                <div className="studio-metric-box-title">
                  <span>Respuesta Inicial</span>
                </div>
                <div className="studio-metric-value-row">
                  <Clock size={16} color="#7C3AED" aria-hidden="true" />
                  <span>{initialResponseTime}</span>
                </div>
                <span className="studio-metric-subtext">Promedio en días laborables</span>
              </div>

              <div className="studio-metric-box">
                <div className="studio-metric-box-title">
                  <span>Entrega Estimada</span>
                </div>
                <div className="studio-metric-value-row">
                  <Calendar size={16} color="#7C3AED" aria-hidden="true" />
                  <span>{estimatedDeliveryTime}</span>
                </div>
                <span className="studio-metric-subtext">Garantía para el cálculo de entrega</span>
              </div>
            </div>

            {/* Requisitos obligatorios para nuevas solicitudes */}
            <div className="studio-reqs-section-title">Requisitos Obligatorios para Nuevas Solicitudes</div>

            <label className={`studio-checkbox-card ${reqVisualRefs ? 'is-checked' : ''}`}>
              <input
                type="checkbox"
                className="studio-checkbox-control"
                checked={reqVisualRefs}
                onChange={(e) => setReqVisualRefs(e.target.checked)}
              />
              <div className="studio-checkbox-card-info">
                <strong>Exigir referencias visuales adjuntas (Mínimo 2 imágenes / Moodboard)</strong>
                <small>Evita solicitudes ambiguas y requerirá imágenes de apoyo antes de enviar la propuesta.</small>
              </div>
            </label>

            <label className={`studio-checkbox-card ${reqColorPaletteApproval ? 'is-checked' : ''}`}>
              <input
                type="checkbox"
                className="studio-checkbox-control"
                checked={reqColorPaletteApproval}
                onChange={(e) => setReqColorPaletteApproval(e.target.checked)}
              />
              <div className="studio-checkbox-card-info">
                <strong>Exigir aprobación de línea de paleta cromática inicial</strong>
                <small>El cliente debe dar visto bueno al thumbnail de color antes del render final.</small>
              </div>
            </label>

            <label className={`studio-checkbox-card ${reqCommercialUseDefault ? 'is-checked' : ''}`}>
              <input
                type="checkbox"
                className="studio-checkbox-control"
                checked={reqCommercialUseDefault}
                onChange={(e) => setReqCommercialUseDefault(e.target.checked)}
              />
              <div className="studio-checkbox-card-info">
                <strong>Uso comercial habilitado por defecto (+40% sobre tarifa base)</strong>
                <small>Añade automáticamente recargo comercial si el encargo es para videojuegos o streams.</small>
              </div>
            </label>
          </section>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 3: FACTURACIÓN, RETIROS Y ESCROW SHIELD
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-facturacion" className="studio-card" aria-labelledby="heading-facturacion">
            <span
              className="studio-card-tag"
              style={{ background: '#EDE9FE', borderColor: '#C4B5FD', color: '#6D28D9' }}
            >
              ● CUSTODIA &amp; RETIROS
            </span>
            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-facturacion" className="studio-card-title">
                  Pagos, Retiros y ArtLink Escrow Shield
                </h2>
              </div>
              <span className="studio-card-badge-right studio-badge-mint">Fondos Blindados</span>
            </div>
            <p className="studio-card-subtitle">
              El sistema retiene los fondos del cliente antes de iniciar la obra y los libera al confirmar hitos de entrega.
            </p>

            {/* Ficha de cuenta bancaria */}
            <div className="studio-bank-account-card">
              <div className="studio-bank-left">
                <div className="studio-bank-icon-box">
                  <Building size={22} aria-hidden="true" />
                </div>
                <div>
                  <div className="studio-bank-title-row">
                    <span>Transferencia Bancaria SEPA Directa</span>
                    <span className="studio-badge-verified">Verificado</span>
                  </div>
                  <div className="studio-bank-subtitle">{bankAccount}</div>
                </div>
              </div>
              <button
                type="button"
                className="studio-btn-bank-edit"
                onClick={() => setShowBankModal((v) => !v)}
              >
                Modificar Cuenta
              </button>
            </div>

            {showBankModal && (
              <div
                style={{
                  background: '#F5F3FF',
                  border: '1.5px solid #C4B5FD',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <label className="studio-field-label">
                  <span>Datos de la cuenta de cobro</span>
                  <input
                    type="text"
                    className="studio-input"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </label>
              </div>
            )}

            <div className="studio-form-grid-two">
              <label className="studio-field-label">
                <span>Moneda Predeterminada del Taller</span>
                <select
                  className="studio-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($) Dólares Americanos - Recomendado</option>
                  <option value="EUR">EUR (€) Euros Unión Europea</option>
                  <option value="MXN">MXN ($) Pesos Mexicanos</option>
                  <option value="GBP">GBP (£) Libras Esterlinas</option>
                </select>
              </label>

              <label className="studio-field-label">
                <span>Umbral Mínimo de Retiro Automático</span>
                <div className="studio-input-wrap">
                  <span className="studio-input-icon-prefix" style={{ fontWeight: 800 }}>$</span>
                  <input
                    type="number"
                    className="studio-input has-prefix"
                    value={minWithdrawal}
                    onChange={(e) => setMinWithdrawal(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Recuadro Escrow Shield */}
            <div className="studio-escrow-box">
              <div className="studio-escrow-header">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Política de Hitos con Depósito Garantizado</span>
              </div>
              <p className="studio-escrow-text">
                ArtLink Escrow Shield retiene los fondos del cliente y abona el 100% de la comisión antes de que debas
                entregar la obra definitiva. Los custodios protegen al cliente en caso de cancelación no justificada.
              </p>
              <label className="studio-notif-check-label" style={{ fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={allowVoluntaryTips}
                  onChange={(e) => setAllowVoluntaryTips(e.target.checked)}
                />
                <span>Permitir propuestas adicionales voluntarias tras entrega final en la resolución</span>
              </label>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 4: CANALES DE NOTIFICACIÓN EN VIVO
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-notificaciones" className="studio-card" aria-labelledby="heading-notificaciones">
            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-notificaciones" className="studio-card-title">
                  Canales de Notificación en Vivo
                </h2>
              </div>
            </div>
            <p className="studio-card-subtitle">
              Selecciona qué alertas deseas recibir en el navegador y en tu correo electrónico vinculado.
            </p>

            <div className="studio-notif-table">
              <div className="studio-notif-row">
                <div className="studio-notif-info">
                  <strong>Nuevas solicitudes de comisión entrantes</strong>
                  <small>Aviso inmediato cuando un cliente envíe un brief y proponga el encargo.</small>
                </div>
                <div className="studio-notif-checks-group">
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.requestsPush}
                      onChange={(e) => {
                        const val = e.target.checked
                        setLiveNotifs((prev) => ({ ...prev, requestsPush: val }))
                        updateNotifications('requests', val)
                      }}
                    />
                    <span>Push</span>
                  </label>
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.requestsEmail}
                      onChange={(e) => {
                        const val = e.target.checked
                        setLiveNotifs((prev) => ({ ...prev, requestsEmail: val }))
                        updateNotifications('emailNotifs', val)
                      }}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div className="studio-notif-row">
                <div className="studio-notif-info">
                  <strong>Mensajes de chat de clientes activos</strong>
                  <small>Conversaciones directas y consultas sobre bocetos en curso.</small>
                </div>
                <div className="studio-notif-checks-group">
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.messagesPush}
                      onChange={(e) => {
                        const val = e.target.checked
                        setLiveNotifs((prev) => ({ ...prev, messagesPush: val }))
                        updateNotifications('messages', val)
                      }}
                    />
                    <span>Push</span>
                  </label>
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.messagesEmail}
                      onChange={(e) => setLiveNotifs((prev) => ({ ...prev, messagesEmail: e.target.checked }))}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div className="studio-notif-row">
                <div className="studio-notif-info">
                  <strong>Depósitos en Escrow confirmados &amp; Pagos liberados</strong>
                  <small>Avisos de cobros de fondos transferidos a tus comisiones.</small>
                </div>
                <div className="studio-notif-checks-group">
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.escrowPush}
                      onChange={(e) => {
                        const val = e.target.checked
                        setLiveNotifs((prev) => ({ ...prev, escrowPush: val }))
                        updateNotifications('statusChanges', val)
                      }}
                    />
                    <span>Push</span>
                  </label>
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.escrowEmail}
                      onChange={(e) => setLiveNotifs((prev) => ({ ...prev, escrowEmail: e.target.checked }))}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div className="studio-notif-row">
                <div className="studio-notif-info">
                  <strong>Consejos y alertas de visibilidad de ArtLink</strong>
                  <small>Recomendaciones para optimización de portfolio y tendencias.</small>
                </div>
                <div className="studio-notif-checks-group">
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.insightsPush}
                      onChange={(e) => setLiveNotifs((prev) => ({ ...prev, insightsPush: e.target.checked }))}
                    />
                    <span>Push</span>
                  </label>
                  <label className="studio-notif-check-label">
                    <input
                      type="checkbox"
                      checked={liveNotifs.insightsEmail}
                      onChange={(e) => {
                        const val = e.target.checked
                        setLiveNotifs((prev) => ({ ...prev, insightsEmail: val }))
                        updateNotifications('marketingNotifs', val)
                      }}
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 5: SEGURIDAD, CUENTA Y PRIVACIDAD
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-seguridad" className="studio-card" aria-labelledby="heading-seguridad">
            <span
              className="studio-card-tag"
              style={{ background: '#EDE9FE', borderColor: '#C4B5FD', color: '#6D28D9' }}
            >
              ● ACCESO &amp; PRIVACIDAD
            </span>
            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-seguridad" className="studio-card-title">
                  Seguridad, Cuenta y Privacidad
                </h2>
              </div>
              <span className="studio-card-badge-right studio-badge-mint">Autenticado</span>
            </div>
            <p className="studio-card-subtitle">
              Gestiona tus datos de acceso, credenciales protegidas y controles de privacidad en la comunidad.
            </p>

            {/* Datos de cuenta y cambio de clave */}
            <div className="studio-form-grid-two">
              <label className="studio-field-label">
                <span>Correo Electrónico Vinculado</span>
                <input
                  type="email"
                  className="studio-input"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span className="studio-field-label" style={{ marginBottom: '0.45rem' }}>
                  <span>Rol en ArtLink</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                  <span className="studio-nav-pill-badge studio-pill-cyan" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    {user?.role || 'Artista Creador'}
                  </span>
                  <button
                    type="button"
                    className="studio-btn-discard"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                  >
                    <LogOut size={13} aria-hidden="true" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>

            {/* Controles de Privacidad */}
            <div style={{ marginTop: '1.2rem', marginBottom: '1.4rem' }}>
              <span className="studio-reqs-section-title">Controles de Visibilidad y Privacidad</span>

              <label className={`studio-checkbox-card ${settings.privacy?.profileVisibility === 'public' ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="studio-checkbox-control"
                  checked={settings.privacy?.profileVisibility === 'public'}
                  onChange={(e) => updatePrivacy('profileVisibility', e.target.checked ? 'public' : 'private')}
                />
                <div className="studio-checkbox-card-info">
                  <strong>Perfil Público y Visible en Buscador</strong>
                  <small>Permite que cualquier usuario descubra tu vitrina en la exploración de ArtLink.</small>
                </div>
              </label>

              <label className={`studio-checkbox-card ${settings.privacy?.showActivity ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="studio-checkbox-control"
                  checked={Boolean(settings.privacy?.showActivity)}
                  onChange={(e) => updatePrivacy('showActivity', e.target.checked)}
                />
                <div className="studio-checkbox-card-info">
                  <strong>Mostrar actividad de comisiones completadas</strong>
                  <small>Exhibe los encargos concluidos satisfactoriamente como prueba de reputación.</small>
                </div>
              </label>
            </div>

            {/* Cambio de Contraseña */}
            <form onSubmit={handleSavePassword} style={{ background: '#FAF9FE', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #DDD6FE' }}>
              <span className="studio-reqs-section-title">Actualizar Contraseña de Acceso</span>
              <div className="studio-form-grid-two" style={{ marginTop: '0.6rem' }}>
                <label className="studio-field-label">
                  <span>Contraseña Actual</span>
                  <input
                    type="password"
                    className="studio-input"
                    placeholder="••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                  />
                </label>

                <label className="studio-field-label">
                  <span>Nueva Contraseña</span>
                  <input
                    type="password"
                    className="studio-input"
                    placeholder="Mínimo 4 caracteres"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </label>
              </div>

              {passFeedback && (
                <p
                  style={{
                    color: passFeedback.includes('éxito') ? '#059669' : '#DC2626',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    margin: '0.5rem 0',
                  }}
                >
                  {passFeedback}
                </p>
              )}

              <button
                type="submit"
                className="studio-btn-discard"
                style={{ background: '#7C3AED', color: '#FFFFFF', borderColor: 'var(--ink)' }}
              >
                <Key size={14} aria-hidden="true" /> Actualizar Contraseña
              </button>
            </form>
          </section>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 6: ZONA DE GESTIÓN AVANZADA
             ══════════════════════════════════════════════════════════════ */}
          <div className="studio-advanced-zone-card">
            <div className="studio-advanced-header">
              <AlertTriangle size={20} aria-hidden="true" />
              <span>Zona de Gestión Avanzada</span>
            </div>
            <p className="studio-advanced-subtitle">
              Acciones que alteran la disponibilidad pública del taller, copia de seguridad del portafolio o desconexión
              temporal.
            </p>

            <div className="studio-advanced-actions-list">
              <div className="studio-advanced-row">
                <div className="studio-advanced-info">
                  <strong>Descargar Archivo Completo del Taller</strong>
                  <small>Descarga un archivo .ZIP de tus contratos, portafolio y recibos de impuestos.</small>
                </div>
                <button
                  type="button"
                  className="studio-btn-export-zip"
                  onClick={handleExportStudioZip}
                >
                  <Download size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                  Exportar Datos (.ZIP)
                </button>
              </div>

              <div className="studio-advanced-row">
                <div className="studio-advanced-info">
                  <strong>Pausar Taller por Vacaciones</strong>
                  <small>Oculta temporalmente el botón de comisiones sin perder tus reseñas ni tus cupos.</small>
                </div>
                <button
                  type="button"
                  className="studio-btn-pause-studio"
                  onClick={handleTogglePauseStudio}
                >
                  <PauseCircle size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                  {isPausedForVacation ? 'Reanudar Taller' : 'Pausar Taller'}
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 7: INTEGRACIONES DE ARTE, APARIENCIA & ACCESIBILIDAD
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-apariencia" className="studio-card" aria-labelledby="heading-apariencia">
            <span
              className="studio-card-tag"
              style={{ background: '#E0E7FF', borderColor: '#A5B4FC', color: '#3730A3' }}
            >
              ● ENTORNO VISUAL &amp; ACCESIBILIDAD
            </span>
            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-apariencia" className="studio-card-title">
                  Apariencia y visualización
                </h2>
              </div>
              <span className="studio-card-badge-right studio-badge-mint">Personalizado</span>
            </div>
            <p className="studio-card-subtitle">
              Ajusta el tema general de color, densidad, contraste, tamaño tipográfico y adaptaciones de lectura asistida.
            </p>

            {/* Tema de interfaz */}
            <div style={{ marginBottom: '1.4rem' }}>
              <span className="studio-reqs-section-title">Tema de la interfaz</span>
              <div className="studio-metrics-three-grid" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className={`studio-metric-box ${settings.theme === 'light' ? 'is-selected' : ''}`}
                  style={{
                    cursor: 'pointer',
                    borderColor: settings.theme === 'light' ? '#7C3AED' : '#DDD6FE',
                    background: settings.theme === 'light' ? '#EDE9FE' : '#FAF9FE',
                    textAlign: 'left',
                  }}
                  onClick={() => updateSetting('theme', 'light')}
                >
                  <Sun size={20} color="#7C3AED" style={{ marginBottom: '0.4rem' }} aria-hidden="true" />
                  <strong>Tema Claro</strong>
                  <span className="studio-metric-subtext">Fondo pastel con texto obscuro</span>
                </button>

                <button
                  type="button"
                  className={`studio-metric-box ${settings.theme === 'dark' ? 'is-selected' : ''}`}
                  style={{
                    cursor: 'pointer',
                    borderColor: settings.theme === 'dark' ? '#7C3AED' : '#DDD6FE',
                    background: settings.theme === 'dark' ? '#EDE9FE' : '#FAF9FE',
                    textAlign: 'left',
                  }}
                  onClick={() => updateSetting('theme', 'dark')}
                >
                  <Moon size={20} color="#7C3AED" style={{ marginBottom: '0.4rem' }} aria-hidden="true" />
                  <strong>Tema Oscuro</strong>
                  <span className="studio-metric-subtext">Fondo nocturno con acentos vibrantes</span>
                </button>

                <button
                  type="button"
                  className={`studio-metric-box ${settings.theme === 'system' ? 'is-selected' : ''}`}
                  style={{
                    cursor: 'pointer',
                    borderColor: settings.theme === 'system' ? '#7C3AED' : '#DDD6FE',
                    background: settings.theme === 'system' ? '#EDE9FE' : '#FAF9FE',
                    textAlign: 'left',
                  }}
                  onClick={() => updateSetting('theme', 'system')}
                >
                  <Sparkles size={20} color="#7C3AED" style={{ marginBottom: '0.4rem' }} aria-hidden="true" />
                  <strong>Sincronizar SO</strong>
                  <span className="studio-metric-subtext">Preferencia del sistema operativo</span>
                </button>
              </div>
            </div>

            {/* Escala tipográfica y contraste */}
            <div className="studio-form-grid-two">
              <label htmlFor="font-size-select" className="studio-field-label">
                <span>
                  <Type size={16} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Tamaño de texto
                </span>
                <select
                  id="font-size-select"
                  className="studio-input"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value)}
                >
                  <option value="normal">Normal (100%)</option>
                  <option value="large">Grande (112.5%)</option>
                  <option value="xlarge">Extra grande (125%)</option>
                </select>
              </label>

              <label htmlFor="contrast-select" className="studio-field-label">
                <span>
                  <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Nivel de contraste
                </span>
                <select
                  id="contrast-select"
                  className="studio-input"
                  value={settings.contrast}
                  onChange={(e) => updateSetting('contrast', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="high">Alto contraste</option>
                  <option value="soft">Contraste suave</option>
                </select>
              </label>
            </div>

            {/* Adaptación para daltonismo */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="color-mode-select" className="studio-field-label">
                <span>
                  <Palette size={16} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Filtro de Daltonismo
                </span>
                <select
                  id="color-mode-select"
                  className="studio-input"
                  value={settings.colorMode}
                  onChange={(e) => updateSetting('colorMode', e.target.value)}
                >
                  <option value="normal">Sin filtro (Normal)</option>
                  <option value="protanopia">Protanopia (Deficiencia de rojo)</option>
                  <option value="deuteranopia">Deuteranopia (Deficiencia de verde)</option>
                  <option value="tritanopia">Tritanopia (Deficiencia de azul)</option>
                </select>
              </label>
            </div>

            {/* Muestra de lectura */}
            <div
              style={{
                background: '#FAF9FE',
                border: '1.5px solid #DDD6FE',
                borderRadius: '12px',
                padding: '1.1rem',
                marginBottom: '1.25rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--badge)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#7C3AED',
                }}
              >
                Vista previa de lectura adaptada
              </span>
              <p style={{ margin: '0.5rem 0 0', lineHeight: 1.6, fontSize: '0.95rem' }}>{sampleText}</p>
            </div>

            {/* Opciones adicionales de accesibilidad */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label className={`studio-checkbox-card ${settings.reduceMotion ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="studio-checkbox-control"
                  checked={Boolean(settings.reduceMotion)}
                  onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                />
                <div className="studio-checkbox-card-info">
                  <strong>
                    <Zap size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Reducción de
                    movimiento
                  </strong>
                  <small>Desactiva transiciones rápidas y animaciones complejas en toda la plataforma.</small>
                </div>
              </label>

              <label className={`studio-checkbox-card ${settings.readableFont ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="studio-checkbox-control"
                  checked={Boolean(settings.readableFont)}
                  onChange={(e) => updateSetting('readableFont', e.target.checked)}
                />
                <div className="studio-checkbox-card-info">
                  <strong>Tipografía de alta legibilidad (Apoyo para dislexia)</strong>
                  <small>Aumenta el espaciado interlineal y caracteres diferenciados.</small>
                </div>
              </label>

              <label className={`studio-checkbox-card ${settings.focusVisible ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="studio-checkbox-control"
                  checked={Boolean(settings.focusVisible)}
                  onChange={(e) => updateSetting('focusVisible', e.target.checked)}
                />
                <div className="studio-checkbox-card-info">
                  <strong>Focus visible de alto contraste</strong>
                  <small>Resalta claramente con borde grueso el elemento que tiene el foco activo por teclado.</small>
                </div>
              </label>
            </div>

            {/* Asistente de lectura de voz (Web Speech API) */}
            <div
              style={{
                background: '#FAF9FE',
                border: '1.5px dashed #C4B5FD',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Volume2 size={18} color="#7C3AED" aria-hidden="true" />
                <strong style={{ fontSize: '0.9rem' }}>Prueba de síntesis de voz (Web Speech API)</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0 0 0.8rem' }}>{sampleText}</p>
              <ReadAloudButton textToRead={sampleText} label="Escuchar muestra de audio" />
            </div>

            {/* Enlaces de soporte y políticas */}
            <div
              style={{
                marginTop: '1.8rem',
                paddingTop: '1.2rem',
                borderTop: '1px dashed var(--line)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.8rem',
              }}
            >
              <Link to="/ayuda" className="studio-chip-btn">
                <HelpCircle size={14} aria-hidden="true" /> Centro de ayuda
              </Link>
              <Link to="/como-funciona" className="studio-chip-btn">
                <HelpCircle size={14} aria-hidden="true" /> Preguntas frecuentes
              </Link>
              <Link to="/terminos" className="studio-chip-btn">
                <FileText size={14} aria-hidden="true" /> Términos de uso
              </Link>
              <Link to="/privacidad" className="studio-chip-btn">
                <ShieldCheck size={14} aria-hidden="true" /> Política de privacidad
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
