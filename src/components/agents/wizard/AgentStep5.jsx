import { useState, useEffect } from 'react'
import { 
  RiGlobalLine,
  RiAddLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiExternalLinkLine,
  RiCompasses2Line
} from 'react-icons/ri'

const AgentStep5 = ({ data, onUpdate }) => {
  const [websites, setWebsites] = useState([
    { url: '', description: '', is_competitor: false }
  ])
  const [errors, setErrors] = useState({})

  // Load data from cache
  useEffect(() => {
    if (data?.step5?.external_websites) {
      const cachedWebsites = data.step5.external_websites
      if (cachedWebsites.length > 0) {
        setWebsites(cachedWebsites)
      }
    }
  }, [data])

  // Update parent with current websites
  const updateParent = (newWebsites) => {
    onUpdate(5, { external_websites: newWebsites })
  }

  // Handle website field change
  const handleWebsiteChange = (index, field, value) => {
    const newWebsites = websites.map((website, i) => 
      i === index ? { ...website, [field]: value } : website
    )
    setWebsites(newWebsites)
    
    // Clear errors for this website
    if (errors[index]) {
      setErrors(prev => ({ ...prev, [index]: { ...prev[index], [field]: null } }))
    }
    
    updateParent(newWebsites)
  }

  // Validate URL
  const validateUrl = (url) => {
    if (!url.trim()) return null
    
    if (!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://')) {
      return 'URL must start with http:// or https://'
    }
    
    try {
      new URL(url)
      return null
    } catch {
      return 'Please enter a valid website address'
    }
  }

  // Handle URL blur for validation
  const handleUrlBlur = (index, url) => {
    const error = validateUrl(url)
    if (error) {
      setErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], url: error }
      }))
    }
  }

  // Add new website
  const addWebsite = () => {
    if (websites.length < 3) {
      const newWebsites = [...websites, { url: '', description: '', is_competitor: false }]
      setWebsites(newWebsites)
      updateParent(newWebsites)
    }
  }

  // Remove website
  const removeWebsite = (index) => {
    const newWebsites = websites.filter((_, i) => i !== index)
    const finalWebsites = newWebsites.length > 0 ? newWebsites : [{ url: '', description: '', is_competitor: false }]
    setWebsites(finalWebsites)
    
    // Clear errors for removed website
    const newErrors = { ...errors }
    delete newErrors[index]
    // Shift error indices
    const shiftedErrors = {}
    Object.keys(newErrors).forEach(key => {
      const numKey = parseInt(key)
      if (numKey > index) {
        shiftedErrors[numKey - 1] = newErrors[key]
      } else {
        shiftedErrors[key] = newErrors[key]
      }
    })
    setErrors(shiftedErrors)
    
    updateParent(finalWebsites)
  }

  // Skip this step (clear all websites)
  const skipStep = () => {
    setWebsites([{ url: '', description: '', is_competitor: false }])
    setErrors({})
    onUpdate(5, { external_websites: [] })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiGlobalLine className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Add External Resources</h3>
        <p className="text-gray-600">
          Add competitor websites or industry resources to help your salesperson understand your market better.
        </p>
      </div>

      <div className="space-y-6">
        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <RiInformationLine className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Why add external resources?</h4>
              <p className="text-sm text-blue-800">
                Adding competitor websites or industry resources helps your salesperson understand your market, competitive landscape, and industry trends. This enables them to provide more informed responses and better position your products against competitors.
              </p>
            </div>
          </div>
        </div>

        {/* Websites List */}
        <div className="space-y-4">
          {websites.map((website, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Resource {index + 1}
                </h4>
                {websites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWebsite(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove resource"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* URL Input */}
              <div>
                <label htmlFor={`url-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Website Address
                </label>
                <div className="relative">
                  <input
                    id={`url-${index}`}
                    type="url"
                    value={website.url}
                    onChange={(e) => handleWebsiteChange(index, 'url', e.target.value)}
                    onBlur={(e) => handleUrlBlur(index, e.target.value)}
                    placeholder="e.g., https://competitor.com or https://industry-resource.com"
                    className={`
                      w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${errors[index]?.url ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                    `}
                  />
                  <RiExternalLinkLine className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                {errors[index]?.url && (
                  <p className="mt-1 text-sm text-red-600">{errors[index].url}</p>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  What is this resource? (Optional)
                </label>
                <input
                  id={`description-${index}`}
                  type="text"
                  value={website.description}
                  onChange={(e) => handleWebsiteChange(index, 'description', e.target.value)}
                  placeholder="e.g., Main competitor, Industry resource, Reference site"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Competitor Toggle */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={website.is_competitor}
                    onChange={(e) => handleWebsiteChange(index, 'is_competitor', e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <RiCompasses2Line className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">This is a competitor</span>
                  </div>
                </label>
                <p className="ml-7 text-xs text-gray-500 mt-1">
                  Check this if the website belongs to a direct competitor
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Website Button */}
        {websites.length < 3 && (
          <button
            type="button"
            onClick={addWebsite}
            className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <RiAddLine className="w-5 h-5" />
            <span>Add Another Resource</span>
          </button>
        )}

        {/* Website Limit Info */}
        {websites.length >= 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              You've reached the maximum of 3 external resources. Remove one to add another.
            </p>
          </div>
        )}


        {/* Summary */}
        {websites.some(w => w.url.trim()) && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h5 className="font-medium text-indigo-900 mb-2">Added Resources Summary:</h5>
            <div className="space-y-2">
              {websites.filter(w => w.url.trim()).map((website, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <RiExternalLinkLine className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-800">
                      {website.url}
                      {website.description && ` - ${website.description}`}
                    </span>
                  </div>
                  {website.is_competitor && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Competitor
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Information */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start">
            <RiInformationLine className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-indigo-800">
              <p className="font-medium mb-1">Benefits of adding external resources:</p>
              <ul className="list-disc list-inside space-y-1 text-indigo-700">
                <li>Help your salesperson understand your competitive landscape</li>
                <li>Provide context about industry standards and practices</li>
                <li>Enable your salesperson to make informed comparisons when asked</li>
                <li>Reference sites can provide additional knowledge sources</li>
                <li>Competitor analysis helps position your products better</li>
              </ul>
              <p className="mt-2 text-xs text-indigo-600">
                Note: This step is completely optional. You can create a fully functional salesperson without external resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentStep5
