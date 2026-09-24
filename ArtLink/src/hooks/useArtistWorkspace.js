import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from './useAuth'
import { getArtistByUserId, updateArtist } from '../services/artistService'
import { getPortfolioItems, createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from '../services/portfolioService'
import { getCommissions, createCommission, updateCommission, deleteCommission } from '../services/commissionService'
import { getRequests, updateRequest } from '../services/requestService'
import { getRandomInspiration } from '../services/externalService'

export default function useArtistWorkspace() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [commissions, setCommissions] = useState([])
  const [requests, setRequests] = useState([])
  const [inspiration, setInspiration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [artist] = await getArtistByUserId(user.id)
      if (!artist) throw new Error('No encontramos el perfil de artista asociado a esta cuenta.')
      const [items, rates, received] = await Promise.all([
        getPortfolioItems({ artistId: artist.id }),
        getCommissions({ artistId: artist.id }),
        getRequests({ artistId: artist.id }),
      ])
      setProfile(artist)
      setPortfolio(items)
      setCommissions(rates)
      setRequests(received)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const assertOwner = useCallback((resource) => {
    if (!profile || resource.artistId !== profile.id) throw new Error('No tienes permiso para modificar este recurso.')
  }, [profile])

  async function mutate(action) {
    setBusy(true)
    setError(null)
    try { return await action() } catch (mutationError) { setError(mutationError); throw mutationError } finally { setBusy(false) }
  }

  const actions = useMemo(() => ({
    updateAvailability: (availability, slots) => mutate(async () => { const updated = await updateArtist(profile.id, { availability, slots }); setProfile(updated); return updated }),
    createPortfolio: (item) => mutate(async () => { const created = await createPortfolioItem({ ...item, artistId: profile.id }); setPortfolio((current) => [...current, created]); return created }),
    updatePortfolio: (item) => mutate(async () => { assertOwner(item); const updated = await updatePortfolioItem(item.id, item); setPortfolio((current) => current.map((entry) => entry.id === item.id ? updated : entry)); return updated }),
    deletePortfolio: (item) => mutate(async () => { assertOwner(item); await deletePortfolioItem(item.id); setPortfolio((current) => current.filter((entry) => entry.id !== item.id)) }),
    createCommission: (commission) => mutate(async () => { const created = await createCommission({ ...commission, artistId: profile.id }); setCommissions((current) => [...current, created]); return created }),
    updateCommission: (commission) => mutate(async () => { assertOwner(commission); const updated = await updateCommission(commission.id, commission); setCommissions((current) => current.map((entry) => entry.id === commission.id ? updated : entry)); return updated }),
    deleteCommission: (commission) => mutate(async () => { assertOwner(commission); await deleteCommission(commission.id); setCommissions((current) => current.filter((entry) => entry.id !== commission.id)) }),
    updateRequestStatus: (request, status) => mutate(async () => { assertOwner(request); const updated = await updateRequest(request.id, { status }); setRequests((current) => current.map((entry) => entry.id === request.id ? updated : entry)); return updated }),
    loadInspiration: async () => { const quote = await getRandomInspiration(); setInspiration(quote); return quote },
  }), [assertOwner, profile])

  return { profile, portfolio, commissions, requests, inspiration, loading, busy, error, reload: load, actions }
}
