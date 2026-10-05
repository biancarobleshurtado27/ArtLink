import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tokens.css'
import './App.css'
import './styles/visual.css'
import './styles/directory.css'
import './styles/workspace.css'
import './styles/artistDashboard.css'
import './styles/private.css'
import './styles/assistant.css'
import './styles/chatPop.css'
import './styles/requestsPop.css'
import './styles/pages.css'
import './styles/system.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
