/**
 * Servicio de persistencia y sincronización del Chatbot de ArtLink.
 * Implementa almacenamiento seguro en localStorage (para invitados y cache)
 * y persistencia en JSON Server para usuarios autenticados.
 */

import apiClient from './apiClient'
import {
  readLocal,
  saveLocal,
  removeLocal,
} from './persistence/localStorageService'
import {
  GUEST_CHAT_KEY,
  GUEST_USER_ID,
  getChatStorageKey,
  getUserScopedKey,
} from './persistence/storageKeys'
import {
  getActiveConversationId,
  setActiveConversationId,
} from './persistence/syncService'

const MAX_HISTORY_MESSAGES = 50
const CONVERSATION_INDEX_KEY = 'chat:conversations_index'

/**
 * Crea una nueva estructura de conversación formal.
 * @param {string} [userId='guest']
 * @param {string} [page='/']
 * @param {string} [title='Conversación con ArtLink AI']
 * @returns {Object}
 */
export function createNewConversation({
  userId = GUEST_USER_ID,
  page = typeof window !== 'undefined' ? window.location?.pathname || '/' : '/',
  title = 'Conversación con ArtLink AI',
} = {}) {
  const id = `convo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const now = new Date().toISOString()
  return {
    id,
    userId: userId || GUEST_USER_ID,
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
    page,
    isLocalOnly: !userId || userId === GUEST_USER_ID,
  }
}

/**
 * Normaliza un mensaje según la estructura oficial requerida:
 * { id, role, content, createdAt, provider, status, suggestions, quickReplies, actions }
 */
export function formatChatMessage({
  id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  role = 'user',
  content = '',
  createdAt = new Date().toISOString(),
  provider = 'gemini',
  status = 'sent',
  suggestions = [],
  quickReplies = [],
  actions = [],
  intent = null,
} = {}) {
  return {
    id: String(id),
    role: role === 'assistant' ? 'assistant' : 'user',
    content: typeof content === 'string' ? content : String(content || ''),
    createdAt,
    provider: provider === 'local-fallback' ? 'local-fallback' : provider === 'system' ? 'system' : 'gemini',
    status: status === 'error' ? 'error' : status === 'sending' ? 'sending' : 'sent',
    suggestions: Array.isArray(suggestions) ? suggestions : [],
    quickReplies: Array.isArray(quickReplies) ? quickReplies : [],
    actions: Array.isArray(actions) ? actions : [],
    intent,
  }
}

/**
 * Carga la conversación de un usuario desde localStorage.
 */
export function loadLocalConversation(userId, conversationId) {
  if (!userId || userId === GUEST_USER_ID) {
    return readLocal(GUEST_CHAT_KEY, null)
  }
  const key = getChatStorageKey(userId, conversationId)
  return readLocal(key, null)
}

/**
 * Guarda la conversación en localStorage con límite de 50 mensajes y deduplicación.
 */
/**
 * Guarda la conversación en localStorage con límite de 50 mensajes y deduplicación.
 */
export function saveLocalConversation(conversation) {
  if (!conversation || !conversation.id) return null

  // Deduplicar mensajes por ID y limitar a MAX_HISTORY_MESSAGES
  const messageMap = new Map()
  ;(conversation.messages || []).forEach((m) => {
    if (m && m.id) {
      messageMap.set(String(m.id), m)
    }
  })

  const cleanMessages = Array.from(messageMap.values()).slice(-MAX_HISTORY_MESSAGES)
  const updatedConversation = {
    ...conversation,
    messages: cleanMessages,
    updatedAt: new Date().toISOString(),
  }

  const userId = updatedConversation.userId || GUEST_USER_ID

  if (userId === GUEST_USER_ID) {
    saveLocal(GUEST_CHAT_KEY, updatedConversation)
  } else {
    const key = getChatStorageKey(userId, updatedConversation.id)
    saveLocal(key, updatedConversation)
    // Actualizar índice de conversaciones del usuario
    updateUserConversationIndex(userId, updatedConversation.id)
  }

  // Guardar activo tanto con ámbito de usuario como global de respaldo
  saveLocal(getUserScopedKey(userId, 'active_conversation_id'), updatedConversation.id)
  setActiveConversationId(updatedConversation.id)
  return updatedConversation
}

/**
 * Obtiene sincronamente la conversación activa guardada en localStorage.
 * Permite inicializar useState sin parpadeos ni riesgo de sobreescritura.
 */
export function getLocalConversationSync(userId = GUEST_USER_ID) {
  const safeUser = userId || GUEST_USER_ID

  if (safeUser === GUEST_USER_ID) {
    const guestConvo = readLocal(GUEST_CHAT_KEY, null)
    return guestConvo || null
  }

  // Buscar por ID activo específico del usuario
  const userScopedActiveKey = getUserScopedKey(safeUser, 'active_conversation_id')
  const userActiveId = readLocal(userScopedActiveKey, null) || getActiveConversationId()

  if (userActiveId) {
    const local = loadLocalConversation(safeUser, userActiveId)
    if (local && Array.isArray(local.messages) && local.messages.length > 0) {
      return local
    }
  }

  // Si no se encontró o estaba vacía, consultar el índice de conversaciones del usuario
  const indexKey = getUserScopedKey(safeUser, CONVERSATION_INDEX_KEY)
  const convoIds = readLocal(indexKey, [])
  if (Array.isArray(convoIds) && convoIds.length > 0) {
    for (let i = convoIds.length - 1; i >= 0; i--) {
      const candidate = loadLocalConversation(safeUser, convoIds[i])
      if (candidate && Array.isArray(candidate.messages) && candidate.messages.length > 0) {
        return candidate
      }
    }
  }

  return null
}

/**
 * Mantiene la lista de IDs de conversaciones de un usuario.
 */
function updateUserConversationIndex(userId, conversationId) {
  if (!userId || userId === GUEST_USER_ID) return
  const indexKey = getUserScopedKey(userId, CONVERSATION_INDEX_KEY)
  const existing = readLocal(indexKey, [])
  const set = new Set(Array.isArray(existing) ? existing : [])
  set.add(conversationId)
  saveLocal(indexKey, Array.from(set))
}

/**
 * Guarda o actualiza la conversación en JSON Server si el usuario está autenticado.
 */
export async function syncConversationToServer(conversation) {
  if (!conversation || !conversation.id || conversation.userId === GUEST_USER_ID) {
    return conversation
  }

  try {
    const { id, userId, title, createdAt, updatedAt, page } = conversation
    const payload = {
      id,
      userId,
      title: title || 'Chat ArtLink AI',
      createdAt,
      updatedAt: updatedAt || new Date().toISOString(),
      page: page || '/',
    }

    try {
      // Intentar actualizar la conversación existente
      await apiClient.put(`/conversations/${id}`, payload)
    } catch (putErr) {
      if (putErr.response?.status === 404) {
        // Si no existe aún en JSON Server, crearla
        await apiClient.post('/conversations', payload)
      } else {
        throw putErr
      }
    }
  } catch (error) {
    // Si JSON Server está apagado o falla, la conversación permanece segura en localStorage
    console.warn('[chatPersistenceService] No se pudo sincronizar conversación con JSON Server:', error?.message)
  }

  return conversation
}

/**
 * Guarda un mensaje individual en JSON Server si el usuario está autenticado.
 */
export async function syncMessageToServer(conversationId, message, userId) {
  if (!userId || userId === GUEST_USER_ID || !message || !message.id) {
    return message
  }

  try {
    const payload = {
      id: message.id,
      conversationId,
      userId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      provider: message.provider,
      status: message.status,
      intent: message.intent || null,
    }

    try {
      await apiClient.put(`/chatMessages/${message.id}`, payload)
    } catch (putErr) {
      if (putErr.response?.status === 404) {
        await apiClient.post('/chatMessages', payload)
      }
    }
  } catch (error) {
    console.warn('[chatPersistenceService] No se pudo sincronizar mensaje con JSON Server:', error?.message)
  }

  return message
}

/**
 * Obtiene la conversación activa o inicializa una nueva si no existe.
 */
export async function getActiveConversation(userId = GUEST_USER_ID, currentPage = '/') {
  const safeUser = userId || GUEST_USER_ID

  // 1. Intentar cargar conversación de localStorage síncronamente
  let conversation = getLocalConversationSync(safeUser)

  // 2. Si no está en local y el usuario está autenticado, intentar cargar de JSON Server
  if (!conversation && safeUser !== GUEST_USER_ID) {
    const userScopedActiveKey = getUserScopedKey(safeUser, 'active_conversation_id')
    const activeId = readLocal(userScopedActiveKey, null) || getActiveConversationId()

    if (activeId) {
      try {
        const { data: serverConvo } = await apiClient.get(`/conversations/${activeId}`)
        if (serverConvo && serverConvo.userId === safeUser) {
          const { data: serverMessages } = await apiClient.get('/chatMessages', {
            params: { conversationId: activeId },
          })
          conversation = {
            ...serverConvo,
            messages: Array.isArray(serverMessages) ? serverMessages : [],
            isLocalOnly: false,
          }
          saveLocalConversation(conversation)
        }
      } catch {}
    }

    if (!conversation) {
      try {
        const { data: userConvos } = await apiClient.get('/conversations', {
          params: { userId: safeUser },
        })
        if (Array.isArray(userConvos) && userConvos.length > 0) {
          const latest = userConvos[userConvos.length - 1]
          const { data: serverMessages } = await apiClient.get('/chatMessages', {
            params: { conversationId: latest.id },
          })
          conversation = {
            ...latest,
            messages: Array.isArray(serverMessages) ? serverMessages : [],
            isLocalOnly: false,
          }
          saveLocalConversation(conversation)
        }
      } catch {}
    }
  }

  // 3. Si sigue sin existir, crear una nueva conversación limpia
  if (!conversation) {
    conversation = createNewConversation({ userId: safeUser, page: currentPage })
    saveLocalConversation(conversation)
    if (safeUser !== GUEST_USER_ID) {
      syncConversationToServer(conversation).catch(() => {})
    }
  }

  return conversation
}

/**
 * Agrega un mensaje a la conversación y lo persiste de inmediato.
 *
 * @param {Object} conversation Conversación actual.
 * @param {Object} messageData Datos del mensaje a incorporar.
 * @returns {Object} Conversación actualizada.
 */
export function addMessageToConversation(conversation, messageData) {
  const formatted = formatChatMessage(messageData)
  const existingMessages = Array.isArray(conversation.messages) ? conversation.messages : []

  // Evitar duplicados por id
  const withoutDupe = existingMessages.filter((m) => m.id !== formatted.id)
  const nextMessages = [...withoutDupe, formatted].slice(-MAX_HISTORY_MESSAGES)

  const updated = {
    ...conversation,
    messages: nextMessages,
    updatedAt: new Date().toISOString(),
  }

  saveLocalConversation(updated)

  if (updated.userId && updated.userId !== GUEST_USER_ID) {
    syncMessageToServer(updated.id, formatted, updated.userId).catch(() => {})
  }

  return updated
}

/**
 * Actualiza el estado de un mensaje existente (por ejemplo, cambiar de 'sending' a 'sent' o 'error').
 */
export function updateMessageInConversation(conversation, messageId, updates) {
  if (!conversation || !messageId) return conversation

  const updatedMessages = (conversation.messages || []).map((m) => {
    if (m.id === messageId) {
      return { ...m, ...updates }
    }
    return m
  })

  const updated = {
    ...conversation,
    messages: updatedMessages,
    updatedAt: new Date().toISOString(),
  }

  saveLocalConversation(updated)

  const updatedMsg = updatedMessages.find((m) => m.id === messageId)
  if (updatedMsg && updated.userId && updated.userId !== GUEST_USER_ID) {
    syncMessageToServer(updated.id, updatedMsg, updated.userId).catch(() => {})
  }

  return updated
}

/**
 * Migra los mensajes de la conversación de invitado a la cuenta del usuario cuando inicia sesión.
 * Evita mensajes duplicados y conserva el historial previo del usuario.
 *
 * @param {string} userId Identificador del usuario que inició sesión.
 * @returns {Promise<Object|null>} Conversación consolidada del usuario.
 */
export async function migrateGuestChatToUser(userId) {
  if (!userId || userId === GUEST_USER_ID) return null

  const guestConvo = readLocal(GUEST_CHAT_KEY, null)
  if (!guestConvo || !Array.isArray(guestConvo.messages) || guestConvo.messages.length === 0) {
    return null
  }

  // Obtener la conversación actual del usuario o crear una
  const userConvo = await getActiveConversation(userId)

  // Combinar mensajes de invitado con los del usuario evitando duplicados por ID
  const messageMap = new Map()
  ;(userConvo.messages || []).forEach((m) => messageMap.set(m.id, m))
  guestConvo.messages.forEach((m) => {
    if (!messageMap.has(m.id)) {
      messageMap.set(m.id, m)
    }
  })

  const mergedMessages = Array.from(messageMap.values()).slice(-MAX_HISTORY_MESSAGES)

  const consolidated = {
    ...userConvo,
    userId,
    messages: mergedMessages,
    isLocalOnly: false,
    updatedAt: new Date().toISOString(),
  }

  // Guardar en local del usuario y sincronizar con JSON Server
  saveLocalConversation(consolidated)
  await syncConversationToServer(consolidated)

  for (const m of consolidated.messages) {
    await syncMessageToServer(consolidated.id, m, userId)
  }

  // Limpiar el chat de invitado para evitar duplicaciones futuras
  removeLocal(GUEST_CHAT_KEY)

  return consolidated
}
