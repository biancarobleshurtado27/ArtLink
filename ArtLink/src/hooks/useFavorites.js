import { useCallback, useEffect, useState } from 'react'
import useAuth from './useAuth'
import {
  addFavorite,
  getFavoritesByUser,
  removeFavorite,
} from '../services/favoriteService'
import { readLocal } from '../services/persistence/localStorageService'
import { getUserScopedKey } from '../services/persistence/storageKeys'

export default function useFavorites() {
  const { user } = useAuth()
  const userId = user?.id || null

  // Carga inicial instantánea desde cache local de usuario/invitado
  const [ids, setIds] = useState(() => {
    const key = getUserScopedKey(userId, 'favorites')
    const cached = readLocal(key, [])
    return Array.isArray(cached) ? cached : []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Carga desde JSON Server (fuente principal de datos) cuando el usuario está disponible
  const loadFavorites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const serverIds = await getFavoritesByUser(userId)
      setIds(serverIds)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  async function toggle(id) {
    if (!id) return
    const targetId = String(id)
    const isCurrentlyFav = ids.includes(targetId)

    // Actualización optimista inmediata
    const previous = [...ids]
    const next = isCurrentlyFav
      ? ids.filter((entry) => entry !== targetId)
      : [...ids, targetId]

    setIds(next)

    try {
      if (isCurrentlyFav) {
        await removeFavorite(userId, targetId)
      } else {
        await addFavorite(userId, targetId)
      }
    } catch (err) {
      // Reversión visual si la petición al servidor falla
      console.error('[useFavorites] Error al sincronizar favorito, revirtiendo estado:', err)
      setIds(previous)
      setError(err)
    }
  }

  return {
    ids,
    isFavorite: (id) => ids.includes(String(id)),
    toggle,
    count: ids.length,
    loading,
    error,
    reload: loadFavorites,
  }
}