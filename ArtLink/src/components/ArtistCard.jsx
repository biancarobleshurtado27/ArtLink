import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Badge from './Badge'
import Card from './Card'
import AvailabilityBadge from './AvailabilityBadge'

export default function ArtistCard({ artist }) {
  return <Card className="artist-card"><div className="artist-card-top"><Avatar src={artist.avatar} name={artist.displayName} size="large" /><AvailabilityBadge status={artist.availability} /></div><div className="artist-card-copy"><div className="artist-name-row"><h3>{artist.displayName}</h3>{artist.verified && <Badge tone="mint">Verificado</Badge>}</div><p className="artist-handle">@{artist.username}</p><p className="artist-bio">{artist.bio}</p><div className="artist-meta"><span><MapPin size={15} aria-hidden="true" />{artist.location}</span><span><Star size={15} aria-hidden="true" fill="currentColor" />{artist.rating}</span><span>Desde ${artist.basePrice}</span></div><div className="discipline-row">{artist.disciplines.map((discipline) => <Badge key={discipline} tone="violet">{discipline}</Badge>)}</div><div className="tag-row">{artist.styles.slice(0, 3).map((style) => <Badge key={style} tone="soft">{style}</Badge>)}</div></div><Link className="card-link" to={`/artista/${artist.id}`} aria-label={`Ver perfil de ${artist.displayName}`}><span>Ver perfil</span><ArrowUpRight size={17} aria-hidden="true" /></Link></Card>
}
