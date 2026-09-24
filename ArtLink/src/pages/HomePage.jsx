import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArtistCard from '../components/ArtistCard'
import SectionHeading from '../components/SectionHeading'

const featuredArtists = [
  { id: 'artist-001', displayName: 'Mateo Ríos', username: 'mateorios', bio: 'Ilustrador editorial especializado en mundos narrativos y personajes expresivos.', location: 'Bogotá, Colombia', availability: 'open', rating: 4.9, verified: true, styles: ['Editorial', 'Fantástico', 'Colorido'], avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'artist-002', displayName: 'Sofía Nakamura', username: 'sofinaka', bio: 'Diseñadora de personajes y retratos digitales con una paleta suave y cinematográfica.', location: 'Ciudad de México, México', availability: 'waitlist', rating: 4.8, verified: true, styles: ['Anime', 'Cinematográfico', 'Suave'], avatar: 'https://i.pravatar.cc/150?img=32' },
  { id: 'artist-003', displayName: 'Diego Álvarez', username: 'diegoalvarez3d', bio: 'Artista 3D enfocado en producto, arquitectura y escenas para marcas independientes.', location: 'Valencia, España', availability: 'closed', rating: 4.6, verified: false, styles: ['Minimalista', 'Realista', 'Producto'], avatar: 'https://i.pravatar.cc/150?img=68' },
]

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="sticker hero-sticker"><Sparkles size={13} aria-hidden="true" /> Hecho a mano</span>
          <p className="eyebrow">Un lugar para hacer clic con tu próxima idea</p>
          <h1 id="hero-title">Encuentra arte que <em>se siente tuyo.</em></h1>
          <p className="hero-description">Descubre artistas digitales, explora sus mundos y convierte una buena idea en algo que puedas guardar para siempre.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/explorar">Explorar artistas <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="button button-secondary" to="/registro">Quiero crear</Link>
          </div>
        </div>
        <div className="hero-art" aria-label="Presentación de ArtLink">
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
      <section aria-labelledby="featured-title">
        <SectionHeading eyebrow="La selección de hoy" title="Personas que hacen cosas bonitas" description="Tres universos creativos para empezar a explorar." action={<Link className="button button-outline button-small" to="/explorar">Ver todos <ArrowRight size={15} aria-hidden="true" /></Link>} />
        <div className="artist-grid">
          {featuredArtists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}
        </div>
      </section>
    </>
  )
}
