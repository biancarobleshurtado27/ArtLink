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

  it('applies and updates daltonismo color modes on document.documentElement', () => {
    const { result } = renderHook(() => useDisplayPreferences(), { wrapper })
    
    act(() => { result.current.updateSetting('colorMode', 'protanopia') })
    expect(document.documentElement.dataset.colorMode).toBe('protanopia')

    act(() => { result.current.updateSetting('colorMode', 'deuteranopia') })
    expect(document.documentElement.dataset.colorMode).toBe('deuteranopia')

    act(() => { result.current.updateSetting('colorMode', 'tritanopia') })
    expect(document.documentElement.dataset.colorMode).toBe('tritanopia')

    act(() => { result.current.updateSetting('colorMode', 'achromatopsia') })
    expect(document.documentElement.dataset.colorMode).toBe('achromatopsia')

    act(() => { result.current.updateSetting('colorMode', 'normal') })
    expect(document.documentElement.dataset.colorMode).toBe('normal')
  })
})