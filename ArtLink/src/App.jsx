import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
