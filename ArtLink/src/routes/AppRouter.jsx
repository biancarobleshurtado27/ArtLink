import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/HomePage'
import ExplorePage from '../pages/ExplorePage'
import ComoFuncionaPage from '../pages/ComoFuncionaPage'
import ParaArtistasPage from '../pages/ParaArtistasPage'
import ProfilePage from '../pages/ProfilePage'
import LegalPage from '../pages/LegalPage'
import NotFoundPage from '../pages/NotFoundPage'
import AccessDeniedPage from '../pages/AccessDeniedPage'
import ArtistProfilePage from '../pages/ArtistProfilePage'
import ArtistPanelPage from '../pages/ArtistPanelPage'
import NewRequestPage from '../pages/NewRequestPage'
import PrivateRequestsPage from '../pages/PrivateRequestsPage'
import MessagesPage from '../pages/MessagesPage'
import SettingsPage from '../pages/SettingsPage'
import SettingsProfilePage from '../pages/SettingsProfilePage'
import { AdminDashboardPage, AdminResourcePage } from '../pages/AdminPages'
import { LoginPage, RegisterPage } from '../pages/AuthPages'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import { ROLES } from '../utils/roles'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas exclusivas del Administrador con Layout dedicado */}
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, 'admin', 'administrador']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/usuarios" element={<AdminResourcePage resource="usuarios" />} />
            <Route path="/admin/users" element={<AdminResourcePage resource="usuarios" />} />
            <Route path="/admin/artistas" element={<AdminResourcePage resource="artistas" />} />
            <Route path="/admin/artists" element={<AdminResourcePage resource="artistas" />} />
            <Route path="/admin/categorias" element={<AdminResourcePage resource="categorias" />} />
            <Route path="/admin/solicitudes" element={<AdminResourcePage resource="solicitudes" />} />
            <Route path="/admin/requests" element={<AdminResourcePage resource="solicitudes" />} />
            <Route path="/admin/reports" element={<AdminResourcePage resource="solicitudes" />} />
            <Route path="/admin/settings" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* Rutas Públicas y de Clientes / Artistas con AppLayout estándar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explorar" element={<ExplorePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/artists" element={<ExplorePage />} />
          <Route path="/artists/:id" element={<ArtistProfilePage />} />
          <Route path="/como-funciona" element={<ComoFuncionaPage />} />
          <Route path="/how-it-works" element={<ComoFuncionaPage />} />
          <Route path="/para-artistas" element={<ParaArtistasPage />} />
          <Route path="/for-artists" element={<ParaArtistasPage />} />
          <Route path="/artista/:id" element={<ArtistProfilePage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/appearance" element={<SettingsPage />} />
          <Route path="/settings/accessibility" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/ayuda" element={<LegalPage />} />
          <Route path="/terminos" element={<LegalPage />} />
          <Route path="/privacidad" element={<LegalPage />} />
          <Route path="/comunidad" element={<LegalPage />} />
          <Route path="/contacto" element={<LegalPage />} />
          <Route path="/acceso-denegado" element={<AccessDeniedPage />} />

          <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT, ROLES.ARTIST, ROLES.ADMIN, 'cliente', 'artista', 'administrador', 'client', 'artist', 'admin']} />}>
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings/profile" element={<SettingsProfilePage />} />
            <Route path="/ajustes/perfil" element={<SettingsProfilePage />} />
            <Route path="/solicitudes" element={<PrivateRequestsPage />} />
            <Route path="/requests" element={<PrivateRequestsPage />} />
            <Route path="/notifications" element={<PrivateRequestsPage />} />
            <Route path="/mensajes" element={<MessagesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/mensajes/:conversationId" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<MessagesPage />} />
            <Route path="/mensajes/nuevo" element={<MessagesPage />} />
            <Route path="/solicitudes/nueva" element={<NewRequestPage />} />
            <Route path="/solicitudes/nueva/:artistId" element={<NewRequestPage />} />
            <Route path="/nueva-solicitud" element={<NewRequestPage />} />
            <Route path="/nueva-solicitud/:artistId" element={<NewRequestPage />} />
            <Route path="/commission/:artistId" element={<NewRequestPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.ARTIST, ROLES.ADMIN, 'artist', 'artista']} />}>
            <Route path="/artista/panel" element={<ArtistPanelPage />} />
            <Route path="/artista/solicitudes" element={<ArtistPanelPage />} />
            <Route path="/artista/portafolio" element={<ArtistPanelPage />} />
            <Route path="/artista/comisiones" element={<ArtistPanelPage />} />
            <Route path="/commissions" element={<ArtistPanelPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}