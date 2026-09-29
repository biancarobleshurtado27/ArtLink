import { Link } from 'react-router-dom'

const exploreLinks = [
  { label: 'Ilustración Digital', to: '/explorar?discipline=Ilustración 2D' },
  { label: 'Concept Art & Game Dev', to: '/explorar?discipline=Concept Art' },
  { label: 'Modelado VTuber & Live2D', to: '/explorar?discipline=Modelado 3D' },
  { label: 'Chibi & Emotes Discord', to: '/explorar?discipline=Emotes' },
  { label: 'Comics & Webtoons', to: '/explorar?discipline=Animación' },
]

const creatorLinks = [
  { label: 'Guía de Tarifas 2026', to: '/como-funciona' },
  { label: 'Sistema Escrow Seguro', to: '/como-funciona' },
  { label: 'Gestor de Slots & Colas', to: '/para-artistas' },
  { label: 'Plantillas de Contratos', to: '/terminos' },
  { label: 'Programa de Partners', to: '/para-artistas' },
]

const communityLinks = [
  { label: 'Discord Comunitario', to: '/ayuda' },
  { label: 'Eventos & Retos Semanales', to: '/como-funciona' },
  { label: 'Revista Scrapbook', to: '/explorar' },
  { label: 'Showcase de Creadores', to: '/explorar' },
]

const supportLinks = [
  { label: 'Centro de Ayuda', to: '/ayuda' },
  { label: 'Resolución de Disputas', to: '/ayuda' },
  { label: 'Políticas de Copyright', to: '/terminos' },
  { label: 'Términos de Servicio', to: '/terminos' },
  { label: 'Contacto Directo', to: '/contacto' },
]

export default function Footer() {
  return (
    <footer className="artlink-studio-footer" role="contentinfo">
      <div className="studio-footer-inner">
        {/* BARRA SUPERIOR: BRAND Y BADGES */}
        <div className="studio-footer-top">
          <div className="studio-brand-row">
            <span className="studio-green-dot" aria-hidden="true" />
            <strong className="studio-brand-name">ArtLink Studio Platform</strong>
          </div>
          <div className="studio-badges-row">
            <span className="studio-badge badge-mint">
              100% Hecho para Artistas
            </span>
            <span className="studio-badge badge-pink">
              Fondos Protegidos Escrow
            </span>
          </div>
        </div>

        {/* 4 COLUMNAS DE ENLACES */}
        <div className="studio-footer-columns">
          <nav className="studio-col" aria-label="Explorar">
            <h4>Explorar</h4>
            <ul>
              {exploreLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="studio-col" aria-label="Para Creadores">
            <h4>Para Creadores</h4>
            <ul>
              {creatorLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="studio-col" aria-label="Comunidad">
            <h4>Comunidad</h4>
            <ul>
              {communityLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="studio-col" aria-label="Soporte">
            <h4>Soporte</h4>
            <ul>
              {supportLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* BARRA INFERIOR DE COPYRIGHT Y LEGAL */}
        <div className="studio-footer-bottom">
          <div className="studio-copy-left">
            © 2026 ArtLink Studio Platform. Todos los derechos reservados.
          </div>
          <div className="studio-copy-links">
            <Link to="/privacidad">Privacidad</Link>
            <span>·</span>
            <Link to="/privacidad">Cookies</Link>
            <span>·</span>
            <Link to="/privacidad">Seguridad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}