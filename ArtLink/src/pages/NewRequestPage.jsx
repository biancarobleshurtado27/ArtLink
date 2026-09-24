import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, FileText, Paperclip } from 'lucide-react'
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
  const [submitError, setSubmitError] = useState('')
  const [createdRequest, setCreatedRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const activeCommissions = useMemo(() => commissions.filter((commission) => commission.status === 'active'), [commissions])
  const selectedCommission = activeCommissions.find((commission) => commission.id === form.commissionId) || activeCommissions[0]
  const isWaitlist = profile?.availability === 'waitlist'
  const isClosed = profile?.availability === 'closed'

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedCommission || isClosed || !form.termsAccepted) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const request = await createRequest({
        clientId: user.id,
        artistId: profile.id,
        commissionId: selectedCommission.id,
        description: form.description.trim(),
        budget: Number(form.budget),
        desiredDate: form.desiredDate,
        references: form.references.split('\n').map((reference) => reference.trim()).filter(Boolean),
        status: isWaitlist ? 'waitlist' : 'pending',
        termsAccepted: true,
      })
      setCreatedRequest(request)
    } catch (requestError) {
      setSubmitError(requestError.message || 'No pudimos crear la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Cargando detalles de la solicitud" />
  if (error || !profile) return <ErrorState message={error?.message || 'No encontramos este artista.'} />
  if (isClosed) return <section className="request-page"><ErrorState message="Este artista tiene la agenda cerrada y no acepta nuevas solicitudes por ahora." /></section>
  if (createdRequest) return <section className="confirmation-panel" aria-labelledby="request-success-title"><CheckCircle2 size={48} aria-hidden="true" /><p className="eyebrow">Solicitud enviada</p><h1 id="request-success-title">Tu idea ya está en camino.</h1><p>El artista podrá revisar los detalles de tu solicitud. No hay pagos ni compromisos vinculantes en este prototipo académico.</p><Link className="button button-primary" to="/solicitudes">Ver mis solicitudes</Link></section>

  return <section className="request-page" aria-labelledby="request-title"><Link className="back-link" to={`/artista/${profile.id}`}><ArrowLeft size={16} aria-hidden="true" /> Volver al perfil</Link><div className="request-layout"><div><p className="eyebrow">Nueva solicitud {isWaitlist && '/ lista de espera'}</p><h1 id="request-title">Cuéntale tu idea a {profile.displayName}</h1><p className="request-intro">Completa lo esencial para que pueda entender el encargo y decirte si encaja.</p><form className="request-form" onSubmit={handleSubmit}>
        <label htmlFor="commission-type">Tipo de comisión<select id="commission-type" value={form.commissionId || selectedCommission?.id || ''} onChange={(event) => updateField('commissionId', event.target.value)} aria-describedby="commission-help" required><option value="" disabled>Selecciona un servicio</option>{activeCommissions.map((commission) => <option value={commission.id} key={commission.id}>{commission.title} · ${commission.price} USD</option>)}</select><span id="commission-help" className="field-help">Elige el servicio que mejor se adapta a tu idea.</span></label>
        <label htmlFor="request-description">Descripción del encargo<textarea id="request-description" value={form.description} onChange={(event) => updateField('description', event.target.value)} aria-describedby="description-help" placeholder="¿Qué te gustaría crear? Incluye contexto, formato y detalles importantes." minLength="20" required /><span id="description-help" className="field-help">Escribe al menos 20 caracteres.</span></label>
        <div className="form-two-columns"><label htmlFor="request-budget">Presupuesto (USD)<input id="request-budget" type="number" min={selectedCommission?.price || 1} step="1" value={form.budget} onChange={(event) => updateField('budget', event.target.value)} aria-describedby="budget-help" required /><span id="budget-help" className="field-help">Precio base sugerido: ${selectedCommission?.price || 0} USD.</span></label><label htmlFor="request-date">Fecha deseada<input id="request-date" type="date" min={new Date().toISOString().split('T')[0]} value={form.desiredDate} onChange={(event) => updateField('desiredDate', event.target.value)} aria-describedby="date-help" required /><span id="date-help" className="field-help">Una fecha orientativa, no una garantía de entrega.</span></label></div>
        <label htmlFor="request-references">Referencias<textarea id="request-references" value={form.references} onChange={(event) => updateField('references', event.target.value)} aria-describedby="references-help" placeholder="Pega una URL por línea (opcional)" /><span id="references-help" className="field-help"><Paperclip size={13} aria-hidden="true" /> Puedes añadir enlaces a imágenes o referencias.</span></label>
        <label className="terms-check" htmlFor="request-terms"><input id="request-terms" type="checkbox" checked={form.termsAccepted} onChange={(event) => updateField('termsAccepted', event.target.checked)} aria-describedby="terms-help" required /><span id="terms-help">Acepto los términos de esta comisión y entiendo que el precio final se confirma con el artista.</span></label>
        <p className="scope-note"><FileText size={16} aria-hidden="true" /> Este prototipo no procesa checkout, pagos, escrow ni datos bancarios.</p>
        {submitError && <p className="form-message form-error" role="alert">{submitError}</p>}
        <Button type="submit" loading={submitting} disabled={!selectedCommission || isClosed}>{isWaitlist ? 'Solicitar entrar a lista de espera' : 'Enviar solicitud'}</Button>
      </form></div><aside className="request-summary" aria-label="Resumen de la solicitud"><div className="summary-tape" /><h2>Tu resumen</h2><div className="summary-artist"><Avatar src={profile.avatar} name={profile.displayName} size="medium" /><div><strong>{profile.displayName}</strong><AvailabilityBadge status={profile.availability} /></div></div><div className="summary-service"><span>Servicio</span><strong>{selectedCommission?.title || 'Selecciona un servicio'}</strong><span>Precio base</span><strong>${selectedCommission?.price || 0} USD</strong><span>Entrega estimada</span><strong>{selectedCommission?.deliveryDays || '-'} días</strong></div></aside></div></section>
}
