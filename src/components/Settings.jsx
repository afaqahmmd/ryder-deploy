import { useState } from 'react'
import { MdSettings, MdDarkMode, MdLightMode, MdBrightness6, MdDelete } from 'react-icons/md'
import { useTheme } from '../contexts/ThemeContext'
import DeleteAccountModal from './DeleteAccountModal'

const Settings = ({ showOnboarding, setShowOnboarding }) => {
  const { theme, changeTheme, isDark } = useTheme()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const themeOptions = [
    { value: 'light', label: 'Light', icon: MdLightMode },
    { value: 'dark', label: 'Dark', icon: MdDarkMode },
    { value: 'auto', label: 'Auto', icon: MdBrightness6 }
  ]

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your account and application preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Show Tutorial
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <MdSettings className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
          </div>
          
          <div className="space-y-8">
            {/* Theme Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Application Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.value
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`
                        flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 mr-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {theme === 'auto' && 'Automatically switches between light and dark based on your system preference'}
                {theme === 'light' && 'Always use light mode'}
                {theme === 'dark' && 'Always use dark mode'}
              </p>
            </div>

            {/* Delete Account Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Delete Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <MdDelete className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteAccountModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  )
}

export default Settings 