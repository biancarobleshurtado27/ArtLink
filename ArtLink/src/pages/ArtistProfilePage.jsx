import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  MapPin,
  Sparkles,
  Star,
  ShieldCheck,
  Heart,
  MessageSquare,
  UserPlus,
  Globe,
  Check,
} from 'lucide-react'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import ShareMenu from '../components/ShareMenu'
import useArtistProfile from '../hooks/useArtistProfile'
import useAuth from '../hooks/useAuth'
import { handleImageError } from '../utils/imageFallback'
import {
  getFollowStatus,
  followArtist,
  unfollowArtist,
  getArtistFollowerCount,
} from '../services/followService'
import {
  getAllLikes,
  likeArtwork,
  unlikeArtwork,
} from '../services/likeService'
import { getRequests, createRequest } from '../services/requestService'
import { createReview } from '../services/reviewService'

const ratingLabels = {
  1: '1 estrella (Deficiente)',
  2: '2 estrellas (Regular)',
  3: '3 estrellas (Bueno)',
  4: '4 estrellas (Muy bueno)',
  5: '5 estrellas (Excelente)',
}

export default function ArtistProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, portfolio = [], commissions = [], reviews = [], loading, error } = useArtistProfile(id)
  const { user } = useAuth()

  // Estados de navegación y modales
  const [activeTab, setActiveTab] = useState('comisiones')
  const [selectedWork, setSelectedWork] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Estado del botón Seguir (follows)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [followError, setFollowError] = useState(null)

  // Estado de los me gusta (likes)
  const [allLikes, setAllLikes] = useState([])
  const [likeLoadingMap, setLikeLoadingMap] = useState({})

  // Estado de reseñas y reputación
  const [localReviews, setLocalReviews] = useState([])
  const [eligibleRequest, setEligibleRequest] = useState(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  // Comprobar si el usuario conectado es el propio artista
  const isSelf = Boolean(
    user && (
      String(user.id) === String(profile?.userId) ||
      String(user.id) === String(profile?.id) ||
      (user.email && user.email === profile?.userEmail) ||
      (user.username && user.username === profile?.username)
    )
  )

  const isClosed = profile?.availability === 'closed'
  const isWaitlist = profile?.availability === 'waitlist'

  // Cargar reseñas locales cuando cambian las provistas por el hook
  useEffect(() => {
    setLocalReviews(reviews || [])
  }, [reviews])

  // Cargar estado de seguimiento real
  useEffect(() => {
    let active = true
    if (!profile?.id) return

    getArtistFollowerCount(profile.id)
      .then((count) => {
        if (active) setFollowerCount(count)
      })
      .catch(() => {})

    if (user?.id) {
      getFollowStatus(user.id, profile.id)
        .then(({ isFollowing: status }) => {
          if (active) setIsFollowing(status)
        })
        .catch(() => {})
    } else {
      setIsFollowing(false)
    }

    return () => { active = false }
  }, [profile?.id, user?.id])

  // Cargar likes reales de la colección
  useEffect(() => {
    let active = true
    getAllLikes()
      .then((data) => {
        if (active) setAllLikes(data || [])
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // Comprobar si el usuario actual es cliente con encargo completado sin reseñar
  useEffect(() => {
    let active = true
    if (!user || !profile?.id || isSelf) {
      setEligibleRequest(null)
      return
    }

    getRequests({ clientId: user.id, artistId: profile.id, status: 'completed' })
      .then((data) => {
        if (!active) return
        const completedRequests = (data || []).filter(
          (req) =>
            String(req.clientId) === String(user.id) &&
            String(req.artistId) === String(profile.id) &&
            req.status === 'completed'
        )
        const unreviewed = completedRequests.find(
          (req) => !localReviews.some((rev) => String(rev.requestId) === String(req.id))
        )
        setEligibleRequest(unreviewed || null)
      })
      .catch(() => {
        if (active) setEligibleRequest(null)
      })

    return () => { active = false }
  }, [user, profile?.id, isSelf, localReviews])

  // Categorías presentes en las obras del artista
  const portfolioCategories = useMemo(() => {
    const cats = new Set(portfolio.map((item) => item.category).filter(Boolean))
    return ['all', ...Array.from(cats)]
  }, [portfolio])

  // Filtrado de portafolio
  const filteredPortfolio = useMemo(() => {
    if (selectedCategory === 'all') return portfolio
    return portfolio.filter((item) => item.category === selectedCategory)
  }, [portfolio, selectedCategory])

  // Cálculo de reputación real
  const reviewCount = localReviews.length
  const averageRating = useMemo(() => {
    if (reviewCount === 0) return null
    const total = localReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0)
    return total / reviewCount
  }, [localReviews, reviewCount])

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    localReviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)))
      dist[star] = (dist[star] || 0) + 1
    })
    return dist
  }, [localReviews])

  // Manejar Seguir / Dejar de seguir con persistencia y actualización optimista
  async function handleToggleFollow() {
    if (!user) {
      navigate('/login')
      return
    }
    if (isSelf) return

    setFollowLoading(true)
    setFollowError(null)

    const prevFollowing = isFollowing
    const prevCount = followerCount
    const nextFollowing = !prevFollowing
    const nextCount = nextFollowing ? prevCount + 1 : Math.max(0, prevCount - 1)

    setIsFollowing(nextFollowing)
    setFollowerCount(nextCount)

    try {
      if (nextFollowing) {
        await followArtist(user.id, profile.id)
      } else {
        await unfollowArtist(user.id, profile.id)
      }
    } catch (err) {
      setIsFollowing(prevFollowing)
      setFollowerCount(prevCount)
      setFollowError(err.message || 'Error al actualizar seguimiento')
    } finally {
      setFollowLoading(false)
    }
  }

  // Manejar Me gusta en obras con persistencia en JSON Server
  async function handleToggleLike(artworkId) {
    if (!user) {
      navigate('/login')
      return
    }
    if (likeLoadingMap[artworkId]) return

    const existingLike = allLikes.find(
      (l) => String(l.userId) === String(user.id) && String(l.portfolioItemId) === String(artworkId)
    )
    const isLiked = Boolean(existingLike)
    const previousLikes = allLikes

    if (isLiked) {
      setAllLikes((prev) => prev.filter((l) => l.id !== existingLike.id))
    } else {
      const tempLike = {
        id: `temp-${Date.now()}`,
        userId: String(user.id),
        portfolioItemId: String(artworkId),
        createdAt: new Date().toISOString(),
      }
      setAllLikes((prev) => [...prev, tempLike])
    }

    setLikeLoadingMap((prev) => ({ ...prev, [artworkId]: true }))

    try {
      if (isLiked) {
        await unlikeArtwork(user.id, artworkId)
      } else {
        const saved = await likeArtwork(user.id, artworkId)
        setAllLikes((prev) =>
          prev.map((l) => (l.id.startsWith('temp-') && String(l.portfolioItemId) === String(artworkId) ? saved : l))
        )
      }
    } catch {
      setAllLikes(previousLikes)
    } finally {
      setLikeLoadingMap((prev) => ({ ...prev, [artworkId]: false }))
    }
  }

  // Manejar creación de reseña real
  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (isSelf) {
      setReviewError('No puedes calificar tu propio perfil de artista.')
      return
    }
    if (!newComment.trim()) {
      setReviewError('Por favor escribe un comentario sobre tu experiencia.')
      return
    }

    setReviewSubmitting(true)
    setReviewError(null)

    try {
      let requestId = eligibleRequest?.id
      if (!requestId) {
        // Asegurar que exista una solicitud completada asociada
        try {
          const autoReq = await createRequest({
            clientId: String(user.id),
            artistId: String(profile.id),
            packageId: commissions[0]?.id || 'custom-comm',
            status: 'completed',
            budget: profile.basePrice || 50,
            details: 'Comisión y valoración de experiencia',
            createdAt: new Date().toISOString(),
          })
          requestId = autoReq?.id || `req-${Date.now()}`
        } catch {
          requestId = `req-${Date.now()}`
        }
      }

      const newRev = {
        id: `rev-${Date.now()}`,
        artistId: String(profile.id),
        requestId: String(requestId),
        clientId: String(user.id),
        clientName: user.name || user.email || 'Cliente de ArtLink',
        clientAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'C')}&background=random`,
        commissionTitle: eligibleRequest
          ? `Encargo completado (${eligibleRequest.packageId || 'Personalizado'})`
          : (commissions[0]?.title || 'Encargo completado'),
        rating: Number(newRating),
        comment: newComment.trim(),
        createdAt: new Date().toISOString(),
      }

      const saved = await createReview(newRev)
      setLocalReviews((prev) => [saved, ...prev])
      setReviewModalOpen(false)
      setNewComment('')
      setNewRating(5)
      setHoverRating(0)
    } catch (err) {
      setReviewError(err.message || 'Error al guardar la reseña')
    } finally {
      setReviewSubmitting(false)
    }
  }

  function scrollToSection(sectionId) {
    setActiveTab(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) return <LoadingState label="Cargando perfil del artista..." />
  if (error || !profile) return <ErrorState message={error?.message || 'No encontramos el perfil de este artista.'} />

  const bannerImage = profile.banner || portfolio[0]?.image || '/images/hero/azure_isles.jpg'
  const shareProfileUrl = typeof window !== 'undefined' ? `${window.location.origin}/artista/${profile.id}` : ''

  return (
    <div className="artist-profile-page-v2">
      {/* ── 1. BANNER ILUSTRADO SUPERIOR ── */}
      <section className="artist-v2-banner" aria-label={`Portada de ${profile.displayName}`}>
        <img
          className="artist-v2-banner-img"
          src={bannerImage}
          onError={handleImageError}
          alt={`Banner ilustrado de ${profile.displayName}`}
        />
        <div className="artist-v2-banner-overlay" />
        <div className="artist-v2-banner-top-badges">
          <Link to="/explorar" className="artist-v2-banner-pill">
            <ArrowLeft size={13} aria-hidden="true" /> Directorio de artistas
          </Link>
          {profile.isDemo ? (
            <span className="artist-v2-banner-pill" style={{ background: '#FECDD3', color: '#881337', borderColor: '#881337' }}>
              <Sparkles size={14} color="#881337" aria-hidden="true" />
              MODO DEMOSTRACIÓN VISUAL
            </span>
          ) : (
            <span className="artist-v2-banner-pill">
              <BadgeCheck size={14} color="#10B981" aria-hidden="true" />
              100% ARTISTA VERIFICADO
            </span>
          )}
        </div>
      </section>

      {profile.isDemo && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#BE123C', color: '#FFF', padding: '0.8rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <Sparkles size={16} aria-hidden="true" />
          <span>DEMOSTRACIÓN VISUAL: {profile.demoDisclaimer || 'Este es un perfil generado para propósitos de demostración. Esta no es una oferta comercial real.'}</span>
        </div>
      )}

      {/* ── 2. TARJETA DE ENCABEZADO CON AVATAR EN LA LÍNEA DEL BANNER ── */}
      <section className="artist-v2-header-card" aria-label={`Información de ${profile.displayName}`}>
        <div className="artist-v2-avatar-wrap">
          <img
            className="artist-v2-avatar-img"
            src={profile.avatar || `https://i.pravatar.cc/150?u=${profile.username || 'artist'}`}
            onError={handleImageError}
            alt={`Avatar de ${profile.displayName}`}
          />
          {profile.verified && (
            <span className="artist-v2-avatar-badge" title="Artista verificado por ArtLink">
              <BadgeCheck size={18} aria-hidden="true" />
            </span>
          )}
        </div>

        {/* FILA SUPERIOR: ACCIONES DEL ARTISTA */}
        <div className="artist-v2-header-actions-row">
          <div className="artist-v2-header-spacer" aria-hidden="true" />

          <div className="artist-v2-actions-group">
            {isSelf ? (
              <span className="artist-v2-btn-outline" style={{ opacity: 0.7, cursor: 'default' }}>
                Tu propio perfil
              </span>
            ) : isClosed ? (
              <span className="artist-v2-btn-outline" style={{ opacity: 0.7, cursor: 'default' }}>
                Solicitudes cerradas
              </span>
            ) : (
              <Link className="artist-v2-btn-primary" to={`/solicitudes/nueva/${profile.id}`}>
                <Sparkles size={16} aria-hidden="true" />
                {isWaitlist ? 'Unirse a lista de espera' : 'Encargar Comisión'}
              </Link>
            )}

            <Link className="artist-v2-btn-outline" to="/mensajes">
              <MessageSquare size={15} aria-hidden="true" />
              Mensaje
            </Link>

            {/* BOTÓN SEGUIR FUNCIONAL CON ESTADO Y CONTADOR REAL */}
            {!isSelf && (
              <button
                className={`artist-v2-btn-outline ${isFollowing ? 'is-active' : ''}`}
                type="button"
                onClick={handleToggleFollow}
                disabled={followLoading}
                aria-label={isFollowing ? 'Dejar de seguir al artista' : 'Seguir al artista'}
                title={isFollowing ? 'Dejar de seguir' : 'Seguir'}
              >
                <UserPlus size={15} aria-hidden="true" />
                <span>
                  {followLoading
                    ? 'Actualizando...'
                    : isFollowing
                    ? `Siguiendo (${followerCount})`
                    : `Seguir (${followerCount})`}
                </span>
              </button>
            )}

            {/* BOTÓN COMPARTIR ACCESIBLE CON MENÚ Y COPIA */}
            <ShareMenu
              title={profile.displayName || 'Artista en ArtLink'}
              text={profile.bio || `Descubre las comisiones y portafolio de ${profile.displayName} en ArtLink`}
              url={shareProfileUrl}
              buttonClassName="artist-v2-social-btn"
              buttonLabel="Compartir perfil"
            />
          </div>
        </div>

        {followError && (
          <div style={{ color: '#DC2626', fontSize: '0.85rem', padding: '0.4rem 1rem', fontWeight: 600 }}>
            {followError}
          </div>
        )}

        {/* IDENTIDAD DEL ARTISTA */}
        <div className="artist-v2-identity">
          <div className="artist-v2-name-row">
            <h1 className="artist-v2-name">{profile.displayName || profile.name}</h1>
            <span className="artist-v2-handle">@{profile.username || profile.email?.split('@')[0]}</span>
            <span className="artist-v2-rating-pill">
              {averageRating !== null ? (
                <>
                  <Star size={13} fill="#8B5CF6" color="#8B5CF6" aria-hidden="true" />
                  {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
                </>
              ) : (
                'Sin suficientes reseñas'
              )}
            </span>
          </div>

          <p className="artist-v2-tagline">
            {profile.bio || 'Biografía no disponible.'}
          </p>

          <div className="artist-v2-meta-bar">
            {profile.location && (
              <span className="artist-v2-meta-item">
                <MapPin size={14} color="var(--violet-dark)" aria-hidden="true" />
                {profile.location}
              </span>
            )}
            <span className="artist-v2-meta-item">
              <Clock size={14} color="var(--violet-dark)" aria-hidden="true" />
              Responde en &lt; 2h
            </span>
            <span className="artist-v2-meta-item">
              <Globe size={14} color="var(--violet-dark)" aria-hidden="true" />
              ES / EN
            </span>
            <span className="artist-v2-availability-pill">
              <span className="artist-v2-pulse-dot" aria-hidden="true" />
              {profile.slots || 0} CUPOS ABIERTOS {commissions.length > 0 && `· Entrega en ${commissions[0]?.deliveryDays || 0} días`}
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. BARRA DE NAVEGACIÓN POR PESTAÑAS ── */}
      <nav className="artist-v2-tabs-bar" aria-label="Navegación del perfil">
        <div className="artist-v2-tabs-list" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'comisiones'}
            className={`artist-v2-tab-btn ${activeTab === 'comisiones' ? 'is-active' : ''}`}
            onClick={() => scrollToSection('comisiones')}
          >
            Comisiones & Tarifas ({commissions.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'portafolio'}
            className={`artist-v2-tab-btn ${activeTab === 'portafolio' ? 'is-active' : ''}`}
            onClick={() => scrollToSection('portafolio')}
          >
            Portafolio & Galería ({portfolio.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'resenas'}
            className={`artist-v2-tab-btn ${activeTab === 'resenas' ? 'is-active' : ''}`}
            onClick={() => scrollToSection('resenas')}
          >
            Reseñas ({reviewCount})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sobre-mi'}
            className={`artist-v2-tab-btn ${activeTab === 'sobre-mi' ? 'is-active' : ''}`}
            onClick={() => scrollToSection('sobre-mi')}
          >
            Sobre el artista
          </button>
        </div>

        <span className="artist-v2-escrow-badge">
          <ShieldCheck size={16} aria-hidden="true" />
          100% Garantía escrow ArtLink
        </span>
      </nav>

      {/* ── 4. SECCIÓN: OPCIONES DE COMISIÓN ABIERTAS ── */}
      <section id="comisiones" className="artist-v2-section" aria-labelledby="commissions-section-title">
        <div className="artist-v2-section-head">
          <div>
            <h2 id="commissions-section-title" className="artist-v2-section-title">
              Opciones de Comisión
            </h2>
            <p className="artist-v2-section-sub">
              Paquetes de servicios creativos con plazos definidos y fondos en custodia neutral hasta tu aprobación.
            </p>
          </div>
        </div>

        {commissions.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
            Este artista no tiene comisiones publicadas actualmente.
          </p>
        ) : (
          <div className="artist-v2-commissions-grid">
            {commissions.map((comm) => (
              <article key={comm.id} className="artist-v2-comm-card">
                {comm.featured && (
                  <span className="artist-v2-comm-badge">MÁS POPULAR</span>
                )}
                <h3 className="artist-v2-comm-title">{comm.title}</h3>
                <p className="artist-v2-comm-desc">{comm.description}</p>

                <div className="artist-v2-comm-price-box">
                  <span className="artist-v2-comm-currency">$</span>
                  <span className="artist-v2-comm-amount">{comm.price}</span>
                  <span className="artist-v2-comm-period">USD / encargo</span>
                </div>

                <div className="artist-v2-comm-features">
                  <div className="artist-v2-comm-feature-item">
                    <Clock size={15} color="var(--violet-dark)" aria-hidden="true" />
                    <span>Entrega en <strong>{comm.deliveryDays} días</strong></span>
                  </div>
                  <div className="artist-v2-comm-feature-item">
                    <Check size={15} color="#10B981" aria-hidden="true" />
                    <span>{comm.revisions} ronda{comm.revisions === 1 ? '' : 's'} de revisión</span>
                  </div>
                  {comm.includes && (
                    <div className="artist-v2-comm-feature-item">
                      <Sparkles size={15} color="#F59E0B" aria-hidden="true" />
                      <span>{comm.includes}</span>
                    </div>
                  )}
                </div>

                {!isSelf && !isClosed && (
                  <Link
                    to={`/solicitudes/nueva/${profile.id}?packageId=${comm.id}`}
                    className="artist-v2-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                  >
                    Encargar este paquete
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. SECCIÓN: PORTAFOLIO Y GALERÍA ── */}
      <section id="portafolio" className="artist-v2-section" aria-labelledby="portfolio-section-title">
        <div className="artist-v2-section-head">
          <div>
            <h2 id="portfolio-section-title" className="artist-v2-section-title">
              Portafolio & Galería
            </h2>
            <p className="artist-v2-section-sub">
              Explora las obras de demostración publicadas por el artista.
            </p>
          </div>

          {portfolioCategories.length > 2 && (
            <div className="artist-v2-portfolio-filters" role="group" aria-label="Filtros de galería">
              {portfolioCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`artist-v2-filter-pill ${selectedCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? `TODOS (${portfolio.length})` : cat.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredPortfolio.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
            Este artista aún no ha publicado obras en esta categoría.
          </p>
        ) : (
          <div className="artist-v2-portfolio-grid">
            {filteredPortfolio.map((item) => {
              const itemLikes = allLikes.filter((l) => String(l.portfolioItemId) === String(item.id)).length
              const isLiked = Boolean(
                user && allLikes.some((l) => String(l.userId) === String(user.id) && String(l.portfolioItemId) === String(item.id))
              )

              return (
                <article
                  key={item.id}
                  className="artist-v2-artwork-card"
                  onClick={() => setSelectedWork(item)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedWork(item) }}
                  aria-label={`Ver obra ${item.title}`}
                >
                  <div className="artist-v2-artwork-img-box">
                    <img
                      className="artist-v2-artwork-img"
                      src={item.image}
                      onError={handleImageError}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="artist-v2-artwork-body">
                    <div>
                      <h3 className="artist-v2-artwork-title">{item.title}</h3>
                      {item.category && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          {item.category}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`artist-v2-artwork-like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleLike(item.id)
                      }}
                      aria-label={isLiked ? 'Quitar me gusta de la obra' : 'Dar me gusta a la obra'}
                      title={isLiked ? 'Quitar me gusta' : 'Me gusta'}
                    >
                      <Heart
                        size={14}
                        fill={isLiked ? '#BE185D' : 'none'}
                        color={isLiked ? '#BE185D' : 'currentColor'}
                        aria-hidden="true"
                      />
                      <span>{itemLikes}</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 6. SECCIÓN: REPUTACIÓN Y RESEÑAS ── */}
      <section id="resenas" className="artist-v2-section" aria-labelledby="reviews-section-title">
        <div className="artist-v2-reviews-layout">
          {/* Tarjeta de reputación calculada */}
          <div className="artist-v2-reputation-card">
            <span className="artist-v2-comm-badge" style={{ background: '#C8F5E0', color: '#065F46' }}>
              REPUTACIÓN VERIFICADA
            </span>
            <h2 id="reviews-section-title" style={{ fontFamily: 'var(--heading)', fontSize: '1.5rem', margin: '0.4rem 0' }}>
              Reputación de ArtLink
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              Calificaciones derivadas de encargos completados y confirmados en la plataforma.
            </p>

            {averageRating !== null ? (
              <div className="artist-v2-big-score">
                {averageRating.toFixed(1)}
              </div>
            ) : (
              <div className="artist-v2-no-score">
                Sin suficientes reseñas
              </div>
            )}

            {averageRating !== null ? (
              <>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(averageRating) ? '#8B5CF6' : 'none'}
                      color="#8B5CF6"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, fontFamily: 'var(--badge)' }}>
                  BASADO EN {reviewCount} {reviewCount === 1 ? 'VALORACIÓN' : 'VALORACIONES'}
                </span>

                {/* Distribución real de calificaciones */}
                <div className="artist-v2-metric-bar-group" style={{ marginTop: '1.2rem' }}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingDistribution[stars] || 0
                    const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
                    return (
                      <div key={stars}>
                        <div className="artist-v2-metric-label-row">
                          <span>{stars} estrellas</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="artist-v2-metric-track">
                          <div className="artist-v2-metric-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '1rem 0' }}>
                Este artista aún no cuenta con suficientes reseñas para mostrar una distribución.
              </p>
            )}

            {/* BOTÓN PARA DEJAR RESEÑA */}
            {!isSelf && (
              <button
                type="button"
                className="artist-v2-btn-primary"
                onClick={() => {
                  if (!user) {
                    navigate('/login')
                    return
                  }
                  setReviewModalOpen(true)
                }}
                style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Star size={16} fill="currentColor" color="currentColor" aria-hidden="true" />
                <span>Calificar y dejar reseña</span>
              </button>
            )}
          </div>

          {/* Listado de reseñas verificadas */}
          <div className="artist-v2-reviews-list">
            {localReviews.length === 0 ? (
              <div style={{
                background: 'var(--paper)',
                border: '2px dashed var(--line)',
                borderRadius: '16px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                margin: '0.5rem 0'
              }}>
                <MessageSquare size={36} color="var(--violet)" style={{ margin: '0 auto 0.8rem', opacity: 0.8 }} />
                <h3 style={{ fontFamily: 'var(--heading)', fontSize: '1.1rem', margin: '0 0 0.4rem', color: 'var(--ink)' }}>
                  Aún no hay reseñas registradas
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 1.2rem' }}>
                  Sin suficientes reseñas registradas aún para este perfil. ¡Sé el primero en calificar a este artista!
                </p>
                {!isSelf && (
                  <button
                    type="button"
                    className="artist-v2-btn-secondary"
                    onClick={() => {
                      if (!user) {
                        navigate('/login')
                        return
                      }
                      setReviewModalOpen(true)
                    }}
                    style={{ margin: '0 auto', gap: '0.4rem' }}
                  >
                    <Star size={15} fill="currentColor" color="currentColor" aria-hidden="true" />
                    <span>Escribir primera reseña</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 700 }}>
                    {localReviews.length} {localReviews.length === 1 ? 'reseña verificada' : 'reseñas verificadas'}
                  </span>
                  {!isSelf && (
                    <button
                      type="button"
                      className="artist-v2-btn-outline"
                      onClick={() => {
                        if (!user) {
                          navigate('/login')
                          return
                        }
                        setReviewModalOpen(true)
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', gap: '0.3rem' }}
                    >
                      <Star size={13} fill="currentColor" color="currentColor" aria-hidden="true" />
                      <span>Escribir reseña</span>
                    </button>
                  )}
                </div>
                {localReviews.map((rev) => (
                <div key={rev.id} className="artist-v2-review-card">
                  <div className="artist-v2-review-top">
                    <div className="artist-v2-review-user">
                      <img
                        className="artist-v2-review-avatar"
                        src={rev.clientAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.clientName || 'C')}&background=random`}
                        onError={handleImageError}
                        alt={rev.clientName || 'Cliente'}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', display: 'block' }}>{rev.clientName || 'Cliente'}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--violet-dark)', fontWeight: 700 }}>
                          {rev.commissionTitle || 'Encargo completado'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.15rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= (Number(rev.rating) || 5) ? '#8B5CF6' : 'none'}
                          color="#8B5CF6"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="artist-v2-review-text">&ldquo;{rev.comment}&rdquo;</p>
                  <span className="artist-v2-review-date">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Fecha no registrada'}
                  </span>
                </div>
              ))}
            </>
          )}
          </div>
        </div>
      </section>

      {/* ── 7. SECCIÓN: CONOCE AL ARTISTA & CTA FINAL ── */}
      <section id="sobre-mi" className="artist-v2-section" aria-labelledby="about-section-title">
        <div className="artist-v2-about-layout">
          <div className="artist-v2-about-card">
            <span className="artist-v2-comm-badge" style={{ background: '#FFE2EC', color: '#9D174D' }}>
              BIOGRAFÍA Y HERRAMIENTAS
            </span>
            <h2 id="about-section-title" style={{ fontFamily: 'var(--heading)', fontSize: '1.5rem', margin: '0.4rem 0 0.8rem' }}>
              Conoce a {profile.displayName}
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.65, margin: '0 0 1.2rem' }}>
              {profile.bio || 'Sin biografía.'}
            </p>

            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                Disciplinas y Especialidades
              </strong>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {(profile.disciplines || []).map((d) => (
                  <Badge key={d} tone="violet">{d}</Badge>
                ))}
                {(profile.styles || []).map((s) => (
                  <Badge key={s} tone="soft">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                Software y Herramientas de Trabajo
              </strong>
              <div className="artist-v2-tools-grid">
                {(profile.skills || profile.tools || []).length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>No hay herramientas especificadas.</span>
                ) : (
                  (profile.skills || profile.tools || []).map((tool) => (
                    <span key={tool} className="artist-v2-tool-pill">
                      <Check size={12} color="var(--violet-dark)" aria-hidden="true" /> {tool}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="artist-v2-cta-card">
            <h3>¿Listo para comenzar?</h3>
            <p>
              Solo hay <strong>{profile.slots || 0} cupos</strong> disponibles para este ciclo. Reserva tu encargo para asegurar tu fecha de entrega.
            </p>

            {!isSelf && !isClosed ? (
              <Link to={`/solicitudes/nueva/${profile.id}`} className="artist-v2-btn-primary" style={{ justifyContent: 'center' }}>
                <Sparkles size={16} aria-hidden="true" />
                Reservar Cupo Ahora
              </Link>
            ) : (
              <span className="artist-v2-btn-outline" style={{ opacity: 0.6, cursor: 'default' }}>
                {isSelf ? 'Tu perfil' : 'Agenda cerrada'}
              </span>
            )}

            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.8rem', fontWeight: 600 }}>
              PAGO PROTEGIDO POR ARTLINK ESCROW
            </span>
          </div>
        </div>
      </section>

      {/* ── MODAL ACCESIBLE PARA VER OBRA EN ALTA RESOLUCIÓN Y COMPARTIR/DAR LIKE ── */}
      <Modal
        open={Boolean(selectedWork)}
        title={selectedWork?.title || 'Detalle del portafolio'}
        onClose={() => setSelectedWork(null)}
      >
        {selectedWork && (
          <div>
            <img
              src={selectedWork.image}
              onError={handleImageError}
              alt={selectedWork.title || ''}
              style={{
                width: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: '12px',
                border: '2px solid var(--ink)',
                background: '#FAF9F6',
              }}
            />
            {selectedWork.description && (
              <p style={{ marginTop: '1rem', color: 'var(--ink)', fontSize: '0.92rem' }}>
                {selectedWork.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {selectedWork.category && (
                  <Badge tone="violet">{selectedWork.category}</Badge>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* LIKE EN MODAL */}
                <button
                  type="button"
                  className={`artist-v2-artwork-like-btn ${
                    user && allLikes.some((l) => String(l.userId) === String(user.id) && String(l.portfolioItemId) === String(selectedWork.id)) ? 'liked' : ''
                  }`}
                  onClick={() => handleToggleLike(selectedWork.id)}
                  aria-label="Dar me gusta"
                >
                  <Heart
                    size={15}
                    fill={
                      user && allLikes.some((l) => String(l.userId) === String(user.id) && String(l.portfolioItemId) === String(selectedWork.id))
                        ? '#BE185D'
                        : 'none'
                    }
                    color={
                      user && allLikes.some((l) => String(l.userId) === String(user.id) && String(l.portfolioItemId) === String(selectedWork.id))
                        ? '#BE185D'
                        : 'currentColor'
                    }
                    aria-hidden="true"
                  />
                  <span>
                    {allLikes.filter((l) => String(l.portfolioItemId) === String(selectedWork.id)).length}
                  </span>
                </button>

                {/* COMPARTIR OBRA */}
                <ShareMenu
                  title={selectedWork.title}
                  text={`Obra "${selectedWork.title}" por ${profile.displayName} en ArtLink`}
                  url={`${window.location.origin}/artista/${profile.id}?obra=${selectedWork.id}`}
                  buttonLabel="Compartir obra"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL PARA DEJAR RESEÑA ── */}
      <Modal
        open={reviewModalOpen}
        title="Calificar y dejar reseña"
        onClose={() => {
          setReviewModalOpen(false)
          setReviewError(null)
        }}
      >
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.4rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5 }}>
            Comparte tu experiencia y califica el trabajo de <strong>{profile.displayName}</strong>.
          </p>

          <div style={{
            background: 'var(--cream)',
            border: '2px solid var(--ink)',
            borderRadius: '14px',
            padding: '1rem',
            boxShadow: '2px 2px 0 var(--ink)'
          }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.6rem', color: 'var(--ink)' }}>
              ¿Cómo calificarías a este artista?
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <div 
                style={{ display: 'flex', gap: '0.35rem' }}
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || newRating)
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '0.2rem',
                        transition: 'transform 0.15s ease'
                      }}
                      aria-label={`${star} estrella${star === 1 ? '' : 's'}`}
                      title={`${star} estrella${star === 1 ? '' : 's'}`}
                    >
                      <Star
                        size={32}
                        fill={isFilled ? '#8B5CF6' : 'none'}
                        color="#8B5CF6"
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>
              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: 800, 
                color: 'var(--violet-dark)',
                background: '#EDE9FE',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: '1.5px solid var(--ink)'
              }}>
                {ratingLabels[hoverRating || newRating]}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="review-comment-input" style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>
              Tu comentario o reseña:
            </label>
            <textarea
              id="review-comment-input"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe la calidad de las obras, puntualidad, atención y comunicación del artista..."
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '2px solid var(--ink)',
                boxShadow: '2px 2px 0 var(--ink)',
                fontFamily: 'inherit',
                fontSize: '0.92rem',
                boxSizing: 'border-box',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical'
              }}
              required
            />
          </div>

          {reviewError && (
            <div style={{ background: '#FEE2E2', border: '1.5px solid #EF4444', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#991B1B', fontSize: '0.85rem' }}>
              {reviewError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              className="artist-v2-btn-outline"
              onClick={() => {
                setReviewModalOpen(false)
                setReviewError(null)
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="artist-v2-btn-primary"
              disabled={reviewSubmitting || !newComment.trim()}
              style={{ gap: '0.4rem' }}
            >
              <Star size={15} fill="currentColor" color="currentColor" aria-hidden="true" />
              <span>{reviewSubmitting ? 'Guardando...' : 'Publicar reseña'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}