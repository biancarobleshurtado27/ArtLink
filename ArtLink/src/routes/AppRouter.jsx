import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import PlaceholderPage from '../pages/PlaceholderPage'
import HomePage from '../pages/HomePage'
import ExplorePage from '../pages/ExplorePage'
import NotFoundPage from '../pages/NotFoundPage'
import AccessDeniedPage from '../pages/AccessDeniedPage'
import ArtistProfilePage from '../pages/ArtistProfilePage'
import NewRequestPage from '../pages/NewRequestPage'
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
            <Route path="/solicitudes" element={page('Mis solicitudes')} />
            <Route path="/mensajes" element={page('Mensajes')} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
            <Route path="/solicitudes/nueva/:artistId" element={<NewRequestPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ARTIST]} />}>
            <Route path="/artista/panel" element={page('Panel del artista')} />
            <Route path="/artista/portafolio" element={page('Mi portafolio')} />
            <Route path="/artista/comisiones" element={page('Mis comisiones')} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={page('Panel de administración')} />
            <Route path="/admin/usuarios" element={page('Administrar usuarios')} />
            <Route path="/admin/artistas" element={page('Administrar artistas')} />
            <Route path="/admin/categorias" element={page('Administrar categorías')} />
            <Route path="/admin/solicitudes" element={page('Administrar solicitudes')} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
