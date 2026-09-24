import apiClient, { getServiceError } from './apiClient'

const resource = 'mensajes'

export async function getMessages(params = {}) {
  try { return (await apiClient.get('/messages', { params })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function getMessageById(id) {
  try { return (await apiClient.get(`/messages/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function createMessage(message) {
  try { return (await apiClient.post('/messages', { ...message, read: message.read ?? false, createdAt: message.createdAt || new Date().toISOString() })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function markMessageAsRead(id) {
  try { return (await apiClient.patch(`/messages/${id}`, { read: true })).data } catch (error) { throw getServiceError(error, resource) }
}
export async function updateMessage(id, changes) {
  try { return (await apiClient.patch(`/messages/${id}`, changes)).data } catch (error) { throw getServiceError(error, resource) }
}
export async function deleteMessage(id) {
  try { return (await apiClient.delete(`/messages/${id}`)).data } catch (error) { throw getServiceError(error, resource) }
}
