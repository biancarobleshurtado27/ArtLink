import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { DisplayPreferencesProvider } from '../src/context/DisplayPreferencesContext'
import useDisplayPreferences from '../src/hooks/useDisplayPreferences'

const wrapper = ({ children }) => <DisplayPreferencesProvider>{children}</DisplayPreferencesProvider>

describe('display preferences', () => {
  beforeEach(() => localStorage.clear())

  it('persists theme and text size choices', () => {
    const { result } = renderHook(() => useDisplayPreferences(), { wrapper })
    act(() => { result.current.setTheme('dark'); result.current.setTextSize('x-large') })
    expect(localStorage.getItem('artlink_theme')).toBe('dark')
    expect(localStorage.getItem('artlink_text_size')).toBe('x-large')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.dataset.textSize).toBe('x-large')
  })
})