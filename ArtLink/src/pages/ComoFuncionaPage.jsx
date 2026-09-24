import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeDollarSign, CalendarCheck2, FolderKanban, Info, MessageSquareText, Plus, Search, Send, Sparkles, UserPlus } from 'lucide-react'

const clientSteps = [
  { icon: Search, title: 'Explora artistas', text: 'Navega por el directorio y filtra por disciplina, estilo, disponibilidad y presupuesto para encontrar a la persona indicada.' },
  { icon: BadgeDollarSign, title: 'Revisa precios y disponibilidad', text: 'Cada perfil muestra tarifas base, tiempos de entrega, revisiones y si el artista tiene la agenda abierta.' },
  { icon: Send, title: 'Envía una solicitud clara', text: 'Describe tu idea, elige la comisión y confirma fechas. Todo en un mismo formulario, sin mensajes perdidos.' },
]

const artistSteps = [
  { icon: UserPlus, title: 'Crea tu perfil', text: 'Preséntate con tu nombre, disciplinas, estilos y portafolio. Tu espacio público queda listo en minutos.' },
  { icon: FolderKanban, title: 'Organiza portafolio y tarifas', text: 'Sube piezas, define comisiones con precio, entrega y revisiones. La información queda visible para cada cliente.' },
  { icon: CalendarCheck2, title: 'Gestiona tus solicitudes', text: 'Recibe encargos ordenados, actualiza su estado y responde desde un solo panel de trabajo.' },
]

const benefits = [
  { icon: BadgeDollarSign, title: 'Precios transparentes', text: 'Tarifas base a la vista. Nada de “háblame al privado”.' },
  { icon: CalendarCheck2, title: 'Disponibilidad visible', text: 'Cada artista comunica si está abierto, en lista de espera o cerrado.' },
  { icon: Info, title: 'Información centralizada', text: 'Portafolio, comisiones y estado del encargo viven en un solo lugar.' },
  { icon: MessageSquareText, title: 'Comunicación más clara', text: 'Conversaciones asociadas a cada solicitud, sin hilos infinitos.' },
]

const faqs = [
  {
    question: '¿ArtLink cobra por usar la plataforma?',
    answer: 'No. En este prototipo académico explorar, crear perfil y enviar solicitudes es gratuito. No se procesan pagos ni comisiones reales.',
  },
  {
    question: '¿Puedo encargar arte a un artista con agenda cerrada?',
    answer: 'No de forma directa. Puedes unirte a su lista de espera cuando el artista la tenga habilitada, y tu solicitud quedará registrada para cuando abra cupos.',
  },
  {
    question: '¿Los precios que veo son los finales?',
    answer: 'Los precios que muestra cada comisión son la tarifa base. El precio final se confirma con el artista según el alcance del encargo, revisiones y derechos de uso.',
  },
  {
    question: '¿Cómo sé si un artista realmente está disponible?',
    answer: 'Cada perfil muestra su disponibilidad (abierto, lista de espera o cerrado) y los cupos actuales. El artista la actualiza desde su panel.',
  },
  {
    question: '¿Qué pasa cuando envío una solicitud?',
    answer: 'La solicitud llega a la bandeja del artista con tu descripción, presupuesto y fecha deseada. Tú puedes seguir su estado desde “Mis solicitudes”.',
  },
  {
    question: '¿Solo hay categorías como Ilustración 2D y Modelado 3D?',
    answer: 'ArtLink incluye Ilustración 2D, Modelado 3D, Animación, Pixel Art y Emotes, además de estilos y disciplinas nuevas que los artistas pueden agregar a su perfil.',
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
          <Plus size={19} aria-hidden="true" className={open ? 'is-open' : ''} />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} className={`faq-answer ${open ? 'is-open' : ''}`}>
        {open && <p>{item.answer}</p>}
      </div>
    </li>
  )
}

export default function ComoFuncionaPage() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="info-page">
      <section className="page-hero" aria-labelledby="how-title">
        <span className="sticker hero-sticker"><Sparkles size={13} aria-hidden="true" /> Sin ruido</span>
        <p className="eyebrow">Cómo funciona / ArtLink</p>
        <h1 id="how-title">Todo lo que necesitas para encargar arte, <em>en un solo lugar.</em></h1>
        <p className="hero-description">
          Hoy la información sobre artistas vive fragmentada: un portafolio en un lugar, los precios en otro y la disponibilidad, quién sabe dónde.
          ArtLink junta todo eso y le pone orden para que cada encargo empiece con claridad.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/explorar">Explorar artistas <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="button button-secondary" to="/registro?role=artist">Crear perfil de artista</Link>
        </div>
      </section>

      <section className="steps-section" aria-labelledby="client-steps-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Para clientes</p>
            <h2 id="client-steps-title">Encargar arte en 3 pasos</h2>
          </div>
        </div>
        <ol className="steps-grid">
          {clientSteps.map(({ icon: Icon, title, text }, index) => (
            <li className="step-card" key={title}>
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="steps-section steps-section-alt" aria-labelledby="artist-steps-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Para artistas</p>
            <h2 id="artist-steps-title">Recibir encargos en 3 pasos</h2>
          </div>
        </div>
        <ol className="steps-grid">
          {artistSteps.map(({ icon: Icon, title, text }, index) => (
            <li className="step-card" key={title}>
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <div className="step-icon"><Icon size={22} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="benefits-banner" aria-labelledby="benefits-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Por qué ArtLink</p>
            <h2 id="benefits-title">Menos fricción, mejores encargos</h2>
          </div>
        </div>
        <div className="benefits-grid">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article className="benefit-card" key={title}>
              <div className="step-icon"><Icon size={20} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 id="faq-title">Resolver dudas también es parte del proceso</h2>
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

      <section className="cta-band" aria-labelledby="how-cta-title">
        <span className="sticker">Tu próxima colaboración está aquí</span>
        <h2 id="how-cta-title">Listo para empezar</h2>
        <div>
          <Link className="button button-primary" to="/explorar">Explorar artistas <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="button button-secondary" to="/registro?role=artist">Crear perfil de artista</Link>
        </div>
      </section>
    </div>
  )
}