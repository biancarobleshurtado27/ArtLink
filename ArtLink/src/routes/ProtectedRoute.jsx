import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  const normalizedRole = user.role === 'artist' ? 'artista' : user.role === 'client' ? 'cliente' : user.role === 'admin' ? 'administrador' : user.role
  const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(user.role) || allowedRoles.includes(normalizedRole)
  if (!isAllowed) return <Navigate to="/acceso-denegado" replace state={{ requiredRoles: allowedRoles }} />

  return <Outlet />
}
