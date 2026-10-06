import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Palette,
  FileText,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Bot,
  AlertTriangle
} from 'lucide-react'
import logoArtLink from '../assets/logo-artlink.png'
import useAuth from '../hooks/useAuth'
import { roleLabels } from '../utils/roles'
import AdminAssistantDrawer from '../components/admin/AdminAssistantDrawer'
import { isAdminUser } from '../services/adminAiService'

/**
 * Layout exclusivo de Administración para ArtLink.
 * Proporciona una identidad sobria, profesional y orientada a datos,
 * separada de la navegación pública de clientes.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [prevPath, setPrevPath] = useState(location.pathname)

  // Cerrar sidebar móvil al cambiar de ruta
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Identificar nombre de la sección actual para el breadcrumb
  const getSectionTitle = () => {
    const path = location.pathname
    if (path === '/admin') return 'Dashboard'
    if (path.includes('/admin/usuarios')) return 'Usuarios'
    if (path.includes('/admin/artistas')) return 'Artistas'
    if (path.includes('/admin/categorias')) return 'Categorías'
    if (path.includes('/admin/solicitudes')) return 'Solicitudes'
    if (path.includes('/admin/reportes') || path.includes('/admin/reports')) return 'Reportes e Incidencias'
    return 'Panel de Control'
  }

  return (
    <div className="admin-shell">
      {/* Sidebar Administrativo Exclusivo */}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}
        aria-label="Navegación administrativa"
      >
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand-link">
            <img src={logoArtLink} alt="ArtLink" className="admin-logo-img" />
            <div className="admin-brand-text">
              <span className="admin-brand-title">ArtLink</span>
              <span className="admin-badge-pill">CONSOLA ADMIN</span>
            </div>
          </Link>
          <button
            type="button"
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú lateral"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Enlaces de Navegación del Panel Administrativo */}
        <nav className="admin-nav-section">
          <p className="admin-nav-heading">Gestión Principal</p>
          <ul className="admin-nav-list">
            <li>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <LayoutDashboard size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/usuarios"
                className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <Users size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Usuarios</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/artistas"
                className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <UserCheck size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Artistas</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/categorias"
                className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <Palette size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Categorías</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/solicitudes"
                className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <FileText size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Solicitudes</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reportes"
                className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <AlertTriangle size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Reportes e Incidencias</span>
              </NavLink>
            </li>
          </ul>

          <p className="admin-nav-heading">Reportes y Configuración</p>
          <ul className="admin-nav-list">
            <li>
              <a
                href="/admin#reportes-graficas"
                className="admin-nav-item"
              >
                <BarChart3 size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Reportes y Gráficas</span>
              </a>
            </li>
            {isAdminUser(user) && (
              <li>
                <button
                  type="button"
                  className="admin-nav-item admin-nav-ai-btn"
                  onClick={() => setAiDrawerOpen(true)}
                  title="Asistente de IA para análisis y supervisión"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Bot size={18} className="admin-nav-icon" aria-hidden="true" />
                    <span>Asistente IA</span>
                  </span>
                  <span className="admin-nav-ai-pill">GEMINI</span>
                </button>
              </li>
            )}
            <li>
              <NavLink
                to="/ajustes"
                className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <Settings size={18} className="admin-nav-icon" aria-hidden="true" />
                <span>Ajustes</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Sección Inferior del Sidebar */}
        <div className="admin-sidebar-footer">
          <Link
            to="/explorar"
            className="admin-public-switch"
            title="Ir a la interfaz pública de exploración"
          >
            <ExternalLink size={15} aria-hidden="true" />
            <span>Ver sitio público</span>
          </Link>

          <div className="admin-user-profile-row">
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || 'Administrador'}</span>
              <span className="admin-user-role">{roleLabels[user?.role] || 'Sin rol asignado'}</span>
            </div>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión administrativa"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contenedor Principal */}
      <div className="admin-main admin-shell-body">
        {/* Encabezado Superior de Administración */}
        <header className="admin-topbar" aria-label="Barra superior de administración">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            {/* Breadcrumb de navegación */}
            <nav className="admin-breadcrumb" aria-label="Ruta de navegación">
              <ShieldCheck size={16} className="breadcrumb-icon" aria-hidden="true" />
              <span>Admin</span>
              <ChevronRight size={14} className="breadcrumb-separator" aria-hidden="true" />
              <span className="breadcrumb-current">{getSectionTitle()}</span>
            </nav>
          </div>

          <div className="admin-topbar-right">
            {/* Indicador de salud de infraestructura */}
            <div className="admin-status-indicator" title="Servicios en línea y operacionales">
              <CheckCircle2 size={14} className="status-dot-icon" aria-hidden="true" />
              <span>Panel administrativo</span>
            </div>

            {/* Enlace secundario para volver a la vista de cliente */}
            <Link to="/explorar" className="admin-topbar-view-site">
              <ExternalLink size={14} aria-hidden="true" />
              <span>Vista pública</span>
            </Link>

            {/* Asistente IA exclusivo de Administrador */}
            {isAdminUser(user) && (
              <button
                type="button"
                className="admin-topbar-ai-btn"
                onClick={() => setAiDrawerOpen(true)}
                title="Abrir Asistente IA Administrativo"
                aria-label="Abrir Asistente IA"
              >
                <Bot size={15} aria-hidden="true" />
                <span>Asistente IA</span>
                <span className="admin-topbar-ai-dot" />
              </button>
            )}

            {/* Perfil de administrador */}
            <div className="admin-topbar-user">
              <span className="admin-topbar-name">{user?.name || 'Administrador'}</span>
              <button
                type="button"
                className="admin-topbar-logout"
                onClick={handleLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión administrativa"
              >
                <LogOut size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        {/* Área Principal de Contenido (Gráficos, Métricas y Tablas) */}
        <main className="admin-main-viewport">
          <Outlet />
        </main>

        {/* Disparador Flotante Rápido para el Administrador */}
        {isAdminUser(user) && !aiDrawerOpen && (
          <button
            type="button"
            className="admin-ai-floating-btn"
            onClick={() => setAiDrawerOpen(true)}
            title="Asistente de IA ArtLink"
            aria-label="Abrir Asistente IA"
          >
            <Bot size={20} aria-hidden="true" />
            <span>Asistente IA</span>
          </button>
        )}

        {/* Drawer Desplegable con Asistencia Exclusiva por Rol */}
        {isAdminUser(user) && (
          <AdminAssistantDrawer
            open={aiDrawerOpen}
            onClose={() => setAiDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
