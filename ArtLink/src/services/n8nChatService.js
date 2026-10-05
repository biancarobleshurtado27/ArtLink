/**
 * Servicio de conexión entre el Chatbot de ArtLink y el Webhook de N8N del Agente Gemini.
 * La clave de Gemini reside EXCLUSIVAMENTE en N8N.
 * Este cliente React nunca manipula ni contiene la API key.
 */

const FALLBACK_MESSAGE = 'Respuesta local de respaldo; Gemini no está disponible.'
const CHAT_STORAGE_KEY = 'artlink_agent_chat_history'

/**
 * Verifica si el flujo de N8N con Gemini está habilitado en las variables de entorno.
 */
export function isN8nChatbotConfigured() {
  return import.meta.env?.VITE_USE_GEMINI_WORKFLOW !== 'false'
}

/**
 * Obtiene la URL base configurada para los webhooks de N8N.
 */
export function getN8nWebhookBaseUrl() {
  return import.meta.env?.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook'
}


/**
 * Carga el historial de conversación persistente desde localStorage.
 */
export function loadPersistedChatHistory() {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {}
  return null
}

/**
 * Guarda el historial de conversación en localStorage.
 */
export function savePersistedChatHistory(messages) {
  try {
    if (Array.isArray(messages)) {
      // Guardar máximo 30 mensajes para no sobrecargar el almacenamiento local
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-30)))
    }
  } catch {}
}

/**
 * Limpia el historial persistente de la conversación.
 */
export function clearPersistedChatHistory() {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY)
  } catch {}
}

/**
 * Envía un mensaje al Webhook de N8N (/artlink-chatbot) para ser procesado por el Agente LangChain y Gemini.
 *
 * @param {Object} params
 * @param {string} params.message Texto de la consulta del usuario.
 * @param {string} [params.sessionId] ID de sesión para la memoria conversacional.
 * @param {string} [params.conversationId] ID de la conversación.
 * @param {string} [params.userId] ID del usuario actual.
 * @param {string} [params.userName] Nombre del usuario actual.
 * @param {string} [params.role] Rol del usuario actual ('client' o 'artist').
 * @param {string} [params.page] Ruta actual de navegación en ArtLink.
 * @param {Array} [params.preferences] Preferencias artísticas del usuario.
 * @param {string} [params.language] Idioma del usuario (por defecto 'es').
 * @param {Array} [params.history] Historial previo de mensajes (máximo 10).
 * @param {AbortSignal} [params.signal] Señal para permitir cancelación de la solicitud.
 * @param {number} [params.timeoutMs] Tiempo máximo de espera en milisegundos (por defecto 18000ms).
 * @returns {Promise<Object>}
 */
export async function sendMessageToChatbot({
  message,
  sessionId = `session-${Date.now()}`,
  conversationId = `convo-${Date.now()}`,
  userId = 'guest-user',
  userName = 'Creador',
  role = 'client',
  page = typeof window !== 'undefined' && window?.location?.pathname ? window.location.pathname : '/',
  preferences = [],
  language = 'es',
  history = [],
  signal,
  timeoutMs = 30000,
}) {
  const trimmed = (message || '').trim()
  if (!trimmed) {
    return {
      success: false,
      message: 'Debes enviar un mensaje válido para el asistente de ArtLink.',
      errorCode: 'INVALID_REQUEST',
      retryable: false,
      quickReplies: [],
      actions: [],
    }
  }

  // Si el flujo está deshabilitado explícitamente, devolver el mensaje de respaldo formal
  if (!isN8nChatbotConfigured()) {
    return {
      success: false,
      message: 'No pude responder en este momento. Intenta nuevamente.',
      errorCode: 'AGENT_UNAVAILABLE',
      retryable: true,
      quickReplies: ['Explorar artistas', 'Cómo pedir comisión', 'Teoría del color'],
      actions: [],
      provider: 'local-fallback',
      model: 'local-fallback',
    }
  }

  const payload = {
    message: trimmed,
    sessionId,
    conversationId,
    userId,
    userName,
    role,
    page,
    preferences: Array.isArray(preferences) ? preferences : [],
    language,
    history: Array.isArray(history) ? history.slice(-10) : [],
  }

  const baseUrl = getN8nWebhookBaseUrl().replace(/\/+$/, '')
  const webhookUrl = `${baseUrl}/artlink-chatbot`

  // Controlador de timeout interno (30s) combinado con la señal de cancelación del usuario
  const internalController = new AbortController()
  let isTimedOut = false
  const timeoutId = setTimeout(() => {
    isTimedOut = true
    internalController.abort()
  }, timeoutMs)

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
        internalController.abort()
      },
      { once: true }
    )
  }

  const ALLOWED_ACTIONS = [
    'open_artist_profile',
    'open_commission',
    'open_explore',
    'open_requests',
    'open_settings',
  ]

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: internalController.signal,
    })

    clearTimeout(timeoutId)

    let data = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      if (response.status === 400) {
        const errorMsg = (typeof data?.message === 'string' && data.message.trim()) || 'La solicitud enviada no es válida.'
        return {
          success: false,
          message: errorMsg,
          errorCode: 'INVALID_REQUEST',
          retryable: false,
          quickReplies: [],
          actions: [],
        }
      }

      // Si N8N o Gemini arrojó 503 (sobrecarga), 429 (límite) o 500, responder con motor de conocimiento
      const resolved = resolveArtLinkKnowledge({ message: trimmed, role, page, userName })
      return {
        success: true,
        message: resolved.message,
        conversationId,
        intent: resolved.intent || 'art_explanation',
        quickReplies: resolved.quickReplies || ['Explorar artistas', 'Cómo pedir comisión', 'Teoría del color'],
        actions: resolved.actions || [],
        requiresConfirmation: false,
        provider: 'artlink-knowledge',
        model: 'artlink-knowledge-v1',
      }
    }

    // Normalizar cualquier formato de respuesta de Gemini al campo message
    let extractedText = ''
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        extractedText = data.message.trim()
      } else if (typeof data.output === 'string' && data.output.trim()) {
        extractedText = data.output.trim()
      } else if (data.output && typeof data.output.text === 'string' && data.output.text.trim()) {
        extractedText = data.output.text.trim()
      } else if (typeof data.text === 'string' && data.text.trim()) {
        extractedText = data.text.trim()
      } else if (typeof data.response === 'string' && data.response.trim()) {
        extractedText = data.response.trim()
      }
    }

    const BROKEN_INCOMPLETE_PHRASE = 'No pude generar una respuesta completa. Intenta escribir tu pregunta de otra forma.'

    // Si el texto vino vacío o contiene la frase genérica de respuesta incompleta
    if (!extractedText || extractedText === BROKEN_INCOMPLETE_PHRASE) {
      const resolved = resolveArtLinkKnowledge({ message: trimmed, role, page, userName })
      return {
        success: true,
        message: resolved.message,
        conversationId: data?.conversationId || conversationId,
        intent: resolved.intent || 'art_explanation',
        quickReplies: resolved.quickReplies || ['Explorar artistas', 'Cómo pedir comisión', 'Teoría del color'],
        actions: resolved.actions || [],
        requiresConfirmation: false,
        provider: 'artlink-knowledge',
        model: 'artlink-knowledge-v1',
      }
    }

    // Si data.success vino explícitamente en false
    if (data?.success === false) {
      const resolved = resolveArtLinkKnowledge({ message: trimmed, role, page, userName })
      return {
        success: true,
        message: resolved.message,
        conversationId: data?.conversationId || conversationId,
        intent: resolved.intent || 'art_explanation',
        quickReplies: resolved.quickReplies || ['Explorar artistas', 'Cómo pedir comisión', 'Teoría del color'],
        actions: resolved.actions || [],
        requiresConfirmation: false,
        provider: 'artlink-knowledge',
        model: 'artlink-knowledge-v1',
      }
    }

    // Extraer respuestas rápidas y acciones permitidas
    const quickReplies = Array.isArray(data?.quickReplies)
      ? data.quickReplies.filter((r) => typeof r === 'string' && r.trim().length > 0)
      : []

    const actions = Array.isArray(data?.actions)
      ? data.actions.filter((a) => a && typeof a === 'object' && ALLOWED_ACTIONS.includes(a.type))
      : []

    return {
      success: true,
      message: extractedText,
      conversationId: data?.conversationId || conversationId,
      intent: data?.intent || 'art_technique',
      quickReplies: quickReplies.length > 0 ? quickReplies : ['Explorar artistas', 'Cómo pedir comisión', 'Teoría del color'],
      actions,
      requiresConfirmation: Boolean(data?.requiresConfirmation),
      provider: data?.provider || 'gemini',
      model: data?.model || 'gemini-3.1-flash-lite',
    }
  } catch (error) {
    clearTimeout(timeoutId)

    // Si la cancelación provino del usuario explícitamente
    if (signal?.aborted) {
      const abortErr = new Error('Operación cancelada por el usuario.')
      abortErr.name = 'AbortError'
      throw abortErr
    }

    // Si ocurrió error de red, 503 por sobrecarga de Gemini o timeout,
    // responder de forma útil y confiable con el motor de conocimiento ArtLink
    const resolved = resolveArtLinkKnowledge({ message: trimmed, role, page, userName })
    return {
      success: true,
      message: resolved.message,
      conversationId,
      intent: resolved.intent || 'art_explanation',
      quickReplies: resolved.quickReplies || ['Explorar artistas', 'Cómo pedir comisión', 'Teoría del color'],
      actions: resolved.actions || [],
      requiresConfirmation: false,
      provider: 'artlink-knowledge',
      model: 'artlink-knowledge-v1',
    }
  }
}

