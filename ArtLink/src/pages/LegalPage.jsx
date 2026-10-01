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
  '/comunidad': {
    eyebrow: 'Legal / Comunidad',
    title: 'Políticas de comunidad',
    intro: 'Pautas de respeto, convivencia y buenas prácticas para creadores y clientes en ArtLink.',
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
        <h2>Cuentas de acceso</h2>
        <p>Inicia sesión con <strong>cliente@artlink.com</strong> / <strong>123</strong> (cliente), <strong>pixelfoundry@artlink.local</strong> / <strong>123</strong> (artista) o <strong>admin@artlink.com</strong> / <strong>admin</strong> (administrador).</p>
      </div>
    </div>
  )
}

const legalText = {
  '/terminos': [
    {
      h: '1. Naturaleza del servicio',
      p: 'ArtLink es una plataforma para encargar y comisionar arte digital entre clientes y creadores independientes con custodia segura de fondos.',
    },
    {
      h: '2. Solicitudes y encargos',
      p: 'Enviar una solicitud permite iniciar la cotización formal. El precio final, alcance, fechas y derechos de uso se confirman directamente con el artista.',
    },
    {
      h: '3. Contenido de artistas',
      p: 'Los portafolios, tarifas y textos son responsabilidad de cada artista. La disponibilidad mostrada es declarada por el artista.',
    },
    {
      h: '4. Disponibilidad del servicio',
      p: 'El servicio se ofrece para gestionar solicitudes artísticas de forma transparente y protegida.',
    },
  ],
  '/privacidad': [
    {
      h: '1. Datos que tratamos',
      p: 'Los datos de los usuarios viven en la base de datos de la plataforma para procesar las solicitudes y perfiles. No se envían datos a servicios externos no autorizados.',
    },
    {
      h: '2. Almacenamiento local',
      p: 'Tu sesión, preferencias visuales y artistas favoritos se guardan en el almacenamiento local de tu navegador. Puedes borrarlos cerrando sesión o limpiando los datos del sitio.',
    },
    {
      h: '3. Protección de información',
      p: 'Esta plataforma no comercializa datos ni comparte información con terceros no autorizados.',
    },
    {
      h: '4. Contacto',
      p: 'Para consultas sobre tus datos puedes escribir a soporte@artlink.com.',
    },
  ],
  '/comunidad': [
    {
      h: '1. Respeto mutuo y trato profesional',
      p: 'Toda interacción en ArtLink debe regirse por el respeto. No se toleran discursos de odio, acoso, amenazas ni tratos despectivos entre clientes y artistas.',
    },
    {
      h: '2. Originalidad y autoría del arte',
      p: 'Los artistas deben ofrecer obras originales y declarar expresamente si utilizan herramientas de apoyo. Está estrictamente prohibido comercializar arte ajeno sin autorización.',
    },
    {
      h: '3. Compromiso en encargos y pagos',
      p: 'Los clientes se comprometen a definir alcances claros y cumplir las fases de revisión acordadas. Todo encargo debe respetar los tiempos de creación pactados.',
    },
    {
      h: '4. Reportes y mediación',
      p: 'Cualquier conducta contraria a estas políticas puede ser reportada al equipo de administración para su revisión y eventual suspensión de la cuenta.',
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