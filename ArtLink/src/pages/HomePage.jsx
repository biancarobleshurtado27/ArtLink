import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { getArtists } from '../services/artistService'
import { getPortfolioItems } from '../services/portfolioService'
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
  { label: 'Live2D & VTuber', param: 'discipline=Animación' },
  { label: 'Modelado 3D', param: 'discipline=Modelado 3D' },
  { label: 'Pixel Art', param: 'discipline=Pixel Art' },
  { label: 'Emotes', param: 'discipline=Emotes' },
  { label: 'Fantasía & Sci-Fi', param: 'discipline=Concept Art' },
]

const CATEGORIES_MOCK = [
  {
    title: 'Concept Art & Fantasía',
    subtitle: 'Diseño de personajes, mundos e historias',
    count: '140+ Creadores',
    slug: 'Ilustración 2D',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'VTuber & Live2D Rigging',
    subtitle: 'Modelos listos para streaming y rigging',
    count: '85+ Creadores',
    slug: 'Animación',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Emotes & Ilustración Chibi',
    subtitle: 'Packs para Discord, Twitch y merchandising',
    count: '420+ Creadores',
    slug: 'Emotes',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Escultura 3D & Blender',
    subtitle: 'Modelos para videojuegos e impresión 3D',
    count: '110+ Creadores',
    slug: 'Modelado 3D',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Pixel Art & Assets',
    subtitle: 'Animaciones y assets para videojuegos',
    count: '195+ Creadores',
    slug: 'Pixel Art',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Retratos & Regalos',
    subtitle: 'Ilustraciones personalizadas y cuadros de autor',
    count: '310+ Creadores',
    slug: 'Ilustración 2D',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
  },
]

const FEATURED_CREATORS_STATIC = [
  {
    id: 'artist-001',
    name: 'Mateo Ríos',
    handle: '@mateorios | Ilustración 2D',
    status: 'CUPOS DISPONIBLES',
    statusClass: 'status-open',
    bio: 'Ilustrador editorial especializado en mundos narrativos y personajes expresivos.',
    avatar: 'https://i.pravatar.cc/150?img=12',
    thumbnails: [
      'https://picsum.photos/seed/forest-guardian/900/700',
      'https://picsum.photos/seed/floating-islands/900/700',
      'https://picsum.photos/seed/secret-valley/900/700',
    ],
    startingPrice: '$80 USD',
  },
  {
    id: 'artist-002',
    name: 'Sofía Nakamura',
    handle: '@sofinaka | Diseño de personajes',
    status: 'ÚLTIMOS CUPOS',
    statusClass: 'status-waitlist',
    bio: 'Diseñadora de personajes y retratos digitales con una paleta suave y cinematográfica.',
    avatar: 'https://i.pravatar.cc/150?img=32',
    thumbnails: [
      'https://picsum.photos/seed/winter-portrait/900/700',
      'https://picsum.photos/seed/lunar-explorer/900/700',
      'https://picsum.photos/seed/sunset-glow/900/700',
    ],
    startingPrice: '$120 USD',
  },
  {
    id: 'artist-003',
    name: 'Diego Álvarez',
    handle: '@diegoalvarez3d | Modelado 3D',
    status: 'EN REVISIÓN DE BRIEF',
    statusClass: 'status-review',
    bio: 'Artista 3D enfocado en producto, arquitectura y escenas para marcas independientes.',
    avatar: 'https://i.pravatar.cc/150?img=68',
    thumbnails: [
      'https://picsum.photos/seed/form-lamp/900/700',
      'https://picsum.photos/seed/concrete-study/900/700',
      'https://picsum.photos/seed/sound-chair/900/700',
    ],
    startingPrice: '$200 USD',
  },
]

// Componente SVG para las estrellitas de fondo (4 puntas limpias con color vibrante)
function HeroSparkleStar({ size = 24, color = '#F472B6' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <path
        d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
        fill={color}
      />
    </svg>
  )
}

