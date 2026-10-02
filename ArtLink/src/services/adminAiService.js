/**
 * Servicio de Asistencia de IA Administrativa para ArtLink.
 * Reutiliza el agente Gemini conectado a través del webhook de N8N (/artlink-chatbot),
 * enriquecido con auditoría de datos, diagnóstico de inconsistencias, explicación
 * de métricas del dashboard y asistencia para la presentación académica.
 *
 * REGLA DE SEGURIDAD:
 * La IA actúa únicamente como asistente de análisis y navegación.
 * No ejecuta modificaciones destructivas ni sensibles automáticamente.
 */

import { getUsers } from './userService'
import { getArtists } from './artistService'
import { getCategories } from './categoryService'
import { getRequests } from './requestService'
import { getPortfolioItems } from './portfolioService'
import { getCommissions } from './commissionService'
import { sendMessageToChatbot, isN8nChatbotConfigured } from './n8nChatService'

/**
 * Valida si un usuario posee el rol exclusivo de administración.
 * Admite 'admin', 'administrator' o 'administrador'.
 *
 * @param {Object} user Objeto de usuario autenticado
 * @returns {boolean}
 */
export function isAdminUser(user) {
  if (!user || !user.role) return false
  const r = String(user.role).trim().toLowerCase()
  return r === 'admin' || r === 'administrator' || r === 'administrador'
}

/**
 * Obtiene una instantánea en tiempo real de todos los recursos del sistema
 * para alimentar los diagnósticos y resúmenes de la IA administrativa.
 */
export async function fetchAdminPlatformData() {
  const [users, artists, categories, requests, portfolioItems, commissions] = await Promise.all([
    getUsers().catch(() => []),
    getArtists().catch(() => []),
    getCategories().catch(() => []),
    getRequests().catch(() => []),
    getPortfolioItems().catch(() => []),
    getCommissions().catch(() => []),
  ])

  return {
    users: Array.isArray(users) ? users : [],
    artists: Array.isArray(artists) ? artists : [],
    categories: Array.isArray(categories) ? categories : [],
    requests: Array.isArray(requests) ? requests : [],
    portfolioItems: Array.isArray(portfolioItems) ? portfolioItems : [],
    commissions: Array.isArray(commissions) ? commissions : [],
    timestamp: new Date().toISOString(),
  }
}

/**
 * Realiza una auditoría heurística de inconsistencias y problemas potenciales
 * en los datos de la plataforma.
 */
