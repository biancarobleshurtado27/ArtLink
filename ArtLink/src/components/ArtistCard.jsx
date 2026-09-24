import { ArrowUpRight, Heart, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import Card from './Card'
import AvailabilityBadge from './AvailabilityBadge'
import { handleImageError } from '../utils/imageFallback'

export default function ArtistCard({ artist, favorited = false, onFavorite }) {
  const initial = (artist.displayName || '?').trim().charAt(0).toUpperCase()
  const cover = artist.image || artist.avatar

  return (
    <Card className="artist-card">
      <div className="artist-card-media">
        {cover && (
          <img
            className="artist-card-img"
            src={cover}
            onError={handleImageError}
            alt=""
            aria-hidden="true"
          />
        )}
        <span className="artist-card-initial" aria-hidden="true">{initial}</span>
      </div>
      <div className="artist-card-body">
        <div className="artist-card-top">
          <div className="artist-name-row">
            <h3>{artist.displayName}</h3>
            {artist.verified && <Badge tone="mint">Verificado</Badge>}
          </div>
          <div className="artist-top-actions">
            {onFavorite && (
              <button
                className={`favorite-toggle ${favorited ? 'is-favorited' : ''}`}
                type="button"
                aria-pressed={favorited}
                aria-label={favorited ? `Quitar a ${artist.displayName} de favoritos` : `Guardar a ${artist.displayName} como favorito`}
                title={favorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                onClick={(event) => { event.preventDefault(); onFavorite(artist.id) }}
              >
                <Heart size={16} fill={favorited ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
            )}
            <AvailabilityBadge status={artist.availability} />
          </div>
        </div>
        <p className="artist-handle">@{artist.username}</p>
        <p className="artist-bio">{artist.bio}</p>
        <div className="artist-meta">
          <span><MapPin size={15} aria-hidden="true" />{artist.location}</span>
          <span><Star size={15} fill="currentColor" aria-hidden="true" />{artist.rating}</span>
          <span>Desde ${artist.basePrice}</span>
        </div>
        <div className="discipline-row">
          {artist.disciplines.map((discipline) => <Badge key={discipline} tone="violet">{discipline}</Badge>)}
        </div>
        {artist.styles?.length > 0 && (
          <div className="tag-row">
            {artist.styles.slice(0, 3).map((style) => <Badge key={style} tone="soft">{style}</Badge>)}
          </div>
        )}
      </div>
      <Link className="card-link" to={`/artista/${artist.id}`} aria-label={`Ver perfil de ${artist.displayName}`}>
        <span>Ver perfil</span><ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </Card>
  )
}