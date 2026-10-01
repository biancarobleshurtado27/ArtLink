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
  return import.meta.env.VITE_USE_GEMINI_WORKFLOW !== 'false'
}

/**
 * Obtiene la URL base configurada para los webhooks de N8N.
 */
export function getN8nWebhookBaseUrl() {
  return import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook'
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
  page = window?.location?.pathname || '/',
  preferences = [],
  language = 'es',
  history = [],
  signal,
  timeoutMs = 18000,
}) {
  const trimmed = (message || '').trim()
  if (!trimmed) {
    throw new Error('Debes enviar un mensaje válido para el asistente de ArtLink.')
  }

  // Si el flujo está deshabilitado explícitamente, devolver el mensaje de respaldo formal
  if (!isN8nChatbotConfigured()) {
    return {
      success: false,
      message: FALLBACK_MESSAGE,
      sessionId,
      conversationId,
      intent: 'unknown',
      knowledgeDomain: 'general',
      suggestions: [],
      quickReplies: [],
      actions: [],
      requiresConfirmation: false,
      provider: 'local-fallback',
      model: 'local-fallback',
      timestamp: new Date().toISOString(),
      isFallback: true,
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
  // Endpoint exacto configurado en N8N para el Agente ArtLink
  const webhookUrl = `${baseUrl}/artlink-chatbot`

  // Controlador de timeout interno combinado con la señal de cancelación del usuario
  const internalController = new AbortController()
  const timeoutId = setTimeout(() => {
    internalController.abort(new Error('TIMEOUT'))
  }, timeoutMs)

  let combinedSignal = internalController.signal

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
        internalController.abort(signal.reason || new Error('Cancelado por el usuario'))
      },
      { once: true }
    )
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: combinedSignal,
    })

    clearTimeout(timeoutId)

    let data = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      const errorMsg =
        data?.message ||
        data?.error ||
        `El servicio de N8N devolvió un error (${response.status}: ${response.statusText}).`

      return {
        success: false,
        message: errorMsg,
        sessionId,
        conversationId,
        intent: 'unknown',
        knowledgeDomain: 'general',
        suggestions: [],
        quickReplies: [],
        actions: [],
        requiresConfirmation: false,
        provider: 'gemini',
        model: data?.model || 'gemini',
        status: response.status,
        isFallback: false,
      }
    }

    if (data && typeof data === 'object') {
      return {
        success: data.success !== false,
        message: data.message || 'Respuesta del agente recibida.',
        sessionId: data.sessionId || sessionId,
        conversationId: data.conversationId || conversationId,
        intent: data.intent || 'art_explanation',
        knowledgeDomain: data.knowledgeDomain || 'art',
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : [],
        actions: Array.isArray(data.actions) ? data.actions : [],
        requiresConfirmation: Boolean(data.requiresConfirmation),
        timestamp: data.timestamp || new Date().toISOString(),
        model: data.model || 'gemini-1.5-flash',
        provider: 'gemini',
        isFallback: false,
      }
    }

    return {
      success: true,
      message: 'Consulta procesada correctamente.',
      sessionId,
      conversationId,
      intent: 'art_explanation',
      knowledgeDomain: 'art',
      suggestions: [],
      quickReplies: [],
      actions: [],
      requiresConfirmation: false,
      model: 'gemini-1.5-flash',
      provider: 'gemini',
      isFallback: false,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    // Si fue cancelado expresamente por el usuario
    if (signal?.aborted || error.name === 'AbortError') {
      const abortErr = new Error('Consulta cancelada por el usuario.')
      abortErr.name = 'AbortError'
      throw abortErr
    }

    // Si N8N está apagado, inaccesible o hubo un error de red/timeout
    return {
      success: false,
      message: FALLBACK_MESSAGE,
      sessionId,
      conversationId,
      intent: 'unknown',
      knowledgeDomain: 'general',
      suggestions: [],
      quickReplies: [],
      actions: [],
      requiresConfirmation: false,
      provider: 'local-fallback',
      model: 'local-fallback',
      timestamp: new Date().toISOString(),
      isFallback: true,
      rawError: error.message,
    }
  }
}
