import { useEffect, useState } from 'react'
import { Sparkles, Star, Plus, Check, X, AlertCircle } from 'lucide-react'
import Button from './Button'
import { ART_CATEGORIES } from '../utils/artCategories'
import { handleImageError } from '../utils/imageFallback'

const empty = { title: '', image: '', category: '', description: '', featured: false }

const QUICK_CATEGORY_SUGGESTIONS = [
  'Ilustración Digital',
  'Concept Art',
  'Diseño de Personajes',
  'Pixel Art',
  'Modelado 3D',
  'Chibi / Anime',
]

export default function PortfolioForm({ item, onSubmit, onCancel, busy = false }) {
  const [form, setForm] = useState(item || empty)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(item || empty)
  }, [item])

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await onSubmit(form)
      if (!item) setForm(empty)
    } catch (submitError) {
      setError(submitError.message || 'Error al guardar la pieza del portafolio.')
    }
  }

  return (
    <form className="art-dash-form-card" onSubmit={submit}>
      <div className="art-dash-form-header">
        <span className="art-dash-form-badge">
          <Sparkles size={13} aria-hidden="true" />
          {item ? 'Modo Edición' : 'Galería Pública'}
        </span>
        <h3 className="art-dash-form-title">
          {item ? 'Editar pieza del portafolio' : 'Publicar nueva obra en tu portafolio'}
        </h3>
        <p className="art-dash-form-desc">
          Muestra tus mejores creaciones, técnicas y estilos para que los clientes se enamoren de tu trabajo.
        </p>
      </div>

      <div className="art-dash-form-grid">
        {/* Fila 1: Título y Categoría con Autocomplete */}
        <div className="art-dash-form-two-col">
          <label className="art-dash-field-label" htmlFor="portfolio-title">
            <span>
              Título de la obra <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="portfolio-title"
              className="art-dash-input-ctrl"
              required
              placeholder="Ej. El Guardián del Valle Astral"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
            />
          </label>

          <label className="art-dash-field-label" htmlFor="portfolio-category">
            <span>
              Categoría / Disciplina <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="portfolio-category"
              className="art-dash-input-ctrl"
              list="portfolio-category-list"
              required
              placeholder="Escribe o selecciona una categoría..."
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              autoComplete="off"
            />
            <datalist id="portfolio-category-list">
              {ART_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>

            {/* Sugerencias Rápidas con 1 clic */}
            <div className="art-dash-quick-chips">
              <span className="art-dash-chips-hint">Sugerencias:</span>
              {QUICK_CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`art-dash-chip-pill ${form.category === cat ? 'is-active' : ''}`}
                  onClick={() => update('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </label>
        </div>

        {/* Fila 2: Imagen URL con vista previa interactiva */}
        <div>
          <label className="art-dash-field-label" htmlFor="portfolio-image">
            <span>
              URL de la imagen <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="portfolio-image"
              className="art-dash-input-ctrl"
              type="url"
              required
              placeholder="https://images.unsplash.com/... o enlace público de la ilustración"
              value={form.image}
              onChange={(event) => update('image', event.target.value)}
            />
          </label>

          {Boolean(form.image && form.image.trim()) && (
            <div className="art-dash-img-preview-box">
              <img
                src={form.image}
                alt="Vista previa de la obra"
                className="art-dash-img-preview-thumb"
                onError={handleImageError}
              />
              <div className="art-dash-img-preview-info">
                <strong style={{ color: 'var(--ink)' }}>Vista previa de la ilustración</strong>
                <span>Se mostrará con protección de descarga en tu catálogo público.</span>
              </div>
            </div>
          )}
        </div>

        {/* Fila 3: Descripción */}
        <label className="art-dash-field-label" htmlFor="portfolio-description">
          <span>
            Descripción y detalles técnicos <strong style={{ color: '#EF4444' }}>*</strong>
          </span>
          <textarea
            id="portfolio-description"
            className="art-dash-textarea-ctrl"
            required
            minLength={10}
            rows={3}
            placeholder="Describe el concepto, paleta de colores, técnica empleada (300 DPI, capas, tiempo dedicado)..."
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </label>

        {/* Fila 4: Destacar obra (Checkbox card scrapbook) */}
        <label className="art-dash-toggle-card" htmlFor="portfolio-featured">
          <input
            id="portfolio-featured"
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(event) => update('featured', event.target.checked)}
          />
          <div className="art-dash-toggle-text">
            <Star
              size={18}
              fill={form.featured ? '#FDE047' : 'none'}
              color={form.featured ? '#CA8A04' : '#6B7280'}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div>
              <strong>Destacar esta pieza en la portada del portafolio</strong>
              <small>Tendrá un distintivo brillante y prioridad visual en tu perfil de artista.</small>
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#FEE2E2',
            border: '1.5px solid #EF4444',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#991B1B',
            fontSize: '0.86rem',
            fontWeight: 600,
            marginTop: '1.2rem',
          }}
          role="alert"
        >
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="art-dash-form-actions">
        {item && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X size={15} aria-hidden="true" /> Cancelar
          </Button>
        )}
        <Button type="submit" loading={busy}>
          {item ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          <span>{item ? 'Guardar cambios' : 'Agregar pieza'}</span>
        </Button>
      </div>
    </form>
  )
}
