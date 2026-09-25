import { SettingsProvider, SettingsContext } from './SettingsContext'

export const DisplayPreferencesContext = SettingsContext

export function DisplayPreferencesProvider({ children }) {
  return <SettingsProvider>{children}</SettingsProvider>
}
