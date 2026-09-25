import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarCheck2, CheckCircle2, ChevronDown, FolderKanban, Inbox, MessageSquareText, Palette, Star, Wallet, Zap } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { ROLES } from '../utils/roles'
import AvailabilityBadge from '../components/AvailabilityBadge'
import Badge from '../components/Badge'

const artistBenefits = [
  {
    icon: BadgeCheck,
    title: 'Perfil profesional personalizado',
    text: 'Una vitrina digital con tu nombre, bio, disciplinas, estilos y tus mejores piezas ordenadas por categoría.',
  },
  {
    icon: Wallet,
    title: 'Tarifas públicas y respetadas',
    text: 'Publica precios base, plazos y revisiones. Quien te contacta ya conoce y valora el costo de tu trabajo.',
  },
  {
    icon: CalendarCheck2,
    title: 'Control estricto de agenda y cupos',
    text: 'Indica si estás abierto, en lista de espera o cerrado. Define cuántos encargos simultáneos puedes asumir.',
  },
  {
    icon: Inbox,
    title: 'Solicitudes estructuradas',
    text: 'Recibe briefs con descripción clara, referencias visuales, fecha deseada y presupuesto en USD.',
  },
  {
    icon: MessageSquareText,
    title: 'Comunicación en un solo hilo',
    text: 'Cada solicitud tiene su sala de conversación asociada. Dile adiós a mensajes traspapelados en redes.',
  },
  {
    icon: Zap,
    title: 'Sin comisiones ocultas',
    text: 'En ArtLink el uso de la plataforma es gratuito. No cobramos porcentajes sobre tus encargos artísticos.',
  },
]

const setupSteps = [
  {
    step: 1,
    icon: CalendarCheck2,
    title: '1. Configura tu disponibilidad',
    text: 'Establece tu estado (Abierto, Lista de espera o Cerrado) y define cuántos cupos simultáneos aceptas.',
    linkTo: '/artista/panel',
    linkText: 'Ajustar cupos',
  },
  {
    step: 2,
    icon: Wallet,
    title: '2. Publica tus comisiones',
    text: 'Crea opciones con título (ej. Busto, Ilustración completa), tarifa base en USD, días de entrega y revisiones.',
    linkTo: '/artista/comisiones',
    linkText: 'Definir tarifas',
  },
  {
    step: 3,
    icon: FolderKanban,
    title: '3. Sube tu portafolio',
    text: 'Añade tus obras destacadas, clasifícalas por disciplina visual y asígnales etiquetas para búsquedas.',
    linkTo: '/artista/portafolio',
    linkText: 'Gestionar portafolio',
  },
  {
    step: 4,
    icon: Inbox,
    title: '4. Recibe y gestiona encargos',
    text: 'Revisa solicitudes entrantes, acéptalas o ponlas en espera, y actualiza el estado de cada pedido.',
    linkTo: '/artista/panel',
    linkText: 'Ver bandeja de encargos',
  },
]

const artistFaqs = [
  {
    question: '¿ArtLink cobra alguna comisión por los encargos recibidos?',
    answer: 'No. En este prototipo académico ArtLink no cobra ninguna comisión ni tarifa de suscripción. El 100% de lo pactado con tu cliente es para ti.',
  },
  {
    question: '¿Cómo actualizo mi disponibilidad o la cantidad de cupos?',
    answer: 'Desde tu panel de artista dispones de selectores rápidos para alternar entre Abierto, Lista de espera o Cerrado, así como ajustar el contador de cupos libres en cualquier instante.',
  },
  {
    question: '¿Qué información incluye cada solicitud que me envía un cliente?',
    answer: 'Cada encargo llega con la descripción detallada del cliente, el presupuesto estimado en USD, la fecha límite requerida y enlaces a referencias visuales, evitando preguntas iniciales repetitivas.',
  },
  {
    question: '¿Puedo pausar comisiones o cambiar precios cuando lo necesite?',
    answer: 'Sí. Puedes editar tus tipos de comisión, modificar tarifas base, ajustar tiempos de entrega o desactivar temporalmente un servicio sin alterar los encargos que ya estén en curso.',
  },
  {
    question: '¿Cómo coordino con el cliente las revisiones y la entrega final?',
    answer: 'Cada solicitud tiene una sección de mensajes directa y privada para aclarar dudas, enviar bocetos preliminares y confirmar la aprobación de cada etapa del proyecto.',
  },
  {
    question: '¿Qué requisitos técnicos necesito para publicar mi portafolio?',
    answer: 'Puedes subir piezas en formatos estándar de imagen digital (PNG, JPG, SVG, WebP) asignándoles título, disciplina artística y descripción técnica.',
  },
]

