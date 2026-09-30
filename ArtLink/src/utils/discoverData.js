const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalize = (value = '') => value.toString().trim().toLocaleLowerCase()

export const RANKING_EMPTY_MESSAGE = 'Aún no hay suficientes datos para generar este ranking.'

const ACTIVE_REQUEST_STATUSES = ['accepted', 'in_progress']

export function categoryMatches(categoryName, artworkCategory) {
  const target = normalize(artworkCategory)
  if (!target) return false
  const name = normalize(categoryName)
  if (!name) return false
  return name.includes(target) || target.includes(name)
}

export function getAvailabilityTone(artist = {}) {
  if (artist.availability === 'open') return toNumber(artist.slots) > 0 ? 'open' : 'closed'
  if (artist.availability === 'waitlist') return 'waitlist'
  if (artist.availability === 'closed') return 'closed'
  return 'unknown'
}

export function getAvailabilityStatus(artist = {}) {
  const tone = getAvailabilityTone(artist)
  const slots = toNumber(artist.slots)
  const labels = {
    open: `Cupos abiertos · ${slots} libre${slots === 1 ? '' : 's'}`,
    waitlist: 'Lista de espera',
    closed: 'Cupos cerrados',
    unknown: 'Disponibilidad sin datos',
  }
  return { tone, slots, label: labels[tone] }
}

export function getArtistWorks(portfolioItems = [], artistId) {
  return (portfolioItems || []).filter((item) => item && item.artistId === artistId)
}

export function getCommissionStats(requests = [], artistId) {
  const owned = (requests || []).filter((request) => request && request.artistId === artistId)
  return {
    requestCount: owned.length,
    completedCount: owned.filter((request) => request.status === 'completed').length,
    activeCount: owned.filter((request) => ACTIVE_REQUEST_STATUSES.includes(request.status)).length,
    clientCount: new Set(owned.filter((r) => r.status !== 'rejected').map((r) => r.clientId).filter(Boolean)).size,
    earnings: owned
      .filter((request) => request.status !== 'rejected')
      .reduce((total, request) => total + toNumber(request.budget), 0),
  }
}

