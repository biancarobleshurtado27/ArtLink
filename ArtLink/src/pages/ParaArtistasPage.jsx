import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarCheck2, FolderKanban, Inbox, MessageSquareText, Palette, Sparkles, Star, Wallet } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { ROLES } from '../utils/roles'

const artistBenefits = [
  { icon: BadgeCheck, title: 'Perfil profesional', text: 'Una vitrina con tu nombre, disciplinas, estilos y tu mejor trabajo.' },
  { icon: Wallet, title: 'Tarifas organizadas', text: 'Define comisiones con precio, entrega, revisiones y términos claros.' },
  { icon: CalendarCheck2, title: 'Control de disponibilidad', text: 'Indica si estás abierto, en lista de espera o cerrado, y cuántos cupos tienes.' },
  { icon: Inbox, title: 'Gestión de solicitudes', text: 'Recibe encargos ordenados y actualiza su estado sin cuadernos sueltos.' },
  { icon: MessageSquareText, title: 'Comunicación centralizada', text: 'Cada encargo tiene su conversación. Nada se pierde entre redes y chats.' },
]

const features = [
  { icon: FolderKanban, title: 'Portafolio', text: 'Sube y ordena tus piezas por categoría.', to: '/artista/portafolio' },
  { icon: Wallet, title: 'Comisiones', text: 'Tarifas, entregas y revisiones visibles al público.', to: '/artista/comisiones' },
  { icon: CalendarCheck2, title: 'Cupos disponibles', text: 'Controla cuántos encargos aceptas a la vez.', to: '/artista/panel' },
  { icon: Inbox, title: 'Solicitudes', text: 'Estado de cada encargo en tu bandeja.', to: '/artista/panel' },
  { icon: MessageSquareText, title: 'Mensajes', text: 'Conversaciones por solicitud, sin desorden.', to: '/mensajes' },
]

const testimonials = [
  { name: 'Mateo Ríos', role: 'Ilustrador editorial', quote: 'Por fin mis precios y mi disponibilidad están a la vista. Recibo menos mensajes de “¿cuánto cobras?” y más encargos concretos.', rating: 5 },
  { name: 'Sofía Nakamura', role: 'Diseñadora de personajes', quote: 'Manejé mi lista de espera desde el panel y mis clientes siempre supieron cuándo iba a responder.', rating: 5 },
  { name: 'Diego Álvarez', role: 'Artista 3D', quote: 'Todo el contexto de un encargo llegó ordenado: idea, presupuesto, fecha y referencias. Así se trabaja tranquilo.', rating: 4 },
]

export default function ParaArtistasPage() {
  const { user } = useAuth()
  const isArtist = user?.role === ROLES.ARTIST
  const primaryAction = isArtist
    ? { label: 'Ver mi panel', to: '/artista/panel' }
    : { label: 'Crear perfil de artista', to: '/registro?role=artist' }
  const panelTarget = isArtist ? '/artista/panel' : '/login'

  return (
    <div className="info-page">
      <section className="page-hero" aria-labelledby="for-artists-title">
        <span className="sticker hero-sticker"><Palette size={13} aria-hidden="true" /> Estudio propio</span>
        <p className="eyebrow">Para artistas / ArtLink</p>
        <h1 id="for-artists-title">Tu arte merece <em>un espacio propio.</em></h1>
        <p className="hero-description">
          ArtLink te ayuda a organizar tu portafolio, tus tarifas y tus solicitudes en un solo lugar,
          para que los clientes encuentren exactamente qué encargar y tú trabajes sin malabares entre apps.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to={primaryAction.to}>{primaryAction.label} <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="button button-secondary" to="/como-funciona">Ver cómo funciona</Link>
        </div>
      </section>

      <section className="benefits-banner" aria-labelledby="artist-benefits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Beneficios</p>
            <h2 id="artist-benefits-title">Todo lo que un estudio necesita, sin complicarlo</h2>
          </div>
        </div>
        <div className="benefits-grid">
          {artistBenefits.map(({ icon: Icon, title, text }) => (
            <article className="benefit-card" key={title}>
              <div className="step-icon"><Icon size={20} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-showcase" aria-labelledby="panel-showcase-title">
        <div className="space-copy">
          <p className="eyebrow">Así se ve tu panel</p>
          <h2 id="panel-showcase-title">Tu estudio, en el bolsillo</h2>
          <p>
            Desde el panel de artista controlas tu estado, tus cupos, tus tarifas y cada solicitud que llega.
            Lo que cambias ahí se refleja de inmediato en tu perfil público.
          </p>
          <ul>
            <li><Sparkles size={17} aria-hidden="true" /> Disponibilidad visible para cada cliente</li>
            <li><Sparkles size={17} aria-hidden="true" /> Solicitudes con estado que puedes actualizar</li>
            <li><Sparkles size={17} aria-hidden="true" /> Portafolio y comisiones editables al instante</li>
          </ul>
          <Link className="button button-primary" to={panelTarget}>Ver mi panel <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="space-preview mock-panel" aria-label="Vista previa del panel de artista">
          <div className="preview-tape" />
          <div className="mock-panel-row"><span className="preview-avatar" /><div className="mock-panel-lines"><span className="preview-line preview-line-long" /><span className="preview-line" /></div><span className="mock-panel-badge">Abierto</span></div>
          <div className="mock-panel-cards">
            <div className="mock-panel-card"><strong>4</strong><span>Cupos</span></div>
            <div className="mock-panel-card"><strong>3</strong><span>Solicitudes</span></div>
            <div className="mock-panel-card"><strong>$80</strong><span>Tarifa base</span></div>
          </div>
          <div className="mock-panel-table">
            <span /><span /><span />
          </div>
        </div>
      </section>

      <section className="feature-section" aria-labelledby="manage-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Panel de trabajo</p>
            <h2 id="manage-title">Todo lo que puedes administrar</h2>
          </div>
        </div>
        <div className="feature-list">
          {features.map(({ icon: Icon, title, text, to }) => (
            <Link className="feature-card" to={to} key={title}>
              <div className="step-icon"><Icon size={20} aria-hidden="true" /></div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <ArrowRight size={18} aria-hidden="true" className="feature-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="testimonials-section" aria-labelledby="testimonials-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Testimonios</p>
            <h2 id="testimonials-title">Quienes ya tienen su espacio</h2>
          </div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map(({ name, role, quote, rating }) => (
            <article className="testimonial-card" key={name}>
              <div className="testimonial-stars" aria-label={`${rating} de 5 estrellas`}>
                {Array.from({ length: rating }, (_, index) => <Star key={index} size={15} fill="currentColor" aria-hidden="true" />)}
              </div>
              <p>“{quote}”</p>
              <footer>
                <span className="avatar avatar-small avatar-fallback" aria-hidden="true">{name.split(' ').map((part) => part[0]).join('')}</span>
                <div><strong>{name}</strong><small>{role}</small></div>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band" aria-labelledby="start-artist-title">
        <span className="sticker">Crea tu vitrina</span>
        <h2 id="start-artist-title">Comienza como artista hoy</h2>
        <div>
          <Link className="button button-primary" to={primaryAction.to}>{primaryAction.label} <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="button button-secondary" to="/como-funciona">Ver cómo funciona</Link>
        </div>
      </section>
    </div>
  )
}