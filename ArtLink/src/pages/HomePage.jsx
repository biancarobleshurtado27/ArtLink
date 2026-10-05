import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Search,
  Sparkles,
  ShieldCheck,
  Lock,
  Eye,
  CheckCircle2,
  ShoppingBag,
  Palette,
  Star,
} from 'lucide-react'
import DecorativeStar from '../components/DecorativeStar'
import FloatingStars from '../components/FloatingStars'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import useDiscoverData from '../hooks/useDiscoverData'
import { handleImageError } from '../utils/imageFallback'
import { RANKING_EMPTY_MESSAGE } from '../utils/discoverData'

const CREATOR_STATUS_CLASS = {
  open: 'status-open',
  waitlist: 'status-waitlist',
  closed: 'status-review',
  unknown: 'status-review',
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('all')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [activeOrbitIndex, setActiveOrbitIndex] = useState(1)
  const [isPausedOrbit, setIsPausedOrbit] = useState(false)
  const navigate = useNavigate()
  const {
    categoryOptions,
    ranking,
    metrics: platformMetrics,
    showcaseCards: dailyCards,
    loading,
    error,
    reload,
  } = useDiscoverData()

  // Ventana movil de creadores destacados construida sobre el ranking real
  const featuredCreators = useMemo(() => {
    if (ranking.length === 0) return []
    const start = ranking.length <= 3 ? 0 : carouselIndex % ranking.length
    return [...ranking.slice(start, start + 3), ...ranking.slice(0, start)].slice(0, 3)
  }, [ranking, carouselIndex])

  const popularCategories = useMemo(
    () => categoryOptions.filter((category) => category.id !== 'all').slice(0, 6),
    [categoryOptions]
  )

  const quickChips = popularCategories.slice(0, 6)

  // Rotacion circular automatica entre las tarjetas cada 4 segundos
  useEffect(() => {
    if (isPausedOrbit || dailyCards.length === 0) return
    const timer = setInterval(() => {
      setActiveOrbitIndex((prev) => (prev + 1) % dailyCards.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isPausedOrbit, dailyCards.length])

  const handlePrevCreators = () => {
    if (ranking.length <= 3) return
    setCarouselIndex((carouselIndex - 3 + ranking.length) % ranking.length)
  }

  const handleNextCreators = () => {
    if (ranking.length <= 3) return
    setCarouselIndex((carouselIndex + 3) % ranking.length)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (area !== 'all') params.set('categoria', area)
    navigate(`/explorar?${params.toString()}`)
  }

  return (
    <div className="home-container">
      {/* ── 1. HERO PRINCIPAL ── */}
      <section className="hero-landing" aria-labelledby="hero-main-title">
        {/* Destellos / Estrellitas flotantes con movimiento suave */}
        <FloatingStars variant="hero" inline={true} />

        <div className="hero-landing-content">
          {/* Top Stickers */}
          <div className="hero-stickers-row">
            <span className="hero-landing-sticker sticker-white">
              <span className="sticker-bullet"><DecorativeStar size={11} color="currentColor" /></span> LA VITRINA PARA ARTISTAS DIGITALES
            </span>
            <span className="hero-landing-sticker sticker-pink">
              <span className="sticker-bullet"><DecorativeStar size={11} color="currentColor" /></span> COMISIONES 100% SEGURAS
            </span>
          </div>

          {/* Main Title */}
          <h1 id="hero-main-title" className="hero-title-main">
            El punto de encuentro entre artistas<br />
            únicos y <span className="highlight-purple">encargos memorables</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-main">
            Descubre ilustradores, modeladores 3D, animadores y creadores de avatares.<br />
            Revisa tarifas claras, cupos activos y encargos personalizados con<br />
            protección de fondos en custodia.
          </p>

          {/* Search Box */}
          <form className="hero-search-capsule" onSubmit={handleSearchSubmit} role="search">
            <div className="search-select-wrapper">
              <Crosshair size={17} className="search-icon-crosshair" aria-hidden="true" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                aria-label="Seleccionar área"
              >
                <option value="all">Todas las áreas</option>
                {popularCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="search-chevron" aria-hidden="true" />
            </div>

            <div className="search-capsule-divider" aria-hidden="true" />

            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-glass" aria-hidden="true" />
              <input
                type="text"
                placeholder="¿Qué estás buscando? Ej. Cyberpunk"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar creadores o estilos"
              />
            </div>

            <button type="submit" className="hero-search-btn">
              Buscar Artista
            </button>
          </form>

          {/* Quick Trends */}
          <div className="hero-trends-row">
            <span className="trends-label">Explorar por:</span>
            {quickChips.length > 0 ? (
              quickChips.map((category) => (
                <Link
                  key={category.id}
                  to={`/explorar?categoria=${encodeURIComponent(category.id)}`}
                  className="trend-tag"
                >
                  #{category.label.replace(/\s+/g, '')}
                </Link>
              ))
            ) : (
              <span className="trends-label">{RANKING_EMPTY_MESSAGE}</span>
            )}
          </div>

          {/* 4 Metric Cards */}
          <div className="hero-metrics-grid" aria-label="Métricas de la plataforma">
            {platformMetrics.map((m) => (
              <div key={m.id} className="hero-metric-card">
                <div className={`metric-icon-box icon-${m.icon}`}>
                  {m.icon === 'purple' && <Sparkles size={18} />}
                  {m.icon === 'green' && <ShieldCheck size={18} />}
                  {m.icon === 'pink' && <Lock size={18} />}
                  {m.icon === 'yellow' && <Star size={18} fill="#D97706" color="#D97706" />}
                </div>
                <div className="metric-text-box">
                  <strong>{m.number ?? '—'}</strong>
                  <span>{m.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hero 3 Showcase Carousel (Rotación circular 3D: Una ilustración + Nombre de artista + Categoría) */}
          <div
            className="hero-rotating-carousel-stage"
            onMouseEnter={() => setIsPausedOrbit(true)}
            onMouseLeave={() => setIsPausedOrbit(false)}
            onTouchStart={() => setIsPausedOrbit(true)}
            onTouchEnd={() => setIsPausedOrbit(false)}
            aria-label="Carrusel circular de artistas destacados del día"
          >
            {loading && <LoadingState label="Cargando.obras destacadas" />}
            {!loading && error && <ErrorState message={error.message} onRetry={reload} />}
            {!loading && !error && dailyCards.length === 0 && (
              <p className="section-subtitle-text">{RANKING_EMPTY_MESSAGE}</p>
            )}
            {!loading && !error && dailyCards.map((card, idx) => {
              // Calcular posición en el círculo respecto a activeOrbitIndex
              const diff = (idx - activeOrbitIndex + dailyCards.length) % dailyCards.length
              const orbitClass =
                diff === 0
                  ? 'card-orbit-center'
                  : diff === 1
                  ? 'card-orbit-right'
                  : 'card-orbit-left'
              const isCenter = diff === 0

              return (
                <div
                  key={card.id}
                  className={`hero-orbit-card ${orbitClass}`}
                  onClick={() => {
                    if (!isCenter) setActiveOrbitIndex(idx)
                  }}
                  style={{ cursor: isCenter ? 'default' : 'pointer' }}
                  title={!isCenter ? 'Haz clic para traer esta tarjeta al frente' : undefined}
                >
                  <span className={`card-washi-tape ${card.tapeClass}`} aria-hidden="true" />

                  {/* Marco de la Ilustración: 1 sola obra destacada, amplia y limpia */}
                  <div className="showcase-card-inner showcase-card-clean">
                    {isCenter ? (
                      <Link
                        to={`/artista/${card.artistId}`}
                        className="showcase-main-img-wrap showcase-clickable-art"
                        title={`Ver perfil y portafolio de ${card.artistName}`}
                      >
                        <img
                          src={card.image}
                          alt={card.workTitle || card.artistName}
                          className="showcase-main-img"
                          onError={handleImageError}
                        />
                        <span className="showcase-art-hover-overlay">
                          <span>Ver portafolio</span>
                        </span>
                      </Link>
                    ) : (
                      <div className="showcase-main-img-wrap">
                        <img
                          src={card.image}
                          alt={card.workTitle || card.artistName}
                          className="showcase-main-img"
                          onError={handleImageError}
                        />
                      </div>
                    )}
                  </div>

                  {/* Datos del Cuadro: Solo Categoría + Nombre del Artista */}
                  <div className="showcase-card-clean-footer">
                    <div className="showcase-clean-meta-row">
                      <span className={`badge-pill ${card.badgeClass}`}>
                        {card.category}
                      </span>
                    </div>

                    <h3 className="showcase-clean-artist">
                      {isCenter ? (
                        <Link to={`/artista/${card.artistId}`} className="showcase-artist-link">
                          {card.artistName}
                        </Link>
                      ) : (
                        <span>{card.artistName}</span>
                      )}
                    </h3>

                    {card.workTitle && (
                      <p className="showcase-clean-work-title">
                        «{card.workTitle}»
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 2. SECCIÓN ¿CÓMO FUNCIONA ARTLINK? ── */}
      <section className="section-how-works" aria-labelledby="how-works-title">
        <div className="section-content-centered">
          <div className="section-header-block">
            <span className="section-pill-tag tag-purple">
              <DecorativeStar size={11} color="currentColor" /> FLUJO TRANSPARENTE
            </span>
            <h2 id="how-works-title" className="section-title-large">
              ¿Cómo Funciona ArtLink?
            </h2>
            <p className="section-subtitle-text">
              Eliminamos la incertidumbre de los encargos en línea con un proceso estructurado y protegido en cada paso.
            </p>
          </div>

          <div className="home-steps-grid">
            {/* Paso 01 */}
            <div className="home-step-card">
              <span className="home-step-badge badge-step-1">01</span>
              <div className="home-step-top-bar bar-purple" />
              <div className="home-step-header">
                <div className="home-step-icon-round icon-purple">
                  <Eye size={20} />
                </div>
              </div>
              <h3 className="home-step-title">Explora y Elige</h3>
              <p className="home-step-desc">
                Revisa portafolios verificados con disponibilidad real, tiempos de entrega garantizados y las referencias públicas sin presuponer sorpresas.
              </p>
              <div className="home-step-footer-badge">
                <span className="pill-mint-border"><DecorativeStar size={11} color="currentColor" /> Filtros por funcionalidad</span>
              </div>
            </div>

            {/* Paso 02 */}
            <div className="home-step-card">
              <span className="home-step-badge badge-step-2">02</span>
              <div className="home-step-top-bar bar-pink" />
              <div className="home-step-header">
                <div className="home-step-icon-round icon-pink">
                  <Lock size={20} />
                </div>
              </div>
              <h3 className="home-step-title">Brief & Fondos en Custodia</h3>
              <p className="home-step-desc">
                Envía tus referencias visuales y deposita el pago en el sistema <strong>Escrow Shield</strong>. El dinero no se libera al artista hasta que sus fondos ya están asegurados.
              </p>
              <div className="home-step-footer-badge">
                <span className="pill-pink-border"><DecorativeStar size={11} color="currentColor" /> Pagos 100% Blindados</span>
              </div>
            </div>

            {/* Paso 03 */}
            <div className="home-step-card">
              <span className="home-step-badge badge-step-3">03</span>
              <div className="home-step-top-bar bar-mint" />
              <div className="home-step-header">
                <div className="home-step-icon-round icon-mint">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <h3 className="home-step-title">Feedback & Entrega en Alta</h3>
              <p className="home-step-desc">
                Aprueba bocetos por etapas, realiza correcciones sobre el paso a paso y descarga los archivos finales en máxima resolución antes de liberar el pago.
              </p>
              <div className="home-step-footer-badge">
                <span className="pill-lavender-border"><DecorativeStar size={11} color="currentColor" /> Archivos PSD / PNG / 3D</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SECCIÓN CATEGORÍAS POPULARES ── */}
      <section className="section-popular-categories" aria-labelledby="cat-popular-title">
        <div className="section-content-centered">
          <div className="section-header-row">
            <div>
              <span className="section-pill-tag tag-mint">
                <DecorativeStar size={11} color="currentColor" /> CATÁLOGO ABIERTO
              </span>
              <h2 id="cat-popular-title" className="section-title-large">
                Categorías Populares
              </h2>
              <p className="section-subtitle-text">
                {categoryOptions.length > 1
                  ? `${categoryOptions.length - 1} categorías activas con obras publicadas por la comunidad.`
                  : 'Todavía no hay categorías con obras publicadas.'}
              </p>
            </div>
            <Link to="/explorar" className="header-action-link">
              Ver Todas las Disciplinas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="categories-grid">
            {popularCategories.length === 0 ? (
              <p className="section-subtitle-text">{RANKING_EMPTY_MESSAGE}</p>
            ) : (
              popularCategories.map((cat) => (
                <Link
                  to={`/explorar?categoria=${encodeURIComponent(cat.id)}`}
                  className="category-card"
                  key={cat.id}
                >
                  <div className="category-img-container">
                    <span className="category-count-pill">
                      {cat.artistCount} {cat.artistCount === 1 ? 'Creador' : 'Creadores'}
                    </span>
                    {cat.cover && <img src={cat.cover} alt={cat.label} onError={handleImageError} />}
                  </div>
                  <div className="category-body">
                    <div className="category-text">
                      <h3 className="category-name">{cat.label}</h3>
                      <p className="category-sub">{cat.count} obras publicadas</p>
                    </div>
                    <span className="category-arrow-btn">
                      <ChevronRight size={18} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 4. CREADORES DESTACADOS DEL MES ── */}
      <section className="section-featured-creators" aria-labelledby="creators-title">
        <FloatingStars variant="header" />
        <div className="section-content-centered">
          <div className="section-header-block">
            <span className="section-pill-tag tag-pink">
              <DecorativeStar size={11} color="currentColor" /> ARTISTAS DESTACADOS
            </span>
            <h2 id="creators-title" className="section-title-large">
              Creadores Destacados del Mes
            </h2>
            <p className="section-subtitle-text">
              Ordenados por valoración, encargos completados y portfolio publicado.
            </p>
            <div className="carousel-nav-btns" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.2rem', gap: '0.6rem' }}>
              <button
                className="carousel-btn"
                aria-label="Anterior"
                type="button"
                disabled={ranking.length <= 3}
                onClick={handlePrevCreators}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="carousel-btn"
                aria-label="Siguiente"
                type="button"
                disabled={ranking.length <= 3}
                onClick={handleNextCreators}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="creators-grid">
            {featuredCreators.length === 0 ? (
              <p className="section-subtitle-text">{RANKING_EMPTY_MESSAGE}</p>
            ) : (
              featuredCreators.map((creator) => {
                const name = creator.displayName || creator.name
                const thumbnails = creator.works.filter((work) => work.image).slice(0, 3)
                return (
                  <div key={creator.id} className="creator-item-card">
                    <div className="creator-header">
                      {creator.avatar && (
                        <img src={creator.avatar} alt={name} className="creator-avatar" onError={handleImageError} />
                      )}
                      <div className="creator-info">
                        <div className="creator-name-line">
                          <strong className="creator-name">{name}</strong>
                          {creator.verified && <BadgeCheck size={16} className="creator-badge-check" aria-label="Artista destacado" />}
                        </div>
                        <span className="creator-handle">
                          @{creator.username} · {(creator.disciplines || []).join(' · ')}
                        </span>
                        <span className={`creator-status-pill ${CREATOR_STATUS_CLASS[creator.availability.tone]}`}>
                          {creator.availability.label}
                        </span>
                      </div>
                    </div>

                    {creator.bio && <p className="creator-bio-text">{creator.bio}</p>}

                    {thumbnails.length > 0 && (
                      <div className="creator-thumbs-grid">
                        {thumbnails.map((thumb) => (
                          <img key={thumb.id} src={thumb.image} alt={`Obra de ${name}`} onError={handleImageError} />
                        ))}
                      </div>
                    )}

                    <div className="creator-card-bottom">
                      <div>
                        <span className="creator-price-label">Tarifa base</span>
                        <strong className="creator-price-val">
                          {creator.basePrice > 0 ? `Desde $${creator.basePrice} USD` : 'Sin tarifa publicada'}
                        </strong>
                      </div>
                      <Link to={`/artista/${creator.id}`} className="creator-profile-btn">
                        Ver perfil
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* ── 5. SECCIÓN ESCROW SHIELD (TRANQUILIDAD TOTAL) ── */}
      <section className="section-escrow-trust" aria-labelledby="escrow-title">
        <div className="escrow-big-container">
          <div className="escrow-text-column">
            <span className="section-pill-tag tag-mint">
              <DecorativeStar size={11} color="currentColor" /> ESCROW SHIELD™
            </span>
            <h2 id="escrow-title" className="escrow-title-text">
              Tranquilidad total tanto para quienes compran como para quienes crean.
            </h2>
            <p className="escrow-desc-text">
              Tu dinero nunca va directamente al artista hasta que tú apruebes la entrega final. Y el artista trabaja sabiendo con certeza matemática que los fondos están ya asegurados en nuestra custodia neutral.
            </p>

            <ul className="escrow-bullets-list">
              <li>
                <div className="escrow-check-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <strong>Sin contratiempos:</strong>
                  <span>Pago con hitos de revisión y entregables automáticos a tu conformidad.</span>
                </div>
              </li>
              <li>
                <div className="escrow-check-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <strong>Términos de Licencia Claros:</strong>
                  <span>Especificaciones directas de derechos comerciales y uso personal.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="escrow-mockup-column">
            <div className="mockup-inner-card">
              <div className="mockup-header-line">
                <span className="mockup-live-text">PROCESO EN VIVO</span>
                <span className="mockup-shield-pill"><DecorativeStar size={11} color="currentColor" /> IN ESCROW SHIELD</span>
              </div>

              <div className="mockup-steps-flow">
                <div className="mockup-step-row step-done">
                  <div className="mockup-step-num-circle circle-purple">1</div>
                  <div className="mockup-step-meta">
                    <strong>1. Depósito del Cliente</strong>
                  </div>
                  <span className="mockup-step-badge badge-green">✓ Verificado</span>
                </div>

                <div className="mockup-down-arrow">↓</div>

                <div className="mockup-step-row step-active">
                  <div className="mockup-step-num-circle circle-amber">2</div>
                  <div className="mockup-step-meta">
                    <strong>2. Entrega y Avances Bocetos</strong>
                  </div>
                  <span className="mockup-step-badge badge-amber">En curso (2/3)</span>
                </div>

                <div className="mockup-down-arrow">↓</div>

                <div className="mockup-step-row step-pending">
                  <div className="mockup-step-num-circle circle-gray">3</div>
                  <div className="mockup-step-meta">
                    <strong>3. Aprobación y Entrega</strong>
                  </div>
                  <span className="mockup-step-badge badge-gray">Pendiente de hito</span>
                </div>
              </div>

              <p className="mockup-footer-guarantee">
                Protección transaccional de 14 días + PayPal / Stripe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. DUAL CTAs ── */}
      <section className="section-dual-actions" aria-label="Llamados a la acción">
        <div className="dual-actions-grid">
          {/* CTA Clientes */}
          <div className="dual-cta-card">
            <div className="cta-icon-circle circle-pink">
              <ShoppingBag size={22} />
            </div>
            <span className="cta-audience-tag tag-pink-text">
              PARA COLECCIONISTAS & STREAMERS
            </span>
            <h3 className="cta-card-heading">
              ¿Buscas una pieza única para tu proyecto?
            </h3>
            <p className="cta-card-desc">
              Explora cientos de estilos, compara tarifas de forma transparente y pon en marcha tu encargo hoy mismo. Libre de riesgo y sin comisiones engañosas.
            </p>
            <Link to="/explorar" className="cta-action-btn btn-purple">
              Explorar todo el Catálogo <ArrowRight size={16} />
            </Link>
          </div>

          {/* CTA Creadores */}
          <div className="dual-cta-card">
            <div className="cta-icon-circle circle-purple">
              <Palette size={22} />
            </div>
            <span className="cta-audience-tag tag-purple-text">
              PARA CREADORES E ILUSTRADORES
            </span>
            <h3 className="cta-card-heading">
              Abre tu vitrina y cobra en cualquier divisa
            </h3>
            <p className="cta-card-desc">
              Diseña tu catálogo de precios, gestiona tus órdenes sin sobreesfuerzo, asegura tus pagos sin comisión excesiva y ahorra horas de gestión.
            </p>
            <Link to="/para-artistas" className="cta-action-btn btn-deep-purple">
              Crear Perfil de Artista <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

