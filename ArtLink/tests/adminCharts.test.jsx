import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  computeRequestsByStatus,
  computeArtistsByDiscipline,
  computeRequestsActivity,
  filterRequests,
  generateStatusAccessibleSummary,
  generateDisciplineAccessibleSummary,
  generateActivityAccessibleSummary,
  REQUEST_STATUS_CONFIG
} from '../src/utils/adminChartUtils'
import RequestsStatusChart from '../src/components/admin/RequestsStatusChart'
import ArtistsDisciplineChart from '../src/components/admin/ArtistsDisciplineChart'
import RequestsActivityChart from '../src/components/admin/RequestsActivityChart'

describe('adminChartUtils - data transformations & accessibility', () => {
  const mockRequests = [
    { id: '1', status: 'pending', createdAt: '2026-09-28T10:00:00Z', artistId: 'a1' },
    { id: '2', status: 'waitlist', createdAt: '2026-09-27T10:00:00Z', artistId: 'a2' },
    { id: '3', status: 'accepted', createdAt: '2026-09-20T10:00:00Z', artistId: 'a1' },
    { id: '4', status: 'in_progress', createdAt: '2026-08-15T10:00:00Z', artistId: 'a3' },
    { id: '5', status: 'completed', createdAt: '2026-07-10T10:00:00Z', artistId: 'a1' },
    { id: '6', status: 'rejected', createdAt: '2026-06-05T10:00:00Z', artistId: 'a2' }
  ]

  const mockArtists = [
    { id: 'a1', displayName: 'Artista 1', disciplines: ['Ilustración 2D', 'Concept Art'] },
    { id: 'a2', displayName: 'Artista 2', disciplines: ['Modelado 3D', 'Animación'] },
    { id: 'a3', displayName: 'Artista 3', disciplines: ['Pixel Art', 'Emotes', 'Diseño de personajes'] }
  ]

  it('guarantees all 6 mandatory statuses in computeRequestsByStatus', () => {
    const { data, total } = computeRequestsByStatus(mockRequests)
    expect(total).toBe(6)
    expect(data.length).toBe(6)

    const names = data.map((d) => d.name)
    expect(names).toContain('Pendientes')
    expect(names).toContain('En lista de espera')
    expect(names).toContain('Aceptadas')
    expect(names).toContain('En progreso')
    expect(names).toContain('Completadas')
    expect(names).toContain('Rechazadas')
  })

  it('applies the documented counting rule for artists with multiple disciplines', () => {
    const { data, totalMentions, uniqueArtists } = computeArtistsByDiscipline(mockArtists)
    expect(uniqueArtists).toBe(3)
    // a1 has 2, a2 has 2, a3 has 3 = 7 total mentions
    expect(totalMentions).toBe(7)

    const disciplinesPresent = data.filter((d) => d.value > 0).map((d) => d.name)
    expect(disciplinesPresent).toContain('Ilustración 2D')
    expect(disciplinesPresent).toContain('Concept Art')
    expect(disciplinesPresent).toContain('Modelado 3D')
    expect(disciplinesPresent).toContain('Animación')
    expect(disciplinesPresent).toContain('Pixel Art')
    expect(disciplinesPresent).toContain('Emotes')
    expect(disciplinesPresent).toContain('Otras disciplinas')
  })

  it('computes chronological activity grouping by month / date', () => {
    const { data, total, peakLabel } = computeRequestsActivity(mockRequests, 'all')
    expect(total).toBe(6)
    expect(data.length).toBeGreaterThan(0)
    expect(peakLabel).toBeDefined()
  })

  it('filters requests correctly by status and discipline', () => {
    const filteredByStatus = filterRequests(mockRequests, {
      status: 'pending',
      period: 'all',
      discipline: 'all',
      artists: mockArtists
    })
    expect(filteredByStatus.length).toBe(1)
    expect(filteredByStatus[0].status).toBe('pending')

    const filteredByDisc = filterRequests(mockRequests, {
      status: 'all',
      period: 'all',
      discipline: 'Ilustración 2D',
      artists: mockArtists
    })
    // a1 has Ilustración 2D, requests 1, 3, 5 correspond to a1
    expect(filteredByDisc.length).toBe(3)
  })

  it('generates accessible textual summaries without emojis', () => {
    const { data, total } = computeRequestsByStatus(mockRequests)
    const summary = generateStatusAccessibleSummary(data, total)
    expect(summary).toMatch(/Se registraron 6 solicitudes/i)
    expect(summary).not.toMatch(/[⭐★\uD83C-\uDBFF\uDC00-\uDFFF]/)

    const { data: dData, totalMentions, uniqueArtists } = computeArtistsByDiscipline(mockArtists)
    const dSummary = generateDisciplineAccessibleSummary(dData, totalMentions, uniqueArtists)
    expect(dSummary).toMatch(/especialidades activas/i)
    expect(dSummary).not.toMatch(/[⭐★\uD83C-\uDBFF\uDC00-\uDFFF]/)

    const { data: aData, peakLabel } = computeRequestsActivity(mockRequests, 'all')
    const aSummary = generateActivityAccessibleSummary(aData, total, peakLabel)
    expect(aSummary).toMatch(/Actividad de 6 solicitudes/i)
    expect(aSummary).not.toMatch(/[⭐★\uD83C-\uDBFF\uDC00-\uDFFF]/)
  })
})

describe('Admin Chart Components - rendering and accessibility', () => {
  const sampleRequests = [
    { id: '1', status: 'pending', createdAt: '2026-09-28T10:00:00Z', artistId: 'a1' },
    { id: '2', status: 'accepted', createdAt: '2026-09-25T10:00:00Z', artistId: 'a2' }
  ]
  const sampleArtists = [
    { id: 'a1', displayName: 'Marta', disciplines: ['Ilustración 2D'] },
    { id: 'a2', displayName: 'Carlos', disciplines: ['Modelado 3D'] }
  ]

  it('renders RequestsStatusChart with accessible title, summary and table toggle', () => {
    render(<RequestsStatusChart requests={sampleRequests} />)
    expect(screen.getByRole('heading', { name: /Solicitudes por estado/i })).toBeDefined()
    expect(screen.getByText(/Se registraron 2 solicitudes/i)).toBeDefined()

    const toggleBtn = screen.getByRole('button', { name: /Ver tabla/i })
    expect(toggleBtn).toBeDefined()
    fireEvent.click(toggleBtn)

    expect(screen.getByRole('table')).toBeDefined()
    expect(screen.getByText('Pendientes')).toBeDefined()
    expect(screen.getByText('Aceptadas')).toBeDefined()
  })

  it('renders ArtistsDisciplineChart with documented counting rule', () => {
    render(<ArtistsDisciplineChart artists={sampleArtists} />)
    expect(screen.getByRole('heading', { name: /Artistas por disciplina/i })).toBeDefined()
    expect(screen.getByText(/Regla de conteo/i)).toBeDefined()
  })

  it('renders RequestsActivityChart with demonstrative data badge and summary', () => {
    render(<RequestsActivityChart requests={sampleRequests} period="all" />)
    expect(screen.getByRole('heading', { name: /Actividad de solicitudes/i })).toBeDefined()
    expect(screen.getByText(/Datos Demostrativos/i)).toBeDefined()
    expect(screen.getByText(/Actividad de 2 solicitudes/i)).toBeDefined()
  })
})
