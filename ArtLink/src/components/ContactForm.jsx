import { useState } from 'react'
import { CheckCircle2, Mail, Send } from 'lucide-react'
import Button from './Button'

const STORAGE_KEY = 'artlink_contact_messages'

const topics = [
  { value: 'account', label: 'Problema con mi cuenta' },
  { value: 'request', label: 'Problema con una solicitud' },
  { value: 'artist', label: 'Soy artista y necesito ayuda' },
  { value: 'other', label: 'Otro tema' },
]

function readMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const initialForm = { name: '', email: '', topic: 'account', message: '' }

export default function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Completa tu nombre, tu correo y el mensaje para poder ayudarte.')
      return
    }
    try {
      const messages = readMessages()
      messages.push({ ...form, createdAt: new Date().toISOString() })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      setSent(true)
      setForm(initialForm)
    } catch {
      setError('No pudimos guardar tu mensaje en este navegador. Inténtalo de nuevo.')
    }
  }

  if (sent) {
    return (
      <div className="contact-success" role="status">
        <CheckCircle2 size={42} aria-hidden="true" />
        <h2>Mensaje enviado</h2>
        <p>Gracias por escribirnos. En este prototipo el mensaje queda guardado localmente en tu navegador y el equipo de desarrollo lo revisa en la misma sesión.</p>
        <Button type="button" variant="outline" onClick={() => setSent(false)}>Enviar otro mensaje</Button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} aria-labelledby="contact-form-title">
      <h2 id="contact-form-title">Escribir al equipo</h2>
      <p className="contact-form-intro">Cuéntanos qué pasó y con qué cuenta de prueba. Guardamos tu mensaje localmente.</p>
      <label htmlFor="contact-name">Nombre
        <input id="contact-name" type="text" autoComplete="name" required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
      </label>
      <label htmlFor="contact-email">Correo electrónico
        <input id="contact-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => updateField('email', event.target.value)} />
      </label>
      <label htmlFor="contact-topic">Motivo
        <select id="contact-topic" value={form.topic} onChange={(event) => updateField('topic', event.target.value)}>
          {topics.map((topic) => <option value={topic.value} key={topic.value}>{topic.label}</option>)}
        </select>
      </label>
      <label htmlFor="contact-message">Mensaje
        <textarea id="contact-message" rows="5" minLength="10" required value={form.message} onChange={(event) => updateField('message', event.target.value)} placeholder="Describe tu situación con detalle." />
      </label>
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      <div className="contact-form-actions">
        <Button type="submit"><Send size={16} aria-hidden="true" /> Enviar mensaje</Button>
        <p><Mail size={14} aria-hidden="true" /> Alternativa: soporte@artlink.demo</p>
      </div>
    </form>
  )
}