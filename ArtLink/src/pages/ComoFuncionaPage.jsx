import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Code2,
  FolderKanban,
  MessageSquareText,
  Search,
  Send,
  ShieldAlert,
  UserPlus,
} from 'lucide-react'
import DecorativeStar from '../components/DecorativeStar'

const clientSteps = [
  {
    step: 1,
    icon: Search,
    title: '1. Explora artistas',
    text: 'Filtra el catálogo por disciplina (Ilustración 2D, 3D, Animación, Pixel Art, Emotes), rango de precio, estilo y disponibilidad abierta.',
  },
  {
    step: 2,
    icon: BadgeDollarSign,
    title: '2. Revisa portafolios, precios y disponibilidad',
    text: 'Evalúa muestras en alta calidad, tarifas base públicas en USD, plazos estimados de entrega y cantidad de revisiones incluidas.',
  },
  {
    step: 3,
    icon: Send,
    title: '3. Envía una solicitud de comisión',
    text: 'Diligencia el formulario de encargo con la descripción detallada de tu idea, referencias visuales, fecha deseada y presupuesto.',
  },
  {
    step: 4,
    icon: MessageSquareText,
    title: '4. Conversa y da seguimiento a tu solicitud',
    text: 'Comunícate por el canal directo del encargo, aprueba avances por etapas y monitorea el estado (pendiente, en progreso, completada).',
  },
]

const artistSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: '1. Crear perfil',
    text: 'Registra tu cuenta como artista para obtener tu vitrina pública personalizada con tu bio, redes y disponibilidad.',
  },
  {
    step: 2,
    icon: FolderKanban,
    title: '2. Organizar portafolio',
    text: 'Sube tus mejores obras, organízalas por disciplinas de arte y añade etiquetas para que los clientes te encuentren fácilmente.',
  },
  {
    step: 3,
    icon: BadgeDollarSign,
    title: '3. Publicar tarifas',
    text: 'Define tus tipos de comisión con precios claros en USD, tiempo estimado de entrega en días y número de revisiones.',
  },
  {
    step: 4,
    icon: CalendarCheck2,
    title: '4. Gestionar solicitudes',
    text: 'Recibe encargos estructurados en tu panel, acepta o ajusta propuestas y controla tus cupos para trabajar sin sobrecarga.',
  },
]

const benefitsList = [
  {
    icon: BadgeDollarSign,
    title: 'Precios transparentes',
    text: 'Sin mensajes vacíos de “consultar por privado”. Todas las tarifas base se muestran públicamente antes de iniciar la solicitud.',
  },
  {
    icon: FolderKanban,
    title: 'Información centralizada',
    text: 'Portafolio, comisiones, términos y mensajes conviven en una misma interfaz para evitar perder detalles en redes externas.',
  },
  {
    icon: CalendarCheck2,
    title: 'Disponibilidad visible',
    text: 'Conoce en tiempo real si el artista está abierto a encargos, en lista de espera o con agenda llena, junto a sus cupos libres.',
  },
  {
    icon: MessageSquareText,
    title: 'Comunicación organizada',
    text: 'Cada solicitud mantiene su propio hilo de conversación con historial de estados, bocetos y notas sin mezclarse con otros pedidos.',
  },
]

const faqs = [
  {
    question: '¿ArtLink cobra comisiones sobre los encargos?',
    answer: 'No. En este prototipo académico ArtLink es 100% gratuito. Explorar artistas, crear un perfil y enviar o recibir solicitudes no tiene costo ni comisiones ocultas.',
  },
  {
    question: '¿Cómo funciona la disponibilidad y los cupos libres?',
    answer: 'Cada tarjeta de artista muestra su disponibilidad en tiempo real: Abierto (con número de cupos libres), Lista de espera o Cerrado. Esta información la actualiza el artista directamente desde su panel de control.',
  },
  {
    question: '¿Qué información incluye la solicitud de comisión?',
    answer: 'El formulario de encargo recopila una descripción detallada, fecha límite estimada, presupuesto propuesto en USD y tablero interactivo para adjuntar referencias visuales.',
  },
  {
    question: '¿Los precios que veo en el catálogo son los definitivos?',
    answer: 'Son tarifas base de cada tipo de servicio. Si tu encargo requiere extras como uso comercial, archivos PSD o fondo complejo, el presupuesto final se ajusta de forma transparente en la solicitud.',
  },
  {
    question: '¿Puedo registrarme como cliente y como artista?',
    answer: 'Sí. Al crear tu cuenta puedes seleccionar el rol que prefieras. Si eliges Artista, tendrás acceso tanto al directorio público como a tu panel privado de gestión.',
  },
]