export function auditPlatformInconsistencies(data) {
  const { artists = [], portfolioItems = [], commissions = [], requests = [], users = [] } = data

  const issues = []

  // 1. Artistas con portafolio incompleto (menos de 2 obras o sin obras)
  const portfolioCountByArtist = {}
  portfolioItems.forEach((item) => {
    if (item && item.artistId) {
      portfolioCountByArtist[item.artistId] = (portfolioCountByArtist[item.artistId] || 0) + 1
    }
  })

  const artistsWithoutPortfolio = artists.filter((a) => {
    const count = portfolioCountByArtist[a.id] || portfolioCountByArtist[a.userId] || 0
    return count < 2
  })

  if (artistsWithoutPortfolio.length > 0) {
    issues.push({
      id: 'artists-incomplete-portfolio',
      severity: 'warning',
      category: 'Catálogo de Artistas',
      title: 'Artistas con portafolio incompleto',
      description: `Se detectaron ${artistsWithoutPortfolio.length} perfiles de artista con menos de 2 obras registradas en su portafolio.`,
      affectedItems: artistsWithoutPortfolio.map((a) => ({
        id: a.id,
        name: a.displayName || a.name || a.username,
        count: portfolioCountByArtist[a.id] || 0,
      })),
      actionHint: 'Revisar perfiles de creadores en /admin/artistas para verificar sus publicaciones.',
      targetRoute: '/admin/artistas',
    })
  }

  // 2. Comisiones sin precio o sin tiempo de entrega definido
  const commissionsWithoutPrice = commissions.filter(
    (c) => c.price === undefined || c.price === null || Number(c.price) <= 0
  )
  const commissionsWithoutDays = commissions.filter(
    (c) => !c.deliveryDays && !c.turnaroundDays && !c.estimatedDays
  )

  if (commissionsWithoutPrice.length > 0 || commissionsWithoutDays.length > 0) {
    issues.push({
      id: 'commissions-missing-details',
      severity: 'error',
      category: 'Tarifas y Comisiones',
      title: 'Comisiones con precios o plazos indefinidos',
      description: `Hay ${commissionsWithoutPrice.length} comisiones sin precio base válido y ${commissionsWithoutDays.length} sin tiempo de entrega asignado.`,
      affectedCount: commissionsWithoutPrice.length + commissionsWithoutDays.length,
      actionHint: 'Verificar comisiones desde el panel del artista o notificar al creador.',
      targetRoute: '/admin/artistas',
    })
  }

  // 3. Solicitudes pendientes de respuesta
  const pendingRequests = requests.filter((r) => r.status === 'pending')
  if (pendingRequests.length > 0) {
    issues.push({
      id: 'requests-pending-backlog',
      severity: 'info',
      category: 'Flujo de Encargos',
      title: 'Solicitudes en espera de confirmación',
      description: `Existen ${pendingRequests.length} solicitudes en estado pendiente esperando respuesta de los artistas.`,
      affectedCount: pendingRequests.length,
      actionHint: 'Supervisar solicitudes en /admin/solicitudes para evitar demoras en clientes.',
      targetRoute: '/admin/solicitudes',
    })
  }

  // 4. Usuarios inactivos
  const inactiveUsers = users.filter((u) => u.active === false)
  if (inactiveUsers.length > 0) {
    issues.push({
      id: 'users-inactive',
      severity: 'info',
      category: 'Cuentas de Usuario',
      title: 'Usuarios desactivados en el sistema',
      description: `Hay ${inactiveUsers.length} cuentas en estado desactivado en la plataforma.`,
      affectedCount: inactiveUsers.length,
      actionHint: 'Revisar estado de usuarios en /admin/usuarios.',
      targetRoute: '/admin/usuarios',
    })
  }

  return issues
}

/**
 * Genera un resumen analítico local estructurado para responder al administrador
 * en caso de consultas directas, sin conexión a N8N o como base informativa.
 */
