import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Compass,
  Contrast,
  ExternalLink,
  HelpCircle,
  Home,
  Inbox,
  Laptop,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Monitor,
  Moon,
  MoreVertical,
  Search,
  Settings,
  Sliders,
  Sparkles,
  Star,
  Sun,
  User,
  UserRound,
  X,
} from 'lucide-react'
import logoArtLink from '../assets/logo-artlink.png'
import useAuth from '../hooks/useAuth'
import useDisplayPreferences from '../hooks/useDisplayPreferences'
import Footer from '../components/Footer'
import AssistantWidget from '../components/AssistantWidget'
import PageContainer from '../components/PageContainer'
import BottomNavigation from '../components/BottomNavigation'
import { ROLES } from '../utils/roles'

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme } = useDisplayPreferences()
  const userAreaRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

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

  const userName = user?.name || user?.email?.split('@')[0] || 'Bianca Robles Hurtado'
  const userEmail = user?.email || 'biancarobleshurtado27@gmail.com'
  const userAvatar = user?.avatar || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=120&q=80'
  const initials = userName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  // Enlaces de la cabecera pública cuando no hay sesión
  const publicLinks = [
    { to: '/explorar', label: 'Explorar', accessibleLabel: 'Explorar artistas' },
    { to: '/como-funciona', label: 'Cómo funciona' },
    { to: '/para-artistas', label: 'Para artistas' },
  ]

  // Enlaces de la barra lateral izquierda para usuarios autenticados
  const topNavItems = [
    { to: '/', label: 'Inicio', icon: Home, accessibleLabel: 'Inicio' },
    { to: '/explorar', label: 'Explorar', icon: Search, accessibleLabel: 'Explorar artistas' },
    { to: '/mensajes', label: 'Mensajes', icon: MessageCircle, accessibleLabel: 'Mensajes privados' },
    { to: '/solicitudes', label: 'Solicitudes', icon: Bell, accessibleLabel: 'Mis solicitudes' },
  ]

  const mobileLinks = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/explorar', label: 'Explorar', icon: Search },
    { to: '/solicitudes', label: 'Solicitudes', icon: Bell },
    { to: '/mensajes', label: 'Mensajes', icon: MessageCircle },
    { to: '/perfil', label: 'Perfil', icon: UserRound },
  ]

  // Si no hay usuario autenticado, renderizar la vista pública estándar (sin sidebar)
  if (!user) {
    return (
      <div className="app-shell app-shell-public">
        <a className="skip-link" href="#main-content">Saltar al contenido principal</a>

        {/* CABECERA PÚBLICA HORIZONTAL */}
        <header className="site-header">
          <div className="site-header-inner">
            <Link className="brand" to="/" aria-label="ArtLink" onClick={closeMenus}>
              <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo" />
            </Link>

            <nav id="main-menu" className={`desktop-nav ${drawerOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
              <div className="nav-links-capsule">
                {publicLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    aria-label={link.accessibleLabel || link.label}
                    onClick={closeMenus}
                    className={({ isActive }) => (isActive ? 'nav-pill active' : 'nav-pill')}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="nav-actions-group">
                <div className="auth-nav-group">
                  <NavLink to="/login" className="nav-pill nav-pill-login" onClick={closeMenus}>
                    Iniciar sesión
                  </NavLink>
                  <NavLink to="/registro?role=artist" className="nav-pill nav-pill-join" onClick={closeMenus}>
                    Unirse
                  </NavLink>
                </div>
              </div>
            </nav>

            <div className="header-mobile-controls">
              <button
                className="mobile-hamburger-btn"
                type="button"
                aria-expanded={drawerOpen}
                aria-label={drawerOpen ? 'Cerrar menú' : 'Abrir menú'}
                onClick={() => setDrawerOpen((open) => !open)}
              >
                {drawerOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </header>

        {drawerOpen && (
          <div className="mobile-drawer-overlay" onClick={closeMenus} aria-hidden="true" />
        )}

        <div className="app-main-layout app-main-public">
          <main id="main-content" className="main-content">
            <PageContainer><Outlet /></PageContainer>
          </main>
          <Footer />
          <AssistantWidget />
        </div>
      </div>
    )
  }

  // Si el usuario está autenticado, renderizar la interfaz con Sidebar vertical
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
        <Link to="/perfil" className="mobile-avatar-link" aria-label="Mi cuenta">
          <User size={20} />
        </Link>
      </header>

      {/* MOBILE DRAWER BACKDROP */}
      {drawerOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenus} aria-hidden="true" />
      )}

      {/* LEFT SIDEBAR (DESKTOP FIXED / MOBILE DRAWER) */}
      <aside className={`app-sidebar ${drawerOpen ? 'is-drawer-open' : ''}`} aria-label="Navegación principal">
        {/* 1. LOGO SUPERIOR */}
        <div className="sidebar-brand">
          <Link to="/" className="sidebar-brand-link brand" aria-label="ArtLink" onClick={closeMenus}>
            <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo sidebar-logo-img" />
          </Link>
        </div>

        {/* 2-6. NAVEGACIÓN SUPERIOR (Inicio, Explorar, Mensajes, Solicitudes, +) */}
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {topNavItems.map(({ to, label, icon: Icon, accessibleLabel }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenus}
              aria-label={accessibleLabel || label}
              className={({ isActive }) => (isActive ? 'sidebar-nav-item is-active' : 'sidebar-nav-item')}
            >
              <Icon size={26} className="sidebar-icon" aria-hidden="true" />
              <span className="sidebar-nav-label">{label}</span>
              <span className="sidebar-tooltip" role="tooltip">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 7-9. SECCIÓN INFERIOR (Panel Creador + Botón Opciones Usuario) */}
        <div className="sidebar-footer">
          {/* Icono de Creador / Panel de Artista */}
          <NavLink
            to={user?.role === ROLES.ARTIST ? "/artista/panel" : "/registro?role=artist"}
            onClick={closeMenus}
            aria-label={user?.role === ROLES.ARTIST ? "Panel de artista" : "Unirse como creador"}
            className={({ isActive }) => (isActive ? 'sidebar-nav-item is-active' : 'sidebar-nav-item')}
          >
            <Star size={26} className="sidebar-icon" aria-hidden="true" />
            <span className="sidebar-tooltip" role="tooltip">
              {user?.role === ROLES.ARTIST ? 'Panel de artista' : 'Convertirse en creador'}
            </span>
          </NavLink>

          {/* Botón de Menú de Usuario (Tres Puntos) */}
          <div className="sidebar-user-wrap" ref={userAreaRef}>
            <button
              className={`sidebar-user-chip sidebar-nav-item ${userMenuOpen ? 'is-open' : ''}`}
              type="button"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-label={`Opciones de cuenta de ${userName}`}
              onClick={(e) => {
                e.stopPropagation()
                setUserMenuOpen((open) => !open)
              }}
            >
              <MoreVertical size={26} className="sidebar-icon" aria-hidden="true" />
              <span className="sidebar-tooltip" role="tooltip">Opciones de usuario</span>
            </button>

            {/* MENÚ DESPLEGABLE FLOTANTE FIEL A LA IMAGEN EN ESPAÑOL */}
            {userMenuOpen && (
              <div className="sidebar-user-popover" role="menu" aria-label="Opciones de cuenta">
                {/* 1. PERFIL: AVATAR FLOR, NOMBRE Y CORREO */}
                <div className="user-popover-header">
                  {avatarError ? (
                    <span className="user-popover-avatar-fallback">{initials}</span>
                  ) : (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="user-popover-avatar"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                  <div className="user-popover-profile-info">
                    <strong className="user-popover-name">{userName}</strong>
                    <span className="user-popover-email">{userEmail}</span>
                  </div>
                </div>

                <div className="user-popover-divider" />

                {/* 2. SELECTOR DE APARIENCIA (LIGHT / DARK / SYSTEM) */}
                <div className="user-popover-appearance">
                  <div className="user-popover-appearance-label">
                    <Contrast size={18} className="user-popover-icon" aria-hidden="true" />
                    <span>Apariencia</span>
                  </div>
                  <div className="theme-segmented-control" role="group" aria-label="Seleccionar tema">
                    <button
                      type="button"
                      className={`theme-segment-btn ${theme === 'light' ? 'is-active' : ''}`}
                      onClick={() => setTheme('light')}
                      title="Modo claro"
                      aria-label="Modo claro"
                    >
                      <Sun size={17} />
                    </button>
                    <button
                      type="button"
                      className={`theme-segment-btn ${theme === 'dark' ? 'is-active' : ''}`}
                      onClick={() => setTheme('dark')}
                      title="Modo oscuro"
                      aria-label="Modo oscuro"
                    >
                      <Moon size={17} />
                    </button>
                    <button
                      type="button"
                      className={`theme-segment-btn ${theme === 'system' ? 'is-active' : ''}`}
                      onClick={() => setTheme('system')}
                      title="Modo del sistema"
                      aria-label="Modo del sistema"
                    >
                      <Monitor size={17} />
                    </button>
                  </div>
                </div>

                <div className="user-popover-divider" />

                {/* 3. AJUSTES, SOPORTE, CREADOR Y CERRAR SESIÓN */}
                <div className="user-popover-menu-items">
                  <NavLink to="/ajustes" role="menuitem" onClick={closeMenus} className="user-popover-item">
                    <Settings size={18} className="user-popover-icon" aria-hidden="true" />
                    <span>Ajustes</span>
                  </NavLink>

                  <a href="#soporte" role="menuitem" onClick={closeMenus} className="user-popover-item">
                    <HelpCircle size={18} className="user-popover-icon" aria-hidden="true" />
                    <span>Soporte</span>
                    <ExternalLink size={16} className="user-popover-external-icon" aria-hidden="true" />
                  </a>

                  {user?.role === ROLES.ARTIST ? (
                    <NavLink to="/artista/panel" role="menuitem" onClick={closeMenus} className="user-popover-item">
                      <Star size={18} className="user-popover-icon" aria-hidden="true" />
                      <span>Panel de artista</span>
                    </NavLink>
                  ) : (
                    <NavLink to="/registro?role=artist" role="menuitem" onClick={closeMenus} className="user-popover-item">
                      <Star size={18} className="user-popover-icon" aria-hidden="true" />
                      <span>Convertirse en creador</span>
                    </NavLink>
                  )}

                  <button
                    type="button"
                    role="menuitem"
                    className="user-popover-item"
                    onClick={() => {
                      logout()
                      closeMenus()
                      navigate('/')
                    }}
                  >
                    <LogOut size={18} className="user-popover-icon" aria-hidden="true" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>

                <div className="user-popover-divider" />

                {/* 4. PIE: TÉRMINOS, PRIVACIDAD, POLÍTICAS */}
                <div className="user-popover-footer">
                  <span>Términos de uso · Privacidad · Políticas de la comunidad</span>
                </div>
              </div>
            )}
          </div>
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