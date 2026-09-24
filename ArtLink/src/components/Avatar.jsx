export default function Avatar({ src, name, size = 'medium' }) {
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return src ? <img className={`avatar avatar-${size}`} src={src} alt={`Avatar de ${name}`} /> : <span className={`avatar avatar-${size} avatar-fallback`} aria-label={`Avatar de ${name}`}>{initials}</span>
}