export function generateLocalAdminAnalysis(query = '', data = {}) {
  const q = (query || '').toLowerCase()
  const {
    users = [],
    artists = [],
    categories = [],
    requests = [],
    portfolioItems = [],
    commissions = [],
  } = data

  const totalUsers = users.length
  const clientsCount = users.filter((u) => u.role === 'cliente' || u.role === 'client').length
  const artistsCount = users.filter((u) => u.role === 'artista' || u.role === 'artist').length
  const totalArtists = artists.length
  const openArtistsCount = artists.filter((a) => a.availability === 'open').length
  const totalRequests = requests.length
  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length
  const completedRequestsCount = requests.filter((r) => r.status === 'completed').length
  const issues = auditPlatformInconsistencies(data)

  // 1. Resumen para Presentación Académica
  if (
    q.includes('presentacion') ||
    q.includes('presentación') ||
    q.includes('academica') ||
    q.includes('académica') ||
    q.includes('sustentacion') ||
    q.includes('sustentación')
  ) {
    return {
      message:
        `### Resumen Ejecutivo para la Presentación Académica de ArtLink\n\n` +
        `**Propósito del Proyecto:**\n` +
        `ArtLink es una plataforma digital de intermediación especializada en arte digital, concept art, ilustración y modelado 3D, que conecta a clientes con creadores mediante un sistema confiable de encargos, pagos en garantía (escrow) y supervisión en tiempo real.\n\n` +
        `**Métricas Clave del Despliegue:**\n` +
        `- **Usuarios Totales:** ${totalUsers} registrados (${clientsCount} clientes, ${artistsCount} perfiles de artista).\n` +
        `- **Catálogo de Artistas:** ${totalArtists} creadores en catálogo (${openArtistsCount} con cupos abiertos para comisiones inmediatas).\n` +
        `- **Categorías Artísticas:** ${categories.length} disciplinas clasificadas con paletas visuales individuales.\n` +
        `- **Volumen de Solicitudes:** ${totalRequests} encargos procesados en el sistema (${completedRequestsCount} completados satisfactoriamente, ${pendingRequestsCount} en proceso).\n` +
        `- **Obras en Portafolio:** ${portfolioItems.length} piezas digitales indexadas.\n` +
        `- **Tarifas y Comisiones:** ${commissions.length} paquetes de encargo configurados.\n\n` +
        `**Arquitectura Técnica Destacada:**\n` +
        `- **Frontend:** React 19 con arquitectura basada en componentes modulares, diseño neo-brutalista pop-pastel y estilos CSS puros.\n` +
        `- **Persistencia:** API REST simulada con JSON Server (puerto 3000) estructurada en colecciones limpias sin datos quemados.\n` +
        `- **Automatización e IA:** Agente inteligente conectado mediante webhooks de N8N con modelo Gemini para asistencia contextual en lenguaje natural.\n` +
        `- **Seguridad y Control de Acceso:** Sistema de roles jerárquicos (cliente, artista, administrador) con rutas protegidas.\n\n` +
        `*Nota de Seguridad:* Todas las acciones sugeridas por este asistente requieren ejecución manual por el administrador.`,
      actions: [
        { label: 'Ver Métricas del Dashboard', url: '/admin' },
        { label: 'Explorar Catálogo', url: '/explorar' },
      ],
      quickReplies: [
        'Explicar métricas del dashboard',
        'Detectar problemas o inconsistencias',
        'Analizar solicitudes pendientes',
      ],
    }
  }

  // 2. Explicación de Métricas del Dashboard
  if (
    q.includes('metrica') ||
    q.includes('métrica') ||
    q.includes('dashboard') ||
    q.includes('explicar') ||
    q.includes('grafica') ||
    q.includes('gráfica')
  ) {
    return {
      message:
        `### Explicación de las Métricas del Dashboard Administrativo\n\n` +
        `**1. Usuarios registrados (${totalUsers}):**\n` +
        `Mide la base total de cuentas creadas en ArtLink. Incluye tanto clientes contratantes (${clientsCount}) como perfiles registrados con rol artista (${artistsCount}).\n\n` +
        `**2. Artistas activos (${totalArtists}):**\n` +
        `Representa los perfiles públicos publicados en el catálogo de exploración. De ellos, **${openArtistsCount}** tienen disponibilidad 'Abierto' y slots libres para recibir encargos.\n\n` +
        `**3. Solicitudes enviadas (${totalRequests}):**\n` +
        `Contabiliza todos los encargos formulados por clientes en la plataforma, abarcando solicitudes pendientes, aceptadas, en progreso y finalizadas.\n\n` +
        `**4. Solicitudes pendientes (${pendingRequestsCount}):**\n` +
        `Indica las solicitudes que aún no han sido aceptadas o rechazadas por los artistas. Un número bajo o en cero refleja un flujo ágil sin solicitudes atascadas.\n\n` +
        `**5. Gráficas de Análisis:**\n` +
        `- *Distribución por estado:* Muestra en qué etapa del embudo de comisiones se encuentran los encargos.\n` +
        `- *Artistas por disciplina:* Revela la oferta artística según categorías (ilustración, cómic, 3D, etc.).\n` +
        `- *Actividad cronológica:* Rastrea la tendencia temporal en periodos de 7 días, 30 días o histórico anual.`,
      actions: [
        { label: 'Ir al Dashboard', url: '/admin' },
        { label: 'Ver Solicitudes', url: '/admin/solicitudes' },
      ],
      quickReplies: [
        'Resumir estado general',
        'Detectar problemas de datos',
        'Sugerir acciones recomendadas',
      ],
    }
  }

  // 3. Detección de Problemas o Inconsistencias
  if (
    q.includes('inconsistencia') ||
    q.includes('problema') ||
    q.includes('error') ||
    q.includes('portafolio') ||
    q.includes('precio') ||
    q.includes('auditar') ||
    q.includes('auditoria')
  ) {
    let msg = `### Auditoría de Inconsistencias en la Plataforma\n\n`
    if (issues.length === 0) {
      msg += `No se detectaron inconsistencias críticas en este momento. Todos los perfiles, solicitudes y paquetes de comisiones cumplen los requisitos establecidos.\n\n`
    } else {
      msg += `Se identificaron **${issues.length} observaciones** que requieren atención administrativa:\n\n`
      issues.forEach((issue, idx) => {
        msg += `**${idx + 1}. ${issue.title}** (${issue.category}):\n`
        msg += `${issue.description}\n`
        msg += `*Sugerencia:* ${issue.actionHint}\n\n`
      })
    }
    msg += `*Control Administrativo:* Para corregir o actualizar cualquier registro, dirígete a las secciones correspondientes de la consola.`

    return {
      message: msg,
      actions: [
        { label: 'Gestionar Artistas', url: '/admin/artistas' },
        { label: 'Gestionar Solicitudes', url: '/admin/solicitudes' },
        { label: 'Gestionar Usuarios', url: '/admin/usuarios' },
      ],
      quickReplies: [
        'Resumir estado general',
        'Analizar solicitudes pendientes',
        'Sugerir acciones recomendadas',
      ],
    }
  }

  // 4. Analizar Solicitudes Pendientes
  if (
    q.includes('solicitud') ||
    q.includes('solicitudes') ||
    q.includes('pendiente') ||
    q.includes('encargo')
  ) {
    const pendingList = requests.filter((r) => r.status === 'pending')
    let msg = `### Análisis de Solicitudes en ArtLink\n\n`
    msg += `- **Total de solicitudes registradas:** ${totalRequests}\n`
    msg += `- **Pendientes de confirmación:** ${pendingRequestsCount}\n`
    msg += `- **Finalizadas exitosamente:** ${completedRequestsCount}\n\n`

    if (pendingList.length > 0) {
      msg += `**Detalle de solicitudes pendientes:**\n`
      pendingList.slice(0, 5).forEach((req) => {
        msg += `- **Encargo #${String(req.id).slice(-6)}**: Presupuesto $${req.budget || 0} USD, fecha estimada: ${req.desiredDate || 'No indicada'}.\n`
      })
      msg += `\n*Recomendación:* Se aconseja supervisar que los artistas respondan oportunamente para evitar cancelaciones.`
    } else {
      msg += `Actualmente no hay solicitudes pendientes en cola. El flujo transaccional se encuentra completamente al día.`
    }

    return {
      message: msg,
      actions: [{ label: 'Revisar Solicitudes', url: '/admin/solicitudes' }],
      quickReplies: [
        'Resumir estado general',
        'Detectar problemas de datos',
        'Explicar métricas del dashboard',
      ],
    }
  }

  // 5. Sugerir Acciones Administrativas
  if (
    q.includes('accion') ||
    q.includes('acción') ||
    q.includes('acciones') ||
    q.includes('sugerir') ||
    q.includes('recomendar')
  ) {
    return {
      message:
        `### Sugerencias de Acciones Administrativas\n\n` +
        `Basado en el estado actual de la plataforma, te sugiero las siguientes acciones preventivas y de optimización:\n\n` +
        `1. **Supervisión de Solicitudes:** Monitorear las ${pendingRequestsCount} solicitudes pendientes para asegurar que los artistas las atiendan antes de su fecha límite.\n` +
        `2. **Calidad del Catálogo:** Promover que los artistas completen su portafolio con al menos 3 piezas digitales representativas de su disciplina.\n` +
        `3. **Equilibrio de Disciplinas:** Revisar las categorías con menor número de artistas para impulsar convocatorias en ilustración o modelado 3D.\n` +
        `4. **Mantenimiento de Usuarios:** Verificar periódicamente que las cuentas activas mantengan datos de contacto válidos.\n\n` +
        `*Recuerda:* La IA no ejecuta cambios de forma autónoma. Todas las operaciones deben ser autorizadas por ti desde el panel.`,
      actions: [
        { label: 'Panel Principal', url: '/admin' },
        { label: 'Ver Artistas', url: '/admin/artistas' },
        { label: 'Ver Solicitudes', url: '/admin/solicitudes' },
      ],
      quickReplies: [
        'Resumen para presentación académica',
        'Detectar problemas o inconsistencias',
        'Resumir estado general',
      ],
    }
  }

  // 6. Resumen General del Estado (Default)
  return {
    message:
      `### Estado General de la Plataforma ArtLink\n\n` +
      `Bienvenido a la consola de supervisión. Aquí tienes el balance actual del sistema:\n\n` +
      `- **Usuarios Registrados:** ${totalUsers} (${clientsCount} clientes, ${artistsCount} artistas).\n` +
      `- **Artistas en Catálogo:** ${totalArtists} creadores (${openArtistsCount} disponibles con cupos abiertos).\n` +
      `- **Categorías Artísticas:** ${categories.length} disciplinas configuradas.\n` +
      `- **Solicitudes y Encargos:** ${totalRequests} totales (${pendingRequestsCount} pendientes, ${completedRequestsCount} finalizadas).\n` +
      `- **Portafolio Indexado:** ${portfolioItems.length} obras digitales.\n` +
      `- **Servicios Conectados:** API REST (JSON Server :3000), Agente Gemini (N8N :5678) y Proxy de Vite activos.\n\n` +
      `¿En qué área requieres asistencia hoy?`,
    actions: [
      { label: 'Dashboard', url: '/admin' },
      { label: 'Usuarios', url: '/admin/usuarios' },
      { label: 'Artistas', url: '/admin/artistas' },
      { label: 'Solicitudes', url: '/admin/solicitudes' },
      { label: 'Categorías', url: '/admin/categorias' },
    ],
    quickReplies: [
      'Explicar métricas del dashboard',
      'Detectar problemas o inconsistencias',
      'Analizar solicitudes pendientes',
      'Resumen para presentación académica',
    ],
  }
}


