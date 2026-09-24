import { ExternalLink, MapPin, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AvailabilityBadge from '../components/AvailabilityBadge'
import Badge from '../components/Badge'
import Card from '../components/Card'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import useArtistProfile from '../hooks/useArtistProfile'
import { handleImageError } from '../utils/imageFallback'

const commissionStatus = { active: 'Disponible', paused: 'Pausada' }

export default function ArtistProfilePage() {
  const { id } = useParams()
  const { profile, portfolio, commissions, loading, error } = useArtistProfile(id)
  const [selectedWork, setSelectedWork] = useState(null)

  if (loading) return <LoadingState label="Cargando perfil del artista" />
  if (error || !profile) return <ErrorState message={error?.message || 'No encontramos este artista.'} />

  const isClosed = profile.availability === 'closed'
  const isWaitlist = profile.availability === 'waitlist'

  return (
    <div className="artist-profile-page">
      {/* Portada decorativa */}
      <section className="profile-cover" aria-label={`Portada de ${profile.displayName}`}>
        <div className="profile-cover-shape" />
      </section>

      {/* Encabezado del perfil */}
      <section className="profile-header">
        <img
          className="profile-avatar"
          src={profile.avatar}
          onError={handleImageError}
          alt={`Avatar de ${profile.displayName}`}
        />
        <div className="profile-heading">
          <div className="profile-title-row">
            <div>
              <p className="eyebrow">@{profile.username}</p>
              <h1>{profile.displayName}</h1>
            </div>
            {profile.verified && <Badge tone="mint">Verificado</Badge>}
          </div>
          <div className="profile-meta">
            <span><MapPin size={16} aria-hidden="true" />{profile.location}</span>
            <span><Star size={16} fill="currentColor" aria-hidden="true" />{profile.rating.toFixed(1)} / 5</span>
            <AvailabilityBadge status={profile.availability} />
          </div>
        </div>
        <div className="profile-action">
          {isClosed ? (
            <span className="button button-primary button-disabled" aria-disabled="true">
              Solicitudes cerradas
            </span>
          ) : (
            <Link className="button button-primary" to={`/solicitudes/nueva/${profile.id}`}>
              {isWaitlist ? 'Solicitar lista de espera' : 'Solicitar comisión'}
            </Link>
          )}
          {isClosed && <p className="action-help">La agenda está cerrada por ahora. Puedes volver más adelante.</p>}
          {isWaitlist && <p className="action-help">Te avisaremos cuando haya un cupo disponible.</p>}
        </div>
      </section>

      {/* Contenido principal */}
      <div className="profile-content">
        <div className="profile-main">
          {/* Bio y etiquetas */}
          <section className="profile-section" aria-labelledby="about-title">
            <h2 id="about-title">Sobre {profile.displayName}</h2>
            <p>{profile.bio}</p>
            <div className="profile-tags">
              <div>
                <h3>Disciplinas</h3>
                <div className="tag-row">
                  {profile.disciplines.map((discipline) => (
                    <Badge key={discipline}>{discipline}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3>Estilos</h3>
                <div className="tag-row">
                  {profile.styles.map((style) => (
                    <Badge key={style} tone="soft">{style}</Badge>
                  ))}
                </div>
              </div>
            </div>
            {Object.keys(profile.socialLinks || {}).length > 0 && (
              <div className="social-links">
                <h3>Encuéntrale también</h3>
                {Object.entries(profile.socialLinks).map(([network, url]) => (
                  <a href={url} target="_blank" rel="noreferrer" key={network}>
                    <ExternalLink size={16} aria-hidden="true" />
                    {network}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Portafolio */}
          <section className="profile-section" aria-labelledby="portfolio-title">
            <div className="profile-section-heading">
              <h2 id="portfolio-title">Portafolio</h2>
              <span>{portfolio.length} proyectos</span>
            </div>
            <div className="portfolio-grid">
              {portfolio.map((item) => (
                <button
                  className="portfolio-item"
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedWork(item)}
                >
                  <img src={item.image} onError={handleImageError} alt={item.title} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Comisiones */}
          <section className="profile-section" aria-labelledby="commissions-title">
            <h2 id="commissions-title">Comisiones</h2>
            <div className="commission-grid">
              {commissions.map((commission) => (
                <Card className="commission-card" key={commission.id}>
                  <div className="commission-card-heading">
                    <h3>{commission.title}</h3>
                    <Badge tone={commission.status === 'active' ? 'open' : 'soft'}>
                      {commissionStatus[commission.status] || commission.status}
                    </Badge>
                  </div>
                  <p>{commission.description}</p>
                  <strong>${commission.price} USD</strong>
                  <dl>
                    <div>
                      <dt>Entrega</dt>
                      <dd>{commission.deliveryDays} días</dd>
                    </div>
                    <div>
                      <dt>Revisiones</dt>
                      <dd>{commission.revisions}</dd>
                    </div>
                  </dl>
                  <details>
                    <summary>Ver términos</summary>
                    <p>{commission.terms}</p>
                  </details>
                  {commission.status === 'active' && !isClosed ? (
                    <Link
                      className="button button-small button-primary"
                      to={`/solicitudes/nueva/${profile.id}?commissionId=${commission.id}`}
                    >
                      Solicitar
                    </Link>
                  ) : (
                    <span className="button button-small button-disabled" aria-disabled="true">
                      No disponible
                    </span>
                  )}
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="profile-aside">
          <Card>
            <h2>Disponibilidad</h2>
            <AvailabilityBadge status={profile.availability} />
            <p>
              {profile.availability === 'open'
                ? `Tiene ${profile.slots} cupos disponibles.`
                : isWaitlist
                ? 'Puedes dejar tus datos para entrar a la lista.'
                : 'Su agenda se encuentra temporalmente cerrada.'}
            </p>
          </Card>
          <Card>
            <h2>Desde</h2>
            <strong className="profile-price">${profile.basePrice} USD</strong>
            <p>Precio base orientativo. El precio final se confirma en la solicitud.</p>
          </Card>
        </aside>
      </div>

      {/* Modal de portafolio */}
      <Modal
        open={Boolean(selectedWork)}
        title={selectedWork?.title}
        onClose={() => setSelectedWork(null)}
      >
        <img
          className="portfolio-modal-image"
          src={selectedWork?.image}
          alt={selectedWork?.title || ''}
        />
        <p>{selectedWork?.description}</p>
      </Modal>
    </div>
  )
}