import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArtistCard from '../components/ArtistCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import SearchBar from '../components/SearchBar'
import SectionHeading from '../components/SectionHeading'
import useArtists from '../hooks/useArtists'
import { filterArtists, getArtistOptions, sortArtists } from '../utils/artistFilters'

const defaultFilters = { query: '', discipline: '', style: '', availability: '', maxPrice: '', sort: 'relevance' }

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { artists, loading, error } = useArtists()
  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState(() => ({
    query: searchParams.get('q') || '',
    discipline: searchParams.get('discipline') || '',
    style: searchParams.get('style') || '',
    availability: searchParams.get('availability') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'relevance',
  }))

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => ({ ...current, query: queryInput }))
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (queryInput) next.set('q', queryInput)
        else next.delete('q')
        return next
      }, { replace: true })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [queryInput, setSearchParams])

  function updateUrl(changes) {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setSearchParams(next, { replace: true })
  }

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    updateUrl({ [name]: value })
  }

  function resetFilters() {
    setQueryInput('')
    setFilters(defaultFilters)
    setSearchParams({}, { replace: true })
  }

  const visibleArtists = useMemo(() => sortArtists(filterArtists(artists, filters), filters.sort), [artists, filters])
  const disciplines = useMemo(() => getArtistOptions(artists, 'disciplines'), [artists])
  const styles = useMemo(() => getArtistOptions(artists, 'styles'), [artists])

  return <section className="directory-page" aria-labelledby="explore-title"><SectionHeading eyebrow="Directorio creativo" title="Encuentra a tu próxima colaboración" description="Busca por nombre, estilo o disciplina y guarda un enlace con tus filtros listos." /><SearchBar value={queryInput} onChange={setQueryInput} placeholder="Busca por nombre o username" /><div className="directory-layout"><aside className="filter-panel" aria-label="Filtros del directorio"><div className="filter-heading"><h2><SlidersHorizontal size={19} aria-hidden="true" /> Filtrar</h2><button className="reset-button" type="button" onClick={resetFilters}><RotateCcw size={14} aria-hidden="true" /> Limpiar</button></div><label>Disciplina<select value={filters.discipline} onChange={(event) => updateFilter('discipline', event.target.value)}><option value="">Todas</option>{disciplines.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>Estilo<select value={filters.style} onChange={(event) => updateFilter('style', event.target.value)}><option value="">Todos</option>{styles.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>Disponibilidad<select value={filters.availability} onChange={(event) => updateFilter('availability', event.target.value)}><option value="">Cualquiera</option><option value="open">Disponible</option><option value="waitlist">Lista de espera</option><option value="closed">Agenda cerrada</option></select></label><label>Precio base máximo<input type="number" min="0" step="10" placeholder="Sin límite" value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} /></label></aside><div className="directory-results"><div className="results-toolbar"><p>{loading ? 'Buscando artistas...' : `${visibleArtists.length} artistas encontrados`}</p><label className="sort-select"><Filter size={16} aria-hidden="true" /><span className="sr-only">Ordenar resultados</span><select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="relevance">Más relevantes</option><option value="price">Precio más bajo</option><option value="rating">Mejor calificación</option></select></label></div>{loading && <LoadingState label="Trayendo portafolios desde ArtLink" />}{error && <ErrorState message={error.message} onRetry={() => window.location.reload()} />}{!loading && !error && visibleArtists.length === 0 && <EmptyState title="No encontramos ese match" description="Prueba con otro estilo, disponibilidad o rango de precio." />}{!loading && !error && visibleArtists.length > 0 && <div className="artist-grid directory-grid">{visibleArtists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}</div>}</div></div></section>
}
