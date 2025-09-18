import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiRobot2Fill, RiPlayLine, RiRefreshLine } from 'react-icons/ri'
import ComprehensiveChatModal from './ComprehensiveChatModal'

const ChatDemo = () => {
  const dispatch = useDispatch()
  const { agents } = useSelector(state => state.agents)
  const { stores } = useSelector(state => state.stores)
  
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedStore, setSelectedStore] = useState(null)

  // Demo agent data
  const demoAgent = {
    id: 1,
    name: 'Demo Agent',
    status: 'active',
    behavior_prompt: 'I am a helpful demo agent that can assist with product inquiries and customer support.',
    tone: 'friendly'
  }

  // Demo store data
  const demoStore = {
    id: 1,
    store_name: 'Demo Store',
    domain: 'demo-store.myshopify.com',
    status: 'active'
  }

  const handleStartChat = () => {
    setSelectedAgent(demoAgent)
    setSelectedStore(demoStore)
    setShowChatModal(true)
  }

  const handleCloseChat = () => {
    setShowChatModal(false)
    setSelectedAgent(null)
    setSelectedStore(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiRobot2Fill className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced Chat Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Experience the improved chat interface with direct conversation start and better product formatting
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Direct Conversation
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Start chatting immediately</li>
            <li>• No unnecessary name asking</li>
            <li>• Simplified user experience</li>
            <li>• Better visual feedback</li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Enhanced Product Display
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Structured product cards with pricing</li>
            <li>• Clear price comparisons and discounts</li>
            <li>• Stock information display</li>
            <li>• Better readability and organization</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          New Features
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong className="text-blue-800 dark:text-blue-200">Direct Start</strong>
            <p className="text-blue-700 dark:text-blue-300">Start chatting immediately without name collection</p>
          </div>
          <div>
            <strong className="text-blue-800 dark:text-blue-200">Product Formatting</strong>
            <p className="text-blue-700 dark:text-blue-300">Automatic formatting of product lists with pricing</p>
          </div>
          <div>
            <strong className="text-blue-800 dark:text-blue-200">Visual Improvements</strong>
            <p className="text-blue-700 dark:text-blue-300">Better UI/UX with improved readability</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleStartChat}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RiPlayLine className="w-5 h-5" />
          <span>Try Enhanced Chat</span>
        </button>
        
        <button
          onClick={() => window.open('/FRONTEND_INTEGRATION_GUIDE.md', '_blank')}
          className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RiRefreshLine className="w-5 h-5" />
          <span>View Documentation</span>
        </button>
      </div>

      {/* Feature Showcase */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What's New
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Direct Conversation Start</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Users can start chatting immediately without any name collection step. The conversation flows naturally from the first message.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Product Message Formatting</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Product lists are automatically formatted into clean, structured cards showing prices, discounts, and stock information.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Improved User Experience</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Better visual feedback, smoother transitions, and more intuitive interaction patterns.
            </p>
          </div>
        </div>
      </div>

      {/* API Examples */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          API Examples
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Start New Conversation</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`POST /api/comprehensive-chat/
{
  "message": "Hello, I need help",
  "agent_id": 1,
  "store_id": 1,
  "new_convo": true
}`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Continue Conversation</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`POST /api/comprehensive-chat/
{
  "message": "Tell me more about products",
  "agent_id": 1,
  "store_id": 1,
  "customer_id": "customer_abc12345"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Comprehensive Chat Modal */}
      {showChatModal && selectedAgent && selectedStore && (
        <ComprehensiveChatModal
          isOpen={showChatModal}
          onClose={handleCloseChat}
          agent={selectedAgent}
          store={selectedStore}
        />
      )}
    </div>
  )
}

export default ChatDemo 