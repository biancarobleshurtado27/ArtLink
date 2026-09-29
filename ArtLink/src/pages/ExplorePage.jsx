import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  Check,
  Heart,
  Bookmark,
  Sparkles,
  Zap,
  Users,
  Layers,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  RotateCcw
} from 'lucide-react'
import { handleImageError } from '../utils/imageFallback'

const TRENDING_TAGS = [
  { tag: '#Anime2D', color: 'tag-pink' },
  { tag: '#CharacterSheet', color: 'tag-mint' },
  { tag: '#FantasyLandscape', color: 'tag-lilac' },
  { tag: '#VtuberModel', color: 'tag-pink' },
  { tag: '#PixelArtRPG', color: 'tag-yellow' },
  { tag: '#DarkFantasy', color: 'tag-purple' },
  { tag: '#3DAssetsUnity', color: 'tag-cyan' },
]

const CATEGORIES = [
  { id: 'all', label: 'Todas las Obras', count: '4.2k' },
  { id: '2d', label: 'Ilustración 2D', count: '1.8k obras' },
  { id: '3d', label: 'Modelado 3D & CG', count: '940 obras' },
  { id: 'animation', label: 'Animación & Rigging', count: '420 obras' },
  { id: 'concept', label: 'Concept Art & Dev', count: '610 obras' },
  { id: 'pixel', label: 'Pixel Art & Game', count: '380 obras' },
  { id: 'chibi', label: 'Chibi & Emotes', count: '520 obras' },
]

const FEATURED_ARTISTS = [
  {
    id: 'artist-001',
    name: 'Renzo Miyazaki',
    tag: 'Anime Mecha & Cyberpunk',
    badge: 'Cupos abiertos · 2 libres',
    badgeClass: 'badge-mint',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    price: 85,
    thumbs: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'artist-002',
    name: 'Sora Lin',
    tag: 'Chibi & Twitch Emotes',
    badge: 'Entrega 48h',
    badgeClass: 'badge-pink',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    price: 35,
    thumbs: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'artist-003',
    name: 'Valerie Cruz',
    tag: 'Modelado 3D & Escultura',
    badge: '1 cupo restante',
    badgeClass: 'badge-lilac',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    price: 110,
    thumbs: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'artist-004',
    name: 'Airi Hoshino',
    tag: 'Live2D Rigging & VTuber',
    badge: 'Top Rated 5.0 ★',
    badgeClass: 'badge-magenta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    price: 220,
    thumbs: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    ],
  },
]

const COMMUNITY_ARTWORKS = [
  {
    id: 'art-1',
    title: 'Nebula Witch Guardian',
    badge: 'Comisión abierta · Desde $80',
    badgeClass: 'badge-mint',
    artist: '@celesta_art',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 1420,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    category: '2d',
    openSlots: true,
    tags: ['#Anime2D', '#DarkFantasy'],
  },
  {
    id: 'art-2',
    title: 'Mecha Cyber Samurai 3D',
    badge: 'Modelado 3D',
    badgeClass: 'badge-pink',
    artist: '@kenji_mecha',
    artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-003',
    likes: 892,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    category: '3d',
    openSlots: true,
    tags: ['#3DAssetsUnity', '#CharacterSheet'],
  },
  {
    id: 'art-3',
    title: 'Cozy Coffee Shop Pixel Scene',
    badge: 'Pixel Art · Asset Pack',
    badgeClass: 'badge-mint',
    artist: '@pixel_dan',
    artistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-002',
    likes: 2100,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    category: 'pixel',
    openSlots: true,
    tags: ['#PixelArtRPG'],
  },
  {
    id: 'art-4',
    title: 'Aoi Vtuber Model & Rig',
    badge: 'Cupos cerrados',
    badgeClass: 'badge-lilac',
    artist: '@erikasia_v',
    artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-004',
    likes: 3400,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    category: 'animation',
    openSlots: false,
    tags: ['#VtuberModel'],
  },
  {
    id: 'art-5',
    title: 'Pastel Dream Garden',
    badge: 'Comisión abierta · Desde $95',
    badgeClass: 'badge-mint',
    artist: '@hana_draws',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-001',
    likes: 1900,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    category: 'concept',
    openSlots: true,
    tags: ['#FantasyLandscape'],
  },
  {
    id: 'art-6',
    title: 'Dragon Knight OC Portrait',
    badge: 'Desde $120',
    badgeClass: 'badge-lilac',
    artist: '@lucas_v',
    artistAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-003',
    likes: 780,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    category: '2d',
    openSlots: true,
    tags: ['#CharacterSheet', '#DarkFantasy'],
  },
  {
    id: 'art-7',
    title: 'Arcade Glow Emote Set',
    badge: 'Pack 6 Emotes · $45',
    badgeClass: 'badge-pink',
    artist: '@chibi_mochi',
    artistAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-002',
    likes: 1100,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'chibi',
    openSlots: true,
    tags: ['#PixelArtRPG'],
  },
  {
    id: 'art-8',
    title: 'Cyberpunk Alleyway Scene',
    badge: 'Desde $150',
    badgeClass: 'badge-magenta',
    artist: '@neon_brush',
    artistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    artistId: 'artist-004',
    likes: 2500,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    category: 'concept',
    openSlots: true,
    tags: ['#FantasyLandscape', '#DarkFantasy'],
  },
]

