/**
 * Utilidades para el procesamiento, filtrado y accesibilidad de las gráficas
 * del Panel Administrativo de ArtLink.
 * 
 * Regla de conteo de disciplinas:
 * Cada disciplina registrada en el perfil de un artista suma 1 mención a la oferta
 * global de habilidades de la plataforma. De esta manera, los artistas multidisciplinarios
 * quedan justamente representados en cada categoría que ofrecen sin invisibilizar especialidades.
 */

// Paleta oficial de ArtLink
export const ARTLINK_PALETTE = {
  violet: '#8B5CF6',
  pink: '#EC4899',
  mint: '#10B981',
  yellow: '#F59E0B',
  ink: '#1E192B',
  cyan: '#2DD4BF',
  indigo: '#6366F1',
  rose: '#F43F5E',
  blue: '#3B82F6',
  amber: '#D97706',
  emerald: '#059669',
  gray: '#6B7280'
}

// Configuración de los 6 estados obligatorios de solicitudes
export const REQUEST_STATUS_CONFIG = {
  pending: { label: 'Pendientes', color: ARTLINK_PALETTE.yellow, order: 1 },
  waitlist: { label: 'En lista de espera', color: ARTLINK_PALETTE.violet, order: 2 },
  accepted: { label: 'Aceptadas', color: ARTLINK_PALETTE.mint, order: 3 },
  in_progress: { label: 'En progreso', color: ARTLINK_PALETTE.pink, order: 4 },
  completed: { label: 'Completadas', color: ARTLINK_PALETTE.cyan, order: 5 },
  rejected: { label: 'Rechazadas', color: ARTLINK_PALETTE.ink, order: 6 }
}

// Colores asignados para las disciplinas obligatorias y existentes
export const DISCIPLINE_COLORS = {
  'Ilustración 2D': ARTLINK_PALETTE.violet,
  'Modelado 3D': ARTLINK_PALETTE.pink,
  'Animación': ARTLINK_PALETTE.mint,
  'Pixel Art': ARTLINK_PALETTE.yellow,
  'Emotes': ARTLINK_PALETTE.cyan,
  'Concept Art': ARTLINK_PALETTE.indigo,
  'Retrato': ARTLINK_PALETTE.rose,
  'Diseño de personajes': ARTLINK_PALETTE.blue,
  'Fondos y escenarios': ARTLINK_PALETTE.emerald,
  'Arte 3D': '#A855F7',
  'Render': ARTLINK_PALETTE.amber,
  'Otras': ARTLINK_PALETTE.ink
}

/**
 * Normaliza nombres de disciplinas a estándares legibles
 */
export function normalizeDisciplineName(name = '') {
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()
  if (lower === 'ilustración 2d' || lower === 'ilustracion 2d') return 'Ilustración 2D'
  if (lower === 'modelado 3d') return 'Modelado 3D'
  if (lower === 'animación' || lower === 'animacion') return 'Animación'
  if (lower === 'pixel art') return 'Pixel Art'
  if (lower === 'emotes' || lower === 'emote') return 'Emotes'
  if (lower === 'concept art') return 'Concept Art'
  if (lower === 'retrato') return 'Retrato'
  if (lower === 'diseño de personajes' || lower === 'diseno de personajes') return 'Diseño de personajes'
  if (lower === 'fondos y escenarios' || lower === 'fondos y escenarios') return 'Fondos y escenarios'
  if (lower === 'arte 3d') return 'Arte 3D'
  if (lower === 'render') return 'Render'
  if (lower === 'ilustración' || lower === 'ilustracion' || lower === 'ilustración editorial') return 'Ilustración 2D'
  return trimmed || 'Otras disciplinas'
}

/**
 * Filtra la lista de solicitudes por periodo, estado y disciplina.
 */
