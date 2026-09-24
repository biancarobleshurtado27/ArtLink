const normalize = (value = '') => value.toString().trim().toLocaleLowerCase()

export function filterArtists(artists, filters) {
  const query = normalize(filters.query)
  const discipline = normalize(filters.discipline)
  const style = normalize(filters.style)
  const availability = normalize(filters.availability)
  const maxPrice = Number(filters.maxPrice)

  return artists.filter((artist) => {
    const matchesQuery = !query || [artist.displayName, artist.username].some((value) => normalize(value).includes(query))
    const matchesDiscipline = !discipline || artist.disciplines.some((value) => normalize(value) === discipline)
    const matchesStyle = !style || artist.styles.some((value) => normalize(value) === style)
    const matchesAvailability = !availability || normalize(artist.availability) === availability
    const matchesPrice = !maxPrice || artist.basePrice <= maxPrice
    return matchesQuery && matchesDiscipline && matchesStyle && matchesAvailability && matchesPrice
  })
}

export function sortArtists(artists, sort) {
  return [...artists].sort((first, second) => {
    if (sort === 'price') return first.basePrice - second.basePrice
    if (sort === 'rating') return second.rating - first.rating
    return Number(second.verified) - Number(first.verified) || second.rating - first.rating
  })
}

export function getArtistOptions(artists, field) {
  return [...new Set(artists.flatMap((artist) => artist[field] || []))].sort((first, second) => first.localeCompare(second))
}