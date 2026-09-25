import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  Inbox,
  MessageSquareText,
  Star,
  UserCheck,
  Wallet,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import { ROLES } from '../utils/roles'
import AvailabilityBadge from '../components/AvailabilityBadge'
import Badge from '../components/Badge'
import DecorativeStar from '../components/DecorativeStar'

const artistBenefits = [
  {
    icon: UserCheck,
    title: 'Perfil profesional',
    text: 'Una vitrina digital limpia con tu bio, redes sociales, disciplinas principales y verificación de artista.',
  },
  {
    icon: FolderKanban,
    title: 'Portafolio centralizado',
    text: 'Organiza tus obras destacadas por categorías con etiquetas visuales y previsualización en alta definición.',
  },
  {
    icon: Wallet,
    title: 'Tarifas organizadas',
    text: 'Publica tus tipos de comisión con precios base públicos en USD, plazos estimados de entrega y revisiones.',
  },
  {
    icon: CalendarCheck2,
    title: 'Control de disponibilidad',
    text: 'Cambia en tiempo real entre Abierto, Lista de espera o Cerrado, definiendo exactamente cuántos cupos asumes.',
  },
  {
    icon: Inbox,
    title: 'Gestión de solicitudes',
    text: 'Recibe encargos estructurados con fecha deseada, presupuesto y referencias visuales sin cotizaciones a ciegas.',
  },
  {
    icon: MessageSquareText,
    title: 'Comunicación con clientes',
    text: 'Cada pedido cuenta con una sala de chat dedicada para acordar revisiones, enviar bocetos y confirmar avances.',
  },
]

const featuresGridData = [
  {
    icon: FolderKanban,
    title: 'Portafolio',
    text: 'Organización por disciplinas artísticas con vista de detalle y etiquetas.',
    linkTo: '/artista/portafolio',
    linkText: 'Ver sección',
  },
  {
    icon: Wallet,
    title: 'Comisiones',
    text: 'Gestión de catálogo de precios, plazos y revisiones con estado activo/pausado.',
    linkTo: '/artista/comisiones',
    linkText: 'Ver tarifas',
  },
  {
    icon: CalendarCheck2,
    title: 'Cupos disponibles',
    text: 'Contador de agenda en vivo que informa automáticamente a los clientes.',
    linkTo: '/artista/panel',
    linkText: 'Ajustar agenda',
  },
  {
    icon: Inbox,
    title: 'Solicitudes',
    text: 'Bandeja de encargos recibidos con actualización de estados en tiempo real.',
    linkTo: '/artista/panel',
    linkText: 'Bandeja de encargos',
  },
  {
    icon: MessageSquareText,
    title: 'Mensajes',
    text: 'Hilo de chat directo vinculado al brief y referencias del pedido.',
    linkTo: '/solicitudes',
    linkText: 'Ver mensajes',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas',
    text: 'Resumen de ingresos proyectados, calificación promedio y encargos completados.',
    linkTo: '/artista/panel',
    linkText: 'Ver métricas',
  },
]

const setupSteps = [
  {
    step: 1,
    icon: UserCheck,
    title: '1. Configura tu perfil',
    text: 'Registra tus datos públicos, bio, disciplina principal y enlace a tu presencia en redes.',
  },
  {
    step: 2,
    icon: FolderKanban,
    title: '2. Agrega tu portafolio',
    text: 'Sube tus mejores piezas de ilustración, 3D, animación o pixel art ordenadas por especialidad.',
  },
  {
    step: 3,
    icon: Wallet,
    title: '3. Publica tus comisiones',
    text: 'Define opciones de encargo con precios transparentes en USD, tiempos de entrega y revisiones.',
  },
  {
    step: 4,
    icon: Inbox,
    title: '4. Gestiona solicitudes',
    text: 'Recibe encargos estructurados con brief completo, aprueba pedidos y mantén tu agenda bajo control.',
  },
]

