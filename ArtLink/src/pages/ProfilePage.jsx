import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, LayoutDashboard, LogOut, MessageCircle, Sparkles } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useArtists from '../hooks/useArtists'
import useFavorites from '../hooks/useFavorites'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { getArtistByUserId } from '../services/artistService'
import { handleImageError } from '../utils/imageFallback'
import { ROLES, roleLabels } from '../utils/roles'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const favorites = useFavorites()
  const { artists, loading, error } = useArtists()
  const [artistProfile, setArtistProfile] = useState(null)

  useEffect(() => {
    let active = true
    if (user?.role !== ROLES.ARTIST) return undefined
    getArtistByUserId(user.id)
      .then((profiles) => { if (active && profiles[0]) setArtistProfile(profiles[0]) })
      .catch(() => {})
    return () => { active = false }
  }, [user])

  if (!user) {
    return (
      <section className="auth-panel" aria-labelledby="profile-guest-title">
        <p className="eyebrow">ArtLink / mi perfil</p>
        <h1 id="profile-guest-title">Esta sección es para tu cuenta</h1>
        <p className="private-intro">Inicia sesión para ver tu perfil, tus solicitudes y tus artistas guardados.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/login">Iniciar sesión</Link>
          <Link className="button button-secondary" to="/registro">Crear cuenta</Link>
        </div>
      </section>
    )
  }

  const savedArtists = artists.filter((artist) => favorites.ids.includes(artist.id))
  const fullName = user.name || user.email || 'Usuario'
  const initials = fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="profile-page" aria-labelledby="profile-title">
      <section className="profile-card">
        <div className="profile-card-avatar">
          {user.avatar
            ? <img className="avatar avatar-large avatar-img" src={user.avatar} onError={handleImageError} alt={`Avatar de ${fullName}`} />
            : <span className="avatar avatar-large avatar-fallback" aria-hidden="true">{initials}</span>}
          <Badge tone="mint">{roleLabels[user.role] || user.role}</Badge>
        </div>
        <div className="profile-card-copy">
          <p className="eyebrow">ArtLink / mi perfil</p>
          <h1 id="profile-title">{fullName}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
        <div className="profile-card-actions">
          <Link className="button button-outline button-small" to="/solicitudes"><MessageCircle size={15} aria-hidden="true" /> Mis solicitudes</Link>
          {user.role === ROLES.ADMIN && <Link className="button button-outline button-small" to="/admin"><LayoutDashboard size={15} aria-hidden="true" /> Administración</Link>}
          {artistProfile && <Link className="button button-outline button-small" to={`/artista/${artistProfile.id}`}><Sparkles size={15} aria-hidden="true" /> Mi perfil público</Link>}
          {user.role === ROLES.ARTIST && <Link className="button button-primary button-small" to="/artista/panel"><LayoutDashboard size={15} aria-hidden="true" /> Mi espacio de artista</Link>}
          <button className="button button-secondary button-small" type="button" onClick={logout}><LogOut size={15} aria-hidden="true" /> Cerrar sesión</button>
        </div>
      </section>

      <section className="profile-section-block" aria-labelledby="favorites-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Guardados en tu navegador</p>
            <h2 id="favorites-title">Artistas favoritos</h2>
          </div>
          <Link className="button button-outline button-small" to="/explorar">Explorar más <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        {loading && <p className="private-intro">Cargando artistas guardados...</p>}
        {error && <p className="form-message form-error" role="alert">No pudimos cargar tus favoritos: {error.message}</p>}
        {!loading && !error && savedArtists.length === 0 && (
          <EmptyState title="Todavía no guardas artistas" description="Toca el corazón en la tarjeta de un artista para tenerlo aquí." />
        )}
        {savedArtists.length > 0 && (
          <ul className="favorites-list">
            {savedArtists.map((artist) => (
              <li className="favorite-item" key={artist.id}>
                <div className="favorite-item-copy">
                  <strong>{artist.displayName}</strong>
                  <span>@{artist.username} · Desde ${artist.basePrice} USD</span>
                </div>
                <button className="icon-button favorite-remove" type="button" aria-label={`Quitar a ${artist.displayName} de favoritos`} onClick={() => favorites.toggle(artist.id)}><Heart size={17} fill="currentColor" aria-hidden="true" /></button>
                <Link className="button button-outline button-small" to={`/artista/${artist.id}`}>Ver perfil <ArrowRight size={14} aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}