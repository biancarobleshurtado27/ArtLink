import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">✦</span>ArtLink</Link><p>Portafolios que conectan.</p><div className="footer-links"><Link to="/explorar">Explorar</Link><Link to="/registro">Crear perfil</Link></div></div><small>Hecho para artistas digitales y sus próximas historias.</small></footer>
}
