import { useState, useEffect, useRef } from 'react'
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'

const PasswordValidationModal = ({ password, isVisible, onClose }) => {
  const modalRef = useRef(null)
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasUppercase: false,
    hasLowercase: false
  })

  useEffect(() => {
    if (password) {
      setRequirements({
        minLength: password.length >= 8,
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password)
      })
    } else {
      setRequirements({
        minLength: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasUppercase: false,
        hasLowercase: false
      })
    }
  }, [password])

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both modal versions
      const desktopModal = document.querySelector('.password-modal-desktop')
      const mobileModal = document.querySelector('.password-modal-mobile')
      
      if (desktopModal && !desktopModal.contains(event.target) && 
          mobileModal && !mobileModal.contains(event.target)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const requirementList = [
    {
      key: 'minLength',
      label: 'At least 8 characters',
      met: requirements.minLength
    },
    {
      key: 'hasNumber',
      label: 'Contains a number',
      met: requirements.hasNumber
    },
    {
      key: 'hasSpecialChar',
      label: 'Contains a special character',
      met: requirements.hasSpecialChar
    },
    {
      key: 'hasUppercase',
      label: 'Contains an uppercase letter',
      met: requirements.hasUppercase
    },
    {
      key: 'hasLowercase',
      label: 'Contains a lowercase letter',
      met: requirements.hasLowercase
    }
  ]

  const allRequirementsMet = Object.values(requirements).every(req => req)
  const metRequirementsCount = Object.values(requirements).filter(req => req).length
  const totalRequirements = Object.keys(requirements).length
  const progressPercentage = (metRequirementsCount / totalRequirements) * 100

  const renderModalContent = () => (
    <>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-900">Password Requirements</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoCloseCircle className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Strength</span>
          <span>{metRequirementsCount}/{totalRequirements}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              progressPercentage <= 20 ? 'bg-red-500' :
              progressPercentage <= 40 ? 'bg-orange-500' :
              progressPercentage <= 60 ? 'bg-yellow-500' :
              progressPercentage <= 80 ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        {requirementList.map((requirement) => (
          <div key={requirement.key} className="flex items-center space-x-2">
            {requirement.met ? (
              <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" data-testid="checkmark-circle" />
            ) : (
              <IoCloseCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" data-testid="close-circle" />
            )}
            <span className={`text-xs ${requirement.met ? 'text-green-700' : 'text-gray-600'}`}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
      
      {allRequirementsMet && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium text-green-700">
              All requirements met!
            </span>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop version - right side */}
      <div className="absolute top-0 left-full ml-2 z-50 lg:block hidden">
        <div 
          ref={modalRef} 
          className="password-modal-desktop bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 animate-in fade-in-0 slide-in-from-left-2 duration-200 relative"
        >
          {/* Arrow pointing to password field */}
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-200"></div>
          <div className="absolute -left-1 top-4 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
          
          {renderModalContent()}
        </div>
      </div>
      
      {/* Mobile version - below password field */}
      <div className="absolute top-full left-0 right-0 mt-2 z-50 lg:hidden block">
        <div 
          ref={modalRef} 
          className="password-modal-mobile bg-white border border-gray-200 rounded-lg shadow-lg p-3 animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          {renderModalContent()}
        </div>
      </div>
    </>
  )
}

export default PasswordValidationModal
