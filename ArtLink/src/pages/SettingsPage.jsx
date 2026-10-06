import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Building,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  Globe,
  HelpCircle,
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
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sliders,
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
import useAlert from '../hooks/useAlert'
import Modal from '../components/Modal'
import ReadAloudButton from '../components/ReadAloudButton'
import ImagePickerField from '../components/settings/ImagePickerField'
import { ROLES } from '../utils/roles'
import { getUserById, updateUser as updateUserService } from '../services/userService'
import { getArtistByUserId, updateArtist as updateArtistService } from '../services/artistService'
import FloatingStars from '../components/FloatingStars'
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

export default function SettingsPage({ initialTab }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUser, logout } = useAuth()
  const { showAlert } = useAlert()
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

  // ── DETECCIÓN EXACTA DE ROL ──
  const isArtist = user?.role === ROLES.ARTIST || user?.role === 'artist' || user?.role === 'artista'
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === 'admin' || user?.role === 'administrador'
  const isClient = user?.role === ROLES.CLIENT || user?.role === 'client' || user?.role === 'cliente' || (!isArtist && !isAdmin)

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
  const [showBankModal, setShowBankModal] = useState(false)

  // ── ESTADO DE PERFIL DE USUARIO COMÚN Y ESPECÍFICO ──
  const [displayName, setDisplayName] = useState(user?.name || (isArtist ? 'Mia Solar' : 'Usuario ArtLink'))
  const [username, setUsername] = useState(
    user?.email ? `@${user.email.split('@')[0]}` : (isArtist ? '@miasolar_art' : '@usuario')
  )
  const [userAvatar, setUserAvatar] = useState(user?.avatar || user?.avatarUrl || '')
  const [accountEmail, setAccountEmail] = useState(user?.email || (isArtist ? 'mia.solar@artlink.demo' : 'usuario@artlink.demo'))
  const [userPhone, setUserPhone] = useState(user?.phone || '')
  const [locationStudio, setLocationStudio] = useState(user?.location || (isArtist ? 'Barcelona, España' : ''))
  const [languages, setLanguages] = useState('Español (Nativo), English (Fluent)')
  const [bioExtended, setBioExtended] = useState(
    user?.bio ||
      (isArtist
        ? '¡Hola! Llevo más de 6 años ilustrando universos mágicos para juegos indie, portadas de novelas ligeras y comisiones personalizadas. Amante de las paletas soñadoras, los colores lila y los detalles minuciosos. ¡Hablemos de tu idea!'
        : 'Coleccionista y aficionado al arte digital conceptual, cómics y encargos personalizados.')
  )

  // ── ESTADOS EXCLUSIVOS DE ARTISTA (TALLER) ──
  const [artistProfile, setArtistProfile] = useState(null)
  const [bannerUrl, setBannerUrl] = useState(user?.banner || user?.bannerUrl || '')
  const [tagline, setTagline] = useState(
    'Ilustradora Digital 2D & Concept Artist especializada en personajes fantásticos y estética anime.'
  )
  const [socialX, setSocialX] = useState('https://x.com/miasolar_art')
  const [socialInstagram, setSocialInstagram] = useState('https://instagram.com/miasolar.paint')
  const [socialArtstation, setSocialArtstation] = useState('https://artstation.com/miasolar')
  const [socialDiscord, setSocialDiscord] = useState('miasolar#8492')
  const [isStudioOpen, setIsStudioOpen] = useState(true)
  const [slotsCount, setSlotsCount] = useState(5)
  const [activeProjectsCount, setActiveProjectsCount] = useState(3)
  const [initialResponseTime, setInitialResponseTime] = useState('< 24 horas')
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('7 - 10 Días')
  const [reqVisualRefs, setReqVisualRefs] = useState(true)
  const [reqColorPaletteApproval, setReqColorPaletteApproval] = useState(true)
  const [reqCommercialUseDefault, setReqCommercialUseDefault] = useState(false)
  const [bankAccount, setBankAccount] = useState('Banco Santander •••• 4121 (Retiros automáticos quincenales)')
  const [currency, setCurrency] = useState('USD')
  const [minWithdrawal, setMinWithdrawal] = useState('100')
  const [allowVoluntaryTips, setAllowVoluntaryTips] = useState(true)
  const [isPausedForVacation, setIsPausedForVacation] = useState(false)

  // ── NOTIFICACIONES EN VIVO ──
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

  // ── SEGURIDAD Y ACCESO ──
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passFeedback, setPassFeedback] = useState('')

  // Texto muestra para accesibilidad
  const sampleText =
    'ArtLink es la plataforma donde puedes descubrir artistas digitales, encargar piezas personalizadas con tarifas claras y disponibilidad en vivo.'

  // Cargar datos reales según rol
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
        if (u.phone) setUserPhone(u.phone)
        if (u.avatar || u.avatarUrl) setUserAvatar(u.avatar || u.avatarUrl)
        if (u.banner || u.bannerUrl) setBannerUrl(u.banner || u.bannerUrl)

        if (isArtist) {
          const profiles = await getArtistByUserId(user.id).catch(() => null)
          const profile = Array.isArray(profiles) ? profiles[0] : profiles
          if (profile && mounted) {
            setArtistProfile(profile)
            if (profile.displayName) setDisplayName(profile.displayName)
            if (profile.username) setUsername(profile.username.startsWith('@') ? profile.username : `@${profile.username}`)
            if (profile.tagline) setTagline(profile.tagline)
            if (profile.bio) setBioExtended(profile.bio)
            if (profile.location) setLocationStudio(profile.location)
            if (profile.banner || profile.bannerUrl) setBannerUrl(profile.banner || profile.bannerUrl)
            if (typeof profile.slots === 'number') setSlotsCount(profile.slots)
            if (profile.availability) setIsStudioOpen(profile.availability === 'open')
            if (profile.socialLinks?.x) setSocialX(profile.socialLinks.x)
            if (profile.socialLinks?.instagram) setSocialInstagram(profile.socialLinks.instagram)
          }
        }
      } catch {
        // Fallback controlado
      }
    }
    loadUserData()
    return () => {
      mounted = false
    }
  }, [user?.id, isArtist])

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

  // Guardar todos los cambios
  async function handleGlobalSave() {
    try {
      saveSettings()

      if (user?.id) {
        // Solo se toca el registro del usuario autenticado: cada cuenta
        // puede editar exclusivamente su propio perfil.
        const userUpdatePayload = {
          name: displayName,
          email: accountEmail,
          bio: bioExtended,
          location: locationStudio,
          phone: userPhone,
          avatar: userAvatar,
          avatarUrl: userAvatar,
          banner: bannerUrl,
          bannerUrl,
        }

        await updateUserService(user.id, userUpdatePayload).catch(() => null)

        if (updateUser) {
          updateUser(userUpdatePayload)
        }

        if (isArtist && artistProfile?.id) {
          await updateArtistService(artistProfile.id, {
            displayName,
            username: username.replace(/^@/, ''),
            tagline,
            bio: bioExtended,
            location: locationStudio,
            banner: bannerUrl,
            bannerUrl,
            avatar: userAvatar,
            avatarUrl: userAvatar,
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
        text: 'Ajustes y preferencias guardados con éxito.',
      })
      showAlert({
        title: '¡Ajustes guardados!',
        message: 'Tus preferencias y perfil se han sincronizado con éxito.',
        type: 'success',
        confirmText: 'Entendido',
      })
      setTimeout(() => setLocalFeedback({ type: '', text: '' }), 5000)
    } catch {
      setLocalFeedback({
        type: 'error',
        text: 'Ocurrió un inconveniente al guardar. Se preservaron los cambios locales.',
      })
      showAlert({
        title: 'Error al guardar',
        message: 'Ocurrió un inconveniente al guardar. Se preservaron los cambios locales.',
        type: 'error',
        confirmText: 'Aceptar',
      })
    }
  }

  // Descartar cambios
  function handleDiscard() {
    resetSettings()
    setDisplayName(user?.name || (isArtist ? 'Mia Solar' : 'Usuario ArtLink'))
    setUsername(user?.email ? `@${user.email.split('@')[0]}` : (isArtist ? '@miasolar_art' : '@usuario'))
    setUserAvatar(user?.avatar || user?.avatarUrl || '')
    setBioExtended(
      user?.bio ||
        (isArtist
          ? '¡Hola! Llevo más de 6 años ilustrando universos mágicos para juegos indie, portadas de novelas ligeras y comisiones personalizadas. Amante de las paletas soñadoras, los colores lila y los detalles minuciosos. ¡Hablemos de tu idea!'
          : 'Coleccionista y aficionado al arte digital conceptual, cómics y encargos personalizados.')
    )
    setLocationStudio(user?.location || (isArtist ? 'Barcelona, España' : ''))
    setBannerUrl(artistProfile?.banner || artistProfile?.bannerUrl || user?.banner || user?.bannerUrl || '')
    setIsStudioOpen(true)
    setSlotsCount(5)
    setLocalFeedback({
      type: 'info',
      text: 'Se han restaurado los valores predeterminados.',
    })
    showAlert({
      title: 'Valores restablecidos',
      message: 'Se han restaurado las configuraciones y datos predeterminados.',
      type: 'info',
      confirmText: 'Entendido',
    })
    setTimeout(() => setLocalFeedback({ type: '', text: '' }), 4000)
  }

  // Cambio de contraseña
  function handleSavePassword(e) {
    e.preventDefault()
    if (!newPass || newPass.length < 4) {
      setPassFeedback('La nueva contraseña debe tener al menos 4 caracteres.')
      showAlert({
        title: 'Contraseña no válida',
        message: 'La nueva contraseña debe contener al menos 4 caracteres.',
        type: 'warning',
        confirmText: 'Corregir',
      })
      return
    }
    setPassFeedback('Contraseña actualizada con éxito.')
    showAlert({
      title: 'Contraseña actualizada',
      message: 'Tu contraseña de ArtLink se ha modificado correctamente.',
      type: 'success',
      confirmText: 'Aceptar',
    })
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
  function handleExportZip() {
    setLocalFeedback({
      type: 'success',
      text: isArtist
        ? 'Generando archivo .ZIP comprimido de tu taller (contratos, portafolio y comprobantes)...'
        : 'Generando archivo .ZIP comprimido con tus recibos de compra y licencias de encargos...',
    })
    showAlert({
      title: 'Exportando copia de seguridad',
      message: isArtist
        ? 'Generando archivo .ZIP comprimido con los contratos, portafolio y comprobantes de tu taller...'
        : 'Generando archivo .ZIP comprimido con tus recibos de compra y licencias de encargos...',
      type: 'info',
      confirmText: 'Aceptar',
    })
    setTimeout(() => {
      setLocalFeedback({
        type: 'success',
        text: 'Descarga de ArtLink_Backup.zip iniciada.',
      })
      showAlert({
        title: 'Descarga lista',
        message: 'Tu archivo comprimido ArtLink_Backup.zip ha comenzado a descargarse.',
        type: 'success',
        confirmText: 'Excelente',
      })
    }, 1500)
  }

  // Pausar taller (exclusivo artista)
  function handleTogglePauseStudio() {
    const nextPaused = !isPausedForVacation
    setIsPausedForVacation(nextPaused)
    setIsStudioOpen(!nextPaused)
    setLocalFeedback({
      type: 'info',
      text: nextPaused
        ? 'El taller ha sido pausado por vacaciones. Se preservan tus reseñas.'
        : 'Taller reactivado y visible para recibir nuevos encargos.',
    })
    showAlert({
      title: nextPaused ? 'Taller en pausa' : 'Taller reactivado',
      message: nextPaused
        ? 'El taller ha sido pausado por vacaciones. Tus reseñas y pedidos actuales se preservan con seguridad.'
        : '¡Tu taller está reactivado y abierto a nuevas solicitudes de comisión!',
      type: 'info',
      confirmText: 'Entendido',
    })
    setTimeout(() => setLocalFeedback({ type: '', text: '' }), 4000)
  }

  return (
    <div className="studio-settings-page" aria-labelledby="settings-main-heading">
      <FloatingStars variant="settings" />
      {/* ── ENCABEZADO SUPERIOR ADAPTATIVO ── */}
      <header className="studio-settings-topbar">
        <div className="studio-header-main">
          <div className="studio-status-pills">
            <span className="studio-sync-pill">
              <span className="studio-live-dot" aria-hidden="true" />
              {isArtist
                ? 'ENLACE ACTIVO & SINCRONIZADO'
                : isAdmin
                ? 'CONEXIÓN SEGURA & VERIFICADA'
                : 'CUENTA ACTIVA & SINCRONIZADA'}
            </span>
            <span className="studio-version-pill">
              {isArtist
                ? 'V2.4 PRO STUDIO'
                : isAdmin
                ? 'PANEL ADMINISTRATIVO'
                : 'PERFIL DE CLIENTE'}
            </span>
          </div>

          <h1 id="settings-main-heading" className="studio-page-title">
            {isArtist
              ? 'Ajustes de Cuenta y Taller'
              : isAdmin
              ? 'Ajustes de Administración y Plataforma'
              : 'Ajustes y Preferencias de Cliente'}
          </h1>

          <p className="studio-page-subtitle">
            {isArtist
              ? 'Personaliza tu identidad de creador, políticas de comisiones, pagos en Escrow Shield y preferencias de privacidad.'
              : isAdmin
              ? 'Configuración global de tu cuenta administrativa, preferencias del sistema, auditoría y entorno visual.'
              : 'Personaliza tu perfil, preferencias de compra y exploración, métodos de pago y seguridad en tus compras.'}
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
        <aside className="studio-sidebar" aria-label="Navegación de secciones de ajustes">
          <div className="studio-sidebar-card">
            <span className="studio-sidebar-tag">NAVEGACIÓN</span>
            <div className="studio-sidebar-header">
              <h2 className="studio-sidebar-title">
                {isArtist ? 'Índice del Taller' : isAdmin ? 'Menú de Sistema' : 'Menú de Ajustes'}
              </h2>
              <span className="studio-sidebar-count-badge">6 Secciones</span>
            </div>

            <nav className="studio-nav-list" role="tablist" aria-label="Secciones de ajustes">
              {/* Item 1: Perfil */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'perfil'}
                aria-label={
                  isArtist
                    ? 'Perfil & Vitrina (Mi perfil)'
                    : isAdmin
                    ? 'Perfil Administrativo (Mi perfil)'
                    : 'Perfil & Datos (Mi perfil)'
                }
                className={`studio-nav-item ${activeTab === 'perfil' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('perfil', 'section-perfil')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <User size={16} aria-hidden="true" />
                  </span>
                  <span>{isArtist ? 'Perfil & Vitrina' : isAdmin ? 'Perfil Administrativo' : 'Mi perfil'}</span>
                </div>
                <ChevronRight size={14} className="studio-nav-arrow" aria-hidden="true" />
              </button>

              {/* Item 2: Exclusivo de Artista vs Preferencias de Cliente vs Panel Admin */}
              {isArtist ? (
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
              ) : isClient ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'preferencias'}
                  aria-label="Preferencias de Compra"
                  className={`studio-nav-item ${activeTab === 'preferencias' ? 'is-active' : ''}`}
                  onClick={() => handleTabClick('preferencias', 'section-preferencias')}
                >
                  <div className="studio-nav-item-left">
                    <span className="studio-nav-item-icon">
                      <Sliders size={16} aria-hidden="true" />
                    </span>
                    <span>Preferencias de Compra</span>
                  </div>
                  <span className="studio-nav-pill-badge studio-pill-cyan">EXPLORAR</span>
                </button>
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'admin-panel'}
                  aria-label="Consola de Administración"
                  className={`studio-nav-item ${activeTab === 'admin-panel' ? 'is-active' : ''}`}
                  onClick={() => handleTabClick('admin-panel', 'section-admin-panel')}
                >
                  <div className="studio-nav-item-left">
                    <span className="studio-nav-item-icon">
                      <Shield size={16} aria-hidden="true" />
                    </span>
                    <span>Consola de Admin</span>
                  </div>
                  <span className="studio-nav-pill-badge studio-pill-cyan">SISTEMA</span>
                </button>
              )}

              {/* Item 3: Facturación / Pagos */}
              {!isAdmin && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'facturacion'}
                  aria-label={isArtist ? 'Facturación & Escrow' : 'Pagos & Protección Escrow'}
                  className={`studio-nav-item ${activeTab === 'facturacion' ? 'is-active' : ''}`}
                  onClick={() => handleTabClick('facturacion', 'section-facturacion')}
                >
                  <div className="studio-nav-item-left">
                    <span className="studio-nav-item-icon">
                      <CreditCard size={16} aria-hidden="true" />
                    </span>
                    <span>{isArtist ? 'Facturación & Escrow' : 'Pagos & Escrow'}</span>
                  </div>
                  {isArtist ? (
                    <span className="studio-pill-dot" aria-label="Alerta de facturación" />
                  ) : (
                    <span className="studio-nav-pill-badge studio-pill-mint">SEGURO</span>
                  )}
                </button>
              )}

              {/* Item 4: Notificaciones */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'notificaciones'}
                aria-label={isArtist ? 'Notificaciones & Avisos' : isAdmin ? 'Alertas del Sistema' : 'Notificaciones de Pedidos'}
                className={`studio-nav-item ${activeTab === 'notificaciones' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('notificaciones', 'section-notificaciones')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <Bell size={16} aria-hidden="true" />
                  </span>
                  <span>{isAdmin ? 'Alertas de Sistema' : 'Notificaciones'}</span>
                </div>
                <span className="studio-nav-pill-badge studio-pill-mint">+</span>
              </button>

              {/* Item 5: Seguridad & Acceso */}
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
                  <span>{isClient ? 'Seguridad & Privacidad' : 'Seguridad & Acceso'}</span>
                </div>
              </button>

              {/* Item 6: Apariencia & Accesibilidad */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'apariencia'}
                aria-label={
                  isArtist
                    ? 'Integraciones de Arte (Apariencia y accesibilidad)'
                    : 'Apariencia y visualización'
                }
                className={`studio-nav-item ${activeTab === 'apariencia' ? 'is-active' : ''}`}
                onClick={() => handleTabClick('apariencia', 'section-apariencia')}
              >
                <div className="studio-nav-item-left">
                  <span className="studio-nav-item-icon">
                    <Palette size={16} aria-hidden="true" />
                  </span>
                  <span>{isArtist ? 'Integraciones de Arte' : 'Apariencia & Visual'}</span>
                </div>
                <span className="studio-nav-pill-badge studio-pill-pink">
                  {isArtist ? 'APPS' : 'VISUAL'}
                </span>
              </button>
            </nav>

            {/* Herramientas rápidas en la base del sidebar */}
            <div className="studio-sidebar-quick-bar">
              <button
                type="button"
                className="studio-quick-tool-btn"
                title="Editar Perfil"
                onClick={() => handleTabClick('perfil', 'section-perfil')}
              >
                <UserCheck size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="studio-quick-tool-btn"
                title={isArtist ? 'Ajustar Cupos de Taller' : 'Preferencias de Compra'}
                onClick={() =>
                  handleTabClick(
                    isArtist ? 'comisiones' : isClient ? 'preferencias' : 'admin-panel',
                    isArtist ? 'section-comisiones' : isClient ? 'section-preferencias' : 'section-admin-panel'
                  )
                }
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
                title="Tema y Accesibilidad"
                onClick={() => handleTabClick('apariencia', 'section-apariencia')}
              >
                <Sun size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card de sugerencia / tip adaptado al rol */}
          {showTip && (
            <div className="studio-tip-card">
              <span className="studio-tip-top-badge">
                {isArtist ? 'SUGERENCIA PRO' : isAdmin ? 'PROTOCOLO ADMIN' : 'CONSEJO DE COMPRA'}
              </span>
              <div className="studio-tip-header-row">
                <div className="studio-tip-avatar-box">
                  {isArtist ? (
                    <Palette size={22} color="var(--ink)" aria-hidden="true" />
                  ) : isAdmin ? (
                    <Shield size={22} color="var(--ink)" aria-hidden="true" />
                  ) : (
                    <ShoppingBag size={22} color="var(--ink)" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 className="studio-tip-title">
                    {isArtist ? 'Tip de Arte' : isAdmin ? 'Supervisión Escrow' : 'Tip de Encargo'}
                    <span className="studio-pro-badge">{isArtist ? 'PRO' : isAdmin ? 'ADMIN' : 'GUÍA'}</span>
                  </h3>
                </div>
              </div>
              <p className="studio-tip-body">
                {isArtist ? (
                  <>
                    Mantén actualizados tus términos de entrega y cupos disponibles. Los perfiles con{' '}
                    <strong>100% de transparencia</strong> reciben 2.4x más solicitudes en la galería de exploración.
                  </>
                ) : isAdmin ? (
                  <>
                    Las retenciones y disputas entre clientes y artistas deben atenderse con prioridad en la consola de
                    administración para asegurar la confianza comunitaria.
                  </>
                ) : (
                  <>
                    Adjuntar referencias visuales claras y moodboards ayuda a que los artistas coticen y entreguen tu
                    pieza un <strong>30% más rápido</strong> y con máxima fidelidad a tu visión.
                  </>
                )}
              </p>
              <div className="studio-tip-links">
                <button
                  type="button"
                  className="studio-tip-discard-link"
                  onClick={() => setShowTip(false)}
                >
                  Descartar este tip
                </button>
                <Link
                  to={isArtist ? '/como-funciona' : isAdmin ? '/admin' : '/explorar'}
                  className="studio-tip-action-link"
                >
                  {isArtist ? 'Consultar el kit de éxito >' : isAdmin ? 'Ir al panel administrativo >' : 'Explorar creadores >'}
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* ── COLUMNA PRINCIPAL DE CONTENIDO ── */}
        <main className="studio-sections-column">
          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 1: PERFIL (ADAPTADO A ARTISTA / CLIENTE / ADMIN)
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-perfil" className="studio-card" aria-labelledby="heading-perfil">
            <span className="studio-card-tag">
              {isArtist ? '● PERFIL PÚBLICO' : isAdmin ? '● CUENTA ADMINISTRATIVA' : '● PERFIL DE CLIENTE'}
            </span>

            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-perfil" className="studio-card-title">
                  {isArtist
                    ? 'Identidad y Vitrina Pública'
                    : isAdmin
                    ? 'Perfil Administrativo'
                    : 'Perfil y Datos de Cuenta'}
                  <span className="sr-only"> — Modificar perfil</span>
                </h2>
              </div>
              <span
                className={`studio-card-badge-right ${
                  isArtist ? 'studio-badge-coral' : isAdmin ? 'studio-badge-purple' : 'studio-badge-blue'
                }`}
              >
                {isArtist ? 'Visible en Directorio' : isAdmin ? 'Administrador Central' : 'Cliente ArtLink'}
              </span>
            </div>

            <p className="studio-card-subtitle">
              {isArtist
                ? 'Configura la expresión de tus recursos, enlaces sociales y el avatar que verán tus visitantes cuando exploren tu catálogo.'
                : isAdmin
                ? 'Datos identificativos del operador administrativo y credenciales oficiales para la gestión del sistema.'
                : 'Gestiona tu información de contacto, avatar y notas de presentación visibles para los artistas al contratar encargos.'}
            </p>

            {/* PORTADA Y RETRATO: archivo real del dispositivo para todos los roles */}
            <div className="studio-banner-section-label">
              {isArtist ? 'PORTADA DEL ESTUDIO & RETRATO DE ARTISTA' : 'PORTADA Y FOTO DE PERFIL'}
            </div>

            <ImagePickerField
              id="profile-banner-picker"
              label="Portada"
              shape="banner"
              value={bannerUrl}
              onChange={setBannerUrl}
              hint="Elige un archivo de imagen desde tu computadora, telefono o galeria. Relación recomendada 4:1."
            />

            <ImagePickerField
              id="profile-avatar-picker"
              label="Foto de perfil"
              shape="avatar"
              value={userAvatar}
              onChange={setUserAvatar}
              previewAlt={displayName}
              initials={displayName.slice(0, 2).toUpperCase()}
            />

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

            {/* Campo exclusivo de artista: Titular profesional */}
            {isArtist && (
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
            )}

            {/* Biografía adaptada */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="studio-field-label">
                <div className="studio-label-with-counter">
                  <span>
                    {isArtist
                      ? 'Biografía Extendida del Taller'
                      : isAdmin
                      ? 'Notas Administrativas y Cargo'
                      : 'Biografía / Notas de Coleccionista'}
                  </span>
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
                <span>{isArtist ? 'Ubicación del Estudio' : 'Ubicación / Ciudad'}</span>
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

            {/* Redes sociales (Exclusivo artista) */}
            {isArtist && (
              <div style={{ marginTop: '1rem' }}>
                <span className="studio-reqs-section-title">Redes Sociales &amp; Portafolios Enlazados</span>
                <div className="studio-socials-grid">
                  <div className="studio-input-wrap">
                    <span className="studio-input-icon-prefix" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                      X
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
                    <Camera size={16} className="studio-input-icon-prefix" aria-hidden="true" />
                    <input
                      type="text"
                      className="studio-input has-prefix has-suffix"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                    />
                    <ArrowUpRight size={14} className="studio-input-icon-suffix" aria-hidden="true" />
                  </div>

                  <div className="studio-input-wrap">
                    <Palette size={16} className="studio-input-icon-prefix" aria-hidden="true" />
                    <input
                      type="text"
                      className="studio-input has-prefix has-suffix"
                      value={socialArtstation}
                      onChange={(e) => setSocialArtstation(e.target.value)}
                    />
                    <ArrowUpRight size={14} className="studio-input-icon-suffix" aria-hidden="true" />
                  </div>

                  <div className="studio-input-wrap">
                    <MessageSquare size={16} className="studio-input-icon-prefix" aria-hidden="true" />
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
            )}

            {/* Teléfono opcional de contacto para clientes */}
            {!isArtist && (
              <div style={{ marginTop: '0.5rem' }}>
                <label className="studio-field-label">
                  <span>Teléfono de Contacto (Opcional)</span>
                  <input
                    type="tel"
                    className="studio-input"
                    placeholder="+52 55 1234 5678"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </label>
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 2A: EXCLUSIVO ARTISTA — DISPONIBILIDAD & NORMAS DE ENCARGO
             ══════════════════════════════════════════════════════════════ */}
          {isArtist && (
            <section id="section-comisiones" className="studio-card" aria-labelledby="heading-comisiones">
              <span className="studio-card-tag studio-tag-coral">
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

              <div className="studio-metrics-three-grid">
                <div className="studio-metric-box">
                  <div className="studio-metric-box-title">
                    <span>Cupos Simultáneos</span>
                    <span className="studio-slots-highlight">{slotsCount} Cupos</span>
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
          )}

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 2B: EXCLUSIVO CLIENTE — PREFERENCIAS DE COMPRA Y BÚSQUEDA
             ══════════════════════════════════════════════════════════════ */}
          {isClient && (
            <section id="section-preferencias" className="studio-card" aria-labelledby="heading-preferencias">
              <span className="studio-card-tag studio-tag-mint">
                ● EXPLORACIÓN &amp; RECOMENDACIONES
              </span>
              <div className="studio-card-header-row">
                <div>
                  <h2 id="heading-preferencias" className="studio-card-title">
                    Preferencias de Búsqueda y Encargos
                  </h2>
                </div>
                <span className="studio-card-badge-right studio-badge-cyan">Personalizado</span>
              </div>
              <p className="studio-card-subtitle">
                Personaliza cómo se descubren y ordenan los artistas para encontrar el estilo ideal de tus piezas con
                filtros adaptados.
              </p>

              {/* Disciplinas favoritas del cliente */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="studio-reqs-section-title">Disciplinas Artísticas Favoritas</span>
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

              <div className="studio-form-grid-two">
                <label className="studio-field-label">
                  <span>Rango de Precios Habitual</span>
                  <select
                    className="studio-input"
                    value={settings.preferences?.priceRange || 'all'}
                    onChange={(e) => updatePreferences('priceRange', e.target.value)}
                  >
                    <option value="all">Cualquier presupuesto</option>
                    <option value="0-50">Económico (Hasta $50 USD)</option>
                    <option value="50-150">Intermedio ($50 a $150 USD)</option>
                    <option value="150+">Premium (Más de $150 USD)</option>
                  </select>
                </label>

                <label className="studio-field-label">
                  <span>Tiempo de Entrega Preferido</span>
                  <select
                    className="studio-input"
                    value={settings.preferences?.deliveryTime || 'any'}
                    onChange={(e) => updatePreferences('deliveryTime', e.target.value)}
                  >
                    <option value="any">Cualquier plazo</option>
                    <option value="3-days">Entrega express (Hasta 3 días)</option>
                    <option value="7-days">Estándar (Hasta 7 días)</option>
                    <option value="14-days">Flexible (14 días o más)</option>
                  </select>
                </label>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label className="studio-field-label">
                  <span>Criterio de Orden Predeterminado en el Catálogo</span>
                  <select
                    className="studio-input"
                    value={settings.preferences?.sortBy || 'rating'}
                    onChange={(e) => updatePreferences('sortBy', e.target.value)}
                  >
                    <option value="rating">Mayor calificación y reputación</option>
                    <option value="activity">Mayor actividad reciente</option>
                    <option value="relevance">Relevancia recomendada para mí</option>
                  </select>
                </label>
              </div>

              <label
                className={`studio-checkbox-card ${
                  settings.preferences?.openCommissionsFirst ? 'is-checked' : ''
                }`}
              >
                <input
                  type="checkbox"
                  className="studio-checkbox-control"
                  checked={Boolean(settings.preferences?.openCommissionsFirst)}
                  onChange={(e) => updatePreferences('openCommissionsFirst', e.target.checked)}
                />
                <div className="studio-checkbox-card-info">
                  <strong>Mostrar primero creadores con comisiones abiertas</strong>
                  <small>Prioriza artistas disponibles de inmediato cuando navegues por la galería de exploración.</small>
                </div>
              </label>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 2C: EXCLUSIVO ADMIN — CONSOLA RÁPIDA DE ADMINISTRACIÓN
             ══════════════════════════════════════════════════════════════ */}
          {isAdmin && (
            <section id="section-admin-panel" className="studio-card" aria-labelledby="heading-admin-panel">
              <span className="studio-card-tag studio-tag-purple">
                ● CONSOLA DE ADMINISTRACIÓN
              </span>
              <div className="studio-card-header-row">
                <div>
                  <h2 id="heading-admin-panel" className="studio-card-title">
                    Consola de Control del Sistema
                  </h2>
                </div>
                <span className="studio-card-badge-right studio-badge-purple">Privilegios Totales</span>
              </div>
              <p className="studio-card-subtitle">
                Supervisa el estado de las órdenes, disputas de custodia Escrow y auditoría de creadores en ArtLink.
              </p>

              <div className="studio-sub-card studio-admin-panel-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ShieldCheck size={28} color="var(--violet-dark)" aria-hidden="true" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Panel Central de Administración</strong>
                    <small style={{ color: 'var(--muted)' }}>
                      Accede a la gestión de usuarios, auditoría de transacciones y configuración del modelo de IA.
                    </small>
                  </div>
                </div>
                <Link
                  to="/admin"
                  className="studio-btn-save"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span>Abrir Panel /admin</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 3: FACTURACIÓN / PAGOS & ESCROW (ARTISTA VS CLIENTE)
             ══════════════════════════════════════════════════════════════ */}
          {!isAdmin && (
            <section id="section-facturacion" className="studio-card" aria-labelledby="heading-facturacion">
              <span className="studio-card-tag studio-tag-purple">
                {isArtist ? '● CUSTODIA & RETIROS' : '● PROTECCIÓN EN COMPRAS'}
              </span>

              <div className="studio-card-header-row">
                <div>
                  <h2 id="heading-facturacion" className="studio-card-title">
                    {isArtist
                      ? 'Pagos, Retiros y ArtLink Escrow Shield'
                      : 'Métodos de Pago y Protección Escrow'}
                  </h2>
                </div>
                <span className="studio-card-badge-right studio-badge-mint">Fondos Blindados</span>
              </div>

              <p className="studio-card-subtitle">
                {isArtist
                  ? 'El sistema retiene los fondos del cliente antes de iniciar la obra y los libera al confirmar hitos de entrega.'
                  : 'Tus pagos quedan en custodia segura y se transfieren al artista únicamente cuando apruebas los avances pactados.'}
              </p>

              {/* Si es artista: cuenta bancaria de cobro */}
              {isArtist && (
                <>
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

                  <Modal
                    open={showBankModal}
                    title="Modificar Cuenta de Cobro"
                    onClose={() => setShowBankModal(false)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
                      <label className="studio-field-label" style={{ marginBottom: 0 }}>
                        <span>Datos de la cuenta bancaria (IBAN, PayPal o CLABE)</span>
                        <input
                          type="text"
                          className="studio-input"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                        />
                      </label>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button
                          type="button"
                          className="studio-btn-discard"
                          onClick={() => setShowBankModal(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="studio-btn-save"
                          onClick={() => {
                            setShowBankModal(false)
                            showAlert({
                              title: 'Cuenta actualizada',
                              message: 'Se han guardado los datos de tu cuenta bancaria para transferencias.',
                              type: 'success',
                              confirmText: 'Entendido',
                            })
                          }}
                        >
                          Guardar Cuenta
                        </button>
                      </div>
                    </div>
                  </Modal>
                </>
              )}

              {/* Moneda y umbral */}
              <div className="studio-form-grid-two">
                <label className="studio-field-label">
                  <span>Moneda Predeterminada</span>
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

                {isArtist ? (
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
                ) : (
                  <label className="studio-field-label">
                    <span>Método de Pago Preferido en Pedidos</span>
                    <select className="studio-input">
                      <option value="card">Tarjeta de Débito / Crédito (Escrow Seguro)</option>
                      <option value="paypal">PayPal Checkout</option>
                      <option value="transfer">Transferencia Bancaria Protegida</option>
                    </select>
                  </label>
                )}
              </div>

              {/* Recuadro Escrow Shield adaptado */}
              <div className="studio-escrow-box">
                <div className="studio-escrow-header">
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>
                    {isArtist
                      ? 'Política de Hitos con Depósito Garantizado'
                      : 'Garantía Total para Compradores ArtLink'}
                  </span>
                </div>
                <p className="studio-escrow-text">
                  {isArtist
                    ? 'ArtLink Escrow Shield retiene los fondos del cliente y abona el 100% de la comisión antes de que debas entregar la obra definitiva. Los custodios protegen al cliente en caso de cancelación no justificada.'
                    : 'Tu dinero no corre riesgo: Si el artista no cumple con los plazos o requisitos fijados en la solicitud, el sistema de custodia te reembolsa el 100% de los fondos garantizados.'}
                </p>
                {isArtist && (
                  <label className="studio-notif-check-label" style={{ fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={allowVoluntaryTips}
                      onChange={(e) => setAllowVoluntaryTips(e.target.checked)}
                    />
                    <span>Permitir propuestas adicionales voluntarias tras entrega final en la resolución</span>
                  </label>
                )}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 4: CANALES DE NOTIFICACIÓN EN VIVO
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-notificaciones" className="studio-card" aria-labelledby="heading-notificaciones">
            <div className="studio-card-header-row">
              <div>
                <h2 id="heading-notificaciones" className="studio-card-title">
                  {isAdmin ? 'Canales de Alertas del Sistema' : 'Canales de Notificación en Vivo'}
                </h2>
              </div>
            </div>
            <p className="studio-card-subtitle">
              {isAdmin
                ? 'Elige qué avisos del sistema, reportes de usuarios y auditorías deseas recibir.'
                : 'Selecciona qué alertas deseas recibir en el navegador y en tu correo electrónico vinculado.'}
            </p>

            <div className="studio-notif-table">
              <div className="studio-notif-row">
                <div className="studio-notif-info">
                  <strong>
                    {isArtist
                      ? 'Nuevas solicitudes de comisión entrantes'
                      : isAdmin
                      ? 'Nuevos reportes de moderación pendientes'
                      : 'Respuestas de artistas y cotizaciones recibidas'}
                  </strong>
                  <small>
                    {isArtist
                      ? 'Aviso inmediato cuando un cliente envíe un brief y proponga el encargo.'
                      : isAdmin
                      ? 'Notificación cuando se registre un reporte de contenido en la plataforma.'
                      : 'Aviso inmediato cuando un artista cotice o acepte tu encargo.'}
                  </small>
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
                  <strong>
                    {isAdmin
                      ? 'Alertas de disputas de Escrow en proceso'
                      : 'Mensajes de chat de pedidos activos'}
                  </strong>
                  <small>
                    {isAdmin
                      ? 'Aviso de intervención cuando se abra una disputa financiera.'
                      : 'Conversaciones directas y consultas sobre bocetos en curso.'}
                  </small>
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
                  <strong>
                    {isArtist
                      ? 'Depósitos en Escrow confirmados & Pagos liberados'
                      : isAdmin
                      ? 'Notificaciones de errores de servidor e integraciones'
                      : 'Actualizaciones de hitos y avances de bocetos'}
                  </strong>
                  <small>
                    {isArtist
                      ? 'Avisos de cobros de fondos transferidos a tus comisiones.'
                      : isAdmin
                      ? 'Alertas de latencia y fallos en llamadas a servicios externos.'
                      : 'Alertas cuando el artista suba un nuevo hito para tu revisión.'}
                  </small>
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
                  <strong>
                    {isArtist
                      ? 'Consejos y alertas de visibilidad de ArtLink'
                      : 'Novedades y artistas recomendados'}
                  </strong>
                  <small>Recomendaciones periódicas adaptadas a tus intereses artísticos.</small>
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
            <span className="studio-card-tag studio-tag-purple">
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
                  <span
                    className={`studio-nav-pill-badge ${
                      isArtist ? 'studio-pill-cyan' : isAdmin ? 'studio-pill-pink' : 'studio-pill-mint'
                    }`}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    {isArtist ? 'Artista Creador' : isAdmin ? 'Administrador' : 'Cliente Coleccionista'}
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
                  <strong>Perfil Público</strong>
                  <small>
                    {isArtist
                      ? 'Permite que cualquier visitante descubra tu vitrina en la exploración de ArtLink.'
                      : 'Permite que otros miembros de la comunidad vean tu perfil y listas de favoritos.'}
                  </small>
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
                  <strong>Mostrar actividad reciente</strong>
                  <small>
                    {isArtist
                      ? 'Exhibe los encargos concluidos satisfactoriamente como prueba de reputación.'
                      : 'Muestra tus reseñas públicas y encargos calificados.'}
                  </small>
                </div>
              </label>
            </div>

            {/* Formulario de cambio de contraseña */}
            <form onSubmit={handleSavePassword} className="studio-password-card">
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
                className="studio-btn-save"
              >
                <Key size={14} aria-hidden="true" /> Actualizar Contraseña
              </button>
            </form>
          </section>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 6: ZONA DE GESTIÓN AVANZADA (ADAPTADA)
             ══════════════════════════════════════════════════════════════ */}
          <div className="studio-advanced-zone-card">
            <div className="studio-advanced-header">
              <AlertTriangle size={20} aria-hidden="true" />
              <span>Zona de Gestión Avanzada</span>
            </div>
            <p className="studio-advanced-subtitle">
              {isArtist
                ? 'Acciones que alteran la disponibilidad pública del taller, copia de seguridad del portafolio o desconexión temporal.'
                : 'Descarga tu historial de compras, contratos de licencias y recibos de pagos en la plataforma.'}
            </p>

            <div className="studio-advanced-actions-list">
              <div className="studio-advanced-row">
                <div className="studio-advanced-info">
                  <strong>
                    {isArtist ? 'Descargar Archivo Completo del Taller' : 'Descargar Historial de Compras'}
                  </strong>
                  <small>
                    {isArtist
                      ? 'Descarga un archivo .ZIP de tus contratos, portafolio y recibos de impuestos.'
                      : 'Descarga un archivo .ZIP con tus comprobantes de pago y licencias de uso comercial.'}
                  </small>
                </div>
                <button type="button" className="studio-btn-export-zip" onClick={handleExportZip}>
                  <Download size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                  Exportar Datos (.ZIP)
                </button>
              </div>

              {isArtist && (
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
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
             SECCIÓN 7: APARIENCIA, VISUALIZACIÓN & ACCESIBILIDAD
             ══════════════════════════════════════════════════════════════ */}
          <section id="section-apariencia" className="studio-card" aria-labelledby="heading-apariencia">
            <span className="studio-card-tag studio-tag-indigo">
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
                  className={`studio-theme-option-btn ${settings.theme === 'light' ? 'is-selected' : ''}`}
                  onClick={() => updateSetting('theme', 'light')}
                >
                  <Sun size={20} className="studio-theme-icon" aria-hidden="true" />
                  <div>
                    <strong>Tema Claro</strong>
                    <span className="studio-metric-subtext">Fondo pastel con texto obscuro</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`studio-theme-option-btn ${settings.theme === 'dark' ? 'is-selected' : ''}`}
                  onClick={() => updateSetting('theme', 'dark')}
                >
                  <Moon size={20} className="studio-theme-icon" aria-hidden="true" />
                  <div>
                    <strong>Tema Oscuro</strong>
                    <span className="studio-metric-subtext">Fondo nocturno con acentos vibrantes</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`studio-theme-option-btn ${settings.theme === 'system' ? 'is-selected' : ''}`}
                  onClick={() => updateSetting('theme', 'system')}
                >
                  <Sparkles size={20} className="studio-theme-icon" aria-hidden="true" />
                  <div>
                    <strong>Sincronizar SO</strong>
                    <span className="studio-metric-subtext">Preferencia del sistema operativo</span>
                  </div>
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
                  value={settings.colorMode || 'normal'}
                  onChange={(e) => updateSetting('colorMode', e.target.value)}
                >
                  <option value="normal">Sin filtro (Normal)</option>
                  <option value="protanopia">Protanopia (Deficiencia de rojo)</option>
                  <option value="deuteranopia">Deuteranopia (Deficiencia de verde)</option>
                  <option value="tritanopia">Tritanopia (Deficiencia de azul)</option>
                  <option value="achromatopsia">Acromatopsia (Monocromía / Escala de grises)</option>
                </select>
              </label>

              {/* Botones rápidos de selección */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.45rem',
                  flexWrap: 'wrap',
                  marginTop: '0.6rem',
                  marginBottom: '0.75rem',
                }}
              >
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'protanopia', label: 'Protanopia' },
                  { id: 'deuteranopia', label: 'Deuteranopia' },
                  { id: 'tritanopia', label: 'Tritanopia' },
                  { id: 'achromatopsia', label: 'Acromatopsia' },
                ].map((mode) => {
                  const isActive = (settings.colorMode || 'normal') === mode.id
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateSetting('colorMode', mode.id)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        border: '2px solid #1E192B',
                        background: isActive ? '#8B5CF6' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#1E192B',
                        boxShadow: isActive ? '2px 2px 0px #1E192B' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {mode.label}
                    </button>
                  )
                })}
              </div>

              {/* Barra de comprobación cromática en vivo */}
              <div
                style={{
                  background: 'var(--paper, #FFFFFF)',
                  border: '2px solid #1E192B',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  boxShadow: '3px 3px 0px #1E192B',
                  marginTop: '0.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted, #6B7280)' }}>
                    Comprobación visual de colores en vivo
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B5CF6' }}>
                    {settings.colorMode === 'protanopia'
                      ? 'Simulando Protanopia (Rojo atenuado)'
                      : settings.colorMode === 'deuteranopia'
                      ? 'Simulando Deuteranopia (Verde atenuado)'
                      : settings.colorMode === 'tritanopia'
                      ? 'Simulando Tritanopia (Azul atenuado)'
                      : settings.colorMode === 'achromatopsia'
                      ? 'Simulando Acromatopsia (Monocromía)'
                      : 'Visión de color estándar'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '0.4rem',
                    textAlign: 'center',
                  }}
                >
                  {[
                    { label: 'Rojo', bg: '#EF4444' },
                    { label: 'Verde', bg: '#10B981' },
                    { label: 'Azul', bg: '#3B82F6' },
                    { label: 'Amarillo', bg: '#F59E0B' },
                    { label: 'Violeta', bg: '#8B5CF6' },
                    { label: 'Rosa', bg: '#EC4899' },
                  ].map((color) => (
                    <div
                      key={color.label}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: color.bg,
                          border: '1.5px solid #1E192B',
                          boxShadow: '1px 1px 0px #1E192B',
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>{color.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Muestra de lectura */}
            <div className="studio-preview-box">
              <span className="studio-preview-tag">
                Vista previa de lectura adaptada
              </span>
              <p className="studio-preview-content">{sampleText}</p>
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
            <div className="studio-tts-box">
              <div className="studio-tts-header">
                <Volume2 size={18} className="studio-tts-icon" aria-hidden="true" />
                <strong className="studio-tts-title">Prueba de síntesis de voz (Web Speech API)</strong>
              </div>
              <p className="studio-tts-text">{sampleText}</p>
              <ReadAloudButton textToRead={sampleText} label="Escuchar muestra de audio" />
            </div>

            {/* Enlaces de soporte y políticas */}
            <div className="studio-settings-links-row">
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