/**
 * Envía una consulta administrativa al webhook dedicado de N8N (/artlink-admin-assistant).
 * N8N valida el rol administrativo y ejecuta el Agente de IA con Gemini con contexto enriquecido.
 * No expone ninguna API key ni secreto en el frontend.
 *
 * @param {Object} params
 * @param {string} params.message
 * @param {Object} params.user
 * @param {Object} params.platformData
 * @param {Array} [params.history]
 * @param {AbortSignal} [params.signal]
 * @param {number} [params.timeoutMs]
 * @returns {Promise<Object>}
 */
export async function sendAdminAiQueryToN8n({
  message,
  user,
  platformData,
  history = [],
  signal,
  timeoutMs = 25000,
}) {
  const trimmed = (message || '').trim()
  if (!trimmed) {
    throw new Error('Debes proporcionar una consulta válida.')
  }

  const issues = auditPlatformInconsistencies(platformData || {})
  const platformSummary = {
    usersCount: platformData?.users?.length || 0,
    artistsCount: platformData?.artists?.length || 0,
    categoriesCount: platformData?.categories?.length || 0,
    requestsCount: platformData?.requests?.length || 0,
    pendingRequestsCount: (platformData?.requests || []).filter((r) => r.status === 'pending').length,
    issuesCount: issues.length,
  }

  const payload = {
    message: trimmed,
    userId: user?.id || 'admin-1',
    userName: user?.name || user?.email || 'Administrador ArtLink',
    role: user?.role || 'admin',
    sessionId: `admin-session-${user?.id || 'admin'}`,
    conversationId: `admin-convo-${user?.id || 'admin'}`,
    page: typeof window !== 'undefined' ? window.location.pathname : '/admin',
    platformSummary,
    history: (history || []).slice(-8).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: (h.content || '').slice(0, 1500),
    })),
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId)
      const err = new Error('Operación cancelada por el usuario.')
      err.name = 'AbortError'
      throw err
    }
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId)
        controller.abort()
      },
      { once: true }
    )
  }

  // Rutas candidatas: primero el proxy de Vite, luego la URL absoluta local
  const candidateUrls = [
    '/n8n-proxy/webhook/artlink-admin-assistant',
    'http://localhost:5678/webhook/artlink-admin-assistant',
  ]

  let lastError = null
  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 403) {
        const errJson = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errJson.message || 'Acceso denegado: se requiere rol de administrador autenticado.',
          errorCode: 'FORBIDDEN',
          provider: 'n8n-guard',
          actions: [{ label: 'Iniciar sesión como Administrador', url: '/login' }],
          quickReplies: [],
        }
      }

      if (response.ok) {
        const data = await response.json()
        if (data && data.success && data.message) {
          const localTemplate = generateLocalAdminAnalysis(trimmed, platformData)
          return {
            success: true,
            message: data.message,
            actions: Array.isArray(data.actions) && data.actions.length > 0
              ? data.actions
              : (localTemplate.actions || []),
            quickReplies: Array.isArray(data.quickReplies) && data.quickReplies.length > 0
              ? data.quickReplies
              : (localTemplate.quickReplies || []),
            provider: 'gemini-n8n',
            model: data.model || 'gemini-3.1-flash-lite',
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        clearTimeout(timeoutId)
        throw err
      }
      lastError = err
    }
  }

  clearTimeout(timeoutId)
  throw lastError || new Error('No se pudo conectar con el webhook del asistente administrativo en N8N.')
}

