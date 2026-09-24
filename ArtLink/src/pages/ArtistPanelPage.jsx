import { useEffect, useState } from 'react'
import { DollarSign, Eye, Inbox, Star } from 'lucide-react'
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

function Metric({ icon: Icon, label, value, demo }) {
  return (
    <div className="metric-card">
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
      {demo && <small>Dato demostrativo</small>}
    </div>
  )
}

function PortfolioSection({ items, editing, setEditing, busy, onCreate, onUpdate, onDelete, error }) {
  return (
    <section className="workspace-section" aria-labelledby="portfolio-workspace-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Piezas publicadas</p>
          <h2 id="portfolio-workspace-title">Gestiona tu portafolio</h2>
        </div>
        <span>{items.length} piezas</span>
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
            <div>
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
          <p className="eyebrow">Servicios que ofreces</p>
          <h2 id="commission-workspace-title">Gestiona tus comisiones</h2>
        </div>
        <span>{items.length} tarifas</span>
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
              <span className={`status-text ${item.status}`}>
                {item.status === 'active' ? 'Activa' : 'Pausada'}
              </span>
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

  if (loading) return <LoadingState label="Cargando tu espacio de artista" />
  if (error && !profile) return <ErrorState message={error.message} onRetry={workspace.reload} />
  if (!profile) return <EmptyState title="Perfil de artista no disponible" description="Esta cuenta todavía no tiene un perfil asociado." />

  async function saveAvailability(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await actions.updateAvailability(form.get('availability'), Number(form.get('slots')))
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

  return (
    <section className="artist-workspace" aria-labelledby="workspace-title">
      {/* Encabezado */}
      <div className="workspace-header">
        <div>
          <p className="eyebrow">Estudio de artista</p>
          <h1 id="workspace-title">Hola, {profile.displayName}</h1>
          <p>Tu espacio para cuidar cada detalle de tu trabajo.</p>
        </div>
        <ArtistCard artist={profile} />
      </div>

      {/* Pestañas de navegación */}
      <nav className="workspace-tabs" aria-label="Secciones del panel">
        <Link className={section === 'overview' ? 'is-active' : ''} to="/artista/panel">Resumen</Link>
        <Link className={section === 'portfolio' ? 'is-active' : ''} to="/artista/portafolio">Portafolio</Link>
        <Link className={section === 'commissions' ? 'is-active' : ''} to="/artista/comisiones">Comisiones</Link>
      </nav>

      {/* Sección: Resumen */}
      {section === 'overview' && (
        <>
          <div className="workspace-grid">
            {/* Panel de disponibilidad */}
            <section className="workspace-section availability-panel" aria-labelledby="availability-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Estado visible al público</p>
                  <h2 id="availability-title">Disponibilidad</h2>
                </div>
                <span className={`availability-dot ${availability}`} aria-label={`Estado ${availability}`} />
              </div>
              <form className="availability-form" onSubmit={saveAvailability}>
                <label htmlFor="artist-availability">Estado
                  <select
                    id="artist-availability"
                    name="availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="open">Abierto</option>
                    <option value="waitlist">Lista de espera</option>
                    <option value="closed">Cerrado</option>
                  </select>
                </label>
                <label htmlFor="artist-slots">Cupos actuales
                  <input
                    id="artist-slots"
                    name="slots"
                    type="number"
                    min="0"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                  />
                </label>
                <Button type="submit" loading={busy}>Guardar disponibilidad</Button>
              </form>
            </section>

            <InspirationWidget quote={inspiration} onRefresh={refreshQuote} loading={quoteLoading} />
          </div>

          {/* Métricas */}
          <section className="metrics-grid" aria-label="Métricas demostrativas">
            <Metric icon={DollarSign} label="Ingresos del mes" value={price(1280)} />
            <Metric icon={Inbox} label="Solicitudes activas" value={activeRequests.length} />
            <Metric icon={Eye} label="Visitas al portafolio" value="1,842" demo />
            <Metric icon={Star} label="Calificación promedio" value={profile.rating ? profile.rating.toFixed(1) : 'Nuevo'} />
          </section>

          {/* Bandeja de solicitudes */}
          <section className="workspace-section" aria-labelledby="requests-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Lo que llega a tu bandeja</p>
                <h2 id="requests-title">Solicitudes recibidas</h2>
              </div>
              <span className="request-count">{requests.length} total</span>
            </div>
            {requests.length ? (
              <RequestBoard requests={requests} onStatusChange={actions.updateRequestStatus} busy={busy} />
            ) : (
              <EmptyState title="Tu bandeja está tranquila" description="Las nuevas solicitudes aparecerán aquí." />
            )}
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
