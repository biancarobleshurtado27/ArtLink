import apiClient, { getServiceError } from './apiClient'
export {
  sendMessage,
  getMessagesByConversation,
  markConversationAsRead,
  findConversationBetweenUsers,
  createConversationIfNeeded,
  getConversationById,
  listConversationsForUser,
} from './conversationService'

const resource = 'mensajes'

export async function getMessages(params = {}) {
  try {
    return (await apiClient.get('/messages', { params })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getMessageById(id) {
  try {
    return (await apiClient.get(`/messages/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function createMessage(message) {
  const content = message.content || message.body || message.text || ''
  const payload = {
    ...message,
    content,
    text: content,
    read: message.read ?? false,
    readAt: message.readAt || null,
    isDemoData: Boolean(message.isDemoData),
    createdAt: message.createdAt || new Date().toISOString(),
  }
  try {
    return (await apiClient.post('/messages', payload)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function markMessageAsRead(id) {
  try {
    return (await apiClient.patch(`/messages/${id}`, { read: true, readAt: new Date().toISOString() })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function updateMessage(id, changes) {
  try {
    return (await apiClient.patch(`/messages/${id}`, changes)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function deleteMessage(id) {
  try {
    return (await apiClient.delete(`/messages/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
