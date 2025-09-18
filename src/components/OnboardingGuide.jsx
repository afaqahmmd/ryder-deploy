import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  MdStore, 
  MdInventory, 
  MdLibraryBooks, 
  MdSmartToy,
  MdCheckCircle,
  MdArrowForward,
  MdArrowBack,
  MdClose,
  MdPlayArrow,
  MdInfo,
  MdSecurity,
  MdSpeed,
  MdSearch,
  MdPerson
} from 'react-icons/md'
import { SiShopify } from 'react-icons/si'
import { apiService } from '../services/api'

const OnboardingGuide = ({ onComplete, onSkip, onNavigateToStep }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [productDatabaseStatus, setProductDatabaseStatus] = useState('not_started')
  
  // Get store and other data from Redux
  const { stores, productCounts } = useSelector(state => state.stores)
  const { agents } = useSelector(state => state.agents || {})
  
  // For products, we'll use the product counts from stores
  const totalProducts = Object.values(productCounts || {}).reduce((sum, count) => sum + count, 0)
  
  // Check if user has no stores connected
  const hasNoStores = stores.length === 0

  const totalSteps = 4

  // Function to check product database status
  const checkProductDatabaseStatus = async () => {
    try {
      if (stores.length === 0) {
        setProductDatabaseStatus('not_started')
        return
      }
      
      const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0)
      if (totalProducts === 0) {
        setProductDatabaseStatus('no_products')
        return
      }
      
      const storeWithProducts = stores.find(store => productCounts[store.id] > 0)
      if (!storeWithProducts) {
        setProductDatabaseStatus('no_products')
        return
      }
      
      // try {
      //   const response = await apiService.embeddings.getStats(storeWithProducts.id)
      //   const stats = response.data?.details?.data
      //   if (stats && stats.points_count > 0) {
      //     setProductDatabaseStatus('ready')
      //   } else {
      //     setProductDatabaseStatus('pending')
      //   }
      // } catch (error) {
      //   console.log('🔍 DEBUG - No embedding database found, status: pending')
      //   setProductDatabaseStatus('pending')
      // }
    } catch (error) {
      console.error('Error checking product database status:', error)
      setProductDatabaseStatus('error')
    }
  }

  // Check product database status when stores or product counts change
  useEffect(() => {
    if (stores.length > 0 && Object.keys(productCounts).length > 0) {
      checkProductDatabaseStatus()
    }
  }, [stores, productCounts])

  // Check completion status for each step
  useEffect(() => {
    const newCompletedSteps = []
    
    // Step 1: Check if store is connected
    if (stores && stores.length > 0) {
      newCompletedSteps.push(1)
    }
    
    // Step 2: Check if products are loaded (only if stores exist)
    if (stores && stores.length > 0 && totalProducts > 0) {
      newCompletedSteps.push(2)
    }
    
    // Step 3: Check if knowledge base exists (only if product database is ready)
    if (stores && stores.length > 0 && totalProducts > 0 && productDatabaseStatus === 'ready') {
      newCompletedSteps.push(3)
    }
    
    // Step 4: Check if agent is created (only if stores exist)
    if (stores && stores.length > 0 && agents && agents.length > 0) {
      newCompletedSteps.push(4)
    }
    
    setCompletedSteps(newCompletedSteps)
  }, [stores, totalProducts, productDatabaseStatus, agents])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true')
    onSkip()
  }

  // Debug function to reset onboarding (for testing)
  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed')
    setCurrentStep(1)
    setCompletedSteps([])
  }

  // Add this to the component for testing (remove in production)
  useEffect(() => {
    // Debug: Add reset function to window for testing
    if (process.env.NODE_ENV === 'development') {
      window.resetOnboarding = resetOnboarding
    }
  }, [])

  const isStepCompleted = (step) => completedSteps.includes(step)

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <SiShopify className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isStepCompleted(1) ? 'Store Connected Successfully!' : 'Step 1: Connect Your Online Store'}
            </h3>
            
            {/* Why this step is important */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdInfo className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-blue-800 text-lg">Why is this important?</h4>
              </div>
              <p className="text-blue-700 text-sm leading-relaxed">
                Connecting your Shopify store is the foundation of your AI salesperson. This allows us to access your product catalog, 
                understand your brand, and provide accurate product recommendations to your customers. Without this connection, 
                your AI salesperson won't be able to help customers find the right products.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              {isStepCompleted(1) 
                ? 'Excellent! Your Shopify store is now securely connected. We can now access your product catalog and start building your AI salesperson.'
                : hasNoStores 
                  ? 'Your AI salesperson needs to know about your products to help customers. Let\'s connect your Shopify store to get started.'
                  : 'First, we need to establish a secure connection to your Shopify store so we can access your product catalog and help customers find what they\'re looking for.'
              }
            </p>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-1">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                <MdStore className="w-5 h-5 mr-2 text-blue-600" />
                How to connect your store:
              </h4>
              <ol className="text-left text-gray-700 space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                  <div>
                    <span className="font-medium">Navigate to Stores Section</span>
                    <p className="text-gray-600 mt-1">Click on the <strong>"Stores"</strong> option in the left sidebar menu</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                  <div>
                    <span className="font-medium">Add Your Store</span>
                    <p className="text-gray-600 mt-1">Click the <strong>"Add Store"</strong> button to begin the connection process</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                  <div>
                    <span className="font-medium">Get Your Store Keys</span>
                    <p className="text-gray-600 mt-1">Follow our step-by-step guide to obtain your Shopify API keys from your store admin</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                  <div>
                    <span className="font-medium">Complete Connection</span>
                    <p className="text-gray-600 mt-1">Enter your store URL and API credentials, then click <strong>"Connect Store"</strong></p>
                  </div>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <MdSecurity className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-800 text-xs">
                    <strong>Security Note:</strong> Your store credentials are encrypted and stored securely. We only use them to access your product data.
                  </div>
                </div>
              </div>
            </div>
            
            {isStepCompleted(1) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center">
                  <MdCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium text-lg">Store connection completed successfully!</span>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => onNavigateToStep && onNavigateToStep('stores')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto font-medium"
              >
                <MdStore className="w-5 h-5 mr-2" />
                {isStepCompleted(1) ? 'View Connected Stores' : 'Connect Your Store'}
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <MdInventory className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isStepCompleted(2) ? 'Products Loaded Successfully!' : 'Step 2: Sync Your Product Catalog'}
            </h3>
            
            {/* Why this step is important */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdInfo className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-green-800 text-lg">Why is this important?</h4>
              </div>
              <p className="text-green-700 text-sm leading-relaxed">
                Your AI salesperson needs to know about every product you sell to provide accurate recommendations. This step ensures 
                all your products, including their descriptions, prices, images, and availability, are properly synced from your 
                Shopify store to our system. This data will be used to create a smart product database in the next step.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              {isStepCompleted(2)
                ? `Perfect! We've successfully synced ${totalProducts} products from your store. Your AI salesperson now has access to your complete product catalog.`
                : 'Now we need to sync all your products from your Shopify store to our system. This ensures your AI salesperson has the most up-to-date information about your inventory.'
              }
            </p>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-1">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                <MdInventory className="w-5 h-5 mr-2 text-green-600" />
                How to sync your products:
              </h4>
              <ol className="text-left text-gray-700 space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                  <div>
                    <span className="font-medium">Access Products Section</span>
                    <p className="text-gray-600 mt-1">Go to the <strong>"Products"</strong> section in the left sidebar menu</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                  <div>
                    <span className="font-medium">Wait for Initial Load</span>
                    <p className="text-gray-600 mt-1">The system will automatically start syncing your products - this may take a few moments</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                  <div>
                    <span className="font-medium">Verify Product Count</span>
                    <p className="text-gray-600 mt-1">Check that the total number of products matches what you see in your Shopify admin</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                  <div>
                    <span className="font-medium">Refresh if Needed</span>
                    <p className="text-gray-600 mt-1">If products are missing, click the refresh button to force a new sync from your store</p>
                  </div>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <MdSpeed className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-800 text-xs">
                    <strong>Sync Information:</strong> We sync product titles, descriptions, prices, images, variants, and availability. 
                    The sync happens automatically and updates when you make changes in Shopify.
                  </div>
                </div>
              </div>
            </div>
            
            {isStepCompleted(2) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center">
                  <MdCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium text-lg">
                    {totalProducts} products successfully synced!
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => onNavigateToStep && onNavigateToStep('products')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto font-medium"
              >
                <MdInventory className="w-5 h-5 mr-2" />
                {isStepCompleted(2) ? 'View Synced Products' : 'Sync Products'}
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <MdLibraryBooks className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isStepCompleted(3) ? 'Product Database Created!' : 'Step 3: Build Your Smart Product Database'}
            </h3>
            
            {/* Why this step is important */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdInfo className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-purple-800 text-lg">Why is this important?</h4>
              </div>
              <p className="text-purple-700 text-sm leading-relaxed">
                This step creates an intelligent search database that understands your products like a human would. It analyzes product 
                descriptions, features, and categories to enable natural language search. When customers ask "I need something for my 
                kitchen" or "Show me red dresses under $50", your AI salesperson will understand exactly what they're looking for.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              {isStepCompleted(3)
                ? 'Excellent! Your smart product database is ready. Customers can now ask your AI salesperson questions about your products using natural language, and your AI salesperson will understand exactly what they\'re looking for.'
                : 'Now we\'ll create an intelligent database that understands your products. This is the most important step in the setup process. Without this step, your AI salesperson will not be able to search your products.'
              }
            </p>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-1">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                <MdLibraryBooks className="w-5 h-5 mr-2 text-purple-600" />
                How to build your product database:
              </h4>
              <ol className="text-left text-gray-700 space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                  <div>
                    <span className="font-medium">Navigate to Knowledge Base</span>
                    <p className="text-gray-600 mt-1">Go to the <strong>"Product Database"</strong> section in the left sidebar menu</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                  <div>
                    <span className="font-medium">Select Your Store</span>
                    <p className="text-gray-600 mt-1">Choose your connected store from the available stores</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                  <div>
                    <span className="font-medium">Automatic Database Creation</span>
                    <p className="text-gray-600 mt-1">The system will first check if the database exists - this process takes a few minutes</p>
                    <p className="text-gray-600 mt-1">If the database does not exist, click on the <strong>"Create Database"</strong> button to create it</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                  <div>
                    <span className="font-medium">Test the Search</span>
                    <p className="text-gray-600 mt-1">Try searching for products using natural language to verify everything works correctly</p>
                  </div>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start">
                  <MdSearch className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-purple-800 text-xs">
                    <strong>Search Examples:</strong> "gifts for teenagers", "organic skincare products", "items under $25", 
                    "kitchen appliances", "summer clothing for women"
                  </div>
                </div>
              </div>
            </div>
            
            {isStepCompleted(3) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center">
                  <MdCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium text-lg">Smart product database created successfully!</span>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => onNavigateToStep && onNavigateToStep('knowledge-base')}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto font-medium"
              >
                <MdLibraryBooks className="w-5 h-5 mr-2" />
                {isStepCompleted(3) ? 'View Database' : 'Build Database'}
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <MdSmartToy className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isStepCompleted(4) ? 'AI Salesperson Created!' : 'Step 4: Create Your AI Salesperson'}
            </h3>
            
            {/* Why this step is important */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdInfo className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-orange-800 text-lg">Why is this important?</h4>
              </div>
              <p className="text-orange-700 text-sm leading-relaxed">
                Your AI salesperson is the final piece that brings everything together. It combines your product database with 
                intelligent conversation skills to help customers find products, answer questions, and provide personalized 
                recommendations. Think of it as having a knowledgeable salesperson available 24/7 who knows your entire product catalog.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              {isStepCompleted(4)
                ? 'Fantastic! Your AI salesperson is ready to help customers. It can now understand customer needs, search your products, and provide personalized recommendations just like a real salesperson would.'
                : 'Finally, let\'s create your AI salesperson that will greet customers, understand their needs, search your products, and provide personalized recommendations. This is where the magic happens!'
              }
            </p>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-1">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                <MdSmartToy className="w-5 h-5 mr-2 text-orange-600" />
                How to create your AI salesperson:
              </h4>
              <ol className="text-left text-gray-700 space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                  <div>
                    <span className="font-medium">Access AI Salespeople</span>
                    <p className="text-gray-600 mt-1">Go to the <strong>"AI Salespeople"</strong> section in the left sidebar menu</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                  <div>
                    <span className="font-medium">Create New Salesperson</span>
                    <p className="text-gray-600 mt-1">Click <strong>"Create New Salesperson"</strong> to start the setup wizard</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                  <div>
                    <span className="font-medium">Configure Personality</span>
                    <p className="text-gray-600 mt-1">Give your salesperson a name, choose their personality style, and set their expertise areas</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                  <div>
                    <span className="font-medium">Test Your Salesperson</span>
                    <p className="text-gray-600 mt-1">Once created, click the <strong>play button</strong> to start a conversation and test their capabilities</p>
                  </div>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start">
                  <MdPerson className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-orange-800 text-xs">
                    <strong>What your AI salesperson can do:</strong> Greet customers, understand their needs, search products using natural language, 
                    provide recommendations, answer questions about products, and help with the shopping experience.
                  </div>
                </div>
              </div>
            </div>
            
            {isStepCompleted(4) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center">
                  <MdCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium text-lg">AI Salesperson created successfully!</span>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => onNavigateToStep && onNavigateToStep('agents')}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center mx-auto font-medium"
              >
                <MdSmartToy className="w-5 h-5 mr-2" />
                {isStepCompleted(4) ? 'View Your Salespeople' : 'Create Salesperson'}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {hasNoStores ? 'Complete Your Setup' : 'Welcome to Your AI Salesperson!'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {hasNoStores 
                ? 'Connect your store and complete the setup in 4 simple steps'
                : "Let's get you set up in just 4 simple steps"
              }
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm sm:text-base font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm sm:text-base text-gray-500">
              {completedSteps.length} of {totalSteps} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isStepCompleted(step)
                      ? 'bg-green-500 text-white'
                      : currentStep === step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isStepCompleted(step) ? <MdCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                  {step === 1 && 'Store'}
                  {step === 2 && 'Products'}
                  {step === 3 && 'Database'}
                  {step === 4 && 'Salesperson'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="h-full">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdArrowBack className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex space-x-2">
            {currentStep === totalSteps ? (
              <button
                onClick={handleComplete}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
              >
                Get Started
                <MdArrowForward className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
              >
                Next Step
                <MdArrowForward className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingGuide
