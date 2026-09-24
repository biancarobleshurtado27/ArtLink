import { useContext } from 'react'
import { AuthContext } from '../context/context'

export default function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider')
  return context
}