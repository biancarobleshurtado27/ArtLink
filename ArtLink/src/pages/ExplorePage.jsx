import { useEffect, useMemo, useState } from 'react'
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
  Star,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import FloatingStars from '../components/FloatingStars'
import useDiscoverData from '../hooks/useDiscoverData'
import useAuth from '../hooks/useAuth'
import useFavorites from '../hooks/useFavorites'
import { getLikesByUser, likeArtwork, unlikeArtwork } from '../services/likeService'
import { getCatalogFilters, saveCatalogFilters } from '../services/persistence/syncService'
import { handleImageError } from '../utils/imageFallback'
import { RANKING_EMPTY_MESSAGE, getAvailabilityStatus, getArtistWorks } from '../utils/discoverData'

const AVAILABILITY_BADGE_CLASS = {
  open: 'badge-mint',
  waitlist: 'badge-lilac',
  closed: 'badge-lilac',
  unknown: 'badge-lilac',
}

const ITEMS_PER_PAGE = 8

export default function ExplorePage() {
  const [searchParams] = useSearchParams()
  const {
    artworks,
    artists,
    portfolioItems,
    publicArtworks,
    categoryOptions,
    ranking,
    loading,
    error,
    reload,
  } = useDiscoverData()

  const { user } = useAuth()
  const favorites = useFavorites()
  const initialSavedFilters = useMemo(() => getCatalogFilters(user?.id, {}), [user?.id])

  // Estados de búsqueda y filtros persistentes
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || initialSavedFilters.searchQuery || '')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || initialSavedFilters.searchQuery || '')
  const [openSlotsOnly, setOpenSlotsOnly] = useState(() => initialSavedFilters.openSlotsOnly ?? false)
  const [selectedSort, setSelectedSort] = useState(() => initialSavedFilters.selectedSort || 'popular')
  const [viewMode, setViewMode] = useState(() => initialSavedFilters.viewMode || 'grid')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('categoria') || initialSavedFilters.selectedCategory || 'all')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Sincronizar parámetro de búsqueda de la URL
  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam !== null) {
      setSearchInput(qParam)
      setSearchQuery(qParam)
    }
  }, [searchParams])

  // Ejecutar búsqueda explícitamente al presionar Enter o enviar formulario
  const handleExecuteSearch = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    setSearchQuery(searchInput)
    setCurrentPage(1)
    const el = document.getElementById('destacadas-section-header')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Guardar filtros en almacenamiento persistente al cambiar
  useEffect(() => {
    saveCatalogFilters(user?.id, {
      searchQuery,
      openSlotsOnly,
      selectedSort,
      viewMode,
      selectedCategory,
    })
  }, [user?.id, searchQuery, openSlotsOnly, selectedSort, viewMode, selectedCategory])

  // Estados de Likes persistentes sincronizados con JSON Server
  const [likedMap, setLikedMap] = useState({})

  useEffect(() => {
    let active = true
    if (!user?.id) return

    getLikesByUser(user.id)
      .then((likes) => {
        if (!active) return
        const map = {}
        ;(likes || []).forEach((l) => {
          map[l.portfolioItemId] = true
        })
        setLikedMap(map)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [user?.id])

  async function toggleLike(id) {
    const isCurrentlyLiked = Boolean(likedMap[id])
    // Actualización optimista
    setLikedMap((prev) => ({ ...prev, [id]: !isCurrentlyLiked }))

    if (!user?.id) return

    try {
      if (isCurrentlyLiked) {
        await unlikeArtwork(user.id, id)
      } else {
        await likeArtwork(user.id, id)
      }
    } catch (err) {
      console.error('[ExplorePage] Error al sincronizar me gusta, revirtiendo:', err)
      // Revertir cambio
      setLikedMap((prev) => ({ ...prev, [id]: isCurrentlyLiked }))
    }
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

  // Enriquecer cada artista con sus obras asociadas, disponibilidad y métricas
  const enrichedArtists = useMemo(() => {
    return (artists || []).map((artist) => {
      const works = getArtistWorks(portfolioItems, artist.id)
      const availability = getAvailabilityStatus(artist)
      const totalLikes = works.reduce((sum, w) => sum + (Number(w.likes) || 0), 0)
      return {
        ...artist,
        works,
        workCount: works.length,
        availability,
        totalLikes,
      }
    })
  }, [artists, portfolioItems])

  // Filtrado reactivo de artistas sobre los datos del servidor
  const filteredArtists = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    const list = enrichedArtists.filter((artist) => {
      // 1. Disponibilidad de cupos
      if (openSlotsOnly && artist.availability.tone !== 'open') return false

      // 2. Filtro de Categoría
      if (selectedCategory !== 'all') {
        const cat = categoryOptions.find((c) => c.id === selectedCategory)
        const catName = (cat?.label || '').toLowerCase()
        const matchCategory =
          (artist.disciplines || []).some((d) => d.toLowerCase().includes(catName) || catName.includes(d.toLowerCase())) ||
          (artist.styles || []).some((s) => s.toLowerCase().includes(catName) || catName.includes(s.toLowerCase())) ||
          (artist.works || []).some((w) => (w.category || '').toLowerCase().includes(catName) || catName.includes((w.category || '').toLowerCase()))
        if (!matchCategory) return false
      }

      // 3. Búsqueda por texto (nombre, usuario, biografía, disciplinas, estilos u obras)
      if (query) {
        const searchCorpus = [
          artist.displayName,
          artist.name,
          artist.username,
          artist.bio,
          ...(artist.disciplines || []),
          ...(artist.styles || []),
          ...(artist.works || []).map((w) => `${w.title} ${w.description}`),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!searchCorpus.includes(query)) return false
      }

      return true
    })

    return [...list].sort((first, second) => {
      if (selectedSort === 'popular') {
        return (second.totalLikes || second.rating * 10) - (first.totalLikes || first.rating * 10)
      }
      if (selectedSort === 'recent') {
        return (second.workCount || 0) - (first.workCount || 0)
      }
      if (selectedSort === 'price_asc') {
        return (Number(first.basePrice) || 0) - (Number(second.basePrice) || 0)
      }
      if (selectedSort === 'price_desc') {
        return (Number(second.basePrice) || 0) - (Number(first.basePrice) || 0)
      }
      if (selectedSort === 'rating') {
        return (Number(second.rating) || 0) - (Number(first.rating) || 0)
      }
      return 0
    })
  }, [enrichedArtists, openSlotsOnly, selectedCategory, searchQuery, selectedSort, categoryOptions])

  const totalPages = Math.max(1, Math.ceil(filteredArtists.length / ITEMS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredArtists.length)
  const paginatedArtists = filteredArtists.slice(startIndex, endIndex)

  return (
    <div className="explore-v3-container">
      <FloatingStars variant="explore" />
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
        <form className="mega-search-top" onSubmit={handleExecuteSearch} role="search">
          <div className="mega-search-input-wrap">
            <Search size={18} className="mega-search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por estilo, personaje o artista..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExecuteSearch(e)
                }
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
            type="submit"
            className="mega-search-submit-btn"
            aria-label="Explorar Galería"
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>Explorar Galería</span>
          </button>
        </form>
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
                    {artist.username && (
                      <span className="destacada-artist-handle" style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', margin: '0.1rem 0' }}>
                        @{artist.username}
                      </span>
                    )}
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

        {/* 6. SECCIÓN: CATÁLOGO DE ARTISTAS */}
        <section className="destacadas-section" aria-labelledby="destacadas-title" id="destacadas-section-header">
          <div className="destacadas-header">
            <div className="destacadas-title-wrap">
              <h2 id="destacadas-title">Catálogo de artistas</h2>
              <span className="destacadas-counter-badge">
                {filteredArtists.length} {filteredArtists.length === 1 ? 'artista encontrado' : 'artistas encontrados'}
              </span>
            </div>
            <span className="destacadas-counter-text">
              Mostrando {filteredArtists.length > 0 ? startIndex + 1 : 0} - {endIndex} de {filteredArtists.length}
            </span>
          </div>

          {paginatedArtists.length > 0 ? (
          <div className={`destacadas-grid ${viewMode === 'list' ? 'is-list' : ''}`}>
            {paginatedArtists.map((artist) => {
              const isLiked = Boolean(likedMap[artist.id])
              const isBookmarked = favorites.isFavorite(artist.id)
              const name = artist.displayName || artist.name || 'Artista'
              const coverImg = artist.image || artist.banner || artist.coverUrl || artist.works?.[0]?.image || artist.avatar || artist.avatarUrl

              return (
                <article key={artist.id} className="destacada-card" aria-label={`Perfil de ${name}`}>
                  <div className="destacada-image-box">
                    <span className={`destacada-badge ${AVAILABILITY_BADGE_CLASS[artist.availability.tone]}`}>
                      {artist.availability.label}
                    </span>

                    {coverImg && (
                      <img
                        src={coverImg}
                        alt={`Portada de ${name}`}
                        className="destacada-img"
                        onError={handleImageError}
                      />
                    )}

                    <div className="destacada-floating-actions">
                      <button
                        type="button"
                        className={`destacada-action-btn ${isLiked ? 'is-liked' : ''}`}
                        onClick={() => toggleLike(artist.id)}
                        aria-label={`Me gusta el perfil de ${name}`}
                      >
                        <Heart size={14} fill={isLiked ? '#EF4444' : 'none'} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={`destacada-action-btn ${isBookmarked ? 'is-bookmarked' : ''}`}
                        onClick={() => favorites.toggle(artist.id)}
                        aria-label={`Guardar a ${name} en favoritos`}
                      >
                        <Bookmark size={14} fill={isBookmarked ? '#8B5CF6' : 'none'} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="destacada-info">
                    <div className="destacada-artist-row" style={{ marginBottom: '0.4rem' }}>
                      <div className="destacada-artist-left">
                        {artist.avatar && (
                          <img
                            src={artist.avatar}
                            alt={name}
                            className="destacada-artist-avatar"
                            onError={handleImageError}
                          />
                        )}
                        <div>
                          <h3 className="destacada-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                            <Link to={`/artista/${artist.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {`Artista: ${name.replace(/\s*\[DEMO\]/gi, '')}`}
                            </Link>
                          </h3>
                          <span className="destacada-artist-handle">
                            @{artist.username}
                          </span>
                        </div>
                      </div>

                      <div className="destacada-likes" title="Calificación media">
                        <Star size={13} fill="#F59E0B" color="#F59E0B" aria-hidden="true" />
                        <span style={{ fontWeight: 700, marginLeft: 2 }}>{artist.rating || 5.0}</span>
                      </div>
                    </div>

                    {artist.bio && (
                      <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: '0.35rem 0 0.65rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {artist.bio}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
                      {(artist.disciplines || []).slice(0, 2).map((disc) => (
                        <span key={disc} className="badge-pill-purple" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                          {disc}
                        </span>
                      ))}
                      {(artist.styles || []).slice(0, 2).map((st) => (
                        <span key={st} className="badge-pill-mint" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                          {st}
                        </span>
                      ))}
                    </div>

                    {artist.works && artist.works.length > 0 && (
                      <div style={{ marginBottom: '0.75rem', background: '#F9FAFB', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 700, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                            {artist.works[0].title}
                          </span>
                          <span style={{ color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Heart size={11} fill="#EF4444" color="#EF4444" aria-hidden="true" />
                            <span>{artist.works[0].likes || 0}</span>
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {artist.works.slice(0, 3).map((w) => (
                            <div
                              key={w.id}
                              style={{ position: 'relative', flex: 1, height: '46px', borderRadius: '5px', overflow: 'hidden', border: '1px solid #D1D5DB' }}
                              title={w.title}
                            >
                              <img
                                src={w.image}
                                alt={w.title}
                                className="protected-artwork-img"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={handleImageError}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="momento-card-footer" style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1.5px solid #F3F4F6' }}>
                      <div>
                        <span className="momento-price-label">Tarifa base</span>
                        <strong className="momento-price-value">
                          {artist.basePrice > 0 ? `Desde $${artist.basePrice}` : 'A consultar'}
                        </strong>
                      </div>

                      <div className="momento-actions-group">
                        <Link to={`/artista/${artist.id}`} className="momento-btn-view">
                          Ver perfil
                        </Link>
                        <Link to={`/solicitudes/nueva/${artist.id}`} className="momento-btn-quote">
                          Cotizar
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          ) : (
            <EmptyState
              title="Sin artistas para estos filtros"
              description={activeFilterCount > 0
                ? 'Ajusta la búsqueda o restablece los filtros para ver todos los artistas del catálogo.'
                : RANKING_EMPTY_MESSAGE}
            />
          )}
        </section>

        {/* 6.5 SECCIÓN: CATÁLOGO DE REFERENCIA CULTURAL (EXTERNAL) */}
        {publicArtworks && publicArtworks.length > 0 && (
          <section className="destacadas-section" aria-labelledby="external-catalog-title">
            <div className="destacadas-header">
              <div className="destacadas-title-wrap">
                <h2 id="external-catalog-title">Catálogo de Referencia Cultural</h2>
                <span className="destacadas-counter-badge">Artista destacado</span>
              </div>
              <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Artistas y obras de instituciones culturales globales (Open Access). 
                Estos registros son de referencia y no representan perfiles en la plataforma.
              </p>
            </div>

            <div className="destacadas-grid is-list">
              {publicArtworks.map((artist) => (
                <article key={artist.sourceUrl} className="destacada-card" style={{ padding: '1rem', border: '1px solid var(--color-border)' }}>
                  <div className="destacada-info" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {artist.imageUrl && (
                      <img 
                        src={artist.imageUrl} 
                        alt={artist.name} 
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} 
                        onError={handleImageError} 
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>{artist.name}</h3>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        {artist.nationality} {artist.birthDate && `(${artist.birthDate} - ${artist.deathDate})`}
                      </p>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{artist.biography}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge-mint">Fuente: {artist.sourceName}</span>
                        <span className="badge-lilac">{artist.license}</span>
                        <a href={artist.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: 'var(--color-accent-primary)', textDecoration: 'none' }}>Ver fuente original</a>
                      </div>
                    </div>
                  </div>
                  {artist.artworks && artist.artworks.length > 0 && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Obra Destacada:</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>{artist.artworks[0].title} ({artist.artworks[0].date})</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{artist.artworks[0].medium}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

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
                    setSearchInput('')
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
