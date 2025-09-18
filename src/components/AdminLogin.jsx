import { useState } from 'react'
import { RiRobot2Fill, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import { MdEmail, MdLock, MdAdminPanelSettings } from 'react-icons/md'
import { SiShopify } from 'react-icons/si'
import { IoCheckmarkCircle } from 'react-icons/io5'
import { SHOPIFY_QUERIES } from '../config/shopify'

const AdminLogin = ({ onSuccessfulLogin }) => {
  const [currentStep, setCurrentStep] = useState(1) // 1: Admin Login, 2: Shopify Connection
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const [adminData, setAdminData] = useState(null)

  // Dummy admin credentials
  const ADMIN_CREDENTIALS = {
    email: 'admin@ryderpartners.com',
    password: 'admin123'
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLogging(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    if (formData.email === ADMIN_CREDENTIALS.email && 
        formData.password === ADMIN_CREDENTIALS.password) {
      
      const tempAdminData = {
        user: {
          id: 1,
          email: formData.email,
          name: 'Admin User',
          role: 'admin',
          avatar: '👨‍💼'
        },
        loginTime: new Date().toISOString(),
        sessionId: 'admin_' + Date.now(),
        permissions: ['dashboard', 'products', 'chatbot', 'settings']
      }

      setAdminData(tempAdminData)
      setCurrentStep(2) // Move to Shopify connection step
    } else {
      setError('Invalid email or password. Please try again.')
    }
    
    setIsLogging(false)
  }

  const handleShopifyConnect = async () => {
    setError('')
    setIsConnecting(true)

    try {
      await testStorefrontConnection()
    } catch (err) {
      setError(err.message)
      setIsConnecting(false)
    }
  }

  const testStorefrontConnection = async () => {
    // Since we no longer have hardcoded credentials, we'll use mock mode for admin login
    console.log('🔧 Admin Login: Using mock mode for store connection')
    
    const mockStoreData = {
      shop: {
        name: 'Demo Store (Admin)',
        domain: 'demo-store.myshopify.com',
        description: 'Mock store for admin testing',
        url: 'https://demo-store.myshopify.com',
        currency: 'USD'
      },
      access_token: 'mock_admin_token',
      connected_at: new Date().toISOString(),
      connection_type: 'mock_admin_mode'
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Combine admin data with store data
    const completeData = {
      ...adminData,
      store: mockStoreData
    }
    
    localStorage.setItem('admin_session', JSON.stringify(completeData))
    onSuccessfulLogin(completeData)
  }

  const features = [
    {
      icon: <RiRobot2Fill className="w-6 h-6" />,
      title: "Chatbot Management",
      description: "Configure and monitor your AI assistant"
    },
    {
      icon: <MdAdminPanelSettings className="w-6 h-6" />,
      title: "Admin Dashboard", 
      description: "Complete control over your store integration"
    },
    {
      icon: <SiShopify className="w-6 h-6" />,
      title: "Shopify Integration",
      description: "Connect and sync with your Shopify store"
    }
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white flex-col justify-center">
        <div className="max-w-lg">
          <div className="flex items-center mb-8">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              {currentStep === 1 ? (
                <MdAdminPanelSettings className="w-8 h-8" />
              ) : (
                <SiShopify className="w-8 h-8" />
              )}
            </div>
            <h1 className="text-3xl font-bold">
              {currentStep === 1 ? 'Admin Dashboard' : 'Connect Your Store'}
            </h1>
          </div>
          
          <p className="text-xl mb-12 text-indigo-100">
            {currentStep === 1 
              ? 'Manage your Shopify chatbot and store integrations with powerful admin tools.'
              : 'Connect your Shopify store to enable AI-powered customer assistance.'
            }
          </p>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'
              }`}>
                {currentStep > 1 ? <IoCheckmarkCircle className="w-5 h-5" /> : '1'}
              </div>
              <div className={`h-1 w-16 ${currentStep > 1 ? 'bg-white' : 'bg-white/20'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'
              }`}>
                2
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-indigo-100 w-8 text-center">Login</span>
              <span className="w-16"></span>
              <span className="text-sm text-indigo-100 w-8 text-center">Connect</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-indigo-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Demo Credentials Display - Only show on step 1 */}
          {currentStep === 1 && (
            <div className="mt-12 bg-white/10 rounded-lg p-4 border border-white/20">
              <h4 className="font-semibold mb-2 text-indigo-100">Demo Credentials:</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-indigo-200">Email:</span> admin@ryderpartners.com</p>
                <p><span className="text-indigo-200">Password:</span> admin123</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-full mr-3">
                {currentStep === 1 ? (
                  <MdAdminPanelSettings className="w-8 h-8 text-indigo-600" />
                ) : (
                  <SiShopify className="w-8 h-8 text-green-600" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentStep === 1 ? 'Admin Dashboard' : 'Connect Store'}
              </h1>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStep === 1 ? 'Welcome Back' : 'Almost There!'}
            </h2>
            <p className="text-gray-600">
              {currentStep === 1 
                ? 'Sign in to your admin dashboard'
                : 'Connect your Shopify store to complete setup'
              }
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {currentStep === 1 ? (
              // Step 1: Admin Login Form
              <form onSubmit={handleAdminLogin} className="space-y-6">
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="admin@ryderpartners.com"
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
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                  disabled={isLogging}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                  {isLogging ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <MdAdminPanelSettings className="w-6 h-6 mr-3" />
                      Sign In to Dashboard
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Step 2: Shopify Connection
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <SiShopify className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Connect</h3>
                  <p className="text-sm text-gray-600">
                    Connect your Shopify store to enable the chatbot
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleShopifyConnect}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Connecting to Store...
                    </>
                  ) : (
                    <>
                      <SiShopify className="w-6 h-6 mr-3" />
                      Connect to Shopify Store
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            )}

            {/* Demo Info for Mobile - Only show on step 1 */}
            {currentStep === 1 && (
              <div className="lg:hidden mt-6 bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-semibold mb-2 text-gray-700">Demo Credentials:</h4>
                <div className="text-sm space-y-1 text-gray-600">
                  <p><span className="font-medium">Email:</span> admin@ryderpartners.com</p>
                  <p><span className="font-medium">Password:</span> admin123</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin 