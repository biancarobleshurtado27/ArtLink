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
      if (response.status === 429) {
        return {
          success: false,
          message: 'El servicio está ocupado en este momento. Por favor espera unos segundos e intenta nuevamente.',
          errorCode: 'RATE_LIMITED',
          retryable: true,
          quickReplies: [],
          actions: [],
        }
      }

      if (response.status === 400) {
        return {
          success: false,
          message: (typeof data?.message === 'string' && data.message.trim()) || 'La solicitud enviada no es válida.',
          errorCode: 'INVALID_REQUEST',
          retryable: false,
          quickReplies: [],
          actions: [],
        }
      }

      return {
        success: false,
        message: 'No pude responder en este momento. Intenta nuevamente.',
        errorCode: 'AGENT_UNAVAILABLE',
        retryable: true,
        quickReplies: [],
        actions: [],
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

    // El campo message nunca puede ser null, undefined, cadena vacía ni un objeto sin texto
    if (!extractedText) {
      return {
        success: false,
        message: 'No pude generar una respuesta completa. Intenta escribir tu pregunta de otra forma.',
        errorCode: 'INVALID_RESPONSE',
        retryable: true,
        quickReplies: [],
        actions: [],
      }
    }

    // Si data.success vino explícitamente en false
    if (data?.success === false) {
      return {
        success: false,
        message: extractedText || 'No pude responder en este momento. Intenta nuevamente.',
        errorCode: data.errorCode || 'AGENT_UNAVAILABLE',
        retryable: data.retryable !== false,
        quickReplies: [],
        actions: [],
      }
    }

    // Ignorar opciones transparentes (suggestions)
    const quickReplies = Array.isArray(data?.quickReplies)
      ? data.quickReplies.filter((r) => typeof r === 'string' && r.trim().length > 0)
      : []
    const visibleSuggestions = [] // Se ignoran completamente por especificación

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

    // Si ocurrió timeout (~30s)
    if (isTimedOut) {
      return {
        success: false,
        message: 'El tiempo de espera para la respuesta del agente se ha agotado. Intenta nuevamente.',
        errorCode: 'AGENT_TIMEOUT',
        retryable: true,
        quickReplies: [],
        actions: [],
      }
    }

    // Error de red, N8N apagado o inalcanzable
    return {
      success: false,
      message: 'No pude responder en este momento. Intenta nuevamente.',
      errorCode: 'AGENT_UNAVAILABLE',
      retryable: true,
      quickReplies: [],
      actions: [],
    }
  }
}

