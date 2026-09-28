import { Link } from 'react-router-dom'
import logoArtLink from '../assets/logo-artlink.png'

const creatorLinks = [
  { label: 'Ilustración 2D', to: '/explorar?discipline=Ilustración 2D' },
  { label: 'Modelado 3D', to: '/explorar?discipline=Modelado 3D' },
  { label: 'Animación', to: '/explorar?discipline=Animación' },
  { label: 'Pixel Art', to: '/explorar?discipline=Pixel Art' },
  { label: 'Emotes y Stickers', to: '/explorar?discipline=Emotes' },
  { label: 'Concept Art', to: '/explorar?discipline=Concept Art' },
]

const featureLinks = [
  { label: 'Explora creadores', to: '/explorar' },
  { label: 'Comunidad de artistas', to: '/explorar' },
  { label: 'Canal seguro de mensajes', to: '/mensajes' },
  { label: 'Presupuestos transparentes', to: '/como-funciona' },
  { label: 'Encargos a tu medida', to: '/solicitudes' },
  { label: 'Solicitar comisión', to: '/explorar', isSubItem: true },
  { label: 'Gestionar entregas', to: '/solicitudes', isSubItem: true },
]

const pricingLinks = [
  { label: 'Empezar en ArtLink es gratis', to: '/registro' },
  { label: 'Tarifas y comisiones', to: '/como-funciona' },
  { label: 'Calculadora de presupuestos', to: '/como-funciona' },
]

const resourceLinks = [
  { label: 'ArtLink para Artistas', to: '/para-artistas' },
  { label: 'Cómo funciona la plataforma', to: '/como-funciona' },
  { label: 'Centro de ayuda & FAQ', to: '/ayuda' },
  { label: 'Guía de comisiones', to: '/como-funciona' },
  { label: 'Directorio de creadores', to: '/explorar' },
]

const companyLinks = [
  { label: 'Sobre ArtLink', to: '/como-funciona' },
  { label: 'Términos y condiciones', to: '/terminos' },
  { label: 'Política de privacidad', to: '/privacidad' },
  { label: 'Accesibilidad', to: '/ayuda' },
  { label: 'Contacto y soporte', to: '/contacto' },
]

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        {/* Encabezado de marca con la identidad original de ArtLink */}
        <div className="footer-brand-header">
          <div className="footer-brand-main">
            <Link className="brand footer-brand" to="/" aria-label="ArtLink, volver al inicio">
              <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo footer-logo" />
              <span className="brand-text">
                <strong>ArtLink</strong>
                <small>Conecta tu arte</small>
              </span>
            </Link>
            <p className="footer-brand-blurb">
              ArtLink centraliza portafolios, precios y disponibilidad de artistas digitales para que una buena idea encuentre a su creador sin perderse en el camino.
            </p>
          </div>
          <div className="footer-brand-badge">
            <span className="footer-sticker">Plataforma para creadores</span>
          </div>
        </div>

        {/* Grilla ordenada de 5 columnas inspirada en la referencia, con acentos ArtLink */}
        <div className="footer-nav-grid">
          {/* Columna 1: Creadores (acento rosa) */}
          <nav className="footer-col col-rose" aria-label="Creadores">
            <h3 className="footer-col-title">Creadores</h3>
            <ul>
              {creatorLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 2: Funcionalidades (acento violeta) */}
          <nav className="footer-col col-violet" aria-label="Funcionalidades">
            <h3 className="footer-col-title">Funcionalidades</h3>
            <ul>
              {featureLinks.map(({ label, to, isSubItem }) => (
                <li key={label}>
                  {isSubItem ? (
                    <Link to={to} className="footer-subitem">
                      <span className="footer-subitem-tree">└</span> {label}
                    </Link>
                  ) : (
                    <Link to={to}>{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 3: Precios (acento amarillo) */}
          <nav className="footer-col col-yellow" aria-label="Precios">
            <h3 className="footer-col-title">Precios</h3>
            <ul>
              {pricingLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 4: Recursos (acento menta) */}
          <nav className="footer-col col-mint" aria-label="Recursos">
            <h3 className="footer-col-title">Recursos</h3>
            <ul>
              {resourceLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 5: Empresa (acento lila) */}
          <nav className="footer-col col-lilac" aria-label="Empresa">
            <h3 className="footer-col-title">Empresa</h3>
            <ul>
              {companyLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Barra inferior: selectores píldora neo-brutalistas, redes sociales y ubicación/copyright */}
        <div className="footer-bottom-bar">
          {/* Selectores estilo píldora con bordes y sombra de ArtLink */}
          <div className="footer-bottom-left">
            <button type="button" className="footer-pill-btn" aria-label="Seleccionar idioma">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Español (Costa Rica)</span>
            </button>

            <button type="button" className="footer-pill-btn" aria-label="Seleccionar país o región">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Costa Rica</span>
            </button>

            <button type="button" className="footer-pill-btn" aria-label="Seleccionar divisa">
              <span className="footer-pill-symbol" aria-hidden="true">$</span>
              <span>USD</span>
            </button>
          </div>

          {/* Iconos de Redes Sociales con estilo de botón circular ArtLink */}
          <div className="footer-bottom-middle" aria-label="Redes sociales">
            {/* X / Twitter */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="X (Twitter)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="YouTube"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          {/* Ubicación y derechos reservados */}
          <div className="footer-bottom-right">
            <span>San José, Costa Rica</span>
            <span className="footer-sep" aria-hidden="true">|</span>
            <span className="footer-brand-tag">© <strong>ArtLink</strong></span>
          </div>
        </div>
      </div>
    </footer>
  )
}