export function buildArtistRanking(artists = [], portfolioItems = [], requests = [], limit = 4) {
  return (artists || [])
    .filter((artist) => artist && (artist.displayName || artist.name))
    .map((artist) => {
      const works = getArtistWorks(portfolioItems, artist.id)
      const stats = getCommissionStats(requests, artist.id)
      return {
        ...artist,
        works,
        workCount: works.length,
        ...stats,
        availability: getAvailabilityStatus(artist),
        score:
          toNumber(artist.rating) * 3 +
          stats.completedCount * 2 +
          stats.activeCount +
          toNumber(artist.verified ? 1 : 0) +
          Math.min(toNumber(artist.slots), 3) * 0.5 +
          works.length * 0.25,
      }
    })
    .filter((artist) => artist.workCount > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
}

export function buildArtworkCards(portfolioItems = [], artists = [], categories = []) {
  const artistsById = new Map((artists || []).map((artist) => [artist.id, artist]))
  return (portfolioItems || [])
    .filter((item) => item && (item.title || item.image))
    .map((item) => {
      const artist = artistsById.get(item.artistId) || {}
      const name = artist.displayName || artist.name
      return {
        id: item.id,
        title: item.title || 'Obra sin título',
        image: item.image,
        description: item.description || '',
        category: item.category || '',
        createdAt: item.createdAt || '',
        likes: Math.max(0, toNumber(item.likes)),
        artistId: item.artistId,
        artistName: name || 'Perfil de artista no disponible',
        artistHandle: artist.username ? `@${artist.username}` : '',
        artistAvatar: artist.avatar || '',
        artistPrice: toNumber(artist.basePrice),
        artistRating: toNumber(artist.rating),
        availability: getAvailabilityStatus(artist),
        categoryIds: (categories || [])
          .filter((category) => categoryMatches(category.name, item.category))
          .map((category) => category.id),
        searchTerms: [
          item.title,
          item.description,
          item.category,
          name,
          artist.username,
          ...(artist.disciplines || []),
          ...(artist.styles || []),
        ]
          .filter(Boolean)
          .join(' '),
      }
    })
}

export function buildCategoryOptions(categories = [], artworks = [], { onlyPopulated = true } = {}) {
  const options = (categories || []).map((category) => {
    const matches = (artworks || []).filter((artwork) => (artwork.categoryIds || []).includes(category.id))
    return {
      id: category.id,
      label: category.name,
      slug: category.slug,
      color: category.color,
      count: matches.length,
      artistCount: new Set(matches.map((artwork) => artwork.artistId).filter(Boolean)).size,
      cover: matches.find((artwork) => artwork.image)?.image || '',
    }
  })
  return [
    { id: 'all', label: 'Todas las Obras', slug: null, count: (artworks || []).length, artistCount: 0, cover: '' },
    ...(onlyPopulated ? options.filter((option) => option.count > 0) : options),
  ]
}

export function buildPlatformMetrics(artists = [], portfolioItems = []) {
  const prices = (artists || []).map((artist) => toNumber(artist.basePrice)).filter((price) => price > 0)
  const ratings = (artists || []).map((artist) => toNumber(artist.rating)).filter((rating) => rating > 0)
  const totalArtists = (artists || []).length
  const totalWorks = (portfolioItems || []).length

  return [
    {
      id: 'm1',
      number: totalArtists > 0 ? String(totalArtists) : null,
      label: 'Creadores Activos',
      icon: 'purple',
    },
    {
      id: 'm2',
      number: prices.length > 0 ? `$${Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)} USD` : null,
      label: 'Tarifa Base Promedio',
      icon: 'green',
    },
    {
      id: 'm3',
      number: '100%',
      label: 'Custodia Escrow',
      icon: 'pink',
    },
    {
      id: 'm4',
      number: ratings.length > 0 ? `${(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)} / 5` : null,
      label: totalWorks > 0 ? `${totalWorks} Obras en Portafolio` : 'Obras en Portafolio',
      icon: 'yellow',
    },
  ]
}

export function getDaySeed(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
}

export function buildShowcaseCards(artists = [], portfolioItems = [], { limit = 3, seed = getDaySeed() } = {}) {
  const knownArtistIds = new Set((artists || []).map((artist) => artist.id))
  const pool = (portfolioItems || []).filter((item) => item && item.image && knownArtistIds.has(item.artistId))
  if (pool.length === 0) return []

  const tapes = ['tape-yellow tape-left', 'tape-pink tape-center', 'tape-yellow tape-right']
  const badges = ['badge-pill-purple', 'badge-pill-mint', 'badge-pill-rose', 'badge-pill-yellow']
  const total = Math.min(limit, pool.length)
  const artistsById = new Map((artists || []).map((artist) => [artist.id, artist]))
  const used = new Set()

  return Array.from({ length: total }, (_, slot) => {
    let index = (seed * 3 + slot) % pool.length
    while (used.has(index)) index = (index + 1) % pool.length
    used.add(index)

    const item = pool[index]
    const artist = artistsById.get(item.artistId) || {}
    return {
      id: `showcase-${item.id}-${slot}-${seed}`,
      artistId: item.artistId,
      artistName: artist.displayName || artist.name || '',
      category: item.category || '',
      workTitle: item.title || '',
      image: item.image,
      tapeClass: tapes[slot % tapes.length],
      badgeClass: badges[(slot + seed) % badges.length],
    }
  })
}

export function buildCategoryNavigation(categories = [], { limit = 0 } = {}) {
  const options = (categories || []).filter((category) => category && category.name)
  return limit > 0 ? options.slice(0, limit) : options
}
