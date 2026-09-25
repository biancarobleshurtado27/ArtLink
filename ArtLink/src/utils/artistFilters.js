const normalize = (value = '') => value.toString().trim().toLocaleLowerCase()

export function filterArtists(artists = [], filters = {}) {
  const query = normalize(filters.query)
  const discipline = normalize(filters.discipline)
  const style = normalize(filters.style)
  const availability = normalize(filters.availability)
  const maxPrice = Number(filters.maxPrice)

  return (artists || []).filter((artist) => {
    const matchesQuery =
      !query ||
      normalize(artist.displayName).includes(query) ||
      normalize(artist.username).includes(query) ||
      (artist.disciplines || []).some((d) => normalize(d).includes(query)) ||
      (artist.styles || []).some((s) => normalize(s).includes(query))

    const matchesDiscipline =
      !discipline ||
      (artist.disciplines || []).some((d) => normalize(d) === discipline)

    const matchesStyle =
      !style ||
      (artist.styles || []).some((s) => normalize(s) === style)

    const matchesAvailability =
      !availability || normalize(artist.availability) === availability

    const matchesPrice =
      !maxPrice || (Number(artist.basePrice) || 0) <= maxPrice

    return matchesQuery && matchesDiscipline && matchesStyle && matchesAvailability && matchesPrice
  })
}

export function sortArtists(artists = [], sort = 'relevance') {
  return [...(artists || [])].sort((first, second) => {
    if (sort === 'price' || sort === 'price_asc') return (first.basePrice || 0) - (second.basePrice || 0)
    if (sort === 'price_desc') return (second.basePrice || 0) - (first.basePrice || 0)
    if (sort === 'rating') return (second.rating || 0) - (first.rating || 0)
    return Number(second.verified) - Number(first.verified) || (second.rating || 0) - (first.rating || 0)
  })
}

export function getArtistOptions(artists = [], field = '') {
  return [...new Set((artists || []).flatMap((artist) => artist[field] || []))].sort((first, second) =>
    first.localeCompare(second)
  )
}