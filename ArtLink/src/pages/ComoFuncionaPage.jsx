import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeDollarSign, CalendarCheck2, CheckCircle2, ChevronDown, Clock, FolderKanban, Search, Send, ShieldCheck, Sparkles, UserPlus } from 'lucide-react'

const fourSteps = [
  {
    step: 1,
    icon: Search,
    title: '1. Explora el catálogo',
    text: 'Filtra por disciplina (Ilustración 2D, 3D, Animación, Pixel Art, Emotes), estilo visual, presupuesto y disponibilidad abierta.',
  },
  {
    step: 2,
    icon: BadgeDollarSign,
    title: '2. Revisa tarifas y tiempos',
    text: 'Evalúa portafolios verificados con precios base públicos, plazos estimados de entrega y número de revisiones incluidas.',
  },
  {
    step: 3,
    icon: Send,
    title: '3. Envía tu solicitud formal',
    text: 'Completa un formulario estructurado con la descripción de tu proyecto, referencias visuales, fecha deseada y presupuesto.',
  },
  {
    step: 4,
    icon: CheckCircle2,
    title: '4. Colabora con orden',
    text: 'Sigue el estado en tiempo real (pendiente, aceptada, en progreso, completada), intercambia mensajes y recibe tu entrega.',
  },
]

const clientBenefits = [
  {
    icon: BadgeDollarSign,
    title: 'Precios base transparentes',
    text: 'Sin mensajes ambiguos de “háblame al privado”. Conoce las tarifas de antemano para ajustar tu presupuesto con seguridad.',
  },
  {
    icon: CalendarCheck2,
    title: 'Disponibilidad en tiempo real',
    text: 'Cada artista indica si está abierto para encargos inmediatos, en lista de espera o con agenda cerrada, además de sus cupos.',
  },
  {
    icon: ShieldCheck,
    title: 'Solicitudes estructuradas',
    text: 'Toda la información del encargo queda registrada en un formulario guiado con fecha, referencias y descripción detallada.',
  },
  {
    icon: Clock,
    title: 'Seguimiento claro de entregas',
    text: 'Monitorea el progreso de cada pieza desde tu panel personal, con historial ordenado y sin perder hilos de conversación.',
  },
]

const artistBenefits = [
  {
    icon: CalendarCheck2,
    title: 'Control total de cupos',
    text: 'Abre o pausa tus comisiones con un clic cuando alcances tu límite de trabajo para evitar sobrecarga y retrasos.',
  },
  {
    icon: Send,
    title: 'Briefs completos desde el día uno',
    text: 'Recibe solicitudes con descripción formal, presupuesto y fechas fijadas. Menos tiempo respondiendo preguntas repetitivas.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Tarifas públicas y respetadas',
    text: 'Los clientes llegan conociendo el valor de tu trabajo, reduciendo cotizaciones infructuosas y regateos innecesarios.',
  },
  {
    icon: FolderKanban,
    title: 'Vitrina profesional integrada',
    text: 'Tu portafolio, tipos de comisión y bandeja de encargos conviven en una misma plataforma diseñada para creadores.',
  },
]

