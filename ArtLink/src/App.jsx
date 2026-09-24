import { AuthProvider } from './context/AuthContext'
import { DisplayPreferencesProvider } from './context/DisplayPreferencesContext'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <DisplayPreferencesProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </DisplayPreferencesProvider>
  )
}

export default App
