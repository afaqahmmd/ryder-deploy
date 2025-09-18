import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  RiStoreLine,
  RiInformationLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiRefreshLine,
  RiAddLine,
  RiLink
} from 'react-icons/ri'
import { fetchStores } from '../../../store/stores/storesThunk'

const AgentStep2 = ({ data, onUpdate }) => {
  const dispatch = useDispatch()
  const { stores, isLoading: isLoadingStores, error: storesError } = useSelector(state => state.stores)
  
  const [selectedStore, setSelectedStore] = useState(null)
  const [formData, setFormData] = useState({ store: null })

  // Load stores on mount
  useEffect(() => {
    if (stores.length === 0) {
      dispatch(fetchStores())
    }
  }, [dispatch, stores.length])

  // Load data from cache
  useEffect(() => {
    if (data?.step2) {
      const storeId = data.step2.store
      setFormData({ store: storeId })
      
      // Find and set selected store
      if (storeId && stores.length > 0) {
        const store = stores.find(s => s.id === storeId)
        setSelectedStore(store || null)
      }
    }
  }, [data, stores])

  // Handle store selection
  const handleStoreSelect = (store) => {
    setSelectedStore(store)
    const newFormData = { store: store.id }
    setFormData(newFormData)
    onUpdate(2, newFormData)
  }

  // Handle refresh stores
  const handleRefreshStores = () => {
    dispatch(fetchStores())
  }

  // Get store status color
  const getStoreStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  console.log("storesssss:",stores)


  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiStoreLine className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Salesperson to Your Store</h3>
        <p className="text-gray-600">
          Choose which store your salesperson will work with. They'll have access to all your products and can help customers find exactly what they're looking for.
        </p>
      </div>

      <div className="space-y-6">
        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <RiInformationLine className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Why connect a store?</h4>
              <p className="text-sm text-blue-800">
                When you connect a store, your salesperson can see all your products, prices, and inventory. This helps them make better recommendations and answer customer questions accurately. Think of it like giving your salesperson access to your product catalog!
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {storesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <RiErrorWarningLine className="w-5 h-5 text-red-600 mr-2" />
              <div className="text-red-600 text-sm">{storesError}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingStores ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your stores...</p>
          </div>
        ) : stores.length === 0 ? (
          /* No Stores */
          <div className="text-center py-8">
            <RiStoreLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No stores found</h4>
            <p className="text-gray-600 mb-6">
              You haven't connected any stores yet. Connect a store to give your salesperson access to your products.
            </p>
            <button
              onClick={() => window.open('/dashboard?tab=stores', '_blank')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RiAddLine className="w-4 h-4 mr-2" />
              Connect Your First Store
            </button>
          </div>
        ) : (
          /* Store Selection */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Select a Store</h4>
              <button
                onClick={handleRefreshStores}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <RiRefreshLine className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>

            <div className="grid gap-4">
              {stores.map((store) => {
                const isSelected = selectedStore?.id === store.id
                return (
                  <div
                    key={store.id}
                    onClick={() => handleStoreSelect(store)}
                    className={`
                      relative border rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <RiCheckLine className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-4">
                      {/* Store Icon */}
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <RiStoreLine className="w-6 h-6 text-purple-600" />
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-900 truncate">{store.store_name || 'No name'}</h5>
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                            ${getStoreStatusColor(store.status)}
                          `}>
                            {store.status || 'Unknown'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {store.domain || store.shopify_domain || 'No domain'}
                        </p>

                        {/* Store Stats */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{store.product_count || 0} products</span>
                          <span>•</span>
                          <span>Connected {store.created_at ? new Date(store.created_at).toLocaleDateString() : 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pro Tip for selected store */}
                    {isSelected && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">💡 Great choice!</span> Your salesperson will now have access to all {store.product_count || 0} products from {store.name}. They can help customers find products, check prices, and make recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add New Store Option
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <RiAddLine className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h5 className="font-medium text-gray-900 mb-1">Need to connect another store?</h5>
              <p className="text-sm text-gray-600 mb-3">
                Add a new store to give your salesperson access to more products
              </p>
              <button
                onClick={() => window.open('/dashboard?tab=stores', '_blank')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RiLink className="w-4 h-4 mr-2" />
                Connect New Store
              </button>
            </div> */}
          </div>
        )}

        
      </div>
    </div>
  )
}

export default AgentStep2 