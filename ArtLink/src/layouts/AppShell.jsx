import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ChevronDown, Home, LayoutDashboard, LogOut, Menu, MessageCircle, Search, Sliders, User, UserRound, X } from 'lucide-react'
import logoArtLink from '../assets/logo-artlink.png'
import useAuth from '../hooks/useAuth'
import Footer from '../components/Footer'
import AssistantWidget from '../components/AssistantWidget'
import PageContainer from '../components/PageContainer'
import BottomNavigation from '../components/BottomNavigation'
import { ROLES } from '../utils/roles'

const desktopLinks = [
  { to: '/explorar', label: 'Explorar', accessibleLabel: 'Explorar artistas' },
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/para-artistas', label: 'Para artistas' },
]

const mobileLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/explorar', label: 'Explorar', icon: Search },
  { to: '/solicitudes', label: 'Solicitudes', icon: MessageCircle },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const userAreaRef = useRef(null)
  const headerRef = useRef(null)

  const closeMenus = () => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  useEffect(() => {
    function handleOutside(event) {
      if (userMenuOpen && userAreaRef.current && !userAreaRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (menuOpen && headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen, menuOpen])

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario'
  const initials = userName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>

      <header className="site-header" ref={headerRef}>
        <div className="site-header-inner">
          {/* 1. Logo de ArtLink a la izquierda */}
          <Link className="brand" to="/" aria-label="ArtLink" onClick={closeMenus}>
            <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo" />
          </Link>

          {/* 2. Navegación limpia horizontal en escritorio */}
          <nav id="main-menu" className={`desktop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
            <div className="mobile-nav-brand" aria-hidden="true">
              <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo mobile-nav-brand-logo" />
              <span className="brand-text">
                <strong>ArtLink</strong>
                <small>Conecta tu arte</small>
              </span>
            </div>

            {/* Enlaces principales en el centro/junto al logo */}
            <div className="nav-links-capsule">
              {desktopLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  aria-label={link.accessibleLabel || link.label}
                  onClick={closeMenus}
                  className={({ isActive }) => (isActive ? 'nav-link-item active' : 'nav-link-item')}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* 3. Acciones alineadas a la derecha */}
            <div className="nav-actions-group">
              {user ? (
                <div className="user-area" ref={userAreaRef}>
                  <button
                    className={`user-chip ${userMenuOpen ? 'is-open' : ''}`}
                    type="button"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    aria-controls="user-dropdown-menu"
                    aria-label={`Cuenta de ${userName}`}
                    onClick={() => setUserMenuOpen((open) => !open)}
                  >
                    <span className="avatar avatar-small avatar-fallback avatar-purple">{initials}</span>
                    <span className="user-chip-text">
                      <strong>{userName}</strong>
                      <small className="user-chip-status">
                        <span className="status-dot-mint" /> Disponible
                      </small>
                    </span>
                    <ChevronDown size={15} aria-hidden="true" className="user-chip-caret" />
                  </button>

                  {userMenuOpen && (
                    <div id="user-dropdown-menu" className="user-menu" role="menu" aria-label="Opciones de cuenta">
                      <p className="user-menu-title">Mi cuenta</p>
                      <NavLink to="/perfil" role="menuitem" onClick={closeMenus}>
                        <UserRound size={16} aria-hidden="true" /> Mi perfil
                      </NavLink>
                      {user?.role === ROLES.ARTIST && (
                        <NavLink to="/artista/panel" role="menuitem" onClick={closeMenus}>
                          <LayoutDashboard size={16} aria-hidden="true" /> Mi panel de artista
                        </NavLink>
                      )}
                      {user?.role === ROLES.ADMIN && (
                        <NavLink to="/admin" role="menuitem" onClick={closeMenus}>
                          <LayoutDashboard size={16} aria-hidden="true" /> Panel de administración
                        </NavLink>
                      )}
                      <NavLink to="/explorar" role="menuitem" onClick={closeMenus}>
                        <Search size={16} aria-hidden="true" /> Explorar artistas
                      </NavLink>
                      <NavLink to="/solicitudes" role="menuitem" onClick={closeMenus}>
                        <MessageCircle size={16} aria-hidden="true" /> Mis solicitudes
                      </NavLink>
                      <NavLink to="/ajustes" role="menuitem" onClick={closeMenus}>
                        <Sliders size={16} aria-hidden="true" /> Ajustes y accesibilidad
                      </NavLink>
                      <button className="user-menu-logout" type="button" role="menuitem" onClick={() => { logout(); closeMenus() }}>
                        <LogOut size={16} aria-hidden="true" /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-nav-group">
                  <NavLink to="/login" className="nav-login" onClick={closeMenus}>Iniciar sesión</NavLink>
                  <Link className="button button-primary button-small button-pill-artist" to="/registro?role=artist" onClick={closeMenus}>
                    Unirse
                  </Link>
                  <Link to="/perfil" className="header-user-avatar-btn" aria-label="Mi cuenta" onClick={closeMenus}>
                    <User size={18} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Controles en vista móvil */}
          <div className="header-mobile-controls">
            <button
              className="mobile-menu-button"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="main-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <div className="mobile-menu-backdrop" onClick={closeMenus} aria-hidden="true" />}

      <main id="main-content" className="main-content">
        <PageContainer><Outlet /></PageContainer>
      </main>

      <Footer />
      <AssistantWidget />
      <BottomNavigation links={mobileLinks} />
    </div>
  )
}