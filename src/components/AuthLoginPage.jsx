import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiRobot2Fill, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import { MdEmail, MdLock, MdLogin } from 'react-icons/md'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { loginUser } from '../store/login/loginThunk'
import { clearLoginError } from '../store/login/loginSlice'
import { startTokenRefreshTimer } from '../utils/tokenManager'

const AuthLoginPage = ({ onSuccessfulLogin, onSwitchToSignup, onForgotPassword }) => {
  const dispatch = useDispatch()
  const { isLoading, error, isAuthenticated, user, tokens, expiresAt } = useSelector(state => state.login)

  const [formData, setFormData] = useState({
    user: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && tokens) {
      // Start token refresh timer for login
      startTokenRefreshTimer(dispatch, expiresAt, true)
      
      // Store user session in localStorage for ProtectedRoute compatibility
      const userSession = {
        user: user,
        tokens: tokens,
        loginTime: new Date().toISOString(),
        sessionId: 'user_' + Date.now(),
        expiresAt: expiresAt
      }
      localStorage.setItem('user_session', JSON.stringify(userSession))
      
      // Navigate to dashboard
      onSuccessfulLogin({ user, tokens })
    }
  }, [isAuthenticated, user, tokens, expiresAt, dispatch, onSuccessfulLogin])

  useEffect(() => {
    return () => {
      dispatch(clearLoginError())
    }
  }, [dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) {
      dispatch(clearLoginError())
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.user || !formData.password) {
      return
    }

    // Make API call through Redux
    dispatch(loginUser({
      user: formData.user,
      password: formData.password
    }))
  }

  const features = [
    {
      icon: <RiRobot2Fill className="w-6 h-6" />,
      title: "Welcome Back",
      description: "Continue building your AI powered Sales Person"
    },
    {
      icon: <IoCheckmarkCircle className="w-6 h-6" />,
      title: "Secure Access",
      description: "Your account and data are protected"
    },
    {
      icon: <MdLogin className="w-6 h-6" />,
      title: "Quick Login",
      description: "Get back to your dashboard in seconds"
    }
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white flex-col justify-center">
        <div className="max-w-lg">
          <div className="flex items-center mb-8">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <RiRobot2Fill className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
          </div>
          
          <p className="text-xl mb-12 text-blue-100">
            Sign in to continue managing your AI powered Sales Person and growing your business.
          </p>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Don't have account */}
          <div className="mt-12 bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-blue-100 text-sm mb-2">Don't have an account?</p>
            <button
              onClick={onSwitchToSignup}
              className="text-white font-semibold hover:text-blue-200 transition-colors"
            >
              Create account →
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <RiRobot2Fill className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Powered Sales Person</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">
              Welcome back! Please sign in to your account
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="user"
                    name="user"
                    value={formData.user}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="your@email.com or username"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <RiEyeOffLine className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <RiEyeLine className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <MdLogin className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>

              {/* Mobile - Don't have account */}
              <div className="lg:hidden text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">Don't have an account?</p>
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLoginPage 