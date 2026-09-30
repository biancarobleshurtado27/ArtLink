import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Star,
  ShieldCheck,
  Heart,
  MessageSquare,
  UserPlus,
  Lock,
  RefreshCw,
  FileCheck,
  Globe,
  Share2,
  Check,
} from 'lucide-react'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import useArtistProfile from '../hooks/useArtistProfile'
import useAuth from '../hooks/useAuth'
import { handleImageError } from '../utils/imageFallback'



export default function ArtistProfilePage() {
  const { id } = useParams()
  const { profile, portfolio = [], commissions = [], reviews = [], loading, error } = useArtistProfile(id)
  const { user } = useAuth()

  // Estados interactivos locales
  const [activeTab, setActiveTab] = useState('comisiones')
  const [selectedWork, setSelectedWork] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFollowing, setIsFollowing] = useState(false)
  const [likedArtworks, setLikedArtworks] = useState({})
  const [copiedLink, setCopiedLink] = useState(false)

  // Comprobar si el usuario conectado es el propio artista
  const isSelf = Boolean(
    user && (
      user.id === profile?.userId ||
      user.id === profile?.id ||
      (user.email && user.email === profile?.userEmail) ||
      (user.username && user.username === profile?.username)
    )
  )

  const isClosed = profile?.availability === 'closed'
  const isWaitlist = profile?.availability === 'waitlist'

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

  const displayedReviews = useMemo(() => {
    return reviews.map((r, idx) => ({
      id: r.id || `rev-db-${idx}`,
      clientName: r.clientName || 'Cliente ArtLink Verificado',
      clientAvatar: r.clientAvatar || `https://i.pravatar.cc/150?img=${40 + (idx % 25)}`,
      commissionTitle: r.commissionTitle || 'Comisión Verificada con Custodia Escrow',
      rating: r.rating || 5,
      comment: r.comment,
      timeAgo: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Completado recientemente',
    }))
  }, [reviews])

  function toggleLike(artworkId) {
    setLikedArtworks((prev) => ({ ...prev, [artworkId]: !prev[artworkId] }))
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
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

  // Banner: usa el banner personalizado del artista, o la primera obra de su portafolio, o el paisaje local
  const bannerImage = profile.banner || portfolio[0]?.image || '/images/hero/azure_isles.jpg'

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
        {/* ICONO CIRCULAR INTERSECTANDO EL BANNER Y LA PÁGINA (ESTILO CHÉRISI) */}
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

        {/* FILA SUPERIOR: ESPACIO PARA EL AVATAR Y BOTONES DE ACCIÓN */}
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

            <button
              className="artist-v2-btn-outline"
              type="button"
              onClick={() => setIsFollowing((prev) => !prev)}
              aria-label={isFollowing ? 'Dejar de seguir' : 'Seguir artista'}
            >
              <UserPlus size={15} aria-hidden="true" />
              {isFollowing ? 'Siguiendo (4.2k)' : 'Seguir (4.1k)'}
            </button>

            <button
              className="artist-v2-social-btn"
              type="button"
              onClick={handleShare}
              title="Copiar enlace del perfil"
              aria-label="Compartir perfil"
            >
              {copiedLink ? <Check size={14} color="#059669" /> : <Share2 size={14} />}
            </button>

            {profile.socialLinks && Object.entries(profile.socialLinks).map(([network, url]) => (
              <a
                key={network}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="artist-v2-social-btn"
                title={`Ver en ${network}`}
                aria-label={`Enlace a ${network}`}
              >
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* IDENTIDAD DEL ARTISTA */}
        <div className="artist-v2-identity">
          <div className="artist-v2-name-row">
            <h1 className="artist-v2-name">{profile.displayName || profile.name}</h1>
            <span className="artist-v2-handle">@{profile.username || profile.email?.split('@')[0]}</span>
            <span className="artist-v2-rating-pill">
              <Star size={13} fill="#8B5CF6" color="#8B5CF6" aria-hidden="true" />
              {profile.rating ? profile.rating.toFixed(1) : 'Sin calificación'} ({displayedReviews.length} reseñas)
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
            Reseñas ({displayedReviews.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'proceso'}
            className={`artist-v2-tab-btn ${activeTab === 'proceso' ? 'is-active' : ''}`}
            onClick={() => scrollToSection('proceso')}
          >
            Términos & Proceso
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
              Opciones de Comisión Abiertas
            </h2>
            <p className="artist-v2-section-sub">
              Selecciona el tipo de encargo que mejor se adapte a tu proyecto personal o comercial.
            </p>
          </div>
          <Badge tone="soft">MONEDA: USD ($)</Badge>
        </div>

        {commissions.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
            Este artista no tiene paquetes de comisión activos en este momento.
          </p>
        ) : (
          <div className="artist-v2-commissions-grid">
            {commissions.map((commission, idx) => {
              const isPopular = idx === 1 || commission.featured
              const thumb = portfolio[idx]?.image || bannerImage

              return (
                <div key={commission.id} className="artist-v2-comm-card">
                  <span className={`artist-v2-comm-badge ${isPopular ? 'popular' : ''}`}>
                    {isPopular ? 'MÁS POPULAR' : (commission.category || 'ENCARGO PERSONALIZADO')}
                  </span>

                  <div className="artist-v2-comm-thumb">
                    <img src={thumb} onError={handleImageError} alt={commission.title} />
                  </div>

                  <h3 className="artist-v2-comm-title">{commission.title}</h3>
                  <p className="artist-v2-comm-desc">{commission.description}</p>

                  <div className="artist-v2-comm-specs">
                    <div className="artist-v2-comm-spec-row">
                      <span className="artist-v2-comm-spec-label">
                        <Clock size={13} aria-hidden="true" /> Tiempo:
                      </span>
                      <span className="artist-v2-comm-spec-value">
                        {commission.deliveryDays} días hábiles
                      </span>
                    </div>
                    <div className="artist-v2-comm-spec-row">
                      <span className="artist-v2-comm-spec-label">
                        <RefreshCw size={13} aria-hidden="true" /> Revisiones:
                      </span>
                      <span className="artist-v2-comm-spec-value">
                        {commission.revisions || 2} en fase de boceto
                      </span>
                    </div>
                    <div className="artist-v2-comm-spec-row">
                      <span className="artist-v2-comm-spec-label">
                        <FileCheck size={13} aria-hidden="true" /> Archivos:
                      </span>
                      <span className="artist-v2-comm-spec-value">
                        {commission.includes || 'PNG 3000px + Transparente'}
                      </span>
                    </div>
                  </div>

                  <div className="artist-v2-comm-price-row">
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                      Precio base:
                    </span>
                    <strong className="artist-v2-comm-price">${commission.price} USD</strong>
                  </div>

                  {!isSelf && !isClosed ? (
                    <Link
                      to={`/solicitudes/nueva/${profile.id}?commissionId=${commission.id}`}
                      className="artist-v2-comm-order-btn"
                    >
                      Pedir este formato
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span
                      className="artist-v2-comm-order-btn"
                      style={{ opacity: 0.6, cursor: 'not-allowed', background: '#9CA3AF' }}
                    >
                      {isSelf ? 'Tu paquete' : 'No disponible'}
                    </span>
                  )}

                  <span className="artist-v2-comm-escrow-note">
                    <Lock size={12} aria-hidden="true" />
                    Fondos protegidos en Escrow
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 5. SECCIÓN: GALERÍA DE ILUSTRACIONES (PORTAFOLIO) ── */}
      <section id="portafolio" className="artist-v2-section" aria-labelledby="portfolio-section-title">
        <div className="artist-v2-section-head">
          <div>
            <h2 id="portfolio-section-title" className="artist-v2-section-title">
              Galería de Ilustraciones
            </h2>
            <p className="artist-v2-section-sub">
              Explora trabajos recientes realizados por {profile.displayName}.
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
              const isLiked = likedArtworks[item.id]
              const displayLikes = (item.likes || 12) + (isLiked ? 1 : 0)

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
                        toggleLike(item.id)
                      }}
                      aria-label="Dar me gusta a la obra"
                    >
                      <Heart size={14} fill={isLiked ? '#BE185D' : 'none'} color={isLiked ? '#BE185D' : 'currentColor'} />
                      <span>{displayLikes}</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 6. SECCIÓN: REPUTACIÓN IMPECABLE Y RESEÑAS ── */}
      <section id="resenas" className="artist-v2-section" aria-labelledby="reviews-section-title">
        <div className="artist-v2-reviews-layout">
          {/* Tarjeta de métricas y resumen */}
          <div className="artist-v2-reputation-card">
            <span className="artist-v2-comm-badge" style={{ background: '#C8F5E0', color: '#065F46' }}>
              100% OPINIONES REALES
            </span>
            <h2 id="reviews-section-title" style={{ fontFamily: 'var(--heading)', fontSize: '1.5rem', margin: '0.4rem 0' }}>
              Reputación Impecable
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              Todas las calificaciones provienen de transacciones con custodia Escrow y entrega final aceptada.
            </p>

            <div className="artist-v2-big-score">
              {profile.rating ? profile.rating.toFixed(1) : '0.0'}
            </div>

            <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} fill="#8B5CF6" color="#8B5CF6" aria-hidden="true" />
              ))}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, fontFamily: 'var(--badge)' }}>
              BASADO EN {displayedReviews.length} VALORACIONES
            </span>

            <div className="artist-v2-metric-bar-group">
              <div>
                <div className="artist-v2-metric-label-row">
                  <span>Puntualidad en entrega</span>
                  <span>100%</span>
                </div>
                <div className="artist-v2-metric-track">
                  <div className="artist-v2-metric-fill" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="artist-v2-metric-label-row">
                  <span>Claridad en la comunicación</span>
                  <span>98%</span>
                </div>
                <div className="artist-v2-metric-track">
                  <div className="artist-v2-metric-fill purple" style={{ width: '98%' }} />
                </div>
              </div>

              <div>
                <div className="artist-v2-metric-label-row">
                  <span>Fidelidad al brief original</span>
                  <span>100%</span>
                </div>
                <div className="artist-v2-metric-track">
                  <div className="artist-v2-metric-fill" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Listado de reseñas verificadas */}
          <div className="artist-v2-reviews-list">
            {displayedReviews.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: 'var(--muted)', marginTop: '2rem' }}>Aún no hay suficientes datos para generar este ranking.</p>
            ) : (
              displayedReviews.map((rev) => (
                <div key={rev.id} className="artist-v2-review-card">
                  <div className="artist-v2-review-top">
                    <div className="artist-v2-review-user">
                      <img
                        className="artist-v2-review-avatar"
                        src={rev.clientAvatar}
                        onError={handleImageError}
                        alt={rev.clientName}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', display: 'block' }}>{rev.clientName}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--violet-dark)', fontWeight: 700 }}>
                          {rev.commissionTitle}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.15rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= rev.rating ? '#8B5CF6' : 'none'}
                          color="#8B5CF6"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="artist-v2-review-text">&ldquo;{rev.comment}&rdquo;</p>
                  <span className="artist-v2-review-date">{rev.timeAgo}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 7. SECCIÓN: PROCESO DE TRABAJO & SEGURIDAD ESCROW ── */}
      <section id="proceso" className="artist-v2-section" aria-labelledby="workflow-section-title">
        <div className="artist-v2-workflow-layout">
          {/* Paso a paso con el artista */}
          <div className="artist-v2-workflow-card">
            <span className="artist-v2-comm-badge" style={{ background: '#EDE9FE', color: 'var(--violet-dark)' }}>
              PASO A PASO TRANSPARENTE
            </span>
            <h2 id="workflow-section-title" style={{ fontFamily: 'var(--heading)', fontSize: '1.5rem', margin: '0.4rem 0' }}>
              Proceso de Trabajo con {profile.displayName}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
              Cada encargo avanza de manera organizada para que siempre tengas el control del resultado.
            </p>

            <div className="artist-v2-step-list">
              <div className="artist-v2-step-item">
                <span className="artist-v2-step-num">1</span>
                <div className="artist-v2-step-content">
                  <strong>Envío de Brief y Referencias</strong>
                  <p>Describe tu idea, adjunta imágenes de muestra, expresiones y paleta de color deseada.</p>
                </div>
              </div>

              <div className="artist-v2-step-item">
                <span className="artist-v2-step-num">2</span>
                <div className="artist-v2-step-content">
                  <strong>Boceto y Composición</strong>
                  <p>El artista comparte los primeros bocetos para validar poses y proporciones antes de continuar.</p>
                </div>
              </div>

              <div className="artist-v2-step-item">
                <span className="artist-v2-step-num">3</span>
                <div className="artist-v2-step-content">
                  <strong>Color final y Renderizado</strong>
                  <p>Pintura detallada, efectos de luz y texturas según las indicaciones acordadas.</p>
                </div>
              </div>

              <div className="artist-v2-step-item">
                <span className="artist-v2-step-num">4</span>
                <div className="artist-v2-step-content">
                  <strong>Aprobación final y Liberación</strong>
                  <p>Descargas los archivos en máxima resolución y liberas los fondos retenidos en Escrow.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de fondos seguros Escrow */}
          <div className="artist-v2-escrow-card">
            <span
              className="artist-v2-comm-badge"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', borderColor: '#FFFFFF' }}
            >
              ESCROW SHIELD ARTLINK
            </span>
            <h3>Tus fondos siempre 100% a salvo</h3>
            <p>
              Protegemos a clientes y artistas independientes en cada encargo mediante custodia neutral.
            </p>

            <div className="artist-v2-escrow-benefits">
              <div className="artist-v2-benefit-item">
                <div className="artist-v2-benefit-icon">
                  <ShieldCheck size={18} color="#FFFFFF" aria-hidden="true" />
                </div>
                <div className="artist-v2-benefit-text">
                  <strong>Custodia Segura</strong>
                  <p>El dinero no se entrega al artista hasta que tú apruebes la entrega definitiva.</p>
                </div>
              </div>

              <div className="artist-v2-benefit-item">
                <div className="artist-v2-benefit-icon">
                  <RefreshCw size={18} color="#FFFFFF" aria-hidden="true" />
                </div>
                <div className="artist-v2-benefit-text">
                  <strong>Garantía de Reembolso</strong>
                  <p>Si el artista no entrega a tiempo o según lo pactado, tu dinero queda protegido.</p>
                </div>
              </div>

              <div className="artist-v2-benefit-item">
                <div className="artist-v2-benefit-icon">
                  <FileCheck size={18} color="#FFFFFF" aria-hidden="true" />
                </div>
                <div className="artist-v2-benefit-text">
                  <strong>Contrato Digital Automático</strong>
                  <p>Términos claros de uso personal o comercial acordados antes de comenzar.</p>
                </div>
              </div>
            </div>

            <div className="artist-v2-escrow-footer">
              <span style={{ fontSize: '0.8rem', color: '#EDE9FE' }}>¿Dudas sobre el encargo?</span>
              <Link to="/mensajes" className="artist-v2-btn-white">
                <MessageSquare size={14} aria-hidden="true" />
                Chatear con el artista
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SECCIÓN: CONOCE AL ARTISTA & CTA FINAL ── */}
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

      {/* ── MODAL ACCESIBLE PARA VER OBRA EN ALTA RESOLUCIÓN ── */}
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
                maxHeight: '65vh',
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
            {selectedWork.category && (
              <Badge tone="violet" style={{ marginTop: '0.5rem' }}>
                {selectedWork.category}
              </Badge>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}