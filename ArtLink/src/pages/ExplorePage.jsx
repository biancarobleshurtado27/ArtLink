import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import ArtistCard from '../components/ArtistCard'
import DecorativeStar from '../components/DecorativeStar'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import useArtists from '../hooks/useArtists'
import useFavorites from '../hooks/useFavorites'
import { filterArtists, getArtistOptions, sortArtists } from '../utils/artistFilters'

const HORIZONTAL_CHIPS = [
  { label: 'Todos', discipline: '', style: '', availability: '' },
  { label: 'Ilustración 2D', discipline: 'Ilustración 2D' },
  { label: 'Modelado 3D', discipline: 'Modelado 3D' },
  { label: 'Animación', discipline: 'Animación' },
  { label: 'Pixel Art', discipline: 'Pixel Art' },
  { label: 'Emotes', discipline: 'Emotes' },
  { label: 'Comisiones abiertas', availability: 'open' },
]

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { artists, loading, error, reload } = useArtists()
  const favorites = useFavorites()
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Sincronización de estados locales con URL Query Params
  const query = searchParams.get('q') || ''
  const discipline = searchParams.get('discipline') || ''
  const style = searchParams.get('style') || ''
  const availability = searchParams.get('availability') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || 'relevance'

  const [inputVal, setInputVal] = useState(query)
  const [prevQuery, setPrevQuery] = useState(query)

  if (query !== prevQuery) {
    setPrevQuery(query)
    setInputVal(query)
  }

  const filters = useMemo(
    () => ({ query, discipline, style, availability, maxPrice, sort }),
    [query, discipline, style, availability, maxPrice, sort]
  )

  function updateParams(newParams) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(newParams).forEach(([key, val]) => {
        if (val) next.set(key, val)
        else next.delete(key)
      })
      return next
    }, { replace: true })
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    updateParams({ q: inputVal.trim() })
  }

  function resetFilters() {
    setInputVal('')
    setOnlyFavorites(false)
    setSearchParams({}, { replace: true })
  }

  const pool = onlyFavorites
    ? artists.filter((a) => favorites.ids.includes(a.id))
    : artists

  const visibleArtists = useMemo(
    () => sortArtists(filterArtists(pool, filters), filters.sort),
    [pool, filters]
  )

  const disciplinesList = useMemo(() => getArtistOptions(artists, 'disciplines'), [artists])
  const stylesList = useMemo(() => getArtistOptions(artists, 'styles'), [artists])

  const hasActiveFilters = Boolean(
    query || discipline || style || availability || maxPrice || onlyFavorites
  )

  return (
    <div className="directory-page-container">
      {/* ── 1. ENCABEZADO Y HERO DE EXPLORAR ── */}
      <header className="explore-hero" aria-labelledby="explore-title">
        <div className="explore-hero-stickers">
          <span className="sticker sticker-purple">
            <DecorativeStar size={13} color="#1E192B" /> CATÁLOGO DE CREADORES DIGITALES
          </span>
          <span className="sticker sticker-pink">
            <DecorativeStar size={13} color="#1E192B" /> COMISIONES PROTEGIDAS
          </span>
        </div>

        <h1 id="explore-title" className="explore-hero-title">
          Explora portafolios y <em className="hero-gradient">encarga arte</em>
        </h1>
        <p className="explore-hero-subtitle">
          Filtra por disciplina, técnica, rango de precio o estado de disponibilidad en tiempo real.
        </p>
      </header>

      {/* ── 2. BARRA DE BÚSQUEDA Y CHIPS HORIZONTALES CON SCROLL ── */}
      <section className="explore-search-section" aria-label="Búsqueda y filtros por etiquetas">
        <form className="explore-search-bar-wrap" role="search" onSubmit={handleSearchSubmit}>
          <div className="explore-search-input-box">
            <Search size={20} className="search-box-icon" aria-hidden="true" />
            <input
              id="explore-search-input"
              type="search"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Buscar por nombre, @usuario, disciplina (Ilustración 2D, 3D...)"
              aria-label="Buscar artista por nombre o técnica"
            />
          </div>
          <button type="submit" className="button button-primary search-submit-btn">
            Buscar <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>

        {/* Chips horizontales scrollables en móvil y escritorio */}
        <div className="explore-style-pills-row" aria-label="Chips de categorías principales">
          <div className="style-pills-list" style={{ overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '0.5rem', paddingBottom: '0.25rem' }}>
            {HORIZONTAL_CHIPS.map((chip) => {
              const isSelected =
                (chip.discipline && discipline === chip.discipline) ||
                (chip.availability && availability === chip.availability) ||
                (!chip.discipline && !chip.availability && !discipline && !availability)

              return (
                <button
                  key={chip.label}
                  type="button"
                  className={`style-pill-btn ${isSelected ? 'is-active' : ''}`}
                  onClick={() => {
                    updateParams({
                      discipline: chip.discipline || '',
                      availability: chip.availability || '',
                    })
                  }}
                  style={{ flexShrink: 0 }}
                >
                  <DecorativeStar size={11} color="currentColor" aria-hidden="true" /> {chip.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3. BARRA DE HERRAMIENTAS Y ORDENAMIENTO ── */}
      <section className="explore-catalogue-section" aria-labelledby="catalogue-title">
        <div className="catalogue-heading-bar">
          <div>
            <h2 id="catalogue-title" className="catalogue-title">Catálogo de Artistas</h2>
            <p className="catalogue-count-text">
              <strong>{visibleArtists.length}</strong> {visibleArtists.length === 1 ? 'artista encontrado' : 'artistas encontrados'}
            </p>
          </div>

          <div className="catalogue-heading-actions">
            {/* Botón de apertura de filtros en Móvil */}
            <button
              className="button button-outline mobile-filter-toggle-btn"
              type="button"
              onClick={() => setMobileFilterOpen((o) => !o)}
            >
              <SlidersHorizontal size={16} aria-hidden="true" /> Filtros
            </button>

            <button
              className={`filter-button favorites-filter ${onlyFavorites ? 'is-active' : ''}`}
              type="button"
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites((v) => !v)}
            >
              <Heart size={16} fill={onlyFavorites ? 'currentColor' : 'none'} aria-hidden="true" />
              Guardados ({favorites.count})
            </button>

            <label className="sort-select-wrap" htmlFor="explore-sort-select">
              <span className="sort-label">Ordenar:</span>
              <select
                id="explore-sort-select"
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="sort-select-field"
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Precio: Menor a mayor</option>
                <option value="price_desc">Precio: Mayor a menor</option>
                <option value="rating">Mejor calificación</option>
              </select>
            </label>
          </div>
        </div>

        <div className="directory-layout">
          {/* Panel de Filtros (Sidepanel en escritorio / Modal colapsable en móvil) */}
          <aside className={`filter-panel ${mobileFilterOpen ? 'is-mobile-open' : ''}`} aria-label="Filtros detallados">
            <div className="filter-heading">
              <h2><SlidersHorizontal size={18} aria-hidden="true" /> Filtros</h2>
              {hasActiveFilters && (
                <button className="reset-button" type="button" onClick={resetFilters}>
                  <RotateCcw size={14} aria-hidden="true" /> Limpiar filtros
                </button>
              )}
              {mobileFilterOpen && (
                <button
                  type="button"
                  className="mobile-filter-close-btn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Cerrar filtros"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <label htmlFor="filter-discipline">
              Disciplina artística
              <select
                id="filter-discipline"
                value={discipline}
                onChange={(e) => updateParams({ discipline: e.target.value })}
              >
                <option value="">Todas las disciplinas</option>
                {disciplinesList.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>

            <label htmlFor="filter-style">
              Estilo visual
              <select
                id="filter-style"
                value={style}
                onChange={(e) => updateParams({ style: e.target.value })}
              >
                <option value="">Todos los estilos</option>
                {stylesList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label htmlFor="filter-availability">
              Disponibilidad
              <select
                id="filter-availability"
                value={availability}
                onChange={(e) => updateParams({ availability: e.target.value })}
              >
                <option value="">Cualquier disponibilidad</option>
                <option value="open">Abierto ahora</option>
                <option value="waitlist">Lista de espera</option>
                <option value="closed">Agenda cerrada</option>
              </select>
            </label>

            <label htmlFor="filter-price">
              Precio máximo (USD)
              <input
                id="filter-price"
                type="number"
                min="0"
                step="10"
                placeholder="Ej. 150"
                value={maxPrice}
                onChange={(e) => updateParams({ maxPrice: e.target.value })}
              />
            </label>

            {hasActiveFilters && (
              <button
                className="button button-outline button-full-width"
                type="button"
                style={{ marginTop: '1rem' }}
                onClick={resetFilters}
              >
                <RotateCcw size={14} aria-hidden="true" /> Limpiar filtros
              </button>
            )}
          </aside>

          {/* Grid de Resultados */}
          <div className="directory-results">
            {loading && <LoadingState label="Cargando catálogo de creadores..." />}

            {error && <ErrorState message={error.message} onRetry={reload} />}

            {!loading && !error && visibleArtists.length === 0 && (
              <EmptyState
                title={onlyFavorites ? 'No tienes creadores en favoritos con estos filtros' : 'No se encontraron artistas'}
                description="Intenta ajustar tus términos de búsqueda, disciplina o rango de precio, o haz clic en limpiar filtros."
                action={
                  <button className="button button-primary" type="button" onClick={resetFilters}>
                    Limpiar todos los filtros
                  </button>
                }
              />
            )}

            {!loading && !error && visibleArtists.length > 0 && (
              <div className="artist-grid directory-grid">
                {visibleArtists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    favorited={favorites.isFavorite(artist.id)}
                    onFavorite={favorites.toggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}