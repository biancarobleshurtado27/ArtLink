import { useEffect, useState } from 'react'
import { getArtistById } from '../services/artistService'
import { getCommissions } from '../services/commissionService'
import { getPortfolioItems } from '../services/portfolioService'
import { getReviewsByArtistId } from '../services/reviewService'
import { getRealArtistProfile, getRealArtistPortfolio, getRealArtistCommissions, getRealArtistReviews } from '../services/realArtistsService'

export default function useArtistProfile(artistId) {
  const [profile, setProfile] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [commissions, setCommissions] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    
    const isExternal = artistId && artistId.startsWith('ext-')
    
    const fetchPromises = isExternal
      ? [
          getRealArtistProfile(artistId),
          getRealArtistPortfolio(artistId),
          getRealArtistCommissions(artistId),
          getRealArtistReviews(artistId),
        ]
      : [
          getArtistById(artistId),
          getPortfolioItems({ artistId }),
          getCommissions({ artistId }),
          getReviewsByArtistId(artistId).catch(() => []),
        ]

    Promise.all(fetchPromises)
      .then(([artist, items, artistCommissions, artistReviews]) => {
        if (!active) return
        setProfile(artist)
        setPortfolio(items || [])
        setCommissions(artistCommissions || [])
        setReviews(artistReviews || [])
      })
      .catch((requestError) => { if (active) setError(requestError) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [artistId])

  return { profile, portfolio, commissions, reviews, loading, error }
}