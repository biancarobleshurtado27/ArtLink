import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider, SESSION_STORAGE_KEY } from '../src/context/AuthContext'
import useAuth from '../src/hooks/useAuth'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear())

  it('persists a sanitized session and removes it on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login({ id: 'user-1', name: 'Demo', role: 'cliente', passwordDemo: 'secret' }))
    expect(result.current.user).toEqual({ id: 'user-1', name: 'Demo', role: 'cliente' })
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).not.toContain('secret')
    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('restores a previously persisted session on mount', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 'user-2', name: 'Restored', role: 'artista' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual({ id: 'user-2', name: 'Restored', role: 'artista' })
  })
})