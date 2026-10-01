import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth'
import { getRequests } from '../services/requestService'
import { createMessage, getMessages, markMessageAsRead } from '../services/messageService'
import { getArtistById, getArtistByUserId, getArtists } from '../services/artistService'
import { getCommissions } from '../services/commissionService'

export default function usePrivateRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [clientRequests, setClientRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [all, artists, commissions] = await Promise.all([
        getRequests(),
        getArtists().catch(() => []),
        getCommissions().catch(() => []),
      ])
      const artistsById = new Map(artists.map((a) => [a.id, a]))
      const commissionsById = new Map(commissions.map((c) => [c.id, c]))

      let artistProfile = null
      if (user) {
        try {
          const artistProfiles = await getArtistByUserId(user.id)
          artistProfile = artistProfiles[0] || null
        } catch {
          artistProfile = null
        }
      }

      const enriched = all.map((req) => {
        const artistObj = artistsById.get(req.artistId)
        const commObj = commissionsById.get(req.packageId || req.commissionId)
        return {
          ...req,
          artistName: artistObj?.displayName || artistObj?.name || req.artistName || 'Artista ArtLink',
          artistUsername: artistObj?.username || 'artista',
          artistAvatar: artistObj?.avatar || req.artistAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
          artistVerified: artistObj?.verified ?? true,
          commissionTitle: req.commissionTitle || commObj?.title || 'Comisión personalizada',
          commissionDesc: req.description || commObj?.description || 'Especificaciones del encargo acordadas bajo custodia Escrow.',
          budget: req.budget || req.price || commObj?.price || 100,
          price: req.price || req.budget || commObj?.price || 100,
        }
      })

      if (!user) {
        setClientRequests(enriched)
        setRequests(enriched)
        setError(null)
        return
      }

      // Solicitudes realizadas por el usuario como cliente
      const myClientRequests = enriched.filter((request) => request.clientId === user.id)

      // Solicitudes recibidas como artista (si aplica)
      const myArtistRequests = artistProfile
        ? enriched.filter((request) => request.artistId === artistProfile.id)
        : []

      // Combinar sin duplicados para centro de conversaciones
      const requestMap = new Map()
      myClientRequests.forEach((req) => requestMap.set(req.id, req))
      myArtistRequests.forEach((req) => requestMap.set(req.id, req))

      // Si el usuario aún no tiene solicitudes propias, mostrar las solicitudes del sistema
      if (requestMap.size === 0) {
        enriched.forEach((req) => requestMap.set(req.id, req))
      }

      setClientRequests(myClientRequests.length > 0 ? myClientRequests : enriched)
      setRequests(Array.from(requestMap.values()))
      setError(null)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const loadMessages = useCallback(async (request) => {
    if (!user || !request) return
    const all = await getMessages({ requestId: request.id })
    const allowed = all.filter((message) => message.senderId === user.id || message.receiverId === user.id)
    setMessages(allowed)

    const unread = allowed.filter((message) => message.receiverId === user.id && !message.read)
    await Promise.all(unread.map((message) => markMessageAsRead(message.id)))

    setMessages((current) =>
      current.map((message) => (unread.some((item) => item.id === message.id) ? { ...message, read: true } : message))
    )
  }, [user])

  async function sendMessage(request, bodyText, receiverId) {
    if (!user) throw new Error('Debes iniciar sesión para enviar mensajes.')
    const isOwner = request.clientId === user.id || requests.some((r) => r.id === request.id)
    if (!isOwner) throw new Error('No tienes acceso a esta conversación.')

    let targetId = receiverId
    if (!targetId || targetId === request.artistId || (typeof targetId === 'string' && targetId.startsWith('artist-'))) {
      if (request.clientId === user.id) {
        try {
          const artist = await getArtistById(request.artistId)
          targetId = artist.userId || targetId
        } catch {
          targetId = request.artistId
        }
      } else {
        targetId = request.clientId
      }
    }

    const message = await createMessage({
      requestId: request.id,
      senderId: user.id,
      receiverId: targetId,
      body: bodyText,
      read: false,
    })

    setMessages((current) => [...current, message])
    return message
  }

  return {
    requests,
    clientRequests,
    messages,
    loading,
    error,
    reload: load,
    loadMessages,
    sendMessage,
  }
}

