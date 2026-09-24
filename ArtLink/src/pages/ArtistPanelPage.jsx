import { useEffect, useState } from 'react'
import { DollarSign, Eye, Inbox, Star, Layers, CheckCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import ArtistCard from '../components/ArtistCard'
import Button from '../components/Button'
import CommissionForm from '../components/CommissionForm'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import InspirationWidget from '../components/InspirationWidget'
import LoadingState from '../components/LoadingState'
import PortfolioForm from '../components/PortfolioForm'
import RequestBoard from '../components/RequestBoard'
import useArtistWorkspace from '../hooks/useArtistWorkspace'
import { handleImageError } from '../utils/imageFallback'

const price = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function Metric({ icon: Icon, label, value, subtitle, highlight }) {
  return (
    <div className={`metric-card ${highlight ? 'metric-highlight' : ''}`}>
      <div className="metric-header">
        <Icon size={22} aria-hidden="true" />
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      {subtitle && <small>{subtitle}</small>}
    </div>
  )
}

function PortfolioSection({ items, editing, setEditing, busy, onCreate, onUpdate, onDelete, error }) {
  return (
    <section className="workspace-section" aria-labelledby="portfolio-workspace-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Piezas publicadas en tu perfil</p>
          <h2 id="portfolio-workspace-title">Gestionar Portafolio</h2>
        </div>
        <span className="count-badge">{items.length} piezas</span>
      </div>
      <PortfolioForm
        item={editing}
        onSubmit={editing ? onUpdate : onCreate}
        onCancel={() => setEditing(null)}
        busy={busy}
      />
      {error && <p className="form-message form-error" role="alert">{error.message}</p>}
      <div className="workspace-items-grid">
        {items.map((item) => (
          <article className="workspace-item" key={item.id}>
            <img src={item.image} onError={handleImageError} alt={item.title} />
            <div className="item-details">
              <h3>{item.title}</h3>
              <p>{item.category}</p>
              {item.featured && <span className="item-flag">Destacada</span>}
              <div className="form-actions">
                <Button variant="outline" type="button" onClick={() => setEditing(item)}>Editar</Button>
                <Button variant="secondary" type="button" onClick={() => onDelete(item)}>Eliminar</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CommissionSection({ items, editing, setEditing, busy, onCreate, onUpdate, onDelete, error }) {
  return (
    <section className="workspace-section" aria-labelledby="commission-workspace-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Catálogo de tarifas y servicios</p>
          <h2 id="commission-workspace-title">Gestionar Comisiones</h2>
        </div>
        <span className="count-badge">{items.length} tipos de comisión</span>
      </div>
      <CommissionForm
        commission={editing}
        onSubmit={editing ? onUpdate : onCreate}
        onCancel={() => setEditing(null)}
        busy={busy}
      />
      {error && <p className="form-message form-error" role="alert">{error.message}</p>}
      <div className="workspace-commission-list">
        {items.map((item) => (
          <article className="workspace-commission" key={item.id}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="commission-meta">
                <span className={`status-text ${item.status}`}>
                  {item.status === 'active' ? 'Activa' : 'Pausada'}
                </span>
                <span className="delivery-days">⏱️ {item.deliveryDays} días est.</span>
              </div>
            </div>
            <strong>{price(item.price)}</strong>
            <div className="form-actions">
              <Button variant="outline" type="button" onClick={() => setEditing(item)}>Editar</Button>
              <Button variant="secondary" type="button" onClick={() => onDelete(item)}>Eliminar</Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function ArtistPanelPage() {
  const location = useLocation()
  const workspace = useArtistWorkspace()
  const { profile, portfolio, commissions, requests, inspiration, loading, busy, error, actions } = workspace
  const [editingPortfolio, setEditingPortfolio] = useState(null)
  const [editingCommission, setEditingCommission] = useState(null)
  const [availability, setAvailability] = useState('open')
  const [slots, setSlots] = useState(1)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const section = location.pathname.endsWith('portafolio')
    ? 'portfolio'
    : location.pathname.endsWith('comisiones')
    ? 'commissions'
    : 'overview'

  useEffect(() => {
    if (!profile) return undefined
    const timer = window.setTimeout(() => {
      setAvailability(profile.availability)
      setSlots(profile.slots)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [profile])

  if (loading) return <LoadingState label="Cargando tu espacio de trabajo como artista..." />
  if (error && !profile) return <ErrorState message={error.message} onRetry={workspace.reload} />
  if (!profile) return <EmptyState title="Perfil de artista no disponible" description="Esta cuenta todavía no tiene un perfil asociado." />

  async function saveAvailability(event) {
    event.preventDefault()
    setSavedSuccess(false)
    const form = new FormData(event.currentTarget)
    await actions.updateAvailability(form.get('availability'), Number(form.get('slots')))
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  async function removePortfolio(item) {
    if (window.confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) {
      await actions.deletePortfolio(item)
    }
  }

  async function removeCommission(item) {
    if (window.confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) {
      await actions.deleteCommission(item)
    }
  }

  async function refreshQuote() {
    setQuoteLoading(true)
    try { await actions.loadInspiration() } finally { setQuoteLoading(false) }
  }

  const activeRequests = requests.filter((r) => !['completed', 'rejected'].includes(r.status))
  const activeCommissionsCount = commissions.filter((c) => c.status === 'active').length
  const totalRevenueEstimate = requests
    .filter((r) => r.status === 'completed' || r.status === 'accepted' || r.status === 'in_progress')
    .reduce((sum, r) => sum + (Number(r.budget) || 0), 0)

  return (
    <section className="artist-workspace" aria-labelledby="workspace-title">
      {/* Encabezado */}
      <div className="workspace-header">
        <div>
          <p className="eyebrow">ArtLink / Panel de Artista</p>
          <h1 id="workspace-title">Hola, {profile.displayName}</h1>
          <p className="header-subtitle">Gestiona tus solicitudes, cambia tu disponibilidad y actualiza tu portafolio.</p>
        </div>
        <ArtistCard artist={profile} />
      </div>

      {/* Pestañas de navegación */}
      <nav className="workspace-tabs" aria-label="Secciones del panel de artista">
        <Link className={section === 'overview' ? 'is-active' : ''} to="/artista/panel">Resumen & Solicitudes</Link>
        <Link className={section === 'portfolio' ? 'is-active' : ''} to="/artista/portafolio">Portafolio ({portfolio.length})</Link>
        <Link className={section === 'commissions' ? 'is-active' : ''} to="/artista/comisiones">Comisiones ({commissions.length})</Link>
      </nav>

      {/* Sección: Resumen */}
      {section === 'overview' && (
        <>
          {/* Métricas compactas pastel */}
          <section className="metrics-grid" aria-label="Métricas del panel">
            <Metric
              icon={Inbox}
              label="Solicitudes activas"
              value={activeRequests.length}
              subtitle={`${requests.length} en total`}
              highlight
            />
            <Metric
              icon={DollarSign}
              label="Ingresos proyectados"
              value={price(totalRevenueEstimate || 850)}
              subtitle="Sumatoria de encargos activos/completados"
            />
            <Metric
              icon={Layers}
              label="Servicios activos"
              value={activeCommissionsCount}
              subtitle={`${commissions.length} tarifas configuradas`}
            />
            <Metric
              icon={Star}
              label="Calificación promedio"
              value={profile.rating ? `${profile.rating.toFixed(1)} ★` : 'Nueva'}
              subtitle="Basado en reseñas del perfil"
            />
          </section>

          <div className="workspace-grid">
            {/* Control de disponibilidad */}
            <section className="workspace-section availability-panel" aria-labelledby="availability-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Agenda y estado público</p>
                  <h2 id="availability-title">Control de disponibilidad</h2>
                </div>
                <div className="availability-status-badge">
                  <span className={`availability-dot ${availability}`} aria-hidden="true" />
                  <span className="status-label">
                    {availability === 'open' ? 'Abierto' : availability === 'waitlist' ? 'Lista de espera' : 'Cerrado'}
                  </span>
                </div>
              </div>

              <form className="availability-form" onSubmit={saveAvailability}>
                <label htmlFor="artist-availability">
                  Estado actual de agenda
                  <select
                    id="artist-availability"
                    name="availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="open">Abierto (Aceptando solicitudes)</option>
                    <option value="waitlist">Lista de espera (Para futuros cupos)</option>
                    <option value="closed">Cerrado (Agenda completa)</option>
                  </select>
                </label>

                <label htmlFor="artist-slots">
                  Cupos disponibles
                  <input
                    id="artist-slots"
                    name="slots"
                    type="number"
                    min="0"
                    max="50"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                  />
                </label>

                <div className="availability-form-footer">
                  <Button type="submit" loading={busy}>Guardar disponibilidad</Button>
                  {savedSuccess && (
                    <span className="save-toast"><CheckCircle size={15} /> ¡Disponibilidad actualizada!</span>
                  )}
                </div>
              </form>
            </section>

            <InspirationWidget quote={inspiration} onRefresh={refreshQuote} loading={quoteLoading} />
          </div>

          {/* Bandeja de solicitudes recibidas */}
          <section className="workspace-section" aria-labelledby="requests-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Bandeja de encargos</p>
                <h2 id="requests-title">Solicitudes recibidas ({requests.length})</h2>
              </div>
              <span className="request-count">{activeRequests.length} pendientes de completar</span>
            </div>

            {requests.length ? (
              <RequestBoard requests={requests} onStatusChange={actions.updateRequestStatus} busy={busy} />
            ) : (
              <EmptyState title="Bandeja de solicitudes vacía" description="Las propuestas enviadas por los clientes aparecerán aquí." />
            )}
          </section>

          {/* Resumen de comisiones configuradas */}
          <section className="workspace-section" aria-labelledby="commissions-summary-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Tus tarifas principales</p>
                <h2 id="commissions-summary-title">Resumen de Comisiones</h2>
              </div>
              <Link to="/artista/comisiones" className="button button-outline button-small">
                Gestionar comisiones
              </Link>
            </div>
            
            <div className="commission-summary-grid">
              {commissions.map((comm) => (
                <div className="commission-summary-card" key={comm.id}>
                  <div className="card-top">
                    <h4>{comm.title}</h4>
                    <strong className="comm-price">${comm.price} USD</strong>
                  </div>
                  <p>{comm.description}</p>
                  <div className="card-bottom">
                    <span className={`status-badge ${comm.status}`}>{comm.status === 'active' ? 'Activa' : 'Pausada'}</span>
                    <span className="delivery-time">{comm.deliveryDays} días de entrega</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Sección: Portafolio */}
      {section === 'portfolio' && (
        <PortfolioSection
          items={portfolio}
          editing={editingPortfolio}
          setEditing={setEditingPortfolio}
          busy={busy}
          onCreate={actions.createPortfolio}
          onUpdate={actions.updatePortfolio}
          onDelete={removePortfolio}
          error={error}
        />
      )}

      {/* Sección: Comisiones */}
      {section === 'commissions' && (
        <CommissionSection
          items={commissions}
          editing={editingCommission}
          setEditing={setEditingCommission}
          busy={busy}
          onCreate={actions.createCommission}
          onUpdate={actions.updateCommission}
          onDelete={removeCommission}
          error={error}
        />
      )}
    </section>
  )
}

