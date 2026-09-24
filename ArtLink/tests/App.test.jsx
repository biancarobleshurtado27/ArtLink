import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../src/context/AuthContext'
import AppLayout from '../src/layouts/AppLayout'
import { DisplayPreferencesProvider } from '../src/context/DisplayPreferencesContext'

describe('ArtLink base shell', () => {
  it('renders the brand and primary navigation', () => {
    render(
      <MemoryRouter>
        <DisplayPreferencesProvider>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </DisplayPreferencesProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'ArtLink' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar artistas' })).toBeInTheDocument()
  })
})
