import { useCallback, useEffect, useState } from 'react'
import { getArtists } from '../services/artistService'

function request(active, setArtists, setError, setLoading) {
  return getArtists()
    .then((data) => { if (active) setArtists(data) })
    .catch((requestError) => { if (active) setError(requestError) })
    .finally(() => { if (active) setLoading(false) })
}

export default function useArtists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    request(active, setArtists, setError, setLoading)
    return () => { active = false }
  }, [setArtists, setError, setLoading])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    let active = true
    request(active, setArtists, setError, setLoading)
    return function cancel() { active = false }
  }, [setArtists, setError, setLoading])

  return { artists, loading, error, reload }
}