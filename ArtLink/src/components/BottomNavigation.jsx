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
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          {to === '/' ? (
            <img src={logoArtLink} alt="Logo de ArtLink" className="bottom-nav-logo" />
          ) : (
            <Icon size={19} aria-hidden="true" />
          )}
          <span>{text}</span>
        </NavLink>
      ))}
    </nav>
  )
}