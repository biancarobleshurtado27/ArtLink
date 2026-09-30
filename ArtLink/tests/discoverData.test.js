import { describe, expect, it } from 'vitest'
import {
  RANKING_EMPTY_MESSAGE,
  buildArtistRanking,
  buildArtworkCards,
  buildCategoryOptions,
  buildPlatformMetrics,
  buildShowcaseCards,
  categoryMatches,
  getAvailabilityStatus,
  getCommissionStats,
} from '../src/utils/discoverData'

const artists = [
  {
    id: 'artist-1',
    userId: 'user-1',
    displayName: 'Mateo Ríos',
    username: 'mateorios',
    bio: 'Ilustrador editorial.',
    disciplines: ['Ilustración 2D'],
    styles: ['Fantástico'],
    availability: 'open',
    slots: 3,
    rating: 4.9,
    verified: true,
    basePrice: 80,
    avatar: 'https://example.test/avatar-1.jpg',
  },
  {
    id: 'artist-2',
    userId: 'user-2',
    displayName: 'Sofía Nakamura',
    username: 'sofinaka',
    disciplines: ['Retrato'],
    styles: ['Anime'],
    availability: 'waitlist',
    slots: 0,
    rating: 4.2,
    verified: false,
    basePrice: 120,
    avatar: '',
  },
  { id: 'artist-3', userId: 'user-3', displayName: 'Sin obras', username: 'sinobras', availability: 'open', slots: 1 },
]

