import { Link } from 'react-router-dom'
import logoArtLink from '../assets/logo-artlink.png'

const categoryLinks = [
  'Ilustración 2D',
  'Modelado 3D',
  'Animación',
  'Pixel Art',
  'Emotes',
].map((name) => ({ name, to: `/explorar?discipline=${encodeURIComponent(name)}` }))

const communityLinks = [
  { label: 'Cómo funciona', to: '/como-funciona' },
  { label: 'Para artistas', to: '/para-artistas' },
  { label: 'Explorar directorio', to: '/explorar' },
]

const supportLinks = [
  { label: 'Centro de ayuda', to: '/ayuda' },
  { label: 'Términos del servicio', to: '/terminos' },
  { label: 'Política de privacidad', to: '/privacidad' },
  { label: 'Contacto', to: '/contacto' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <Link className="brand footer-brand" to="/" aria-label="ArtLink, pie de página">
            <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo footer-logo" />
            <span className="brand-text">
              <strong>ArtLink</strong>
              <small>Conecta tu arte</small>
            </span>
          </Link>
          <p className="footer-blurb">
            ArtLink centraliza portafolios, precios y disponibilidad de artistas digitales para que una buena idea encuentre a su creador sin perderse en el camino.
          </p>
        </div>
        <nav className="footer-col" aria-label="Categorías de arte">
          <h3>Categorías de arte</h3>
          <ul>
            {categoryLinks.map(({ name, to }) => (
              <li key={name}><Link to={to}>{name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav className="footer-col" aria-label="Comunidad">
          <h3>Comunidad</h3>
          <ul>
            {communityLinks.map(({ label, to }) => (
              <li key={label}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav className="footer-col" aria-label="Soporte">
          <h3>Soporte</h3>
          <ul>
            {supportLinks.map(({ label, to }) => (
              <li key={label}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer-bottom">
        <small className="footer-note">Hecho para artistas digitales y sus próximas historias. Prototipo académico ArtLink.</small>
      </div>
    </footer>
  )
}