const faqs = [
  {
    question: '¿ArtLink cobra comisiones sobre los encargos?',
    answer: 'No. En este prototipo académico ArtLink es 100% gratuito. Explorar artistas, crear un perfil y gestionar solicitudes no tiene ningún costo ni comisión oculta.',
  },
  {
    question: '¿Cómo sé si un artista tiene cupos disponibles?',
    answer: 'Cada tarjeta y perfil de artista muestra su disponibilidad en tiempo real: Abierto (con número de cupos disponibles), Lista de espera o Cerrado. Esta información la actualiza el artista directamente desde su panel.',
  },
  {
    question: '¿Qué pasa una vez enviada mi solicitud de encargo?',
    answer: 'La solicitud llega de inmediato a la bandeja del artista con todo tu brief. El artista puede aceptarla, solicitar ajustes o rechazarla con una nota. Puedes revisar el avance en cualquier momento desde “Mis solicitudes”.',
  },
  {
    question: '¿Los precios que veo en el catálogo son los definitivos?',
    answer: 'Los precios mostrados son las tarifas base de cada tipo de comisión. Si tu proyecto requiere complejidad especial, fondos detallados o derechos de uso comercial, el artista confirmará el presupuesto final en la solicitud.',
  },
  {
    question: '¿Puedo solicitar arte si el artista tiene agenda cerrada?',
    answer: 'Si el artista tiene habilitada la lista de espera, puedes registrar tu solicitud para cuando vuelva a abrir cupos. Si está completamente cerrado, te recomendamos guardar su perfil en tus favoritos.',
  },
  {
    question: '¿Puedo registrarme como artista y como cliente?',
    answer: 'Sí. Al crear tu cuenta puedes seleccionar si buscas encargar arte (Cliente) o recibir pedidos (Artista). Si eres artista, tendrás acceso automático a tu panel de trabajo y a tu espacio público.',
  },
]

function FaqItem({ item, open, onToggle, index }) {
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
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="info-page">
      {/* 1. HERO */}
      <section className="page-hero" aria-labelledby="how-title">
        <span className="sticker hero-sticker"><Sparkles size={13} aria-hidden="true" /> Proceso transparente</span>
        <p className="eyebrow">Cómo funciona / ArtLink</p>
        <h1 id="how-title">Todo lo que necesitas para encargar arte, <em>en un solo lugar.</em></h1>
        <p className="hero-description">
          Conecta clientes y artistas digitales con portafolios, precios base y disponibilidad clara desde el primer contacto.
          Sin mensajes perdidos en redes ni cotizaciones a ciegas.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/explorar">
            Explorar artistas <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/registro">
            <UserPlus size={17} aria-hidden="true" /> Crear cuenta
          </Link>
        </div>
      </section>

      {/* 2. FLUJO DE 4 PASOS */}
      <section className="steps-section" aria-labelledby="workflow-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Paso a paso</p>
            <h2 id="workflow-title">El flujo de trabajo en 4 sencillos pasos</h2>
          </div>
          <Link className="button button-outline button-small" to="/explorar">
            Ver catálogo <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <ol className="steps-grid steps-grid-4">
          {fourSteps.map(({ icon: Icon, title, text, step }) => (
            <li className="step-card" key={title}>
              <span className="step-number" aria-hidden="true">{step}</span>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. BENEFICIOS PARA CLIENTES */}
      <section className="benefits-banner" aria-labelledby="client-benefits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Para clientes</p>
            <h2 id="client-benefits-title">Encarga con total seguridad y claridad</h2>
          </div>
        </div>
        <div className="benefits-grid">
          {clientBenefits.map(({ icon: Icon, title, text }) => (
            <article className="benefit-card" key={title}>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. BENEFICIOS PARA ARTISTAS */}
      <section className="benefits-banner" aria-labelledby="artist-benefits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Para artistas</p>
            <h2 id="artist-benefits-title">Tu espacio profesional para recibir encargos</h2>
          </div>
          <Link className="button button-secondary button-small" to="/registro?role=artist">
            Abrir perfil de artista
          </Link>
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

      {/* 5. FAQ CON ACORDEÓN FUNCIONAL */}
      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 id="faq-title">Todo lo que necesitas saber antes de empezar</h2>
          </div>
        </div>
        <ul className="faq-list">
          {faqs.map((item, index) => (
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

      {/* 6. CTA BAND CON BOTONES A /explorar Y /registro */}
      <section className="cta-band" aria-labelledby="how-cta-title">
        <span className="sticker">Empieza hoy en ArtLink</span>
        <h2 id="how-cta-title">¿Listo para conectar tu arte?</h2>
        <div>
          <Link className="button button-primary" to="/explorar">
            Explorar artistas <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" to="/registro">
            <UserPlus size={16} aria-hidden="true" /> Crear cuenta gratis
          </Link>
        </div>
      </section>
    </div>
  )
}