/**
 * Motor de conocimiento de ArtLink para responder de forma útil y confiable sobre:
 * 1. Las funciones de ArtLink a las que el usuario tiene acceso según su rol (cliente, artista, administrador).
 * 2. Preguntas generales sobre arte, técnicas, materiales, procesos y artistas reconocidos.
 * 3. La navegación y el uso de la plataforma.
 */
export function resolveArtLinkKnowledge({ message = '', role = 'client', page = '/', userName = 'Creador' }) {
  const norm = (message || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const safeRole = String(role || 'client').toLowerCase()

  // ── 1. CONSULTAS SOBRE FUNCIONES DE ARTLINK SEGÚN ROL ──
  const isRoleQuery = /(\b(rol|roles|permisos|permiso)\b|que puedo hacer|que funciones tengo|cuales son mis permisos|mi cuenta|funciones de artlink|funciones como (cliente|artista|admin)|mi rol)/i.test(norm)
  if (isRoleQuery) {
    if (safeRole === 'artist' || safeRole === 'artista') {
      return {
        intent: 'role_features',
        message:
          `Hola ${userName}. Como artista en ArtLink cuentas con un ecosistema completo para profesionalizar y rentabilizar tu trabajo:\n\n` +
          `• Taller y Panel de Creador (/artista/panel): Visualiza el estado de tus comisiones, ingresos acumulados y métricas de desempeño.\n` +
          `• Catálogo de Comisiones (/artista/comisiones): Configura tus formatos de encargo, tarifas base, tiempos de entrega y límites de revisiones.\n` +
          `• Portafolio Personal (/artista/portafolio): Publica obras en alta resolución, modelados 3D, diseños de personajes y modelos VTuber.\n` +
          `• Gestión de Solicitudes (/solicitudes): Revisa las propuestas entrantes, acéptalas o recházalas, y sube tus entregables por hitos.\n` +
          `• Protección Escrow Shield: Tus pagos están garantizados en depósito en custodia antes de iniciar la producción.\n` +
          `• Rol Dual: Como artista también puedes actuar como cliente para encargar obras a otros creadores de la comunidad.`,
        quickReplies: ['Mis solicitudes', 'Ir al panel de artista', 'Cómo funciona Escrow'],
        actions: [{ type: 'open_requests', label: 'Ver solicitudes' }],
      }
    }

    if (safeRole === 'admin' || safeRole === 'administrador') {
      return {
        intent: 'role_features',
        message:
          `Hola ${userName}. Con tu rol de Administrador tienes acceso integral a la gobernanza y analítica de ArtLink:\n\n` +
          `• Panel de Métricas (/admin): Monitorización en tiempo real de usuarios activos, artistas verificados, volumen en custodia Escrow y solicitudes.\n` +
          `• Gestión de Recursos (/admin/usuarios, /admin/artistas, /admin/solicitudes, /admin/categorias): Control CRUD de cuentas, aprobación de perfiles artísticos y categorías temáticas.\n` +
          `• Asistente IA de Analítica: Generación de resúmenes operativos, auditoría y reportes a partir de los datos reales del sistema.`,
        quickReplies: ['Ir al panel de admin', 'Explorar artistas', 'Ajustes'],
        actions: [{ type: 'open_settings', label: 'Abrir ajustes' }],
      }
    }

    // Rol cliente por defecto
    return {
      intent: 'role_features',
      message:
        `Hola ${userName}. Como cliente en ArtLink tienes acceso a las siguientes funciones principales:\n\n` +
        `• Explorar Galería (/explorar): Encuentra creadores filtrando por disciplina (Ilustración 2D, 3D, VTuber, etc.), estilo, precio y disponibilidad.\n` +
        `• Cotizar y Solicitar Comisiones: Envía propuestas personalizadas directamente desde el perfil de cualquier artista indicando formato y referencias.\n` +
        `• Protección Escrow Shield: Tu dinero permanece en custodia segura y solo se transfiere al artista cuando apruebas cada hito o el entregable final.\n` +
        `• Seguimiento en Solicitudes (/solicitudes): Monitorea el progreso de tus encargos en tiempo real, aprueba hitos y descarga tus archivos terminados.\n` +
        `• Mensajería Directa (/mensajes): Comunícate en privado con los artistas para coordinar detalles y compartir retroalimentación.\n` +
        `• Favoritos y Reseñas: Guarda obras favoritas y califica la experiencia una vez completado el encargo.`,
      quickReplies: ['Explorar artistas', 'Cómo pedir comisión', 'Mis solicitudes'],
      actions: [{ type: 'open_explore', label: 'Explorar artistas' }],
    }
  }

  // ── 2. PREGUNTAS GENERALES SOBRE ARTE, TÉCNICAS Y MATERIALES ──

  // Técnica con acuarela (pregunta específica del usuario)
  if (norm.includes('acuarela') || norm.includes('watercolor')) {
    return {
      intent: 'art_technique',
      message:
        `La acuarela es una técnica pictórica sobre papel basada en pigmentos finamente molidos aglutinados con goma arábiga y solubles en agua. Su principal distinción es la transparencia y la luminosidad: la luz atraviesa las capas de color y se refleja en el blanco del papel, creando efectos radiantes que no se consiguen con medios opacos.\n\n` +
        `Aspectos fundamentales de la técnica:\n\n` +
        `1. Control de agua y pigmento:\n` +
        `   • Húmedo sobre húmedo (wet-on-wet): Se aplica pintura sobre papel previamente humedecido, generando degradados suaves, bordes difusos y atmósferas envolventes.\n` +
        `   • Húmedo sobre seco (wet-on-dry): Se pinta sobre papel seco para trazar líneas definidas, detalles de primer plano y bordes limpios.\n\n` +
        `2. El soporte y papel:\n` +
        `   Es esencial utilizar papel específico de alto gramaje (300 g/m² o superior, 100% algodón o celulosa prensada) para que absorba el agua sin combarse ni romperse.\n\n` +
        `3. Reserva de blancos y veladuras:\n` +
        `   A diferencia de otras pinturas, no se usa pintura blanca para iluminar; las luces máximas se logran reservando el blanco original del papel o aplicando líquido enmascarador antes de pintar.\n\n` +
        `4. Aplicación en ilustración digital:\n` +
        `   En programas como Clip Studio Paint, Photoshop o Procreate, la acuarela se simula mediante pinceles con difusión de borde y modos de fusión de capa como "Multiplicar" para replicar la acumulación de veladuras transparentes.`,
      quickReplies: ['Teoría del color', 'Técnica al óleo', 'Explorar artistas'],
      actions: [{ type: 'open_explore', label: 'Ver obras de acuarela e ilustración' }],
    }
  }

  // Pintura al óleo
  if (norm.includes('oleo') || norm.includes('oil painting')) {
    return {
      intent: 'art_technique',
      message:
        `La pintura al óleo es una técnica tradicional donde los pigmentos se mezclan con aceites secantes (principalmente aceite de linaza purificado o de nuez). Destaca por su secado lento por oxidación, lo que permite trabajar fundidos de color suaves y realizar correcciones con calma.\n\n` +
        `Reglas clave:\n` +
        `• Graso sobre magro: Las capas inferiores deben tener menos aceite (diluidas con disolvente o trementina) y las superiores mayor proporción de aceite, evitando cuarteamientos al secar.\n` +
        `• Veladuras y empastes: Permite desde veladuras ópticas ultradelgadas hasta empastes escultóricos con espátula (impasto).\n` +
        `• Soportes: Lienzo de lino o algodón tensado en bastidor, madera o papel imprimado con gesso.`,
      quickReplies: ['Técnica con acuarela', 'Acrílico y Gouache', 'Teoría del color'],
      actions: [{ type: 'open_explore', label: 'Explorar artistas' }],
    }
  }

  // Acrílico y Gouache
  if (norm.includes('acrilico') || norm.includes('gouache') || norm.includes('aguada')) {
    return {
      intent: 'art_technique',
      message:
        `El acrílico y el gouache son dos técnicas solubles en agua con personalidades distintas:\n\n` +
        `• Acrílico: Utiliza una emulsión de polímero plástico. Seca rápidamente, es impermeable una vez seco y permite trabajar tanto en capas delgadas como en empastes densos sobre casi cualquier soporte.\n` +
        `• Gouache (témpera profesional): Similar a la acuarela pero formulado con cargas opacas (como blanco de tiza o sulfato de bario). Brinda un acabado mate, aterciopelado y uniforme, ideal para concept art, ilustración editorial y diseño de fondos.`,
      quickReplies: ['Técnica con acuarela', 'Ilustración digital', 'Teoría del color'],
      actions: [{ type: 'open_explore', label: 'Explorar artistas' }],
    }
  }

  // Dibujo y técnicas secas
  if (norm.includes('grafito') || norm.includes('carboncillo') || norm.includes('dibujo') || norm.includes('lapiz') || norm.includes('tinta')) {
    return {
      intent: 'art_technique',
      message:
        `El dibujo es la base formativa de las artes visuales y cuenta con diversos medios tradicionales:\n\n` +
        `• Grafito: Se organiza por durezas. Los lápices H (Hard, 2H-6H) son duros y claros, ideales para trazos técnicos y bocetos preliminares; los lápices B (Black, 2B-8B) son blandos y oscuros, perfectos para sombras profundas y volumen.\n` +
        `• Carboncillo: Carbón vegetal que ofrece negros mates intensos y gran versatilidad para encajes gestuales rápidos y estudios de claroscuro con difumino.\n` +
        `• Tinta china: Trabajo lineal con plumilla, pincel o estilógrafo. Se explora el tramado cruzado (cross-hatching) y aguadas de tinta para modulación tonal.`,
      quickReplies: ['Ilustración digital', 'Técnica con acuarela', 'Teoría del color'],
      actions: [{ type: 'open_explore', label: 'Explorar dibujantes' }],
    }
  }

  // Arte digital y flujo de trabajo 2D
  if (norm.includes('digital') || norm.includes('procreate') || norm.includes('photoshop') || norm.includes('clip studio') || norm.includes('tableta') || norm.includes('lineart')) {
    return {
      intent: 'digital_art_workflow',
      message:
        `El proceso estándar de ilustración y pintura digital sigue una estructura metódica:\n\n` +
        `1. Boceto preliminar: Exploración de siluetas, composición y anatomía en una capa con opacidad reducida.\n` +
        `2. Entintado o Lineart: Trazos limpios con estabilizador de curva y sensibilidad a la presión de la tableta.\n` +
        `3. Colores base (Flat Colors): Colores planos delimitados en capas separadas para cada elemento (piel, ropa, cabello).\n` +
        `4. Sombras y Luces: Capas en modo "Multiplicar" para sombras tonales y "Superponer" o "Añadir (Color Dodge)" para brillos especulares y luz de rebote.\n` +
        `5. Postproducción: Curvas de color, aberración cromática sutil y resolución final (mínimo 300 DPI para impresión).`,
      quickReplies: ['Modelado 3D', 'Modelos VTuber', 'Teoría del color'],
      actions: [{ type: 'open_explore', label: 'Ver ilustradores digitales' }],
    }
  }

  // Modelado 3D y animación
  if (norm.includes('3d') || norm.includes('blender') || norm.includes('zbrush') || norm.includes('maya') || norm.includes('modelado') || norm.includes('rigging')) {
    return {
      intent: '3d_art_help',
      message:
        `La creación de modelos 3D para animación, videojuegos e impresión se divide en etapas profesionales:\n\n` +
        `1. Bloqueo y Escultura: Modelado de formas principales en software como Blender o ZBrush.\n` +
        `2. Retopología: Reconstrucción de la superficie con topología limpia basada en cuadriláteros (quads) que respeten las líneas de flujo muscular para deformaciones naturales.\n` +
        `3. Desplegado UV (UV Mapping): Proyección bidimensional de la geometría 3D para permitir pintar texturas.\n` +
        `4. Texturizado PBR: Creación de mapas de Albedo (color), Roughness (rugosidad), Normal (relieve) y Metallic.\n` +
        `5. Rigging y Animación: Inserción de esqueletos óseos y controladores cinemáticos (IK/FK) para posar o animar el modelo.`,
      quickReplies: ['Modelos VTuber', 'Ilustración digital', 'Explorar artistas 3D'],
      actions: [{ type: 'open_explore', label: 'Explorar artistas 3D' }],
    }
  }

  // Modelos VTuber y Live2D
  if (norm.includes('vtuber') || norm.includes('live2d') || norm.includes('avatar')) {
    return {
      intent: 'vtuber_art_help',
      message:
        `El desarrollo de avatares VTuber en 2D combina ilustración por piezas y rigging procedural en Live2D Cubism:\n\n` +
        `• Preparación del PSD (Separación de capas): El ilustrador divide al personaje en decenas o cientos de capas independientes (iris, pupilas, reflejos, párpados, labios superior e inferior, mechones de cabello delantero, lateral y trasero, ropa y accesorios).\n` +
        `• Malla y Deformadores en Live2D: Se asignan mallas poligonales a cada parte y se configuran deformadores para rotación de cabeza (ángulos X, Y, Z), movimiento corporal y sincronización labial.\n` +
        `• Parámetros y Físicas: Se agregan físicas de inercia y rebote para el cabello y accesorios con gravedad simulada.\n` +
        `• Integración: El modelo final exportado se conecta a aplicaciones de captura como VTube Studio mediante cámara web o sensor de seguimiento facial.`,
      quickReplies: ['Ilustración digital', 'Modelado 3D', 'Explorar creadores VTuber'],
      actions: [{ type: 'open_explore', label: 'Explorar creadores VTuber' }],
    }
  }

  // Teoría del color y composición
  if (norm.includes('teoria del color') || norm.includes('color') || norm.includes('paleta') || norm.includes('composicion')) {
    return {
      intent: 'color_theory_help',
      message:
        `La teoría del color y la composición son pilares esenciales de la narrativa visual:\n\n` +
        `• Círculo cromático y armonías:\n` +
        `  - Complementarios: Tonos opuestos en la rueda (azul/naranja, rojo/verde) que generan máximo contraste y vibración.\n` +
        `  - Análogos: Tonos vecinos que producen armonía suave y continuidad visual.\n` +
        `  - Triadas: Tres tonos equidistantes que equilibran variedad y vivacidad.\n\n` +
        `• Valor tonal vs. Matiz:\n` +
        `  El valor (claridad u oscuridad) es más importante que el matiz para transmitir volumen e impacto. Si una obra funciona en escala de grises, funcionará a color.\n\n` +
        `• Composición:\n` +
        `  Aplica la regla de los tercios, puntos áureos y líneas guía de lectura para conducir la mirada del espectador hacia el punto focal principal.`,
      quickReplies: ['Técnica con acuarela', 'Ilustración digital', 'Explorar artistas'],
      actions: [{ type: 'open_explore', label: 'Explorar obras' }],
    }
  }

  // Artistas famosos e historia del arte
  if (norm.includes('da vinci') || norm.includes('van gogh') || norm.includes('frida') || norm.includes('kahlo') || norm.includes('monet') || norm.includes('picasso') || norm.includes('dali') || norm.includes('historia del arte') || norm.includes('renacimiento') || norm.includes('impresionismo')) {
    return {
      intent: 'famous_artist_info',
      message:
        `Los grandes maestros de la historia del arte han aportado innovaciones técnicas fundamentales:\n\n` +
        `• Leonardo da Vinci (Renacimiento): Pionero del "sfumato", técnica de difuminado progresivo de contornos que elimina líneas duras para simular la atmósfera real.\n` +
        `• Vincent van Gogh (Postimpresionismo): Destacó por la pincelada matérica visible y el uso emocional del color puro sobre el lienzo.\n` +
        `• Claude Monet (Impresionismo): Revolucionó el estudio de la luz natural al pintar series de un mismo motivo en distintas horas del día al aire libre (en plein air).\n` +
        `• Frida Kahlo (Simbolismo / Surrealismo mexicano): Maestra del autorretrato íntimo, empleando elementos botánicos, folclóricos y anatómicos con profunda carga simbólica.\n` +
        `• Pablo Picasso (Cubismo): Desafió la perspectiva geométrica renacentista al representar múltiples puntos de vista simultáneos en un solo plano.`,
      quickReplies: ['Técnica con acuarela', 'Técnica al óleo', 'Teoría del color'],
      actions: [{ type: 'open_explore', label: 'Explorar artistas de ArtLink' }],
    }
  }

  // ── 3. NAVEGACIÓN Y USO DE LA PLATAFORMA ARTLINK ──

  // Comisiones y custodia Escrow Shield
  if (norm.includes('comision') || norm.includes('comisiones') || norm.includes('escrow') || norm.includes('cotizar') || norm.includes('seguridad') || norm.includes('garantia') || norm.includes('pago')) {
    return {
      intent: 'explain_how_to_request',
      message:
        `El sistema de comisiones de ArtLink opera bajo el modelo de custodia protegida Escrow Shield para garantizar la tranquilidad de clientes y artistas:\n\n` +
        `1. Propuesta inicial: Ingresa al perfil del artista o a /solicitudes/nueva/:artistId y redacta tu encargo (descripción, referencias, formato y presupuesto propuesto).\n` +
        `2. Depósito en custodia: Al acordar el encargo, los fondos quedan resguardados de forma segura en ArtLink. El artista tiene la certeza de que el dinero existe antes de empezar a trabajar.\n` +
        `3. Entrega por hitos: El artista sube avances (boceto, lineart, color base y entrega final).\n` +
        `4. Liberación de fondos: El dinero solo se transfiere al artista cuando tú, como cliente, apruebas cada hito o el entregable definitivo.`,
      quickReplies: ['Explorar artistas para cotizar', 'Mis solicitudes', 'Ajustes'],
      actions: [
        { type: 'open_explore', label: 'Explorar artistas' },
        { type: 'open_requests', label: 'Ver solicitudes' },
      ],
    }
  }

  // Explorar y buscar creadores
  if (norm.includes('explorar') || norm.includes('buscar') || norm.includes('catalogo') || norm.includes('galeria') || norm.includes('encontrar')) {
    return {
      intent: 'open_explore',
      message:
        `Puedes descubrir creadores en la página de Explorar (/explorar):\n\n` +
        `• Barra de búsqueda: Busca por nombre, estilo (anime, fantasía, cyberpunk, realista) o temática.\n` +
        `• Filtro por disciplina: Ilustración 2D, Modelado 3D, Animación, Pixel Art, VTuber y más.\n` +
        `• Rango de presupuesto y disponibilidad: Encuentra artistas con cupos abiertos que se ajusten a tus tiempos.`,
      quickReplies: ['Explorar artistas', 'Cómo pedir comisión', 'Teoría del color'],
      actions: [{ type: 'open_explore', label: 'Ir a Explorar' }],
    }
  }

  // Seguimiento de solicitudes
  if (norm.includes('solicitud') || norm.includes('solicitudes') || norm.includes('hitos') || norm.includes('pedidos') || norm.includes('encargos')) {
    return {
      intent: 'open_requests',
      message:
        `En la página de Solicitudes y Notificaciones (/solicitudes) puedes gestionar tus comisiones activas:\n\n` +
        `• Pestaña Clientes: Revisa el avance de los encargos que has solicitado, aprueba hitos para liberar pagos y descarga archivos finales.\n` +
        `• Pestaña Artista: Si eres creador, gestiona las propuestas entrantes, acéptalas o recházalas y sube entregables.\n` +
        `• Notificaciones en vivo: Recibe avisos instantáneos ante cualquier cambio de estado.`,
      quickReplies: ['Ver mis solicitudes', 'Explorar artistas', 'Ajustes'],
      actions: [{ type: 'open_requests', label: 'Ir a Solicitudes' }],
    }
  }

  // Ajustes, apariencia y accesibilidad
  if (norm.includes('ajustes') || norm.includes('configuracion') || norm.includes('modo oscuro') || norm.includes('tema') || norm.includes('accesibilidad')) {
    return {
      intent: 'open_settings',
      message:
        `En Ajustes (/ajustes) puedes adaptar ArtLink a tus necesidades:\n\n` +
        `• Apariencia: Alterna entre Modo Claro y Modo Oscuro, o activa la paleta pastel scrapbook.\n` +
        `• Accesibilidad: Habilita el modo de alto contraste para mejorar legibilidad o ajusta el tamaño del texto.\n` +
        `• Perfil: Actualiza tu biografía, avatar personalizado, enlaces a redes sociales y datos de creador.`,
      quickReplies: ['Abrir Ajustes', 'Explorar artistas', 'Mis solicitudes'],
      actions: [{ type: 'open_settings', label: 'Ir a Ajustes' }],
    }
  }

  // Mensaje de bienvenida / ayuda general
  return {
    intent: 'art_explanation',
    message:
      `¡Hola ${userName}! Soy el asistente inteligente de ArtLink. Puedo ayudarte con:\n\n` +
      `1. Funciones y herramientas de la plataforma según tu rol (cliente, artista o administrador).\n` +
      `2. Conceptos y técnicas de arte (acuarela, óleo, dibujo digital, modelado 3D, modelos VTuber, teoría del color, historia del arte y artistas reconocidos).\n` +
      `3. Navegación en ArtLink: cómo explorar artistas, solicitar comisiones seguras con custodia Escrow Shield y dar seguimiento a tus solicitudes.\n\n` +
      `¿En qué puedo ayudarte hoy?`,
    quickReplies: ['Explorar artistas', 'Cómo es la técnica con acuarela', 'Cómo pedir comisión'],
    actions: [{ type: 'open_explore', label: 'Explorar artistas' }],
  }
}


