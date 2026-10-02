import { NavLink } from 'react-router-dom'
import logoArtLink from '../assets/logo-artlink.png'

export default function BottomNavigation({ links, label = 'Navegación móvil' }) {
  return (
    <nav className="bottom-navigation" aria-label={label}>
      {links.map(({ to, label: text, accessibleLabel, icon: Icon, badgeCount }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={accessibleLabel || text}
          className={({ isActive }) => (isActive ? 'bottom-nav-item is-active' : 'bottom-nav-item')}
        >
          {to === '/' ? (
            <img src={logoArtLink} alt="Logo de ArtLink" className="bottom-nav-logo" />
          ) : (
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} aria-hidden="true" className="bottom-nav-icon" />
              {Boolean(badgeCount && badgeCount > 0) && (
                <span
                  className="nav-notification-circle"
                  title={`${badgeCount} pendientes`}
                  aria-label={`${badgeCount} pendientes`}
                >
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </div>
          )}
          <span className="bottom-nav-label">{text}</span>
        </NavLink>
      ))}
    </nav>
  )
}