export function filterRequests(requests = [], { period = 'all', status = 'all', discipline = 'all', artists = [] } = {}) {
  if (!Array.isArray(requests)) return []

  // Mapa de artistas para lookup rápido de disciplinas
  const artistsById = new Map()
  artists.forEach(a => {
    if (a && a.id) artistsById.set(a.id, a)
  })

  // Obtener fecha de referencia: la fecha más reciente de los datos o hoy
  let maxTime = Date.now()
  requests.forEach(r => {
    if (r.createdAt) {
      const t = new Date(r.createdAt).getTime()
      if (!isNaN(t) && t > maxTime) maxTime = t
    }
  })
  const referenceDate = new Date(maxTime)

  return requests.filter(req => {
    // 1. Filtro por Estado
    if (status !== 'all' && req.status !== status) {
      return false
    }

    // 2. Filtro por Periodo
    if (period !== 'all' && req.createdAt) {
      const reqDate = new Date(req.createdAt)
      if (!isNaN(reqDate.getTime())) {
        const diffMs = referenceDate.getTime() - reqDate.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        if (period === '7d' && diffDays > 7) return false
        if (period === '30d' && diffDays > 30) return false
        if (period === '12m' && diffDays > 365) return false
      }
    }

    // 3. Filtro por Disciplina
    if (discipline !== 'all') {
      const artist = artistsById.get(req.artistId)
      if (artist && Array.isArray(artist.disciplines)) {
        const normalizedList = artist.disciplines.map(d => normalizeDisciplineName(d))
        if (!normalizedList.includes(discipline)) {
          return false
        }
      } else {
        return false
      }
    }

    return true
  })
}

/**
 * Calcula las solicitudes agrupadas por estado (garantizando los 6 estados obligatorios)
 */
export function computeRequestsByStatus(requests = []) {
  const counts = {
    pending: 0,
    waitlist: 0,
    accepted: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0
  }

  requests.forEach(r => {
    if (counts[r.status] !== undefined) {
      counts[r.status] += 1
    } else if (r.status === 'in_review') {
      counts.pending += 1
    }
  })

  const total = requests.length

  const data = Object.keys(REQUEST_STATUS_CONFIG)
    .sort((a, b) => REQUEST_STATUS_CONFIG[a].order - REQUEST_STATUS_CONFIG[b].order)
    .map(key => {
      const cfg = REQUEST_STATUS_CONFIG[key]
      const count = counts[key]
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
      return {
        key,
        name: cfg.label,
        total: count,
        color: cfg.color,
        percentage: `${percentage}%`
      }
    })

  return { data, total }
}

/**
 * Genera el resumen textual accesible de las solicitudes por estado.
 */
