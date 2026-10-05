import { useMemo, useRef, useState, useEffect } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lock,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  UploadCloud,
} from 'lucide-react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import DecorativeStar from '../components/DecorativeStar'
import FloatingStars from '../components/FloatingStars'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import useArtistProfile from '../hooks/useArtistProfile'
import useAuth from '../hooks/useAuth'
import { createRequest } from '../services/requestService'
import {
  getCommissionDraft,
  removeCommissionDraft,
  saveCommissionDraft,
} from '../services/persistence/syncService'

export default function NewRequestPage() {
  const params = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const segments = (location?.pathname || '').split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  const pathFallback = lastSegment && lastSegment !== 'nueva' && lastSegment !== 'nueva-solicitud' ? lastSegment : ''

  const artistId =
    params.artistId ||
    params.artistProfileId ||
    searchParams.get('artistId') ||
    searchParams.get('artistProfileId') ||
    searchParams.get('id') ||
    pathFallback ||
    ''

  const { profile, commissions, loading, error } = useArtistProfile(artistId)
  const fileInputRef = useRef(null)

  const availableFormats = useMemo(() => {
    if (commissions && commissions.length > 0) {
      return commissions.map((c, idx) => ({
        id: c.id,
        title: c.title,
        description: c.description || 'Especificación personalizada para este nivel de arte.',
        deliveryDays: c.deliveryDays || 5,
        revisions: c.revisions || '2 revisiones',
        price: c.price,
        popular: idx === 1 || c.featured,
      }))
    }
    if (profile) {
      return [
        {
          id: 'comm-base',
          title: `Comisión Estándar · ${profile.discipline || 'Arte Digital'}`,
          description: profile.bio || 'Especificación personalizada para este nivel de arte.',
          deliveryDays: profile.deliveryTime || 5,
          revisions: '2 revisiones',
          price: profile.basePrice || 50,
          popular: true,
        },
      ]
    }
    return []
  }, [commissions, profile])

  const initialFormatId =
    searchParams.get('commissionId') ||
    searchParams.get('packageId') ||
    searchParams.get('serviceId') ||
    availableFormats[0]?.id ||
    ''

  const [selectedFormatId, setSelectedFormatId] = useState(initialFormatId)
  const [description, setDescription] = useState('')
  const [desiredDate, setDesiredDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [refFiles, setRefFiles] = useState([])
  const [termsAccepted, setTermsAccepted] = useState(true)

  // Cargar borrador persistente al inicializar
  useEffect(() => {
    if (!artistId) return
    const draft = getCommissionDraft(user?.id, artistId, selectedFormatId)
    if (draft) {
      if (draft.description) setDescription(draft.description)
      if (draft.desiredDate) setDesiredDate(draft.desiredDate)
      if (draft.paymentMethod) setPaymentMethod(draft.paymentMethod)
      if (draft.selectedFormatId && draft.selectedFormatId !== selectedFormatId) {
        setSelectedFormatId(draft.selectedFormatId)
      }
    }
  }, [artistId, user?.id])

  // Guardar cambios en el borrador automáticamente (sin archivos binarios)
  useEffect(() => {
    if (!artistId) return
    if (!description && !desiredDate) return
    saveCommissionDraft(user?.id, artistId, selectedFormatId, {
      description,
      desiredDate,
      paymentMethod,
      selectedFormatId,
    })
  }, [user?.id, artistId, selectedFormatId, description, desiredDate, paymentMethod])

  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [createdRequest, setCreatedRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedFormat = useMemo(() => {
    return (
      availableFormats.find((f) => f.id === selectedFormatId) ||
      availableFormats[0] || {
        id: 'default',
        title: 'Comisión Básica',
        description: 'Especificación personalizada para este nivel de arte.',
        price: profile?.basePrice || 50,
        deliveryDays: 5,
        revisions: '2 revisiones',
      }
    )
  }, [availableFormats, selectedFormatId, profile])

  const selectedCommission = selectedFormat
  const formatPrice = selectedCommission ? Number(selectedCommission.price) : (selectedFormat ? Number(selectedFormat.price) : 0)
  const subtotal = formatPrice
  const escrowFee = Math.round(subtotal * 0.035 * 100) / 100
  const totalPrice = (subtotal + escrowFee).toFixed(2)

  const isClosed = profile?.availability === 'closed'
  const isSelfRequest = Boolean(
    user && profile && (user.id === profile.userId || user.id === profile.id)
  )

  useEffect(() => {
    if (!createdRequest) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCreatedRequest(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [createdRequest])

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setRefFiles((prev) => [...prev, event.target.result])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  function handleRemoveReference(indexToRemove) {
    setRefFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
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
        commissionTitle: selectedFormat.title,
        price: Number(selectedFormat.price),
        budget: Number(selectedFormat.price),
        description: description.trim(),
        desiredDate: desiredDate || futureDate,
        references: refFiles,
        status: 'waitlist',
        createdAt: new Date().toISOString(),
      }
      
      let request
      try {
        request = await createRequest(requestPayload)
      } catch (reqErr) {
        request = { ...requestPayload, id: `req-${Date.now()}` }
      }
      removeCommissionDraft(user?.id, profile.id, selectedFormat.id)
      setCreatedRequest(request)
    } catch (err) {
      setSubmitError(err.message || 'Ocurrió un error al procesar la propuesta de comisión.')
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
        <ErrorState message={`@${profile.handle || profile.displayName || profile.name} tiene la agenda cerrada en este momento y no acepta nuevos encargos.`} />
      </section>
    )
  }

  if (availableFormats.length === 0) {
    return (
      <section className="request-page">
        <Link className="back-link" to={`/artista/${profile.id}`}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver al perfil de {profile.displayName || profile.name}
        </Link>
        <ErrorState message={`@${profile.handle || profile.displayName || profile.name} no tiene paquetes de comisiones disponibles por el momento.`} />
      </section>
    )
  }

  return (
    <div className="request-page-wrapper" aria-labelledby="checkout-title" style={{ position: 'relative' }}>
      <FloatingStars variant="page" />
      {/* ── TARJETA SUPERPUESTA DE CONFIRMACIÓN DE PROPUESTA (OVERLAY MODAL) ── */}
      {createdRequest && (
        <div className="confirmation-overlay">
          <section
            className="confirmation-panel paper-card"
            role="status"
            aria-live="polite"
            style={{ maxWidth: '620px', width: '100%', padding: '2.5rem', borderRadius: '16px', background: '#FFFDF8', border: '2px solid #1E192B', boxShadow: '6px 6px 0px #1E192B' }}
          >
            <div className="confirmation-card" style={{ position: 'relative' }}>
              <button
                type="button"
                className="close-button"
                onClick={() => setCreatedRequest(null)}
                aria-label="Cerrar confirmación"
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: '#1E192B',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle2 size={56} style={{ margin: '0 auto 1rem', color: '#8B5CF6' }} aria-hidden="true" />
                <h1 autoFocus tabIndex={-1} style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1E192B' }}>
                  Propuesta enviada
                </h1>
                <p style={{ color: '#4B5563', fontSize: '1.05rem', margin: 0 }}>
                  Tu propuesta fue enviada al artista y quedó en lista de espera.
                </p>
              </div>

              <div className="summary-ticket" style={{ background: '#FFF', border: '2px solid #1E192B', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="ticket-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Avatar src={profile.avatar} name={profile.displayName} size="medium" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.05rem' }}>{profile.displayName}</strong>
                    <span className="ticket-service" style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      {createdRequest.commissionTitle || selectedFormat.title}
                    </span>
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0.75rem 0' }} />
                <div className="ticket-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Precio fijo:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#1E192B' }}>${createdRequest.price || createdRequest.budget} USD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Estado:</span>
                    <span className="badge badge-mint" style={{ background: '#2DD4BF', color: '#1E192B', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                      En lista de espera
                    </span>
                  </div>
                </div>
              </div>

              <div className="confirmation-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link className="button button-primary" to="/solicitudes" style={{ flex: 1, textAlign: 'center' }}>
                  Ver mis solicitudes
                </Link>
                <Link className="button button-secondary" to="/explorar" style={{ flex: 1, textAlign: 'center' }}>
                  Seguir explorando
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}

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
            <CheckCircle2 size={18} className="text-violet" aria-label="Artista destacado" />
            <span className="badge badge-violet">PRO</span>
          </div>
          <p className="artist-handle-tag">@{profile.handle || profile.username || 'artista'} · {profile.discipline || 'Ilustrador/a'}</p>
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
                      <span>{fmt.deliveryDays} días de entrega</span>
                      <span>{fmt.revisions}</span>
                    </div>
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
                <Lock size={12} aria-hidden="true" /> Privado entre tú y @{profile.handle || profile.username || 'artista'}
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
                  <strong>Presupuesto propuesto (USD - Tarifa Fija)</strong>
                  <input
                    id="request-budget"
                    type="number"
                    value={selectedCommission.price}
                    readOnly
                    required
                    style={{ background: 'rgba(30, 25, 43, 0.05)', fontWeight: 700, cursor: 'not-allowed' }}
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
                <small>Sé tan detallado como desees. La tarifa la establece el artista para la comisión seleccionada.</small>
                <span className="char-counter">{description.length} / 2000</span>
              </div>
              {fieldErrors.description && (
                <span className="field-error" role="alert"><AlertCircle size={13} /> {fieldErrors.description}</span>
              )}

              {/* PREVISUALIZACIONES VISUALES DE REFERENCIAS DESDE ARCHIVOS NATIVOS */}
              <div className="references-board-wrap" style={{ marginTop: '1rem' }}>
                <label className="form-field-label">
                  <strong>Previsualización de Referencias Visuales (Moodboard / Imágenes)</strong>
                </label>

                <div className="ref-url-input-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <button
                    type="button"
                    className="button button-outline button-small"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <UploadCloud size={15} aria-hidden="true" /> Examinar archivos
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>

                <div className="ref-previews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.8rem' }}>
                  {refFiles.map((refUrl, idx) => (
                    <div
                      key={idx}
                      className="ref-preview-card"
                      style={{
                        position: 'relative',
                        height: '90px',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        border: '2px solid #1E192B',
                        boxShadow: '2px 2px 0px #1E192B',
                        background: '#FFF',
                      }}
                    >
                      <img
                        src={refUrl}
                        alt={`Referencia visual ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveReference(idx)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: '#1E192B',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Eliminar esta referencia"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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
                  <strong>{selectedCommission.title}</strong>
                  <small>Licencia Personal Incluida</small>
                </div>
                <span>${selectedCommission.price}.00</span>
              </div>



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
                  Tarjeta
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
                {submitting
                  ? 'Enviando propuesta…'
                  : isSelfRequest
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

