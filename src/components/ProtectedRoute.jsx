import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getCookie } from 'cookies-next'

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  
  // Get auth state from Redux
  const { isAuthenticated, user } = useSelector(state => state.login)
  const { isEmailVerified } = useSelector(state => state.signup)

  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie('token')
      const userSession = localStorage.getItem('user_session')
      
      // Check if user is authenticated in Redux
      const isReduxAuthenticated = isAuthenticated && user
      
      // Check if user has valid session data
      const hasValidSession = userSession && token
      
      if (!isReduxAuthenticated && !hasValidSession) {
        console.log("ProtectedRoute: No valid authentication found, redirecting to login")
        navigate('/login', { replace: true })
        return
      }
      
      // If we have session data but Redux state is not restored, restore it
      if (hasValidSession && !isReduxAuthenticated) {
        try {
          const sessionData = JSON.parse(userSession)
          console.log("ProtectedRoute: Restoring auth state from session")
          // The auth state will be restored by AuthWrapper or App component
        } catch (error) {
          console.error("ProtectedRoute: Error parsing session data:", error)
          navigate('/login', { replace: true })
          return
        }
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [navigate, isAuthenticated, user, isEmailVerified])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
