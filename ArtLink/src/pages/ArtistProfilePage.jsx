import { ArrowLeft, BadgeCheck, ExternalLink, MapPin, Star } from 'lucide-react'
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
  const activeCommissions = commissions.filter((c) => c.status === 'active')

  return (
    <div className="artist-profile-page">
      {/* ── Portada ── */}
      <section className="profile-cover" aria-label={`Portada de ${profile.displayName}`}>
        <div className="profile-cover-shape" />
        <div className="profile-cover-dots" aria-hidden="true" />
      </section>

      {/* ── Encabezado (avatar + nombre + acción) ── */}
      <section className="profile-header">
        <div className="profile-avatar-wrap">
          <img
            className="profile-avatar"
            src={profile.avatar}
            onError={handleImageError}
            alt={`Avatar de ${profile.displayName}`}
          />
          {profile.verified && (
            <span className="profile-verified-badge" aria-label="Artista verificado">
              <BadgeCheck size={18} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="profile-heading">
          <div className="profile-title-row">
            <div>
              <p className="eyebrow">@{profile.username}</p>
              <h1>{profile.displayName}</h1>
            </div>
            {profile.verified && <Badge tone="mint">Verificado</Badge>}
          </div>
          <div className="profile-meta">
            <span><MapPin size={15} aria-hidden="true" />{profile.location}</span>
            <span>
              <Star size={15} fill="currentColor" color="var(--violet)" aria-hidden="true" />
              {profile.rating?.toFixed(1)} / 5
            </span>
            <AvailabilityBadge status={profile.availability} />
          </div>
        </div>

        <div className="profile-action">
          {isClosed ? (
            <>
              <span className="button button-primary button-disabled" aria-disabled="true">
                Solicitudes cerradas
              </span>
              <p className="action-help">La agenda está cerrada por ahora. Vuelve más adelante.</p>
            </>
          ) : (
            <>
              <Link className="button button-primary" to={`/solicitudes/nueva/${profile.id}`}>
                {isWaitlist ? 'Solicitar lista de espera' : 'Solicitar comisión'}
              </Link>
              {isWaitlist && (
                <p className="action-help">Te avisaremos cuando haya un cupo disponible.</p>
              )}
            </>
          )}
          <Link className="back-link" to="/explorar" style={{ marginTop: '.6rem' }}>
            <ArrowLeft size={15} aria-hidden="true" /> Volver al directorio
          </Link>
        </div>
      </section>

      {/* ── Contenido principal + sidebar ── */}
      <div className="profile-content">
        {/* Main */}
        <div className="profile-main">

          {/* Bio */}
          <section className="profile-section" aria-labelledby="about-title">
            <h2 id="about-title">Sobre {profile.displayName}</h2>
            <p className="profile-bio-text">{profile.bio}</p>
            <div className="profile-tags">
              <div>
                <h3>Disciplinas</h3>
                <div className="tag-row">
                  {profile.disciplines.map((d) => (
                    <Badge key={d} tone="violet">{d}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3>Estilos</h3>
                <div className="tag-row">
                  {profile.styles.map((s) => (
                    <Badge key={s} tone="soft">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
            {Object.keys(profile.socialLinks || {}).length > 0 && (
              <div className="social-links">
                <h3>Encuéntrale también en</h3>
                {Object.entries(profile.socialLinks).map(([network, url]) => (
                  <a href={url} target="_blank" rel="noreferrer" key={network}>
                    <ExternalLink size={14} aria-hidden="true" />
                    {network}
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Portafolio */}
          <section className="profile-section" aria-labelledby="portfolio-title">
            <div className="profile-section-heading">
              <h2 id="portfolio-title">Portafolio</h2>
              <span>{portfolio.length} proyecto{portfolio.length !== 1 ? 's' : ''}</span>
            </div>
            {portfolio.length === 0 ? (
              <p className="profile-empty-note">Este artista aún no ha publicado piezas.</p>
            ) : (
              <div className="portfolio-grid">
                {portfolio.map((item) => (
                  <button
                    className="portfolio-item"
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedWork(item)}
                    aria-label={`Ver "${item.title}" en detalle`}
                  >
                    <img
                      src={item.image}
                      onError={handleImageError}
                      alt={item.title}
                      loading="lazy"
                    />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Comisiones */}
          <section className="profile-section" aria-labelledby="commissions-title">
            <h2 id="commissions-title">Comisiones</h2>
            {commissions.length === 0 ? (
              <p className="profile-empty-note">Aún no hay tarifas publicadas.</p>
            ) : (
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
                    <strong className="commission-price">${commission.price} USD</strong>
                    <dl className="commission-details">
                      <div>
                        <dt>Entrega</dt>
                        <dd>{commission.deliveryDays} días</dd>
                      </div>
                      <div>
                        <dt>Revisiones</dt>
                        <dd>{commission.revisions}</dd>
                      </div>
                    </dl>
                    {commission.terms && (
                      <details>
                        <summary>Ver términos</summary>
                        <p>{commission.terms}</p>
                      </details>
                    )}
                    {commission.status === 'active' && !isClosed ? (
                      <Link
                        className="button button-small button-primary"
                        to={`/solicitudes/nueva/${profile.id}?commissionId=${commission.id}`}
                      >
                        Solicitar esta comisión
                      </Link>
                    ) : (
                      <span className="button button-small button-disabled" aria-disabled="true">
                        No disponible
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="profile-aside">
          {/* Disponibilidad */}
          <Card>
            <h2>Disponibilidad</h2>
            <AvailabilityBadge status={profile.availability} />
            <p style={{ marginTop: '.65rem' }}>
              {profile.availability === 'open'
                ? `${profile.slots} cupo${profile.slots !== 1 ? 's' : ''} disponible${profile.slots !== 1 ? 's' : ''} ahora mismo.`
                : isWaitlist
                ? 'Puedes unirte a la lista de espera.'
                : 'La agenda está temporalmente cerrada.'}
            </p>
            {!isClosed && (
              <Link
                className="button button-primary"
                to={`/solicitudes/nueva/${profile.id}`}
                style={{ marginTop: '.85rem', width: '100%', justifyContent: 'center' }}
              >
                {isWaitlist ? 'Entrar a lista de espera' : 'Solicitar comisión'}
              </Link>
            )}
          </Card>

          {/* Precio base */}
          <Card>
            <h2>Desde</h2>
            <strong className="profile-price">${profile.basePrice} USD</strong>
            <p>Precio base orientativo. El importe final se confirma al enviar la solicitud.</p>
          </Card>

          {/* Comisiones activas (resumen rápido) */}
          {activeCommissions.length > 0 && (
            <Card>
              <h2>Tarifas activas</h2>
              <ul className="sidebar-commission-list">
                {activeCommissions.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <span className="sidebar-commission-name">{c.title}</span>
                    <span className="sidebar-commission-price">${c.price}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
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
        {selectedWork?.description && <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>{selectedWork.description}</p>}
        {selectedWork?.category && (
          <Badge tone="violet" style={{ marginTop: '.5rem' }}>{selectedWork.category}</Badge>
        )}
      </Modal>
    </div>
  )
}