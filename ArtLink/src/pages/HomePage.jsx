import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Search,
} from 'lucide-react'
import DecorativeStar from '../components/DecorativeStar'
import AssistantWidget from '../components/AssistantWidget'
import AvailabilityBadge from '../components/AvailabilityBadge'
import ArtistCard from '../components/ArtistCard'
import StarRating from '../components/StarRating'
import { getArtists } from '../services/artistService'
import { handleImageError } from '../utils/imageFallback'

// Métricas de la plataforma (Datos simulados para prototipo)
const PLATFORM_METRICS = [
  { id: 'm1', number: '+1,200', label: 'Comisiones realizadas', detail: '(Simulado)', tone: 'yellow' },
  { id: 'm2', rating: 4.9, label: 'Satisfacción promedio', detail: '(480 reseñas - Simulado)', tone: 'mint' },
  { id: 'm3', number: '98%', label: 'Entregas a tiempo', detail: '(Garantizado - Simulado)', tone: 'violet' },
]

const QUICK_CHIPS = [
  { label: 'Ilustración 2D', param: 'discipline=Ilustración 2D' },
  { label: 'Modelado 3D', param: 'discipline=Modelado 3D' },
  { label: 'Animación', param: 'discipline=Animación' },
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

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [featuredArtists, setFeaturedArtists] = useState([])
  const [loadingArtists, setLoadingArtists] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    getArtists()
      .then((data) => {
        if (mounted) {
          setFeaturedArtists(data.slice(0, 4))
          setLoadingArtists(false)
        }
      })
      .catch(() => {
        if (mounted) setLoadingArtists(false)
      })
    return () => { mounted = false }
  }, [])

  function handleSearchSubmit(event) {
    event.preventDefault()
    if (query.trim()) {
      navigate(`/explorar?q=${encodeURIComponent(query.trim())}`)
    } else {
      navigate('/explorar')
    }
  }

  return (
    <div className="home-container">
      {/* ── 1. HERO PRINCIPAL ── */}
      <section className="hero-landing" aria-labelledby="hero-main-title">
        <div className="hero-landing-content">
          <div className="promo-stickers-row" aria-label="Etiquetas informativas">
            <span className="sticker sticker-pink">
              <DecorativeStar size={12} color="#1E192B" /> LA VITRINA PARA CREADORES DIGITALES
            </span>
            <span className="sticker sticker-purple">
              <DecorativeStar size={12} color="#1E192B" /> COMISIONES 100% SEGURAS
            </span>
          </div>

          <h1 id="hero-main-title" className="hero-title-main">
            Encuentra el arte que <span className="highlight-purple">imaginas</span>
          </h1>

          <p className="hero-subtitle-main">
            Descubre ilustradores, modeladores 3D, animadores y creadores de avatares.
            Revisa tarifas claras, portafolios verificados y encarga piezas personalizadas con fondos protegidos en custodia.
          </p>

          {/* Buscador Central */}
          <form className="hero-search-box" onSubmit={handleSearchSubmit} role="search" aria-label="Buscador principal">
            <div className="search-box-input-wrap">
              <Search size={18} className="search-box-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="¿Qué estás buscando? Ej. Ilustración 2D, Cyberpunk, VTuber..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar creadores o estilos"
              />
            </div>
            <button type="submit" className="button button-primary button-search-hero">
              Buscar <Search size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Chips Funcionales Rápidos */}
          <div className="hero-trends" aria-label="Filtros rápidos por disciplina">
            <span className="trends-label">Explorar por:</span>
            {QUICK_CHIPS.map(({ label, param }) => (
              <Link
                key={label}
                to={`/explorar?${param}`}
                className="trend-tag"
              >
                <DecorativeStar size={10} color="#8B5CF6" aria-hidden="true" /> {label}
              </Link>
            ))}
          </div>

          {/* Tres Métricas en Tarjetas Tipo Post-it (Simuladas) */}
          <div className="hero-metrics-bar" aria-label="Métricas de la plataforma (Simuladas)">
            {PLATFORM_METRICS.map((m) => (
              <div key={m.id} className={`hero-metric-postit metric-postit-${m.tone}`}>
                <span className="postit-pin" aria-hidden="true">📍</span>
                {m.number && <strong className="metric-big-num">{m.number}</strong>}
                {m.rating && <StarRating value={m.rating} size={16} label={`Calificación ${m.rating} de 5`} />}
                <span className="metric-postit-label">{m.label}</span>
                <small className="metric-postit-demo">{m.detail}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. CREADORES LISTOS PARA TU ENCARGO ── */}
      <section className="section-creators" aria-labelledby="featured-creators-title">
        <div className="section-header-flex">
          <div>
            <span className="sticker sticker-pink">
              <DecorativeStar size={12} color="#1E192B" /> COMUNIDAD VERIFICADA
            </span>
            <h2 id="featured-creators-title">Creadores listos para tu encargo</h2>
            <p className="section-subtext">
              Explora portafolios verificados y agenda directamente con el artista ideal.
            </p>
          </div>
          <Link to="/explorar" className="link-arrow-action">
            Ver catálogo completo <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {loadingArtists ? (
          <p>Cargando creadores destacados...</p>
        ) : (
          <div className="artist-grid directory-grid">
            {featuredArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>

      {/* ── 3. ASÍ LUCE EL ESPACIO DE UN ARTISTA EN ARTLINK ── */}
      <section className="featured-space-showcase" aria-labelledby="showcase-title">
        <div className="showcase-header">
          <span className="sticker sticker-mint">
            <DecorativeStar size={13} color="#1E192B" /> EXPERIENCIA TRANSPARENTE
          </span>
          <h2 id="showcase-title">Así luce el espacio de un artista en ArtLink</h2>
          <p>
            Sin tarifas ocultas, con tiempos de entrega claros y comunicación transparente del boceto al arte final.
          </p>
        </div>

        <div className="showcase-profile-card paper-card">
          <div className="showcase-banner-bar">
            <span className="showcase-tag-top">
              <DecorativeStar size={12} color="#8B5CF6" /> PERFIL DE EJEMPLO · SOFÍA CHEN
            </span>
            <AvailabilityBadge status="open" label="DISPONIBLE AHORA" />
          </div>

          <div className="showcase-profile-header">
            <div className="showcase-avatar-box">
              <span className="avatar avatar-large avatar-fallback" style={{ background: '#F472B6', color: '#1E192B' }}>SC</span>
            </div>
            <div className="showcase-profile-info">
              <div className="showcase-name-row">
                <h3>Sofía Chen (SofiArt)</h3>
                <BadgeCheck size={18} color="#8B5CF6" aria-label="Artista verificada" />
              </div>
              <p className="showcase-bio">
                Ilustradora editorial y concept artist. Especializada en escenas acogedoras y personajes de fantasía.
              </p>
              <div className="showcase-stats-row">
                <StarRating value={5.0} size={15} label="5.0 de 5 estrellas" />
                <span>· Madrid, ES ·</span>
                <span className="text-mint"><strong>3/5 cupos activos</strong></span>
              </div>
            </div>

            <div className="showcase-actions">
              <Link to="/artista/artist-1" className="button button-outline button-small">
                Ver perfil
              </Link>
              <Link to="/solicitudes/nueva/artist-1" className="button button-primary button-small">
                Solicitar comisión <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="showcase-body-grid">
            <div className="showcase-samples-col">
              <div className="samples-header">
                <strong>Muestras de portafolio</strong>
              </div>
              <div className="samples-grid">
                <div className="sample-thumb-card">
                  <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80" alt="Muestra 1" />
                </div>
                <div className="sample-thumb-card">
                  <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80" alt="Muestra 2" />
                </div>
              </div>
            </div>

            <div className="showcase-rates-col">
              <div className="rates-header">
                <strong>Tarifario y entregables</strong>
              </div>
              <ul className="rates-list">
                <li className="rate-item">
                  <div>
                    <strong>Busto / Icon para redes</strong>
                    <small>Entrega: 5 días · 2 revisiones</small>
                  </div>
                  <strong className="rate-price">$45 USD</strong>
                </li>
                <li className="rate-item">
                  <div>
                    <strong>Ilustración medio cuerpo</strong>
                    <small>Entrega: 7 días · 3 revisiones</small>
                  </div>
                  <strong className="rate-price">$85 USD</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORÍAS POPULARES ── */}
      <section className="section-categories" aria-labelledby="popular-categories-title">
        <div className="section-header-flex">
          <div>
            <span className="sticker sticker-yellow">
              <DecorativeStar size={12} color="#1E192B" /> EXPLORA POR DISCIPLINA
            </span>
            <h2 id="popular-categories-title">Categorías Populares</h2>
          </div>
          <Link to="/explorar" className="link-arrow-action">
            Ver todas <ArrowRight size={16} aria-hidden="true" />
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

      {/* Asistente Flotante */}
      <AssistantWidget />
    </div>
  )
}
