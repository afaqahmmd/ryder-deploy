import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiRobot2Fill, RiMailLine } from 'react-icons/ri'
import { MdVerifiedUser, MdArrowForward, MdPlayArrow } from 'react-icons/md'
import { SiShopify } from 'react-icons/si'
import { IoClose } from 'react-icons/io5'
import { verifyOTP, resendOTP } from '../store/signup/signupThunk'
import { clearSignupError, updateResendCountdown } from '../store/signup/signupSlice'
import { startTokenRefreshTimer } from '../utils/tokenManager'
import SignupOnboardingGuide from './SignupOnboardingGuide'
import { connectShopifyStore } from '../store/shopify/shopifyThunk'
import { clearShopifyError } from '../store/shopify/shopifySlice'

const VerifyOtp = ({ email, onVerificationSuccess, onBackToSignup }) => {
  const dispatch = useDispatch()
  const { isVerifying, isResending, error, isEmailVerified, user, tokens, expiresAt, resendCountdown, canResendOtp } = useSelector(state => state.signup)
  const { isConnecting, isConnected, connectionData, shopifyError } = useSelector(state => state.shopify)
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [showSignupOnboarding, setShowSignupOnboarding] = useState(false)
  const [showShopifyModal, setShowShopifyModal] = useState(false)
  const [shopifyFormData, setShopifyFormData] = useState({
    storefrontToken: '',
    clientId: '',
    clientSecret: '',
    shopDomain: ''
  })

  useEffect(() => {
    if (isEmailVerified && user && tokens) {
      console.log('🔍 DEBUG - OTP verified, setting up user session')
      // Start token refresh timer
      startTokenRefreshTimer(dispatch, expiresAt)
      
      // Store user session in localStorage for ProtectedRoute compatibility
      const userSession = {
        user: user,
        tokens: tokens,
        loginTime: new Date().toISOString(),
        sessionId: 'user_' + Date.now(),
        expiresAt: expiresAt,
        isNewUser: true // Mark as new user for onboarding
      }
      localStorage.setItem('user_session', JSON.stringify(userSession))
      console.log('🔍 DEBUG - User session set with isNewUser: true')
      
      // Show signup onboarding guide instead of navigating to dashboard
      setShowSignupOnboarding(true)
    }
  }, [isEmailVerified, user, tokens, expiresAt, dispatch])

  // Handle successful Shopify connection
  useEffect(() => {
    if (isConnected && connectionData) {
      console.log('🔍 DEBUG - Shopify connected successfully, navigating to dashboard')
      setShowShopifyModal(false)
      // Now navigate to dashboard
      onVerificationSuccess(user, tokens)
    }
  }, [isConnected, connectionData, onVerificationSuccess, user, tokens])

  useEffect(() => {
    return () => {
      dispatch(clearSignupError())
      dispatch(clearShopifyError())
    }
  }, [dispatch])

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        dispatch(updateResendCountdown());
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendCountdown, dispatch])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      return
    }
    
    dispatch(verifyOTP({ email, otp: otpString }))
  }

  const handleResendOtp = () => {
    if (canResendOtp) {
      dispatch(resendOTP({ email }))
    }
  }

  const handleSignupOnboardingComplete = () => {
    console.log('🔍 DEBUG - Signup Onboarding Completed, showing Shopify modal')
    setShowSignupOnboarding(false)
    setShowShopifyModal(true)
  }

  const handleShopifyFormChange = (e) => {
    const { name, value } = e.target
    setShopifyFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear any existing errors when user starts typing
    if (shopifyError) {
      dispatch(clearShopifyError())
    }
  }

  const handleShopifyConnect = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    const { storefrontToken, clientId, clientSecret, shopDomain } = shopifyFormData
    if (!storefrontToken || !clientId || !clientSecret || !shopDomain) {
      alert('Please fill in all required fields')
      return
    }

    // Dispatch the connect action
    dispatch(connectShopifyStore({
      storefrontToken,
      clientId,
      clientSecret,
      shopDomain
    }))
  }

  const handleSkipShopify = () => {
    console.log('🔍 DEBUG - Skipping Shopify connection, navigating to dashboard')
    setShowShopifyModal(false)
    // Navigate to dashboard without connecting Shopify
    onVerificationSuccess(user, tokens)
  }

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // If showing signup onboarding, render that instead
  if (showSignupOnboarding) {
    return (
      <SignupOnboardingGuide 
        onComplete={handleSignupOnboardingComplete}
      />
    )
  }

  // If showing Shopify modal, render that
  if (showShopifyModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{zIndex: 9999}}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <SiShopify className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Connect to Shopify</h3>
                <p className="text-sm text-gray-600">Enter your store credentials</p>
              </div>
            </div>
            <button
              onClick={handleSkipShopify}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body - Two Column Layout */}
          <div className="flex flex-col lg:flex-row max-h-[calc(95vh-80px)]">
            {/* Left Column - Instructions & Video */}
            <div className="lg:w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
              {/* Video Demo Button */}
              <div className="text-center mb-6">
                <button
                  type="button"
                  onClick={() => window.open('/videos/shopify-connection-demo.mp4', '_blank')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <MdPlayArrow className="w-5 h-5 mr-2" />
                  🎥 Watch Demo Video
                </button>
                <p className="text-xs text-gray-500 mt-2">See how to get your Shopify credentials in 3 minutes</p>
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-3">Step-by-Step Guide to Get Your Shopify Credentials</h4>
                <div className="text-xs text-blue-700 space-y-3">
                  <div>
                    <p className="font-semibold mb-2">1. Log in to Your Shopify Admin</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Open <strong>admin.shopify.com</strong> in your browser</li>
                      <li>Select the store you want to connect</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-2">2. Create a New App</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>In the bottom-left corner of your Shopify admin, click Settings</li>
                      <li>From the left menu, select Apps and sales channels</li>
                      <li>At the top right, click Develop apps</li>
                      <li>Click Create an app</li>
                      <li>Enter a unique App name (e.g., "My Store Connector")</li>
                      <li>Choose yourself (or the appropriate person) as the App developer</li>
                      <li>Click create app</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-2">3. Configure API Access</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Once you click on "Create app", it will take you to the App development page, where you will configure the access to your store</li>
                      <li>Click on "Configure Storefront API scopes"</li>
                      <li>If you can not find "Configure Storefront API scopes", click on "Configuration" tab and then on the "Storefront API Integration" section, click "configure"</li>
                      <li>Check all "Read" permissions (this gives the app permission to read your store's data)</li>
                      <li>Click Save</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-2">4. Install the App</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>From the tabs, select "API Credentials"</li>
                      <li>Install the app by clicking on "Install app"</li>
                      <li>When the pop-up appears, click Install to confirm</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-2">5. Copy Your API Keys</p>
                    <p className="mb-2">Once the app is installed, you'll see your credentials. Please copy and paste them in the fields on the left side.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Storefront API Access Token</strong> → copy and paste it in the "Storefront Access Token" field</li>
                      <li><strong>API Key</strong> → copy and paste it in the "API Key" field</li>
                      <li><strong>API Secret Key</strong> → copy and paste it in the "API Secret" field</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-2">6. Get Your Domain</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>From the left menu bar, select "Domains"</li>
                      <li>All your domains will be listed</li>
                      <li>Select the domain that ends with "myshopify.com"</li>
                      <li>Copy the domain and paste it in the "Shop Domain" field</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">7. Connect Store</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Once you have all the credentials, click on "Connect Store"</li>
                      <li>And you are done! Welcome to Ryder Partners!</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-3">
                    <p className="text-amber-700 font-medium text-xs">
                      Important: Treat these keys like a password. Do not share them publicly.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-3">
                    <p className="text-green-700 font-medium text-xs">
                      That's it! Your Shopify app is now created and connected.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:w-1/2 p-6 flex flex-col">
              <form onSubmit={handleShopifyConnect} className="flex-1 flex flex-col">
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storefront Access Token
                    </label>
                    <input
                      type="text"
                      name="storefrontToken"
                      value={shopifyFormData.storefrontToken}
                      onChange={handleShopifyFormChange}
                      placeholder="Your Storefront API access token"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                                         <input
                       type="text"
                       name="clientId"
                       value={shopifyFormData.clientId}
                       onChange={handleShopifyFormChange}
                       placeholder="Your Shopify API Key"
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       required
                     />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Secret
                    </label>
                                         <input
                       type="password"
                       name="clientSecret"
                       value={shopifyFormData.clientSecret}
                       onChange={handleShopifyFormChange}
                       placeholder="Your Shopify API Secret"
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       required
                     />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shop Domain
                    </label>
                    <input
                      type="text"
                      name="shopDomain"
                      value={shopifyFormData.shopDomain}
                      onChange={handleShopifyFormChange}
                      placeholder="your-shop-name.myshopify.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {shopifyError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {shopifyError}
                    </div>
                  )}
                </div>

                {/* Form Footer */}
                <div className="flex space-x-4 mt-6 pt-4 border-t border-gray-200">
                 
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <SiShopify className="w-5 h-5 mr-2" />
                        Connect Store
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Message */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 p-12 text-white flex-col justify-center">
        <div className="max-w-lg">
          <div className="flex items-center mb-8">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <RiRobot2Fill className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Almost There!</h1>
          </div>
          
          <p className="text-xl mb-8 text-purple-100">
            We've sent a verification code to your email address. Please enter it to complete your registration.
          </p>
          
          <div className="bg-white/10 rounded-lg p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <RiMailLine className="w-6 h-6 mr-3" />
              <span className="font-semibold">Check your email</span>
            </div>
            <p className="text-purple-100 text-sm">
              The verification code was sent to <strong>{email}</strong>
            </p>
          </div>

          <div className="mt-8 bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-purple-100 text-sm mb-2">Need to change your email?</p>
            <button
              onClick={onBackToSignup}
              className="text-white font-semibold hover:text-purple-200 transition-colors"
            >
              Go back to signup →
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-3">
                <RiRobot2Fill className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Intelligent Chatbot</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600 mb-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-purple-600 font-semibold">
              {email}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      name={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      maxLength={1}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <MdVerifiedUser className="w-5 h-5 mr-2" />
                    Verify Email
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOtp}
                disabled={!canResendOtp || isResending}
                className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  'Sending...'
                ) : canResendOtp ? (
                  'Resend Code'
                ) : (
                  `Resend in ${formatCountdown(resendCountdown)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp 