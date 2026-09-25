import { createContext } from 'react'

export const SETTINGS_KEY = 'artlink_settings'

export const DEFAULT_SETTINGS = {
  theme: 'system',
  fontSize: 'normal',
  contrast: 'normal',
  colorMode: 'normal',
  reduceMotion: false,
  readableFont: false,
  textToSpeech: false,
  showLabels: false,
  notifications: {
    emailNotifs: true,
    requestNotifs: true,
    marketingNotifs: false,
  },
}

export const SettingsContext = createContext(null)
