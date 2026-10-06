import { useEffect, useMemo, useState } from 'react'
import {
  Users, UserCheck, Palette, FileText, CheckCircle2, AlertTriangle, Plus, Search,
  Trash2, Edit3, Filter, ShieldCheck, Clock, Server, ArrowRight, RefreshCw,
  Calendar, Layers, RotateCcw, Eye, ChevronRight, Image, MessageSquare, Award,
  Sparkles, TrendingUp, Check
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import FloatingStars from '../components/FloatingStars'
import RequestsStatusChart from '../components/admin/RequestsStatusChart'
import ArtistsDisciplineChart from '../components/admin/ArtistsDisciplineChart'
import RequestsActivityChart from '../components/admin/RequestsActivityChart'
import { filterRequests, normalizeDisciplineName, isWithinPeriod } from '../utils/adminChartUtils'
import { getArtistOptions } from '../utils/artistFilters'
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService'
import { getArtists, createArtist, updateArtist, deleteArtist } from '../services/artistService'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { getRequests, createRequest, updateRequest, deleteRequest } from '../services/requestService'
import { getPortfolioItems } from '../services/portfolioService'
import { getReports, createReport, updateReport, deleteReport } from '../services/reportService'
import { getMessages } from '../services/messageService'
import { getCommissions } from '../services/commissionService'

const SENSITIVE_KEYS = new Set([
  'password', 'passwordDemo', 'token', 'apiKey', 'api_key', 'secret', 'hash', 'authToken'
])

export function sanitizeAdminItem(item) {
  if (!item || typeof item !== 'object') return item
  const clean = { ...item }
  SENSITIVE_KEYS.forEach((key) => {
    delete clean[key]
  })
  return clean
}

export const ADMIN_PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: 'all', label: 'Todo el periodo' }
]

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
  },
  reportes: {
    title: 'Reportes e Incidencias',
    singularTitle: 'Reporte',
    description: 'Supervisión y resolución de reportes de usuarios, derechos y encargos.',
    fields: [
      { name: 'title', label: 'Título del reporte', type: 'text', required: true },
      { name: 'type', label: 'Tipo de incidencia', type: 'select', options: [
        { value: 'licensing', label: 'Derechos y Licencias' },
        { value: 'delay', label: 'Demora en Entrega' },
        { value: 'copyright', label: 'Propiedad Intelectual' },
        { value: 'conduct', label: 'Conducta o Comunicación' },
        { value: 'other', label: 'Otro' }
      ], required: true },
      { name: 'priority', label: 'Prioridad', type: 'select', options: [
        { value: 'high', label: 'Alta' },
        { value: 'medium', label: 'Media' },
        { value: 'low', label: 'Baja' }
      ], required: true },
      { name: 'status', label: 'Estado', type: 'select', options: [
        { value: 'pending', label: 'Pendiente' },
        { value: 'in_review', label: 'En revisión' },
        { value: 'resolved', label: 'Resuelto' },
        { value: 'dismissed', label: 'Desestimado' }
      ], required: true },
      { name: 'reporterName', label: 'Denunciante', type: 'text', required: true },
      { name: 'reason', label: 'Motivo y observaciones', type: 'textarea' }
    ],
    filterOptions: [
      { value: 'all', label: 'Todos los estados' },
      { value: 'pending', label: 'Pendientes' },
      { value: 'in_review', label: 'En revisión' },
      { value: 'resolved', label: 'Resueltos' },
      { value: 'dismissed', label: 'Desestimados' }
    ],
    filterKey: 'status',
    service: [getReports, createReport, updateReport, deleteReport]
  }
}

