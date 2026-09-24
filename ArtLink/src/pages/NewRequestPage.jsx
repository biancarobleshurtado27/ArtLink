import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, FileText, Paperclip, MessageCircle, AlertCircle } from 'lucide-react'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import AvailabilityBadge from '../components/AvailabilityBadge'
import Button from '../components/Button'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import useArtistProfile from '../hooks/useArtistProfile'
import useAuth from '../hooks/useAuth'
import { createRequest } from '../services/requestService'

const initialForm = { commissionId: '', description: '', budget: '', desiredDate: '', references: '', termsAccepted: false }

export default function NewRequestPage() {
  const { artistId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { profile, commissions, loading, error } = useArtistProfile(artistId)
  const [form, setForm] = useState({ ...initialForm, commissionId: searchParams.get('commissionId') || '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [createdRequest, setCreatedRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const activeCommissions = useMemo(() => commissions.filter((commission) => commission.status === 'active'), [commissions])
  
  // Select requested commission or fallback to first active commission
  const selectedCommission = useMemo(() => {
    if (!form.commissionId && activeCommissions.length > 0) return activeCommissions[0]
    return activeCommissions.find((c) => c.id === form.commissionId) || activeCommissions[0]
  }, [activeCommissions, form.commissionId])

  const isWaitlist = profile?.availability === 'waitlist'
  const isClosed = profile?.availability === 'closed'

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value }
      // Auto-set budget if switching commission and budget was empty or lower than min
      if (name === 'commissionId') {
        const comm = activeCommissions.find((c) => c.id === value)
        if (comm && (!current.budget || Number(current.budget) < comm.price)) {
          next.budget = String(comm.price)
        }
      }
      return next
    })
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  function validate() {
    const errors = {}
    const comm = selectedCommission || activeCommissions[0]
    
    if (!form.commissionId && !comm) {
      errors.commissionId = 'Debes seleccionar un tipo de comisión.'
    }
    if (!form.description || form.description.trim().length < 20) {
      errors.description = 'La descripción debe tener al menos 20 caracteres explicando tu idea.'
    }
    const numBudget = Number(form.budget)
    if (!form.budget || isNaN(numBudget) || numBudget <= 0) {
      errors.budget = 'Ingresa un presupuesto válido mayor a 0 USD.'
    } else if (comm && numBudget < comm.price) {
      errors.budget = `El presupuesto sugerido mínimo para este servicio es $${comm.price} USD.`
    }
    if (!form.desiredDate) {
      errors.desiredDate = 'Selecciona una fecha orientativa de entrega.'
    } else {
      const today = new Date().toISOString().split('T')[0]
      if (form.desiredDate < today) {
        errors.desiredDate = 'La fecha deseada no puede ser anterior al día de hoy.'
      }
    }
    if (!form.termsAccepted) {
      errors.termsAccepted = 'Debes aceptar los términos orientativos de la comisión.'
    }
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isClosed) return
    setSubmitError('')
    
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      const targetComm = selectedCommission || activeCommissions[0]
      const requestPayload = {
        clientId: user.id,
        artistId: profile.id,
        commissionId: targetComm ? targetComm.id : '',
        description: form.description.trim(),
        budget: Number(form.budget || targetComm?.price || 50),
        desiredDate: form.desiredDate,
        references: form.references.split('\n').map((ref) => ref.trim()).filter(Boolean),
        status: isWaitlist ? 'waitlist' : 'pending',
        termsAccepted: true,
      }
      const request = await createRequest(requestPayload)
      setCreatedRequest(request)
    } catch (requestError) {
      setSubmitError(requestError.message || 'Ocurrió un error al enviar la solicitud. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Cargando detalles de la solicitud..." />
  if (error || !profile) return <ErrorState message={error?.message || 'No encontramos el perfil de este artista.'} />
  
  if (isClosed) {
    return (
      <section className="request-page">
        <Link className="back-link" to={`/artista/${profile.id}`}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver al perfil
        </Link>
        <ErrorState message={`@${profile.displayName} tiene la agenda cerrada en este momento y no acepta nuevas solicitudes.`} />
      </section>
    )
  }

  if (createdRequest) {
    const currentComm = activeCommissions.find((c) => c.id === createdRequest.commissionId) || selectedCommission
    return (
      <section className="confirmation-panel" aria-labelledby="request-success-title">
        <div className="confirmation-card">
          <CheckCircle2 size={56} className="success-icon" aria-hidden="true" />
          <p className="eyebrow">¡Solicitud enviada con éxito!</p>
          <h1 id="request-success-title">Tu proyecto para {profile.displayName} está registrado.</h1>
          <p className="confirmation-intro">
            El artista recibirá una notificación y podrá aceptar la propuesta o escribirte por el chat.
            Recordatorio: Este es un entorno de demostración sin cobros ni compromisos financieros reales.
          </p>
          
          <div className="summary-ticket">
            <div className="ticket-header">
              <Avatar src={profile.avatar} name={profile.displayName} size="medium" />
              <div>
                <strong>{profile.displayName}</strong>
                <span className="ticket-service">{currentComm?.title || 'Comisión personalizada'}</span>
              </div>
            </div>
            <hr />
            <div className="ticket-details">
              <div><span>Presupuesto propuesto:</span><strong>${createdRequest.budget} USD</strong></div>
              <div><span>Fecha solicitada:</span><strong>{createdRequest.desiredDate}</strong></div>
              <div><span>Estado inicial:</span><span className="badge badge-violet">{createdRequest.status === 'waitlist' ? 'Lista de espera' : 'Pendiente'}</span></div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link className="button button-primary" to="/solicitudes">
              Ver mis solicitudes
            </Link>
            <Link className="button button-secondary" to={`/mensajes?requestId=${createdRequest.id}`}>
              <MessageCircle size={16} aria-hidden="true" /> Ir a la conversación
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const effectiveComm = selectedCommission || activeCommissions[0]

  return (
    <section className="request-page" aria-labelledby="request-title">
      <Link className="back-link" to={`/artista/${profile.id}`}>
        <ArrowLeft size={16} aria-hidden="true" /> Volver al perfil de {profile.displayName}
      </Link>
      
      <div className="request-layout">
        <div>
          <p className="eyebrow">Nueva solicitud {isWaitlist && '• Entrar a lista de espera'}</p>
          <h1 id="request-title">Cuéntale tu propuesta a {profile.displayName}</h1>
          <p className="request-intro">
            Proporciona los detalles esenciales para que el artista pueda evaluar la factibilidad, agenda y presupuesto de tu encargo.
          </p>

          <form className="request-form" onSubmit={handleSubmit} noValidate>
            {/* Servicio / Comisión */}
            <label htmlFor="commission-type">
              Tipo de comisión
              <select
                id="commission-type"
                value={form.commissionId || effectiveComm?.id || ''}
                onChange={(e) => updateField('commissionId', e.target.value)}
                aria-describedby="commission-help"
                required
              >
                <option value="" disabled>Selecciona una opción</option>
                {activeCommissions.map((commission) => (
                  <option value={commission.id} key={commission.id}>
                    {commission.title} — ${commission.price} USD ({commission.deliveryDays} días est.)
                  </option>
                ))}
              </select>
              <span id="commission-help" className="field-help">Selecciona el tipo de trabajo visual que necesitas.</span>
              {fieldErrors.commissionId && <span className="field-error"><AlertCircle size={13} /> {fieldErrors.commissionId}</span>}
            </label>

            {/* Descripción */}
            <label htmlFor="request-description">
              Descripción del encargo
              <textarea
                id="request-description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                aria-describedby="description-help"
                placeholder="Describe los personajes, composición, colores, uso final y cualquier especificación técnica..."
                rows={5}
                required
              />
              <div className="field-meta">
                <span id="description-help" className="field-help">Mínimo 20 caracteres.</span>
                <span className={`char-count ${form.description.length < 20 ? 'insufficient' : 'good'}`}>
                  {form.description.length}/20 min
                </span>
              </div>
              {fieldErrors.description && <span className="field-error"><AlertCircle size={13} /> {fieldErrors.description}</span>}
            </label>

            {/* Presupuesto y Fecha */}
            <div className="form-two-columns">
              <label htmlFor="request-budget">
                Presupuesto propuesto (USD)
                <input
                  id="request-budget"
                  type="number"
                  min="1"
                  step="1"
                  value={form.budget || (effectiveComm ? effectiveComm.price : '')}
                  onChange={(e) => updateField('budget', e.target.value)}
                  aria-describedby="budget-help"
                  required
                />
                <span id="budget-help" className="field-help">
                  Precio base orientativo: ${effectiveComm?.price || 0} USD.
                </span>
                {fieldErrors.budget && <span className="field-error"><AlertCircle size={13} /> {fieldErrors.budget}</span>}
              </label>

              <label htmlFor="request-date">
                Fecha deseada de entrega
                <input
                  id="request-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.desiredDate}
                  onChange={(e) => updateField('desiredDate', e.target.value)}
                  aria-describedby="date-help"
                  required
                />
                <span id="date-help" className="field-help">Fecha aproximada deseada.</span>
                {fieldErrors.desiredDate && <span className="field-error"><AlertCircle size={13} /> {fieldErrors.desiredDate}</span>}
              </label>
            </div>

            {/* Referencias */}
            <label htmlFor="request-references">
              Referencias e inspiración (opcional)
              <textarea
                id="request-references"
                value={form.references}
                onChange={(e) => updateField('references', e.target.value)}
                aria-describedby="references-help"
                placeholder="Pega enlaces a imágenes de referencia, Pinterest, Moodboards o notas adicionales (una por línea)..."
                rows={3}
              />
              <span id="references-help" className="field-help">
                <Paperclip size={13} aria-hidden="true" /> URLs o descripciones de estilo visual.
              </span>
            </label>

            {/* Términos */}
            <div className="terms-container">
              <label className="terms-check" htmlFor="request-terms">
                <input
                  id="request-terms"
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) => updateField('termsAccepted', e.target.checked)}
                  aria-describedby="terms-help"
                  required
                />
                <span id="terms-help">
                  Entiendo que esta solicitud es un borrador inicial y que los detalles finales de precio y tiempos se acuerdan directamente con el artista.
                </span>
              </label>
              {fieldErrors.termsAccepted && <span className="field-error"><AlertCircle size={13} /> {fieldErrors.termsAccepted}</span>}
            </div>

            <p className="scope-note">
              <FileText size={15} aria-hidden="true" /> Protótipo académico ArtLink: no se realizan cargos a tarjetas ni pagos reales.
            </p>

            {submitError && <p className="form-message form-error" role="alert">{submitError}</p>}

            <Button type="submit" loading={submitting} disabled={isClosed || !effectiveComm}>
              {isWaitlist ? 'Solicitar puesto en lista de espera' : 'Enviar propuesta de comisión'}
            </Button>
          </form>
        </div>

        {/* Resumen lateral */}
        <aside className="request-summary" aria-label="Resumen de la solicitud">
          <div className="summary-tape" />
          <h2>Resumen del encargo</h2>
          
          <div className="summary-artist">
            <Avatar src={profile.avatar} name={profile.displayName} size="medium" />
            <div>
              <strong>{profile.displayName}</strong>
              <AvailabilityBadge status={profile.availability} />
            </div>
          </div>

          <div className="summary-service">
            <div className="summary-row">
              <span>Servicio seleccionado:</span>
              <strong>{effectiveComm?.title || 'Personalizado'}</strong>
            </div>
            <div className="summary-row">
              <span>Precio base sugerido:</span>
              <strong>${effectiveComm?.price || 0} USD</strong>
            </div>
            <div className="summary-row">
              <span>Tiempo de entrega estimado:</span>
              <strong>{effectiveComm?.deliveryDays || '-'} días</strong>
            </div>
            <div className="summary-row highlight">
              <span>Presupuesto ingresado:</span>
              <strong>${form.budget || effectiveComm?.price || 0} USD</strong>
            </div>
          </div>

          {effectiveComm?.description && (
            <div className="summary-notes">
              <small><strong>Incluye:</strong> {effectiveComm.description}</small>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

