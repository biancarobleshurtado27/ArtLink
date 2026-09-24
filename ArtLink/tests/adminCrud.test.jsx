import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AdminResourcePage } from '../src/pages/AdminPages'

const mocks = vi.hoisted(() => ({
  getUsers: vi.fn(), createUser: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn(),
  getArtists: vi.fn(), createArtist: vi.fn(), updateArtist: vi.fn(), deleteArtist: vi.fn(),
  getCategories: vi.fn(), createCategory: vi.fn(), updateCategory: vi.fn(), deleteCategory: vi.fn(),
  getRequests: vi.fn(), createRequest: vi.fn(), updateRequest: vi.fn(), deleteRequest: vi.fn(),
}))
vi.mock('../src/services/userService', () => mocks)
vi.mock('../src/services/artistService', () => ({ getArtists: mocks.getArtists, createArtist: mocks.createArtist, updateArtist: mocks.updateArtist, deleteArtist: mocks.deleteArtist }))
vi.mock('../src/services/categoryService', () => ({ getCategories: mocks.getCategories, createCategory: mocks.createCategory, updateCategory: mocks.updateCategory, deleteCategory: mocks.deleteCategory }))
vi.mock('../src/services/requestService', () => ({ getRequests: mocks.getRequests, createRequest: mocks.createRequest, updateRequest: mocks.updateRequest, deleteRequest: mocks.deleteRequest }))

const renderPage = () => render(<MemoryRouter><AdminResourcePage resource="usuarios" /></MemoryRouter>)

describe('admin CRUD states', () => {
  it('shows loading and then successful data without JSON Server', async () => {
    let resolveRequest
    mocks.getUsers.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios')
    resolveRequest([{ id: 'user-1', name: 'Ana', email: 'ana@test.demo', role: 'cliente', active: true }])
    expect(await screen.findByText('Ana')).toBeInTheDocument()
  })

  it('shows an accessible error state when the CRUD request fails', async () => {
    mocks.getUsers.mockRejectedValue(new Error('No disponible'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('No disponible')
  })
})
