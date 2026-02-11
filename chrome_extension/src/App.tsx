import { useState, useEffect } from 'react'
import AuthSetup from './components/AuthSetup'
import ExtensionDashboard from './components/ExtensionDashboard'
import { authService } from './services/authService'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    console.log('🔵 [App] Component mounted, checking authentication...')
    // Initial auth check
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔵 [App] Starting authentication check...')
      setChecking(true)

      const isAuthenticated = await authService.isAuthenticated()
      console.log('🔵 [App] Auth check result:', isAuthenticated)

      setIsAuthenticated(isAuthenticated)
    } catch (error) {
      console.error('❌ [App] Error in checkAuth:', error)
      setIsAuthenticated(false)
    } finally {
      setChecking(false)
      console.log('🔵 [App] Auth check completed')
    }
  }

  const handleAuthenticated = () => {
    console.log('🔵 [App] User authenticated, updating state')
    setIsAuthenticated(true)
  }

  if (checking) {
    return (
      <div style={{ width: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', minHeight: '400px' }}>
      {isAuthenticated ? (
        <ExtensionDashboard />
      ) : (
        <AuthSetup onAuthenticated={handleAuthenticated} />
      )}
    </div>
  )
}

export default App
