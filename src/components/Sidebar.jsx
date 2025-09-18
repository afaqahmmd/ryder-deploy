import { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  MdDashboard, 
  MdStore, 
  MdSettings, 
  MdLogout,
  MdMenu,
  MdClose,
  MdDarkMode,
  MdLightMode
} from 'react-icons/md'
import { FiShoppingBag, FiBarChart2, FiMessageSquare } from 'react-icons/fi'
import { RiRobot2Fill } from 'react-icons/ri'
import { useTheme } from '../contexts/ThemeContext'

const Sidebar = ({ activeMainTab, setActiveMainTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  
  // Get user data from Redux store
  const { user } = useSelector(state => state.login)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: MdDashboard
    },
    {
      id: 'stores',
      label: 'Stores',
      icon: MdStore
    },
    {
      id: 'products',
      label: 'Products',
      icon: FiShoppingBag
    },
    {
      id: 'knowledge-base',
      label: 'Product Database',
      icon: FiBarChart2
    },
    {
      id: 'agents',
      label: 'AI Salespeople',
      icon: RiRobot2Fill
    },
    {
      id: 'conversations',
      label: 'Conversations',
      icon: FiMessageSquare
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: MdSettings
    }
  ]

  const handleTabClick = (tabId) => {
    setActiveMainTab(tabId)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    onLogout()
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <MdClose className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <MdMenu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out shadow-xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 flex-shrink-0">
              <RiRobot2Fill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {user?.username || 'Ryder Partners'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email ? `${user.email}` : 'AI Chatbot Platform'}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeMainTab === item.id
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabClick(item.id)}
                      className={`
                        w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors
                        ${isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            >
              {isDark ? (
                <MdLightMode className="w-5 h-5 mr-3" />
              ) : (
                <MdDarkMode className="w-5 h-5 mr-3" />
              )}
              <span className="font-medium">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-colors"
            >
              <MdLogout className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar 