import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Home, Menu, MessageCircle, Palette, Search, UserRound, X } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import Footer from '../components/Footer'
import Button from '../components/Button'

const desktopLinks = [
  { to: '/explorar', label: 'Explorar artistas' },
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
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" onClick={() => setMenuOpen(false)} aria-label="ArtLink, inicio">
          <span className="brand-mark" aria-hidden="true"><Palette size={21} /></span>
          <span>ArtLink</span>
        </Link>
        <button className="mobile-menu-button" type="button" aria-expanded={menuOpen} aria-controls="main-menu" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="main-menu" className={`desktop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          {desktopLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</NavLink>)}
          {user ? <NavLink to="/solicitudes" onClick={() => setMenuOpen(false)}>Mis solicitudes</NavLink> : <NavLink to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</NavLink>}
          {user ? <Button variant="outline" onClick={() => { logout(); setMenuOpen(false) }}>Cerrar sesión</Button> : <Link className="button button-primary button-small" to="/registro" onClick={() => setMenuOpen(false)}>Crear perfil</Link>}
        </nav>
      </header>
      <main className="main-content"><Outlet /></main>
      <Footer />
      <nav className="bottom-navigation" aria-label="Navegación móvil">
        {mobileLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}
      </nav>
    </div>
  )
}
