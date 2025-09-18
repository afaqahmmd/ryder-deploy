import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SiShopify } from 'react-icons/si'
import { RiRobot2Fill } from 'react-icons/ri'
import { IoCheckmarkCircle, IoClose } from 'react-icons/io5'
import { MdArrowForward, MdPlayArrow } from 'react-icons/md'
import { connectShopifyStore } from '../store/shopify/shopifyThunk'
import { clearShopifyError } from '../store/shopify/shopifySlice'

const ShopifyLogin = ({ onSuccessfulConnection }) => {
  const dispatch = useDispatch()
  const { isConnecting, isConnected, connectionData, error } = useSelector(state => state.shopify)
  
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    shopDomain: '',
    storefrontToken: ''
  })

  useEffect(() => {
    if (isConnected && connectionData) {
      setShowModal(false)
      onSuccessfulConnection(connectionData)
    }
  }, [isConnected, connectionData, onSuccessfulConnection])

  useEffect(() => {
    return () => {
      dispatch(clearShopifyError())
    }
  }, [dispatch])

  const handleConnectClick = () => {
    setShowModal(true)
    dispatch(clearShopifyError())
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) {
      dispatch(clearShopifyError())
    }
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.clientId || !formData.clientSecret || !formData.shopDomain || !formData.storefrontToken) {
      return
    }

    dispatch(connectShopifyStore({
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      shopDomain: formData.shopDomain,
      storefrontToken: formData.storefrontToken
    }))
  }

  const features = [
    {
      icon: <RiRobot2Fill className="w-6 h-6" />,
      title: "AI-Powered Assistance",
      description: "Smart chatbot trained on your store's products and policies"
    },
    {
      icon: <IoCheckmarkCircle className="w-6 h-6" />,
      title: "Real-time Integration", 
      description: "Instantly syncs with your Shopify store data"
    },
    {
      icon: <MdArrowForward className="w-6 h-6" />,
      title: "Behavioral Intelligence",
      description: "Proactive engagement based on customer behavior"
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
            <h1 className="text-3xl font-bold">Intelligent Shopify Chatbot</h1>
          </div>
          
          <p className="text-xl mb-12 text-blue-100">
            Transform your customer experience with AI-powered assistance that knows your store inside and out.
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
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <RiRobot2Fill className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Intelligent Chatbot</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Store</h2>
            <p className="text-gray-600">
              Setup your Shopify connection to get started
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center space-y-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <SiShopify className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Connect</h3>
                <p className="text-sm text-gray-600">
                  Secure connection to your Shopify store
                </p>
              </div>

              <button
                onClick={handleConnectClick}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center justify-center text-lg"
              >
                <SiShopify className="w-6 h-6 mr-3" />
                Connect to Shopify
              </button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Secure API connection</p>
                <p>✓ No data stored on our servers</p>
                <p>✓ Full control over permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
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
                onClick={() => setShowModal(false)}
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
                <form onSubmit={handleConnect} className="flex-1 flex flex-col">
                  <div className="space-y-6 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storefront Access Token
                      </label>
                      <input
                        type="text"
                        name="storefrontToken"
                        value={formData.storefrontToken}
                        onChange={handleFormChange}
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
                        value={formData.clientId}
                        onChange={handleFormChange}
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
                        value={formData.clientSecret}
                        onChange={handleFormChange}
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
                        value={formData.shopDomain}
                        onChange={handleFormChange}
                        placeholder="your-shop-name.myshopify.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Form Footer */}
                  <div className="flex space-x-4 mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
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
      )}
    </div>
  )
}

export default ShopifyLogin 