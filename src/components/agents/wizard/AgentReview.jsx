import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
// import { RiGlobeLine, RiCheckLine } from "react-icons/ri";
import { 
  RiCheckLine,
  RiRobot2Fill,
  RiFileTextLine,
  RiStoreLine,
  RiGlobalLine,
  RiEditLine,
  RiInformationLine,
  RiExternalLinkLine,
  RiFilePdfLine,
  RiFileTextFill,
  RiUserLine,
  RiMicLine,
  RiHeartLine,
  RiVolumeUpLine
} from 'react-icons/ri'

const AgentReview = ({ data, onComplete }) => {
  const { stores } = useSelector(state => state.stores)
  const [selectedStore, setSelectedStore] = useState(null)

  // Find the selected store
  useEffect(() => {
    if (data?.step2?.store && stores.length > 0) {
      const store = stores.find(s => s.id === data.step2.store)
      setSelectedStore(store)
    }
  }, [data, stores])

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    if (!fileName) return null
    const extension = fileName.split('.').pop().toLowerCase()
    switch (extension) {
      case 'pdf':
        return <RiFilePdfLine className="w-5 h-5 text-red-500" />
      case 'txt':
        return <RiFileTextFill className="w-5 h-5 text-blue-500" />
      default:
        return <RiFileTextLine className="w-5 h-5 text-gray-500" />
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get response tone label
  const getResponseToneLabel = (tone) => {
    const tones = {
      'professional': 'Professional',
      'friendly': 'Friendly',
      'casual': 'Casual',
      'formal': 'Formal',
      'enthusiastic': 'Enthusiastic',
      'calm': 'Calm',
      'authoritative': 'Authoritative',
      'empathetic': 'Empathetic',
      'playful': 'Playful',
      'serious': 'Serious'
    }
    return tones[tone] || tone
  }

  // Get gender label
  const getGenderLabel = (gender) => {
    if (!gender) return 'Not specified'
    return gender
  }

  // Get speaking style label
  const getSpeakingStyleLabel = (style) => {
    if (!style) return 'Not specified'
    return style
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading review data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiCheckLine className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Your Salesperson</h3>
        <p className="text-gray-600">
          Review your salesperson's configuration before creating and activating them.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Salesperson Personality */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <RiUserLine className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">Salesperson Personality</h4>
            </div>
            <div className="flex items-center text-green-600">
              <RiCheckLine className="w-4 h-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Salesperson Name</label>
              <p className="text-gray-900 font-medium">{data.step1?.name || 'Not specified'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Communication Style</label>
              <p className="text-gray-900 font-medium">
                {getResponseToneLabel(data.step1?.communication_style || data.step1?.tone)}
              </p>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
              <p className="text-gray-900 font-medium">
                {data.step1?.age ? `${data.step1.age} years old` : 'Not specified'}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
              <p className="text-gray-900 font-medium">
                {getGenderLabel(data.step1?.gender)}
              </p>
            </div>

            {/* Speaking Style */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Country of Origin</label>
              <p className="text-gray-900 font-medium">
                {getSpeakingStyleLabel(data.step1?.country || data.step1?.accent)}
              </p>
            </div>

                         {/* Personality Traits */}
             {data.step1?.selectedTraits && data.step1.selectedTraits.length > 0 && (
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-500 mb-1">Personality Traits</label>
                 <div className="flex flex-wrap gap-2">
                   {data.step1.selectedTraits.map((trait, index) => (
                     <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       {trait}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {/* Behavior Prompt */}
             {data.step1?.behavior_prompt && (
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-500 mb-1">Sales Behavior Guidelines</label>
                 <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                   <p className="text-gray-900 text-sm whitespace-pre-wrap">
                     {data.step1.behavior_prompt}
                   </p>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Step 2: Store Connection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <RiStoreLine className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">Store Connection</h4>
            </div>
            <div className="flex items-center text-green-600">
              <RiCheckLine className="w-4 h-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
          </div>

          {selectedStore ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Store Name</label>
                  <p className="text-gray-900 font-medium">
                    {selectedStore.store_name || selectedStore.name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Domain</label>
                  <p className="text-gray-900">
                    {selectedStore.domain || selectedStore.shop_domain}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${selectedStore.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {selectedStore.status || 'Unknown'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Store ID</label>
                  <p className="text-gray-900">#{selectedStore.id}</p>
                </div>

                {/* Product Count */}
                {selectedStore.product_count !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Products</label>
                    <p className="text-gray-900 font-medium">
                      {selectedStore.product_count.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Store Type */}
                {selectedStore.store_type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Store Type</label>
                    <p className="text-gray-900 capitalize">
                      {selectedStore.store_type.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No store selected</p>
          )}
        </div>

        {/* Step 3: Rules */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <RiFileTextLine className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">Rules</h4>
            </div>
            <div className="flex items-center text-green-600">
              <RiCheckLine className="w-4 h-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Rules Text */}
            {data.step3?.rules_text && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Rules & Guidelines</label>
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-gray-900 text-sm whitespace-pre-wrap">
                    {data.step3.rules_text}
                  </p>
                </div>
              </div>
            )}

            {!data.step3?.rules_text && (
              <p className="text-gray-500 italic">No rules provided</p>
            )}
          </div>
        </div>

        {/* Step 4: External Resources */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <RiGlobalLine className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">External Resources</h4>
            </div>
            <div className="flex items-center text-green-600">
              <RiCheckLine className="w-4 h-4 mr-1" />
              <span className="text-sm">Optional</span>
            </div>
          </div>

          {data.step5?.external_websites && data.step5.external_websites.length > 0 ? (
            <div className="space-y-3">
              {data.step5.external_websites.map((website, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RiExternalLinkLine className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-900 font-medium">{website.url}</p>
                        {website.description && (
                          <p className="text-gray-600 text-sm">{website.description}</p>
                        )}
                      </div>
                    </div>
                    {website.is_competitor && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Competitor
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No external resources added</p>
          )}
        </div>
        {/* Final Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 text-sm">
            🎉 <strong>Ready to go!</strong> Your salesperson "{data.step1?.name}" will be connected to "{selectedStore?.store_name || selectedStore?.name || 'No store'}" 
            {data.step5?.external_websites?.length > 0 && ` with ${data.step5.external_websites.length} external resource${data.step5.external_websites.length > 1 ? 's' : ''}`}.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AgentReview 