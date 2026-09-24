import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../src/context/AuthContext'
import AppLayout from '../src/layouts/AppLayout'

describe('ArtLink base shell', () => {
  it('renders the brand and primary navigation', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'ArtLink' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar' })).toBeInTheDocument()
  })
})
