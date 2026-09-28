import { Link } from 'react-router-dom'
import logoArtLink from '../assets/logo-artlink.png'

const creatorLinks = [
  { label: 'Ilustración 2D', to: '/explorar?discipline=Ilustración 2D' },
  { label: 'Modelado 3D & VTubing', to: '/explorar?discipline=Modelado 3D' },
  { label: 'Animación & Rigging', to: '/explorar?discipline=Animación' },
  { label: 'Pixel Art & Sprites', to: '/explorar?discipline=Pixel Art' },
  { label: 'Emotes y Stickers', to: '/explorar?discipline=Emotes' },
  { label: 'Concept Art & Fantasía', to: '/explorar?discipline=Concept Art' },
]

const featureLinks = [
  { label: 'Explora creadores', to: '/explorar' },
  { label: 'Comunidad de artistas', to: '/explorar' },
  { label: 'Canal seguro de mensajes', to: '/mensajes' },
  { label: 'Presupuestos transparentes', to: '/como-funciona' },
  { label: 'Encargos a tu medida', to: '/solicitudes' },
  { label: 'Solicitar comisión', to: '/explorar' },
  { label: 'Gestionar entregas', to: '/solicitudes' },
]

const pricingLinks = [
  { label: 'Empezar en ArtLink es gratis', to: '/registro' },
  { label: 'Tarifas y comisiones', to: '/como-funciona' },
  { label: 'Calculadora de presupuestos', to: '/como-funciona' },
  { label: 'Sistema Escrow Shield', to: '/como-funciona' },
  { label: 'Pagos protegidos', to: '/como-funciona' },
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
  { label: 'Normas de la comunidad', to: '/terminos' },
  { label: 'Política de derechos de autor', to: '/terminos' },
  { label: 'Términos y condiciones', to: '/terminos' },
  { label: 'Política de privacidad', to: '/privacidad' },
  { label: 'Contacto y soporte', to: '/contacto' },
]

export default function Footer() {
  return (
    <footer className="combined-site-footer" role="contentinfo">
      <div className="combined-footer-inner">
        {/* Encabezado Superior de Marca */}
        <div className="footer-brand-section">
          <div className="footer-brand-main-info">
            <div className="footer-logo-row">
              <Link className="brand" to="/" aria-label="ArtLink Inicio">
                <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo" />
                <span className="brand-text">
                  <strong>ArtLink</strong>
                  <small>Conecta tu arte</small>
                </span>
              </Link>
              <span className="footer-badge-vitrina">Vitrina</span>
            </div>
            <p className="footer-brand-desc">
              ArtLink centraliza portafolios, precios y disponibilidad de artistas digitales para que una buena idea encuentre a su creador sin perderse en el camino. Tu espacio de trabajo seguro.
            </p>
          </div>

          <div className="footer-stickers-group">
            <span className="footer-sticker sticker-white">
              ✦ 100% Hecho para Artistas
            </span>
            <span className="footer-sticker sticker-lilac">
              ✦ Pagos Protegidos
            </span>
            <span className="footer-sticker sticker-yellow">
              ✦ Plataforma para Creadores
            </span>
          </div>
        </div>

        {/* 5 Columnas de Enlaces */}
        <div className="combined-footer-columns">
          {/* Col 1 */}
          <nav className="footer-nav-col col-rose" aria-label="Creadores">
            <h4 className="footer-col-title">CREADORES</h4>
            <ul>
              {creatorLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 2 */}
          <nav className="footer-nav-col col-violet" aria-label="Funcionalidades">
            <h4 className="footer-col-title">FUNCIONALIDADES</h4>
            <ul>
              {featureLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3 */}
          <nav className="footer-nav-col col-yellow" aria-label="Precios">
            <h4 className="footer-col-title">PRECIOS</h4>
            <ul>
              {pricingLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 4 */}
          <nav className="footer-nav-col col-mint" aria-label="Recursos">
            <h4 className="footer-col-title">RECURSOS</h4>
            <ul>
              {resourceLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 5 */}
          <nav className="footer-nav-col col-lilac" aria-label="Empresa & Legal">
            <h4 className="footer-col-title">EMPRESA & LEGAL</h4>
            <ul>
              {companyLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Barra Inferior Completa: Selectores, Redes Sociales y Copyright */}
        <div className="combined-footer-bottom">
          {/* Selectores estilo píldora */}
          <div className="footer-bottom-selectors">
            <button type="button" className="footer-pill-btn" aria-label="Seleccionar idioma">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Español (Costa Rica)</span>
            </button>

            <button type="button" className="footer-pill-btn" aria-label="Seleccionar país o región">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

          {/* Iconos de Redes Sociales */}
          <div className="footer-bottom-social" aria-label="Redes sociales">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="X (Twitter)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="YouTube">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          {/* Copyright y Ubicación */}
          <div className="footer-bottom-copy">
            <span>© 2026 ArtLink Platform Inc. Diseñado para creadores visuales.</span>
            <span className="footer-dot-sep">·</span>
            <span>San José, Costa Rica</span>
            <span className="footer-dot-sep">·</span>
            <Link to="/terminos">Línea de Auditoría</Link>
            <span className="footer-dot-sep">·</span>
            <Link to="/privacidad">Seguridad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}