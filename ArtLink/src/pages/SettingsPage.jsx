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
} from 'lucide-react'
import useSettings from '../hooks/useSettings'
import useAuth from '../hooks/useAuth'
import ReadAloudButton from '../components/ReadAloudButton'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    settings,
    updateSetting,
    updateNotifications,
    saveSettings,
    resetSettings,
    statusMessage,
  } = useSettings()

  const [activeTab, setActiveTab] = useState('apariencia')

  const sampleText =
    'ArtLink es la plataforma donde puedes descubrir artistas digitales, encargar piezas personalizadas con tarifas claras y disponibilidad en vivo.'

  return (
    <div className="settings-page" aria-labelledby="settings-title">
      <header className="settings-header">
        <span className="sticker hero-sticker">
          <Sparkles size={13} aria-hidden="true" /> Preferencias y accesibilidad
        </span>
        <p className="eyebrow">ArtLink / Configuración</p>
        <h1 id="settings-title">Ajustes y accesibilidad</h1>
        <p className="settings-intro">
          Personaliza la apariencia visual, la navegación adaptada, el contraste y tus opciones de cuenta para una experiencia cómoda e inclusiva.
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
          <span>Accesibilidad visual</span>
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
          className={`tab-button ${activeTab === 'cuenta' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cuenta')}
          aria-selected={activeTab === 'cuenta'}
          role="tab"
        >
          <User size={17} aria-hidden="true" />
          <span>Cuenta</span>
        </button>
      </nav>

      {/* ── TAB 1: APARIENCIA ── */}
      {activeTab === 'apariencia' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-apariencia">
          <h2 id="heading-apariencia" className="section-title">
            <Sun size={20} aria-hidden="true" /> Apariencia y visualización
          </h2>
          <p className="section-description">
            Ajusta el tema general de color, tamaño de la tipografía y contraste para adaptarlo a la luz de tu entorno.
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

          <label htmlFor="show-labels-check" className="switch-card">
            <div className="switch-info">
              <strong>Mostrar etiquetas de texto junto a los iconos</strong>
              <small>Facilita la identificación de botones de acción agregando texto claro.</small>
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
            Opciones avanzadas para daltonismo, reducción de movimiento, tipografía hiperlegible y lectura de voz asistida.
          </p>

          <label htmlFor="color-mode-select" className="settings-label">
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
            <legend className="settings-legend">Navegación y confort visual</legend>

            <label htmlFor="reduce-motion-check" className="switch-card">
              <div className="switch-info">
                <strong><Zap size={16} aria-hidden="true" /> Reducir animaciones y transiciones</strong>
                <small>Desactiva efectos de movimiento rápido para prevenir mareos y fatiga visual.</small>
              </div>
              <input
                id="reduce-motion-check"
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
              />
            </label>

            <label htmlFor="readable-font-check" className="switch-card">
              <div className="switch-info">
                <strong><Type size={16} aria-hidden="true" /> Tipografía de alta legibilidad</strong>
                <small>Aumenta el interlineado y espacio entre caracteres para facilitar la dislexia.</small>
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
                <strong><Volume2 size={16} aria-hidden="true" /> Asistente opcional de lectura de voz</strong>
                <small>Habilita la síntesis de voz Web Speech API para escuchar resúmenes y briefs.</small>
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
            <ReadAloudButton textToRead={sampleText} label="Escuchar demostración" />
            <small className="accessibility-disclaimer">
              <ShieldCheck size={14} aria-hidden="true" /> Nota de accesibilidad: Esta función es un complemento de apoyo visual y no reemplaza a un lector de pantalla como NVDA, JAWS o VoiceOver.
            </small>
          </div>
        </section>
      )}

      {/* ── TAB 3: NOTIFICACIONES ── */}
      {activeTab === 'notificaciones' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-notificaciones">
          <h2 id="heading-notificaciones" className="section-title">
            <Bell size={20} aria-hidden="true" /> Preferencias de notificaciones
          </h2>
          <p className="section-description">
            Elige qué avisos deseas recibir sobre tus comisiones, ofertas y actualizaciones de ArtLink.
          </p>

          <fieldset className="settings-fieldset">
            <legend className="settings-legend">Canales y alertas</legend>

            <label htmlFor="notif-email" className="switch-card">
              <div className="switch-info">
                <strong>Notificaciones por correo electrónico</strong>
                <small>Recibe resúmenes periódicos de la actividad de tus encargos.</small>
              </div>
              <input
                id="notif-email"
                type="checkbox"
                checked={settings.notifications.emailNotifs}
                onChange={(e) => updateNotifications('emailNotifs', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-requests" className="switch-card">
              <div className="switch-info">
                <strong>Actualizaciones de solicitudes y encargos</strong>
                <small>Avisos inmediatos sobre cambios de estado, mensajes e hitos aprobados.</small>
              </div>
              <input
                id="notif-requests"
                type="checkbox"
                checked={settings.notifications.requestNotifs}
                onChange={(e) => updateNotifications('requestNotifs', e.target.checked)}
              />
            </label>

            <label htmlFor="notif-marketing" className="switch-card">
              <div className="switch-info">
                <strong>Novedades y ofertas de la plataforma</strong>
                <small>Boletín mensual con nuevos artistas destacados y eventos comunitarios.</small>
              </div>
              <input
                id="notif-marketing"
                type="checkbox"
                checked={settings.notifications.marketingNotifs}
                onChange={(e) => updateNotifications('marketingNotifs', e.target.checked)}
              />
            </label>
          </fieldset>
        </section>
      )}

      {/* ── TAB 4: CUENTA ── */}
      {activeTab === 'cuenta' && (
        <section className="settings-section-card paper-card" aria-labelledby="heading-cuenta">
          <h2 id="heading-cuenta" className="section-title">
            <User size={20} aria-hidden="true" /> Información de cuenta
          </h2>
          <p className="section-description">
            Gestiona la sesión actual, consulta tus datos y accede a tu perfil completo.
          </p>

          {user ? (
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
