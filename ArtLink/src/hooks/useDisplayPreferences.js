import { useContext } from 'react'
import { DisplayPreferencesContext } from '../context/displayPreferences'

export default function useDisplayPreferences() {
  const context = useContext(DisplayPreferencesContext)
  if (!context) throw new Error('useDisplayPreferences must be used inside DisplayPreferencesProvider')
  return context
}