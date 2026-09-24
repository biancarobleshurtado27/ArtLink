import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ChevronDown, Home, Info, LayoutDashboard, LogOut, Menu, MessageCircle, Moon, Search, Sun, UserPlus, UserRound, X } from 'lucide-react'
import logoArtLink from '../assets/logo-artlink.png'
import useAuth from '../hooks/useAuth'
import Footer from '../components/Footer'
import AssistantWidget from '../components/AssistantWidget'
import PageContainer from '../components/PageContainer'
import BottomNavigation from '../components/BottomNavigation'
import useDisplayPreferences from '../hooks/useDisplayPreferences'
import { ROLES, roleLabels } from '../utils/roles'

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

function accountLinks(user) {
  const links = [{ to: '/perfil', label: 'Mi perfil', icon: UserRound }]
  if (user?.role === ROLES.ADMIN) links.push({ to: '/admin', label: 'Panel de administración', icon: LayoutDashboard })
  if (user?.role === ROLES.ARTIST) links.push({ to: '/artista/panel', label: 'Mi espacio de artista', icon: LayoutDashboard })
  return links
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, textSize, setTheme, setTextSize } = useDisplayPreferences()
  const userAreaRef = useRef(null)
  const closeMenus = () => { setMenuOpen(false); setUserMenuOpen(false) }

  useEffect(() => {
    if (!userMenuOpen) return undefined
    function handleOutside(event) {
      if (userAreaRef.current && !userAreaRef.current.contains(event.target)) setUserMenuOpen(false)
    }
    function handleEscape(event) {
      if (event.key === 'Escape') { setUserMenuOpen(false); setMenuOpen(false) }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [userMenuOpen])

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario'
  const initials = userName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  const mobileNavLinks = user
    ? mobileLinks
    : [
        { to: '/', label: 'Inicio', icon: Home },
        { to: '/explorar', label: 'Explorar', icon: Search },
        { to: '/como-funciona', label: 'Cómo funciona', icon: Info },
        { to: '/registro', label: 'Crear cuenta', icon: UserPlus },
      ]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="ArtLink" onClick={closeMenus}>
          <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo" />
          <span className="brand-text">
            <strong>ArtLink</strong>
            <small>Conecta tu arte</small>
          </span>
        </Link>
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
        <nav id="main-menu" className={`desktop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          <div className="mobile-nav-brand" aria-hidden="true">
            <img src={logoArtLink} alt="Logo de ArtLink" className="brand-logo mobile-nav-brand-logo" />
            <span className="brand-text">
              <strong>ArtLink</strong>
              <small>Conecta tu arte</small>
            </span>
          </div>
          {desktopLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              aria-label={link.accessibleLabel || link.label}
              onClick={closeMenus}
            >
              {link.label}
            </NavLink>
          ))}
          {user
            ? (
              <div className="user-area" ref={userAreaRef}>
                <button
                  className={`user-chip ${userMenuOpen ? 'is-open' : ''}`}
                  type="button"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label={`Cuenta de ${userName}`}
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  <span className="avatar avatar-small avatar-fallback" aria-hidden="true">{initials}</span>
                  <span className="user-chip-text">
                    <strong>{userName}</strong>
                    <small>{roleLabels[user.role] || user.role}</small>
                  </span>
                  <ChevronDown size={15} aria-hidden="true" className="user-chip-caret" />
                </button>
                {userMenuOpen && (
                  <div className="user-menu" role="menu" aria-label="Opciones de cuenta">
                    <p className="user-menu-title">Mi cuenta</p>
                    {accountLinks(user).map(({ to, label, icon: Icon }) => (
                      <NavLink key={to} to={to} role="menuitem" onClick={closeMenus}>
                        <Icon size={16} aria-hidden="true" /> {label}
                      </NavLink>
                    ))}
                    <NavLink to="/solicitudes" role="menuitem" onClick={closeMenus}>
                      <MessageCircle size={16} aria-hidden="true" /> Mis solicitudes
                    </NavLink>
                    <button className="user-menu-logout" type="button" role="menuitem" onClick={() => { logout(); closeMenus() }}>
                      <LogOut size={16} aria-hidden="true" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )
            : (
              <>
                <NavLink to="/login" className="nav-login" onClick={closeMenus}>Iniciar sesión</NavLink>
                <Link className="button button-primary button-small" to="/registro" onClick={closeMenus}>Crear perfil</Link>
              </>
            )}
          <div className="display-controls" aria-label="Preferencias de visualización">
            <button
              className="display-control"
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
              title={theme === 'light' ? 'Tema oscuro' : 'Tema claro'}
            >
              {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            </button>
            <label htmlFor="text-size" className="sr-only">Tamaño del texto</label>
            <select id="text-size" className="text-size-select" value={textSize} onChange={(event) => setTextSize(event.target.value)} aria-label="Tamaño del texto">
              <option value="normal">Texto normal</option>
              <option value="large">Texto grande</option>
              <option value="x-large">Texto extra grande</option>
            </select>
          </div>
        </nav>
      </header>
      <main id="main-content" className="main-content">
        <PageContainer><Outlet /></PageContainer>
      </main>
      <Footer />
      <AssistantWidget />
      <BottomNavigation links={mobileNavLinks} />
    </div>
  )
}