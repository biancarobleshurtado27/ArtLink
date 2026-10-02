import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  DollarSign,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { getUserById, updateUser as updateUserService } from '../../services/userService'
import { getArtistByUserId, updateArtist as updateArtistService, createArtist as createArtistService } from '../../services/artistService'
import { handleImageError } from '../../utils/imageFallback'
import { ROLES, roleLabels } from '../../utils/roles'
import Badge from '../Badge'

const AVAILABLE_DISCIPLINES = [
  'Ilustración Digital',
  'Concept Art',
  'Modelado 3D',
  'Pixel Art',
  'Voxel Art',
  'Animación 2D/3D',
  'UI/UX Design',
  'Arte Generativo',
]

const AVATAR_PRESETS = [
  { label: 'Sora Moon', url: '/images/hero/thumbs/sora-1.jpg' },
  { label: 'Mateo Ilustración', url: '/images/hero/thumbs/sora-2.jpg' },
  { label: 'Kaelen Lab', url: '/images/hero/thumbs/shop-1.jpg' },
  { label: 'Chroma Studio', url: '/images/hero/thumbs/shop-2.jpg' },
]

export default function ProfileSettingsSection() {
  const { user, updateUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  // Datos de usuario base
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')

  // Datos específicos de artista
  const [artistProfile, setArtistProfile] = useState(null)
  const [artistDisplayName, setArtistDisplayName] = useState('')
  const [artistUsername, setArtistUsername] = useState('')
  const [disciplines, setDisciplines] = useState([])
  const [stylesInput, setStylesInput] = useState('')
  const [basePrice, setBasePrice] = useState(50)
  const [availability, setAvailability] = useState('open')
  const [slots, setSlots] = useState(3)
  const [socialWeb, setSocialWeb] = useState('')
  const [socialX, setSocialX] = useState('')
  const [socialInstagram, setSocialInstagram] = useState('')

  const isArtist =
    user?.role === ROLES.ARTIST ||
    user?.role === 'artist' ||
    user?.role === 'artista'

  // Cargar datos reales del usuario y de su perfil de artista
  useEffect(() => {
    let isMounted = true

    async function fetchFullProfile() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // 1. Obtener usuario de la base de datos o usar la sesión actual
        let userData = user
        try {
          const fresh = await getUserById(user.id)
          if (fresh) userData = fresh
        } catch {
          // Si el servidor falla, se preserva la sesión activa
        }

        if (!isMounted) return

        setName(userData.name || '')
        setEmail(userData.email || '')
        setAvatar(userData.avatar || userData.avatarUrl || '')
        setBio(userData.bio || userData.description || '')
        setPhone(userData.phone || '')
        setLocation(userData.location || '')
        setWebsite(userData.website || '')

        // 2. Si es artista o tiene perfil, obtener datos del catálogo
        if (isArtist || userData.artistProfileId) {
          try {
            const profiles = await getArtistByUserId(user.id)
            const profile = Array.isArray(profiles) ? profiles[0] : profiles
            if (profile && isMounted) {
              setArtistProfile(profile)
              setArtistDisplayName(profile.displayName || profile.name || userData.name || '')
              setArtistUsername(profile.username || '')
              setDisciplines(Array.isArray(profile.disciplines) ? profile.disciplines : [])
              setStylesInput(Array.isArray(profile.styles) ? profile.styles.join(', ') : '')
              setBasePrice(typeof profile.basePrice === 'number' ? profile.basePrice : 50)
              setAvailability(profile.availability === 'closed' ? 'closed' : 'open')
              setSlots(typeof profile.slots === 'number' ? profile.slots : 3)
              setSocialWeb(profile.socialLinks?.web || '')
              setSocialX(profile.socialLinks?.x || '')
              setSocialInstagram(profile.socialLinks?.instagram || '')
              if (!userData.bio && profile.bio) {
                setBio(profile.bio)
              }
              if (!userData.location && profile.location) {
                setLocation(profile.location)
              }
            }
          } catch {
            // Continúa con los datos base de usuario
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchFullProfile()

    return () => {
      isMounted = false
    }
  }, [user?.id, isArtist])

  function handleDisciplineToggle(discipline) {
    setDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    )
  }

  function handlePresetAvatar(presetUrl) {
    setAvatar(presetUrl)
  }

  function handleReset() {
    setName(user?.name || '')
    setEmail(user?.email || '')
    setAvatar(user?.avatar || user?.avatarUrl || '')
    setBio(user?.bio || user?.description || '')
    setPhone(user?.phone || '')
    setLocation(user?.location || '')
    setWebsite(user?.website || '')
    if (artistProfile) {
      setArtistDisplayName(artistProfile.displayName || artistProfile.name || '')
      setArtistUsername(artistProfile.username || '')
      setDisciplines(Array.isArray(artistProfile.disciplines) ? artistProfile.disciplines : [])
      setStylesInput(Array.isArray(artistProfile.styles) ? artistProfile.styles.join(', ') : '')
      setBasePrice(artistProfile.basePrice || 50)
      setAvailability(artistProfile.availability || 'open')
      setSlots(artistProfile.slots || 3)
      setSocialWeb(artistProfile.socialLinks?.web || '')
      setSocialX(artistProfile.socialLinks?.x || '')
      setSocialInstagram(artistProfile.socialLinks?.instagram || '')
    }
    setStatus({ type: '', message: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setStatus({ type: 'error', message: 'El nombre para mostrar es obligatorio.' })
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Por favor ingresa un correo electrónico válido.' })
      return
    }

    setSaving(true)
    setStatus({ type: '', message: '' })

    try {
      const userPayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: avatar.trim(),
        avatarUrl: avatar.trim(),
        bio: bio.trim(),
        description: bio.trim(),
        phone: phone.trim(),
        location: location.trim(),
        website: website.trim(),
      }

      // 1. Persistir cambios del usuario en el endpoint
      let updatedUserRecord = null
      try {
        updatedUserRecord = await updateUserService(user.id, userPayload)
      } catch (err) {
        console.warn('Persistiendo perfil en sesión local (JSON Server no disponible):', err?.message)
      }

      // 2. Si es artista, persistir datos públicos en artistProfiles
      if (isArtist) {
        const stylesArray = stylesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        const artistPayload = {
          displayName: artistDisplayName.trim() || name.trim(),
          name: artistDisplayName.trim() || name.trim(),
          username: (artistUsername.trim() || name.trim().toLowerCase().replace(/\s+/g, '_')).replace(/^@/, ''),
          avatar: avatar.trim(),
          avatarUrl: avatar.trim(),
          bio: bio.trim(),
          location: location.trim(),
          disciplines: disciplines.length > 0 ? disciplines : ['Ilustración Digital'],
          styles: stylesArray.length > 0 ? stylesArray : ['Digital Art'],
          basePrice: Number(basePrice) >= 0 ? Number(basePrice) : 50,
          availability,
          slots: Number(slots) >= 0 ? Number(slots) : 0,
          socialLinks: {
            web: socialWeb.trim(),
            x: socialX.trim(),
            instagram: socialInstagram.trim(),
          },
        }

        try {
          if (artistProfile?.id) {
            const updatedProfile = await updateArtistService(artistProfile.id, artistPayload)
            setArtistProfile(updatedProfile)
          } else {
            const newProfile = await createArtistService({
              userId: user.id,
              ...artistPayload,
            })
            setArtistProfile(newProfile)
            userPayload.artistProfileId = newProfile.id
          }
        } catch (err) {
          console.warn('No se pudo sincronizar el perfil público de artista en el backend:', err?.message)
        }
      }

      // 3. Sincronizar el contexto de autenticación de React
      if (updateUser) {
        updateUser({
          ...user,
          ...userPayload,
          name: userPayload.name,
          email: userPayload.email,
          avatar: userPayload.avatar,
        })
      }

      setStatus({
        type: 'success',
        message: 'Tu perfil ha sido actualizado y guardado correctamente.',
      })

      // Ocultar mensaje tras unos segundos
      setTimeout(() => {
        setStatus((prev) => (prev.type === 'success' ? { type: '', message: '' } : prev))
      }, 5000)
    } catch (error) {
      setStatus({
        type: 'error',
        message: `No se pudieron guardar los cambios: ${error.message || 'Error inesperado'}`,
      })
    } finally {
      setSaving(false)
    }
  }

  const initials = (name || user?.name || user?.email || 'US')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (loading) {
    return (
      <section className="settings-section-card paper-card" aria-busy="true">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '2rem 0' }}>
          <Loader2 className="spin" size={24} aria-hidden="true" />
          <p style={{ margin: 0, fontWeight: 700 }}>Cargando datos de tu perfil...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="settings-section-card paper-card" aria-labelledby="heading-perfil">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 id="heading-perfil" className="section-title">
            <UserCheck size={22} aria-hidden="true" /> Modificar perfil
          </h2>
          <p className="section-description" style={{ marginBottom: '0.5rem' }}>
            Actualiza tu foto de perfil, datos de contacto, descripción personal y configuración pública visible en ArtLink.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Badge tone="mint">{roleLabels[user?.role] || user?.role || 'Usuario'}</Badge>
          <Link to="/perfil" className="button button-outline button-small">
            <User size={15} aria-hidden="true" /> Ver perfil público
          </Link>
        </div>
      </div>

      {/* Banner accesible de notificaciones */}
      <div aria-live="polite" aria-atomic="true" style={{ marginBottom: '1.2rem' }}>
        {status.message && (
          <div
            className={`settings-status-banner ${status.type === 'error' ? 'form-message form-error' : ''}`}
            role={status.type === 'error' ? 'alert' : 'status'}
            style={
              status.type === 'error'
                ? { background: 'var(--amber-soft)', borderColor: 'var(--ink)', color: '#8A3B00', padding: '0.75rem 1rem' }
                : {}
            }
          >
            {status.type === 'error' ? (
              <AlertCircle size={18} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={18} aria-hidden="true" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── 1. AVATAR E IMAGEN DE PERFIL ── */}
        <fieldset className="settings-fieldset">
          <legend className="settings-legend">Imagen de perfil y avatar</legend>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
            <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={`Vista previa de avatar de ${name || 'usuario'}`}
                  onError={handleImageError}
                  className="avatar avatar-large avatar-img"
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    border: '3px solid var(--ink)',
                    boxShadow: 'var(--shadow-firm)',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <span
                  className="avatar avatar-large avatar-fallback"
                  aria-hidden="true"
                  style={{
                    width: '92px',
                    height: '92px',
                    fontSize: '1.6rem',
                    border: '3px solid var(--ink)',
                    boxShadow: 'var(--shadow-firm)',
                  }}
                >
                  {initials}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <label htmlFor="profile-avatar-url" className="settings-label">
                <span><ImageIcon size={15} aria-hidden="true" /> URL de la imagen de avatar</span>
                <input
                  id="profile-avatar-url"
                  name="avatar"
                  type="url"
                  className="settings-select"
                  placeholder="https://ejemplo.com/mi-avatar.jpg o ruta local"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </label>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                Introduce una URL directa a tu imagen (PNG, JPG o WebP) o selecciona un avatar predeterminado abajo.
              </p>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: '0.5rem' }}>
              Avatares sugeridos para pruebas o uso rápido:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => handlePresetAvatar(preset.url)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    background: avatar === preset.url ? 'var(--mint-soft)' : 'var(--cream)',
                    border: avatar === preset.url ? '2px solid var(--ink)' : '1.5px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: 'var(--ink)',
                  }}
                >
                  <Camera size={13} aria-hidden="true" />
                  <span>{preset.label}</span>
                </button>
              ))}
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.75rem',
                    background: 'var(--paper)',
                    border: '1.5px dashed var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: 'var(--muted)',
                  }}
                >
                  Usar iniciales
                </button>
              )}
            </div>
          </div>
        </fieldset>

        {/* ── 2. DATOS DE CUENTA E INFORMACIÓN PERSONAL ── */}
        <fieldset className="settings-fieldset">
          <legend className="settings-legend">Información personal y de contacto</legend>
          <div className="settings-grid-two">
            <label htmlFor="profile-name" className="settings-label">
              <span><User size={15} aria-hidden="true" /> Nombre completo / para mostrar *</span>
              <input
                id="profile-name"
                name="name"
                type="text"
                className="settings-select"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-required="true"
                placeholder="Ej. Mateo Ríos"
              />
            </label>

            <label htmlFor="profile-email" className="settings-label">
              <span><Mail size={15} aria-hidden="true" /> Correo electrónico *</span>
              <input
                id="profile-email"
                name="email"
                type="email"
                className="settings-select"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                placeholder="correo@ejemplo.com"
              />
            </label>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label htmlFor="profile-bio" className="settings-label">
              <span><Sparkles size={15} aria-hidden="true" /> Biografía y descripción personal</span>
              <textarea
                id="profile-bio"
                name="bio"
                className="settings-select"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntale a la comunidad de ArtLink sobre tus gustos artísticos, tus proyectos o tu visión creativa..."
                style={{ resize: 'vertical', minHeight: '90px' }}
              />
            </label>
          </div>

          <div className="settings-grid-two" style={{ marginBottom: 0 }}>
            <label htmlFor="profile-location" className="settings-label">
              <span><MapPin size={15} aria-hidden="true" /> Ubicación o ciudad</span>
              <input
                id="profile-location"
                name="location"
                type="text"
                className="settings-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Ciudad de México / Remoto"
              />
            </label>

            <label htmlFor="profile-phone" className="settings-label">
              <span><Phone size={15} aria-hidden="true" /> Teléfono de contacto (opcional)</span>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                className="settings-select"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
              />
            </label>
          </div>

          <div style={{ marginTop: '1.2rem' }}>
            <label htmlFor="profile-website" className="settings-label">
              <span><Globe size={15} aria-hidden="true" /> Sitio web o portafolio personal</span>
              <input
                id="profile-website"
                name="website"
                type="url"
                className="settings-select"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://tuportafolio.art"
              />
            </label>
          </div>
        </fieldset>

        {/* ── 3. SECCIÓN EXCLUSIVA PARA PERFILES DE ARTISTA ── */}
        {isArtist && (
          <fieldset className="settings-fieldset" style={{ background: 'var(--paper)' }}>
            <legend className="settings-legend">Configuración de Artista y Catálogo</legend>
            <p style={{ margin: '0 0 1.2rem', fontSize: '0.86rem', color: 'var(--muted)' }}>
              Esta información se exhibe públicamente en tu ficha de artista dentro del catálogo y en los motores de búsqueda de ArtLink.
            </p>

            <div className="settings-grid-two">
              <label htmlFor="artist-display-name" className="settings-label">
                <span><Palette size={15} aria-hidden="true" /> Nombre artístico público</span>
                <input
                  id="artist-display-name"
                  type="text"
                  className="settings-select"
                  value={artistDisplayName}
                  onChange={(e) => setArtistDisplayName(e.target.value)}
                  placeholder="Ej. Sora Moon Studio"
                />
              </label>

              <label htmlFor="artist-username" className="settings-label">
                <span>Handle de creador (@username)</span>
                <input
                  id="artist-username"
                  type="text"
                  className="settings-select"
                  value={artistUsername}
                  onChange={(e) => setArtistUsername(e.target.value)}
                  placeholder="soramoon"
                />
              </label>
            </div>

            <div className="settings-grid-two">
              <label htmlFor="artist-base-price" className="settings-label">
                <span><DollarSign size={15} aria-hidden="true" /> Tarifa base inicial (USD)</span>
                <input
                  id="artist-base-price"
                  type="number"
                  min="0"
                  step="5"
                  className="settings-select"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="120"
                />
              </label>

              <label htmlFor="artist-slots" className="settings-label">
                <span>Cupos disponibles de comisiones</span>
                <input
                  id="artist-slots"
                  type="number"
                  min="0"
                  max="50"
                  className="settings-select"
                  value={slots}
                  onChange={(e) => setSlots(e.target.value)}
                  placeholder="3"
                />
              </label>
            </div>

            <div style={{ margin: '1.2rem 0' }}>
              <label htmlFor="artist-availability" className="settings-label" style={{ marginBottom: '0.5rem' }}>
                <span>Disponibilidad actual para encargos</span>
              </label>
              <div className="radio-group-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <label className={`radio-card ${availability === 'open' ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="availability"
                    value="open"
                    checked={availability === 'open'}
                    onChange={() => setAvailability('open')}
                  />
                  <div>
                    <strong>Abierto para comisiones</strong>
                    <small>Los clientes pueden formularte nuevas cotizaciones y encargos directos.</small>
                  </div>
                </label>

                <label className={`radio-card ${availability === 'closed' ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="availability"
                    value="closed"
                    checked={availability === 'closed'}
                    onChange={() => setAvailability('closed')}
                  />
                  <div>
                    <strong>Cerrado temporalmente</strong>
                    <small>No aceptas nuevas solicitudes mientras finalizas encargos en curso.</small>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: '0.5rem' }}>
                Disciplinas artísticas que ofreces:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {AVAILABLE_DISCIPLINES.map((disc) => {
                  const isSelected = disciplines.includes(disc)
                  return (
                    <button
                      key={disc}
                      type="button"
                      onClick={() => handleDisciplineToggle(disc)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.85rem',
                        background: isSelected ? 'var(--mint-soft)' : 'var(--cream)',
                        border: isSelected ? '2px solid var(--ink)' : '1.5px solid var(--line)',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected && <CheckCircle2 size={13} aria-hidden="true" />}
                      <span>{disc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label htmlFor="artist-styles" className="settings-label">
                <span>Estilos visuales (separados por comas)</span>
                <input
                  id="artist-styles"
                  type="text"
                  className="settings-select"
                  value={stylesInput}
                  onChange={(e) => setStylesInput(e.target.value)}
                  placeholder="Ej. Anime, Cyberpunk, Fantasía Luminosa, Mecha"
                />
              </label>
            </div>

            <div className="settings-grid-two">
              <label htmlFor="artist-social-x" className="settings-label">
                <span>Perfil de X / Twitter</span>
                <input
                  id="artist-social-x"
                  type="text"
                  className="settings-select"
                  value={socialX}
                  onChange={(e) => setSocialX(e.target.value)}
                  placeholder="@usuario_art"
                />
              </label>

              <label htmlFor="artist-social-ig" className="settings-label">
                <span>Perfil de Instagram</span>
                <input
                  id="artist-social-ig"
                  type="text"
                  className="settings-select"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="@usuario.art"
                />
              </label>
            </div>
          </fieldset>
        )}

        {/* ── BOTONES DE ACCIÓN ── */}
        <div className="settings-actions-footer" style={{ borderTop: '2px solid var(--ink)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="button button-outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw size={16} aria-hidden="true" /> Restablecer
          </button>

          <button
            type="submit"
            className="button button-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="spin" size={16} aria-hidden="true" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save size={16} aria-hidden="true" />
                <span>Guardar cambios de perfil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
