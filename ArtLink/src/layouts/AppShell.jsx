import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Compass,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Sliders,
  Sparkles,
  User,
  UserRound,
  X,
} from 'lucide-react'
import logoArtLink from '../assets/logo-artlink.png'
import useAuth from '../hooks/useAuth'
import Footer from '../components/Footer'
import AssistantWidget from '../components/AssistantWidget'
import PageContainer from '../components/PageContainer'
import BottomNavigation from '../components/BottomNavigation'
import { ROLES } from '../utils/roles'

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const userAreaRef = useRef(null)
  const location = useLocation()

  const closeMenus = () => {
    setDrawerOpen(false)
    setUserMenuOpen(false)
  }

  useEffect(() => {
    closeMenus()
  }, [location.pathname])

  useEffect(() => {
    function handleOutside(event) {
      if (userMenuOpen && userAreaRef.current && !userAreaRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario'
  const initials = userName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  const navItems = [
    { to: '/', label: 'Inicio', icon: Home, accessibleLabel: 'Inicio' },
    { to: '/explorar', label: 'Explorar', icon: Compass, accessibleLabel: 'Explorar artistas' },
    { to: '/solicitudes', label: 'Solicitudes', icon: Inbox, accessibleLabel: 'Mis solicitudes' },
    { to: '/mensajes', label: 'Mensajes', icon: MessageCircle, accessibleLabel: 'Mensajes privados' },
    ...(user?.role === ROLES.ARTIST
      ? [{ to: '/artista/panel', label: 'Panel de artista', icon: LayoutDashboard, accessibleLabel: 'Panel de artista' }]
      : []),
    { to: '/ajustes', label: 'Ajustes', icon: Sliders, accessibleLabel: 'Ajustes y accesibilidad' },
    ...(!user
      ? [{ to: '/registro?role=artist', label: 'Unirse', icon: Sparkles, accessibleLabel: 'Unirse como artista' }]
      : []),
  ]

  const mobileLinks = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/explorar', label: 'Explorar', icon: Search },
    { to: '/solicitudes', label: 'Solicitudes', icon: Inbox },
    { to: '/mensajes', label: 'Mensajes', icon: MessageCircle },
    { to: '/perfil', label: 'Perfil', icon: UserRound },
  ]

  return (
    <div className="app-shell-sidebar-layout">
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>

      {/* MOBILE TOP BAR */}
      <header className="mobile-header-bar">
        <button
          className="mobile-hamburger-btn"
          type="button"
          aria-expanded={drawerOpen}
          aria-label={drawerOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setDrawerOpen((open) => !open)}
        >
          {drawerOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <Link to="/" className="mobile-brand-logo" onClick={closeMenus} aria-label="ArtLink Inicio">
          <img src={logoArtLink} alt="Logo de ArtLink" />
        </Link>
        <Link to={user ? "/perfil" : "/login"} className="mobile-avatar-link" aria-label="Mi cuenta">
          <User size={20} />
        </Link>
      </header>

      {/* MOBILE DRAWER BACKDROP */}
      {drawerOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenus} aria-hidden="true" />
      )}

      {/* LEFT SIDEBAR (DESKTOP FIXED / MOBILE DRAWER) */}
      <aside className={`app-sidebar ${drawerOpen ? 'is-drawer-open' : ''}`} aria-label="Navegación principal">
        {/* LOGO SUPERIOR */}
        <div className="sidebar-top">
          <Link to="/" className="sidebar-brand-link brand" aria-label="ArtLink" onClick={closeMenus}>
            <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo sidebar-logo-img" />
          </Link>
        </div>

        {/* NAVEGACIÓN VERTICAL CENTRADA */}
        <nav className="sidebar-nav-list desktop-nav" aria-label="Menú de navegación">
          {navItems.map(({ to, label, icon: Icon, accessibleLabel }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenus}
              aria-label={accessibleLabel || label}
              className={({ isActive }) => (isActive ? 'sidebar-nav-item is-active nav-pill active' : 'sidebar-nav-item nav-pill')}
            >
              <Icon size={22} className="sidebar-icon" aria-hidden="true" />
              <span className="sidebar-nav-label">{label}</span>
              <span className="sidebar-tooltip" role="tooltip">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* USUARIO / ACCIONES INFERIORES */}
        <div className="sidebar-bottom" ref={userAreaRef}>
          {user ? (
            <div className="sidebar-user-wrap user-area">
              <button
                className={`sidebar-user-chip user-chip ${userMenuOpen ? 'is-open' : ''}`}
                type="button"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label={`Cuenta de ${userName}`}
                onClick={() => setUserMenuOpen((o) => !o)}
              >
                <span className="avatar avatar-small avatar-fallback avatar-purple">{initials}</span>
                <span className="sidebar-tooltip" role="tooltip">{userName}</span>
              </button>

              {userMenuOpen && (
                <div className="sidebar-user-dropdown-menu user-menu" role="menu" aria-label="Opciones de cuenta">
                  <div className="user-menu-header">
                    <strong>{userName}</strong>
                    <small style={{ textTransform: 'capitalize' }}>{user.role}</small>
                  </div>
                  <hr style={{ margin: '0.4rem 0', borderColor: 'var(--line)' }} />
                  <NavLink to="/perfil" role="menuitem" onClick={closeMenus} className="dropdown-item">
                    <UserRound size={15} aria-hidden="true" /> Mi perfil
                  </NavLink>
                  {user.role === ROLES.ARTIST && (
                    <NavLink to="/artista/panel" role="menuitem" onClick={closeMenus} className="dropdown-item">
                      <LayoutDashboard size={15} aria-hidden="true" /> Panel de artista
                    </NavLink>
                  )}
                  {user.role === ROLES.ADMIN && (
                    <NavLink to="/admin" role="menuitem" onClick={closeMenus} className="dropdown-item">
                      <LayoutDashboard size={15} aria-hidden="true" /> Panel admin
                    </NavLink>
                  )}
                  <NavLink to="/ajustes" role="menuitem" onClick={closeMenus} className="dropdown-item">
                    <Sliders size={15} aria-hidden="true" /> Ajustes
                  </NavLink>
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item dropdown-item-logout user-menu-logout"
                    onClick={() => { logout(); closeMenus() }}
                  >
                    <LogOut size={15} aria-hidden="true" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="sidebar-auth-group">
              <NavLink to="/login" className="sidebar-nav-item nav-pill nav-pill-login" aria-label="Iniciar sesión">
                <User size={22} aria-hidden="true" />
                <span className="sidebar-tooltip" role="tooltip">Iniciar sesión</span>
              </NavLink>
            </div>
          )}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL CON MARGIN-LEFT EN ESCRITORIO */}
      <div className="app-main-layout">
        <main id="main-content" className="main-content">
          <PageContainer><Outlet /></PageContainer>
        </main>
        <Footer />
        <AssistantWidget />
        <BottomNavigation links={mobileLinks} />
      </div>
    </div>
  )
}