const HERO_SPARKLES_DATA = [
  // Zona Superior (Alrededor del Título y Stickers)
  { id: 'sp-1', top: '3.5rem', left: '3.5%', size: 30, color: '#F472B6', anim: 'anim-star-float-1', delay: '0s' },
  { id: 'sp-2', top: '4.5rem', right: '4%', size: 32, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.8s' },
  { id: 'sp-3', top: '1.8rem', left: '20%', size: 18, color: '#F472B6', anim: 'anim-star-float-3', delay: '1.4s' },
  { id: 'sp-4', top: '2.2rem', right: '22%', size: 20, color: '#FBBF24', anim: 'anim-star-float-1', delay: '2.1s' },

  // Zona Media (Junto al Buscador y Métricas)
  { id: 'sp-5', top: '12.5rem', left: '5.5%', size: 24, color: '#FBBF24', anim: 'anim-star-float-2', delay: '1s' },
  { id: 'sp-6', top: '14rem', right: '5%', size: 28, color: '#F472B6', anim: 'anim-star-float-3', delay: '0.3s' },
  { id: 'sp-7', top: '19.5rem', left: '2%', size: 22, color: '#A78BFA', anim: 'anim-star-float-1', delay: '2.5s' },
  { id: 'sp-8', top: '21rem', right: '2.2%', size: 24, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '1.6s' },

  // Zona Media-Baja (A los lados de las 3 tarjetas de muestra)
  { id: 'sp-9', top: '29rem', left: '4%', size: 26, color: '#F472B6', anim: 'anim-star-float-3', delay: '3.1s' },
  { id: 'sp-10', top: '31rem', right: '4.5%', size: 24, color: '#FBBF24', anim: 'anim-star-float-1', delay: '0.5s' },
  { id: 'sp-11', top: '38rem', left: '2.2%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-2', delay: '2.2s' },
  { id: 'sp-12', top: '40rem', right: '2.5%', size: 26, color: '#BCA6E8', anim: 'anim-star-float-3', delay: '1.3s' },

  // Zona Inferior (Exclusivamente en el fondo abierto y despejado de las tarjetas)
  { id: 'sp-13', bottom: '8rem', left: '3.5%', size: 24, color: '#F472B6', anim: 'anim-star-float-1', delay: '1.8s' },
  { id: 'sp-14', bottom: '8.5rem', right: '4%', size: 24, color: '#A78BFA', anim: 'anim-star-float-2', delay: '0.7s' },
  { id: 'sp-15', bottom: '4rem', left: '3%', size: 22, color: '#2DD4BF', anim: 'anim-star-float-3', delay: '2.4s' },
  { id: 'sp-16', bottom: '4.5rem', right: '3.5%', size: 22, color: '#FBBF24', anim: 'anim-star-float-1', delay: '1.1s' },
  { id: 'sp-17', bottom: '1.5rem', left: '8%', size: 24, color: '#BCA6E8', anim: 'anim-star-float-2', delay: '0.5s' },
  { id: 'sp-18', bottom: '1.4rem', left: '30%', size: 20, color: '#FBBF24', anim: 'anim-star-float-3', delay: '2.0s' },
  { id: 'sp-19', bottom: '1.4rem', right: '30%', size: 20, color: '#2DD4BF', anim: 'anim-star-float-1', delay: '1.5s' },
  { id: 'sp-20', bottom: '1.6rem', right: '7%', size: 26, color: '#F472B6', anim: 'anim-star-float-2', delay: '0.9s' },
]

// Obtiene una semilla numérica para el día actual (cambia a la medianoche UTC)
const getDaySeed = () => {
  const d = new Date()
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000)
}

