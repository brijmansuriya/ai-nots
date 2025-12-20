import { useState, useEffect } from 'react'
import AuthSetup from './components/AuthSetup'
import ExtensionDashboard from './components/ExtensionDashboard'
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
      // Get base URL from storage
      chrome.storage.local.get(['apiBaseUrl'], async (result: { [key: string]: any }) => {
        const baseUrl = result.apiBaseUrl || 'http://ai-nots.test/'
        console.log('🔵 [App] API Base URL:', baseUrl)

        try {
          const url = `${baseUrl.replace(/\/$/, '')}/dashboard`
          console.log('🔵 [App] Fetching:', url)
          
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            },
            redirect: 'manual',
          })

          console.log('🔵 [App] Auth check response:', {
            status: response.status,
            statusText: response.statusText,
            location: response.headers.get('location'),
          })

          if (response.status === 200 || (response.status >= 300 && response.status < 400 && !response.headers.get('location')?.includes('login'))) {
            console.log('🔵 [App] User is authenticated')
            setIsAuthenticated(true)
          } else {
            console.log('🔵 [App] User is not authenticated')
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('❌ [App] Error during auth check:', error)
          setIsAuthenticated(false)
        } finally {
          setChecking(false)
          console.log('🔵 [App] Auth check completed')
        }
      })
    } catch (error) {
      console.error('❌ [App] Error in checkAuth:', error)
      setIsAuthenticated(false)
      setChecking(false)
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
