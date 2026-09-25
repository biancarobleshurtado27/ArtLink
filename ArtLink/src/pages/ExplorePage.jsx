import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Heart,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
  Star,
  BadgeCheck,
  CheckCircle2,
} from 'lucide-react'
import ArtistCard from '../components/ArtistCard'
import DecorativeStar from '../components/DecorativeStar'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
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

const STYLE_PILLS = [
  { label: 'Todos', styleValue: '' },
  { label: 'Ilustración 2D', styleValue: 'Ilustración 2D' },
  { label: 'Modelado 3D', styleValue: 'Modelado 3D' },
  { label: 'Animación', styleValue: 'Animación' },
  { label: 'Diseño Gráfico', styleValue: 'Diseño Gráfico' },
  { label: 'Pixel Art', styleValue: 'Pixel Art' },
  { label: 'Comics & WEBTOON', styleValue: 'WEBTOON' },
  { label: 'Comisiones abiertas', availabilityValue: 'open' },
]

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
    [pool, filters]
  )

  const disciplines = useMemo(() => getArtistOptions(artists, 'disciplines'), [artists])
  const stylesList = useMemo(() => getArtistOptions(artists, 'styles'), [artists])

  const hasActiveFilters =
    filters.query || filters.discipline || filters.style || filters.availability || filters.maxPrice || onlyFavorites

  return (
    <div className="directory-page-container">
      {/* ── 1. HERO BANNER DE EXPLORAR ── */}
      <header className="explore-hero" aria-labelledby="explore-title">
        <div className="explore-hero-stickers">
          <span className="sticker sticker-yellow">
            <DecorativeStar size={13} color="#1E192B" /> Edición Primavera 2026
          </span>
          <span className="sticker sticker-purple">
            <DecorativeStar size={13} color="#1E192B" /> Galería viva de creadores · Comisiones seguras
          </span>
          <span className="sticker sticker-pink">
            <DecorativeStar size={13} color="#1E192B" /> 100% Protegida
          </span>
        </div>

        <h1 id="explore-title" className="explore-hero-title">
          Encuentra el arte que <em className="hero-gradient">imaginas</em>{' '}
          <DecorativeStar size={24} color="#8B5CF6" />
        </h1>
        <p className="explore-hero-subtitle">
          Descubre artistas digitales únicos en ilustración, 3D, animación y pixel art.
          Revisa disponibilidad en tiempo real y encarga comisiones con depósito protegido.
        </p>

        {/* 3 Tarjetas de métricas y garantía */}
        <div className="explore-metrics-grid">
          <div className="explore-metric-card metric-yellow">
            <strong className="metric-number">+ 2,400</strong>
            <span className="metric-label">Artistas verificados</span>
          </div>
          <div className="explore-metric-card metric-mint">
            <strong className="metric-number">100% Seguro</strong>
            <span className="metric-label">Fondos en custodia</span>
          </div>
          <div className="explore-metric-card metric-violet">
            <strong className="metric-number">
              <Star size={16} fill="currentColor" color="#1E192B" inline /> 4.9 / 5
            </strong>
            <span className="metric-label">Satisfacción cliente</span>
          </div>
        </div>
      </header>

      {/* ── 2. BARRA DE BÚSQUEDA Y PILLS DE ESTILOS ── */}
      <section className="explore-search-section" aria-label="Búsqueda y categorías rápidas">
        <form
          className="explore-search-bar-wrap"
          role="search"
          aria-label="Buscar creadores"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="explore-search-input-box">
            <Search size={20} className="search-box-icon" aria-hidden="true" />
            <input
              id="explore-search-input"
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Descubrir artista, estilo (cyberpunk, chibi, acuarela, editorial) o técnica..."
              aria-label="Descubrir artista por estilo o técnica"
            />
            <kbd className="search-kbd-hint">CMD + K</kbd>
          </div>
          <button type="submit" className="button button-primary search-submit-btn">
            Buscar arte <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>

        {/* Fila de Pills de Estilos rápidos */}
        <div className="explore-style-pills-row">
          <span className="style-pills-label">
            <DecorativeStar size={13} color="#8B5CF6" /> ESTILOS:
          </span>
          <div className="style-pills-list">
            {STYLE_PILLS.map((pill) => {
              const isActive = pill.styleValue !== undefined
                ? filters.style === pill.styleValue
                : filters.availability === pill.availabilityValue

              return (
                <button
                  key={pill.label}
                  type="button"
                  className={`style-pill-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    if (pill.styleValue !== undefined) updateFilter('style', pill.styleValue)
                    if (pill.availabilityValue !== undefined) updateFilter('availability', pill.availabilityValue)
                  }}
                >
                  <DecorativeStar size={11} color="currentColor" /> {pill.label}
                </button>
              )
            })}
          </div>

          <div className="style-pills-right">
            <label htmlFor="quick-price-select" className="sr-only">Presupuesto máximo</label>
            <select
              id="quick-price-select"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="quick-select-pill"
            >
              <option value="">Presupuestos: Todos</option>
              <option value="50">Hasta $50 USD</option>
              <option value="100">Hasta $100 USD</option>
              <option value="200">Hasta $200 USD</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── 3. CATÁLOGO PRINCIPAL Y SIDEBAR ── */}
      <section className="explore-catalogue-section" aria-labelledby="catalogue-title">
        <div className="catalogue-heading-bar">
          <div>
            <span className="sticker sticker-pink-small">
              <DecorativeStar size={11} color="#1E192B" /> Colección Seleccionada / CREADORES EN BASE 150
            </span>
            <h2 id="catalogue-title" className="catalogue-title">Creadores listos para tu encargo</h2>
          </div>

          <div className="catalogue-heading-actions">
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

            <label className="sort-select-wrap" htmlFor="explore-sort-select">
              <span className="sort-label">Ordenado por:</span>
              <select
                id="explore-sort-select"
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="sort-select-field"
              >
                <option value="relevance">Disponibilidad inmediata</option>
                <option value="price">Precio más bajo</option>
                <option value="rating">Mejor calificación</option>
              </select>
            </label>
          </div>
        </div>

        <div className="directory-layout">
          {/* Sidebar de Filtros Detallados */}
          <aside className="filter-panel" aria-label="Filtros del directorio">
            <div className="filter-heading">
              <h2><SlidersHorizontal size={18} aria-hidden="true" /> Filtros</h2>
              {hasActiveFilters && (
                <button className="reset-button" type="button" onClick={resetFilters}>
                  <RotateCcw size={14} aria-hidden="true" /> Limpiar
                </button>
              )}
            </div>

            <label htmlFor="filter-discipline">
              Disciplina artística
              <select
                id="filter-discipline"
                value={filters.discipline}
                onChange={(e) => updateFilter('discipline', e.target.value)}
              >
                <option value="">Todas las disciplinas</option>
                {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>

            <label htmlFor="filter-style">
              Estilo visual
              <select
                id="filter-style"
                value={filters.style}
                onChange={(e) => updateFilter('style', e.target.value)}
              >
                <option value="">Todos los estilos</option>
                {stylesList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label htmlFor="filter-availability">
              Estado de disponibilidad
              <select
                id="filter-availability"
                value={filters.availability}
                onChange={(e) => updateFilter('availability', e.target.value)}
              >
                <option value="">Cualquier estado</option>
                <option value="open">Abierto ahora</option>
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
                placeholder="Ej. 100"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </label>
          </aside>

          {/* Grid de Artistas Resultantes */}
          <div className="directory-results">
            {loading && <LoadingState label="Cargando portafolios desde ArtLink..." />}

            {error && <ErrorState message={error.message} onRetry={reload} />}

            {!loading && !error && visibleArtists.length === 0 && (
              <EmptyState
                title={onlyFavorites ? 'No tienes favoritos con estos filtros' : 'No encontramos resultados'}
                description={
                  onlyFavorites
                    ? 'Desactiva el filtro "Guardados" para ver todo el catálogo.'
                    : 'Prueba ajustando la búsqueda, disciplina o rango de precio.'
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

      {/* ── 4. SECCIÓN DESTACADA: ESPACIO DE UN ARTISTA EN ARTLINK ── */}
      <section className="featured-space-showcase" aria-labelledby="showcase-title">
        <div className="showcase-header">
          <span className="sticker sticker-mint">
            <DecorativeStar size={13} color="#1E192B" /> Experiencia Transparente
          </span>
          <h2 id="showcase-title">Así luce el espacio de un artista en ArtLink</h2>
          <p>
            Sin tarifas ocultas, con tiempos de entrega claros y comunicación directa en cada etapa del boceto al arte final.
          </p>
        </div>

        {/* Card Mockup de Sofía Chen */}
        <div className="showcase-profile-card paper-card">
          <div className="showcase-banner-bar">
            <span className="showcase-tag-top">
              <DecorativeStar size={12} color="#8B5CF6" /> PERFIL DESTACADO DE LA SEMANA{' '}
              <DecorativeStar size={12} color="#8B5CF6" />
            </span>
            <span className="badge badge-mint showcase-status-badge">DISPONIBLE AHORA</span>
          </div>

          <div className="showcase-profile-header">
            <div className="showcase-avatar-box">
              <span className="avatar avatar-large avatar-fallback" style={{ background: '#F472B6', color: '#1E192B' }}>SC</span>
            </div>
            <div className="showcase-profile-info">
              <div className="showcase-name-row">
                <h3>Sofía Chen (SofiArt)</h3>
                <BadgeCheck size={18} color="#8B5CF6" aria-label="Artista verificada" />
                <span className="badge badge-violet">PRO</span>
              </div>
              <p className="showcase-bio">
                Ilustradora editorial y concept artist para videojuegos. Especializada en mundos de fantasía acogedores y escenas crepusculares.
              </p>
              <div className="showcase-stats-row">
                <span><Star size={14} fill="#8B5CF6" color="#8B5CF6" /> 5.0 (48 reseñas)</span>
                <span>· Madrid, ES ·</span>
                <span className="text-mint"><strong>5/5 cupos activos</strong></span>
              </div>
            </div>

            <div className="showcase-actions">
              <button type="button" className="button button-outline button-small">
                <Heart size={14} aria-hidden="true" /> Guardar
              </button>
              <Link to="/artista/artist-1" className="button button-primary button-small">
                Solicitar comisión <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="showcase-body-grid">
            {/* Izquierda: Muestras Recientes */}
            <div className="showcase-samples-col">
              <div className="samples-header">
                <strong>Muestras recientes</strong>
                <span className="sticker sticker-yellow-small">
                  <CheckCircle2 size={12} aria-hidden="true" /> Impreso
                </span>
                <Link to="/artista/artist-1" className="samples-more-link">Ver galería completa (14) →</Link>
              </div>
              <div className="samples-grid">
                <div className="sample-thumb-card">
                  <div className="sample-placeholder-art bg-art-1">
                    <span className="sample-pill">Ilustración Completa (7 días)</span>
                  </div>
                </div>
                <div className="sample-thumb-card">
                  <div className="sample-placeholder-art bg-art-2">
                    <span className="sample-pill">Medio cuerpo (3 días)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Derecha: Tarifario & Entregables */}
            <div className="showcase-rates-col">
              <div className="rates-header">
                <strong>
                  <DecorativeStar size={14} color="#8B5CF6" /> Tarifario & Entregables
                </strong>
                <span className="text-mint-small">
                  <DecorativeStar size={11} color="#0F5C4F" /> Disponibilidad real
                </span>
              </div>
              <ul className="rates-list">
                <li className="rate-item">
                  <div>
                    <strong>Busto / Icon para redes</strong>
                    <small>Entrega estimada: 5 días · PAGO PLANO</small>
                  </div>
                  <strong className="rate-price">$45 USD</strong>
                </li>
                <li className="rate-item">
                  <div>
                    <strong>Medio cuerpo a todo color</strong>
                    <small>Entrega estimada: 7 días · 2 REVISIONES</small>
                  </div>
                  <strong className="rate-price">$85 USD</strong>
                </li>
                <li className="rate-item">
                  <div>
                    <strong>Ilustración compleja + Fondo</strong>
                    <small>Entrega estimada: 14 días · ILUSTRACIÓN FULL</small>
                  </div>
                  <strong className="rate-price">$160 USD</strong>
                </li>
              </ul>
              <p className="rates-footnote">
                Estimación en días laborales tras aprobar el boceto inicial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BANNER INFERIOR PARA CREADORES ── */}
      <section className="explore-bottom-cta paper-card" aria-labelledby="cta-seller-title">
        <span className="sticker sticker-purple">
          <DecorativeStar size={13} color="#1E192B" /> ¿Eres ilustrador o modelador?
        </span>
        <h2 id="cta-seller-title">Abre tu vitrina y gestiona tus comisiones sin desorden</h2>
        <p>
          Automatiza tarifas de espacio, recibe pagos internacionales protegidos y presenta tus tarifas con la calidad de tu propio cuaderno de bocetos.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/registro?role=artist">
            Empezar a vender
          </Link>
          <Link className="button button-secondary" to="/como-funciona">
            Ver cómo funciona
          </Link>
        </div>
      </section>
    </div>
  )
}