export default function ExplorePage() {
  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [activeTab, setActiveTab] = useState('obras')
  const [openSlotsOnly, setOpenSlotsOnly] = useState(false)
  const [selectedSort, setSelectedSort] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  // Estados interactivos de Likes y Bookmarks
  const [likedMap, setLikedMap] = useState({})
  const [bookmarkedMap, setBookmarkedMap] = useState({})

  function toggleLike(id) {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleBookmark(id) {
    setBookmarkedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleTagClick(tag) {
    setSearchQuery(tag)
  }

  // Filtrado reactivo de obras
  const filteredArtworks = useMemo(() => {
    return COMMUNITY_ARTWORKS.filter((art) => {
      if (openSlotsOnly && !art.openSlots) return false
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = art.title.toLowerCase().includes(q)
        const matchesArtist = art.artist.toLowerCase().includes(q)
        const matchesTag = art.tags.some((t) => t.toLowerCase().includes(q))
        if (!matchesTitle && !matchesArtist && !matchesTag) return false
      }

      return true
    })
  }, [openSlotsOnly, selectedCategory, searchQuery])

  return (
    <div className="explore-v3-container">
      {/* ── 1. HERO SECTION ── */}
      <header className="explore-v3-hero" aria-labelledby="explore-hero-title">
        <div className="explore-v3-eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          <span>GALERÍA VIVA & MERCADO CREATIVO</span>
          <Sparkles size={14} aria-hidden="true" />
        </div>

        <h1 id="explore-hero-title" className="explore-v3-title">
          Descubre arte extraordinario y conecta con sus{' '}
          <span className="explore-creadores-badge">creadores</span>
        </h1>

        <p className="explore-v3-subtitle">
          Explora miles de piezas originales, filtra por disponibilidad de comisiones inmediatas,
          estilos de autor y presupuestos totalmente transparentes.
        </p>
      </header>

      {/* ── 2. MEGA SEARCH & FILTER CARD ── */}
      <section className="explore-mega-search-card" aria-label="Buscador central de arte">
        <div className="mega-search-top">
          <div className="mega-search-input-wrap">
            <Search size={18} className="mega-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por estilo, personaje o artista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar en la galería"
            />
          </div>

          <select
            className="mega-search-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filtrar por tipo de contenido"
          >
            <option value="all">Todo el contenido</option>
            <option value="2d">Ilustración 2D</option>
            <option value="3d">Modelado 3D</option>
            <option value="animation">Animación</option>
            <option value="pixel">Pixel Art</option>
            <option value="chibi">Emotes</option>
            <option value="concept">Concept Art</option>
          </select>

          <button
            type="button"
            className="mega-search-filters-btn"
            onClick={() => setFilterModalOpen(true)}
            aria-label="Abrir panel de filtros"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>Filtros</span>
            <span className="mega-filters-badge">3</span>
          </button>

          <button
            type="button"
            className="mega-search-submit-btn"
            onClick={() => {}}
            aria-label="Explorar Galería"
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>Explorar Galería</span>
          </button>
        </div>

        <div className="mega-search-bottom">
          <span className="mega-trending-label">
            <TrendingUp size={14} aria-hidden="true" />
            <span>Tendencias de hoy:</span>
          </span>

          <div className="mega-tag-pills">
            {TRENDING_TAGS.map(({ tag, color }) => (
              <button
                key={tag}
                type="button"
                className={`mega-tag-pill ${color} ${searchQuery === tag ? 'is-active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. TABS Y FILTROS RÁPIDOS ── */}
      <section className="explore-tabs-bar" aria-label="Navegación de secciones de catálogo">
        <div className="explore-tabs-group" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'obras'}
            className={`explore-tab-pill ${activeTab === 'obras' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('obras')}
          >
            <Layers size={16} aria-hidden="true" />
            <span>Todas las Obras</span>
            <span className="explore-tab-count">4.2k</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'artistas'}
            className={`explore-tab-pill ${activeTab === 'artistas' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('artistas')}
          >
            <Users size={16} aria-hidden="true" />
            <span>Directorio de Artistas</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'urgentes'}
            className={`explore-tab-pill ${activeTab === 'urgentes' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('urgentes')}
          >
            <Zap size={16} aria-hidden="true" />
            <span>Comisiones Urgentes</span>
            <span className="momento-card-badge badge-pink" style={{ padding: '0.1rem 0.35rem', marginLeft: '0.2rem' }}>•</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'curadas'}
            className={`explore-tab-pill ${activeTab === 'curadas' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('curadas')}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>Colecciones Curadas</span>
          </button>
        </div>

        <div className="explore-controls-group">
          <button
            type="button"
            className={`cupos-switch-btn ${openSlotsOnly ? 'is-active' : ''}`}
            onClick={() => setOpenSlotsOnly((prev) => !prev)}
            aria-pressed={openSlotsOnly}
          >
            <Check size={14} aria-hidden="true" />
            <span>Cupos abiertos</span>
          </button>

          <select
            className="explore-sort-dropdown"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            aria-label="Ordenar resultados"
          >
            <option value="popular">Más populares</option>
            <option value="recent">Más recientes</option>
            <option value="price_asc">Precio menor</option>
            <option value="price_desc">Precio mayor</option>
            <option value="rating">Mejor calificación</option>
          </select>

          <div className="view-mode-buttons">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Vista en cuadrícula"
            >
              <Grid size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="Vista en lista"
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. CAROUSEL DE CATEGORÍAS HORIZONTAL ── */}
      <section className="explore-carousel-bar" aria-label="Categorías artísticas">
        <button
          type="button"
          className="carousel-arrow-btn"
          aria-label="Desplazar categorías a la izquierda"
          onClick={() => {
            const el = document.getElementById('category-scroll-container')
            if (el) el.scrollBy({ left: -220, behavior: 'smooth' })
          }}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <div className="category-pills-scroll" id="category-scroll-container">
          {CATEGORIES.map(({ id, label, count }) => {
            const isActive = selectedCategory === id
            return (
              <button
                key={id}
                type="button"
                className={`category-pill-item ${isActive ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(id)}
              >
                {id === 'all' ? '✦ ' : ''}
                {label} {id !== 'all' ? `(${count})` : ''}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="carousel-arrow-btn"
          aria-label="Desplazar categorías a la derecha"
          onClick={() => {
            const el = document.getElementById('category-scroll-container')
            if (el) el.scrollBy({ left: 220, behavior: 'smooth' })
          }}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </section>

      {/* ── 5. SECCIÓN: ARTISTAS DEL MOMENTO ── */}
      <section className="momento-section" aria-labelledby="momento-title">
        <div className="momento-header">
          <div className="momento-title-wrap">
            <div className="momento-icon-badge" aria-hidden="true">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 id="momento-title">Artistas del Momento</h2>
              <p>Creadores con alta demanda y valoraciones 5 estrellas esta semana</p>
            </div>
          </div>

          <div className="momento-arrows">
            <button type="button" className="carousel-arrow-btn" aria-label="Anterior artista">
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" className="carousel-arrow-btn" aria-label="Siguiente artista">
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="momento-cards-grid">
          {FEATURED_ARTISTS.map((artist) => (
            <article key={artist.id} className="momento-artist-card" aria-label={`Perfil de ${artist.name}`}>
              <span className={`momento-card-badge ${artist.badgeClass}`}>
                {artist.badge}
              </span>

              <div className="momento-artist-header">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="momento-artist-avatar"
                  onError={handleImageError}
                />
                <div>
                  <h3 className="momento-artist-name">{artist.name}</h3>
                  <p className="momento-artist-tag">{artist.tag}</p>
                </div>
              </div>

              <div className="momento-thumbnails-row">
                {artist.thumbs.map((thumb, idx) => (
                  <img
                    key={idx}
                    src={thumb}
                    alt={`Muestra ${idx + 1} de ${artist.name}`}
                    className="momento-thumbnail"
                    onError={handleImageError}
                  />
                ))}
              </div>

              <div className="momento-card-footer">
                <div>
                  <span className="momento-price-label">Tarifa base</span>
                  <strong className="momento-price-value">Desde ${artist.price}</strong>
                </div>

                <div className="momento-actions-group">
                  <Link to={`/artista/${artist.id}`} className="momento-btn-view">
                    Ver
                  </Link>
                  <Link to={`/solicitudes/nueva/${artist.id}`} className="momento-btn-quote">
                    Cotizar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 6. SECCIÓN: OBRAS DESTACADAS EN LA COMUNIDAD ── */}
      <section className="destacadas-section" aria-labelledby="destacadas-title">
        <div className="destacadas-header">
          <div className="destacadas-title-wrap">
            <h2 id="destacadas-title">Obras Destacadas en la Comunidad</h2>
            <span className="destacadas-counter-badge">1,482 Encontradas</span>
          </div>
          <span className="destacadas-counter-text">
            Mostrando 1 - {filteredArtworks.length} de 1,482
          </span>
        </div>

        <div className="destacadas-grid">
          {filteredArtworks.map((art) => {
            const isLiked = Boolean(likedMap[art.id])
            const isBookmarked = Boolean(bookmarkedMap[art.id])
            const displayLikes = isLiked ? (art.likes + 1).toLocaleString() : art.likes.toLocaleString()

            return (
              <article key={art.id} className="destacada-card" aria-label={art.title}>
                <div className="destacada-image-box">
                  <span className={`destacada-badge ${art.badgeClass}`}>
                    {art.badge}
                  </span>

                  <img
                    src={art.image}
                    alt={art.title}
                    className="destacada-img"
                    onError={handleImageError}
                  />

                  <div className="destacada-floating-actions">
                    <button
                      type="button"
                      className={`destacada-action-btn ${isLiked ? 'is-liked' : ''}`}
                      onClick={() => toggleLike(art.id)}
                      aria-label="Me gusta esta obra"
                    >
                      <Heart size={14} fill={isLiked ? '#EF4444' : 'none'} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="destacada-action-btn"
                      onClick={() => toggleBookmark(art.id)}
                      aria-label="Guardar obra en colección"
                    >
                      <Bookmark size={14} fill={isBookmarked ? '#8B5CF6' : 'none'} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="destacada-info">
                  <h3 className="destacada-title" title={art.title}>
                    <Link to={`/artista/${art.artistId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {art.title}
                    </Link>
                  </h3>

                  <div className="destacada-artist-row">
                    <div className="destacada-artist-left">
                      <img
                        src={art.artistAvatar}
                        alt={art.artist}
                        className="destacada-artist-avatar"
                        onError={handleImageError}
                      />
                      <span className="destacada-artist-handle">{art.artist}</span>
                    </div>

                    <div className="destacada-likes">
                      <Heart size={12} fill="#EF4444" color="#EF4444" aria-hidden="true" />
                      <span>{displayLikes}</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── 7. BANNER PROMOCIONAL PARA CREADORES ── */}
      <section className="explore-promo-banner" aria-labelledby="promo-banner-title">
        <div className="promo-banner-left">
          <span className="promo-banner-eyebrow">
            ✦ CREADORES & ARTISTAS ✦
          </span>
          <h2 id="promo-banner-title" className="promo-banner-title">
            Muestra tu portafolio y cobra de forma segura en cualquier país
          </h2>
          <p className="promo-banner-desc">
            Gestiona colas de comisiones, aprueba bocetos con marcas de agua automáticas
            y recibe pagos asegurados sin sufrir cancelaciones fraudulentas.
          </p>

          <div className="promo-features-row">
            <span className="promo-feature-pill">
              <Check size={14} color="#10B981" aria-hidden="true" />
              <span>0% comisiones ocultas</span>
            </span>
            <span className="promo-feature-pill">
              <Check size={14} color="#10B981" aria-hidden="true" />
              <span>Pagos en Escrow Shield</span>
            </span>
            <span className="promo-feature-pill">
              <Check size={14} color="#10B981" aria-hidden="true" />
              <span>Gestor de revisiones integrado</span>
            </span>
          </div>
        </div>

        <div className="promo-banner-actions">
          <Link to="/registro?role=artist" className="promo-btn-primary">
            Abrir mi vitrina gratis
          </Link>
          <Link to="/como-funciona" className="promo-btn-secondary">
            Conoce tarifas y planes
          </Link>
        </div>
      </section>

      {/* ── 8. PAGINACIÓN Y CARGAR MÁS ── */}
      <div className="explore-pagination-wrap">
        <button
          type="button"
          className="load-more-big-btn"
          onClick={() => {}}
          aria-label="Cargar más obras inspiradoras"
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Cargar más obras inspiradoras (Página 1 de 24)</span>
        </button>

        <div className="numeric-pagination-row" aria-label="Paginación">
          <button type="button" className="page-num-btn" aria-label="Página anterior">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button type="button" className="page-num-btn is-active" aria-current="page">
            1
          </button>
          <button type="button" className="page-num-btn">
            2
          </button>
          <button type="button" className="page-num-btn">
            3
          </button>
          <span className="page-dots">...</span>
          <button type="button" className="page-num-btn">
            24
          </button>
          <button type="button" className="page-num-btn" aria-label="Página siguiente">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── 9. MODAL DE FILTROS DETALLADOS ── */}
      {filterModalOpen && (
        <div
          className="filter-modal-backdrop"
          onClick={() => setFilterModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-filter-heading"
        >
          <div className="filter-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3 id="modal-filter-heading">Filtros Avanzados</h3>
              <button
                type="button"
                className="filter-modal-close"
                onClick={() => setFilterModalOpen(false)}
                aria-label="Cerrar modal de filtros"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="filter-modal-grid">
              <div className="filter-field">
                <label htmlFor="modal-filter-discipline">Disciplina principal</label>
                <select
                  id="modal-filter-discipline"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Todas las disciplinas</option>
                  <option value="2d">Ilustración 2D</option>
                  <option value="3d">Modelado 3D & CG</option>
                  <option value="animation">Animación & Rigging</option>
                  <option value="concept">Concept Art & Dev</option>
                  <option value="pixel">Pixel Art & Game</option>
                  <option value="chibi">Chibi & Emotes</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="modal-filter-slots">Disponibilidad de comisiones</label>
                <select
                  id="modal-filter-slots"
                  value={openSlotsOnly ? 'open' : 'any'}
                  onChange={(e) => setOpenSlotsOnly(e.target.value === 'open')}
                >
                  <option value="any">Cualquier estado</option>
                  <option value="open">Solo cupos abiertos</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="modal-filter-sort">Criterio de ordenamiento</label>
                <select
                  id="modal-filter-sort"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  <option value="popular">Más populares</option>
                  <option value="recent">Más recientes</option>
                  <option value="price_asc">Precio: Menor a mayor</option>
                  <option value="price_desc">Precio: Mayor a menor</option>
                </select>
              </div>
            </div>

            <div className="filter-modal-footer">
              <button
                type="button"
                className="promo-btn-secondary"
                onClick={() => {
                  setSelectedCategory('all')
                  setOpenSlotsOnly(false)
                  setSearchQuery('')
                  setFilterModalOpen(false)
                }}
              >
                Restablecer
              </button>
              <button
                type="button"
                className="promo-btn-primary"
                onClick={() => setFilterModalOpen(false)}
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}