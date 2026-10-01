import { createContext } from 'react'

export const SETTINGS_KEY = 'artlink_settings'

export const DEFAULT_SETTINGS = {
  // Apariencia
  theme: 'system',
  fontSize: 'normal',
  contrast: 'normal',
  density: 'comfortable',
  colorMode: 'normal',
  reduceMotion: false,
  readableFont: false,
  textToSpeech: false,
  showLabels: false,

  // Accesibilidad
  focusVisible: true,
  keyboardNavigation: true,
  altTextEnhanced: true,
  nonColorIndicators: true,

  // Privacidad
  privacy: {
    profileVisibility: 'public',
    showActivity: true,
    showFollowing: true,
    showPortfolio: true,
  },

  // Notificaciones
  notifications: {
    emailNotifs: true,
    requestNotifs: true,
    marketingNotifs: false,
    requests: true,
    messages: true,
    statusChanges: true,
    newFollowers: true,
    hearts: true,
    reviews: true,
  },

  // Preferencias
  preferences: {
    favoriteDisciplines: ['Ilustración Digital', 'Concept Art'],
    priceRange: 'all',
    deliveryTime: 'any',
    openCommissionsFirst: true,
    sortBy: 'rating',
  },
}

export const SettingsContext = createContext(null)