function FaqAccordionItem({ item, open, onToggle, index }) {
  const panelId = `faq-panel-${index}`
  const buttonId = `faq-button-${index}`

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

export default function ComoFuncionaPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  return (
    <div className="info-page">
      {/* 1. HERO PRINCIPAL */}
      <section className="page-hero" aria-labelledby="how-title">
        <span className="sticker hero-sticker">
          <DecorativeStar size={12} color="#1E192B" /> Proceso transparente
        </span>
        <p className="eyebrow">Cómo funciona / ArtLink</p>
        <h1 id="how-title">
          Todo lo que necesitas para encargar arte, <em>en un solo lugar.</em>
        </h1>
        <p className="hero-description">
          ArtLink centraliza portafolios, precios base y disponibilidad clara de artistas digitales para transformar una idea en una colaboración segura y organizada.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/explorar">
            Explorar artistas <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/registro">
            <UserPlus size={17} aria-hidden="true" /> Crear perfil
          </Link>
        </div>
      </section>

      {/* 2. FUNCIONAMIENTO PARA CLIENTES */}
      <section className="steps-section" aria-labelledby="clients-workflow-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Para clientes</p>
            <h2 id="clients-workflow-title">Cómo solicitar y encargar arte en 4 pasos</h2>
          </div>
          <Link className="button button-outline button-small" to="/explorar">
            Ir al catálogo <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <ol className="steps-grid steps-grid-4">
          {clientSteps.map(({ icon: Icon, title, text, step }) => (
            <li className="step-card" key={title}>
              <span className="step-number" aria-hidden="true">{step}</span>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. FUNCIONAMIENTO PARA ARTISTAS */}
      <section className="steps-section steps-section-alt" aria-labelledby="artists-workflow-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Para artistas</p>
            <h2 id="artists-workflow-title">Cómo recibir y gestionar encargos como creador</h2>
          </div>
          <Link className="button button-secondary button-small" to="/registro?role=artist">
            Registrarme como artista
          </Link>
        </div>
        <ol className="steps-grid steps-grid-4">
          {artistSteps.map(({ icon: Icon, title, text, step }) => (
            <li className="step-card" key={title}>
              <span className="step-number" aria-hidden="true">{step}</span>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. SECCIÓN DE BENEFICIOS */}
      <section className="benefits-banner" aria-labelledby="benefits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ventajas de ArtLink</p>
            <h2 id="benefits-title">Diseñado para simplificar cada etapa del encargo</h2>
          </div>
        </div>
        <div className="benefits-grid">
          {benefitsList.map(({ icon: Icon, title, text }) => (
            <article className="benefit-card" key={title}>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 5. PREGUNTAS FRECUENTES (ACORDEÓN FUNCIONAL) */}
      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dudas frecuentes</p>
            <h2 id="faq-title">Preguntas y respuestas sobre el uso de la plataforma</h2>
          </div>
        </div>
        <ul className="faq-list">
          {faqs.map((item, index) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              index={index}
              open={openFaqIndex === index}
              onToggle={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
            />
          ))}
        </ul>
      </section>

      {/* 6. SECCIÓN DE ALCANSE Y DECLARACIÓN ACADÉMICA */}
      <section className="scope-notice-section" aria-labelledby="scope-title" style={{ margin: '3rem auto', maxWidth: 'var(--container)' }}>
        <div className="contact-card" style={{ borderRadius: 'var(--radius)', background: 'var(--paper)', border: '2px solid var(--ink)', boxShadow: 'var(--shadow-firm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--violet-dark)' }}>
            <ShieldAlert size={22} />
            <span className="eyebrow" style={{ color: 'var(--ink)' }}>Aviso legal de prototipo</span>
          </div>
          <h2 id="scope-title" style={{ marginTop: '0.4rem', fontSize: '1.4rem' }}>Alcance del proyecto ArtLink</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0.6rem 0 1.2rem' }}>
            ArtLink es un prototipo Frontend académico desarrollado en React y Vite. Por lo tanto:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} color="#8B5CF6" /> No procesa pasarelas de pago ni cobros reales en dinero.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} color="#8B5CF6" /> No genera contratos legales ni vinculantes entre usuarios.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: 600 }}>
              <Code2 size={16} color="#8B5CF6" /> Utiliza JSON Server y localStorage para simular la persistencia del backend.
            </li>
          </ul>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="cta-band" aria-labelledby="how-cta-title">
        <span className="sticker">Empieza hoy en ArtLink</span>
        <h2 id="how-cta-title">¿Listo para conectar tu próxima idea?</h2>
        <div>
          <Link className="button button-primary" to="/explorar">
            Explorar artistas <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/registro?role=artist">
            Comenzar como artista
          </Link>
        </div>
      </section>
    </div>
  )
}