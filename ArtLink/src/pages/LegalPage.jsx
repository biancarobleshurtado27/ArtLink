import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Mail, MessageCircleQuestion } from 'lucide-react'
import ContactForm from '../components/ContactForm'

const sections = {
  '/ayuda': {
    eyebrow: 'Centro de ayuda',
    title: '¿En qué podemos ayudarte?',
    intro: 'Encuentra respuestas rápidas sobre cómo funciona ArtLink o cómo contactar con el equipo.',
  },
  '/terminos': {
    eyebrow: 'Legal / Términos',
    title: 'Términos del servicio',
    intro: 'Estos términos gobiernan el uso del prototipo académico ArtLink.',
  },
  '/privacidad': {
    eyebrow: 'Legal / Privacidad',
    title: 'Política de privacidad',
    intro: 'Así tratamos la información en este proyecto académico.',
  },
  '/contacto': {
    eyebrow: 'Soporte / Contacto',
    title: 'Contacto',
    intro: 'Cuéntanos qué pasó y te responderemos lo antes posible.',
  },
}

function HelpHub() {
  return (
    <div className="help-cards">
      <Link className="help-card" to="/como-funciona#faq">
        <MessageCircleQuestion size={24} aria-hidden="true" />
        <div>
          <h2>Preguntas frecuentes</h2>
          <p>Las dudas más comunes de clientes y artistas, resueltas en el acordeón de “Cómo funciona”.</p>
        </div>
        <span>Ver FAQ <ArrowLeft className="rotate-180" size={15} aria-hidden="true" /></span>
      </Link>
      <Link className="help-card" to="/contacto">
        <Mail size={24} aria-hidden="true" />
        <div>
          <h2>Escribir al equipo</h2>
          <p>¿Tienes un problema con tu cuenta o una solicitud? Escríbenos y lo revisamos.</p>
        </div>
        <span>Ir a contacto <ArrowLeft className="rotate-180" size={15} aria-hidden="true" /></span>
      </Link>
      <div className="help-note">
        <h2>Datos de prueba</h2>
        <p>Inicia sesión con <strong>lucia@artlink.demo</strong> / <strong>cliente123</strong> (cliente), <strong>mateo@artlink.demo</strong> / <strong>artista123</strong> (artista) o <strong>ana@artlink.demo</strong> / <strong>admin123</strong> (administrador).</p>
      </div>
    </div>
  )
}

const legalText = {
  '/terminos': [
    {
      h: '1. Naturaleza del servicio',
      p: 'ArtLink es un prototipo académico que simula una plataforma para encargar arte digital. No procesa pagos reales, no gestiona contratos vinculantes y no actúa como intermediario de transacciones.',
    },
    {
      h: '2. Solicitudes y encargos',
      p: 'Enviar una solicitud no genera un compromiso de compra. El precio final, alcance, fechas y derechos de uso se confirman directamente con el artista. El estado de cada encargo es orientativo.',
    },
    {
      h: '3. Contenido de artistas',
      p: 'Los portafolios, tarifas y textos son responsabilidad de cada artista. La disponibilidad mostrada es declarada por el artista y puede cambiar.',
    },
    {
      h: '4. Disponibilidad del servicio',
      p: 'El servicio se ofrece “tal cual”, para fines educativos. Los datos pueden reiniciarse y las funcionalidades evolucionan sin previo aviso.',
    },
  ],
  '/privacidad': [
    {
      h: '1. Datos que tratamos',
      p: 'Los datos de los usuarios viven en una base local (JSON Server) para demostrar las funcionalidades. No se envían datos a servicios externos salvo fotografías de prueba y citas de inspiración.',
    },
    {
      h: '2. Almacenamiento local',
      p: 'Tu sesión, preferencias visuales y artistas favoritos se guardan en el almacenamiento local de tu navegador. Puedes borrarlos cerrando sesión o limpiando los datos del sitio.',
    },
    {
      h: '3. Uso con fines académicos',
      p: 'Este prototipo no comercializa datos, no usa cookies de seguimiento y no comparte información con terceros.',
    },
    {
      h: '4. Contacto',
      p: 'Para consultas sobre tus datos puedes escribir a soporte@artlink.demo.',
    },
  ],
}

export default function LegalPage() {
  const { pathname } = useLocation()
  const config = sections[pathname] || sections['/ayuda']
  const content = legalText[pathname] || []

  return (
    <section className="legal-page" aria-labelledby="legal-title">
      <Link className="back-link" to="/"><ArrowLeft size={16} aria-hidden="true" /> Volver al inicio</Link>
      <p className="eyebrow">{config.eyebrow}</p>
      <h1 id="legal-title">{config.title}</h1>
      <p className="private-intro">{config.intro}</p>
      {pathname === '/ayuda' && <HelpHub />}
      {pathname === '/contacto' && <ContactForm />}
      {content.map(({ h, p }) => (
        <article className="legal-block" key={h}>
          <h2>{h}</h2>
          <p>{p}</p>
        </article>
      ))}
    </section>
  )
}