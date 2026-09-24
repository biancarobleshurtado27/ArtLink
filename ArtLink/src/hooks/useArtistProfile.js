import { useEffect, useState } from 'react'
import { getArtistById } from '../services/artistService'
import { getCommissions } from '../services/commissionService'
import { getPortfolioItems } from '../services/portfolioService'

export default function useArtistProfile(artistId) {
  const [profile, setProfile] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      getArtistById(artistId),
      getPortfolioItems({ artistId }),
      getCommissions({ artistId }),
    ])
      .then(([artist, items, artistCommissions]) => {
        if (!active) return
        setProfile(artist)
        setPortfolio(items)
        setCommissions(artistCommissions)
      })
      .catch((requestError) => { if (active) setError(requestError) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [artistId])

  return { profile, portfolio, commissions, loading, error }
}