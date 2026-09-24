import { NavLink } from 'react-router-dom'
import logoArtLink from '../assets/logo-artlink.png'

export default function BottomNavigation({ links, label = 'Navegación móvil' }) {
  return (
    <nav className="bottom-navigation" aria-label={label}>
      {links.map(({ to, label: text, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={text}
          className={({ isActive }) => (isActive ? 'bottom-nav-item is-active' : 'bottom-nav-item')}
        >
          {to === '/' ? (
            <img src={logoArtLink} alt="Logo de ArtLink" className="bottom-nav-logo" />
          ) : (
            <Icon size={20} aria-hidden="true" className="bottom-nav-icon" />
          )}
          <span className="bottom-nav-label">{text}</span>
        </NavLink>
      ))}
    </nav>
  )
}