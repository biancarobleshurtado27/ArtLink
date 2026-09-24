import { useEffect, useState } from 'react'
import { getArtists } from '../services/artistService'

export default function useArtists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getArtists()
      .then((data) => { if (active) setArtists(data) })
      .catch((requestError) => { if (active) setError(requestError) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { artists, loading, error }
}