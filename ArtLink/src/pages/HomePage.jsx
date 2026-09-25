import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Search,
  ShieldCheck,
  Star,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import DecorativeStar from '../components/DecorativeStar'
import AssistantWidget from '../components/AssistantWidget'
import AvailabilityBadge from '../components/AvailabilityBadge'
import useCategories from '../hooks/useCategories'
import { handleImageError } from '../utils/imageFallback'

const heroFeaturedCards = [
  {
    id: 'hero-card-1',
    badge: '¡Valor Top!',
    badgeColor: '#8B5CF6',
    title: 'SoraMoon · Live2D',
    category: 'Anime 2D / VTuber',
    price: '$300 USD',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    artistUsername: 'soramoon_art',
  },
  {
    id: 'hero-card-2',
    badge: 'Popular',
    badgeColor: '#2DD4BF',
    title: 'The Azure Isles',
    category: 'perigee_artworks',
    price: '$160 USD',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    artistUsername: 'perigee_artworks',
  },
  {
    id: 'hero-card-3',
    badge: 'Fondo 3D',
    badgeColor: '#F472B6',
    title: 'Magic Shop 2D',
    category: 'chibi_studio',
    price: '$45 USD',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    artistUsername: 'chibi_studio',
  },
]

const categoriesData = [
  {
    title: 'Concept Art & Fantasía',
    subtitle: 'Diseño de personajes, mundos e historias',
    count: '140+ Creadores',
    slug: 'Ilustración 2D',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'VTuber & Live2D Rigging',
    subtitle: 'Modelos listos para streaming y rigging',
    count: '85+ Creadores',
    slug: 'Animación',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Emotes & Ilustración Chibi',
    subtitle: 'Packs para Discord, Twitch y merchandising',
    count: '420+ Creadores',
    slug: 'Emotes',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Escultura 3D & Blender',
    subtitle: 'Modelos para videojuegos e impresión 3D',
    count: '110+ Creadores',
    slug: 'Modelado 3D',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Pixel Art & Assets',
    subtitle: 'Animaciones y sprites para videojuegos',
    count: '195+ Creadores',
    slug: 'Pixel Art',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: 'Retratos & Regalos',
    subtitle: 'Ilustraciones personalizadas y cuadros únicos',
    count: '310+ Creadores',
    slug: 'Ilustración 2D',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
  },
]

