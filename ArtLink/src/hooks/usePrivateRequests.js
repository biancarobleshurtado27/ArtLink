import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth'
import { getRequests } from '../services/requestService'
import { getMessages, createMessage, markMessageAsRead } from '../services/messageService'
import { getArtistById, getArtistByUserId } from '../services/artistService'

export default function usePrivateRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getRequests()
      const artistProfiles = user.role === 'artista' ? await getArtistByUserId(user.id) : []
      const artistId = artistProfiles[0]?.id
      const visible = user.role === 'cliente' ? all.filter((request) => request.clientId === user.id) : all.filter((request) => request.artistId === artistId)
      setRequests(visible)
      setError(null)
    } catch (requestError) { setError(requestError) } finally { setLoading(false) }
  }, [user])

  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer) }, [load])

  const loadMessages = useCallback(async (request) => {
    const all = await getMessages({ requestId: request.id })
    const allowed = all.filter((message) => message.senderId === user.id || message.receiverId === user.id)
    setMessages(allowed)
    const unread = allowed.filter((message) => message.receiverId === user.id && !message.read)
    await Promise.all(unread.map((message) => markMessageAsRead(message.id)))
    setMessages((current) => current.map((message) => unread.some((item) => item.id === message.id) ? { ...message, read: true } : message))
  }, [user])

  async function sendMessage(request, body, receiverId) {
    if (!requests.some((item) => item.id === request.id)) throw new Error('No tienes acceso a esta conversación.')
    const targetId = user.role === 'cliente' ? (await getArtistById(request.artistId)).userId : receiverId
    const message = await createMessage({ requestId: request.id, senderId: user.id, receiverId: targetId, body })
    setMessages((current) => [...current, message])
    return message
  }

  return { requests, messages, loading, error, reload: load, loadMessages, sendMessage }
}
