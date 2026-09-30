import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  Heart,
  Bookmark,
  Sparkles,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import useDiscoverData from '../hooks/useDiscoverData'
import { handleImageError } from '../utils/imageFallback'
import { RANKING_EMPTY_MESSAGE } from '../utils/discoverData'

const AVAILABILITY_BADGE_CLASS = {
  open: 'badge-mint',
  waitlist: 'badge-lilac',
  closed: 'badge-lilac',
  unknown: 'badge-pink',
}

const ITEMS_PER_PAGE = 8

const SORT_COMPARATORS = {
  popular: (first, second) => second.likes - first.likes,
  recent: (first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
  price_asc: (first, second) => (first.artistPrice || 0) - (second.artistPrice || 0),
  price_desc: (first, second) => (second.artistPrice || 0) - (first.artistPrice || 0),
  rating: (first, second) => (second.artistRating || 0) - (first.artistRating || 0),
}


export default function ExplorePage() {
  const [searchParams] = useSearchParams()
  const {
    artworks,
    categoryOptions,
    ranking,
    loading,
    error,
    reload,
  } = useDiscoverData()

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [openSlotsOnly, setOpenSlotsOnly] = useState(false)
  const [selectedSort, setSelectedSort] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || 'all')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Estados interactivos de Likes y Bookmarks
  const [likedMap, setLikedMap] = useState({})
  const [bookmarkedMap, setBookmarkedMap] = useState({})

  function toggleLike(id) {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleBookmark(id) {
    setBookmarkedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleCategorySelect(id) {
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  function handleSortChange(sort) {
    setSelectedSort(sort)
    setCurrentPage(1)
  }

  // Número de filtros que el usuario tiene activos
  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (openSlotsOnly ? 1 : 0)

  // Filtrado reactivo de obras sobre los datos reales del portafolio
  const filteredArtworks = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    const list = artworks.filter((art) => {
      if (openSlotsOnly && art.availability.tone !== 'open') return false
      if (selectedCategory !== 'all' && !art.categoryIds.includes(selectedCategory)) return false
      if (query && !art.searchTerms.toLocaleLowerCase().includes(query)) return false
      return true
    })

    return [...list].sort(SORT_COMPARATORS[selectedSort] || SORT_COMPARATORS.popular)
  }, [artworks, openSlotsOnly, selectedCategory, searchQuery, selectedSort])

  const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredArtworks.length)
  const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex)

  return (
    <div className="explore-v3-container">
      {/* 1. HERO SECTION */}
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
          Explora {artworks.length > 0 ? artworks.length.toLocaleString('es-ES') : 'las'} piezas originales
          publicadas por la comunidad, filtra por disponibilidad de comisiones, estilos de autor y
          presupuestos transparentes.
        </p>
      </header>

      {/* 2. MEGA SEARCH & FILTER CARD */}
      <section className="explore-mega-search-card" aria-label="Buscador central de arte">
        <div className="mega-search-top">
          <div className="mega-search-input-wrap">
            <Search size={18} className="mega-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por estilo, personaje o artista..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Buscar en la galería"
            />
          </div>

          <button
            type="button"
            className={`mega-search-filters-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setFilterModalOpen(true)}
            aria-label="Abrir panel de filtros"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="mega-filters-badge" aria-label={`${activeFilterCount} filtros activos`}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="mega-search-submit-btn"
            onClick={() => {
              const el = document.getElementById('destacadas-section-header')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            aria-label="Explorar Galería"
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>Explorar Galería</span>
          </button>
        </div>
      </section>

      {loading && <LoadingState label="Cargando la galería de la comunidad" />}

      {!loading && error && (
        <ErrorState message={error.message} onRetry={reload} />
      )}

      {!loading && !error && (
        <>
        {/* 3. CONTROLES DE ORDEN Y VISTA */}
        <section className="explore-tabs-bar explore-toolbar-bar" aria-label="Controles de orden y vista">
          <div className="explore-controls-group">
            <select
              className="explore-sort-dropdown"
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label="Ordenar resultados"
            >
              <option value="popular">Más populares</option>
              <option value="recent">Más recientes</option>
              <option value="price_asc">Precio menor</option>
              <option value="price_desc">Precio mayor</option>
              <option value="rating">Mejor calificación</option>
            </select>

            <div className="view-mode-buttons" role="group" aria-label="Cambiar vista de las obras">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                aria-label="Vista en cuadrícula"
                title="Vista en cuadrícula"
              >
                <Grid size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                aria-label="Vista en lista"
                title="Vista en lista"
              >
                <List size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. CAROUSEL DE CATEGORÍAS HORIZONTAL */}
        {categoryOptions.length > 1 ? (
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
              {categoryOptions.map(({ id, label, count }) => {
                const isActive = selectedCategory === id
                return (
                  <button
                    key={id}
                    type="button"
                    className={`category-pill-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleCategorySelect(id)}
                    aria-pressed={isActive}
                  >
                    {label} ({count})
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
        ) : (
          <EmptyState
            title="Todavía no hay categorías publicadas"
            description="Aún no hay suficientes datos para generar este ranking."
          />
        )}

        {/* 5. SECCIÓN: ARTISTAS DEL MOMENTO */}
        <section className="momento-section" aria-labelledby="momento-title">
          <div className="momento-header">
            <div className="momento-title-wrap">
              <div className="momento-icon-badge" aria-hidden="true">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 id="momento-title">Artistas del Momento</h2>
                <p>Creadores ordenados por valoración, encargos completados y obras publicadas</p>
              </div>
            </div>

            <div className="momento-arrows">
              <button
                type="button"
                className="carousel-arrow-btn"
                aria-label="Anterior artista"
                onClick={() => {
                  const el = document.getElementById('momento-cards-container')
                  if (el) el.scrollBy({ left: -320, behavior: 'smooth' })
                }}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="carousel-arrow-btn"
                aria-label="Siguiente artista"
                onClick={() => {
                  const el = document.getElementById('momento-cards-container')
                  if (el) el.scrollBy({ left: 320, behavior: 'smooth' })
                }}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {ranking.length > 0 ? (
            <div className="momento-cards-grid" id="momento-cards-container">
              {ranking.map((artist) => {
                const name = artist.displayName || artist.name
                const thumbs = artist.works.filter((work) => work.image).slice(0, 3)
                return (
              <article key={artist.id} className="momento-artist-card" aria-label={`Perfil de ${name}`}>
                <span className={`momento-card-badge ${AVAILABILITY_BADGE_CLASS[artist.availability.tone]}`}>
                  {artist.availability.label}
                </span>

                <div className="momento-artist-header">
                  {artist.avatar && (
                    <img
                      src={artist.avatar}
                      alt={name}
                      className="momento-artist-avatar"
                      onError={handleImageError}
                    />
                  )}
                  <div>
                    <h3 className="momento-artist-name">{name}</h3>
                    <p className="momento-artist-tag">{(artist.disciplines || []).join(' · ')}</p>
                  </div>
                </div>

                {thumbs.length > 0 && (
                  <div className="momento-thumbnails-row">
                    {thumbs.map((thumb) => (
                      <img
                        key={thumb.id}
                        src={thumb.image}
                        alt={`Obra de ${name}`}
                        className="momento-thumbnail"
                        onError={handleImageError}
                      />
                    ))}
                  </div>
                )}

                <div className="momento-card-footer">
                  <div>
                    <span className="momento-price-label">Tarifa base</span>
                    <strong className="momento-price-value">
                      {artist.basePrice > 0 ? `Desde $${artist.basePrice}` : 'Sin tarifa publicada'}
                    </strong>
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
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="Artistas del Momento"
              description={RANKING_EMPTY_MESSAGE}
            />
          )}
        </section>

        {/* 6. SECCIÓN: OBRAS DESTACADAS EN LA COMUNIDAD */}
        <section className="destacadas-section" aria-labelledby="destacadas-title" id="destacadas-section-header">
          <div className="destacadas-header">
            <div className="destacadas-title-wrap">
              <h2 id="destacadas-title">Obras Destacadas en la Comunidad</h2>
              <span className="destacadas-counter-badge">{filteredArtworks.length} Encontradas</span>
            </div>
            <span className="destacadas-counter-text">
              Mostrando {filteredArtworks.length > 0 ? startIndex + 1 : 0} - {endIndex} de {filteredArtworks.length}
            </span>
          </div>

          {paginatedArtworks.length > 0 ? (
          <div className={`destacadas-grid ${viewMode === 'list' ? 'is-list' : ''}`}>
            {paginatedArtworks.map((art) => {
              const isLiked = Boolean(likedMap[art.id])
              const isBookmarked = Boolean(bookmarkedMap[art.id])
              const displayLikes = (art.likes + (isLiked ? 1 : 0)).toLocaleString('es-ES')

              return (
                <article key={art.id} className="destacada-card" aria-label={art.title}>
                  <div className="destacada-image-box">
                    <span className={`destacada-badge ${AVAILABILITY_BADGE_CLASS[art.availability.tone]}`}>
                      {art.availability.label}
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
                        {art.artistAvatar && (
                          <img
                            src={art.artistAvatar}
                            alt={art.artistName}
                            className="destacada-artist-avatar"
                            onError={handleImageError}
                          />
                        )}
                        <span className="destacada-artist-handle">
                          {art.artistHandle || art.artistName}
                        </span>
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
          ) : (
            <EmptyState
              title="Sin obras para estos filtros"
              description={activeFilterCount > 0
                ? 'Ajusta la búsqueda o restablece los filtros para ver el portafolio completo.'
                : RANKING_EMPTY_MESSAGE}
            />
          )}
        </section>


        {/* 7. PAGINACIÓN DINÁMICA */}
        {totalPages > 1 && (
        <div className="explore-pagination-wrap">
          <div className="numeric-pagination-row" aria-label="Paginación">
            <button
              type="button"
              className="page-num-btn"
              aria-label="Página anterior"
              disabled={activePage <= 1}
              onClick={() => {
                if (activePage > 1) {
                  setCurrentPage(activePage - 1)
                  const el = document.getElementById('destacadas-section-header')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`page-num-btn ${activePage === pageNum ? 'is-active' : ''}`}
                aria-current={activePage === pageNum ? 'page' : undefined}
                onClick={() => {
                  setCurrentPage(pageNum)
                  const el = document.getElementById('destacadas-section-header')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="page-num-btn"
              aria-label="Página siguiente"
              disabled={activePage >= totalPages}
              onClick={() => {
                if (activePage < totalPages) {
                  setCurrentPage(activePage + 1)
                  const el = document.getElementById('destacadas-section-header')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        )}

        {/* 8. MODAL DE FILTROS DETALLADOS */}
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
                  <label htmlFor="modal-filter-discipline">Categoría de la obra</label>
                  <select
                    id="modal-filter-discipline"
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                  >
                    {categoryOptions.map(({ id, label }) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
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
                    <option value="rating">Mejor calificación</option>
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
                    setCurrentPage(1)
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
        </>
      )}
    </div>
  )
}
