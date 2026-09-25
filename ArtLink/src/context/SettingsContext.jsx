import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, SETTINGS_KEY, SettingsContext } from './settings'

function readSettingsFromStorage() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return DEFAULT_SETTINGS
    const parsed = JSON.parse(stored)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
    }
  } catch {
    return DEFAULT_SETTINGS
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
    root.dataset.contrast = st.contrast
    root.dataset.colorMode = st.colorMode
    root.dataset.reduceMotion = st.reduceMotion ? 'true' : 'false'
    root.dataset.readableFont = st.readableFont ? 'true' : 'false'
    root.dataset.textToSpeech = st.textToSpeech ? 'true' : 'false'
    root.dataset.showLabels = st.showLabels ? 'true' : 'false'

    try {
      localStorage.setItem('artlink_theme', effTheme)
      localStorage.setItem('artlink_text_size', st.fontSize)
    } catch (err) {
      void err
    }
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
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      } catch (err) {
        void err
      }
      return next
    })
  }

  function updateNotifications(key, value) {
    setSettings((prev) => {
      const next = {
        ...prev,
        notifications: { ...prev.notifications, [key]: value },
      }
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      } catch (err) {
        void err
      }
      return next
    })
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      const effTheme = getEffectiveTheme(settings.theme)
      localStorage.setItem('artlink_theme', effTheme)
      localStorage.setItem('artlink_text_size', settings.fontSize)
      setStatusMessage('Preferencias guardadas correctamente.')
      setTimeout(() => setStatusMessage(''), 4000)
    } catch {
      setStatusMessage('No se pudieron guardar las preferencias.')
    }
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
      localStorage.setItem('artlink_theme', 'light')
      localStorage.setItem('artlink_text_size', 'normal')
    } catch (err) {
      void err
    }
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
        saveSettings,
        resetSettings,
        statusMessage,
        theme: settings.theme,
        textSize: settings.fontSize,
        setTheme: (t) => updateSetting('theme', t),
        setTextSize: (s) => updateSetting('fontSize', s),
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