/**
 * Procesa una consulta dirigida al Asistente de IA Administrativo.
 * Flujo:
 * React -> POST Webhook N8N (/artlink-admin-assistant) -> Validación de rol -> Agente Gemini N8N -> React
 * Si N8N no está en ejecución, activa respaldo analítico local.
 *
 * @param {Object} params
 * @param {string} params.message Consulta en lenguaje natural
 * @param {Array} [params.history] Historial previo
 * @param {Object} [params.user] Usuario actual autenticado
 * @param {AbortSignal} [params.signal] Señal de cancelación
 * @returns {Promise<Object>}
 */
export async function sendAdminAiQuery({ message, history = [], user, signal }) {
  if (!isAdminUser(user)) {
    return {
      success: false,
      message: 'Acceso restringido: Esta herramienta de análisis está reservada exclusivamente para administradores de ArtLink.',
      errorCode: 'FORBIDDEN',
      actions: [],
      quickReplies: [],
    }
  }

  const trimmed = (message || '').trim()
  if (!trimmed) {
    return {
      success: false,
      message: 'Por favor escribe una consulta o selecciona una de las acciones rápidas sugeridas.',
      errorCode: 'EMPTY_QUERY',
      actions: [],
      quickReplies: [],
    }
  }

  // 1. Obtener datos actuales de la plataforma para enriquecer el contexto administrativo
  let platformData = { users: [], artists: [], categories: [], requests: [], portfolioItems: [], commissions: [] }
  try {
    platformData = await fetchAdminPlatformData()
  } catch (err) {
    console.warn('No se pudo cargar la instantánea completa para el prompt del admin:', err?.message)
  }

  // 2. Intentar consultar el Agente de IA Administrativo a través del webhook de N8N
  if (isN8nChatbotConfigured()) {
    try {
      const n8nAdminResult = await sendAdminAiQueryToN8n({
        message: trimmed,
        user,
        platformData,
        history,
        signal,
      })

      if (n8nAdminResult && n8nAdminResult.message) {
        return n8nAdminResult
      }
    } catch (n8nError) {
      if (n8nError.name === 'AbortError') throw n8nError
      console.warn('El webhook administrativo de N8N no respondió en tiempo, recurriendo al análisis local:', n8nError?.message)
    }
  }

  // 3. Si N8N no está disponible o devolvió fallback, responder con el análisis estructurado local
  const localAnalysis = generateLocalAdminAnalysis(trimmed, platformData)
  return {
    success: true,
    message: localAnalysis.message,
    provider: 'local-analytics',
    actions: localAnalysis.actions || [],
    quickReplies: localAnalysis.quickReplies || [],
  }
}

