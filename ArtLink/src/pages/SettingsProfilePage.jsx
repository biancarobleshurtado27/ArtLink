import SettingsPage from './SettingsPage'

/**
 * Página de configuración de perfil (/settings/profile o /ajustes/perfil).
 * Renderiza la interfaz de ajustes con la pestaña de perfil activa.
 */
export default function SettingsProfilePage() {
  return <SettingsPage initialTab="perfil" />
}
