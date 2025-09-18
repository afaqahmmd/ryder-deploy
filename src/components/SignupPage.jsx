import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiRobot2Fill, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import { MdEmail, MdLock, MdPersonAdd, MdPerson } from 'react-icons/md'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { signupUser } from '../store/signup/signupThunk'
import { clearSignupError, clearSignupState } from '../store/signup/signupSlice'
import VerifyOtp from './VerifyOtp'
import PasswordValidationModal from './PasswordValidationModal'

const SignupPage = ({ onSuccessfulSignup, onSwitchToLogin }) => {
  const dispatch = useDispatch()
  const { isLoading, isSignupComplete, email, error } = useSelector(state => state.signup)
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPasswordValidation, setShowPasswordValidation] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(clearSignupError())
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Show password validation modal when user starts typing in password field
    if (name === 'password' && value.length > 0) {
      setShowPasswordValidation(true)
    } else if (name === 'password' && value.length === 0) {
      setShowPasswordValidation(false)
    }
    
    if (error) {
      dispatch(clearSignupError())
    }
  }

  const handleSignup = (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      return
    }

    dispatch(signupUser({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    }))
  }

  const handleVerificationSuccess = (user, tokens, shopifyData = null) => {
    onSuccessfulSignup({ user, tokens, email, shopifyData })
  }

  const handleBackToSignup = () => {
    setFormData({
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    })
    dispatch(clearSignupState())
  }

  if (isSignupComplete && email) {
    return (
      <VerifyOtp 
        email={email}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToSignup={handleBackToSignup}
      />
    )
  }

  const features = [
    {
      icon: <RiRobot2Fill className="w-6 h-6" />,
      title: "AI-Powered Sales Person",
      description: "Create AI-powered Sales Person for your Shopify store"
    },
    {
      icon: <IoCheckmarkCircle className="w-6 h-6" />,
      title: "Easy Integration",
      description: "Connect seamlessly with your existing store"
    },
    {
      icon: <MdPersonAdd className="w-6 h-6" />,
      title: "Quick Setup",
      description: "Get started in minutes with our simple setup process"
    }
  ]

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 p-12 text-white flex-col justify-center">
        <div className="max-w-lg">
          <div className="flex items-center mb-8">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <RiRobot2Fill className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Join Shopify Management with AI Powered Sales Person</h1>
          </div>
          
          <p className="text-xl mb-12 text-purple-100">
            Create your account and start building amazing AI-powered Sales Person for your Shopify store.
          </p>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-purple-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Already have account */}
          <div className="mt-12 bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-purple-100 text-sm mb-2">Already have an account?</p>
            <button
              onClick={onSwitchToLogin}
              className="text-white font-semibold hover:text-purple-200 transition-colors"
            >
              Sign in here →
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-3">
                <RiRobot2Fill className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Powered Sales Person</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">
              Sign up to get started with your AI powered shopify Sales Person
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPerson className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
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
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Create a secure password"
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
                  
                  {/* Password Validation Modal */}
                  <PasswordValidationModal
                    password={formData.password}
                    isVisible={showPasswordValidation}
                    onClose={() => setShowPasswordValidation(false)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <MdPersonAdd className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>

              <div className="lg:hidden text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">Already have an account?</p>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  Sign in here
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage 