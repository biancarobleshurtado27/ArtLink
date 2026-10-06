import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ScrollToTop from '../src/components/ScrollToTop'

function TestNavigationComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div>
      <span data-testid="current-path">{location.pathname}</span>
      <button onClick={() => navigate('/explorar')}>Ir a explorar</button>
      <button onClick={() => navigate('/como-funciona')}>Ir a como funciona</button>
    </div>
  )
}

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  it('llama a window.scrollTo con top: 0 al renderizar y al cambiar de ruta', async () => {
    const user = userEvent.setup()
    const { getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <TestNavigationComponent />
      </MemoryRouter>
    )

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, left: 0 }))

    window.scrollTo.mockClear()
    await user.click(getByText('Ir a explorar'))
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, left: 0 }))

    window.scrollTo.mockClear()
    await user.click(getByText('Ir a como funciona'))
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, left: 0 }))
  })
})
