import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const artists = [
  {
    id: 'artist-1',
    userId: 'user-1',
    displayName: 'Mateo Ríos',
    username: 'mateorios',
    bio: 'Ilustrador editorial especializado en mundos narrativos.',
    disciplines: ['Ilustración 2D'],
    styles: ['Fantástico'],
    location: 'Bogotá, Colombia',
    availability: 'open',
    slots: 3,
    rating: 4.9,
    verified: true,
    basePrice: 80,
    avatar: 'https://example.test/avatar.jpg',
  },
]

const portfolioItems = [
  { id: 'p-1', artistId: 'artist-1', title: 'Guardiana del bosque', image: '/a.jpg', category: 'Ilustración', likes: 120, createdAt: '2026-02-01T00:00:00.000Z' },
  { id: 'p-2', artistId: 'artist-1', title: 'Islas flotantes', image: '/b.jpg', category: 'Concept art', likes: 10, createdAt: '2026-03-01T00:00:00.000Z' },
]

const categories = [
  { id: 'c-1', name: 'Ilustración 2D', slug: 'ilustracion-2d' },
  { id: 'c-2', name: 'Concept art', slug: 'concept-art' },
]

const requests = [{ id: 'r-1', artistId: 'artist-1', clientId: 'user-c1', budget: 100, status: 'completed' }]

vi.mock('../src/services/artistService', () => ({ getArtists: vi.fn() }))
vi.mock('../src/services/portfolioService', () => ({ getPortfolioItems: vi.fn() }))
vi.mock('../src/services/categoryService', () => ({ getCategories: vi.fn() }))
vi.mock('../src/services/requestService', () => ({ getRequests: vi.fn() }))

import { getArtists } from '../src/services/artistService'
import { getPortfolioItems } from '../src/services/portfolioService'
import { getCategories } from '../src/services/categoryService'
import { getRequests } from '../src/services/requestService'
import ExplorePage from '../src/pages/ExplorePage'
import HomePage from '../src/pages/HomePage'

const RANKING_EMPTY = 'Aún no hay suficientes datos para generar este ranking.'

function load({ artists: a = artists, portfolio = portfolioItems, cats = categories, reqs = requests } = {}) {
  getArtists.mockResolvedValue(a)
  getPortfolioItems.mockResolvedValue(portfolio)
  getCategories.mockResolvedValue(cats)
  getRequests.mockResolvedValue(reqs)
}

describe('páginas públicas sin datos quemados', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Explorar muestra artistas y obras con los datos del servidor', async () => {
    load()
    render(<MemoryRouter><ExplorePage /></MemoryRouter>)

    await waitFor(() => expect(screen.getByText('Artistas del Momento')).toBeInTheDocument())
    expect(screen.getByText('Mateo Ríos')).toBeInTheDocument()
    expect(screen.getAllByText('Cupos abiertos · 3 libres').length).toBeGreaterThan(0)
    expect(screen.getByText('Guardiana del bosque')).toBeInTheDocument()
    expect(screen.getAllByText('@mateorios').length).toBe(2)
    expect(screen.getByText(/Ilustración 2D \(1\)/)).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('Explorar avisa cuando no hay obras suficientes para el ranking', async () => {
    load({ artists: [], portfolio: [], cats: [], reqs: [] })
    render(<MemoryRouter><ExplorePage /></MemoryRouter>)

    await waitFor(() => expect(screen.getAllByText(RANKING_EMPTY).length).toBeGreaterThan(0))
  })

  it('Inicio deriva categorías, métricas y creadores del servidor', async () => {
    load()
    render(<MemoryRouter><HomePage /></MemoryRouter>)

    await waitFor(() => expect(screen.getByText('Categorías Populares')).toBeInTheDocument())
    expect(screen.getAllByText('1 Creador').length).toBe(2)
    expect(screen.getAllByText('1 obras publicadas').length).toBe(2)
    expect(screen.getByText('$80 USD')).toBeInTheDocument()
    expect(screen.getByText('2 Obras en Portafolio')).toBeInTheDocument()
    expect(screen.getAllByText('Mateo Ríos').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Guardiana del bosque|Islas flotantes/ }).length).toBeGreaterThan(0)
  })

  it('Inicio no inventa métricas cuando el servidor no devuelve datos', async () => {
    load({ artists: [], portfolio: [], cats: [], reqs: [] })
    render(<MemoryRouter><HomePage /></MemoryRouter>)

    await waitFor(() => expect(screen.getByText('Obras en Portafolio')).toBeInTheDocument())
    expect(screen.queryByText('$144 USD')).not.toBeInTheDocument()
    expect(screen.getAllByText(RANKING_EMPTY).length).toBeGreaterThan(0)
  })
})