// Pool de obras de artistas de ArtLink para rotación diaria
const HERO_ARTIST_WORKS_POOL = [
  {
    artistId: 'artist-kuro',
    artistName: 'Kuro Illust',
    category: 'VTuber Model',
    workTitle: 'Airi Hoshino ✦ Live2D',
    image: '/images/hero/soramoon.jpg',
    badgeClass: 'badge-pill-purple',
  },
  {
    artistId: 'artist-dan',
    artistName: 'Dan Artworks',
    category: 'Concept Art',
    workTitle: 'The Azure Isles',
    image: '/images/hero/azure_isles.jpg',
    badgeClass: 'badge-pill-mint',
  },
  {
    artistId: 'artist-poly',
    artistName: 'Poly Lola',
    category: 'Modelado 3D',
    workTitle: 'Magic Shop 3D',
    image: '/images/hero/magic_shop.jpg',
    badgeClass: 'badge-pill-rose',
  },
  {
    artistId: 'artist-001',
    artistName: 'Mateo Ríos',
    category: 'Ilustración 2D',
    workTitle: 'La Guardiana del Bosque',
    image: '/images/hero/portfolio/forest-guardian.jpg',
    badgeClass: 'badge-pill-purple',
  },
  {
    artistId: 'artist-002',
    artistName: 'Sofía Nakamura',
    category: 'Retrato & Anime',
    workTitle: 'Retrato de Invierno',
    image: '/images/hero/portfolio/winter-portrait.jpg',
    badgeClass: 'badge-pill-rose',
  },
  {
    artistId: 'artist-003',
    artistName: 'Diego Álvarez',
    category: 'Arte 3D & Render',
    workTitle: 'Estudio de Hormigón',
    image: '/images/hero/portfolio/cozy-workshop.jpg',
    badgeClass: 'badge-pill-mint',
  },
  {
    artistId: 'artist-004',
    artistName: 'Elena Rostova',
    category: 'Fondos & Escenarios',
    workTitle: 'Templo en las Alturas',
    image: 'https://picsum.photos/seed/sky-temple/900/700',
    badgeClass: 'badge-pill-purple',
  },
  {
    artistId: 'artist-005',
    artistName: 'Lucas Mendoza',
    category: 'Pixel Art',
    workTitle: 'Callejón Neo-Kyoto 16-bit',
    image: 'https://picsum.photos/seed/neo-kyoto-pixel/900/700',
    badgeClass: 'badge-pill-mint',
  },
  {
    artistId: 'artist-009',
    artistName: 'Álvaro Sola',
    category: 'Modelado 3D',
    workTitle: 'Minotauro Colosal 3D',
    image: 'https://picsum.photos/seed/colossal-minotaur/900/700',
    badgeClass: 'badge-pill-rose',
  },
]

