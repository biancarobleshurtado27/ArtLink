import { useState } from 'react'
import Button from './Button'

const empty = { title: '', image: '', category: '', description: '', featured: false }

export default function PortfolioForm({ item, onSubmit, onCancel, busy = false }) {
  const [form, setForm] = useState(item || empty)
  const [error, setError] = useState('')
  function update(name, value) { setForm((current) => ({ ...current, [name]: value })) }
  async function submit(event) { event.preventDefault(); setError(''); try { await onSubmit(form); if (!item) setForm(empty) } catch (submitError) { setError(submitError.message) } }
  return <form className="workspace-form" onSubmit={submit}><div className="form-two-columns"><label htmlFor="portfolio-title">Título<input id="portfolio-title" required value={form.title} onChange={(event) => update('title', event.target.value)} /></label><label htmlFor="portfolio-category">Categoría<input id="portfolio-category" required value={form.category} onChange={(event) => update('category', event.target.value)} /></label></div><label htmlFor="portfolio-image">Imagen URL<input id="portfolio-image" type="url" required value={form.image} onChange={(event) => update('image', event.target.value)} /></label><label htmlFor="portfolio-description">Descripción<textarea id="portfolio-description" required minLength="10" value={form.description} onChange={(event) => update('description', event.target.value)} /></label><label className="terms-check" htmlFor="portfolio-featured"><input id="portfolio-featured" type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} /> Destacar esta pieza en el portafolio</label>{error && <p className="form-message form-error" role="alert">{error}</p>}<div className="form-actions"><Button type="submit" loading={busy}>{item ? 'Guardar cambios' : 'Agregar pieza'}</Button>{item && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}</div></form>
}
