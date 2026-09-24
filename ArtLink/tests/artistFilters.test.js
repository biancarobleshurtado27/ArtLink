import { describe, expect, it } from 'vitest'
import { filterArtists, sortArtists } from '../src/utils/artistFilters'

const artists = [
  { displayName: 'Mateo Ríos', username: 'mateorios', disciplines: ['Ilustración'], styles: ['Fantástico'], availability: 'open', basePrice: 80, rating: 4.9, verified: true },
  { displayName: 'Sofía Nakamura', username: 'sofinaka', disciplines: ['Retrato'], styles: ['Anime'], availability: 'waitlist', basePrice: 120, rating: 4.8, verified: true },
]

describe('artist directory filters', () => {
  it('filters by query, availability and maximum price', () => {
    expect(filterArtists(artists, { query: 'sofi', availability: 'waitlist', maxPrice: 150 })).toHaveLength(1)
    expect(filterArtists(artists, { query: 'sofi', availability: 'open' })).toHaveLength(0)
  })

  it('sorts by price and rating without mutating the source', () => {
    expect(sortArtists(artists, 'price').map((artist) => artist.displayName)).toEqual(['Mateo Ríos', 'Sofía Nakamura'])
    expect(sortArtists(artists, 'rating').map((artist) => artist.displayName)).toEqual(['Mateo Ríos', 'Sofía Nakamura'])
    expect(artists[0].displayName).toBe('Mateo Ríos')
  })
})