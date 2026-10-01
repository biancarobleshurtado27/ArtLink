import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, SETTINGS_KEY, SettingsContext } from './settings'
import { readLocal } from '../services/persistence/localStorageService'
import { getAppSettings, saveAppSettings } from '../services/persistence/syncService'
import { GLOBAL_SETTINGS_KEY } from '../services/persistence/storageKeys'

function readSettingsFromStorage() {
  const stored = readLocal(GLOBAL_SETTINGS_KEY, null) || readLocal(SETTINGS_KEY, null)
  if (!stored) return DEFAULT_SETTINGS
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(stored.notifications || {}) },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...(stored.privacy || {}) },
    preferences: { ...DEFAULT_SETTINGS.preferences, ...(stored.preferences || {}) },
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(readSettingsFromStorage)
  const [statusMessage, setStatusMessage] = useState('')

  const getEffectiveTheme = useCallback((themePref) => {
    if (themePref === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themePref === 'dark' ? 'dark' : 'light'
  }, [])

  const applySettingsToDOM = useCallback((st) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const effTheme = getEffectiveTheme(st.theme)
    root.dataset.theme = effTheme
    root.dataset.textSize = st.fontSize
    root.dataset.fontSize = st.fontSize
    root.dataset.contrast = st.highContrast ? 'high' : st.contrast || 'normal'
    root.dataset.highContrast = st.highContrast ? 'true' : 'false'
    root.dataset.density = st.compactDensity ? 'compact' : st.density || 'comfortable'
    root.dataset.compactDensity = st.compactDensity ? 'true' : 'false'
    root.dataset.colorMode = st.colorMode || 'normal'
    root.dataset.reduceMotion = st.reducedMotion || st.reduceMotion ? 'true' : 'false'
    root.dataset.readableFont = st.readableFont ? 'true' : 'false'
    root.dataset.textToSpeech = st.textToSpeech ? 'true' : 'false'
    root.dataset.showLabels = st.showLabels ? 'true' : 'false'
    root.dataset.focusVisible = st.focusVisible ? 'true' : 'false'
    root.dataset.nonColorIndicators = st.nonColorIndicators ? 'true' : 'false'
  }, [getEffectiveTheme])

  useEffect(() => {
    applySettingsToDOM(settings)
  }, [settings, applySettingsToDOM])

  useEffect(() => {
    if (settings.theme !== 'system' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applySettingsToDOM(settings)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings, applySettingsToDOM])

  function updateSetting(key, value) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      applySettingsToDOM(next)
      saveAppSettings(null, next)
      return next
    })
  }

  function updateNotifications(key, value) {
    setSettings((prev) => {
      const next = {
        ...prev,
        notifications: { ...prev.notifications, [key]: value },
      }
      saveAppSettings(null, next)
      return next
    })
  }

  function updatePrivacy(key, value) {
    setSettings((prev) => {
      const next = {
        ...prev,
        privacy: { ...prev.privacy, [key]: value },
      }
      saveAppSettings(null, next)
      return next
    })
  }

  function updatePreferences(key, value) {
    setSettings((prev) => {
      const next = {
        ...prev,
        preferences: { ...prev.preferences, [key]: value },
      }
      saveAppSettings(null, next)
      return next
    })
  }

  function saveSettings() {
    try {
      saveAppSettings(null, settings)
      setStatusMessage('Preferencias guardadas correctamente.')
      setTimeout(() => setStatusMessage(''), 4000)
    } catch {
      setStatusMessage('No se pudieron guardar las preferencias.')
    }
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS)
    saveAppSettings(null, DEFAULT_SETTINGS)
    applySettingsToDOM(DEFAULT_SETTINGS)
    setStatusMessage('Preferencias restauradas a los valores predeterminados.')
    setTimeout(() => setStatusMessage(''), 4000)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateNotifications,
        updatePrivacy,
        updatePreferences,
        saveSettings,
        resetSettings,
        statusMessage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
