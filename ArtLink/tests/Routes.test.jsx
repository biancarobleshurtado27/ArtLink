import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../src/context/AuthContext'
import ProtectedRoute from '../src/routes/ProtectedRoute'
import RoleRoute from '../src/routes/RoleRoute'

function renderGuard(element, role, initialPath = '/private') {
  localStorage.clear()
  if (role) localStorage.setItem('artlink_session', JSON.stringify({ id: 'user-1', role }))
  return render(<AuthProvider><MemoryRouter initialEntries={[initialPath]}><Routes><Route element={element}><Route path="/private" element={<p>Contenido privado</p>} /></Route><Route path="/login" element={<p>Página de login</p>} /><Route path="/acceso-denegado" element={<p>Acceso denegado</p>} /></Routes></MemoryRouter></AuthProvider>)
}

describe('route guards', () => {
  beforeEach(() => localStorage.clear())

  it('redirects unauthenticated users to login', () => {
    renderGuard(<ProtectedRoute allowedRoles={['cliente']} />)
    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('blocks an unauthorized role through RoleRoute', () => {
    renderGuard(<RoleRoute allowedRoles={['administrador']} />, 'cliente')
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
  })
})
