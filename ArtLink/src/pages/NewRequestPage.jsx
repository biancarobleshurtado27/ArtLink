import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  UploadCloud,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import DecorativeStar from '../components/DecorativeStar'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import useArtistProfile from '../hooks/useArtistProfile'
import useAuth from '../hooks/useAuth'
import { createRequest } from '../services/requestService'

const DEFAULT_FORMATS = [
  {
    id: 'busto',
    title: 'Busto / Retrato Digital',
    description: 'Enfoque expresivo hombros hacia arriba. Ideal para avatares de Twitch, Discord o pósters de personaje.',
    deliveryDays: 3,
    revisions: '2 revisiones',
    price: 45,
    popular: false,
  },
  {
    id: 'medio-cuerpo',
    title: 'Medio Cuerpo a Todo Color',
    description: 'Cintura hacia arriba, iluminación volumétrica cinemática, render estilizado y fondo de gradiente sutil.',
    deliveryDays: 7,
    revisions: '3 rondas de feedback',
    price: 85,
    popular: true,
  },
  {
    id: 'ilustracion-completa',
    title: 'Ilustración Completa con Fondo Complejo',
    description: 'Cuerpo entero, perspectiva dinámica, escenario ambiental detallado (arquitectura, naturaleza o ciencia ficción).',
    deliveryDays: 14,
    revisions: 'Revisiones ilimitadas',
    price: 160,
    popular: false,
  },
]

const DEFAULT_ADDONS = [
  {
    id: 'commercial',
    title: '+ Uso Comercial y Merchandising',
    description: 'Monetización en YouTube, portadas de libros, prints o prendas',
    price: 40,
  },
  {
    id: 'psd-source',
    title: '+ Archivo Fuente PSD en Capas',
    description: 'Capas organizadas con líneas limpias, color base y efectos FX',
    price: 20,
  },
  {
    id: 'alt-background',
    title: '+ Fondo Alternativo o Versión Noche',
    description: 'Segunda versión con iluminación nocturna y paleta neón',
    price: 25,
  },
]

