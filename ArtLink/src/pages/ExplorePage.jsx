import { Filter, Heart, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArtistCard from '../components/ArtistCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import SectionHeading from '../components/SectionHeading'
import useArtists from '../hooks/useArtists'
import useFavorites from '../hooks/useFavorites'
import { filterArtists, getArtistOptions, sortArtists } from '../utils/artistFilters'

const defaultFilters = {
  query: '',
  discipline: '',
  style: '',
  availability: '',
  maxPrice: '',
  sort: 'relevance',
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { artists, loading, error, reload } = useArtists()
  const favorites = useFavorites()
  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [filters, setFilters] = useState(() => ({
    query: searchParams.get('q') || '',
    discipline: searchParams.get('discipline') || '',
    style: searchParams.get('style') || '',
    availability: searchParams.get('availability') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'relevance',
  }))

  /* Debounce del campo de búsqueda → actualiza filtros y URL */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((f) => ({ ...f, query: queryInput }))
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (queryInput) next.set('q', queryInput)
        else next.delete('q')
        return next
      }, { replace: true })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [queryInput, setSearchParams])

  function updateFilter(name, value) {
    setFilters((f) => ({ ...f, [name]: value }))
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(name, value)
      else next.delete(name)
      return next
    }, { replace: true })
  }

  function resetFilters() {
    setQueryInput('')
    setOnlyFavorites(false)
    setFilters(defaultFilters)
    setSearchParams({}, { replace: true })
  }

  const pool = onlyFavorites
    ? artists.filter((a) => favorites.ids.includes(a.id))
    : artists

  const visibleArtists = useMemo(
    () => sortArtists(filterArtists(pool, filters), filters.sort),
    [pool, filters],
  )

  const disciplines = useMemo(() => getArtistOptions(artists, 'disciplines'), [artists])
  const styles = useMemo(() => getArtistOptions(artists, 'styles'), [artists])

  const hasActiveFilters =
    filters.query || filters.discipline || filters.style || filters.availability || filters.maxPrice || onlyFavorites

  return (
    <section className="directory-page" aria-labelledby="explore-title">
      <SectionHeading
        eyebrow="Directorio creativo"
        title="Encuentra a tu próxima colaboración"
        description="Busca por nombre, estilo o disciplina y guarda tus artistas favoritos."
      />

      {/* Barra de búsqueda principal */}
      <form
        className="search-row explore-search"
        role="search"
        aria-label="Buscar artistas"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="search-bar" htmlFor="explore-search-input">
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Buscar artistas</span>
          <input
            id="explore-search-input"
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Busca por nombre o username"
          />
        </label>
      </form>

      <div className="directory-layout">
        {/* ── Sidebar de filtros ── */}
        <aside className="filter-panel" aria-label="Filtros del directorio">
          <div className="filter-heading">
            <h2><SlidersHorizontal size={19} aria-hidden="true" /> Filtrar</h2>
            {hasActiveFilters && (
              <button className="reset-button" type="button" onClick={resetFilters}>
                <RotateCcw size={14} aria-hidden="true" /> Limpiar
              </button>
            )}
          </div>

          <label htmlFor="filter-discipline">
            Disciplina
            <select
              id="filter-discipline"
              value={filters.discipline}
              onChange={(e) => updateFilter('discipline', e.target.value)}
            >
              <option value="">Todas</option>
              {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label htmlFor="filter-style">
            Estilo
            <select
              id="filter-style"
              value={filters.style}
              onChange={(e) => updateFilter('style', e.target.value)}
            >
              <option value="">Todos</option>
              {styles.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label htmlFor="filter-availability">
            Disponibilidad
            <select
              id="filter-availability"
              value={filters.availability}
              onChange={(e) => updateFilter('availability', e.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="open">Disponible ahora</option>
              <option value="waitlist">Lista de espera</option>
              <option value="closed">Agenda cerrada</option>
            </select>
          </label>

          <label htmlFor="filter-price">
            Precio base máximo (USD)
            <input
              id="filter-price"
              type="number"
              min="0"
              step="10"
              placeholder="Sin límite"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />
          </label>
        </aside>

        {/* ── Resultados ── */}
        <div className="directory-results">
          <div className="results-toolbar">
            <p aria-live="polite" aria-atomic="true">
              {loading
                ? 'Buscando artistas...'
                : `${visibleArtists.length} artista${visibleArtists.length !== 1 ? 's' : ''} encontrado${visibleArtists.length !== 1 ? 's' : ''}`}
            </p>
            <div className="results-toolbar-actions">
              <button
                className={`filter-button favorites-filter ${onlyFavorites ? 'is-active' : ''}`}
                type="button"
                aria-pressed={onlyFavorites}
                onClick={() => setOnlyFavorites((v) => !v)}
              >
                <Heart
                  size={16}
                  fill={onlyFavorites ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
                Guardados ({favorites.count})
              </button>

              <label className="sort-select" htmlFor="sort-select">
                <Filter size={16} aria-hidden="true" />
                <span className="sr-only">Ordenar resultados</span>
                <select
                  id="sort-select"
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                >
                  <option value="relevance">Más relevantes</option>
                  <option value="price">Precio más bajo</option>
                  <option value="rating">Mejor calificación</option>
                </select>
              </label>
            </div>
          </div>

          {loading && <LoadingState label="Trayendo portafolios desde ArtLink" />}

          {error && <ErrorState message={error.message} onRetry={reload} />}

          {!loading && !error && visibleArtists.length === 0 && (
            <EmptyState
              title={onlyFavorites ? 'No tienes favoritos con estos filtros' : 'No encontramos ese match'}
              description={
                onlyFavorites
                  ? 'Quita el filtro "Guardados" para ver todo el directorio.'
                  : 'Prueba con otro estilo, disponibilidad o rango de precio.'
              }
            />
          )}

          {!loading && !error && visibleArtists.length > 0 && (
            <div className="artist-grid directory-grid">
              {visibleArtists.map((artist) => (
                <ArtistCard
                  artist={artist}
                  key={artist.id}
                  favorited={favorites.isFavorite(artist.id)}
                  onFavorite={favorites.toggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}