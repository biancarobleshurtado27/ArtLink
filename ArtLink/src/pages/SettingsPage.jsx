import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  Eye,
  LogOut,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Type,
  User,
  Volume2,
  Zap,
  Lock,
  SlidersHorizontal,
  Heart,
  MessageSquare,
  UserCheck,
  FileText,
  HelpCircle,
  Info,
  Check,
  Key,
} from 'lucide-react'
import useSettings from '../hooks/useSettings'
import useAuth from '../hooks/useAuth'
import ReadAloudButton from '../components/ReadAloudButton'

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

export default function SettingsPage() {
  const navigate = useNavigate()
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

  const [activeTab, setActiveTab] = useState('apariencia')

  // Estados locales para edición de cuenta
  const [accountName, setAccountName] = useState(user?.name || '')
  const [accountEmail, setAccountEmail] = useState(user?.email || '')
  const [accountMsg, setAccountMsg] = useState('')

  // Estados locales para cambio de contraseña
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passMsg, setPassMsg] = useState('')

  const sampleText =
    'ArtLink es la plataforma donde puedes descubrir artistas digitales, encargar piezas personalizadas con tarifas claras y disponibilidad en vivo.'

  function handleSaveAccount(e) {
    e.preventDefault()
    if (!accountName.trim() || !accountEmail.trim()) return
    if (updateUser) {
      updateUser({ name: accountName.trim(), email: accountEmail.trim() })
    }
    setAccountMsg('Datos de cuenta actualizados correctamente.')
    setTimeout(() => setAccountMsg(''), 4000)
  }

  function handleSavePassword(e) {
    e.preventDefault()
    if (!newPass || newPass.length < 4) {
      setPassMsg('La nueva contraseña debe tener al menos 4 caracteres.')
      return
    }
    setPassMsg('Contraseña actualizada con éxito.')
    setCurrentPass('')
    setNewPass('')
    setTimeout(() => setPassMsg(''), 4000)
  }

  function handleToggleDiscipline(disc) {
    const current = settings.preferences?.favoriteDisciplines || []
    const next = current.includes(disc)
      ? current.filter((d) => d !== disc)
      : [...current, disc]
    updatePreferences('favoriteDisciplines', next)
  }

  return (
    <div className="settings-page" aria-labelledby="settings-title">
      <header className="settings-header">
        <span className="sticker hero-sticker">
          <Sparkles size={13} aria-hidden="true" /> Preferencias y accesibilidad
        </span>
        <p className="eyebrow">ArtLink / Configuración</p>
        <h1 id="settings-title">Ajustes y accesibilidad</h1>
        <p className="settings-intro">
          Personaliza la apariencia visual, la navegación adaptada, el contraste, tus preferencias y opciones de cuenta para una experiencia cómoda e inclusiva.
        </p>
      </header>

      {/* Banner de estado para accesibilidad aria-live */}
      <div aria-live="polite" aria-atomic="true" className="settings-status-wrapper">
        {statusMessage && (
          <div className="settings-status-banner" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Navegación por pestañas */}
      <nav className="settings-tabs" aria-label="Secciones de ajustes">
        <button
          type="button"
          className={`tab-button ${activeTab === 'apariencia' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('apariencia')}
          aria-selected={activeTab === 'apariencia'}
          role="tab"
        >
          <Sun size={17} aria-hidden="true" />
          <span>Apariencia</span>
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'accesibilidad' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('accesibilidad')}
          aria-selected={activeTab === 'accesibilidad'}
          role="tab"
        >
          <Eye size={17} aria-hidden="true" />
          <span>Accesibilidad</span>
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'privacidad' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('privacidad')}
          aria-selected={activeTab === 'privacidad'}
          role="tab"
        >
          <Lock size={17} aria-hidden="true" />
          <span>Privacidad</span>
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'notificaciones' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('notificaciones')}
          aria-selected={activeTab === 'notificaciones'}
          role="tab"
        >
          <Bell size={17} aria-hidden="true" />
          <span>Notificaciones</span>
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'preferencias' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('preferencias')}
          aria-selected={activeTab === 'preferencias'}
          role="tab"
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span>Preferencias</span>
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'cuenta' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cuenta')}
          aria-selected={activeTab === 'cuenta'}
          role="tab"
        >
          <User size={17} aria-hidden="true" />
          <span>Cuenta y soporte</span>
        </button>
      </nav>

      {/* ── TAB 1: APARIENCIA ── */}
      {activeTab === 'apariencia' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-apariencia">
          <h2 id="heading-apariencia" className="section-title">
            <Sun size={20} aria-hidden="true" /> Apariencia y visualización
          </h2>
          <p className="section-description">
            Ajusta el tema general de color, densidad, tamaño tipográfico y contraste para adaptarlo a tu entorno.
          </p>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Tema de la interfaz</legend>
            <div className="radio-group-grid">
              <label className={`radio-card ${settings.theme === 'light' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={settings.theme === 'light'}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                />
                <div>
                  <strong>Tema Claro</strong>
                  <small>Fondo pastel con texto obscuro de alto contraste</small>
                </div>
              </label>

              <label className={`radio-card ${settings.theme === 'dark' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={settings.theme === 'dark'}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                />
                <div>
                  <strong>Tema Oscuro</strong>
                  <small>Fondo nocturno con acentos de color vibrantes</small>
                </div>
              </label>

              <label className={`radio-card ${settings.theme === 'system' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={settings.theme === 'system'}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                />
                <div>
                  <strong>Sincronizar con el Sistema</strong>
                  <small>Usa la preferencia de tu sistema operativo</small>
                </div>
              </label>
            </div>
          </fieldset>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Densidad visual de la interfaz</legend>
            <div className="radio-group-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label className={`radio-card ${settings.density === 'comfortable' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="density"
                  value="comfortable"
                  checked={settings.density === 'comfortable'}
                  onChange={(e) => updateSetting('density', e.target.value)}
                />
                <div>
                  <strong>Densidad Cómoda</strong>
                  <small>Mayor espacio entre tarjetas, botones y elementos</small>
                </div>
              </label>

              <label className={`radio-card ${settings.density === 'compact' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="density"
                  value="compact"
                  checked={settings.density === 'compact'}
                  onChange={(e) => updateSetting('density', e.target.value)}
                />
                <div>
                  <strong>Densidad Compacta</strong>
                  <small>Elementos condensados para visualizar más contenido</small>
                </div>
              </label>
            </div>
          </fieldset>

          <div className="settings-grid-two">
            <label htmlFor="font-size-select" className="settings-label">
              <span><Type size={17} aria-hidden="true" /> Tamaño de texto</span>
              <select
                id="font-size-select"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
                className="settings-select"
              >
                <option value="normal">Normal (100%)</option>
                <option value="large">Grande (112.5%)</option>
                <option value="xlarge">Extra grande (125%)</option>
              </select>
            </label>

            <label htmlFor="contrast-select" className="settings-label">
              <span><Eye size={17} aria-hidden="true" /> Nivel de contraste</span>
              <select
                id="contrast-select"
                value={settings.contrast}
                onChange={(e) => updateSetting('contrast', e.target.value)}
                className="settings-select"
              >
                <option value="normal">Normal</option>
                <option value="high">Alto contraste</option>
                <option value="soft">Contraste suave</option>
              </select>
            </label>
          </div>

          <div className="preview-box" aria-label="Vista previa de texto">
            <span className="preview-tag">Vista previa de lectura</span>
            <p className="preview-content">{sampleText}</p>
          </div>

          <label htmlFor="reduce-motion-apariencia" className="switch-card">
            <div className="switch-info">
              <strong><Zap size={16} aria-hidden="true" /> Reducción de movimiento</strong>
              <small>Desactiva transiciones rápidas y animaciones complejas en toda la web.</small>
            </div>
            <input
              id="reduce-motion-apariencia"
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
            />
          </label>

          <label htmlFor="show-labels-check" className="switch-card">
            <div className="switch-info">
              <strong>Mostrar etiquetas de texto junto a los iconos</strong>
              <small>Facilita la identificación de botones de acción agregando texto descriptivo.</small>
            </div>
            <input
              id="show-labels-check"
              type="checkbox"
              checked={settings.showLabels}
              onChange={(e) => updateSetting('showLabels', e.target.checked)}
            />
          </label>
        </section>
      )}

      {/* ── TAB 2: ACCESIBILIDAD ── */}
      {activeTab === 'accesibilidad' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-accesibilidad">
          <h2 id="heading-accesibilidad" className="section-title">
            <Eye size={20} aria-hidden="true" /> Accesibilidad e Inclusión
          </h2>
          <p className="section-description">
            Herramientas y adaptaciones para facilitar la navegación mediante teclado, lectores de pantalla y asistencia sensorial.
          </p>

          <div className="settings-grid-two">
            <label htmlFor="acc-font-size-select" className="settings-label">
              <span><Type size={17} aria-hidden="true" /> Escala tipográfica</span>
              <select
                id="acc-font-size-select"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
                className="settings-select"
              >
                <option value="normal">Texto normal</option>
                <option value="large">Texto grande</option>
                <option value="xlarge">Texto muy grande</option>
              </select>
            </label>

            <label htmlFor="acc-contrast-select" className="settings-label">
              <span><Eye size={17} aria-hidden="true" /> Modo de contraste</span>
              <select
                id="acc-contrast-select"
                value={settings.contrast}
                onChange={(e) => updateSetting('contrast', e.target.value)}
                className="settings-select"
              >
                <option value="normal">Normal</option>
                <option value="high">Alto contraste</option>
                <option value="soft">Contraste suave</option>
              </select>
            </label>
          </div>

          <label htmlFor="color-mode-select" className="settings-label" style={{ marginBottom: '1.4rem' }}>
            <span><Palette size={17} aria-hidden="true" /> Adaptación para daltonismo</span>
            <select
              id="color-mode-select"
              value={settings.colorMode}
              onChange={(e) => updateSetting('colorMode', e.target.value)}
              className="settings-select"
            >
              <option value="normal">Sin filtro (Normal)</option>
              <option value="protanopia">Protanopia (Deficiencia de rojo)</option>
              <option value="deuteranopia">Deuteranopia (Deficiencia de verde)</option>
              <option value="tritanopia">Tritanopia (Deficiencia de azul)</option>
            </select>
          </label>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Navegación e indicadores de apoyo</legend>

            <label htmlFor="reduce-motion-acc" className="switch-card">
              <div className="switch-info">
                <strong><Zap size={16} aria-hidden="true" /> Reducir animaciones</strong>
                <small>Prioriza transiciones estáticas para evitar fatiga cognitiva y mareo.</small>
              </div>
              <input
                id="reduce-motion-acc"
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
              />
            </label>

            <label htmlFor="focus-visible-check" className="switch-card">
              <div className="switch-info">
                <strong><Eye size={16} aria-hidden="true" /> Focus visible de alto contraste</strong>
                <small>Resalta claramente con borde grueso el elemento que tiene el foco activo.</small>
              </div>
              <input
                id="focus-visible-check"
                type="checkbox"
                checked={settings.focusVisible}
                onChange={(e) => updateSetting('focusVisible', e.target.checked)}
              />
            </label>

            <label htmlFor="keyboard-nav-check" className="switch-card">
              <div className="switch-info">
                <strong><Sparkles size={16} aria-hidden="true" /> Navegación por teclado mejorada</strong>
                <small>Atajos de teclado y orden de tabulación optimizado en modales y catálogos.</small>
              </div>
              <input
                id="keyboard-nav-check"
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
              />
            </label>

            <label htmlFor="alt-text-check" className="switch-card">
              <div className="switch-info">
                <strong><Type size={16} aria-hidden="true" /> Texto alternativo enriquecido</strong>
                <small>Genera descripciones ampliadas de obras para sintetizadores y lectores de pantalla.</small>
              </div>
              <input
                id="alt-text-check"
                type="checkbox"
                checked={settings.altTextEnhanced}
                onChange={(e) => updateSetting('altTextEnhanced', e.target.checked)}
              />
            </label>

            <label htmlFor="non-color-check" className="switch-card">
              <div className="switch-info">
                <strong><CheckCircle2 size={16} aria-hidden="true" /> Indicadores independientes del color</strong>
                <small>Acompaña estados (abierto, cerrado, éxito, error) con formas, patrones e iconos claros.</small>
              </div>
              <input
                id="non-color-check"
                type="checkbox"
                checked={settings.nonColorIndicators}
                onChange={(e) => updateSetting('nonColorIndicators', e.target.checked)}
              />
            </label>

            <label htmlFor="readable-font-check" className="switch-card">
              <div className="switch-info">
                <strong><Type size={16} aria-hidden="true" /> Tipografía de alta legibilidad</strong>
                <small>Aumenta el espaciado interlineal para apoyar a personas con dislexia.</small>
              </div>
              <input
                id="readable-font-check"
                type="checkbox"
                checked={settings.readableFont}
                onChange={(e) => updateSetting('readableFont', e.target.checked)}
              />
            </label>

            <label htmlFor="tts-check" className="switch-card">
              <div className="switch-info">
                <strong><Volume2 size={16} aria-hidden="true" /> Asistente de lectura de voz</strong>
                <small>Lectura asistida mediante síntesis de voz en resúmenes de comisiones.</small>
              </div>
              <input
                id="tts-check"
                type="checkbox"
                checked={settings.textToSpeech}
                onChange={(e) => updateSetting('textToSpeech', e.target.checked)}
              />
            </label>
          </fieldset>

          <div className="tts-demo-box">
            <p className="eyebrow">Prueba de síntesis de voz (Web Speech API)</p>
            <p>{sampleText}</p>
            <ReadAloudButton textToRead={sampleText} label="Escuchar muestra de audio" />
            <small className="accessibility-disclaimer">
              <ShieldCheck size={14} aria-hidden="true" /> Nota de accesibilidad: Esta función es un complemento de apoyo visual y no reemplaza a un lector de pantalla como NVDA, JAWS o VoiceOver.
            </small>
          </div>
        </section>
      )}

      {/* ── TAB 3: PRIVACIDAD ── */}
      {activeTab === 'privacidad' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-privacidad">
          <h2 id="heading-privacidad" className="section-title">
            <Lock size={20} aria-hidden="true" /> Privacidad y visibilidad
          </h2>
          <p className="section-description">
            Controla quién puede ver tu actividad, tus listas de artistas seguidos y tus obras.
          </p>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Visibilidad de tu perfil</legend>
            <div className="radio-group-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label className={`radio-card ${settings.privacy?.profileVisibility === 'public' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="profileVisibility"
                  value="public"
                  checked={settings.privacy?.profileVisibility === 'public'}
                  onChange={(e) => updatePrivacy('profileVisibility', e.target.value)}
                />
                <div>
                  <strong>Perfil Público</strong>
                  <small>Visible para toda la comunidad y visitantes de ArtLink</small>
                </div>
              </label>

              <label className={`radio-card ${settings.privacy?.profileVisibility === 'private' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="profileVisibility"
                  value="private"
                  checked={settings.privacy?.profileVisibility === 'private'}
                  onChange={(e) => updatePrivacy('profileVisibility', e.target.value)}
                />
                <div>
                  <strong>Perfil Privado</strong>
                  <small>Solo visible para ti y clientes con encargos activos</small>
                </div>
              </label>
            </div>
          </fieldset>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Elementos visibles en tu perfil</legend>

            <label htmlFor="priv-activity" className="switch-card">
              <div className="switch-info">
                <strong>Mostrar actividad reciente</strong>
                <small>Permite que otros vean tus encargos completados y reseñas públicas.</small>
              </div>
              <input
                id="priv-activity"
                type="checkbox"
                checked={settings.privacy?.showActivity}
                onChange={(e) => updatePrivacy('showActivity', e.target.checked)}
              />
            </label>

            <label htmlFor="priv-following" className="switch-card">
              <div className="switch-info">
                <strong>Mostrar artistas seguidos</strong>
                <small>Exhibe en tu perfil público a los artistas que sigues actualmente.</small>
              </div>
              <input
                id="priv-following"
                type="checkbox"
                checked={settings.privacy?.showFollowing}
                onChange={(e) => updatePrivacy('showFollowing', e.target.checked)}
              />
            </label>

            <label htmlFor="priv-portfolio" className="switch-card">
              <div className="switch-info">
                <strong>Mostrar portafolio en catálogo público</strong>
                <small>Permite que tus obras aparezcan en las galerías de búsqueda comunitaria.</small>
              </div>
              <input
                id="priv-portfolio"
                type="checkbox"
                checked={settings.privacy?.showPortfolio}
                onChange={(e) => updatePrivacy('showPortfolio', e.target.checked)}
              />
            </label>
          </fieldset>
        </section>
      )}

      {/* ── TAB 4: NOTIFICACIONES ── */}
      {activeTab === 'notificaciones' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-notificaciones">
          <h2 id="heading-notificaciones" className="section-title">
            <Bell size={20} aria-hidden="true" /> Preferencias de notificaciones
          </h2>
          <p className="section-description">
            Elige qué avisos e interacciones sociales deseas recibir en ArtLink.
          </p>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Alertas de encargos y mensajes</legend>

            <label htmlFor="notif-requests-opt" className="switch-card">
              <div className="switch-info">
                <strong><FileText size={16} aria-hidden="true" /> Solicitudes</strong>
                <small>Avisos al recibir o enviar nuevas cotizaciones y encargos.</small>
              </div>
              <input
                id="notif-requests-opt"
                type="checkbox"
                checked={settings.notifications?.requests}
                onChange={(e) => updateNotifications('requests', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-messages-opt" className="switch-card">
              <div className="switch-info">
                <strong><MessageSquare size={16} aria-hidden="true" /> Mensajes directos</strong>
                <small>Notificaciones cuando un cliente o artista te envía un mensaje.</small>
              </div>
              <input
                id="notif-messages-opt"
                type="checkbox"
                checked={settings.notifications?.messages}
                onChange={(e) => updateNotifications('messages', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-status-opt" className="switch-card">
              <div className="switch-info">
                <strong><CheckCircle2 size={16} aria-hidden="true" /> Cambios de estado</strong>
                <small>Actualizaciones cuando un encargo pasa a en progreso, completado o revisado.</small>
              </div>
              <input
                id="notif-status-opt"
                type="checkbox"
                checked={settings.notifications?.statusChanges}
                onChange={(e) => updateNotifications('statusChanges', e.target.checked)}
              />
            </label>
          </fieldset>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Interacción social y comunidad</legend>

            <label htmlFor="notif-followers-opt" className="switch-card">
              <div className="switch-info">
                <strong><UserCheck size={16} aria-hidden="true" /> Nuevos seguidores</strong>
                <small>Avisos cuando otro usuario o artista comience a seguir tu perfil.</small>
              </div>
              <input
                id="notif-followers-opt"
                type="checkbox"
                checked={settings.notifications?.newFollowers}
                onChange={(e) => updateNotifications('newFollowers', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-hearts-opt" className="switch-card">
              <div className="switch-info">
                <strong><Heart size={16} aria-hidden="true" /> Corazones y me gusta</strong>
                <small>Notificaciones cuando alguien reacciona a tus obras de arte.</small>
              </div>
              <input
                id="notif-hearts-opt"
                type="checkbox"
                checked={settings.notifications?.hearts}
                onChange={(e) => updateNotifications('hearts', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-reviews-opt" className="switch-card">
              <div className="switch-info">
                <strong><Sparkles size={16} aria-hidden="true" /> Nuevas reseñas y calificaciones</strong>
                <small>Alertas cuando un cliente califica un encargo completado.</small>
              </div>
              <input
                id="notif-reviews-opt"
                type="checkbox"
                checked={settings.notifications?.reviews}
                onChange={(e) => updateNotifications('reviews', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-email" className="switch-card">
              <div className="switch-info">
                <strong>Resumen por correo electrónico</strong>
                <small>Resumen semanal de encargos y actividad en tu bandeja de entrada.</small>
              </div>
              <input
                id="notif-email"
                type="checkbox"
                checked={settings.notifications?.emailNotifs}
                onChange={(e) => updateNotifications('emailNotifs', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-marketing" className="switch-card">
              <div className="switch-info">
                <strong>Novedades y boletín comunitario</strong>
                <small>Avisos sobre eventos, destacados mensuales y nuevas herramientas.</small>
              </div>
              <input
                id="notif-marketing"
                type="checkbox"
                checked={settings.notifications?.marketingNotifs}
                onChange={(e) => updateNotifications('marketingNotifs', e.target.checked)}
              />
            </label>
          </fieldset>
        </section>
      )}

      {/* ── TAB 5: PREFERENCIAS DE BÚSQUEDA ── */}
      {activeTab === 'preferencias' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-preferencias">
          <h2 id="heading-preferencias" className="section-title">
            <SlidersHorizontal size={20} aria-hidden="true" /> Preferencias de navegación
          </h2>
          <p className="section-description">
            Personaliza cómo se descubren y ordenan los artistas y obras en tu experiencia diaria.
          </p>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Disciplinas artísticas favoritas</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {ALL_DISCIPLINES.map((disc) => {
                const isFav = (settings.preferences?.favoriteDisciplines || []).includes(disc)
                return (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => handleToggleDiscipline(disc)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: isFav ? 'var(--violet-soft)' : 'var(--cream)',
                      border: isFav ? '2px solid var(--ink)' : '1.5px solid var(--line)',
                      color: 'var(--ink)',
                      borderRadius: '999px',
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isFav && <Check size={14} color="var(--violet-dark)" />}
                    <span>{disc}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="settings-grid-two">
            <label htmlFor="pref-price-select" className="settings-label">
              <span>Rango de precios habitual</span>
              <select
                id="pref-price-select"
                value={settings.preferences?.priceRange || 'all'}
                onChange={(e) => updatePreferences('priceRange', e.target.value)}
                className="settings-select"
              >
                <option value="all">Cualquier precio</option>
                <option value="0-50">Económico (Hasta $50 USD)</option>
                <option value="50-150">Intermedio ($50 a $150 USD)</option>
                <option value="150+">Premium (Más de $150 USD)</option>
              </select>
            </label>

            <label htmlFor="pref-delivery-select" className="settings-label">
              <span>Tiempo de entrega preferido</span>
              <select
                id="pref-delivery-select"
                value={settings.preferences?.deliveryTime || 'any'}
                onChange={(e) => updatePreferences('deliveryTime', e.target.value)}
                className="settings-select"
              >
                <option value="any">Cualquier plazo</option>
                <option value="3-days">Entrega express (Hasta 3 días)</option>
                <option value="7-days">Estándar (Hasta 7 días)</option>
                <option value="14-days">Flexible (14 días o más)</option>
              </select>
            </label>
          </div>

          <label htmlFor="pref-open-comm-check" className="switch-card">
            <div className="switch-info">
              <strong>Mostrar primero artistas con comisiones abiertas</strong>
              <small>Prioriza creadores disponibles inmediatamente para nuevos encargos.</small>
            </div>
            <input
              id="pref-open-comm-check"
              type="checkbox"
              checked={settings.preferences?.openCommissionsFirst}
              onChange={(e) => updatePreferences('openCommissionsFirst', e.target.checked)}
            />
          </label>

          <label htmlFor="pref-sort-select" className="settings-label" style={{ marginTop: '1rem' }}>
            <span>Criterio de orden predeterminado</span>
            <select
              id="pref-sort-select"
              value={settings.preferences?.sortBy || 'rating'}
              onChange={(e) => updatePreferences('sortBy', e.target.value)}
              className="settings-select"
            >
              <option value="rating">Mayor calificación y reputación</option>
              <option value="activity">Mayor actividad reciente</option>
              <option value="relevance">Relevancia recomendada</option>
            </select>
          </label>
        </section>
      )}

      {/* ── TAB 6: CUENTA Y SOPORTE ── */}
      {activeTab === 'cuenta' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-cuenta">
          <h2 id="heading-cuenta" className="section-title">
            <User size={20} aria-hidden="true" /> Cuenta y soporte
          </h2>
          <p className="section-description">
            Gestiona tus datos de acceso, modifica tu perfil y consulta el centro de ayuda y políticas oficiales.
          </p>

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              <div className="account-details-card">
                <div className="user-details-row">
                  <span className="avatar avatar-large avatar-fallback">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                  </span>
                  <div>
                    <h3>{user.name || 'Usuario ArtLink'}</h3>
                    <p>{user.email}</p>
                    <span className="badge badge-violet">Rol: {user.role}</span>
                  </div>
                </div>

                <div className="account-actions">
                  <Link className="button button-outline" to="/perfil">
                    <User size={16} aria-hidden="true" /> Ver mi perfil público
                  </Link>
                  {user.role === 'artist' && (
                    <Link className="button button-secondary" to="/artista/panel">
                      <Sparkles size={16} aria-hidden="true" /> Mi panel de artista
                    </Link>
                  )}
                  <button
                    type="button"
                    className="button button-outline button-danger"
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                  >
                    <LogOut size={16} aria-hidden="true" /> Cerrar sesión
                  </button>
                </div>
              </div>

              {/* Formulario de edición de datos */}
              <form onSubmit={handleSaveAccount} className="settings-fieldset" style={{ background: 'var(--paper)' }}>
                <legend className="settings-legend">Editar datos de contacto</legend>
                <div className="settings-grid-two" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="edit-name" className="settings-label">
                    <span>Nombre para mostrar</span>
                    <input
                      id="edit-name"
                      type="text"
                      className="settings-select"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                    />
                  </label>

                  <label htmlFor="edit-email" className="settings-label">
                    <span>Correo electrónico</span>
                    <input
                      id="edit-email"
                      type="email"
                      className="settings-select"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>
                {accountMsg && (
                  <p style={{ color: '#0F5C4F', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                    {accountMsg}
                  </p>
                )}
                <button type="submit" className="button button-primary">
                  <Save size={15} aria-hidden="true" /> Guardar cambios de cuenta
                </button>
              </form>

              {/* Formulario de cambio de contraseña */}
              <form onSubmit={handleSavePassword} className="settings-fieldset" style={{ background: 'var(--paper)' }}>
                <legend className="settings-legend">Cambiar contraseña</legend>
                <div className="settings-grid-two" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="current-pass" className="settings-label">
                    <span>Contraseña actual</span>
                    <input
                      id="current-pass"
                      type="password"
                      className="settings-select"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                    />
                  </label>

                  <label htmlFor="new-pass" className="settings-label">
                    <span>Nueva contraseña</span>
                    <input
                      id="new-pass"
                      type="password"
                      className="settings-select"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                    />
                  </label>
                </div>
                {passMsg && (
                  <p style={{ color: passMsg.includes('éxito') ? '#0F5C4F' : '#DC2626', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                    {passMsg}
                  </p>
                )}
                <button type="submit" className="button button-secondary">
                  <Key size={15} aria-hidden="true" /> Actualizar contraseña
                </button>
              </form>
            </div>
          ) : (
            <div className="account-guest-card">
              <p>Actualmente estás en modo visitante sin iniciar sesión.</p>
              <div className="hero-actions">
                <Link className="button button-primary" to="/login">
                  Iniciar sesión
                </Link>
                <Link className="button button-secondary" to="/registro">
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}

          {/* Enlaces de soporte, políticas y versión */}
          <fieldset className="settings-fieldset" style={{ marginTop: '1.8rem' }}>
            <legend className="settings-legend">Centro de ayuda y políticas legales</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem', marginTop: '0.5rem' }}>
              <Link to="/ayuda" className="button button-outline" style={{ justifyContent: 'flex-start' }}>
                <HelpCircle size={16} aria-hidden="true" /> Centro de ayuda
              </Link>
              <Link to="/como-funciona" className="button button-outline" style={{ justifyContent: 'flex-start' }}>
                <HelpCircle size={16} aria-hidden="true" /> Preguntas frecuentes
              </Link>
              <Link to="/terminos" className="button button-outline" style={{ justifyContent: 'flex-start' }}>
                <FileText size={16} aria-hidden="true" /> Términos de uso
              </Link>
              <Link to="/privacidad" className="button button-outline" style={{ justifyContent: 'flex-start' }}>
                <ShieldCheck size={16} aria-hidden="true" /> Política de privacidad
              </Link>
              <Link to="/comunidad" className="button button-outline" style={{ justifyContent: 'flex-start' }}>
                <FileText size={16} aria-hidden="true" /> Políticas de comunidad
              </Link>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={14} aria-hidden="true" /> Versión de la aplicación: <strong>ArtLink v2.5.0 (Enterprise Academic Release)</strong>
              </span>
              <span>© {new Date().getFullYear()} ArtLink Inc. Todos los derechos reservados.</span>
            </div>
          </fieldset>
        </section>
      )}

      {/* ── BOTONES GLOBALES DE GUARDAR Y RESTAURAR ── */}
      <footer className="settings-actions-footer">
        <button
          type="button"
          className="button button-secondary"
          onClick={resetSettings}
        >
          <RotateCcw size={16} aria-hidden="true" /> Restaurar valores predeterminados
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={saveSettings}
        >
          <Save size={16} aria-hidden="true" /> Guardar preferencias
        </button>
      </footer>
    </div>
  )
}
