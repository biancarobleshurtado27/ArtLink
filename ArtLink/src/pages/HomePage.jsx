import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  ShieldCheck,
  Lock,
  Eye,
  CheckCircle2,
  ShoppingBag,
  Palette,
} from 'lucide-react'
import DecorativeStar from '../components/DecorativeStar'
import AssistantWidget from '../components/AssistantWidget'
import { getArtists } from '../services/artistService'
import { handleImageError } from '../utils/imageFallback'

// Métricas de la plataforma
const PLATFORM_METRICS = [
  { id: 'm1', number: '+2,500', label: 'Creadores Activos', icon: 'purple' },
  { id: 'm2', number: '$45 USD', label: 'Tarifa Base Promedio', icon: 'green' },
  { id: 'm3', number: '100%', label: 'Custodia Escrow', icon: 'pink' },
  { id: 'm4', number: '4.9 / 5', label: '480 Reseñas', icon: 'yellow' },
]

const QUICK_CHIPS = [
  { label: 'Ilustración 2D', param: 'discipline=Ilustración 2D' },
  { label: 'VTuber & Live2D', param: 'discipline=Animación' },
  { label: 'Modelado 3D', param: 'discipline=Modelado 3D' },
  { label: 'Pixel Art', param: 'discipline=Pixel Art' },
  { label: 'Emotes', param: 'discipline=Emotes' },
  { label: 'Comisiones abiertas', param: 'availability=open' },
]

