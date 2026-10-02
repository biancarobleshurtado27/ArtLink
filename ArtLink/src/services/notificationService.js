import apiClient, { getServiceError } from './apiClient'
import { readLocal, saveLocal } from './persistence/localStorageService'
import { getUserScopedKey } from './persistence/storageKeys'

const resource = 'notificaciones'

export async function getNotifications(params = {}) {
  try {
    return (await apiClient.get('/notifications', { params })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getNotificationsByUser(userId) {
  if (!userId) return []
  const cacheKey = getUserScopedKey(userId, 'notifications')
  const cached = readLocal(cacheKey, [])

  try {
    const list = (await apiClient.get('/notifications', { params: { userId } })).data
    if (Array.isArray(list)) {
      saveLocal(cacheKey, list)
      return list
    }
    return []
  } catch (error) {
    return Array.isArray(cached) ? cached : []
  }
}

export async function createNotification(notification) {
  const userId = notification?.userId
  const newNotif = {
    id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...notification,
    read: notification.read ?? false,
    createdAt: notification.createdAt || new Date().toISOString(),
  }

  if (userId) {
    const cacheKey = getUserScopedKey(userId, 'notifications')
    const current = readLocal(cacheKey, [])
    saveLocal(cacheKey, [newNotif, ...current])
  }

  try {
    return (await apiClient.post('/notifications', newNotif)).data
  } catch (error) {
    return newNotif
  }
}

export async function markNotificationAsRead(id, userId) {
  if (userId) {
    const cacheKey = getUserScopedKey(userId, 'notifications')
    const current = readLocal(cacheKey, [])
    const next = current.map((n) => (n.id === id ? { ...n, read: true } : n))
    saveLocal(cacheKey, next)
  }

  try {
    return (await apiClient.patch(`/notifications/${id}`, { read: true })).data
  } catch (error) {
    return { id, read: true }
  }
}

export async function deleteNotification(id, userId) {
  if (userId) {
    const cacheKey = getUserScopedKey(userId, 'notifications')
    const current = readLocal(cacheKey, [])
    const next = current.filter((n) => n.id !== id)
    saveLocal(cacheKey, next)
  }

  try {
    return (await apiClient.delete(`/notifications/${id}`)).data
  } catch (error) {
    return { success: true }
  }
}
