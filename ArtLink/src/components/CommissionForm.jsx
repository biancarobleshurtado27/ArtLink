import { useEffect, useState } from 'react'
import { DollarSign, Plus, Check, X, AlertCircle } from 'lucide-react'
import Button from './Button'
import { ART_CATEGORIES } from '../utils/artCategories'

const empty = {
  title: '',
  description: '',
  category: '',
  price: '',
  deliveryDays: '',
  revisions: 1,
  status: 'active',
  terms: '',
}

const QUICK_CATEGORY_SUGGESTIONS = [
  'Ilustración Digital',
  'Concept Art',
  'Diseño de Personajes',
  'Pixel Art',
  'Modelado 3D',
  'Chibi / Anime',
]

export default function CommissionForm({ commission, onSubmit, onCancel, busy = false }) {
  const [form, setForm] = useState(commission || empty)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(commission || empty)
  }, [commission])

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        deliveryDays: Number(form.deliveryDays),
        revisions: Number(form.revisions),
      })
      if (!commission) setForm(empty)
    } catch (submitError) {
      setError(submitError.message || 'Error al guardar la tarifa de comisión.')
    }
  }

  return (
    <form className="art-dash-form-card" onSubmit={submit}>
      <div className="art-dash-form-header">
        <span className="art-dash-form-badge">
          <DollarSign size={13} aria-hidden="true" />
          {commission ? 'Modo Edición de Tarifa' : 'Tarifas y Formatos'}
        </span>
        <h3 className="art-dash-form-title">
          {commission ? 'Editar tarifa de comisión' : 'Configurar nuevo formato de encargo'}
        </h3>
        <p className="art-dash-form-desc">
          Establece precios claros, plazos de entrega y revisiones para que tus clientes puedan solicitarte encargos con total transparencia.
        </p>
      </div>

      <div className="art-dash-form-grid">
        {/* Fila 1: Título y Categoría con Autocomplete */}
        <div className="art-dash-form-two-col">
          <label className="art-dash-field-label" htmlFor="commission-title">
            <span>
              Nombre del formato / paquete <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="commission-title"
              className="art-dash-input-ctrl"
              required
              placeholder="Ej. Retrato de Busto a Color / Ilustración Full Body"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
            />
          </label>

          <label className="art-dash-field-label" htmlFor="commission-category">
            <span>
              Categoría / Especialidad <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="commission-category"
              className="art-dash-input-ctrl"
              list="commission-category-list"
              required
              placeholder="Escribe o selecciona una categoría..."
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              autoComplete="off"
            />
            <datalist id="commission-category-list">
              {ART_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>

            {/* Sugerencias Rápidas de Categoría */}
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

        {/* Fila 2: Descripción */}
        <label className="art-dash-field-label" htmlFor="commission-description">
          <span>
            ¿Qué incluye este formato? <strong style={{ color: '#EF4444' }}>*</strong>
          </span>
          <textarea
            id="commission-description"
            className="art-dash-textarea-ctrl"
            required
            minLength={10}
            rows={2}
            placeholder="Especifica resolución, archivo entregable (PNG, PSD con capas), fondo simple o complejo..."
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </label>

        {/* Fila 3: Precio, Días y Revisiones */}
        <div className="art-dash-form-three-col">
          <label className="art-dash-field-label" htmlFor="commission-price">
            <span>
              Precio Base (USD $) <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="commission-price"
              className="art-dash-input-ctrl"
              type="number"
              min="1"
              required
              placeholder="Ej. 65"
              value={form.price}
              onChange={(event) => update('price', event.target.value)}
            />
          </label>

          <label className="art-dash-field-label" htmlFor="commission-days">
            <span>
              Plazo de entrega (Días) <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="commission-days"
              className="art-dash-input-ctrl"
              type="number"
              min="1"
              required
              placeholder="Ej. 7"
              value={form.deliveryDays}
              onChange={(event) => update('deliveryDays', event.target.value)}
            />
          </label>

          <label className="art-dash-field-label" htmlFor="commission-revisions">
            <span>
              Revisiones incluidas <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <input
              id="commission-revisions"
              className="art-dash-input-ctrl"
              type="number"
              min="0"
              required
              placeholder="Ej. 2"
              value={form.revisions}
              onChange={(event) => update('revisions', event.target.value)}
            />
          </label>
        </div>

        {/* Fila 4: Estado y Términos */}
        <div className="art-dash-form-two-col">
          <label className="art-dash-field-label" htmlFor="commission-status">
            <span>
              Disponibilidad de la tarifa <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <select
              id="commission-status"
              className="art-dash-select-ctrl"
              value={form.status}
              onChange={(event) => update('status', event.target.value)}
            >
              <option value="active">Activa (Disponible para clientes)</option>
              <option value="paused">Pausada (Temporalmente no disponible)</option>
            </select>
          </label>

          <label className="art-dash-field-label" htmlFor="commission-terms">
            <span>
              Términos de uso y derechos <strong style={{ color: '#EF4444' }}>*</strong>
            </span>
            <textarea
              id="commission-terms"
              className="art-dash-textarea-ctrl"
              required
              minLength={10}
              rows={2}
              placeholder="Ej. Uso personal exclusivamente. Para derechos comerciales contactar previamente..."
              value={form.terms}
              onChange={(event) => update('terms', event.target.value)}
            />
          </label>
        </div>
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
        {commission && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X size={15} aria-hidden="true" /> Cancelar
          </Button>
        )}
        <Button type="submit" loading={busy}>
          {commission ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          <span>{commission ? 'Guardar cambios' : 'Agregar tarifa'}</span>
        </Button>
      </div>
    </form>
  )
}
