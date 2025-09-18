import { useState, useEffect } from 'react'
import { 
  MdStore, 
  MdInventory, 
  MdLibraryBooks, 
  MdSmartToy,
  MdCheckCircle,
  MdArrowForward,
  MdArrowBack,
  MdInfo,
  MdSecurity,
  MdSpeed,
  MdSearch,
  MdPerson,
  MdCode,
  MdTrendingUp,
  MdAccessTime,
  MdRocket,
  MdLightbulb
} from 'react-icons/md'
import { SiShopify } from 'react-icons/si'

const SignupOnboardingGuide = ({ onComplete }) => {
  console.log('🔍 DEBUG - SignupOnboardingGuide rendered')
  const [currentStep, setCurrentStep] = useState(1)

  const totalSteps = 4

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
    console.log('🔍 DEBUG - handleComplete called, completing signup onboarding')
    // Mark signup onboarding as completed
    localStorage.setItem('signup_onboarding_completed', 'true')
    // Call onComplete to proceed to next step (Shopify connection)
    onComplete()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <SiShopify className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Connect Your Store
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdLightbulb className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 -ml-2" />
                <h4 className="font-semibold text-blue-800 text-lg">What you'll do:</h4>
              </div>
              <ul className="list-disc list-inside text-blue-700 text-md leading-relaxed text-left text-justify">
                <li>You'll connect your Shopify store to our platform. This gives your AI salesperson access to your product catalog 
                so it can help customers find exactly what they're looking for.</li>
              {/* </p> */}
              {/* <ul className="text-blue-700 text-md leading-relaxed text-left text-justify"> */}
                <li>Think of this as giving your AI salesperson a complete catalog of your store. Once connected, it will know about 
                every product you sell, their prices, descriptions, and availability.</li>
              </ul>
              <p className="text-blue-700 text-md leading-relaxed text-left text-justify mt-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                  <MdInfo className="w-5 h-5 mr-2 text-blue-600 -ml-2" />
                  What you'll need:
                </h4>
                <ul className="list-disc list-inside text-blue-700 text-md leading-relaxed text-left text-justify">
                  <li>Your Shopify store URL</li>
                  <li>Your Shopify API credentials</li>
                </ul>
              </p>
            </div>
{/*             
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-1">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                <MdInfo className="w-5 h-5 mr-2 text-blue-600" />
                Quick Overview:
              </h4>
              <div className="text-left text-gray-700 space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                  <div>
                    <span className="font-medium">Go to Stores section</span>
                    <p className="text-gray-600 mt-1">Click "Add Store" and enter your Shopify credentials</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                  <div>
                    <span className="font-medium">We'll sync your products</span>
                    <p className="text-gray-600 mt-1">All your products will be imported automatically</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <MdSecurity className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-800 text-xs">
                    <strong>Note:</strong> Your store credentials are encrypted and secure. We only access your product data.
                  </div>
                </div>
              </div>
            </div> */}
            
            {/* <div className="mt-4">
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto font-medium"
              >
                <MdArrowForward className="w-5 h-5 mr-2" />
                Next: Product Database
              </button>
            </div> */}
          </div>
        )

      case 2:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <MdInventory className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Build Smart Product Database
            </h3>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdLightbulb className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-green-800 text-lg">What you'll do:</h4>
              </div>
              <ul className="list-disc list-inside text-green-700 text-md leading-relaxed text-left text-justify">
                <li>You'll create an intelligent database that understands your products. This allows customers to search using 
                natural language like "I need a gift for my mom" instead of just keywords.</li>
                <li>This is where the magic happens! Your AI salesperson will be able to understand customer needs and find the 
                perfect products, even when customers don't know exactly what they're looking for.</li>
              </ul>
              <p className="text-green-700 text-md leading-relaxed text-left text-justify mt-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                  <MdInfo className="w-5 h-5 mr-2 text-green-600" />
                  What you'll need:
                </h4>
                <ul className="list-disc list-inside text-green-700 text-md leading-relaxed text-left text-justify">
                  <li>Go to Product Database section and select your store</li>
                  <li>Click "Create Database" and wait for processing (few minutes)</li>
                  <li>Test with natural language searches like "gifts for teenagers"</li>
                </ul>
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <MdSmartToy className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Create Your AI Salesperson
            </h3>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdLightbulb className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-purple-800 text-lg">What you'll do:</h4>
              </div>
              <ul className="list-disc list-inside text-purple-700 text-md leading-relaxed text-left text-justify">
                <li>You'll create your AI salesperson with a unique personality and style. This AI will be available 24/7 on your 
                website to help customers find products and increase your sales.</li>
                <li>This is where everything comes together! Your AI salesperson will combine everything - your products, the smart database, and 
                conversational AI - to provide an amazing customer experience.</li>
              </ul>
              <p className="text-purple-700 text-md leading-relaxed text-left text-justify mt-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                  <MdInfo className="w-5 h-5 mr-2 text-purple-600" />
                  What you'll need:
                </h4>
                <ul className="list-disc list-inside text-purple-700 text-md leading-relaxed text-left text-justify">
                  <li>Go to AI Salespeople section and click "Create New Salesperson"</li>
                  <li>Choose a name and personality for your AI</li>
                  <li>Test your salesperson by chatting with it</li>
                </ul>
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="bg-orange-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <MdCode className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Add to Your Website
            </h3>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-start mb-2">
                <MdLightbulb className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-orange-800 text-lg">What you'll do:</h4>
              </div>
              <ul className="list-disc list-inside text-orange-700 text-md leading-relaxed text-left text-justify">
                <li>You'll get an embed code to add to your Shopify website. Once added, your AI salesperson will appear as a 
                chat widget and be available 24/7 to help your customers find products and increase your sales.</li>
                <li>This is the final step! Your AI salesperson will be live on your website, helping customers find products, 
                answer questions, and provide personalized recommendations just like a real salesperson would.</li>
              </ul>
              <p className="text-orange-700 text-md leading-relaxed text-left text-justify mt-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                  <MdInfo className="w-5 h-5 mr-2 text-orange-600" />
                  What you'll need:
                </h4>
                <ul className="list-disc list-inside text-orange-700 text-md leading-relaxed text-left text-justify">
                  <li>Copy the embed code from your AI salesperson settings</li>
                  <li>Add the code to your Shopify theme's HTML</li>
                  <li>Your AI salesperson will be live on your website</li>
                </ul>
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[95vh] sm:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate text-center">
              Welcome to Ryder Partners!
            </h2>
            <p className="text-md sm:text-lg text-gray-600 truncate text-center">
              Here's a quick start up guide to help you get started with Ryder Partners.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {/* <div className="px-4 sm:px-6 py-3 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm sm:text-base text-gray-500">
              Quick Setup Guide
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div> */}

        {/* Step Indicators */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                    currentStep > step
                      ? 'bg-green-500 text-white'
                      : currentStep === step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? <MdCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                  {step === 1 && 'Connect'}
                  {step === 2 && 'Database'}
                  {step === 3 && 'Create AI'}
                  {step === 4 && 'Add to Site'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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

export default SignupOnboardingGuide
