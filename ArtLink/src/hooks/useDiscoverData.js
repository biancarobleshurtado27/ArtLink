import { useCallback, useEffect, useMemo, useState } from 'react'
import { getArtists } from '../services/artistService'
import { getCategories } from '../services/categoryService'
import { getPortfolioItems } from '../services/portfolioService'
import { getRequests } from '../services/requestService'
import {
  buildArtistRanking,
  buildArtworkCards,
  buildCategoryOptions,
  buildPlatformMetrics,
  buildShowcaseCards,
} from '../utils/discoverData'

const EMPTY_SOURCES = { artists: [], portfolioItems: [], categories: [], requests: [] }

function request(active, setSources, setError, setLoading) {
  Promise.all([
    getArtists(), 
    getPortfolioItems(), 
    getCategories(), 
    getRequests()
  ])
    .then(([artists, portfolioItems, categories, requests]) => {
      if (!active) return
      setSources({
        artists: artists || [],
        portfolioItems: portfolioItems || [],
        categories: categories || [],
        requests: requests || [],
      })
    })
    .catch((requestError) => { if (active) setError(requestError) })
    .finally(() => { if (active) setLoading(false) })
}

export default function useDiscoverData() {
  const [sources, setSources] = useState(EMPTY_SOURCES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    request(active, setSources, setError, setLoading)
    return () => { active = false }
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    let active = true
    request(active, setSources, setError, setLoading)
    return function cancel() { active = false }
  }, [])

  const artworks = useMemo(
    () => buildArtworkCards(sources.portfolioItems, sources.artists, sources.categories),
    [sources.portfolioItems, sources.artists, sources.categories]
  )

  const categoryOptions = useMemo(
    () => buildCategoryOptions(sources.categories, artworks),
    [sources.categories, artworks]
  )

  const ranking = useMemo(
    () => buildArtistRanking(sources.artists, sources.portfolioItems, sources.requests),
    [sources.artists, sources.portfolioItems, sources.requests]
  )

  const metrics = useMemo(
    () => buildPlatformMetrics(sources.artists, sources.portfolioItems),
    [sources.artists, sources.portfolioItems]
  )

  const showcaseCards = useMemo(
    () => buildShowcaseCards(sources.artists, sources.portfolioItems),
    [sources.artists, sources.portfolioItems]
  )

  return { ...sources, artworks, categoryOptions, ranking, metrics, showcaseCards, loading, error, reload }
}