export function generateStatusAccessibleSummary(statusData = [], total = 0) {
  if (total === 0) {
    return 'No se encontraron solicitudes registradas con los filtros seleccionados.'
  }

  const parts = statusData
    .filter(item => item.total > 0)
    .map(item => `${item.total} ${item.name.toLowerCase()}`)

  if (parts.length === 0) {
    return `Se registraron ${total} solicitudes en total.`
  }

  const formattedList = parts.length === 1
    ? parts[0]
    : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`

  return `Se registraron ${total} ${total === 1 ? 'solicitud' : 'solicitudes'}: ${formattedList}.`
}

/**
 * Calcula artistas agrupados por disciplina aplicando la regla documentada:
 * Cada disciplina que el artista ofrece en su perfil cuenta 1 vez hacia el total de la plataforma.
 */
export function computeArtistsByDiscipline(artists = []) {
  const counts = {}

  let totalMentions = 0
  const uniqueArtists = Array.isArray(artists) ? artists.length : 0

  if (Array.isArray(artists)) {
    artists.forEach(artist => {
      if (Array.isArray(artist.disciplines)) {
        artist.disciplines.forEach(disc => {
          const norm = normalizeDisciplineName(disc)
          counts[norm] = (counts[norm] || 0) + 1
          totalMentions += 1
        })
      }
    })
  }

  // Lista obligatoria de disciplinas para presentación
  const mandatoryOrder = [
    'Ilustración 2D',
    'Modelado 3D',
    'Animación',
    'Pixel Art',
    'Emotes',
    'Concept Art'
  ]

  const items = []
  let otherCount = 0

  Object.entries(counts).forEach(([discipline, count]) => {
    if (mandatoryOrder.includes(discipline)) {
      items.push({
        name: discipline,
        value: count,
        color: DISCIPLINE_COLORS[discipline] || ARTLINK_PALETTE.violet
      })
    } else {
      otherCount += count
    }
  })

  // Asegura que las 6 disciplinas obligatorias figuren en el resultado
  mandatoryOrder.forEach(m => {
    if (!items.find(i => i.name === m)) {
      items.push({
        name: m,
        value: 0,
        color: DISCIPLINE_COLORS[m]
      })
    }
  })

  if (otherCount > 0) {
    items.push({
      name: 'Otras disciplinas',
      value: otherCount,
      color: DISCIPLINE_COLORS['Otras']
    })
  }

  // Ordenar: primero las que tienen valor, preservando el orden estético
  items.sort((a, b) => b.value - a.value)

  // Calcular porcentajes
  const data = items.map(item => ({
    ...item,
    percentage: totalMentions > 0 ? ((item.value / totalMentions) * 100).toFixed(1) + '%' : '0.0%'
  }))

  return { data, totalMentions, uniqueArtists }
}

/**
 * Genera el resumen textual accesible de disciplinas.
 */
export function generateDisciplineAccessibleSummary(disciplineData = [], totalMentions = 0, uniqueArtists = 0) {
  if (totalMentions === 0 || uniqueArtists === 0) {
    return 'No hay perfiles de artistas registrados actualmente.'
  }

  const active = disciplineData.filter(d => d.value > 0)
  const detail = active.map(d => `${d.value} en ${d.name}`).join(', ')

  return `Se contabilizan ${totalMentions} especialidades activas entre ${uniqueArtists} artistas registrados (${detail}). Los creadores multidisciplinarios aportan a cada disciplina que dominan.`
}

/**
 * Agrupa solicitudes en periodos cronológicos usando `createdAt`.
 */
export function computeRequestsActivity(requests = [], period = 'all') {
  if (!Array.isArray(requests) || requests.length === 0) {
    return { data: [], total: 0, peakLabel: 'Sin datos' }
  }

  // Agrupamiento por mes si el periodo es 'all' o '12m', o por fecha si es '7d' o '30d'
  const isDaily = period === '7d' || period === '30d'

  const map = new Map()

  // Ordenar solicitudes por fecha ascendente
  const sorted = [...requests]
    .filter(r => r.createdAt && !isNaN(new Date(r.createdAt).getTime()))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  sorted.forEach(req => {
    const d = new Date(req.createdAt)
    const key = isDaily
      ? d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
      : d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '').replace(/^\w/, c => c.toUpperCase())

    map.set(key, (map.get(key) || 0) + 1)
  })

  let peakCount = 0
  let peakLabel = ''

  const data = Array.from(map.entries()).map(([dateLabel, cantidad]) => {
    if (cantidad > peakCount) {
      peakCount = cantidad
      peakLabel = dateLabel
    }
    return {
      date: dateLabel,
      cantidad
    }
  })

  return {
    data,
    total: requests.length,
    peakLabel: peakLabel || 'N/A',
    peakCount
  }
}

/**
 * Genera el resumen textual accesible de actividad temporal.
 */
export function generateActivityAccessibleSummary(activityData = [], total = 0, peakLabel = '') {
  if (total === 0 || activityData.length === 0) {
    return 'No se registran solicitudes para el periodo de tiempo seleccionado.'
  }

  return `Actividad de ${total} solicitudes a lo largo de ${activityData.length} intervalos de tiempo, con el mayor volumen de creación registrado en ${peakLabel}.`
}