// Genera las 3 tarjetas destacadas del día actual
function getDailyShowcaseCards(pool, seed = getDaySeed()) {
  if (!pool || pool.length === 0) return []
  const count = pool.length
  const tapes = ['tape-yellow tape-left', 'tape-pink tape-center', 'tape-yellow tape-right']
  const badges = ['badge-pill-purple', 'badge-pill-mint', 'badge-pill-rose', 'badge-pill-yellow']

  return [0, 1, 2].map((slot) => {
    const itemIndex = ((seed * 3) + slot) % count
    const item = pool[itemIndex]
    return {
      ...item,
      id: `showcase-orbit-${item.artistId}-${slot}-${seed}`,
      tapeClass: tapes[slot],
      badgeClass: item.badgeClass || badges[(slot + seed) % badges.length],
    }
  })
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('all')
  const [allCreators, setAllCreators] = useState([])
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [featuredCreators, setFeaturedCreators] = useState(FEATURED_CREATORS_STATIC)
  const [dailyCards, setDailyCards] = useState(() => getDailyShowcaseCards(HERO_ARTIST_WORKS_POOL))
  const [activeOrbitIndex, setActiveOrbitIndex] = useState(1) // Comienza con la tarjeta central en frente
  const [isPausedOrbit, setIsPausedOrbit] = useState(false)
  const navigate = useNavigate()

  // Rotación circular automática entre las tarjetas cada 4 segundos
  useEffect(() => {
    if (isPausedOrbit || dailyCards.length === 0) return
    const timer = setInterval(() => {
      setActiveOrbitIndex((prev) => (prev + 1) % dailyCards.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isPausedOrbit, dailyCards.length])

  useEffect(() => {
    let mounted = true
    Promise.all([
      getArtists(),
      getPortfolioItems(),
    ])
      .then(([artists, portfolio]) => {
        if (!mounted || !artists || artists.length === 0) return
        const portfolioByArtist = {}
        portfolio?.forEach((item) => {
          if (!portfolioByArtist[item.artistId]) portfolioByArtist[item.artistId] = []
          portfolioByArtist[item.artistId].push(item.image)
        })

        const mapped = artists.map((artist, idx) => {
          const thumbs = portfolioByArtist[artist.id] || []
          const fallbackThumbs = [
            `https://picsum.photos/seed/art-${artist.id}-1/900/700`,
            `https://picsum.photos/seed/art-${artist.id}-2/900/700`,
            `https://picsum.photos/seed/art-${artist.id}-3/900/700`,
          ]
          const statusMap = {
            open: { label: 'CUPOS DISPONIBLES', cls: 'status-open' },
            waitlist: { label: 'ÚLTIMOS CUPOS', cls: 'status-waitlist' },
            closed: { label: 'EN REVISIÓN DE BRIEF', cls: 'status-review' },
          }
          const currentStatus = statusMap[artist.availability] || statusMap.open
          const mainDiscipline = artist.disciplines?.[0] || 'Arte Digital'

          return {
            id: artist.id,
            name: artist.displayName || artist.name,
            handle: `@${artist.username} | ${mainDiscipline}`,
            status: currentStatus.label,
            statusClass: currentStatus.cls,
            bio: artist.bio || 'Creador digital activo en ArtLink.',
            avatar: artist.avatar || `https://i.pravatar.cc/150?img=${(idx % 70) + 1}`,
            thumbnails: thumbs.length >= 3 ? thumbs.slice(0, 3) : [...thumbs, ...fallbackThumbs].slice(0, 3),
            startingPrice: `$${artist.basePrice || 50} USD`,
          }
        })
        setAllCreators(mapped)
        setFeaturedCreators(mapped.slice(0, 3))

        // Construir tarjetas del carrusel hero con obras de artistas del día
        const activeArtistWorks = []
        artists.forEach((artist) => {
          const works = portfolioByArtist[artist.id]
          if (works && works.length > 0) {
            const daySeed = getDaySeed()
            const fullWorks = portfolio.filter((p) => p.artistId === artist.id)
            const chosen = fullWorks[daySeed % fullWorks.length]
            if (chosen) {
              activeArtistWorks.push({
                artistId: artist.id,
                artistName: artist.displayName || artist.name,
                category: chosen.category || artist.disciplines?.[0] || 'Arte Digital',
                workTitle: chosen.title || '',
                image: chosen.image,
              })
            }
          }
        })

        if (activeArtistWorks.length >= 3) {
          setDailyCards(getDailyShowcaseCards(activeArtistWorks, getDaySeed()))
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const handlePrevCreators = () => {
    if (allCreators.length <= 3) return
    const newIdx = (carouselIndex - 3 + allCreators.length) % allCreators.length
    setCarouselIndex(newIdx)
    setFeaturedCreators(allCreators.slice(newIdx, newIdx + 3))
  }

  const handleNextCreators = () => {
    if (allCreators.length <= 3) return
    const newIdx = (carouselIndex + 3) % allCreators.length
    setCarouselIndex(newIdx)
    setFeaturedCreators(allCreators.slice(newIdx, newIdx + 3))
  }

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
        {/* Destellos / Estrellitas flotantes con movimiento suave */}
        {HERO_SPARKLES_DATA.map((sp) => (
          <span
            key={sp.id}
            className={`hero-floating-star ${sp.anim}`}
            style={{
              top: sp.top,
              bottom: sp.bottom,
              left: sp.left,
              right: sp.right,
              animationDelay: sp.delay,
            }}
            aria-hidden="true"
          >
            <HeroSparkleStar size={sp.size} color={sp.color} />
          </span>
        ))}

        <div className="hero-landing-content">
          {/* Top Stickers */}
          <div className="hero-stickers-row">
            <span className="hero-landing-sticker sticker-white">
              <span className="sticker-bullet">✦</span> LA VITRINA PARA ARTISTAS DIGITALES
            </span>
            <span className="hero-landing-sticker sticker-pink">
              <span className="sticker-bullet">✦</span> COMISIONES 100% SEGURAS
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
                <option value="Ilustración 2D">Ilustración 2D</option>
                <option value="Modelado 3D">Modelado 3D</option>
                <option value="Animación">Animación & VTuber</option>
                <option value="Pixel Art">Pixel Art</option>
                <option value="Emotes">Emotes & Chibi</option>
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

          {/* 4 Metric Cards */}
          <div className="hero-metrics-grid" aria-label="Métricas de la plataforma">
            {PLATFORM_METRICS.map((m) => (
              <div key={m.id} className="hero-metric-card">
                <div className={`metric-icon-box icon-${m.icon}`}>
                  {m.icon === 'purple' && <Sparkles size={18} />}
                  {m.icon === 'green' && <ShieldCheck size={18} />}
                  {m.icon === 'pink' && <Lock size={18} />}
                  {m.icon === 'yellow' && <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>★</span>}
                </div>
                <div className="metric-text-box">
                  <strong>{m.number}</strong>
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
            {dailyCards.map((card, idx) => {
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
              FLUJO TRANSPARENTE
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
                <span className="pill-mint-border">✦ Filtros por funcionalidad</span>
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
                <span className="pill-pink-border">✦ Pagos 100% Blindados</span>
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
                <span className="pill-lavender-border">✦ Archivos PSD / PNG / 3D</span>
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
                ✦ CATÁLOGO ABIERTO
              </span>
              <h2 id="cat-popular-title" className="section-title-large">
                Categorías Populares
              </h2>
              <p className="section-subtitle-text">
                Desde proyectos personales y streamers hasta arte comercial de gran envergadura.
              </p>
            </div>
            <Link to="/explorar" className="header-action-link">
              Ver Todas las Disciplinas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="categories-grid">
            {CATEGORIES_MOCK.map((cat) => (
              <Link
                to={`/explorar?discipline=${encodeURIComponent(cat.slug)}`}
                className="category-card"
                key={cat.title}
              >
                <div className="category-img-container">
                  <span className="category-count-pill">{cat.count}</span>
                  <img src={cat.image} alt={cat.title} onError={handleImageError} />
                </div>
                <div className="category-body">
                  <div className="category-text">
                    <h3 className="category-name">{cat.title}</h3>
                    <p className="category-sub">{cat.subtitle}</p>
                  </div>
                  <span className="category-arrow-btn">
                    <ChevronRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CREADORES DESTACADOS DEL MES ── */}
      <section className="section-featured-creators" aria-labelledby="creators-title">
        <div className="section-content-centered">
          <div className="section-header-row">
            <div>
              <span className="section-pill-tag tag-pink">
                ✦ COMUNIDAD VERIFICADA
              </span>
              <h2 id="creators-title" className="section-title-large">
                Creadores Destacados del Mes
              </h2>
              <p className="section-subtitle-text">
                Explora sus estilos de firma, revisa muestras reales y reserva tu lugar en su lista de espera.
              </p>
            </div>
            <div className="carousel-nav-btns">
              <button
                className="carousel-btn"
                aria-label="Anterior"
                type="button"
                onClick={handlePrevCreators}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="carousel-btn"
                aria-label="Siguiente"
                type="button"
                onClick={handleNextCreators}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="creators-grid">
            {featuredCreators.map((creator) => (
              <div key={creator.id} className="creator-item-card">
                <div className="creator-header">
                  <img src={creator.avatar} alt={creator.name} className="creator-avatar" onError={handleImageError} />
                  <div className="creator-info">
                    <div className="creator-name-line">
                      <strong className="creator-name">{creator.name}</strong>
                      <BadgeCheck size={16} className="creator-badge-check" />
                    </div>
                    <span className="creator-handle">{creator.handle}</span>
                    <span className={`creator-status-pill ${creator.statusClass}`}>
                      {creator.status}
                    </span>
                  </div>
                </div>

                <p className="creator-bio-text">{creator.bio}</p>

                <div className="creator-thumbs-grid">
                  {creator.thumbnails.map((thumb, idx) => (
                    <img key={idx} src={thumb} alt={`Muestra ${idx + 1}`} onError={handleImageError} />
                  ))}
                </div>

                <div className="creator-card-bottom">
                  <div>
                    <span className="creator-price-label">Tarifa base</span>
                    <strong className="creator-price-val">Desde {creator.startingPrice}</strong>
                  </div>
                  <Link to={`/artista/${creator.id}`} className="creator-profile-btn">
                    Ver perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SECCIÓN ESCROW SHIELD (TRANQUILIDAD TOTAL) ── */}
      <section className="section-escrow-trust" aria-labelledby="escrow-title">
        <div className="escrow-big-container">
          <div className="escrow-text-column">
            <span className="section-pill-tag tag-mint">
              ✦ ESCROW SHIELD™
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
                <span className="mockup-shield-pill">✦ IN ESCROW SHIELD</span>
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

