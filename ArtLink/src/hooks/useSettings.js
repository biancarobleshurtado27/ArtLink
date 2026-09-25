import { useContext } from 'react'
import { SettingsContext } from '../context/settings'

export default function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings debe ser usado dentro de un SettingsProvider')
  }
  return context
}
