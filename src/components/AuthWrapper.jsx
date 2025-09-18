import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getCookie } from 'cookies-next'
import { restoreSession } from '../store/login/loginSlice'

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Public routes that don't require authentication
        console.log("Checking authentication for route:", location.pathname)
        const publicRoutes = ['/', '/login', '/signup', '/verify-otp', '/password-reset']
        const isPublicRoute = publicRoutes.includes(location.pathname)
        console.log("Is public route:", isPublicRoute)

        if (isPublicRoute) {
          console.log("Public route detected, setting isLoading to false")
          setIsLoading(false)
          return
        }

        console.log("Public route not detected")
        
        // Check for user session in localStorage first
        const userSession = localStorage.getItem('user_session')
        const token = getCookie('token')
        
        if (!token) {
          // No token available, redirect to login
          console.log("No authentication token found, redirecting to login")
          setIsLoading(false)
          navigate('/login', { replace: true })
          return
        }

        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const currentTime = Date.now() / 1000
          
          if (payload.exp <= currentTime) {
            console.log("Token expired, redirecting to login")
            setIsLoading(false)
            navigate('/login', { replace: true })
            return
          }
          
          // If we have a valid token and user session, restore the auth state
          if (userSession) {
            try {
              const sessionData = JSON.parse(userSession)
              console.log("Restoring auth state from session:", sessionData)
              
              // Restore auth state in Redux
              dispatch(restoreSession({
                user: sessionData.user,
                tokens: { access_token: token },
                expiresAt: sessionData.expiresAt
              }))
            } catch (error) {
              console.error("Error parsing user session:", error)
            }
          }
        } catch (error) {
          console.error("Error decoding token:", error)
          setIsLoading(false)
          navigate('/login', { replace: true })
          return
        }

        // If we have valid token, continue
        setIsLoading(false)

      } catch (error) {
        console.error('Authentication check error:', error)
        setIsLoading(false)
        navigate('/login', { replace: true })
      }
    }

    checkAuthentication()
  }, [navigate, location.pathname, dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return children
}

export default AuthWrapper 