const featuredCreators = [
  {
    name: "Valeria 'Vex' Cruz",
    username: '@vex_illustrations',
    availabilityStatus: 'open',
    availabilityLabel: 'CUPOS DISPONIBLES',
    avatar: 'VC',
    bio: 'Especializada en Cyberpunk, Y2K y líneas de contorno marcadas. Entrega promedio en 4 días.',
    priceFrom: '$45 USD',
    thumbnails: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Kenji Morita',
    username: '@kenji_mecha · 3 en cola',
    availabilityStatus: 'waitlist',
    availabilityLabel: 'LISTA DE ESPERA',
    avatar: 'KM',
    bio: 'Ilustrador 3D y concept artist con estilo mecha y futurista para videojuegos e independientes.',
    priceFrom: '$110 USD',
    thumbnails: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
    ],
  },
  {
    name: 'Yochi & Goma',
    username: '@yochigoma_art',
    availabilityStatus: 'open',
    availabilityLabel: '3 EN COLA',
    avatar: 'YG',
    bio: 'Artistas especializados en emotes kawaii, badges de suscripción e iconos para streamers.',
    priceFrom: '$25 USD',
    thumbnails: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
    ],
  },
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const navigate = useNavigate()
  const { categories } = useCategories()

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (selectedCategory) params.set('discipline', selectedCategory)
    navigate(`/explorar?${params.toString()}`)
  }

  return (
    <div className="home-container">
      {/* ── 1. HERO PRINCIPAL ─────────────────────────────────── */}
      <section className="hero-landing" aria-labelledby="hero-main-title">
        <div className="hero-landing-content">
          <div className="promo-stickers-row" aria-label="Novedades de la plataforma">
            <span className="sticker sticker-pink">
              <DecorativeStar size={12} color="#1E192B" /> LA VITRINA PARA CREADORES DIGITALES
            </span>
            <span className="sticker sticker-purple">
              <DecorativeStar size={12} color="#1E192B" /> COMISIONES 100% SEGURAS
            </span>
          </div>

          <h1 id="hero-main-title" className="hero-title-main">
            El punto de encuentro entre artistas únicos y{' '}
            <span className="highlight-purple">encargos memorables</span>
          </h1>

          <p className="hero-subtitle-main">
            Descubre ilustradores, modeladores 3D, animadores y creadores de avatares.
            Revisa tarifas claras, cupos libres y encarga piezas personalizadas con protección de fondos en custodia.
          </p>

          {/* Caja de Búsqueda Integrada */}
          <form className="hero-search-box" onSubmit={handleSearchSubmit}>
            <div className="search-box-select-wrap">
              <select
                aria-label="Seleccionar disciplina"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas las áreas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-box-input-wrap">
              <Search size={18} className="search-box-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="¿Qué estás buscando hoy? Ej. VTuber, Cyberpunk"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="button button-primary button-search-hero">
              Buscar Artista <Search size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Tags de Tendencias */}
          <div className="hero-trends" aria-label="Tendencias de búsqueda">
            <span className="trends-label">Tendencias:</span>
            {[
              { label: '#Ilustración', discipline: 'Ilustración 2D' },
              { label: '#VTuber2D', discipline: 'Animación' },
              { label: '#Modelado3D', discipline: 'Modelado 3D' },
              { label: '#ChibiEmotes', discipline: 'Emotes' },
              { label: '#PixelArt', discipline: 'Pixel Art' },
              { label: '#RetratoAnime', discipline: 'Ilustración 2D' },
            ].map(({ label, discipline }) => (
              <Link
                key={label}
                to={`/explorar?discipline=${encodeURIComponent(discipline)}`}
                className="trend-tag"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Tira de 4 Métricas Destacadas */}
          <div className="hero-metrics-bar" aria-label="Estadísticas de la comunidad">
            <div className="hero-metric-item">
              <div className="metric-icon-bubble"><Users size={16} /></div>
              <div>
                <strong>+2,500</strong>
                <span>Creadores Activos</span>
              </div>
            </div>
            <div className="hero-metric-item">
              <div className="metric-icon-bubble"><Wallet size={16} /></div>
              <div>
                <strong>$45 USD</strong>
                <span>Tarifa Base Promedio</span>
              </div>
            </div>
            <div className="hero-metric-item">
              <div className="metric-icon-bubble"><ShieldCheck size={16} /></div>
              <div>
                <strong>100%</strong>
                <span>Custodia en Escrow</span>
              </div>
            </div>
            <div className="hero-metric-item">
              <div className="metric-icon-bubble"><Star size={16} /></div>
              <div>
                <strong>4.9 / 5</strong>
                <span>480 Reseñas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Galería Visual de 3 Tarjetas Destacadas (Muestra Scrapbook) */}
        <div className="hero-cards-showcase" aria-label="Obras de arte destacadas">
          {heroFeaturedCards.map((card) => (
            <article className="hero-showcase-card paper-card" key={card.id}>
              <div
                className="showcase-sticker"
                style={{ backgroundColor: card.badgeColor }}
              >
                {card.badge}
              </div>
              <img
                src={card.image}
                alt={card.title}
                onError={handleImageError}
                className="showcase-img"
              />
              <div className="showcase-info">
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.category}</p>
                </div>
                <strong className="showcase-price">{card.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 2. ¿CÓMO FUNCIONA ARTLINK? ───────────────────────── */}
      <section className="section-how-it-works" aria-labelledby="how-works-title">
        <div className="section-header-centered">
          <span className="sticker sticker-purple">
            <DecorativeStar size={12} color="#1E192B" /> FLUJO TRANSPARENTE
          </span>
          <h2 id="how-works-title">¿Cómo Funciona ArtLink?</h2>
          <p className="section-subtext">
            Eliminamos la incertidumbre de los encargos en tres pasos simples con protección en cada fase.
          </p>
        </div>

        <div className="three-steps-grid">
          <article className="step-box-card">
            <span className="step-badge-num">01</span>
            <div className="step-icon-circle">
              <Search size={20} />
            </div>
            <h3>Explora y Elige</h3>
            <p>
              Revisa portafolios verificados con disponibilidad real, tiempos de entrega garantizados y las referencias públicas sin sorpresas de última hora.
            </p>
            <span className="step-pill-footer">✓ Filtros por especialidad</span>
          </article>

          <article className="step-box-card">
            <span className="step-badge-num">02</span>
            <div className="step-icon-circle">
              <ShieldCheck size={20} />
            </div>
            <h3>Brief & Fondos en Custodia</h3>
            <p>
              Envía tus referencias visuales y deposita el pago en el sistema <strong>Escrow Shield</strong>. El artista empieza a trabajar sabiendo que sus fondos ya están asegurados.
            </p>
            <span className="step-pill-footer pill-pink">✓ Pago 100% Blindado</span>
          </article>

          <article className="step-box-card">
            <span className="step-badge-num">03</span>
            <div className="step-icon-circle">
              <Zap size={20} />
            </div>
            <h3>Feedback & Entrega en Alta</h3>
            <p>
              Aprueba bocetos por etapas, realiza revisiones dentro del plazo acordado y descarga los archivos finales en máxima resolución antes de liberar el pago.
            </p>
            <span className="step-pill-footer pill-mint">✓ Archivos PSD / PNG / 3D</span>
          </article>
        </div>
      </section>

      {/* ── 3. CATEGORÍAS POPULARES ───────────────────────────── */}
      <section className="section-categories" aria-labelledby="popular-categories-title">
        <div className="section-header-flex">
          <div>
            <span className="sticker sticker-yellow">
              <DecorativeStar size={12} color="#1E192B" /> CATÁLOGO ABIERTO
            </span>
            <h2 id="popular-categories-title">Categorías Populares</h2>
            <p className="section-subtext">
              Desde proyectos personales y creadores hasta arte comercial de gran envergadura.
            </p>
          </div>
          <Link to="/explorar" className="link-arrow-action">
            Ver Todas las Disciplinas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="categories-grid-6">
          {categoriesData.map((cat) => (
            <Link
              to={`/explorar?discipline=${encodeURIComponent(cat.slug)}`}
              className="category-card-item"
              key={cat.title}
            >
              <div className="category-card-media">
                <img src={cat.image} alt={cat.title} onError={handleImageError} />
                <span className="category-count-badge">{cat.count}</span>
              </div>
              <div className="category-card-body">
                <div>
                  <h3>{cat.title}</h3>
                  <p>{cat.subtitle}</p>
                </div>
                <span className="cat-btn-arrow"><ChevronRight size={18} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. CREADORES DESTACADOS DEL MES ───────────────────── */}
      <section className="section-creators" aria-labelledby="featured-creators-title">
        <div className="section-header-flex">
          <div>
            <span className="sticker sticker-pink">
              <DecorativeStar size={12} color="#1E192B" /> COMUNIDAD VERIFICADA
            </span>
            <h2 id="featured-creators-title">Creadores Destacados del Mes</h2>
            <p className="section-subtext">
              Explora sus estilos de cerca, revisa sus muestras recientes y reserva tu lugar en su lista de espera.
            </p>
          </div>
        </div>

        <div className="creators-cards-grid">
          {featuredCreators.map((creator) => (
            <article className="creator-card paper-card" key={creator.name}>
              <div className="creator-card-header">
                <span className="avatar avatar-medium avatar-fallback">{creator.avatar}</span>
                <div className="creator-meta">
                  <div className="creator-name-row">
                    <strong>{creator.name}</strong>
                    <BadgeCheck size={16} className="badge-verified-icon" />
                  </div>
                  <small>{creator.username}</small>
                </div>
                <AvailabilityBadge status={creator.availabilityStatus} label={creator.availabilityLabel} />
              </div>

              <p className="creator-bio">{creator.bio}</p>

              {/* 3 Thumbnails de muestra */}
              <div className="creator-thumbnails-row">
                {creator.thumbnails.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Muestra ${idx + 1} de ${creator.name}`}
                    onError={handleImageError}
                  />
                ))}
              </div>

              <div className="creator-card-footer">
                <div>
                  <small>Tarifa base</small>
                  <strong>Desde {creator.priceFrom}</strong>
                </div>
                <Link to="/explorar" className="button button-outline button-small">
                  Ver perfil
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 5. TRANQUILIDAD TOTAL (PROTECCIÓN ESCROW) ──────────── */}
      <section className="section-escrow-trust" aria-labelledby="trust-title">
        <div className="trust-card-container paper-card">
          <div className="trust-copy">
            <span className="sticker sticker-yellow">
              <DecorativeStar size={12} color="#1E192B" /> GARANTÍA ESCROW SHIELD
            </span>
            <h2 id="trust-title">
              Tranquilidad total tanto para quienes compran como para quienes crean.
            </h2>
            <p>
              Tu dinero nunca va directamente al artista hasta que tú revises y apruebes la obra final. Y el artista trabaja sabiendo que un sistema matemático que no cambia sus reglas está a cargo del dinero en custodia neutral.
            </p>

            <ul className="trust-bullets">
              <li>
                <CheckCircle2 size={18} className="bullet-icon" />
                <div>
                  <strong>Sin contratiempos</strong>
                  <span>Pagos en custodia que liberan revisiones automáticas o reembolso en caso de disputa.</span>
                </div>
              </li>
              <li>
                <CheckCircle2 size={18} className="bullet-icon" />
                <div>
                  <strong>Términos de Licencia Claros</strong>
                  <span>Especificaciones directas de derechos comerciales vs uso personal antes de pagar.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="trust-mockup-graphic">
            <div className="mockup-header-top">
              <span>PROCESO EN VIVO</span>
              <span className="badge-escrow-mini">EN CUSTODIA ESCROW</span>
            </div>

            <ol className="mockup-flow-list">
              <li className="flow-step done">
                <div className="step-circle">1</div>
                <div>
                  <strong>1. Solicitud de Cliente</strong>
                  <small>Verificado</small>
                </div>
              </li>
              <li className="flow-step active">
                <div className="step-circle">2</div>
                <div>
                  <strong>2. Enfoque / Bocetos / Revisiones</strong>
                  <small>En curso (2/3)</small>
                </div>
              </li>
              <li className="flow-step pending">
                <div className="step-circle">3</div>
                <div>
                  <strong>3. Aprobación y Entrega</strong>
                  <small>Pendiente de ti</small>
                </div>
              </li>
            </ol>
            <p className="mockup-footer-note">🔒 Fondos retenidos en Escrow 100% Protegidos</p>
          </div>
        </div>
      </section>

      {/* ── 6. DUAL CALL-TO-ACTION CARDS ─────────────────────── */}
      <section className="section-dual-cta" aria-labelledby="cta-dual-heading">
        <h2 id="cta-dual-heading" className="sr-only">Comienza en ArtLink</h2>
        <div className="dual-cta-grid">
          {/* Card Izquierda: Cliente */}
          <article className="cta-box-card paper-card cta-box-client">
            <span className="sticker sticker-purple">
              <DecorativeStar size={12} color="#1E192B" /> PARA COLECCIONISTAS Y STREAMERS
            </span>
            <h3>¿Buscas una pieza única para tu proyecto?</h3>
            <p>
              Explora cientos de estilos, conecta con artistas extraordinarios y pon en marcha tu proyecto con total tranquilidad y sin cobros engañosos.
            </p>
            <Link to="/explorar" className="button button-primary button-full-mobile">
              Explorar todo el Catálogo <ArrowRight size={17} />
            </Link>
          </article>

          {/* Card Derecha: Artista */}
          <article className="cta-box-card paper-card cta-box-artist">
            <span className="sticker sticker-pink">
              <DecorativeStar size={12} color="#1E192B" /> PARA CREADORES E ILUSTRADORES
            </span>
            <h3>Abre tu vitrina y cobra en cualquier divisa</h3>
            <p>
              Gestiona tu catálogo, organiza tu lista de intermediarios y presupuestos. Jamás gestiones tus cupos de comisión sin orden: evita los pagos y ahorra horas de gestión.
            </p>
            <Link to="/para-artistas" className="button button-primary button-full-mobile">
              Crear Perfil de Artista <ArrowRight size={17} />
            </Link>
          </article>
        </div>
      </section>

      {/* Asistente Flotante */}
      <AssistantWidget />
    </div>
  )
}