const artistFaqs = [
  {
    question: '¿ArtLink cobra alguna comisión sobre los encargos que recibo?',
    answer: 'No. En este prototipo académico el servicio es 100% gratuito. No cobramos comisiones ni tarifas de suscripción sobre tus encargos.',
  },
  {
    question: '¿Cómo puedo cambiar mi estado de disponibilidad o pausar comisiones?',
    answer: 'Desde tu panel de artista puedes alternar en un clic entre Abierto, Lista de espera o Cerrado, así como pausar servicios individuales cuando alcances tu capacidad máxima.',
  },
  {
    question: '¿Qué información recibo cuando un cliente solicita una comisión?',
    answer: 'Cada solicitud incluye una descripción formal del proyecto, la fecha límite estimada, el presupuesto propuesto en USD y las imágenes de referencia adjuntas.',
  },
  {
    question: '¿Qué sucede si ya estoy registrado como cliente y quiero ser artista?',
    answer: 'Puedes crear una cuenta de artista utilizando una dirección de correo alternativa o actualizar el rol de tu cuenta desde la sección de ajustes.',
  },
  {
    question: '¿Puedo modificar mis precios en cualquier momento?',
    answer: 'Sí. Puedes editar tus tarifas base, tiempos de entrega o descripciones en cualquier momento desde la pestaña "Comisiones" de tu panel.',
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
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  // Enrutamiento inteligente de botones principales
  const isArtist = user?.role === ROLES.ARTIST
  const isClient = user?.role === ROLES.CLIENT

  let profileButtonDestination = '/registro?role=artist'
  let profileButtonText = 'Crear mi perfil'

  if (isArtist) {
    profileButtonDestination = '/artista/panel'
    profileButtonText = 'Ir a mi panel de artista'
  } else if (isClient) {
    profileButtonDestination = '/registro?role=artist'
    profileButtonText = 'Registrarme como artista'
  }

  return (
    <div className="info-page">
      {/* 1. HERO PRINCIPAL */}
      <section className="page-hero" aria-labelledby="for-artists-title">
        <span className="sticker hero-sticker">
          <DecorativeStar size={12} color="#1E192B" /> Estudio propio para creadores
        </span>
        <p className="eyebrow">Para artistas / ArtLink</p>
        <h1 id="for-artists-title">
          Tu arte merece <em>un espacio propio.</em>
        </h1>
        <p className="hero-description">
          ArtLink te ayuda a organizar tu portafolio por disciplinas, publicar tarifas claras con entrega garantizada y gestionar tus solicitudes sin el desorden de DMs perdidos.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to={profileButtonDestination}>
            {profileButtonText} <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/como-funciona">
            Ver cómo funciona
          </Link>
        </div>
      </section>

      {/* 2. SECCIÓN DE BENEFICIOS */}
      <section className="benefits-banner" aria-labelledby="artist-benefits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ventajas para creadores</p>
            <h2 id="artist-benefits-title">Todo lo que necesitas para trabajar con tranquilidad</h2>
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

      {/* 3. PREVIEW VISUAL DE PERFIL DE ARTISTA */}
      <section className="panel-showcase" aria-labelledby="profile-preview-title">
        <div className="space-copy">
          <p className="eyebrow">Vista previa del perfil</p>
          <h2 id="profile-preview-title">Así lucirá tu vitrina pública en ArtLink</h2>
          <p>
            Tus clientes tendrán una visión completa de tus servicios, tus piezas de muestra y tu disponibilidad en tiempo real, facilitando la toma de decisiones.
          </p>
          <ul>
            <li><CheckCircle2 size={17} aria-hidden="true" /> Insignia de verificación y presencia pública</li>
            <li><CheckCircle2 size={17} aria-hidden="true" /> Catálogo de comisiones con precios base en USD</li>
            <li><CheckCircle2 size={17} aria-hidden="true" /> Portafolio ordenado por disciplinas de arte</li>
          </ul>
          <div className="hero-actions" style={{ marginTop: '1.4rem' }}>
            <Link className="button button-primary" to={profileButtonDestination}>
              {profileButtonText} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="button button-outline" to="/explorar">
              Ver catálogo público
            </Link>
          </div>
        </div>

        {/* Mockup visual de perfil */}
        <div className="space-preview mock-panel" aria-label="Vista previa de perfil de artista demostrativo" style={{ minHeight: 'auto', padding: '1.4rem' }}>
          <div className="preview-tape" />
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
              <AvailabilityBadge status="open" label="3 CUPOS LIBRES" />
            </div>
          </div>

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
        </div>
      </section>

      {/* 4. SECCIÓN DE PASOS DE CONFIGURACIÓN */}
      <section className="steps-section" aria-labelledby="setup-steps-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Paso a paso</p>
            <h2 id="setup-steps-title">Cómo empezar a recibir encargos en 4 pasos</h2>
          </div>
        </div>
        <ol className="steps-grid steps-grid-4">
          {setupSteps.map(({ icon: Icon, title, text, step }) => (
            <li className="step-card" key={title}>
              <span className="step-number" aria-hidden="true">{step}</span>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. SECCIÓN DE FUNCIONALIDADES */}
      <section className="feature-section" aria-labelledby="features-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Herramientas del panel</p>
            <h2 id="features-title">Todo tu trabajo organizado en un solo panel</h2>
          </div>
        </div>
        <div className="feature-list">
          {featuresGridData.map(({ icon: Icon, title, text, linkTo, linkText }) => (
            <Link key={title} to={isArtist ? linkTo : '/registro?role=artist'} className="feature-card">
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--violet-dark)', marginTop: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  {linkText} <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. PREGUNTAS FRECUENTES (ACORDEÓN FUNCIONAL) */}
      <section className="faq-section" id="faq-artistas" aria-labelledby="artist-faq-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 id="artist-faq-title">Dudas comunes sobre la cuenta de artista</h2>
          </div>
        </div>
        <ul className="faq-list">
          {artistFaqs.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              index={index}
              open={openFaqIndex === index}
              onToggle={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
            />
          ))}
        </ul>
      </section>

      {/* 7. CTA FINAL CON ENRUTAMIENTO INTELIGENTE */}
      <section className="cta-band" aria-labelledby="start-artist-title">
        <span className="sticker">Crea tu vitrina hoy</span>
        <h2 id="start-artist-title">Empieza a recibir encargos con orden y claridad</h2>
        <div>
          <Link className="button button-primary" to={profileButtonDestination}>
            {profileButtonText} <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/explorar">
            Explorar ArtLink
          </Link>
        </div>
      </section>
    </div>
  )
}