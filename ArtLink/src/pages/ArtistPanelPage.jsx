import { useEffect, useState } from 'react'
import {
  CheckCircle,
  DollarSign,
  Eye,
  Inbox,
  Layers,
  ShieldCheck,
} from 'lucide-react'
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
import DecorativeStar from '../components/DecorativeStar'
import useArtistWorkspace from '../hooks/useArtistWorkspace'
import { handleImageError } from '../utils/imageFallback'

const price = (value) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

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
          <p className="eyebrow">Piezas publicadas en tu perfil público</p>
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
          <article className="workspace-item paper-card" key={item.id}>
            <img src={item.image} onError={handleImageError} alt={item.title} />
            <div className="item-details">
              <h3>{item.title}</h3>
              <p>{item.category}</p>
              {item.featured && <span className="item-flag">Destacada</span>}
              <div className="form-actions" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
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
          <p className="eyebrow">Catálogo de tarifas y paquetes</p>
          <h2 id="commission-workspace-title">Gestionar Comisiones</h2>
        </div>
        <span className="count-badge">{items.length} paquetes</span>
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
          <article className="workspace-commission paper-card" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: '0.8rem' }}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="commission-meta" style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                <span className={`status-text ${item.status}`}>
                  {item.status === 'active' ? 'Activa' : 'Pausada'}
                </span>
                <span className="delivery-days">{item.deliveryDays} días de entrega</span>
                <span>{item.revisions} revisiones</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '1.2rem', color: 'var(--violet-dark)' }}>{price(item.price)}</strong>
              <div className="form-actions" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
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
    : location.pathname.endsWith('solicitudes')
    ? 'requests'
    : 'overview'

  useEffect(() => {
    if (!profile) return undefined
    const timer = window.setTimeout(() => {
      setAvailability(profile.availability || 'open')
      setSlots(profile.slots || 1)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [profile])

  if (loading) return <LoadingState label="Cargando tu panel de artista en ArtLink..." />
  if (error && !profile) return <ErrorState message={error.message} onRetry={workspace.reload} />
  if (!profile) return <EmptyState title="Perfil de artista no disponible" description="Esta cuenta todavía no tiene un perfil de artista asociado." />

  async function saveAvailability(event) {
    event.preventDefault()
    setSavedSuccess(false)
    const form = new FormData(event.currentTarget)
    await actions.updateAvailability(form.get('availability'), Number(form.get('slots')))
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  async function removePortfolio(item) {
    if (window.confirm(`¿Eliminar "${item.title}" del portafolio? esta acción no se puede deshacer.`)) {
      await actions.deletePortfolio(item)
    }
  }

  async function removeCommission(item) {
    if (window.confirm(`¿Eliminar la comisión "${item.title}"? esta acción no se puede deshacer.`)) {
      await actions.deleteCommission(item)
    }
  }

  async function refreshQuote() {
    setQuoteLoading(true)
    try { await actions.loadInspiration() } finally { setQuoteLoading(false) }
  }

  const activeRequests = requests.filter((r) => !['completed', 'rejected'].includes(r.status))
  const activeCommissionsCount = commissions.filter((c) => c.status === 'active').length
  const completedRequests = requests.filter((r) => r.status === 'completed')
  const totalRevenueEstimate = completedRequests.reduce((sum, r) => sum + (Number(r.budget) || 0), 0)
  const clientCount = new Set(
    requests.filter((r) => r.status !== 'rejected').map((r) => r.clientId).filter(Boolean)
  ).size

  return (
    <section className="artist-workspace" aria-labelledby="workspace-title">
      {/* Aviso de protección del sistema */}
      <div className="escrow-demo-alert-banner" style={{ background: '#FEF08A', border: '2px solid #1E192B', padding: '0.6rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <ShieldCheck size={18} color="#1E192B" aria-hidden="true" />
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E192B' }}>
          Sistema ArtLink: Protección de pagos con custodia en Escrow activa para todas tus solicitudes.
        </span>
      </div>

      {/* Encabezado */}
      <div className="workspace-header">
        <div>
          <span className="sticker sticker-pink" style={{ display: 'inline-flex', marginBottom: '0.4rem' }}>
            <DecorativeStar size={12} color="#1E192B" /> PANEL DE CREADOR
          </span>
          <h1 id="workspace-title">¡Hola, {profile.displayName}!</h1>
          <p className="header-subtitle">Gestiona tu agenda, responde a solicitudes recibidas y mantiene al día tu portafolio.</p>
        </div>
        <ArtistCard artist={profile} />
      </div>

      {/* Pestañas de navegación */}
      <nav className="workspace-tabs" aria-label="Secciones del panel de artista" style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <Link className={section === 'overview' ? 'is-active' : ''} to="/artista/panel">Resumen</Link>
        <Link className={section === 'requests' ? 'is-active' : ''} to="/artista/solicitudes">Solicitudes ({requests.length})</Link>
        <Link className={section === 'portfolio' ? 'is-active' : ''} to="/artista/portafolio">Portafolio ({portfolio.length})</Link>
        <Link className={section === 'commissions' ? 'is-active' : ''} to="/artista/comisiones">Comisiones ({commissions.length})</Link>
      </nav>

      {/* Sección: Resumen (Overview) */}
      {section === 'overview' && (
        <>
          {/* Métricas calculadas sobre los datos reales del panel */}
          <section className="metrics-grid" aria-label="Métricas de rendimiento" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <Metric
              icon={Inbox}
              label="Encargos activos"
              value={activeRequests.length}
              subtitle={`${requests.length} recibidas en total`}
              highlight
            />
            <Metric
              icon={DollarSign}
              label="Ingresos completados"
              value={price(totalRevenueEstimate)}
              subtitle={`${completedRequests.length} encargos completados`}
            />
            <Metric
              icon={Layers}
              label="Servicios activos"
              value={activeCommissionsCount}
              subtitle={`${commissions.length} tarifas configuradas`}
            />
            <Metric
              icon={Eye}
              label="Clientes atendidos"
              value={clientCount}
              subtitle={`${requests.length} solicitudes recibidas en total`}
            />
          </section>

          <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Control de Disponibilidad */}
            <section className="workspace-section availability-panel paper-card" aria-labelledby="availability-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Agenda y estado público</p>
                  <h2 id="availability-title">Control de Disponibilidad</h2>
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
                  Estado actual de la agenda
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

                <label htmlFor="artist-slots" style={{ marginTop: '0.8rem' }}>
                  Cupos libres disponibles
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

                <div className="availability-form-footer" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Button type="submit" loading={busy}>Guardar estado de agenda</Button>
                  {savedSuccess && (
                    <span className="save-toast" style={{ color: 'var(--mint)', fontWeight: 600 }}>
                      <CheckCircle size={15} inline /> ¡Guardado!
                    </span>
                  )}
                </div>
              </form>
            </section>

            <InspirationWidget quote={inspiration} onRefresh={refreshQuote} loading={quoteLoading} />
          </div>

          {/* Tablero de solicitudes recibidas en Overview */}
          <section className="workspace-section paper-card" aria-labelledby="requests-overview-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Bandeja de solicitudes</p>
                <h2 id="requests-overview-title">Solicitudes Recientes ({requests.length})</h2>
              </div>
              <Link to="/artista/solicitudes" className="button button-outline button-small">
                Ver todas las solicitudes
              </Link>
            </div>

            {requests.length ? (
              <RequestBoard requests={requests} onStatusChange={actions.updateRequestStatus} busy={busy} />
            ) : (
              <EmptyState title="No has recibido solicitudes" description="Las propuestas de clientes aparecerán en esta lista." />
            )}
          </section>
        </>
      )}

      {/* Sección: Solicitudes Recibidas */}
      {section === 'requests' && (
        <section className="workspace-section paper-card" aria-labelledby="requests-page-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Gestión de encargos recibidos</p>
              <h2 id="requests-page-title">Todas las Solicitudes Recibidas ({requests.length})</h2>
            </div>
          </div>

          {requests.length ? (
            <RequestBoard requests={requests} onStatusChange={actions.updateRequestStatus} busy={busy} />
          ) : (
            <EmptyState title="No tienes solicitudes actualmente" description="Cuando los clientes te encarguen comisiones, se mostrarán aquí." />
          )}
        </section>
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
