import { act, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AuthProvider,
  SESSION_STORAGE_KEY,
  SESSION_LAST_ACTIVITY_KEY,
  INACTIVITY_TIMEOUT_MS,
  ACTIVITY_THROTTLE_MS,
} from '../src/context/AuthContext'
import useAuth from '../src/hooks/useAuth'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('persists a sanitized session and removes it on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.login({ id: 'user-1', name: 'Demo', role: 'cliente', passwordDemo: 'secret' }))
    expect(result.current.user).toEqual({ id: 'user-1', name: 'Demo', role: 'cliente' })
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).not.toContain('secret')
    expect(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY)).toBeTruthy()

    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY)).toBeNull()
  })

  it('restores a previously persisted session on mount', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 'user-2', name: 'Restored', role: 'artista' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual({ id: 'user-2', name: 'Restored', role: 'artista' })
  })

  it('restores session when inactivity duration is under 20 minutes', () => {
    const recentActivity = Date.now() - (10 * 60 * 1000) // 10 minutos de inactividad
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 'user-3', name: 'Activo', role: 'cliente' }))
    localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(recentActivity))

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual({ id: 'user-3', name: 'Activo', role: 'cliente' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('expires and clears session on mount when inactivity exceeds 20 minutes', () => {
    const expiredActivity = Date.now() - (21 * 60 * 1000) // 21 minutos de inactividad
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 'user-expired', name: 'Expirado', role: 'cliente' }))
    localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(expiredActivity))

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY)).toBeNull()
  })

  it('automatically logs out after 20 minutes of inactivity', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login({ id: 'user-auto', name: 'AutoLogout', role: 'cliente' })
    })
    expect(result.current.isAuthenticated).toBe(true)

    // Avanzar 19 minutos (la sesión debe seguir activa)
    act(() => {
      vi.advanceTimersByTime(19 * 60 * 1000)
    })
    expect(result.current.isAuthenticated).toBe(true)

    // Avanzar 2 minutos adicionales (supera los 20 minutos de inactividad)
    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000)
    })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('renews session on valid user activity, extending the active duration', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login({ id: 'user-renew', name: 'Renovado', role: 'artista' })
    })
    expect(result.current.isAuthenticated).toBe(true)

    // Avanzar 15 minutos
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000)
    })
    expect(result.current.isAuthenticated).toBe(true)

    // Actividad de usuario válida (ej. movimiento de ratón o teclado)
    act(() => {
      window.dispatchEvent(new Event('mousemove'))
    })

    // Avanzar otros 10 minutos (25 minutos desde el inicio, pero solo 10 desde la última actividad)
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })
    expect(result.current.isAuthenticated).toBe(true)

    // Ahora avanzar 21 minutos sin ninguna actividad (debe expirar)
    act(() => {
      vi.advanceTimersByTime(21 * 60 * 1000)
    })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('throttles activity renewals in a controlled manner', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login({ id: 'user-throttle', name: 'Throttle', role: 'cliente' })
    })

    const initialStamp = Number(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY))
    expect(initialStamp).toBeGreaterThan(0)

    // Disparar actividad tras solo 2 segundos (menor a ACTIVITY_THROTTLE_MS = 10s)
    act(() => {
      vi.advanceTimersByTime(2000)
      window.dispatchEvent(new Event('mousemove'))
    })

    // La clave no debe haberse actualizado debido al control de throttle
    expect(Number(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY))).toBe(initialStamp)

    // Disparar actividad tras superar el umbral de throttle (11 segundos)
    act(() => {
      vi.advanceTimersByTime(11000)
      window.dispatchEvent(new Event('keydown'))
    })

    const updatedStamp = Number(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY))
    expect(updatedStamp).toBeGreaterThan(initialStamp)
  })
})