function FaqItem({ item, open, onToggle, index }) {
  const panelId = `artist-faq-panel-${index}`
  const buttonId = `artist-faq-button-${index}`

  return (
    <li className="faq-item">
      <h3>
        <button
          className="faq-question"
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{item.question}</span>
          <ChevronDown
            size={20}
            aria-hidden="true"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`faq-answer ${open ? 'is-open' : ''}`}
      >
        {open && <p>{item.answer}</p>}
      </div>
    </li>
  )
}

export default function ParaArtistasPage() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)

  const isArtist = user?.role === ROLES.ARTIST
  const primaryAction = isArtist
    ? { label: 'Ir a mi panel de artista', to: '/artista/panel' }
    : { label: 'Crear perfil de artista', to: '/registro?role=artist' }

  return (
    <div className="info-page">
      {/* 1. HERO */}
      <section className="page-hero" aria-labelledby="for-artists-title">
        <span className="sticker hero-sticker"><Palette size={13} aria-hidden="true" /> Estudio propio</span>
        <p className="eyebrow">Para artistas / ArtLink</p>
        <h1 id="for-artists-title">Tu arte merece <em>un espacio profesional propio.</em></h1>
        <p className="hero-description">
          Publica tu portafolio, fija tus tarifas base y recibe solicitudes con briefs completos y fechas claras.
          Olvídate de cotizaciones interminables en DMs y gestiona tus cupos con orden.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to={primaryAction.to}>
            {primaryAction.label} <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/como-funciona">
            Ver cómo funciona
          </Link>
        </div>
      </section>

      {/* 2. BENEFICIOS */}
      <section className="benefits-banner" aria-labelledby="artist-benefits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Beneficios clave</p>
            <h2 id="artist-benefits-title">Menos tiempo cotizando, más tiempo creando</h2>
          </div>
        </div>
        <div className="benefits-grid">
          {artistBenefits.map(({ icon: Icon, title, text }) => (
            <article className="benefit-card" key={title}>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. PREVIEW VISUAL DE UN PERFIL */}
      <section className="panel-showcase" aria-labelledby="profile-preview-title">
        <div className="space-copy">
          <p className="eyebrow">Tu vitrina pública</p>
          <h2 id="profile-preview-title">Así verán tus clientes tu perfil en ArtLink</h2>
          <p>
            Un diseño limpio y transparente que muestra tu disponibilidad actual, tu rango de precios y tus opciones de encargo para que los clientes tomen la iniciativa con confianza.
          </p>
          <ul>
            <li><CheckCircle2 size={17} aria-hidden="true" /> Badge de disponibilidad en vivo (Abierto, Lista de espera o Cerrado)</li>
            <li><CheckCircle2 size={17} aria-hidden="true" /> Tipos de comisión con entregas y revisiones claras</li>
            <li><CheckCircle2 size={17} aria-hidden="true" /> Portafolio integrado con categorías y etiquetas visuales</li>
          </ul>
          <div className="hero-actions" style={{ marginTop: '1.4rem' }}>
            <Link className="button button-primary" to={primaryAction.to}>
              {primaryAction.label} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="button button-outline" to="/explorar">
              Ver perfiles en el catálogo
            </Link>
          </div>
        </div>

        {/* MOCKUP VISUAL DEL PERFIL DE ARTISTA */}
        <div className="space-preview mock-panel" aria-label="Vista previa de perfil de artista demostrativo" style={{ minHeight: 'auto', padding: '1.4rem' }}>
          <div className="preview-tape" />
          {/* Header de la tarjeta del artista */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
            <span className="avatar avatar-medium avatar-fallback" style={{ background: '#2DD4BF', color: '#1E192B' }}>MR</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>Mateo Ríos</strong>
                <BadgeCheck size={17} color="#8B5CF6" aria-label="Artista verificado" />
              </div>
              <small style={{ color: 'var(--muted)', display: 'block', fontSize: '0.75rem' }}>@mateorios.art · Ilustración 2D</small>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <AvailabilityBadge status="open" />
            </div>
          </div>

          {/* Estadísticas rápidas demostrativas */}
          <div className="mock-panel-cards" style={{ margin: '0.8rem 0 1rem' }}>
            <div className="mock-panel-card" style={{ padding: '0.65rem' }}>
              <strong style={{ fontSize: '1.15rem' }}>3</strong>
              <span>Cupos libres</span>
            </div>
            <div className="mock-panel-card" style={{ padding: '0.65rem' }}>
              <strong style={{ fontSize: '1.15rem' }}>$45+</strong>
              <span>Tarifa base</span>
            </div>
            <div className="mock-panel-card" style={{ padding: '0.65rem' }}>
              <strong style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                <Star size={14} fill="#8B5CF6" color="#8B5CF6" /> 4.9
              </strong>
              <span>18 pedidos</span>
            </div>
          </div>

          {/* Comisiones del artista de muestra */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.8rem' }}>
            <div style={{ background: 'var(--paper)', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Retrato digital / Busto</strong>
                <small style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>5 días de entrega · 2 revisiones</small>
              </div>
              <Badge tone="violet">$45 USD</Badge>
            </div>
            <div style={{ background: 'var(--paper)', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Ilustración completa con fondo</strong>
                <small style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>12 días de entrega · 3 revisiones</small>
              </div>
              <Badge tone="violet">$95 USD</Badge>
            </div>
          </div>

          {/* Mini galería de piezas demostrativas */}
          <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.8rem' }}>
            <span style={{ background: '#DDD0FF', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.55rem', fontSize: '0.68rem', fontWeight: 600 }}>Concept Art</span>
            <span style={{ background: '#FFD2E7', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.55rem', fontSize: '0.68rem', fontWeight: 600 }}>Editorial</span>
            <span style={{ background: '#BFF7EA', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.55rem', fontSize: '0.68rem', fontWeight: 600 }}>Fantasía</span>
          </div>
        </div>
      </section>

      {/* 4. FLUJO PARA CONFIGURAR PORTAFOLIO / COMISIONES / DISPONIBILIDAD */}
      <section className="steps-section" aria-labelledby="artist-workflow-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Flujo de configuración</p>
            <h2 id="artist-workflow-title">Cómo configurar tu espacio de artista</h2>
          </div>
          <Link className="button button-outline button-small" to={isArtist ? '/artista/panel' : '/login'}>
            {isArtist ? 'Ver mi panel' : 'Iniciar sesión'} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <ol className="steps-grid steps-grid-4">
          {setupSteps.map(({ icon: Icon, title, text, step, linkTo, linkText }) => (
            <li className="step-card" key={title}>
              <span className="step-number" aria-hidden="true">{step}</span>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--line)' }}>
                <Link to={isArtist ? linkTo : '/registro?role=artist'} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--violet-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                  {linkText} <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. FAQ CON ACORDEÓN FUNCIONAL */}
      <section className="faq-section" id="faq-artistas" aria-labelledby="artist-faq-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 id="artist-faq-title">Dudas comunes al unirte como artista</h2>
          </div>
        </div>
        <ul className="faq-list">
          {artistFaqs.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              index={index}
              open={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
            />
          ))}
        </ul>
      </section>

      {/* 6. CTA BAND CON BOTONES FUNCIONALES */}
      <section className="cta-band" aria-labelledby="start-artist-title">
        <span className="sticker">Crea tu vitrina hoy</span>
        <h2 id="start-artist-title">Empieza a recibir encargos con orden y claridad</h2>
        <div>
          <Link className="button button-primary" to={primaryAction.to}>
            {primaryAction.label} <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/explorar">
            Explorar el catálogo
          </Link>
        </div>
      </section>
    </div>
  )
}