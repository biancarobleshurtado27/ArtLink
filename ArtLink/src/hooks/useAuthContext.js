import { useContext } from 'react'
import { AuthContext } from '../context/context'

export default function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      login: () => {},
      loginWithCredentials: async () => null,
      register: async () => null,
      updateUser: () => {},
      logout: () => {},
    }
  }
  return context
}