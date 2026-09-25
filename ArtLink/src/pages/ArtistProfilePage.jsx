import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Clock, ExternalLink, MapPin, Sparkles } from 'lucide-react'
import AvailabilityBadge from '../components/AvailabilityBadge'
import Badge from '../components/Badge'
import Card from '../components/Card'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import StarRating from '../components/StarRating'
import DecorativeStar from '../components/DecorativeStar'
import useArtistProfile from '../hooks/useArtistProfile'
import useAuth from '../hooks/useAuth'
import { handleImageError } from '../utils/imageFallback'

const commissionStatusLabels = {
  active: 'Disponible',
  paused: 'Pausada',
  closed: 'Cerrada',
}

export default function ArtistProfilePage() {
  const { id } = useParams()
  const { profile, portfolio, commissions, loading, error } = useArtistProfile(id)
  const { user } = useAuth()
  const [selectedWork, setSelectedWork] = useState(null)

  if (loading) return <LoadingState label="Cargando perfil del artista..." />
  if (error || !profile) return <ErrorState message={error?.message || 'No encontramos el perfil de este artista.'} />

  // Comprobar si el usuario actual es este mismo artista
  const isSelf = Boolean(
    user && (
      user.id === profile.userId ||
      user.id === profile.id ||
      (user.email && user.email === profile.userEmail) ||
      (user.username && user.username === profile.username)
    )
  )

  const isClosed = profile.availability === 'closed'
  const isWaitlist = profile.availability === 'waitlist'

  return (
    <div className="artist-profile-page">
      {/* ── 1. PORTADA Y ENCABEZADO ── */}
      <section className="profile-cover" aria-label={`Portada de ${profile.displayName}`}>
        <div className="profile-cover-shape" />
        <div className="profile-cover-dots" aria-hidden="true" />
      </section>

      <section className="profile-header">
        <div className="profile-avatar-wrap">
          <img
            className="profile-avatar"
            src={profile.avatar}
            onError={handleImageError}
            alt={`Avatar de ${profile.displayName}`}
          />
          {profile.verified && (
            <span className="profile-verified-badge" aria-label="Artista verificado" title="Cuenta verificada">
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

          <div className="profile-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span><MapPin size={15} aria-hidden="true" /> {profile.location}</span>
            <StarRating value={profile.rating} size={16} label={`${profile.rating?.toFixed(1)} de 5 estrellas`} />
            <AvailabilityBadge status={profile.availability} />
          </div>
        </div>

        {/* ── BOTONES DE ACCIÓN PRINCIPALES ── */}
        <div className="profile-action" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '13rem' }}>
          {isSelf ? (
            <>
              <button className="button button-secondary button-disabled" type="button" disabled aria-disabled="true">
                Este es tu perfil
              </button>
              <p className="action-help" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                No puedes solicitarte comisiones a ti mismo.
              </p>
            </>
          ) : isClosed ? (
            <>
              <button className="button button-primary button-disabled" type="button" disabled aria-disabled="true">
                Solicitudes cerradas
              </button>
              <p className="action-help" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                La agenda del artista está temporalmente cerrada.
              </p>
            </>
          ) : (
            <>
              <Link className="button button-primary" to={`/solicitudes/nueva/${profile.id}`}>
                <Sparkles size={16} aria-hidden="true" />
                {isWaitlist ? 'Solicitar lista de espera' : 'Solicitar comisión'}
              </Link>
              {isWaitlist && (
                <p className="action-help" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Te avisaremos automáticamente cuando se abra un cupo.
                </p>
              )}
            </>
          )}

          <Link className="back-link" to="/explorar" style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} aria-hidden="true" /> Volver al directorio
          </Link>
        </div>
      </section>

      {/* ── 2. CONTENIDO PRINCIPAL Y SIDEBAR ── */}
      <div className="profile-content">
        <div className="profile-main">
          {/* Biografía y Etiquetas */}
          <section className="profile-section" aria-labelledby="about-title">
            <h2 id="about-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DecorativeStar size={16} color="#8B5CF6" aria-hidden="true" /> Sobre {profile.displayName}
            </h2>
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

              {profile.styles?.length > 0 && (
                <div>
                  <h3>Estilos visuales</h3>
                  <div className="tag-row">
                    {profile.styles.map((s) => (
                      <Badge key={s} tone="soft">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
              <div className="social-links" style={{ marginTop: '1.2rem' }}>
                <h3>Redes y Enlaces</h3>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  {Object.entries(profile.socialLinks).map(([network, url]) => (
                    <a href={url} target="_blank" rel="noreferrer" key={network} className="button button-small button-outline">
                      <ExternalLink size={13} aria-hidden="true" /> {network}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Galería de Portafolio Responsive */}
          <section className="profile-section" aria-labelledby="portfolio-title">
            <div className="profile-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="portfolio-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DecorativeStar size={16} color="#8B5CF6" aria-hidden="true" /> Portafolio
              </h2>
              <span className="badge badge-soft">{portfolio.length} piezas</span>
            </div>

            {portfolio.length === 0 ? (
              <p className="profile-empty-note">Este artista aún no ha publicado piezas en su portafolio.</p>
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

          {/* Tarifas y Opciones de Comisión */}
          <section className="profile-section" aria-labelledby="commissions-title">
            <h2 id="commissions-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DecorativeStar size={16} color="#8B5CF6" aria-hidden="true" /> Paquetes de Comisión
            </h2>

            {commissions.length === 0 ? (
              <p className="profile-empty-note">Este artista no tiene paquetes públicos creados.</p>
            ) : (
              <div className="commission-grid">
                {commissions.map((commission) => {
                  const canOrderThis = !isSelf && !isClosed && commission.status === 'active'

                  return (
                    <Card className="commission-card" key={commission.id}>
                      <div className="commission-card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3>{commission.title}</h3>
                        <Badge tone={commission.status === 'active' ? 'open' : 'soft'}>
                          {commissionStatusLabels[commission.status] || commission.status}
                        </Badge>
                      </div>

                      <p>{commission.description}</p>
                      <strong className="commission-price">${commission.price} USD</strong>

                      <dl className="commission-details">
                        <div>
                          <dt>Entrega estimada</dt>
                          <dd><Clock size={13} inline /> {commission.deliveryDays} días</dd>
                        </div>
                        <div>
                          <dt>Revisiones incluidas</dt>
                          <dd>{commission.revisions}</dd>
                        </div>
                      </dl>

                      {commission.terms && (
                        <details style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Ver términos de este paquete</summary>
                          <p style={{ marginTop: '0.3rem', color: 'var(--muted)' }}>{commission.terms}</p>
                        </details>
                      )}

                      <div style={{ marginTop: '1rem' }}>
                        {canOrderThis ? (
                          <Link
                            className="button button-small button-primary button-full-width"
                            to={`/solicitudes/nueva/${profile.id}?commissionId=${commission.id}`}
                          >
                            Solicitar este paquete
                          </Link>
                        ) : isSelf ? (
                          <span className="button button-small button-disabled button-full-width" aria-disabled="true">
                            Tu propio paquete
                          </span>
                        ) : (
                          <span className="button button-small button-disabled button-full-width" aria-disabled="true">
                            No disponible
                          </span>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Lateral */}
        <aside className="profile-aside">
          <Card>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Estado de Agenda</h2>
            <AvailabilityBadge status={profile.availability} />
            <p style={{ marginTop: '0.65rem', fontSize: '0.9rem' }}>
              {profile.availability === 'open'
                ? `${profile.slots || 1} cupo(s) disponible(s) actualmente.`
                : isWaitlist
                ? 'Puedes anotarte en la lista de espera.'
                : 'La agenda está cerrada temporalmente.'}
            </p>

            {!isSelf && !isClosed && (
              <Link
                className="button button-primary button-full-width"
                to={`/solicitudes/nueva/${profile.id}`}
                style={{ marginTop: '0.85rem' }}
              >
                {isWaitlist ? 'Unirse a lista de espera' : 'Solicitar comisión'}
              </Link>
            )}
          </Card>

          <Card>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Tarifa Base</h2>
            <strong className="profile-price" style={{ fontSize: '1.6rem', color: 'var(--violet-dark)' }}>
              Desde ${profile.basePrice} USD
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
              El costo final puede variar según los detalles específicos de tu encargo.
            </p>
          </Card>
        </aside>
      </div>

      {/* Modal accesible para ver obra ampliada */}
      <Modal
        open={Boolean(selectedWork)}
        title={selectedWork?.title || 'Detalle del portafolio'}
        onClose={() => setSelectedWork(null)}
      >
        {selectedWork && (
          <div>
            <img
              className="portfolio-modal-image"
              src={selectedWork.image}
              onError={handleImageError}
              alt={selectedWork.title || ''}
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '0.5rem' }}
            />
            {selectedWork.description && (
              <p style={{ marginTop: '1rem', color: 'var(--ink)' }}>{selectedWork.description}</p>
            )}
            {selectedWork.category && (
              <Badge tone="violet" style={{ marginTop: '0.5rem' }}>{selectedWork.category}</Badge>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}