import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, CartesianGrid, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService'
import { getArtists, createArtist, updateArtist, deleteArtist } from '../services/artistService'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { getRequests, createRequest, updateRequest, deleteRequest } from '../services/requestService'

const configs = {
  usuarios: { title: 'Usuarios', key: 'users', fields: ['name', 'email', 'role', 'active'], service: [getUsers, createUser, updateUser, deleteUser] },
  artistas: { title: 'Artistas', key: 'artistProfiles', fields: ['displayName', 'username', 'location', 'availability', 'basePrice'], service: [getArtists, createArtist, updateArtist, deleteArtist] },
  categorias: { title: 'Categorías', key: 'categories', fields: ['name', 'slug', 'color'], service: [getCategories, createCategory, updateCategory, deleteCategory] },
  solicitudes: { title: 'Solicitudes', key: 'requests', fields: ['clientId', 'artistId', 'budget', 'status', 'desiredDate'], service: [getRequests, createRequest, updateRequest, deleteRequest] },
}

export function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => { Promise.all([getUsers(), getArtists(), getRequests(), getCategories()]).then(([users, artists, requests, categories]) => setData({ users, artists, requests, categories })).catch(setError) }, [])
  if (error) return <ErrorState message={error.message} />
  if (!data) return <LoadingState label="Cargando panel administrativo" />
  const statusData = Object.entries(data.requests.reduce((counts, request) => ({ ...counts, [request.status]: (counts[request.status] || 0) + 1 }), {})).map(([name, total]) => ({ name, total }))
  return <section className="admin-page" aria-labelledby="admin-title"><p className="eyebrow">ArtLink / administración</p><h1 id="admin-title">Estado general de la plataforma</h1><div className="admin-metrics"><Metric title="Usuarios registrados" value={data.users.length} /><Metric title="Artistas activos" value={data.artists.length} /><Metric title="Solicitudes enviadas" value={data.requests.length} /><Metric title="Solicitudes pendientes" value={data.requests.filter((request) => request.status === 'pending').length} /></div><div className="admin-charts"><section className="chart-card" aria-labelledby="chart-status-title"><h2 id="chart-status-title">Solicitudes por estado</h2><ResponsiveContainer width="100%" height={260}><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#8B5CF6" /></BarChart></ResponsiveContainer></section><section className="chart-card" aria-labelledby="chart-platform-title"><h2 id="chart-platform-title">Uso del catálogo</h2><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={[{ name: 'Artistas', value: data.artists.length }, { name: 'Categorías', value: data.categories.length }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{['#8B5CF6', '#2DD4BF'].map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></section></div><nav className="admin-links" aria-label="Administración"><Link to="/admin/usuarios">Gestionar usuarios</Link><Link to="/admin/artistas">Gestionar artistas</Link><Link to="/admin/categorias">Gestionar categorías</Link><Link to="/admin/solicitudes">Gestionar solicitudes</Link></nav></section>
}

export function AdminResourcePage({ resource }) {
  const config = configs[resource]
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 8
  const [getAll, create, update, remove] = config.service
  useEffect(() => { getAll().then(setItems).catch(setError).finally(() => setLoading(false)) }, [getAll])
  const filtered = useMemo(() => items.filter((item) => JSON.stringify(item).toLocaleLowerCase().includes(query.toLocaleLowerCase())).slice(page * pageSize, (page + 1) * pageSize), [items, query, page])
  function begin(item) { setEditing(item); setForm(item || Object.fromEntries(config.fields.map((field) => [field, '']))) }
  async function submit(event) { event.preventDefault(); try { const saved = editing ? await update(editing.id, form) : await create(form); setItems((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]); setEditing(null); setNotice('Cambios guardados correctamente.'); setError(null) } catch (saveError) { setError(saveError) } }
  async function destroy(item) { if (!window.confirm(`¿Eliminar este registro de ${config.title}?`)) return; try { await remove(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); setNotice('Registro eliminado.'); setError(null) } catch (removeError) { setError(removeError) } }
  if (loading) return <LoadingState label={`Cargando ${config.title.toLocaleLowerCase()}`} />
  if (error && !items.length) return <ErrorState message={error.message} />
  return <section className="admin-page" aria-labelledby="resource-title"><Link className="back-link" to="/admin">Volver al dashboard</Link><p className="eyebrow">CRUD administrativo</p><h1 id="resource-title">{config.title}</h1><div className="admin-toolbar"><label htmlFor="admin-search">Buscar<span className="sr-only"> en {config.title}</span><input id="admin-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="Buscar..." /></label><Button type="button" onClick={() => begin(null)}>Nuevo registro</Button></div>{notice && <p className="success-message" role="status">{notice}</p>}{error && <p className="form-message form-error" role="alert">{error.message}</p>}{editing && <form className="admin-form" onSubmit={submit}>{config.fields.map((field) => <label key={field} htmlFor={`admin-${field}`}>{field}<input id={`admin-${field}`} value={form[field] ?? ''} onChange={(event) => setForm({ ...form, [field]: event.target.value })} required={field !== 'active'} /></label>)}<Button type="submit">Guardar</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button></form>}{items.length === 0 ? <EmptyState title="No hay registros" description="Crea el primer registro para este recurso." /> : <div className="admin-table-wrap"><table className="admin-table"><caption className="sr-only">Tabla de {config.title}</caption><thead><tr>{config.fields.map((field) => <th scope="col" key={field}>{field}</th>)}<th scope="col">Acciones</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}>{config.fields.map((field) => <td key={field}>{typeof item[field] === 'boolean' ? item[field] ? 'Sí' : 'No' : String(item[field] ?? '-')}</td>)}<td><Button variant="outline" type="button" onClick={() => begin(item)}>Editar</Button><Button variant="secondary" type="button" onClick={() => destroy(item)}>Eliminar</Button></td></tr>)}</tbody></table></div>}<div className="pagination"><Button variant="outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Anterior</Button><span>Página {page + 1}</span><Button variant="outline" disabled={(page + 1) * pageSize >= items.filter((item) => JSON.stringify(item).toLocaleLowerCase().includes(query.toLocaleLowerCase())).length} onClick={() => setPage((current) => current + 1)}>Siguiente</Button></div></section>
}

function Metric({ title, value }) { return <article className="admin-metric"><span>{title}</span><strong>{value}</strong></article> }
