import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import PlaceholderPage from '../pages/PlaceholderPage'
import HomePage from '../pages/HomePage'
import ExplorePage from '../pages/ExplorePage'
import NotFoundPage from '../pages/NotFoundPage'
import AccessDeniedPage from '../pages/AccessDeniedPage'
import ArtistProfilePage from '../pages/ArtistProfilePage'
import ArtistPanelPage from '../pages/ArtistPanelPage'
import NewRequestPage from '../pages/NewRequestPage'
import PrivateRequestsPage from '../pages/PrivateRequestsPage'
import MessagesPage from '../pages/MessagesPage'
import { AdminDashboardPage, AdminResourcePage } from '../pages/AdminPages'
import { LoginPage, RegisterPage } from '../pages/AuthPages'
import ProtectedRoute from './ProtectedRoute'
import { ROLES } from '../utils/roles'

const page = (title) => <PlaceholderPage title={title} description="Esta vista está lista para recibir su primera iteración funcional." />

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explorar" element={<ExplorePage />} />
          <Route path="/artista/:id" element={<ArtistProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
          <Route path="/como-funciona" element={page('Cómo funciona')} />
          <Route path="/para-artistas" element={page('Para artistas')} />
          <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT, ROLES.ARTIST, ROLES.ADMIN]} />}>
            <Route path="/perfil" element={page('Mi perfil')} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT, ROLES.ARTIST, ROLES.ADMIN]} />}>
            <Route path="/solicitudes" element={<PrivateRequestsPage />} />
            <Route path="/mensajes" element={<MessagesPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
            <Route path="/solicitudes/nueva/:artistId" element={<NewRequestPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ARTIST]} />}>
            <Route path="/artista/panel" element={<ArtistPanelPage />} />
            <Route path="/artista/portafolio" element={<ArtistPanelPage />} />
            <Route path="/artista/comisiones" element={<ArtistPanelPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/usuarios" element={<AdminResourcePage resource="usuarios" />} />
            <Route path="/admin/artistas" element={<AdminResourcePage resource="artistas" />} />
            <Route path="/admin/categorias" element={<AdminResourcePage resource="categorias" />} />
            <Route path="/admin/solicitudes" element={<AdminResourcePage resource="solicitudes" />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
