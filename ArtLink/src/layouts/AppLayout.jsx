import { Link, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import './layout.css'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">ArtLink</Link>
        <nav className="site-nav" aria-label="Navegación principal">
          <Link to="/explorar">Explorar</Link>
          {user ? <Link to="/solicitudes">Solicitudes</Link> : <Link to="/login">Ingresar</Link>}
          {user && (
            <button className="icon-button" type="button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut size={18} aria-hidden="true" />
            </button>
          )}
        </nav>
      </header>
      <main className="main-content"><Outlet /></main>
      <footer className="site-footer">ArtLink · Portafolios que conectan</footer>
    </div>
  )
}