function renderStatusBadge(status) {
  if (status === 'completed') {
    return (
      <span className="admin-status-pill status-pill-mint">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>Completada</span>
      </span>
    )
  }
  if (status === 'accepted') {
    return (
      <span className="admin-status-pill status-pill-mint">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>Aceptada</span>
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span className="admin-status-pill status-pill-pink">
        <Clock size={12} aria-hidden="true" />
        <span>En progreso</span>
      </span>
    )
  }
  if (status === 'waitlist') {
    return (
      <span className="admin-status-pill status-pill-violet">
        <Clock size={12} aria-hidden="true" />
        <span>Lista de espera</span>
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="admin-status-pill status-pill-ink">
        <AlertTriangle size={12} aria-hidden="true" />
        <span>Rechazada</span>
      </span>
    )
  }
  if (status === 'open') {
    return (
      <span className="admin-status-pill status-pill-mint">
        <UserCheck size={12} aria-hidden="true" />
        <span>Abierto</span>
      </span>
    )
  }
  if (status === 'closed') {
    return (
      <span className="admin-status-pill status-pill-ink">
        <AlertTriangle size={12} aria-hidden="true" />
        <span>Cerrado</span>
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="admin-status-pill status-pill-yellow">
        <Clock size={12} aria-hidden="true" />
        <span>Pendiente</span>
      </span>
    )
  }
  if (status === 'high') {
    return (
      <span className="admin-status-pill status-pill-ink">
        <AlertTriangle size={12} aria-hidden="true" />
        <span>Alta</span>
      </span>
    )
  }
  if (status === 'medium') {
    return (
      <span className="admin-status-pill status-pill-yellow">
        <Clock size={12} aria-hidden="true" />
        <span>Media</span>
      </span>
    )
  }
  if (status === 'low') {
    return (
      <span className="admin-status-pill status-pill-neutral">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>Baja</span>
      </span>
    )
  }
  if (status === 'resolved') {
    return (
      <span className="admin-status-pill status-pill-mint">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>Resuelto</span>
      </span>
    )
  }
  if (status === 'dismissed') {
    return (
      <span className="admin-status-pill status-pill-neutral">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>Desestimado</span>
      </span>
    )
  }
  if (status === 'cliente') {
    return (
      <span className="admin-status-pill status-pill-violet">
        <Users size={12} aria-hidden="true" />
        <span>Cliente</span>
      </span>
    )
  }
  if (status === 'artista') {
    return (
      <span className="admin-status-pill status-pill-mint">
        <UserCheck size={12} aria-hidden="true" />
        <span>Artista</span>
      </span>
    )
  }
  if (status === 'admin' || status === 'administrador') {
    return (
      <span className="admin-status-pill status-pill-accent">
        <ShieldCheck size={12} aria-hidden="true" />
        <span>Admin</span>
      </span>
    )
  }
  return (
    <span className="admin-status-pill status-pill-neutral">
      <span>{String(status || '-')}</span>
    </span>
  )
}

