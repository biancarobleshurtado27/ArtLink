import { useEffect, useState } from 'react'
import { DisplayPreferencesContext } from './displayPreferences'
const THEME_KEY = 'artlink_theme'
const TEXT_SIZE_KEY = 'artlink_text_size'
const textSizes = ['normal', 'large', 'x-large']

function readPreference(key, fallback) {
  try { return localStorage.getItem(key) || fallback } catch { return fallback }
}

function applyPreferences(theme, textSize) {
  document.documentElement.dataset.theme = theme
  document.documentElement.dataset.textSize = textSize
}

export function DisplayPreferencesProvider({ children }) {
  const [theme, setThemeState] = useState(() => readPreference(THEME_KEY, 'light'))
  const [textSize, setTextSizeState] = useState(() => readPreference(TEXT_SIZE_KEY, 'normal'))

  function setTheme(nextTheme) {
    const value = nextTheme === 'dark' ? 'dark' : 'light'
    setThemeState(value)
    localStorage.setItem(THEME_KEY, value)
    applyPreferences(value, textSize)
  }

  function setTextSize(nextSize) {
    const value = textSizes.includes(nextSize) ? nextSize : 'normal'
    setTextSizeState(value)
    localStorage.setItem(TEXT_SIZE_KEY, value)
    applyPreferences(theme, value)
  }

  useEffect(() => { applyPreferences(theme, textSize) }, [theme, textSize])
  return <DisplayPreferencesContext.Provider value={{ theme, textSize, setTheme, setTextSize }}>{children}</DisplayPreferencesContext.Provider>
}

