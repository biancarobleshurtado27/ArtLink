import apiClient, { getServiceError } from './apiClient'

const resource = 'notificaciones'

export async function getNotifications(params = {}) {
  try {
    return (await apiClient.get('/notifications', { params })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function getNotificationsByUser(userId) {
  try {
    return (await apiClient.get('/notifications', { params: { userId } })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function createNotification(notification) {
  try {
    return (
      await apiClient.post('/notifications', {
        ...notification,
        read: notification.read ?? false,
        createdAt: notification.createdAt || new Date().toISOString(),
      })
    ).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function markNotificationAsRead(id) {
  try {
    return (await apiClient.patch(`/notifications/${id}`, { read: true })).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}

export async function deleteNotification(id) {
  try {
    return (await apiClient.delete(`/notifications/${id}`)).data
  } catch (error) {
    throw getServiceError(error, resource)
  }
}
