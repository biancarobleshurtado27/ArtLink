/**
 * Servicio de conexión entre el Chatbot de ArtLink y el Webhook de N8N con Gemini.
 * La clave de Gemini reside EXCLUSIVAMENTE en N8N.
 * Este cliente React nunca manipula ni contiene la API key.
 */

const FALLBACK_MESSAGE = 'Respuesta local de respaldo; Gemini no está disponible.'

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
 * Envía un mensaje al Webhook de N8N para ser procesado por Gemini.
 *
 * @param {Object} params
 * @param {string} params.message Texto de la consulta del usuario.
 * @param {string} [params.conversationId] Identificador de conversación para mantener el contexto.
 * @param {string} [params.role] Rol del usuario actual ('client' o 'artist').
 * @param {string} [params.page] Ruta actual de navegación.
 * @param {Array} [params.history] Historial previo de mensajes (máximo 10).
 * @param {AbortSignal} [params.signal] Señal para permitir cancelación de la solicitud.
 * @param {number} [params.timeoutMs] Tiempo máximo de espera en milisegundos (por defecto 18000ms).
 * @returns {Promise<{ success: boolean, conversationId: string, message: string, provider: string, model?: string, isFallback?: boolean }>}
 */
export async function sendMessageToChatbot({
  message,
  conversationId = `artlink-chat-${Date.now()}`,
  role = 'client',
  page = window?.location?.pathname || '/',
  history = [],
  signal,
  timeoutMs = 18000,
}) {
  const trimmed = (message || '').trim()
  if (!trimmed) {
    throw new Error('Por favor escribe un mensaje antes de enviar.')
  }

  // Si el flujo está deshabilitado explícitamente, devolver el mensaje de respaldo formal
  if (!isN8nChatbotConfigured()) {
    return {
      success: false,
      conversationId,
      message: FALLBACK_MESSAGE,
      provider: 'local-fallback',
      isFallback: true,
    }
  }

  const payload = {
    message: trimmed,
    conversationId,
    role,
    page,
    history: Array.isArray(history) ? history.slice(-10) : [],
  }

  const baseUrl = getN8nWebhookBaseUrl().replace(/\/+$/, '')
  const webhookUrl = `${baseUrl}/artlink/chatbot-gemini`

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

    // Si el webhook devuelve respuesta en JSON
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
        conversationId,
        message: errorMsg,
        provider: data?.provider || 'gemini',
        model: data?.model,
        status: response.status,
      }
    }

    if (data && typeof data === 'object') {
      return {
        success: data.success !== false,
        conversationId: data.conversationId || conversationId,
        message: data.message || 'Respuesta recibida correctamente.',
        provider: data.provider || 'gemini',
        model: data.model || 'gemini',
        isFallback: false,
      }
    }

    return {
      success: true,
      conversationId,
      message: 'Consulta procesada correctamente.',
      provider: 'gemini',
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
      conversationId,
      message: FALLBACK_MESSAGE,
      provider: 'local-fallback',
      isFallback: true,
      rawError: error.message,
    }
  }
}