const CATEGORIES_MOCK = [
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

const FEATURED_CREATORS_STATIC = [
  {
    id: 'artist-1',
    name: "Valeria 'Vex' Cruz",
    handle: '@vex_artworks | Ilustración',
    status: 'CUPOS DISPONIBLES',
    statusClass: 'badge-open',
    bio: 'Especializada en personajes cyberpunk, sci-fi y líneas de contorno dinámicas. Disponible para ilustraciones completas.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    ],
    startingPrice: '$45 USD',
  },
  {
    id: 'artist-2',
    name: 'Kenji Morita',
    handle: '@kenji_morita | 3D y 2D Anime',
    status: 'ÚLTIMOS 2 CUPOS',
    statusClass: 'badge-waitlist',
    bio: 'Modelador 3D y artist 2D. Assets de alta calidad y animaciones optimizadas para videojuegos e integración en Unity.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
    ],
    startingPrice: '$115 USD',
  },
  {
    id: 'artist-3',
    name: 'Yochi & Goma',
    handle: '@yochigoma | VTuber & Emotes',
    status: 'EN REVISIÓN DE BRIEF',
    statusClass: 'badge-soft',
    bio: 'Arte y rigging para VTubers, badges de suscripción y expresiones tiernas para streamers de todas las plataformas.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    ],
    startingPrice: '$25 USD',
  },
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('all')
  const [featuredCreators] = useState(FEATURED_CREATORS_STATIC)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    getArtists()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          // Mantener o adaptar datos
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (area !== 'all') params.set('discipline', area)
    navigate(`/explorar?${params.toString()}`)
  }

  return (
    <div className="home-container">
      {/* ── 1. HERO PRINCIPAL ── */}
      <section className="hero-landing" aria-labelledby="hero-main-title">
        <div className="hero-landing-content">
          {/* Top Promo Stickers */}
          <div className="promo-stickers-row" aria-label="Etiquetas informativas">
            <span className="sticker sticker-pink">
              <DecorativeStar size={12} color="#1E192B" /> LA VITRINA PARA ARTISTAS DIGITALES
            </span>
            <span className="sticker sticker-pink">
              <DecorativeStar size={12} color="#1E192B" /> COMISIONES 100% SEGURAS
            </span>
          </div>

          {/* Main Headline */}
          <div style={{ position: 'relative' }}>
            <h1 id="hero-main-title" className="hero-title-main">
              El punto de encuentro entre artistas<br />
              únicos y <span className="highlight-purple">encargos memorables</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle-main">
            Descubre ilustradores, modeladores 3D, animadores y creadores de avatares.<br />
            Revisa tarifas claras, cupos activos y encargos personalizados con<br />
            protección de fondos en custodia.
          </p>

          {/* Buscador Central Integrado */}
          <form className="hero-search-box" onSubmit={handleSearchSubmit} role="search" aria-label="Buscador principal">
            <div className="search-box-select-wrap">
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                aria-label="Seleccionar área"
              >
                <option value="all">📍 Todas las áreas</option>
                <option value="Ilustración 2D">Ilustración 2D</option>
                <option value="Modelado 3D">Modelado 3D</option>
                <option value="Animación">Animación & VTuber</option>
                <option value="Pixel Art">Pixel Art</option>
              </select>
            </div>
            <div className="search-box-input-wrap">
              <Search size={18} className="search-box-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="¿Qué estás buscando? Ej. Cyberpunk"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar creadores o estilos"
              />
            </div>
            <button type="submit" className="button button-primary button-search-hero">
              Buscar Artista ✦
            </button>
          </form>

          {/* Chips Funcionales Rápidos */}
          <div className="hero-trends" aria-label="Filtros rápidos">
            <span className="trends-label">Explorar por:</span>
            {QUICK_CHIPS.map(({ label, param }) => (
              <Link
                key={label}
                to={`/explorar?${param}`}
                className="trend-tag"
              >
                #{label.replace(/\s+/g, '')}
              </Link>
            ))}
          </div>

          {/* Tira de 4 Métricas (Estilo Post-it / Mockup) */}
          <div className="hero-metrics-bar" aria-label="Métricas de la plataforma">
            {PLATFORM_METRICS.map((m) => (
              <div key={m.id} className="hero-metric-item paper-card">
                <div className="metric-icon-bubble">
                  {m.icon === 'purple' && <Sparkles size={16} />}
                  {m.icon === 'green' && <ShieldCheck size={16} />}
                  {m.icon === 'pink' && <Lock size={16} />}
                  {m.icon === 'yellow' && <DecorativeStar size={16} color="#8B5CF6" />}
                </div>
                <div>
                  <strong>{m.number}</strong>
                  <span>{m.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Galería Visual de 3 Tarjetas Destacadas del Hero */}
          <div className="hero-cards-showcase">
            {/* Tarjeta 1 (Izquierda) */}
            <div className="hero-showcase-card paper-card">
              <span className="showcase-sticker" style={{ background: '#8B5CF6' }}>
                ✦ SoraMoon · Live2D
              </span>
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"
                alt="SoraMoon Live2D Art"
                className="showcase-img"
                onError={handleImageError}
              />
              <div className="showcase-info">
                <div>
                  <h3>SoraMoon · Live2D</h3>
                  <p>VTuber Model - 2D Art</p>
                </div>
                <div className="text-right">
                  <strong className="showcase-price">$350 USD</strong>
                  <p>Tarifa base</p>
                </div>
              </div>
            </div>

            {/* Tarjeta 2 (Centro - Principal) */}
            <div className="hero-showcase-card paper-card" style={{ border: '2.5px solid #1E192B' }}>
              <div style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', zIndex: 2, display: 'flex', gap: '0.4rem' }}>
                <span className="badge badge-yellow" style={{ fontSize: '0.65rem', fontWeight: 800 }}>⚡ Respuesta en 24h</span>
                <span className="badge badge-violet" style={{ fontSize: '0.65rem', fontWeight: 800 }}>✦ SofiArt</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80"
                alt="The Azure Isles"
                className="showcase-img"
                style={{ height: '15.5rem' }}
                onError={handleImageError}
              />
              <div className="showcase-info">
                <div>
                  <h3>The Azure Isles</h3>
                  <p>penciller_artworks</p>
                </div>
                <div className="text-right">
                  <strong className="showcase-price" style={{ fontSize: '1.3rem' }}>$160 USD</strong>
                  <p>Tarifa base</p>
                </div>
              </div>
            </div>

            {/* Tarjeta 3 (Derecha) */}
            <div className="hero-showcase-card paper-card">
              <span className="showcase-sticker" style={{ background: '#F472B6' }}>
                ✦ PixelArt 2D
              </span>
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
                alt="Magic Shop 2D"
                className="showcase-img"
                onError={handleImageError}
              />
              <div className="showcase-info">
                <div>
                  <h3>Magic Shop 2D</h3>
                  <p>pixel_master</p>
                </div>
                <div className="text-right">
                  <strong className="showcase-price">$85 USD</strong>
                  <p>Tarifa base</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SECCIÓN ¿CÓMO FUNCIONA ARTLINK? ── */}
      <section className="section-how-it-works" aria-labelledby="how-it-works-title">
        <div className="section-header-centered">
          <span className="sticker sticker-purple">
            FLUJO TRANSPARENTE
          </span>
          <h2 id="how-it-works-title">¿Cómo Funciona ArtLink?</h2>
          <p className="section-subtext">
            Eliminamos la incertidumbre de los encargos en línea con un proceso estructurado y protegido en cada paso.
          </p>
        </div>

        <div className="three-steps-grid">
          {/* Paso 01 */}
          <div className="step-box-card">
            <span className="step-badge-num">01</span>
            <div className="step-icon-circle">
              <Eye size={22} />
            </div>
            <h3>Explora y Elige</h3>
            <p>
              Revisa portafolios verificados con disponibilidad real, tiempos de entrega garantizados y tarifas públicas sin sorpresas.
            </p>
            <span className="step-pill-footer pill-mint">
              ✓ Filtros por especialidad
            </span>
          </div>

          {/* Paso 02 */}
          <div className="step-box-card">
            <span className="step-badge-num">02</span>
            <div className="step-icon-circle" style={{ background: '#FFE4E6', color: '#E11D48' }}>
              <Lock size={22} />
            </div>
            <h3>Brief & Fondos en Custodia</h3>
            <p>
              Envía tus referencias visuales y deposita el pago en el sistema <strong>Escrow Shield</strong>. El dinero no se libera al artista hasta que sus fondos ya están asegurados.
            </p>
            <span className="step-pill-footer pill-pink">
              ✓ Pago 100% Blindado
            </span>
          </div>

          {/* Paso 03 */}
          <div className="step-box-card">
            <span className="step-badge-num">03</span>
            <div className="step-icon-circle" style={{ background: '#CCFBF1', color: '#0D9488' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3>Feedback & Entrega en Alta</h3>
            <p>
              Aprueba bocetos por etapas, realiza correcciones sobre la marcha y descarga los archivos finales en máxima resolución antes de liberar el pago.
            </p>
            <span className="step-pill-footer pill-mint">
              ✓ Archivos PSD / PNG / 3D
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. SECCIÓN CATEGORÍAS POPULARES ── */}
      <section className="section-categories" aria-labelledby="popular-categories-title">
        <div className="section-header-flex">
          <div>
            <span className="sticker sticker-yellow">
              ✦ CATÁLOGO ABIERTO
            </span>
            <h2 id="popular-categories-title">Categorías Populares</h2>
            <p className="section-subtext">
              Desde proyectos personales y streaming hasta arte comercial de gran envergadura.
            </p>
          </div>
          <Link to="/explorar" className="link-arrow-action">
            Ver Todas las Disciplinas <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="categories-grid-6">
          {CATEGORIES_MOCK.map((cat) => (
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
                <span className="cat-btn-arrow"><ChevronRight size={18} aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. CREADORES DESTACADOS DEL MES ── */}
      <section className="section-creators" aria-labelledby="featured-creators-title">
        <div className="section-header-flex">
          <div>
            <span className="sticker sticker-pink">
              ✦ COMUNIDAD VERIFICADA
            </span>
            <h2 id="featured-creators-title">Creadores Destacados del Mes</h2>
            <p className="section-subtext">
              Explora sus estilos de firma, revisa muestras reales y reserva tu lugar en su lista de espera.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="icon-button" aria-label="Anterior creador" style={{ border: '1.5px solid #1E192B', borderRadius: '50%', background: 'white' }}>
              <ChevronLeft size={18} />
            </button>
            <button className="icon-button" aria-label="Siguiente creador" style={{ border: '1.5px solid #1E192B', borderRadius: '50%', background: 'white' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="creators-cards-grid">
          {featuredCreators.map((creator) => (
            <div key={creator.id} className="creator-card paper-card">
              <div className="creator-card-header">
                <img src={creator.avatar} alt={creator.name} className="avatar avatar-medium" onError={handleImageError} />
                <div className="creator-meta">
                  <div className="creator-name-row">
                    <strong>{creator.name}</strong>
                    <BadgeCheck size={16} className="badge-verified-icon" />
                  </div>
                  <small>{creator.handle}</small>
                  <span className={`badge ${creator.statusClass}`} style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>
                    {creator.status}
                  </span>
                </div>
              </div>

              <p className="creator-bio">{creator.bio}</p>

              <div className="creator-thumbnails-row">
                {creator.thumbnails.map((thumb, idx) => (
                  <img key={idx} src={thumb} alt={`Muestra ${idx + 1}`} onError={handleImageError} />
                ))}
              </div>

              <div className="creator-card-footer">
                <div>
                  <small>Tarifa base</small>
                  <strong>Desde {creator.startingPrice}</strong>
                </div>
                <Link to={`/artista/${creator.id}`} className="button button-outline button-small" style={{ background: '#EBE5FF' }}>
                  Ver perfil
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. SECCIÓN ESCROW SHIELD (TRANQUILIDAD TOTAL) ── */}
      <section className="section-escrow-trust" aria-labelledby="escrow-trust-title">
        <div className="trust-card-container paper-card">
          <div className="trust-copy">
            <span className="sticker sticker-mint">
              ✦ ESCROW SHIELD
            </span>
            <h2 id="escrow-trust-title">
              Tranquilidad total tanto para quienes compran como para quienes crean.
            </h2>
            <p>
              Tu dinero nunca va directamente al artista hasta que tú apruebes la entrega final. Y el artista trabaja sabiendo con certeza matemática que los fondos están ya asegurados en nuestra custodia neutral.
            </p>

            <ul className="trust-bullets">
              <li>
                <div className="bullet-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <strong>Sin contratiempos:</strong>
                  <span>Pago con hitos de revisión y entregables automáticos a tu conformidad.</span>
                </div>
              </li>
              <li>
                <div className="bullet-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <strong>Términos de Licencia Claros:</strong>
                  <span>Especificaciones directas de derechos comerciales y uso personal.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="trust-mockup-graphic">
            <div className="mockup-header-top">
              <span>PROCESO EN VIVO</span>
              <span className="badge-escrow-mini">IN ESCROW SHIELD</span>
            </div>

            <ul className="mockup-flow-list">
              <li className="flow-step done">
                <div className="step-circle">1</div>
                <div>
                  <strong>1. Depósito del Cliente</strong>
                  <small>Fondos resguardados en custodia</small>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: '#059669' }}>✓ Verificado</span>
              </li>
              <div style={{ textAlign: 'center', color: '#8B5CF6', fontWeight: 900, lineHeight: 1 }}>↓</div>
              <li className="flow-step active">
                <div className="step-circle">2</div>
                <div>
                  <strong>2. Entrega y Avances Bocetos</strong>
                  <small>Revisiones en tiempo real</small>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: '#D97706' }}>En curso (2/3)</span>
              </li>
              <div style={{ textAlign: 'center', color: '#8B5CF6', fontWeight: 900, lineHeight: 1 }}>↓</div>
              <li className="flow-step">
                <div className="step-circle">3</div>
                <div>
                  <strong>3. Aprobación y Entrega</strong>
                  <small>Liberación directa del pago</small>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: '#6B7280' }}>Pendiente de hito</span>
              </li>
            </ul>

            <div className="mockup-footer-note">
              Protección transaccional de 14 días + PayPal / Stripe
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. DUAL CTAs ── */}
      <section className="section-dual-cta" aria-label="Secciones de acción">
        <div className="dual-cta-grid">
          {/* CTA para Clientes */}
          <div className="cta-box-card paper-card" style={{ background: '#FFFDF8' }}>
            <div className="step-icon-circle" style={{ background: '#FFE4E6', color: '#E11D48', marginBottom: '0.5rem' }}>
              <ShoppingBag size={22} />
            </div>
            <span style={{ fontFamily: 'var(--badge)', fontSize: '0.68rem', fontWeight: 800, color: '#E11D48' }}>
              PARA CLIENTES & FANS
            </span>
            <h3>¿Buscas una pieza única para tu proyecto?</h3>
            <p>
              Explora cientos de estilos, compara tarifas de forma transparente y pon en marcha tu encargo hoy mismo. Libre de riesgo y sin comisiones engañosas.
            </p>
            <Link to="/explorar" className="button button-primary" style={{ background: '#8B5CF6' }}>
              Explorar todo el Catálogo <ArrowRight size={16} />
            </Link>
          </div>

          {/* CTA para Creadores */}
          <div className="cta-box-card paper-card" style={{ background: '#FFFDF8' }}>
            <div className="step-icon-circle" style={{ background: '#EDE9FE', color: '#7C3AED', marginBottom: '0.5rem' }}>
              <Palette size={22} />
            </div>
            <span style={{ fontFamily: 'var(--badge)', fontSize: '0.68rem', fontWeight: 800, color: '#7C3AED' }}>
              PARA CREADORES & ILUSTRADORES
            </span>
            <h3>Abre tu vitrina y cobra en cualquier divisa</h3>
            <p>
              Diseña tu catálogo de precios, gestiona tus órdenes sin sobreesfuerzo, asegura tus pagos sin comisión excessive y ahorra horas de gestión.
            </p>
            <Link to="/para-artistas" className="button button-primary" style={{ background: '#6D28D9' }}>
              Crear Perfil de Artista <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Asistente Flotante */}
      <AssistantWidget />
    </div>
  )
}
