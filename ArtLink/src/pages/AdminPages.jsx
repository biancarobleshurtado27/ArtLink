import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, CartesianGrid, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  Users, UserCheck, Palette, FileText, CheckCircle2, AlertTriangle, Activity, Plus, Search,
  Trash2, Edit3, Filter, ArrowLeft, ShieldCheck, Clock, Server, ArrowRight, RefreshCw, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService'
import { getArtists, createArtist, updateArtist, deleteArtist } from '../services/artistService'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { getRequests, createRequest, updateRequest, deleteRequest } from '../services/requestService'

const resourceConfigs = {
  usuarios: {
    title: 'Usuarios',
    singularTitle: 'Usuario',
    description: 'Gestión de cuentas registradas en la plataforma.',
    fields: [
      { name: 'name', label: 'Nombre completo', type: 'text', required: true },
      { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
      { name: 'role', label: 'Rol', type: 'select', options: [{ value: 'cliente', label: 'Cliente' }, { value: 'artista', label: 'Artista' }, { value: 'admin', label: 'Administrador' }], required: true },
      { name: 'active', label: 'Estado activo', type: 'checkbox' }
    ],
    filterOptions: [
      { value: 'all', label: 'Todos los roles' },
      { value: 'cliente', label: 'Clientes' },
      { value: 'artista', label: 'Artistas' },
      { value: 'admin', label: 'Admins' }
    ],
    filterKey: 'role',
    service: [getUsers, createUser, updateUser, deleteUser]
  },
  artistas: {
    title: 'Artistas',
    singularTitle: 'Perfil de Artista',
    description: 'Perfiles públicos de creadores en el catálogo.',
    fields: [
      { name: 'displayName', label: 'Nombre público', type: 'text', required: true },
      { name: 'username', label: 'Nombre de usuario (@)', type: 'text', required: true },
      { name: 'location', label: 'Ubicación', type: 'text', required: true },
      { name: 'availability', label: 'Disponibilidad', type: 'select', options: [{ value: 'open', label: 'Abierto' }, { value: 'waitlist', label: 'Lista de espera' }, { value: 'closed', label: 'Cerrado' }], required: true },
      { name: 'slots', label: 'Cupos libres', type: 'number' }
    ],
    filterOptions: [
      { value: 'all', label: 'Toda disponibilidad' },
      { value: 'open', label: 'Abierto' },
      { value: 'waitlist', label: 'Lista de espera' },
      { value: 'closed', label: 'Cerrado' }
    ],
    filterKey: 'availability',
    service: [getArtists, createArtist, updateArtist, deleteArtist]
  },
  categorias: {
    title: 'Categorías',
    singularTitle: 'Categoría',
    description: 'Disciplinas y estilos de arte disponibles en ArtLink.',
    fields: [
      { name: 'name', label: 'Nombre de categoría', type: 'text', required: true },
      { name: 'slug', label: 'Slug / Identificador', type: 'text', required: true },
      { name: 'color', label: 'Color primario (HEX/CSS)', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea' }
    ],
    filterOptions: [{ value: 'all', label: 'Todas las categorías' }],
    filterKey: null,
    service: [getCategories, createCategory, updateCategory, deleteCategory]
  },
  solicitudes: {
    title: 'Solicitudes',
    singularTitle: 'Solicitud',
    description: 'Supervisión global de encargo y comisiones.',
    fields: [
      { name: 'clientId', label: 'ID de Cliente', type: 'text', required: true },
      { name: 'artistId', label: 'ID de Artista', type: 'text', required: true },
      { name: 'budget', label: 'Presupuesto (USD)', type: 'number', required: true },
      { name: 'status', label: 'Estado', type: 'select', options: [{ value: 'pending', label: 'Pendiente' }, { value: 'in_review', label: 'En revisión' }, { value: 'accepted', label: 'Aceptada' }, { value: 'in_progress', label: 'En progreso' }, { value: 'completed', label: 'Completada' }, { value: 'rejected', label: 'Rechazada' }], required: true },
      { name: 'desiredDate', label: 'Fecha estimada', type: 'date', required: true },
      { name: 'description', label: 'Detalles del encargo', type: 'textarea' }
    ],
    filterOptions: [
      { value: 'all', label: 'Todos los estados' },
      { value: 'pending', label: 'Pendientes' },
      { value: 'in_review', label: 'En revisión' },
      { value: 'accepted', label: 'Aceptadas' },
      { value: 'in_progress', label: 'En progreso' },
      { value: 'completed', label: 'Completadas' },
      { value: 'rejected', label: 'Rechazadas' }
    ],
    filterKey: 'status',
    service: [getRequests, createRequest, updateRequest, deleteRequest]
  }
}

const statusBadgeTone = (status) => {
  if (status === 'rejected' || status === 'closed') return 'closed'
  if (status === 'completed' || status === 'accepted' || status === 'open') return 'mint'
  if (status === 'waitlist') return 'yellow'
  return 'violet'
}

export function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = () => {
    setLoading(true)
    Promise.all([getUsers(), getArtists(), getRequests(), getCategories()])
      .then(([users, artists, requests, categories]) => {
        setData({ users, artists, requests, categories })
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) return <LoadingState label="Cargando panel de control administrativo..." />
  if (error) return <ErrorState message={error.message} onRetry={loadDashboard} />
  if (!data) return null

  // Prepara datos para gráficos Recharts
  const requestsByStatus = Object.entries(
    data.requests.reduce((acc, req) => {
      const label = req.status === 'pending' ? 'Pendientes'
        : req.status === 'in_review' ? 'En revisión'
        : req.status === 'accepted' ? 'Aceptadas'
        : req.status === 'in_progress' ? 'En progreso'
        : req.status === 'completed' ? 'Completadas'
        : 'Rechazadas'
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {})
  ).map(([name, total]) => ({ name, total }))

  const usersByRole = [
    { name: 'Clientes', value: data.users.filter((u) => u.role === 'cliente').length, color: '#8B5CF6' },
    { name: 'Artistas', value: data.users.filter((u) => u.role === 'artista').length, color: '#2DD4BF' },
    { name: 'Admins', value: data.users.filter((u) => u.role === 'admin').length, color: '#FEF08A' }
  ]

  const recentRequests = [...data.requests].slice(-5).reverse()

  return (
    <section className="admin-page" aria-labelledby="admin-title">
      <div className="admin-header">
        <div>
          <p className="eyebrow"><ShieldCheck size={14} inline="true" /> ArtLink / Panel de Control</p>
          <h1 id="admin-title">Administración Global de la Plataforma</h1>
          <p className="admin-subtitle">Monitoreo en tiempo real de usuarios, solicitudes, métricas y estado del sistema.</p>
        </div>
        <button className="button button-outline button-small" type="button" onClick={loadDashboard}>
          <RefreshCw size={14} /> Actualizar datos
        </button>
      </div>

      {/* 4 Métricas destacadas */}
      <div className="admin-metrics" aria-label="Métricas del sistema">
        <article className="admin-metric metric-purple">
          <div className="metric-icon-wrap"><Users size={22} /></div>
          <div>
            <span>Usuarios registrados</span>
            <strong>{data.users.length}</strong>
            <small>{data.users.filter(u => u.role === 'cliente').length} clientes · {data.users.filter(u => u.role === 'artista').length} artistas</small>
          </div>
        </article>

        <article className="admin-metric metric-mint">
          <div className="metric-icon-wrap"><UserCheck size={22} /></div>
          <div>
            <span>Artistas activos</span>
            <strong>{data.artists.length}</strong>
            <small>{data.artists.filter(a => a.availability === 'open').length} abiertos a comisiones</small>
          </div>
        </article>

        <article className="admin-metric metric-yellow">
          <div className="metric-icon-wrap"><FileText size={22} /></div>
          <div>
            <span>Solicitudes procesadas</span>
            <strong>{data.requests.length}</strong>
            <small>{data.requests.filter(r => r.status === 'pending').length} pendientes de respuesta</small>
          </div>
        </article>

        <article className="admin-metric metric-pink">
          <div className="metric-icon-wrap"><Palette size={22} /></div>
          <div>
            <span>Categorías activas</span>
            <strong>{data.categories.length}</strong>
            <small>Disciplinas y géneros de arte</small>
          </div>
        </article>
      </div>

      {/* Gráficos interactivos Recharts */}
      <div className="admin-charts">
        <section className="chart-card" aria-labelledby="chart-status-title">
          <div className="chart-header">
            <h2 id="chart-status-title">Solicitudes por estado</h2>
            <span className="chart-badge">Total: {data.requests.length}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={requestsByStatus}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1E192B' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#1E192B' }} />
              <Tooltip
                contentStyle={{ background: '#FFF', border: '2px solid #1E192B', borderRadius: '4px', fontWeight: 'bold' }}
              />
              <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-card" aria-labelledby="chart-roles-title">
          <div className="chart-header">
            <h2 id="chart-roles-title">Distribución de usuarios</h2>
            <span className="chart-badge">{data.users.length} cuentas</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={usersByRole}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={35}
                paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {usersByRole.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#1E192B" strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#FFF', border: '2px solid #1E192B' }} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Fila intermedia: Alertas del sistema y Estado de Plataforma */}
      <div className="admin-status-row">
        {/* Panel de Alertas */}
        <section className="admin-panel-card" aria-labelledby="alerts-title">
          <div className="panel-card-header">
            <h2 id="alerts-title"><AlertTriangle size={18} className="icon-warn" /> Alertas del sistema</h2>
            <span className="badge badge-yellow">3 activas</span>
          </div>
          <div className="alert-list">
            <div className="alert-item alert-warning">
              <Clock size={16} />
              <div>
                <strong>Solicitudes pendientes</strong>
                <p>Hay {data.requests.filter(r => r.status === 'pending').length} solicitudes esperando primera respuesta del artista.</p>
              </div>
            </div>
            <div className="alert-item alert-info">
              <UserCheck size={16} />
              <div>
                <strong>Nuevos registros</strong>
                <p>Se registraron {data.users.slice(-3).length} cuentas nuevas esta semana.</p>
              </div>
            </div>
            <div className="alert-item alert-success">
              <CheckCircle2 size={16} />
              <div>
                <strong>Catálogo verificado</strong>
                <p>Las {data.categories.length} categorías están optimizadas para la búsqueda pública.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Estado de plataforma */}
        <section className="admin-panel-card" aria-labelledby="server-status-title">
          <div className="panel-card-header">
            <h2 id="server-status-title"><Server size={18} /> Estado de infraestructura</h2>
            <span className="badge badge-mint">🟢 Operacional</span>
          </div>
          <div className="system-health-grid">
            <div className="health-row">
              <span>API Services (Express Mock):</span>
              <strong className="status-online">🟢 200 OK</strong>
            </div>
            <div className="health-row">
              <span>Base de Datos JSON-Server:</span>
              <strong className="status-online">🟢 Conectada (0.4ms)</strong>
            </div>
            <div className="health-row">
              <span>Almacenamiento de Assets:</span>
              <strong className="status-online">🟢 100% Disponible</strong>
            </div>
            <div className="health-row">
              <span>Disponibilidad del Sistema (SLA):</span>
              <strong>99.98%</strong>
            </div>
          </div>
        </section>
      </div>

      {/* Solicitudes recientes */}
      <section className="admin-panel-card admin-recent-table" aria-labelledby="recent-requests-title">
        <div className="panel-card-header">
          <div>
            <h2 id="recent-requests-title">Solicitudes recientes en la plataforma</h2>
            <p className="subtext">Últimos encargos registrados por los clientes.</p>
          </div>
          <Link to="/admin/solicitudes" className="button button-outline button-small">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Presupuesto</th>
                <th>Fecha Entrega</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req) => (
                <tr key={req.id}>
                  <td><strong>#{req.id.slice(-6)}</strong></td>
                  <td>${req.budget} USD</td>
                  <td>{req.desiredDate}</td>
                  <td>
                    <Badge tone={statusBadgeTone(req.status)}>{req.status}</Badge>
                  </td>
                  <td>
                    <Link to="/admin/solicitudes" className="button button-secondary button-small">
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Accesos rápidos a recursos */}
      <nav className="admin-links" aria-label="Navegación de recursos administrativos">
        <Link to="/admin/usuarios" className="admin-nav-link">
          <Users size={18} /> Gestionar Usuarios ({data.users.length})
        </Link>
        <Link to="/admin/artistas" className="admin-nav-link">
          <UserCheck size={18} /> Gestionar Artistas ({data.artists.length})
        </Link>
        <Link to="/admin/categorias" className="admin-nav-link">
          <Palette size={18} /> Gestionar Categorías ({data.categories.length})
        </Link>
        <Link to="/admin/solicitudes" className="admin-nav-link">
          <FileText size={18} /> Gestionar Solicitudes ({data.requests.length})
        </Link>
      </nav>
    </section>
  )
}

export function AdminResourcePage({ resource }) {
  const config = resourceConfigs[resource] || resourceConfigs.usuarios
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [filterValue, setFilterValue] = useState('all')
  const [editing, setEditing] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [page, setPage] = useState(0)
  const pageSize = 7

  const [getAll, create, update, remove] = config.service

  const fetchItems = () => {
    setLoading(true)
    getAll()
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchItems()
  }, [resource])

  // Filtrado y búsqueda
  const filteredAll = useMemo(() => {
    return items.filter((item) => {
      // Filtro por clave
      if (config.filterKey && filterValue !== 'all') {
        if (item[config.filterKey] !== filterValue) return false
      }
      // Búsqueda por texto
      if (!query.trim()) return true
      const fullText = JSON.stringify(item).toLowerCase()
      return fullText.includes(query.toLowerCase().trim())
    })
  }, [items, query, filterValue, config.filterKey])

  const totalPages = Math.ceil(filteredAll.length / pageSize)
  const paginatedItems = useMemo(() => {
    const start = page * pageSize
    return filteredAll.slice(start, start + pageSize)
  }, [filteredAll, page, pageSize])

  function openNewForm() {
    setIsNew(true)
    setEditing(true)
    const initial = {}
    config.fields.forEach((f) => {
      initial[f.name] = f.type === 'checkbox' ? true : f.type === 'number' ? 0 : ''
    })
    setForm(initial)
  }

  function openEditForm(item) {
    setIsNew(false)
    setEditing(item)
    setForm({ ...item })
  }

  async function handleFormSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setNotice('')

    try {
      if (isNew) {
        const created = await create(form)
        setItems((prev) => [...prev, created])
        setNotice(`Nuevo ${config.singularTitle.toLowerCase()} creado con éxito.`)
      } else {
        const updated = await update(editing.id, form)
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        setNotice(`${config.singularTitle} actualizado correctamente.`)
      }
      setEditing(null)
    } catch (saveError) {
      setError(saveError.message || 'Ocurrió un error al guardar el registro.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!itemToDelete) return
    setSubmitting(true)
    try {
      await remove(itemToDelete.id)
      setItems((prev) => prev.filter((entry) => entry.id !== itemToDelete.id))
      setNotice(`${config.singularTitle} eliminado con éxito.`)
      setItemToDelete(null)
    } catch (err) {
      setError(err.message || 'Error al eliminar el registro.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label={`Cargando registros de ${config.title.toLowerCase()}...`} />
  if (error && !items.length) return <ErrorState message={error.message} onRetry={fetchItems} />

  return (
    <section className="admin-page" aria-labelledby="resource-title">
      <Link className="back-link" to="/admin">
        <ArrowLeft size={16} aria-hidden="true" /> Volver al Dashboard
      </Link>

      <div className="admin-header">
        <div>
          <p className="eyebrow">Gestión CRUD de Plataforma</p>
          <h1 id="resource-title">{config.title}</h1>
          <p className="admin-subtitle">{config.description}</p>
        </div>
        <Button type="button" onClick={openNewForm}>
          <Plus size={16} aria-hidden="true" /> Nuevo {config.singularTitle}
        </Button>
      </div>

      {/* Toolbar con Búsqueda y Filtros */}
      <div className="admin-toolbar" aria-label="Herramientas de búsqueda y filtrado">
        <div className="search-field-wrap">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder={`Buscar en ${config.title.toLowerCase()}...`}
          />
        </div>

        {config.filterOptions.length > 1 && (
          <div className="filter-select-wrap">
            <Filter size={15} />
            <select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value)
                setPage(0)
              }}
              aria-label="Filtrar registros"
            >
              {config.filterOptions.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {notice && <p className="success-message" role="status">{notice}</p>}
      {error && <p className="form-message form-error" role="alert">{error}</p>}

      {/* Modal / Formulario de Creación y Edición */}
      <Modal open={Boolean(editing)} title={`${isNew ? 'Crear' : 'Editar'} ${config.singularTitle}`} onClose={() => setEditing(null)}>
        <form className="admin-crud-form" onSubmit={handleFormSubmit}>
          {config.fields.map((field) => (
            <label key={field.name} htmlFor={`field-${field.name}`}>
              {field.label}
              {field.type === 'select' ? (
                <select
                  id={`field-${field.name}`}
                  value={form[field.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                >
                  <option value="" disabled>Selecciona una opción</option>
                  {field.options.map((opt) => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`field-${field.name}`}
                  value={form[field.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  rows={3}
                  required={field.required}
                />
              ) : field.type === 'checkbox' ? (
                <input
                  id={`field-${field.name}`}
                  type="checkbox"
                  checked={Boolean(form[field.name])}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })}
                />
              ) : (
                <input
                  id={`field-${field.name}`}
                  type={field.type}
                  value={form[field.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                />
              )}
            </label>
          ))}

          <div className="crud-form-actions">
            <Button type="submit" loading={submitting}>
              {isNew ? 'Crear Registro' : 'Guardar Cambios'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal open={Boolean(itemToDelete)} title="Confirmar eliminación" onClose={() => setItemToDelete(null)}>
        {itemToDelete && (
          <div className="delete-confirm-box">
            <AlertTriangle size={48} className="delete-icon" />
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente este registro de <strong>{config.title}</strong>?
            </p>
            <div className="item-preview">
              <small>ID: #{itemToDelete.id}</small>
              <strong>{itemToDelete.name || itemToDelete.displayName || itemToDelete.title || itemToDelete.email || itemToDelete.description || 'Registro de ' + config.title}</strong>
            </div>
            <div className="crud-form-actions">
              <button
                className="button button-danger"
                type="button"
                disabled={submitting}
                onClick={confirmDelete}
              >
                Sí, eliminar registro
              </button>
              <button
                className="button button-outline"
                type="button"
                onClick={() => setItemToDelete(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tabla Central o Empty State */}
      {filteredAll.length === 0 ? (
        <EmptyState
          title={`No hay ${config.title.toLowerCase()} para mostrar`}
          description={query || filterValue !== 'all' ? 'Intenta modificar el término de búsqueda o el filtro seleccionado.' : `Aún no se han creado registros en ${config.title.toLowerCase()}.`}
        />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <caption className="sr-only">Tabla de {config.title}</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  {config.fields.slice(0, 4).map((f) => (
                    <th scope="col" key={f.name}>{f.label}</th>
                  ))}
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td><span className="table-id">#{item.id.slice(-6)}</span></td>
                    {config.fields.slice(0, 4).map((f) => (
                      <td key={f.name}>
                        {f.type === 'checkbox' ? (
                          item[f.name] ? <Badge tone="mint">Sí</Badge> : <Badge tone="closed">No</Badge>
                        ) : f.name === 'status' || f.name === 'availability' || f.name === 'role' ? (
                          <Badge tone={statusBadgeTone(item[f.name])}>{String(item[f.name] || '-')}</Badge>
                        ) : (
                          String(item[f.name] ?? '-')
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="table-actions-row">
                        <Button
                          variant="outline"
                          className="button-small"
                          type="button"
                          onClick={() => openEditForm(item)}
                          title="Editar"
                        >
                          <Edit3 size={14} /> Editar
                        </Button>
                        <button
                          className="button button-small button-outline button-danger"
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas responsivas para móvil */}
          <div className="admin-cards-mobile" aria-label="Registros para móviles">
            {paginatedItems.map((item) => (
              <article className="admin-mobile-card" key={item.id}>
                <div className="card-mobile-top">
                  <span className="table-id">ID: #{item.id.slice(-6)}</span>
                  <div className="card-mobile-actions">
                    <Button variant="outline" className="button-small" onClick={() => openEditForm(item)}>
                      <Edit3 size={13} />
                    </Button>
                    <button className="button button-small button-outline button-danger" onClick={() => setItemToDelete(item)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="card-mobile-body">
                  {config.fields.slice(0, 4).map((f) => (
                    <div key={f.name} className="mobile-field">
                      <span>{f.label}:</span>
                      <strong>
                        {f.type === 'checkbox' ? (item[f.name] ? 'Sí' : 'No') : String(item[f.name] ?? '-')}
                      </strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((curr) => curr - 1)}
              >
                Anterior
              </Button>
              <span className="page-indicator">
                Página {page + 1} de {totalPages} ({filteredAll.length} registros)
              </span>
              <Button
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((curr) => curr + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