export function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filtros interactivos del panel y las gráficas
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDiscipline, setFilterDiscipline] = useState('all')

  const loadDashboard = () => {
    setLoading(true)
    Promise.all([
      getUsers(),
      getArtists(),
      getRequests(),
      getCategories(),
      getPortfolioItems().catch(() => []),
      getReports().catch(() => []),
      getMessages().catch(() => [])
    ])
      .then(([users, artists, requests, categories, portfolioItems, reports, messages]) => {
        setData({
          users: Array.isArray(users) ? users.map(sanitizeAdminItem) : [],
          artists: Array.isArray(artists) ? artists.map(sanitizeAdminItem) : [],
          requests: Array.isArray(requests) ? requests.map(sanitizeAdminItem) : [],
          categories: Array.isArray(categories) ? categories.map(sanitizeAdminItem) : [],
          portfolioItems: Array.isArray(portfolioItems) ? portfolioItems.map(sanitizeAdminItem) : [],
          reports: Array.isArray(reports) ? reports.map(sanitizeAdminItem) : [],
          messages: Array.isArray(messages) ? messages.map(sanitizeAdminItem) : []
        })
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let mounted = true
    Promise.all([
      getUsers(),
      getArtists(),
      getRequests(),
      getCategories(),
      getPortfolioItems().catch(() => []),
      getReports().catch(() => []),
      getMessages().catch(() => [])
    ])
      .then(([users, artists, requests, categories, portfolioItems, reports, messages]) => {
        if (!mounted) return
        setData({
          users: Array.isArray(users) ? users.map(sanitizeAdminItem) : [],
          artists: Array.isArray(artists) ? artists.map(sanitizeAdminItem) : [],
          requests: Array.isArray(requests) ? requests.map(sanitizeAdminItem) : [],
          categories: Array.isArray(categories) ? categories.map(sanitizeAdminItem) : [],
          portfolioItems: Array.isArray(portfolioItems) ? portfolioItems.map(sanitizeAdminItem) : [],
          reports: Array.isArray(reports) ? reports.map(sanitizeAdminItem) : [],
          messages: Array.isArray(messages) ? messages.map(sanitizeAdminItem) : []
        })
        setError(null)
      })
      .catch((err) => {
        if (mounted) setError(err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const resetFilters = () => {
    setFilterPeriod('all')
    setFilterStatus('all')
    setFilterDiscipline('all')
  }

  // Fecha de referencia basada en la mayor marca temporal de los datos o la fecha actual
  const referenceDate = useMemo(() => {
    let maxTime = Date.now()
    if (data?.requests) {
      data.requests.forEach((r) => {
        if (r.createdAt) {
          const t = new Date(r.createdAt).getTime()
          if (!isNaN(t) && t > maxTime) maxTime = t
        }
      })
    }
    if (data?.users) {
      data.users.forEach((u) => {
        if (u.createdAt) {
          const t = new Date(u.createdAt).getTime()
          if (!isNaN(t) && t > maxTime) maxTime = t
        }
      })
    }
    return new Date(maxTime)
  }, [data])

  // Solicitudes filtradas dinámicamente según periodo, estado y disciplina para las gráficas
  const filteredRequests = useMemo(() => {
    if (!data) return []
    return filterRequests(data.requests, {
      period: filterPeriod,
      status: filterStatus,
      discipline: filterDiscipline,
      artists: data.artists
    })
  }, [data, filterPeriod, filterStatus, filterDiscipline])

  // Artistas filtrados para la gráfica de disciplinas
  const filteredArtists = useMemo(() => {
    if (!data) return []
    if (filterDiscipline === 'all') return data.artists
    return data.artists.filter((artist) => {
      const disciplines = (artist.disciplines || []).map((d) => normalizeDisciplineName(d))
      return disciplines.includes(filterDiscipline)
    })
  }, [data, filterDiscipline])

  // Disciplinas presentes en los perfiles de artista registrados
  const disciplineOptions = useMemo(() => {
    if (!data) return []
    return getArtistOptions(data.artists, 'disciplines').map(normalizeDisciplineName)
  }, [data])

  // Fecha actual formateada para la cabecera
  const formattedDate = useMemo(() => {
    const d = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date())
    return d.charAt(0).toUpperCase() + d.slice(1)
  }, [])

  if (loading) return <LoadingState label="Cargando panel de control administrativo..." />
  if (error) return <ErrorState message={error.message} onRetry={loadDashboard} />
  if (!data) return null

  // 1. Métricas de Cuentas y Comunidad
  const totalUsers = data.users.length
  const clientsCount = data.users.filter((u) => u.role === 'cliente' || u.role === 'client').length
  const artistsCount = data.artists.length
  const openArtistsCount = data.artists.filter((a) => a.availability === 'open').length
  const newUsersInPeriod = data.users.filter((u) => isWithinPeriod(u.createdAt, filterPeriod, referenceDate)).length

  // 2. Métricas de Solicitudes en el Periodo Seleccionado
  const requestsInPeriod = data.requests.filter((r) => isWithinPeriod(r.createdAt, filterPeriod, referenceDate))
  const requestsCreatedCount = requestsInPeriod.length
  const pendingRequestsCount = requestsInPeriod.filter((r) => r.status === 'pending').length
  const acceptedRequestsCount = requestsInPeriod.filter((r) => r.status === 'accepted').length
  const completedRequestsCount = requestsInPeriod.filter((r) => r.status === 'completed').length

  // 3. Métricas de Calidad, Catálogo e Incidencias
  const reportsList = data.reports || []
  const pendingReportsCount = reportsList.filter((r) => r.status === 'pending').length
  const publishedArtworksCount = (data.portfolioItems || []).length
  const verifiedArtistsCount = data.artists.filter((a) => Boolean(a.verified)).length
  const openReportsCount = reportsList.filter((r) => r.status === 'pending' || r.status === 'in_review').length
  const unreadMessagesCount = (data.messages || []).filter((m) => !m.read).length
  const openIncidentsCount = openReportsCount + unreadMessagesCount

  const recentRequests = [...data.requests].slice(-5).reverse()
  const recentReports = [...reportsList].slice(-4).reverse()

  const currentPeriodLabel = ADMIN_PERIOD_OPTIONS.find((opt) => opt.value === filterPeriod)?.label || 'Todo el periodo'

  const alerts = [
    pendingReportsCount > 0 && {
      tone: 'alert-warning',
      Icon: AlertTriangle,
      title: 'Reportes e incidencias pendientes',
      detail: `Hay ${pendingReportsCount} reporte(s) sin resolver esperando revisión de moderación.`,
    },
    pendingRequestsCount > 0 && {
      tone: 'alert-warning',
      Icon: Clock,
      title: 'Solicitudes pendientes en el periodo',
      detail: `Hay ${pendingRequestsCount} solicitudes esperando confirmación de los artistas.`,
    },
    newUsersInPeriod > 0 && {
      tone: 'alert-info',
      Icon: UserCheck,
      title: 'Nuevos registros en el periodo',
      detail: `${newUsersInPeriod} cuentas nuevas se registraron en el intervalo seleccionado.`,
    },
  ].filter(Boolean)

  return (
    <div className="admin-console-view" aria-labelledby="admin-title">
      <FloatingStars variant="page" />
      {/* 1. Encabezado Superior del Dashboard */}
      <div className="admin-dashboard-hero">
        <div className="admin-hero-text">
          <div className="admin-hero-eyebrow">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Consola Administrativa ArtLink</span>
          </div>
          <h1 id="admin-title">Panel administrativo</h1>
          <p className="admin-subtitle">Supervisión integral de usuarios, solicitudes, obras y reportes</p>
        </div>

        <div className="admin-hero-actions">
          <div className="admin-date-badge" title="Fecha seleccionada del sistema">
            <Calendar size={14} aria-hidden="true" />
            <span>{formattedDate}</span>
          </div>
          <button
            className="button button-outline button-small admin-btn-refresh"
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            aria-label="Actualizar datos del panel"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} aria-hidden="true" />
            <span>Actualizar datos</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Filtro de Periodo de Actividad */}
      <section className="admin-period-control-panel" aria-labelledby="period-filter-heading">
        <div className="period-control-header">
          <div className="period-control-title-wrap">
            <Calendar size={16} aria-hidden="true" />
            <h2 id="period-filter-heading">Periodo de actividad:</h2>
          </div>
          <div className="period-filter-pills" role="radiogroup" aria-label="Seleccionar periodo temporal">
            {ADMIN_PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={filterPeriod === opt.value}
                className={`period-filter-pill ${filterPeriod === opt.value ? 'is-active' : ''}`}
                onClick={() => setFilterPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="period-active-indicator">
            Mostrando datos: <strong>{currentPeriodLabel}</strong>
          </div>
        </div>
      </section>

      {/* 3. Bloque 1 de Métricas: Comunidad y Cuentas (5 Métricas) */}
      <section className="admin-metrics-section" aria-labelledby="metrics-community-heading">
        <div className="section-title-wrap">
          <h3 id="metrics-community-heading" className="admin-section-subtitle">
            <Users size={16} aria-hidden="true" /> Comunidad y Cuentas de ArtLink
          </h3>
          <span className="section-context-badge">Datos en tiempo real</span>
        </div>

        <div className="admin-metrics-5grid" aria-label="Métricas de comunidad y cuentas">
          {/* Métrica 1: Usuarios registrados */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Usuarios registrados</span>
              <span className="admin-metric-status status-positive">
                <CheckCircle2 size={12} aria-hidden="true" />
                <span>Total</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-violet">
                <Users size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{totalUsers}</strong>
            </div>
            <p className="admin-metric-ctx">
              {clientsCount} clientes · {artistsCount} artistas
            </p>
          </article>

          {/* Métrica 2: Clientes activos */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Clientes activos</span>
              <span className="admin-metric-status status-neutral">
                <Users size={12} aria-hidden="true" />
                <span>Demandantes</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-violet">
                <Users size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{clientsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Cuentas habilitadas para encargar obras
            </p>
          </article>

          {/* Métrica 3: Artistas activos */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Artistas activos</span>
              <span className="admin-metric-status status-positive">
                <UserCheck size={12} aria-hidden="true" />
                <span>En catálogo</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-mint">
                <UserCheck size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{artistsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Creadores con perfil público disponible
            </p>
          </article>

          {/* Métrica 4: Artistas con comisiones abiertas */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Artistas con comisiones abiertas</span>
              <span className="admin-metric-status status-positive">
                <Sparkles size={12} aria-hidden="true" />
                <span>Disponibles</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-mint">
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{openArtistsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Con cupos y estado abierto a encargos
            </p>
          </article>

          {/* Métrica 5: Nuevos registros del periodo seleccionado */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Nuevos registros del periodo</span>
              <span className="admin-metric-status status-accent">
                <TrendingUp size={12} aria-hidden="true" />
                <span>{currentPeriodLabel}</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-yellow">
                <TrendingUp size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{newUsersInPeriod}</strong>
            </div>
            <p className="admin-metric-ctx">
              Nuevas altas en el intervalo activo
            </p>
          </article>
        </div>
      </section>

      {/* 4. Bloque 2 de Métricas: Flujo de Solicitudes en el Periodo (4 Métricas) */}
      <section className="admin-metrics-section" aria-labelledby="metrics-requests-heading">
        <div className="section-title-wrap">
          <h3 id="metrics-requests-heading" className="admin-section-subtitle">
            <FileText size={16} aria-hidden="true" /> Flujo Operativo de Solicitudes ({currentPeriodLabel})
          </h3>
          <span className="section-context-badge">Filtrado por periodo</span>
        </div>

        <div className="admin-metrics-4grid" aria-label="Métricas de solicitudes y encargos">
          {/* Métrica 6: Solicitudes creadas */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Solicitudes creadas</span>
              <span className="admin-metric-status status-neutral">
                <FileText size={12} aria-hidden="true" />
                <span>Emitidas</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-yellow">
                <FileText size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{requestsCreatedCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Propuestas enviadas en el periodo
            </p>
          </article>

          {/* Métrica 7: Solicitudes pendientes */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Solicitudes pendientes</span>
              {pendingRequestsCount > 0 ? (
                <span className="admin-metric-status status-warning">
                  <Clock size={12} aria-hidden="true" />
                  <span>Requiere atención</span>
                </span>
              ) : (
                <span className="admin-metric-status status-positive">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  <span>Al día</span>
                </span>
              )}
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-rose">
                <Clock size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{pendingRequestsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Esperando respuesta del artista
            </p>
          </article>

          {/* Métrica 8: Solicitudes aceptadas */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Solicitudes aceptadas</span>
              <span className="admin-metric-status status-positive">
                <CheckCircle2 size={12} aria-hidden="true" />
                <span>En marcha</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-mint">
                <CheckCircle2 size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{acceptedRequestsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Acordadas entre cliente y creador
            </p>
          </article>

          {/* Métrica 9: Solicitudes completadas */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Solicitudes completadas</span>
              <span className="admin-metric-status status-positive">
                <CheckCircle2 size={12} aria-hidden="true" />
                <span>Finalizadas</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-cyan">
                <CheckCircle2 size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{completedRequestsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Obras entregadas con éxito
            </p>
          </article>
        </div>
      </section>

      {/* 5. Bloque 3 de Métricas: Calidad, Catálogo y Moderación (4 Métricas) */}
      <section className="admin-metrics-section" aria-labelledby="metrics-quality-heading">
        <div className="section-title-wrap">
          <h3 id="metrics-quality-heading" className="admin-section-subtitle">
            <AlertTriangle size={16} aria-hidden="true" /> Moderación, Catálogo e Incidencias
          </h3>
          <span className="section-context-badge">Supervisión administrativa</span>
        </div>

        <div className="admin-metrics-4grid" aria-label="Métricas de calidad y supervisión">
          {/* Métrica 10: Reportes pendientes */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Reportes pendientes</span>
              {pendingReportsCount > 0 ? (
                <span className="admin-metric-status status-warning">
                  <AlertTriangle size={12} aria-hidden="true" />
                  <span>Por revisar</span>
                </span>
              ) : (
                <span className="admin-metric-status status-positive">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  <span>Sin reportes</span>
                </span>
              )}
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-rose">
                <AlertTriangle size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{pendingReportsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Incidencias en espera de resolución
            </p>
          </article>

          {/* Métrica 11: Obras publicadas */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Obras publicadas</span>
              <span className="admin-metric-status status-positive">
                <Image size={12} aria-hidden="true" />
                <span>Portafolio</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-violet">
                <Image size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{publishedArtworksCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Piezas en portafolios públicos
            </p>
          </article>

          {/* Métrica 12: Artistas verificados */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Artistas verificados</span>
              <span className="admin-metric-status status-accent">
                <Award size={12} aria-hidden="true" />
                <span>Con insignia</span>
              </span>
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-mint">
                <Award size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{verifiedArtistsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              Creadores destacados con identidad verificada
            </p>
          </article>

          {/* Métrica 13: Mensajes o incidencias abiertas */}
          <article className="admin-metric-card">
            <div className="admin-metric-top">
              <span className="admin-metric-lbl">Mensajes o incidencias abiertas</span>
              {openIncidentsCount > 0 ? (
                <span className="admin-metric-status status-neutral">
                  <MessageSquare size={12} aria-hidden="true" />
                  <span>En curso</span>
                </span>
              ) : (
                <span className="admin-metric-status status-positive">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  <span>Resuelto</span>
                </span>
              )}
            </div>
            <div className="admin-metric-middle">
              <div className="admin-metric-icon metric-icon-yellow">
                <MessageSquare size={22} aria-hidden="true" />
              </div>
              <strong className="admin-metric-val">{openIncidentsCount}</strong>
            </div>
            <p className="admin-metric-ctx">
              {openReportsCount} reporte(s) activos · {unreadMessagesCount} mensaje(s) sin leer
            </p>
          </article>
        </div>
      </section>

      {/* 6. Sección Analítica de Gráficas y Filtros */}
      <section id="reportes-graficas" className="admin-charts-section" aria-labelledby="admin-analytics-title">
        <div className="admin-charts-section-header">
          <div>
            <h2 id="admin-analytics-title">Métricas y Visualizaciones del Sistema</h2>
            <p>Monitoreo cuantitativo de solicitudes, disciplinas artísticas y actividad temporal.</p>
          </div>
          <div className="admin-charts-header-badges">
            <span className="demo-data-badge">
              Base de datos en tiempo real ArtLink
            </span>
          </div>
        </div>

        {/* Barra de Filtros Funcionales para Gráficas */}
        <div className="admin-charts-filters-bar" role="search" aria-label="Filtros para las gráficas analíticas">
          {/* Filtro de Periodo */}
          <div className="chart-filter-item">
            <label htmlFor="filter-chart-period">
              <Calendar size={14} aria-hidden="true" /> Periodo:
            </label>
            <select
              id="filter-chart-period"
              className="chart-filter-select"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              aria-label="Seleccionar periodo temporal para las gráficas"
            >
              {ADMIN_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Estado de Solicitud */}
          <div className="chart-filter-item">
            <label htmlFor="filter-chart-status">
              <Filter size={14} aria-hidden="true" /> Estado:
            </label>
            <select
              id="filter-chart-status"
              className="chart-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filtrar por estado de solicitud"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="waitlist">En lista de espera</option>
              <option value="accepted">Aceptadas</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>

          {/* Filtro de Disciplina */}
          <div className="chart-filter-item">
            <label htmlFor="filter-chart-discipline">
              <Layers size={14} aria-hidden="true" /> Disciplina:
            </label>
            <select
              id="filter-chart-discipline"
              className="chart-filter-select"
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              aria-label="Filtrar por disciplina artística"
            >
              <option value="all">Todas las disciplinas</option>
              {disciplineOptions.map((discipline) => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>
          </div>

          {(filterPeriod !== 'all' || filterStatus !== 'all' || filterDiscipline !== 'all') && (
            <button
              type="button"
              className="chart-filter-reset"
              onClick={resetFilters}
              aria-label="Restablecer todos los filtros a sus valores predeterminados"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Restablecer filtros
            </button>
          )}
        </div>

        {/* Cuadrícula de Gráficas */}
        <div className="admin-charts-grid" aria-label="Cuadrícula de gráficas administrativas">
          <RequestsStatusChart
            requests={filteredRequests}
            loading={loading}
            error={error}
          />
          <ArtistsDisciplineChart
            artists={filteredArtists}
            loading={loading}
            error={error}
          />
          <RequestsActivityChart
            requests={filteredRequests}
            period={filterPeriod}
            loading={loading}
            error={error}
          />
        </div>
      </section>

      {/* 7. Tablas de Solicitudes Recientes y Reportes de Moderación */}
      <div className="admin-dashboard-split-tables">
        {/* Tabla: Solicitudes Recientes */}
        <section className="admin-panel-card admin-recent-table" aria-labelledby="recent-requests-title">
          <div className="panel-card-header">
            <div>
              <h2 id="recent-requests-title">Solicitudes recientes en la plataforma</h2>
              <p className="subtext">Supervisión de los últimos encargos y propuestas registradas.</p>
            </div>
            <Link to="/admin/solicitudes" className="button button-outline button-small">
              Ver todas <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Presupuesto</th>
                  <th>Fecha Estimada</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td><strong>#{req.id.slice(-6)}</strong></td>
                    <td><strong>${req.budget} USD</strong></td>
                    <td>{req.desiredDate || req.createdAt?.slice(0, 10) || '-'}</td>
                    <td>{renderStatusBadge(req.status)}</td>
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

        {/* Tabla: Reportes e Incidencias Recientes */}
        <section className="admin-panel-card admin-recent-table" aria-labelledby="recent-reports-title">
          <div className="panel-card-header">
            <div>
              <h2 id="recent-reports-title">Reportes e incidencias activas</h2>
              <p className="subtext">Casos remitidos para supervisión y moderación.</p>
            </div>
            <Link to="/admin/reportes" className="button button-outline button-small">
              Ver reportes <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Denunciante</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.length > 0 ? (
                  recentReports.map((rep) => (
                    <tr key={rep.id}>
                      <td><strong>#{rep.id.slice(-6)}</strong></td>
                      <td>{rep.type || 'Incidencia'}</td>
                      <td>{rep.reporterName || 'Anónimo'}</td>
                      <td>{renderStatusBadge(rep.priority || 'medium')}</td>
                      <td>{renderStatusBadge(rep.status)}</td>
                      <td>
                        <Link to="/admin/reportes" className="button button-secondary button-small">
                          Revisar
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#6B7280' }}>
                      No hay incidencias reportadas en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 8. Alertas del Sistema y Estado de Infraestructura */}
      <div className="admin-status-row">
        {/* Panel de Alertas */}
        <section className="admin-panel-card" aria-labelledby="alerts-title">
          <div className="panel-card-header">
            <h2 id="alerts-title">
              <AlertTriangle size={18} className="icon-warn" aria-hidden="true" /> Alertas del sistema
            </h2>
            <span className="badge badge-yellow">
              {alerts.length} {alerts.length === 1 ? 'activa' : 'activas'}
            </span>
          </div>
          <div className="alert-list">
            {alerts.length > 0 ? (
              alerts.map(({ tone, Icon, title, detail }) => (
                <div key={title} className={`alert-item ${tone}`}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert-item alert-success">
                <CheckCircle2 size={16} aria-hidden="true" />
                <div>
                  <strong>Sin alertas activas</strong>
                  <p>No hay solicitudes pendientes ni incidencias sin resolver registradas.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Estado de los datos de la plataforma */}
        <section className="admin-panel-card" aria-labelledby="server-status-title">
          <div className="panel-card-header">
            <h2 id="server-status-title">
              <Server size={18} aria-hidden="true" /> Estado de los datos
            </h2>
            <span className={`badge ${totalUsers > 0 ? 'badge-mint' : 'badge-yellow'}`}>
              {totalUsers > 0 ? 'Con registros' : 'Sin registros'}
            </span>
          </div>
          <div className="system-health-grid">
            <div className="health-row">
              <span>Usuarios registrados:</span>
              <strong className={totalUsers > 0 ? 'status-online' : ''}>{totalUsers}</strong>
            </div>
            <div className="health-row">
              <span>Perfiles de artista:</span>
              <strong className={artistsCount > 0 ? 'status-online' : ''}>{artistsCount}</strong>
            </div>
            <div className="health-row">
              <span>Obras en portafolio:</span>
              <strong className={publishedArtworksCount > 0 ? 'status-online' : ''}>{publishedArtworksCount}</strong>
            </div>
            <div className="health-row">
              <span>Solicitudes totales:</span>
              <strong className={data.requests.length > 0 ? 'status-online' : ''}>{data.requests.length}</strong>
            </div>
            <div className="health-row">
              <span>Reportes registrados:</span>
              <strong className={reportsList.length > 0 ? 'status-online' : ''}>{reportsList.length}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* 9. Accesos Rápidos a Recursos */}
      <nav className="admin-links" aria-label="Navegación de recursos administrativos">
        <Link to="/admin/usuarios" className="admin-nav-link">
          <Users size={18} aria-hidden="true" /> Gestionar Usuarios ({data.users.length})
        </Link>
        <Link to="/admin/artistas" className="admin-nav-link">
          <UserCheck size={18} aria-hidden="true" /> Gestionar Artistas ({data.artists.length})
        </Link>
        <Link to="/admin/categorias" className="admin-nav-link">
          <Palette size={18} aria-hidden="true" /> Gestionar Categorías ({data.categories.length})
        </Link>
        <Link to="/admin/solicitudes" className="admin-nav-link">
          <FileText size={18} aria-hidden="true" /> Gestionar Solicitudes ({data.requests.length})
        </Link>
        <Link to="/admin/reportes" className="admin-nav-link">
          <AlertTriangle size={18} aria-hidden="true" /> Gestionar Reportes ({reportsList.length})
        </Link>
      </nav>
    </div>
  )
}

export function AdminResourcePage({ resource }) {
  const config = resourceConfigs[resource] || resourceConfigs.usuarios
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [filterValue, setFilterValue] = useState('all')
  const [editing, setEditing] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
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
        const sanitized = Array.isArray(data) ? data.map(sanitizeAdminItem) : []
        setItems(sanitized)
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let mounted = true
    getAll()
      .then((data) => {
        if (!mounted) return
        const sanitized = Array.isArray(data) ? data.map(sanitizeAdminItem) : []
        setItems(sanitized)
        setError(null)
      })
      .catch((err) => {
        if (mounted) setError(err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [resource, getAll])

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
    setForm(sanitizeAdminItem({ ...item }))
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
      <FloatingStars variant="page" />
      {/* Breadcrumb de navegación */}
      <nav aria-label="Ruta de navegación" className="admin-resource-breadcrumb">
        <Link to="/admin">Panel administrativo</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{config.title}</span>
      </nav>

      {/* Encabezado de la Consola */}
      <div className="admin-header">
        <div>
          <p className="eyebrow">Consola de gestión</p>
          <h1 id="resource-title">{config.title}</h1>
          <p className="admin-subtitle">{config.description}</p>
        </div>
        <Button type="button" onClick={openNewForm}>
          <Plus size={16} aria-hidden="true" /> Agregar {config.singularTitle}
        </Button>
      </div>

      {/* Toolbar con Búsqueda, Filtros y Conteo */}
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
            <Filter size={15} aria-hidden="true" />
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

        <div className="admin-result-count" aria-live="polite">
          {filteredAll.length} {filteredAll.length === 1 ? 'registro encontrado' : 'registros encontrados'}
        </div>
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

      {/* Modal de Detalle / Ver */}
      <Modal open={Boolean(viewingItem)} title={`Detalles de ${config.singularTitle}`} onClose={() => setViewingItem(null)}>
        {viewingItem && (
          <div className="admin-detail-view">
            <div className="detail-meta">
              <span className="table-id">ID: #{viewingItem.id}</span>
            </div>
            <dl className="admin-detail-list">
              {config.fields.map((f) => (
                <div key={f.name} className="detail-row">
                  <dt>{f.label}:</dt>
                  <dd>
                    {f.type === 'checkbox' ? (
                      viewingItem[f.name] ? (
                        <span className="admin-status-badge is-active">
                          <CheckCircle2 size={13} aria-hidden="true" />
                          <span>Activo</span>
                        </span>
                      ) : (
                        <span className="admin-status-badge is-closed">
                          <AlertTriangle size={13} aria-hidden="true" />
                          <span>Inactivo</span>
                        </span>
                      )
                    ) : f.name === 'status' || f.name === 'availability' || f.name === 'role' ? (
                      renderStatusBadge(viewingItem[f.name])
                    ) : (
                      String(viewingItem[f.name] ?? '-')
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="crud-form-actions">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  const itm = viewingItem
                  setViewingItem(null)
                  openEditForm(itm)
                }}
              >
                <Edit3 size={14} aria-hidden="true" /> Editar
              </Button>
              <Button type="button" onClick={() => setViewingItem(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
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
              <caption className="sr-only">Tabla de gestión de {config.title}</caption>
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
                          item[f.name] ? (
                            <span className="admin-status-badge is-active">
                              <CheckCircle2 size={13} aria-hidden="true" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <span className="admin-status-badge is-closed">
                              <AlertTriangle size={13} aria-hidden="true" />
                              <span>Inactivo</span>
                            </span>
                          )
                        ) : f.name === 'status' || f.name === 'availability' || f.name === 'role' ? (
                          renderStatusBadge(item[f.name])
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
                          onClick={() => setViewingItem(item)}
                          title="Ver detalle"
                          aria-label={`Ver detalle de ${item.name || item.title || item.id}`}
                        >
                          <Eye size={14} aria-hidden="true" /> Ver
                        </Button>
                        <Button
                          variant="outline"
                          className="button-small"
                          type="button"
                          onClick={() => openEditForm(item)}
                          title="Editar"
                          aria-label={`Editar ${item.name || item.title || item.id}`}
                        >
                          <Edit3 size={14} aria-hidden="true" /> Editar
                        </Button>
                        <button
                          className="button button-small button-outline button-danger"
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          title="Eliminar"
                          aria-label={`Eliminar ${item.name || item.title || item.id}`}
                        >
                          <Trash2 size={14} aria-hidden="true" /> Eliminar
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
                    <Button
                      variant="outline"
                      className="button-small"
                      onClick={() => setViewingItem(item)}
                      title="Ver"
                      aria-label={`Ver ${item.id}`}
                    >
                      <Eye size={13} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      className="button-small"
                      onClick={() => openEditForm(item)}
                      title="Editar"
                      aria-label={`Editar ${item.id}`}
                    >
                      <Edit3 size={13} aria-hidden="true" />
                    </Button>
                    <button
                      className="button button-small button-outline button-danger"
                      onClick={() => setItemToDelete(item)}
                      title="Eliminar"
                      aria-label={`Eliminar ${item.id}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="card-mobile-body">
                  {config.fields.slice(0, 4).map((f) => (
                    <div key={f.name} className="mobile-field">
                      <span>{f.label}:</span>
                      <div>
                        {f.type === 'checkbox' ? (
                          item[f.name] ? (
                            <span className="admin-status-badge is-active">
                              <CheckCircle2 size={13} aria-hidden="true" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <span className="admin-status-badge is-closed">
                              <AlertTriangle size={13} aria-hidden="true" />
                              <span>Inactivo</span>
                            </span>
                          )
                        ) : f.name === 'status' || f.name === 'availability' || f.name === 'role' ? (
                          renderStatusBadge(item[f.name])
                        ) : (
                          <strong>{String(item[f.name] ?? '-')}</strong>
                        )}
                      </div>
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

