import { ArrowRight, Check, Sparkles, TrendingUp, Users, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ArtistCard from '../components/ArtistCard'
import AssistantWidget from '../components/AssistantWidget'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import SearchBar from '../components/SearchBar'
import SectionHeading from '../components/SectionHeading'
import useArtists from '../hooks/useArtists'
import useCategories from '../hooks/useCategories'
import useFavorites from '../hooks/useFavorites'

const demoMetrics = [
  { value: '+2,400', label: 'Artistas activos', icon: Users },
  { value: '100%', label: 'Información centralizada', icon: TrendingUp },
  { value: '4.9/5', label: 'Satisfacción media', icon: Zap },
]

const CATEGORY_SLUGS = ['ilustracion-2d', 'modelado-3d', 'animacion', 'pixel-art', 'emotes']

export default function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { artists, loading: artistsLoading, error: artistsError } = useArtists()
  const { categories, loading: categoriesLoading } = useCategories()
  const favorites = useFavorites()

  const featuredArtists = useMemo(
    () => artists.filter((a) => a.verified).slice(0, 3),
    [artists],
  )

  function handleSearch() {
    navigate(`/explorar${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  const visibleCategories = categories.filter((c) => CATEGORY_SLUGS.includes(c.slug))

  return (
    <>
      {/* ── 1. HERO ──────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="sticker hero-sticker">
            <Sparkles size={13} aria-hidden="true" /> Hecho a mano
          </span>
          <p className="eyebrow">Un lugar para hacer clic con tu próxima idea</p>
          <h1 id="hero-title">
            Encuentra el arte que <em>imaginas.</em>
          </h1>
          <p className="hero-description">
            ArtLink centraliza artistas, portafolios, precios y disponibilidad para que puedas
            pasar de una idea a una colaboración sin perderte en el camino.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/explorar">
              Explorar artistas <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button-secondary" to="/registro">
              Crear perfil
            </Link>
          </div>
        </div>

        <div className="hero-art" aria-label="Presentación visual de ArtLink" aria-hidden="true">
          <div className="hero-note">
            <span className="eyebrow">Nota de estudio 001</span>
            <h2>Tu idea, en buenas manos.</h2>
            <p>Portafolios reales, comisiones claras y conexiones creativas sin ruido.</p>
            <div className="hero-note-footer">
              <span>artistas independientes</span>
              <span aria-hidden="true">✦ ✦ ✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BUSCADOR + CHIPS ───────────────────────────────── */}
      <section className="home-search-section" aria-labelledby="search-title">
        <SectionHeading
          eyebrow="Busca sin perder la chispa"
          title="Tu próximo descubrimiento está a un filtro de distancia"
        />
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          placeholder="Busca por nombre, estilo o disciplina"
        />
        <div className="category-chips" aria-label="Categorías populares">
          {categoriesLoading ? (
            <span className="chip-placeholder">Cargando categorías...</span>
          ) : (
            visibleCategories.map((cat) => (
              <Link
                className="category-chip"
                key={cat.id}
                to={`/explorar?discipline=${encodeURIComponent(cat.name)}`}
              >
                {cat.name} <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ── 3. MÉTRICAS ──────────────────────────────────────── */}
      <section className="metrics-strip" aria-label="Métricas de ArtLink">
        {demoMetrics.map(({ value, label, icon: Icon }) => (
          <div className="metric" key={label}>
            <Icon size={18} aria-hidden="true" className="metric-icon" />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      {/* ── 4. ARTISTAS DESTACADOS ───────────────────────────── */}
      <section aria-labelledby="featured-title">
        <SectionHeading
          eyebrow="La selección de hoy"
          title="Personas que hacen cosas bonitas"
          description="Tres universos creativos para empezar a explorar."
          action={
            <Link className="button button-outline button-small" to="/explorar">
              Ver todos <ArrowRight size={15} aria-hidden="true" />
            </Link>
          }
        />
        {artistsLoading && <LoadingState label="Cargando artistas destacados" />}
        {artistsError && <ErrorState message={artistsError.message} />}
        {!artistsLoading && !artistsError && featuredArtists.length === 0 && (
          <EmptyState
            title="Pronto habrá artistas destacados"
            description="Inicia JSON Server para cargar el directorio demo."
          />
        )}
        {!artistsLoading && !artistsError && featuredArtists.length > 0 && (
          <div className="artist-grid">
            {featuredArtists.map((artist) => (
              <ArtistCard
                artist={artist}
                key={artist.id}
                favorited={favorites.isFavorite(artist.id)}
                onFavorite={favorites.toggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 5. WIDGET DE ARTISTA SPACE ───────────────────────── */}
      <section className="artist-space-section" aria-labelledby="space-title">
        <div className="space-copy">
          <p className="eyebrow">Más que un perfil</p>
          <h2 id="space-title">Así luce el espacio de un artista en ArtLink</h2>
          <p>
            Un solo lugar para contar quién eres, mostrar tu trabajo, definir tus precios y
            avisar cuándo tienes un hueco en la agenda.
          </p>
          <ul>
            <li><Check size={17} aria-hidden="true" /> Portafolio ordenado por disciplinas</li>
            <li><Check size={17} aria-hidden="true" /> Comisiones con precios y entregas claras</li>
            <li><Check size={17} aria-hidden="true" /> Disponibilidad visible para cada cliente</li>
          </ul>
          <div className="hero-actions">
            <Link className="button button-primary" to="/registro">
              Crear mi espacio <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button-outline" to="/para-artistas">
              Saber más
            </Link>
          </div>
        </div>
        <div className="space-preview" aria-hidden="true">
          <div className="preview-tape" />
          <div className="preview-avatar" />
          <span className="preview-line preview-line-long" />
          <span className="preview-line" />
          <div className="preview-blocks">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      {/* ── 6. CTA FINAL ─────────────────────────────────────── */}
      <section className="final-cta" aria-labelledby="cta-title">
        <span className="sticker">Tu próxima colaboración está aquí</span>
        <h2 id="cta-title">Haz espacio para las buenas ideas.</h2>
        <div>
          <Link className="button button-primary" to="/registro">Crear perfil</Link>
          <Link className="button button-secondary" to="/explorar">Explorar artistas</Link>
        </div>
      </section>

      {/* ── Asistente flotante ────────────────────────────────── */}
      <AssistantWidget />
    </>
  )
}
