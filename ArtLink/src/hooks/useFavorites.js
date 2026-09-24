import { useEffect, useState } from 'react'

const FAVORITES_KEY = 'artlink_favorites'

function readFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function useFavorites() {
  const [ids, setIds] = useState(readFavorites)

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
  }, [ids])

  function toggle(id) {
    setIds((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]))
  }

  return {
    ids,
    isFavorite: (id) => ids.includes(id),
    toggle,
    count: ids.length,
  }
}