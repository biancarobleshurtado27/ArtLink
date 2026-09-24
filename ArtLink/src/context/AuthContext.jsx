import { useMemo, useState } from 'react'
import { AuthContext } from './context'
import { login as loginWithCredentials } from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const value = useMemo(
    () => ({
      user,
      login: (nextUser) => setUser(nextUser),
      loginWithCredentials: async (email, passwordDemo) => {
        const authenticatedUser = await loginWithCredentials(email, passwordDemo)
        setUser(authenticatedUser)
        return authenticatedUser
      },
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

