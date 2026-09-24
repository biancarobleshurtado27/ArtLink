import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ArtistCard from '../src/components/ArtistCard'

const artist = { id: 'artist-1', displayName: 'Mateo Ríos', username: 'mateorios', bio: 'Ilustrador de mundos.', location: 'Bogotá', availability: 'open', rating: 4.9, verified: true, basePrice: 80, disciplines: ['Ilustración 2D'], styles: ['Fantasía'], avatar: '' }

describe('ArtistCard', () => {
  it('shows name, base price and availability text', () => {
    render(<MemoryRouter><ArtistCard artist={artist} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Mateo Ríos' })).toBeInTheDocument()
    expect(screen.getByText('Desde $80')).toBeInTheDocument()
    expect(screen.getByText('Abierto')).toBeInTheDocument()
  })
})
