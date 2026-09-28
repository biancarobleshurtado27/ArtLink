import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  Compass,
  ExternalLink,
  HelpCircle,
  Home,
  Inbox,
  Laptop,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  MoreVertical,
  Plus,
  Search,
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
  const { user, logout } = useAuth()
  const { theme, setTheme } = useDisplayPreferences()
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

  const userName = user?.name || user?.email?.split('@')[0] || 'Bianca Robles Hurtado'
  const userEmail = user?.email || 'biancarobleshurtado27@gmail.com'
  const initials = userName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  // Orden estricto según la imagen de referencia 1:
  // 1. Logo
  // 2. Inicio (Home)
  // 3. Explorar (Search)
  // 4. Mensajes (MessageCircle)
  // 5. Solicitudes (Bell)
  // 6. (+) Botón de acción rápida
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
        {/* 1. LOGO SUPERIOR */}
        <div className="sidebar-brand">
          <Link to="/" className="sidebar-brand-link brand" aria-label="ArtLink" onClick={closeMenus}>
            <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo sidebar-logo-img" />
          </Link>
        </div>

        {/* 2-6. NAVEGACIÓN SUPERIOR (Inicio, Explorar, Mensajes, Solicitudes, +) */}
        <nav className="sidebar-nav desktop-nav" aria-label="Navegación principal">
          {topNavItems.map(({ to, label, icon: Icon, accessibleLabel }) => (
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

          {/* Botón (+) circular de acción rápida */}
          <NavLink
            to="/solicitudes"
            onClick={closeMenus}
            aria-label="Nueva solicitud"
            className="sidebar-nav-item sidebar-plus-btn"
          >
            <Plus size={22} className="sidebar-icon" aria-hidden="true" />
            <span className="sidebar-tooltip" role="tooltip">Nueva solicitud</span>
          </NavLink>
        </nav>

        {/* 7-9. SECCIÓN INFERIOR (Panel Creador + Botón Opciones Usuario) */}
        <div className="sidebar-footer" ref={userAreaRef}>
          {/* Icono de Creador / Panel de Artista */}
          <NavLink
            to={user?.role === ROLES.ARTIST ? "/artista/panel" : "/registro?role=artist"}
            onClick={closeMenus}
            aria-label={user?.role === ROLES.ARTIST ? "Panel de artista" : "Unirse como creador"}
            className={({ isActive }) => (isActive ? 'sidebar-nav-item is-active nav-pill active' : 'sidebar-nav-item nav-pill')}
            style={{ marginBottom: '0.4rem' }}
          >
            <Star size={22} className="sidebar-icon" aria-hidden="true" />
            <span className="sidebar-tooltip" role="tooltip">
              {user?.role === ROLES.ARTIST ? 'Panel de artista' : 'Convertirse en creador'}
            </span>
          </NavLink>

          {/* Botón de Menú de Usuario (Tres Puntos) */}
          <div className="sidebar-user-wrap user-area">
            <button
              className={`sidebar-user-chip user-chip ${userMenuOpen ? 'is-open' : ''}`}
              type="button"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-label={`Opciones de cuenta de ${userName}`}
              onClick={() => setUserMenuOpen((o) => !o)}
            >
              <MoreVertical size={20} aria-hidden="true" />
              <span className="sidebar-tooltip" role="tooltip">Opciones de usuario</span>
            </button>

            {/* MENÚ DESPLEGABLE DEL USUARIO (FLOTANTE HACIA ARRIBA Y DERECHA - SEGÚN IMAGEN 2) */}
            {userMenuOpen && (
              <div className="sidebar-user-dropdown-menu user-menu" role="menu" aria-label="Opciones de cuenta">
                {/* PERFIL: AVATAR, NOMBRE Y CORREO */}
                <div className="user-dropdown-profile-header">
                  <span className="avatar avatar-medium avatar-fallback avatar-purple">{initials}</span>
                  <div className="user-dropdown-profile-info">
                    <strong>{userName}</strong>
                    <small>{userEmail}</small>
                  </div>
                </div>

                <hr className="dropdown-divider" />

                {/* SELECTOR DE APARIENCIA (LIGHT / DARK / SYSTEM) */}
                <div className="dropdown-appearance-section">
                  <div className="appearance-label">
                    <Sun size={16} aria-hidden="true" />
                    <span>Apariencia</span>
                  </div>
                  <div className="theme-toggle-group">
                    <button
                      type="button"
                      className={`theme-btn ${theme === 'light' ? 'is-active' : ''}`}
                      onClick={() => setTheme('light')}
                      title="Modo claro"
                      aria-label="Modo claro"
                    >
                      <Sun size={14} />
                    </button>
                    <button
                      type="button"
                      className={`theme-btn ${theme === 'dark' ? 'is-active' : ''}`}
                      onClick={() => setTheme('dark')}
                      title="Modo oscuro"
                      aria-label="Modo oscuro"
                    >
                      <Moon size={14} />
                    </button>
                    <button
                      type="button"
                      className={`theme-btn ${theme === 'system' ? 'is-active' : ''}`}
                      onClick={() => setTheme('system')}
                      title="Modo del sistema"
                      aria-label="Modo del sistema"
                    >
                      <Laptop size={14} />
                    </button>
                  </div>
                </div>

                <hr className="dropdown-divider" />

                {/* AJUSTES, PERFIL, SOPORTE, CREADOR Y LOGOUT */}
                <NavLink to="/ajustes" role="menuitem" onClick={closeMenus} className="dropdown-item">
                  <Sliders size={16} aria-hidden="true" />
                  <span>Ajustes</span>
                </NavLink>

                <NavLink to="/perfil" role="menuitem" onClick={closeMenus} className="dropdown-item">
                  <UserRound size={16} aria-hidden="true" />
                  <span>Mi perfil</span>
                </NavLink>

                <a href="#soporte" role="menuitem" onClick={closeMenus} className="dropdown-item">
                  <HelpCircle size={16} aria-hidden="true" />
                  <span>Soporte</span>
                  <ExternalLink size={14} className="external-icon" aria-hidden="true" />
                </a>

                {user?.role === ROLES.ARTIST ? (
                  <NavLink to="/artista/panel" role="menuitem" onClick={closeMenus} className="dropdown-item">
                    <Star size={16} aria-hidden="true" />
                    <span>Panel de artista</span>
                  </NavLink>
                ) : (
                  <NavLink to="/registro?role=artist" role="menuitem" onClick={closeMenus} className="dropdown-item">
                    <Star size={16} aria-hidden="true" />
                    <span>Convertirse en creador</span>
                  </NavLink>
                )}

                {user ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item dropdown-item-logout user-menu-logout"
                    onClick={() => { logout(); closeMenus() }}
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span>Cerrar sesión</span>
                  </button>
                ) : (
                  <NavLink to="/login" role="menuitem" onClick={closeMenus} className="dropdown-item">
                    <User size={16} aria-hidden="true" />
                    <span>Iniciar sesión</span>
                  </NavLink>
                )}

                <hr className="dropdown-divider" />

                <div className="user-dropdown-footer">
                  <small>Términos de uso · Privacidad · Políticas</small>
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