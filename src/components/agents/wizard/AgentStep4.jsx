import { useState, useEffect } from 'react'
import { 
  RiGlobeLine,
  RiInformationLine,
  RiLink,
  RiExternalLinkLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiThumbUpLine,
  RiThumbDownLine
} from 'react-icons/ri'
import { axiosInstance } from '../../../utils/axios'

const AgentStep4 = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    shopify_frontend_url: ''
  })
  const [errors, setErrors] = useState({})
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [scrapedData, setScrapedData] = useState(null)
  const [showScrapedData, setShowScrapedData] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDataConfirmed, setIsDataConfirmed] = useState(false)

  // Load data from cache
  useEffect(() => {
    if (data?.step4) {
      setFormData({
        shopify_frontend_url: data.step4.shopify_frontend_url || ''
      })
      // Load scraped data if it exists
      if (data.step4.scrapedData) {
        setScrapedData(data.step4.scrapedData)
        setShowScrapedData(false) // Don't show the confirmation UI if already confirmed
        setIsDataConfirmed(true)
      }
    }
  }, [data])

  // Handle input change
  const handleInputChange = (value) => {
    const newFormData = { ...formData, shopify_frontend_url: value }
    setFormData(newFormData)
    
    // Clear errors
    if (errors.shopify_frontend_url) {
      setErrors(prev => ({ ...prev, shopify_frontend_url: null }))
    }
    
    // Clear validation result and scraped data when URL changes
    if (validationResult) {
      setValidationResult(null)
    }
    if (scrapedData) {
      setScrapedData(null)
      setShowScrapedData(false)
      setIsDataConfirmed(false)
    }
    
    onUpdate(4, newFormData)
  }

  // Validate URL format
  const validateUrlFormat = (url) => {
    if (!url) return true // Allow empty
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.hostname.includes('myshopify.com') || 
             urlObj.hostname.includes('shopify.com') ||
             urlObj.hostname.includes('.com') ||
             urlObj.hostname.includes('.net') ||
             urlObj.hostname.includes('.org')
    } catch {
      return false
    }
  }

  // Handle URL scraping
  const handleUrlScraping = async () => {
    if (!formData.shopify_frontend_url) {
      setErrors(prev => ({ ...prev, shopify_frontend_url: 'Please enter a URL' }))
      return
    }

    if (!validateUrlFormat(formData.shopify_frontend_url)) {
      setErrors(prev => ({ ...prev, shopify_frontend_url: 'Please enter a valid website URL' }))
      return
    }

    setIsValidating(true)
    setValidationResult(null)
    setScrapedData(null)
    setShowScrapedData(false)

    try {
      // Call the scraper API endpoint
      const response = await axiosInstance.post('/api/agents/scrape-shopify/', {
        url: formData.shopify_frontend_url
      })

      if (response.data?.details?.data) {
        const scrapedResult = response.data.details.data
        
        setScrapedData(scrapedResult)
        setShowScrapedData(true)
        
        setValidationResult({
          success: true,
          message: 'Website scraped successfully! Review the information below.'
        })
      } else {
        throw new Error('No data received from scraper')
      }
    } catch (error) {
      console.error('Scraping error:', error)
      
      let errorMessage = 'Error scraping website. Please try again.'
      
      if (error.response?.data?.details?.message) {
        errorMessage = error.response.data.details.message
      } else if (error.response?.data?.details?.error) {
        errorMessage = error.response.data.details.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setValidationResult({
        success: false,
        message: errorMessage
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Handle confirmation of scraped data
  const handleConfirmScrapedData = () => {
    setIsConfirming(true)
    
    // Save scraped data to local storage and update parent
    const updatedData = {
      ...formData,
      scrapedData: scrapedData,
      scrape_instructions: scrapedData?.summary || scrapedData?.data?.summary || ''
    }
    
    // Save to localStorage
    localStorage.setItem('agent_step4_scraped_data', JSON.stringify(updatedData))
    
    // Update parent component
    onUpdate(4, updatedData)
    
    setIsConfirming(false)
    setShowScrapedData(false)
    setIsDataConfirmed(true)
  }

  // Handle rejection of scraped data
  const handleRejectScrapedData = () => {
    setScrapedData(null)
    setShowScrapedData(false)
    setValidationResult(null)
    setIsDataConfirmed(false)
  }

  // Format URL for display
  const formatUrl = (url) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `https://${url}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiGlobeLine className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Website</h3>
        <p className="text-gray-600">
          Enter your website URL and let your salesperson learn about your business automatically. This will help them provide better assistance to customers.
        </p>
      </div>

      <div className="space-y-6">
        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <RiInformationLine className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Why connect your website?</h4>
              <p className="text-sm text-blue-800">
                When you connect your website, your salesperson will automatically learn about your business, products, policies, and company information. This helps them provide more accurate and helpful responses to customer questions. Think of it as giving your salesperson a comprehensive tour of your business!
              </p>
            </div>
          </div>
        </div>

        {/* URL Input Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Your Website URL</h4>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="website-url" className="block text-sm font-medium text-gray-700">
                Enter your website address
              </label>
              <div className="group relative">
                <RiInformationLine className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  Enter your main website URL (e.g., https://yourstore.com or https://yourstore.myshopify.com)
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  id="website-url"
                  type="text"
                  value={formData.shopify_frontend_url}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="e.g., https://yourstore.com or https://yourstore.myshopify.com"
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.shopify_frontend_url ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                />
                {errors.shopify_frontend_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopify_frontend_url}</p>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleUrlScraping}
                disabled={isValidating || !formData.shopify_frontend_url}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Learning from website...</span>
                    <p className="text-xs text-white">This may take a few minutes</p>
                  </>
                ) : (
                  <>
                    <RiFileTextLine className="w-4 h-4" />
                    <span>Learn from website</span>
                  </>
                )}
              </button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className={`mt-3 p-3 rounded-lg border ${
                validationResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {validationResult.success ? (
                    <RiCheckLine className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <RiErrorWarningLine className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`text-sm ${
                    validationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.message}
                  </span>
                </div>
              </div>
            )}

            {/* Scraped Data Display */}
            {showScrapedData && scrapedData && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <RiFileTextLine className="w-5 h-5 text-blue-600" />
                    Website Information Found
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {/* Summary */}
                  {(scrapedData.summary || scrapedData.data?.summary) && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Summary:</h5>
                      <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                        {scrapedData.summary || scrapedData.data?.summary}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional data if available */}
                  {scrapedData.data && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Additional Information:</h5>
                      <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(scrapedData.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleConfirmScrapedData}
                    disabled={isConfirming}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isConfirming ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <RiThumbUpLine className="w-4 h-4" />
                        <span>Yes, use this information</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleRejectScrapedData}
                    disabled={isConfirming}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <RiThumbDownLine className="w-4 h-4" />
                    <span>No, try again</span>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Click "Yes" to save this information for your salesperson, or "No" to try scraping again.
                </p>
              </div>
            )}

            {/* Success Indicator */}
            {isDataConfirmed && scrapedData && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <RiCheckLine className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Website information saved successfully! Your salesperson will use this data to help customers.
                  </span>
                </div>
              </div>
            )}

            {/* URL Preview */}
            {formData.shopify_frontend_url && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RiGlobeLine className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {formatUrl(formData.shopify_frontend_url)}
                    </span>
                  </div>
                  <a
                    href={formatUrl(formData.shopify_frontend_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <RiExternalLinkLine className="w-3 h-3" />
                    Visit
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">What happens when you connect your website?</h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-medium">1</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 text-sm">Website Analysis</h5>
                <p className="text-sm text-gray-600">Your salesperson will read and learn from your website content</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-medium">2</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 text-sm">Knowledge Building</h5>
                <p className="text-sm text-gray-600">They'll learn about your products, policies, and company information</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-medium">3</span>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 text-sm">Better Customer Service</h5>
                <p className="text-sm text-gray-600">They can provide more accurate and helpful responses to customer questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Connection Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Website connection is optional</h4>
          <p className="text-sm text-gray-600">
            You can skip this step and connect your website later. Your salesperson will still be able to help customers, but they won't have access to your specific business information. You can always add this information later from your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AgentStep4 