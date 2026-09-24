import ProtectedRoute from './ProtectedRoute'

export default function RoleRoute({ allowedRoles }) {
  return <ProtectedRoute allowedRoles={allowedRoles} />
}