const portfolioItems = [
  { id: 'p-1', artistId: 'artist-1', title: 'Guardiana del bosque', image: '/a.jpg', category: 'Ilustración', likes: 40, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p-2', artistId: 'artist-1', title: 'Islas flotantes', image: '/b.jpg', category: 'Concept art', likes: 90, createdAt: '2026-03-01T00:00:00.000Z' },
  { id: 'p-3', artistId: 'artist-2', title: 'Retrato de invierno', image: '/c.jpg', category: 'Retrato', createdAt: '2026-02-01T00:00:00.000Z' },
  { id: 'p-4', artistId: 'artist-fantasma', title: 'Obra huérfana', image: '/d.jpg', category: 'Pixel Art' },
]

const categories = [
  { id: 'c-1', name: 'Ilustración 2D', slug: 'ilustracion-2d' },
  { id: 'c-2', name: 'Concept art', slug: 'concept-art' },
  { id: 'c-3', name: 'Retrato', slug: 'retrato' },
  { id: 'c-4', name: 'Emotes', slug: 'emotes' },
]

const requests = [
  { id: 'r-1', artistId: 'artist-1', clientId: 'user-c1', budget: 100, status: 'completed' },
  { id: 'r-2', artistId: 'artist-1', clientId: 'user-c2', budget: 60, status: 'pending' },
  { id: 'r-3', artistId: 'artist-1', clientId: 'user-c1', budget: 30, status: 'rejected' },
  { id: 'r-4', artistId: 'artist-2', clientId: 'user-c1', budget: 200, status: 'completed' },
]

describe('capa de derivación de datos públicos', () => {
  it('relaciona la categoría de la obra con la categoría publicada', () => {
    expect(categoryMatches('Ilustración 2D', 'Ilustración')).toBe(true)
    expect(categoryMatches('Ilustración editorial', 'Ilustración')).toBe(true)
    expect(categoryMatches('Retrato', 'Pixel Art')).toBe(false)
    expect(categoryMatches('Concept art', '')).toBe(false)
  })

  it('deriva la disponibilidad real a partir de disponibilidad y cupos', () => {
    expect(getAvailabilityStatus(artists[0])).toEqual({ tone: 'open', slots: 3, label: 'Cupos abiertos · 3 libres' })
    expect(getAvailabilityStatus(artists[1])).toEqual({ tone: 'waitlist', slots: 0, label: 'Lista de espera' })
    expect(getAvailabilityStatus({ availability: 'open', slots: 0 }).tone).toBe('closed')
    expect(getAvailabilityStatus({}).label).toBe('Disponibilidad sin datos')
  })

  it('cuenta encargos, clientes e ingresos sin contar solicitudes rechazadas', () => {
    expect(getCommissionStats(requests, 'artist-1')).toEqual({
      requestCount: 3,
      completedCount: 1,
      activeCount: 0,
      clientCount: 2,
      earnings: 160,
    })
  })

  it('ordena el ranking solo con artistas que tienen obras publicadas', () => {
    const ranking = buildArtistRanking(artists, portfolioItems, requests, 4)
    expect(ranking.map((artist) => artist.id)).toEqual(['artist-1', 'artist-2'])
    expect(ranking.some((artist) => artist.id === 'artist-3')).toBe(false)
  })

  it('devuelve un ranking vacío cuando no hay obras publicadas', () => {
    expect(buildArtistRanking(artists, [], requests, 4)).toEqual([])
    expect(RANKING_EMPTY_MESSAGE).toBe('Aún no hay suficientes datos para generar este ranking.')
  })

  it('construye tarjetas de obra uniendo perfil, usuario y categoría', () => {
    const cards = buildArtworkCards(portfolioItems, artists, categories)
    const card = cards.find((item) => item.id === 'p-1')
    expect(card.artistName).toBe('Mateo Ríos')
    expect(card.artistHandle).toBe('@mateorios')
    expect(card.artistPrice).toBe(80)
    expect(card.availability.tone).toBe('open')
    expect(card.categoryIds).toEqual(['c-1'])
    expect(card.searchTerms).toContain('Guardiana del bosque')

    const orphan = cards.find((item) => item.id === 'p-4')
    expect(orphan.artistName).toBe('Perfil de artista no disponible')
    expect(orphan.artistHandle).toBe('')
    expect(orphan.artistPrice).toBe(0)
  })

  it('cuenta obras y creadores por categoría usando solo datos existentes', () => {
    const cards = buildArtworkCards(portfolioItems, artists, categories)
    const options = buildCategoryOptions(categories, cards)
    expect(options[0]).toMatchObject({ id: 'all', count: 4 })
    expect(options.find((option) => option.id === 'c-1')).toMatchObject({ count: 1, artistCount: 1 })
    expect(options.find((option) => option.id === 'c-3')).toMatchObject({ count: 1, artistCount: 1 })
    expect(options.some((option) => option.id === 'c-4')).toBe(false)
  })

  it('omite métricas sin respaldo y no inventa valores por defecto', () => {
    const metrics = buildPlatformMetrics(artists, portfolioItems)
    expect(metrics.find((metric) => metric.id === 'm1').number).toBe('3')
    expect(metrics.find((metric) => metric.id === 'm2').number).toBe('$100 USD')
    expect(metrics.find((metric) => metric.id === 'm4').number).toBe('4.6 / 5')
    expect(metrics.find((metric) => metric.id === 'm4').label).toBe('4 Obras en Portafolio')

    const empty = buildPlatformMetrics([], [])
    expect(empty.find((metric) => metric.id === 'm1').number).toBeNull()
    expect(empty.find((metric) => metric.id === 'm2').number).toBeNull()
    expect(empty.find((metric) => metric.id === 'm4').label).toBe('Obras en Portafolio')
  })

  it('elige obras reales del carrusel sin repetir tarjetas', () => {
    const cards = buildShowcaseCards(artists, portfolioItems, { seed: 7, limit: 3 })
    expect(cards).toHaveLength(3)
    expect(new Set(cards.map((card) => card.artistId + card.workTitle)).size).toBe(3)
    expect(cards.every((card) => card.image && card.artistId)).toBe(true)
    expect(cards[0].workTitle).toBe('Guardiana del bosque')

    expect(buildShowcaseCards(artists, [], { seed: 7 })).toEqual([])
  })
})