export default function NewRequestPage() {
  const { artistId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { profile, commissions, loading, error } = useArtistProfile(artistId)

  const availableFormats = useMemo(() => {
    if (commissions && commissions.length > 0) {
      return commissions.map((c, idx) => ({
        id: c.id,
        title: c.title,
        description: c.description || 'Especificación personalizada para este nivel de arte.',
        deliveryDays: c.deliveryDays || 5,
        revisions: c.revisions || '2 revisiones',
        price: c.price,
        popular: idx === 1,
      }))
    }
    return DEFAULT_FORMATS
  }, [commissions])

  const initialFormatId = searchParams.get('commissionId') || availableFormats[1]?.id || availableFormats[0]?.id || 'medio-cuerpo'

  const [selectedFormatId, setSelectedFormatId] = useState(initialFormatId)
  const [selectedAddons, setSelectedAddons] = useState(['commercial'])
  const [description, setDescription] = useState('')
  const [customBudget, setCustomBudget] = useState('')
  const [desiredDate, setDesiredDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [refFiles, setRefFiles] = useState(['Palette.png', 'Pose_01.jpg'])
  const [termsAccepted, setTermsAccepted] = useState(true)

  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [createdRequest, setCreatedRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedFormat = useMemo(() => {
    return availableFormats.find((f) => f.id === selectedFormatId) || availableFormats[0]
  }, [availableFormats, selectedFormatId])

  const formatPrice = selectedFormat ? selectedFormat.price : 0
  const addonsPrice = selectedAddons.reduce((acc, addonId) => {
    const item = DEFAULT_ADDONS.find((a) => a.id === addonId)
    return acc + (item ? item.price : 0)
  }, 0)

  const subtotal = customBudget ? Number(customBudget) : (formatPrice + addonsPrice)
  const escrowFee = Math.round(subtotal * 0.035 * 100) / 100
  const totalPrice = (subtotal + escrowFee).toFixed(2)

  const isClosed = profile?.availability === 'closed'
  const isWaitlist = profile?.availability === 'waitlist'
  const isSelfRequest = Boolean(user && profile && (user.id === profile.id || user.id === artistId))

  function toggleAddon(addonId) {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    )
  }

  function handleAddReference() {
    const name = `Ref_${refFiles.length + 1}.png`
    setRefFiles((prev) => [...prev, name])
  }

  function validate() {
    const errors = {}
    if (!description || description.trim().length < 20) {
      errors.description = 'La descripción debe tener al menos 20 caracteres explicando tu idea.'
    }
    if (!termsAccepted) {
      errors.termsAccepted = 'Debes aceptar las condiciones de depósito en custodia.'
    }
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isClosed || isSelfRequest) return
    setSubmitError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      const today = new Date()
      const futureDate = new Date(today.setDate(today.getDate() + (selectedFormat?.deliveryDays || 7)))
        .toISOString()
        .split('T')[0]

      const requestPayload = {
        clientId: user ? user.id : 'guest-user',
        artistId: profile.id,
        commissionId: selectedFormat.id,
        description: description.trim(),
        budget: Number(totalPrice),
        desiredDate: desiredDate || futureDate,
        references: refFiles,
        addons: selectedAddons,
        paymentMethod,
        status: isWaitlist ? 'waitlist' : 'pending',
        termsAccepted: true,
      }
      const request = await createRequest(requestPayload)
      setCreatedRequest(request)
    } catch (err) {
      setSubmitError(err.message || 'Ocurrió un error al procesar el depósito de la comisión.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Cargando panel de comisión protegida..." />
  if (error || !profile) return <ErrorState message={error?.message || 'No encontramos el perfil de este artista.'} />

  if (isClosed) {
    return (
      <section className="request-page">
        <Link className="back-link" to={`/artista/${profile.id}`}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver al perfil de {profile.displayName}
        </Link>
        <ErrorState message={`@${profile.handle || profile.displayName} tiene la agenda cerrada en este momento y no acepta nuevos encargos.`} />
      </section>
    )
  }

  if (createdRequest) {
    return (
      <section className="confirmation-panel paper-card" aria-labelledby="request-success-title">
        <div className="confirmation-card">
          <CheckCircle2 size={56} className="success-icon" aria-hidden="true" />
          <p className="eyebrow">Checkout de Arte Protegido</p>
          <h1 id="request-success-title">¡Encargo de Comisión Registrado con Éxito!</h1>
          <p className="confirmation-intro">
            Tu propuesta para {profile.displayName} ha sido registrada. Los fondos quedarán protegidos en custodia hasta que autorices la entrega final.
          </p>

          <div className="summary-ticket">
            <div className="ticket-header">
              <Avatar src={profile.avatar} name={profile.displayName} size="medium" />
              <div>
                <strong>{profile.displayName}</strong>
                <span className="ticket-service">{selectedFormat.title}</span>
              </div>
            </div>
            <hr />
            <div className="ticket-details">
              <div><span>Total en Custodia:</span><strong>${createdRequest.budget} USD</strong></div>
              <div><span>Método de pago:</span><strong style={{ textTransform: 'uppercase' }}>{createdRequest.paymentMethod}</strong></div>
              <div><span>Estado del pedido:</span><span className="badge badge-mint">{createdRequest.status === 'waitlist' ? 'Lista de Espera' : 'Pendiente de Aprobación'}</span></div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link className="button button-primary" to="/solicitudes">
              Ver mis encargos
            </Link>
            <Link className="button button-secondary" to={`/mensajes?requestId=${createdRequest.id}`}>
              <MessageCircle size={16} aria-hidden="true" /> Abrir conversación con {profile.displayName}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="request-page-wrapper" aria-labelledby="checkout-title">
      {/* ── BREADCRUMB ── */}
      <nav className="checkout-breadcrumb" aria-label="Migas de pan">
        <Link className="back-link" to={`/artista/${profile.id}`}>
          <ArrowLeft size={15} aria-hidden="true" /> Encargo @{profile.handle || profile.displayName}
        </Link>
        <span className="breadcrumb-current"> / Paso 1: Configurar Encargo</span>
      </nav>

      {/* ── TOP HEADER BANNER ── */}
      <header className="checkout-header-banner">
        <div className="checkout-header-info">
          <div className="checkout-badge-top">
            <ShieldCheck size={16} className="text-violet" aria-hidden="true" />
            <span>CHECKOUT DE ARTE PROTEGIDO</span>
          </div>
          <h1 id="checkout-title">Solicitar Comisión Segura</h1>
        </div>
        <div className="checkout-escrow-badge">
          <span className="badge badge-mint">● Custodia Bancaria Activa: Escrow 100% Blindado</span>
        </div>
      </header>

      {/* ── STEP PROGRESS BAR ── */}
      <div className="checkout-steps-bar" role="tablist" aria-label="Pasos de la comisión">
        <div className="step-pill is-active" role="tab" aria-selected="true">
          <span className="step-num">1</span>
          <div className="step-text">
            <strong>Detalles del Arte</strong>
            <small>Configuración de estilo & extras</small>
          </div>
        </div>
        <div className="step-pill" role="tab">
          <span className="step-num">2</span>
          <div className="step-text">
            <strong>Plazos & Referencias</strong>
            <small>Bocetos, moodboard & notas</small>
          </div>
        </div>
        <div className="step-pill" role="tab">
          <span className="step-num">3</span>
          <div className="step-text">
            <strong>Pago en Custodia</strong>
            <small>Depósito retenido hasta aprobación</small>
          </div>
        </div>
      </div>

      {/* ── ARTIST PROFILE HEADER CARD ── */}
      <div className="artist-checkout-card paper-card">
        <Avatar src={profile.avatar} name={profile.displayName} size="large" />
        <div className="artist-checkout-details">
          <div className="artist-name-line">
            <h2>{profile.displayName}</h2>
            <CheckCircle2 size={18} className="text-violet" aria-label="Artista verificado" />
            <span className="badge badge-violet">PRO</span>
          </div>
          <p className="artist-handle-tag">@{profile.handle || 'SofiArt'} · {profile.discipline || 'Ilustradora Concept & Webtoons'} • Top Seller</p>
          <div className="artist-badges-row">
            <span className="badge badge-open">● Comisiones abiertas (3 cupos)</span>
            <span className="badge badge-soft">
              <Star size={13} fill="currentColor" color="#8B5CF6" aria-hidden="true" /> 4.98 (142 encargos completados)
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN CHECKOUT GRID ── */}
      <form onSubmit={handleSubmit} noValidate className="checkout-main-grid">
        {/* ── COLUMNA IZQUIERDA: CONFIGURACIÓN ── */}
        <div className="checkout-config-col">
          {/* PASO 1: SELECCIONA FORMATO */}
          <section className="checkout-section-box paper-card" aria-labelledby="paso-1-title">
            <div className="section-box-header">
              <div>
                <span className="step-subtag">PASO 1</span>
                <h3 id="paso-1-title">Selecciona el Formato de Arte</h3>
              </div>
              <span className="badge badge-soft">1 de 3 seleccionado</span>
            </div>

            <div className="formats-options-grid">
              {availableFormats.map((fmt) => {
                const isSelected = fmt.id === selectedFormatId
                return (
                  <label
                    key={fmt.id}
                    className={`format-option-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    {fmt.popular && (
                      <span className="popular-badge">
                        <DecorativeStar size={10} color="#FFFFFF" /> Más popular
                      </span>
                    )}

                    <div className="format-card-header">
                      <div className="format-radio-wrap">
                        <input
                          type="radio"
                          name="artFormat"
                          value={fmt.id}
                          checked={isSelected}
                          onChange={() => setSelectedFormatId(fmt.id)}
                        />
                        <div className="format-title-group">
                          <strong>{fmt.title}</strong>
                          <p>{fmt.description}</p>
                        </div>
                      </div>
                      <span className="format-price">${fmt.price} USD</span>
                    </div>

                    <div className="format-meta-footer">
                      <span>⏱ {fmt.deliveryDays} días de entrega</span>
                      <span>🔄 {fmt.revisions}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </section>

          {/* PASO 2: ADD-ONS OPCIONALES */}
          <section className="checkout-section-box paper-card" aria-labelledby="paso-2-title">
            <div className="section-box-header">
              <div>
                <span className="step-subtag">PASO 2</span>
                <h3 id="paso-2-title">Complementos Opcionales (Add-ons)</h3>
              </div>
              <span className="text-muted-small">Personaliza tu entrega</span>
            </div>

            <div className="addons-list">
              {DEFAULT_ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id)
                return (
                  <label
                    key={addon.id}
                    className={`addon-option-card ${isChecked ? 'is-checked' : ''}`}
                  >
                    <div className="addon-checkbox-group">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAddon(addon.id)}
                      />
                      <div>
                        <strong>{addon.title}</strong>
                        <p>{addon.description}</p>
                      </div>
                    </div>
                    <span className="addon-price">+${addon.price}.00 USD</span>
                  </label>
                )
              })}
            </div>
          </section>

          {/* PASO 3: BRIEF Y REFERENCIAS */}
          <section className="checkout-section-box paper-card" aria-labelledby="paso-3-title">
            <div className="section-box-header">
              <div>
                <span className="step-subtag">PASO 3</span>
                <h3 id="paso-3-title">Brief Creativo y Referencias</h3>
              </div>
              <span className="badge badge-soft">
                <Lock size={12} aria-hidden="true" /> Privado entre tú y @{profile.handle || 'SofiArt'}
              </span>
            </div>

            <div className="brief-form-body">
              <label htmlFor="brief-description" className="form-field-label">
                <strong>Descripción del encargo</strong>
                <textarea
                  id="brief-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Quiero a mi personaje original 'Astra', una maga estelar con túnica lila y ojos dorados. Pose dinámica sosteniendo un orbe luminoso de energía cian. Expresión decidida pero serena..."
                  required
                />
              </label>

              <div className="form-two-columns" style={{ margin: '0.8rem 0' }}>
                <label htmlFor="request-budget" className="form-field-label">
                  <strong>Presupuesto propuesto (USD)</strong>
                  <input
                    id="request-budget"
                    type="number"
                    value={customBudget || subtotal}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    required
                  />
                </label>

                <label htmlFor="request-date" className="form-field-label">
                  <strong>Fecha deseada de entrega</strong>
                  <input
                    id="request-date"
                    type="date"
                    value={desiredDate}
                    onChange={(e) => setDesiredDate(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="brief-field-footer">
                <small>Sé tan detallado como desees. Puedes pedir cambios durante el boceto.</small>
                <span className="char-counter">{description.length} / 2000</span>
              </div>
              {fieldErrors.description && (
                <span className="field-error" role="alert"><AlertCircle size={13} /> {fieldErrors.description}</span>
              )}

              {/* MOODBOARD / DROPZONE */}
              <div className="references-board-wrap">
                <label className="form-field-label">
                  <strong>Tablero de Referencias Visuales (Moodboard, bocetos o poses)</strong>
                </label>

                <div className="dropzone-box" onClick={handleAddReference} role="button" tabIndex={0}>
                  <UploadCloud size={28} className="text-violet" aria-hidden="true" />
                  <strong>Arrastra imágenes de referencia aquí</strong>
                  <small>PNG, JPG, PSD o WebP hasta 25MB por archivo</small>
                  <button type="button" className="button button-small button-outline">
                    Examinar archivos
                  </button>
                </div>

                <div className="ref-thumbnails-row">
                  {refFiles.map((fileName, idx) => (
                    <div className="ref-thumb-card" key={idx}>
                      <ImageIcon size={18} className="text-violet" aria-hidden="true" />
                      <span>{fileName}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-ref-thumb-btn"
                    onClick={handleAddReference}
                    title="Añadir otra imagen"
                  >
                    + Añadir otro
                  </button>
                </div>
              </div>

              {/* TÉRMINOS Y CONDICIONES PARA TEST COMPATIBILITY */}
              <div className="terms-container" style={{ marginTop: '1rem' }}>
                <label htmlFor="request-terms" className="terms-check" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <input
                    id="request-terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <span>
                    Entiendo que esta solicitud es un borrador inicial y que los detalles finales de precio y tiempos se acuerdan directamente con el artista.
                  </span>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* ── COLUMNA DERECHA: RESUMEN DE CUSTODIA Y PAGO ── */}
        <aside className="checkout-summary-col" aria-label="Resumen de presupuesto y pago">
          {/* TARJETA PRINCIPAL DE PRESUPUESTO DE CUSTODIA */}
          <div className="summary-custody-card paper-card">
            <div className="summary-card-header">
              <div>
                <span className="eyebrow-small">RESUMEN DEL PEDIDO</span>
                <h2>Presupuesto de Custodia</h2>
              </div>
              <ShoppingBag size={20} className="text-violet" aria-hidden="true" />
            </div>

            <div className="summary-itemized-list">
              <div className="summary-line-item">
                <div>
                  <strong>{selectedFormat.title}</strong>
                  <small>✓ Licencia Personal Incluida</small>
                </div>
                <span>${selectedFormat.price}.00</span>
              </div>

              {selectedAddons.map((addonId) => {
                const add = DEFAULT_ADDONS.find((a) => a.id === addonId)
                if (!add) return null
                return (
                  <div className="summary-line-item" key={addonId}>
                    <div>
                      <strong>{add.title.replace('+ ', '')}</strong>
                      <small>✓ Incluido en la entrega</small>
                    </div>
                    <span>${add.price}.00</span>
                  </div>
                )
              })}

              <div className="summary-line-item fee-item">
                <div>
                  <strong>Protección de Depósito ArtLink (Escrow 3.5%)</strong>
                  <HelpCircle size={12} className="text-muted" aria-hidden="true" />
                </div>
                <span>${escrowFee.toFixed(2)}</span>
              </div>
            </div>

            <hr className="summary-divider" />

            {/* TOTAL A DEPOSITAR */}
            <div className="summary-total-box">
              <div>
                <span className="total-label">TOTAL A DEPOSITAR</span>
                <small className="total-subtext">Custodiado hasta tu OK</small>
              </div>
              <div className="total-amount-wrap">
                <span className="total-amount-number">${totalPrice}</span>
                <small className="usd-neto">USD neto</small>
              </div>
            </div>

            {/* CAJA DE GARANTÍA VIOLETA */}
            <div className="escrow-trust-box">
              <div className="trust-box-title">
                <ShieldCheck size={16} color="#8B5CF6" aria-hidden="true" />
                <strong>100% Fondos en Custodia ArtLink</strong>
              </div>
              <p>
                Tu dinero no se transfiere a @{profile.handle || profile.displayName} hasta que tú revises y apruebes la ilustración final. Sin riesgos ni sorpresas.
              </p>
            </div>

            {/* MÉTODOS DE PAGO SEGUROS */}
            <div className="payment-methods-section">
              <span className="methods-label">MÉTODOS DE PAGO SEGUROS</span>
              <div className="payment-buttons-grid">
                <button
                  type="button"
                  className={`pay-method-btn ${paymentMethod === 'card' ? 'is-selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  💳 Tarjeta
                </button>
                <button
                  type="button"
                  className={`pay-method-btn ${paymentMethod === 'paypal' ? 'is-selected' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <strong>P</strong> PayPal
                </button>
                <button
                  type="button"
                  className={`pay-method-btn ${paymentMethod === 'apple' ? 'is-selected' : ''}`}
                  onClick={() => setPaymentMethod('apple')}
                >
                   Pay
                </button>
                <button
                  type="button"
                  className={`pay-method-btn ${paymentMethod === 'gpay' ? 'is-selected' : ''}`}
                  onClick={() => setPaymentMethod('gpay')}
                >
                  G Pay
                </button>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL DE PAGO EN CUSTODIA */}
            {isSelfRequest ? (
              <p className="form-message form-error" role="alert">
                <AlertCircle size={15} aria-hidden="true" /> No puedes solicitarte una comisión a ti mismo.
              </p>
            ) : null}

            {submitError && (
              <p className="form-message form-error" role="alert">{submitError}</p>
            )}

            <button
              type="submit"
              className="button button-primary button-checkout-cta"
              disabled={submitting || isClosed || isSelfRequest}
            >
              <Lock size={16} aria-hidden="true" />
              <span>
                {isSelfRequest
                  ? 'No puedes solicitarte a ti mismo'
                  : `Enviar propuesta de comisión ($${totalPrice} USD)`}
              </span>
            </button>

            {/* ENLACE SECUNDARIO */}
            <div className="pre-pay-inquiry">
              <Link to={`/mensajes?artistId=${profile.id}`} className="inquiry-link">
                <MessageCircle size={15} aria-hidden="true" />
                <span>Preguntar a {profile.displayName} antes de pagar</span>
              </Link>
            </div>

            <div className="security-footer-badges">
              <span><Lock size={12} aria-hidden="true" /> Encriptación 256-bit</span>
              <span><RotateCcw size={12} aria-hidden="true" /> Garantía de reembolso</span>
            </div>
          </div>

          {/* TARJETA DE CONTRATO DIGITAL AUTOMATIZADO */}
          <div className="contract-info-card paper-card">
            <FileText size={20} className="text-violet" aria-hidden="true" />
            <div>
              <strong>Contrato Digital Automatizado</strong>
              <p>Generado automáticamente con validez internacional de derechos de autor.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}
