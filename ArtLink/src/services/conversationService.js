import apiClient, { getServiceError } from './apiClient'

const resource = 'conversaciones'

/**
 * Busca si ya existe una conversación entre dos usuarios específicos.
 * Compara IDs con String(a) === String(b) y admite cualquier orden de participantes.
 *
 * @param {string} userIdA
 * @param {string} userIdB
 * @returns {Promise<Object|null>}
 */
export async function findConversationBetweenUsers(userIdA, userIdB) {
  if (!userIdA || !userIdB) return null
  const safeA = String(userIdA)
  const safeB = String(userIdB)

  try {
    const { data: convos } = await apiClient.get('/conversations')
    if (!Array.isArray(convos)) return null

    const match = convos.find((c) => {
      if (c.isDemoData) return false
      const ids = Array.isArray(c.participantIds) ? c.participantIds.map(String) : []
      return ids.length === 2 && ids.includes(safeA) && ids.includes(safeB)
    })

    return match || null
  } catch (error) {
    console.warn('[conversationService] Error al buscar conversación entre usuarios:', error?.message)
    return null
  }
}

/**
 * Crea una conversación entre dos usuarios únicamente si no existe previamente.
 *
 * @param {string} userIdA
 * @param {string} userIdB
 * @param {Object} [context={}]
 * @returns {Promise<Object>}
 */
export async function createConversationIfNeeded(userIdA, userIdB, context = {}) {
  if (!userIdA || !userIdB) throw new Error('Se requieren dos usuarios para crear una conversación.')
  const safeA = String(userIdA)
  const safeB = String(userIdB)
  if (safeA === safeB) throw new Error('No puedes crear una conversación contigo mismo.')

  const existing = await findConversationBetweenUsers(safeA, safeB)
  if (existing) {
    return existing
  }

  const now = new Date().toISOString()
  const newConvo = {
    id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    participantIds: [safeA, safeB],
    createdAt: now,
    updatedAt: now,
    lastMessageId: null,
    relatedArtistProfileId: context.artistProfileId || context.relatedArtistProfileId || null,
    relatedRequestId: context.requestId || context.relatedRequestId || null,
    isDemoData: false,
  }

  try {
    const { data: created } = await apiClient.post('/conversations', newConvo)
    return created
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

/**
 * Obtiene una conversación por ID validando que el usuario pertenezca a sus participantes.
 *
 * @param {string} conversationId
 * @param {string} [userId]
 * @returns {Promise<Object|null>}
 */
export async function getConversationById(conversationId, userId) {
  if (!conversationId) return null
  try {
    const { data: convo } = await apiClient.get(`/conversations/${conversationId}`)
    if (!convo || convo.isDemoData) return null

    if (userId) {
      const ids = Array.isArray(convo.participantIds) ? convo.participantIds.map(String) : []
      if (!ids.includes(String(userId))) {
        throw new Error('No tienes permiso para ver esta conversación.')
      }
    }

    return convo
  } catch (error) {
    if (error.response?.status === 404) return null
    throw getServiceError(error, resource)
  }
}

/**
 * Lista todas las conversaciones reales que pertenecen al usuario autenticado.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function listConversationsForUser(userId) {
  if (!userId) return []
  const safeUser = String(userId)

  try {
    const { data: convos } = await apiClient.get('/conversations')
    if (!Array.isArray(convos)) return []

    const userConvos = convos.filter((c) => {
      if (c.isDemoData) return false
      const ids = Array.isArray(c.participantIds) ? c.participantIds.map(String) : []
      return ids.includes(safeUser)
    })

    return userConvos.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

/**
 * Envía un mensaje en una conversación y actualiza updatedAt y lastMessageId.
 *
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} receiverId
 * @param {string} content
 * @returns {Promise<Object>}
 */
export async function sendMessage(conversationId, senderId, receiverId, content) {
  const cleanContent = typeof content === 'string' ? content.trim() : ''
  if (!cleanContent) throw new Error('El mensaje no puede estar vacío.')
  if (cleanContent.length > 3000) throw new Error('El mensaje supera el límite de 3000 caracteres.')
  if (!senderId || !receiverId) throw new Error('Se requiere remitente y destinatario para enviar el mensaje.')
  if (String(senderId) === String(receiverId)) throw new Error('No puedes enviarte un mensaje a ti mismo.')

  const now = new Date().toISOString()
  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    conversationId: String(conversationId),
    senderId: String(senderId),
    receiverId: String(receiverId),
    content: cleanContent,
    createdAt: now,
    readAt: null,
    isDemoData: false,
    text: cleanContent,
    read: false,
  }

  try {
    const { data: createdMsg } = await apiClient.post('/messages', newMsg)

    try {
      await apiClient.patch(`/conversations/${conversationId}`, {
        lastMessageId: createdMsg.id,
        updatedAt: now,
      })
    } catch (patchErr) {
      console.warn('[conversationService] Advertencia al actualizar conversación:', patchErr?.message)
    }

    return createdMsg
  } catch (error) {
    throw getServiceError(error, 'mensajes')
  }
}

/**
 * Obtiene los mensajes pertenecientes a una conversación.
 *
 * @param {string} conversationId
 * @param {string} [userId]
 * @returns {Promise<Array>}
 */
export async function getMessagesByConversation(conversationId, userId) {
  if (!conversationId) return []

  try {
    const { data: messages } = await apiClient.get('/messages', {
      params: { conversationId: String(conversationId) },
    })

    if (!Array.isArray(messages)) return []

    const valid = messages.filter((m) => {
      if (m.isDemoData) return false
      if (String(m.conversationId) !== String(conversationId)) return false
      if (userId) {
        return String(m.senderId) === String(userId) || String(m.receiverId) === String(userId)
      }
      return true
    })

    const normalized = valid.map((m) => ({
      ...m,
      content: m.content || m.text || '',
      text: m.content || m.text || '',
    }))

    return normalized.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } catch (error) {
    throw getServiceError(error, 'mensajes')
  }
}

/**
 * Marca como leídos los mensajes de una conversación dirigidos al usuario actual.
 *
 * @param {string} conversationId
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function markConversationAsRead(conversationId, userId) {
  if (!conversationId || !userId) return []
  const safeUser = String(userId)

  try {
    const messages = await getMessagesByConversation(conversationId, userId)
    const unread = messages.filter((m) => String(m.receiverId) === safeUser && !m.readAt && !m.read)

    const now = new Date().toISOString()
    const updates = await Promise.all(
      unread.map((m) =>
        apiClient
          .patch(`/messages/${m.id}`, { readAt: now, read: true })
          .then((r) => r.data)
          .catch(() => null)
      )
    )

    return updates.filter(Boolean)
  } catch (error) {
    console.warn('[conversationService] Error al marcar conversación como leída:', error?.message)
    return []
  }
}
