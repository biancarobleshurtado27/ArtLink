import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth'
import apiClient from '../services/apiClient'
import { getNotificationsByUser } from '../services/notificationService'
import { getRequests } from '../services/requestService'

export const NOTIFICATIONS_CHANGED_EVENT = 'artlink_notifications_changed'

export function triggerNotificationsUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT))
  }
}

export default function useNotificationBadges() {
  const { user } = useAuth()
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [unreadRequestsCount, setUnreadRequestsCount] = useState(0)

  const fetchCounts = useCallback(async () => {
    if (!user || !user.id) {
      setUnreadMessagesCount(0)
      setUnreadNotificationsCount(0)
      setUnreadRequestsCount(0)
      return
    }

    const userIdStr = String(user.id)

    // 1. Contar mensajes sin leer
    try {
      const { data: messages } = await apiClient.get('/messages')
      if (Array.isArray(messages)) {
        const unreadMsgs = messages.filter(
          (m) =>
            !m.isDemoData &&
            String(m.receiverId) === userIdStr &&
            !m.read &&
            !m.readAt
        )
        setUnreadMessagesCount(unreadMsgs.length)
      }
    } catch {
      // Ignorar fallos de red silenciosamente
    }

    // 2. Contar notificaciones sin leer
    try {
      const notifs = await getNotificationsByUser(user.id)
      if (Array.isArray(notifs)) {
        const unread = notifs.filter((n) => !n.read)
        setUnreadNotificationsCount(unread.length)
      }
    } catch {
      // Ignorar fallos de red
    }

    // 3. Contar solicitudes que requieren atención
    try {
      const allRequests = await getRequests()
      if (Array.isArray(allRequests)) {
        // Verificar si se marcaron como leídas globalmente en sesión local
        const allReadSaved = localStorage.getItem('artlink_requests_all_read') === 'true'
        if (allReadSaved) {
          setUnreadRequestsCount(0)
        } else {
          const userRequests = allRequests.filter(
            (r) =>
              (String(r.clientId) === userIdStr || String(r.artistId) === userIdStr) &&
              (r.read === false || r.status === 'pending' || r.status === 'waitlist')
          )
          setUnreadRequestsCount(userRequests.length)
        }
      }
    } catch {
      // Ignorar fallos de red
    }
  }, [user])

  useEffect(() => {
    fetchCounts()

    const handleUpdate = () => {
      fetchCounts()
    }

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleUpdate)
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('focus', handleUpdate)

    const interval = setInterval(fetchCounts, 8000)

    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
      clearInterval(interval)
    }
  }, [fetchCounts])

  const totalAlertsCount = unreadNotificationsCount + unreadRequestsCount

  return {
    unreadMessagesCount,
    unreadNotificationsCount,
    unreadRequestsCount,
    totalAlertsCount,
    refreshBadges: fetchCounts,
  }
}
