import { useState, useEffect } from 'react'
import { 
  RiFileTextLine,
  RiInformationLine,
  RiCheckLine,
  RiAddLine
} from 'react-icons/ri'
import './AgentStep3.css'

const AgentStep3 = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    rules_text: ''
  })
  const [errors, setErrors] = useState({})
  const [inputMethod, setInputMethod] = useState('') // 'quick-picks' or 'custom'

  // Predefined rule templates
  const ruleTemplates = [
    {
      title: "Customer Service Rules",
      rules: [
        "Always greet customers warmly and professionally",
        "Listen carefully to customer needs and ask clarifying questions",
        "Never make up information - if you don't know something, say so",
        "Always be honest about product availability and pricing",
        "End conversations by asking if there's anything else you can help with"
      ]
    },
    {
      title: "Sales Guidelines",
      rules: [
        "Focus on helping customers find the right product for their needs",
        "Highlight product benefits that match customer requirements",
        "Be honest about product limitations or drawbacks",
        "Don't pressure customers into making purchases",
        "Suggest complementary products when appropriate"
      ]
    },
    {
      title: "Communication Rules",
      rules: [
        "Use clear, simple language that customers can understand",
        "Avoid technical jargon unless the customer uses it first",
        "Be patient and understanding with all customers",
        "Respond promptly to customer questions",
        "Maintain a consistent, professional tone throughout conversations"
      ]
    },
    {
      title: "Problem Resolution",
      rules: [
        "Take ownership of customer problems and see them through to resolution",
        "Apologize sincerely when mistakes are made",
        "Offer solutions, not just explanations",
        "Follow up to ensure customer satisfaction",
        "Escalate complex issues to human support when necessary"
      ]
    }
  ]

  // Load data from cache
  useEffect(() => {
    if (data?.step3) {
      setFormData({
        rules_text: data.step3.rules_text || data.step3.instructions_text || ''
      })
      // Set input method based on whether rules exist
      if (data.step3.rules_text || data.step3.instructions_text) {
        setInputMethod('custom')
      }
    }
  }, [data])

  // Handle text input change
  const handleTextChange = (value) => {
    const newFormData = { ...formData, rules_text: value }
    setFormData(newFormData)
    
    // Clear text errors
    if (errors.rules_text) {
      setErrors(prev => ({ ...prev, rules_text: null }))
    }
    
    onUpdate(3, newFormData)
  }

  // Apply a rule template
  const applyRuleTemplate = (template) => {
    const existingRules = formData.rules_text
    const newRules = template.rules.join('\n')
    
    // If there are existing rules, add a separator
    const combinedRules = existingRules 
      ? `${existingRules}\n\n${template.title}:\n${newRules}`
      : `${template.title}:\n${newRules}`
    
    handleTextChange(combinedRules)
  }

  // Add a single rule
  const addSingleRule = (rule) => {
    const existingRules = formData.rules_text
    const newRules = existingRules 
      ? `${existingRules}\n• ${rule}`
      : `• ${rule}`
    
    handleTextChange(newRules)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiFileTextLine className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Rules for Your Salesperson</h3>
        <p className="text-gray-600">
          Define the rules and guidelines your salesperson should follow when helping customers. This helps ensure consistent, high-quality service.
        </p>
      </div>

      <div className="space-y-6">
        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <RiInformationLine className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Why set rules?</h4>
              <p className="text-sm text-blue-800">
                Rules help your salesperson provide consistent, high-quality service. They ensure your salesperson follows your company policies, handles situations appropriately, and represents your brand correctly. Think of it as giving your salesperson a handbook to follow!
              </p>
            </div>
          </div>
        </div>

        {/* Input Method Selection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">How would you like to set rules?</h4>
          <p className="text-sm text-gray-600 mb-4">
            Choose how you want to define rules for your salesperson:
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setInputMethod('quick-picks')}
              className={`p-6 border-2 rounded-lg text-left transition-colors ${
                inputMethod === 'quick-picks'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <RiCheckLine className="w-4 h-4 text-blue-600" />
                </div>
                <h5 className="font-medium text-gray-900">Quick Picks</h5>
              </div>
              <p className="text-sm text-gray-600">
                Choose from pre-made rule templates designed for different scenarios. Perfect if you want to get started quickly with proven guidelines.
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setInputMethod('custom')}
              className={`p-6 border-2 rounded-lg text-left transition-colors ${
                inputMethod === 'custom'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <RiFileTextLine className="w-4 h-4 text-green-600" />
                </div>
                <h5 className="font-medium text-gray-900">Write Your Own</h5>
              </div>
              <p className="text-sm text-gray-600">
                Write custom rules tailored specifically to your business needs and company policies. Best for unique requirements.
              </p>
            </button>
          </div>
        </div>

        {/* Quick Picks Rules - Only show if selected */}
        {inputMethod === 'quick-picks' && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Rule Templates</h4>
            <p className="text-sm text-gray-600 mb-4">
              Choose from these common rule sets to get started quickly:
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {ruleTemplates.map((template) => (
                <div
                  key={template.title}
                  className="rule-template-container"
                >
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h5 className="font-medium text-gray-900 mb-3">{template.title}</h5>
                    <ul className="space-y-2 mb-4">
                      {template.rules.slice(0, 3).map((rule, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rule}
                        </li>
                      ))}
                      {template.rules.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{template.rules.length - 3} more rules...
                        </li>
                      )}
                    </ul>
                    <button
                      type="button"
                      onClick={() => applyRuleTemplate(template)}
                      className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add These Rules
                    </button>
                  </div>
                  
                  {/* Preview Tooltip */}
                  <div className="rule-template-tooltip">
                    <div className="font-medium mb-2">Complete Rules:</div>
                    <div className="space-y-2">
                      {template.rules.map((rule, index) => (
                        <div key={index} className="text-sm">
                          • {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Rules Input - Only show if selected */}
        {inputMethod === 'custom' && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Your Custom Rules</h4>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="rules-text" className="block text-sm font-medium text-gray-700">
                Write your own rules and guidelines
              </label>
              <div className="group relative">
                <RiInformationLine className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  Write specific rules your salesperson should follow
                </div>
              </div>
            </div>
            
            <textarea
              id="rules-text"
              value={formData.rules_text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              placeholder={`Write your custom rules here. For example:

• Always greet customers with a warm welcome
• Ask clarifying questions when customer needs are unclear
• Provide accurate product information and pricing
• Be honest about product limitations
• Escalate complex issues to human support
• Follow up to ensure customer satisfaction

You can use bullet points, numbered lists, or paragraphs. Be specific about how your salesperson should behave in different situations.`}
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                ${errors.rules_text ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
            />
            {errors.rules_text && (
              <p className="mt-1 text-sm text-red-600">{errors.rules_text}</p>
            )}
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-400">
                {formData.rules_text.length} characters
              </span>
              {formData.rules_text.length > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ Rules saved
                </span>
              )}
            </div>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">💡 Pro Tip:</span> Be specific about how your salesperson should handle different situations. Include your company policies, communication guidelines, and any specific procedures they should follow.
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Optional Rules Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Rules are optional but recommended</h4>
          <p className="text-sm text-gray-600">
            While you can skip setting rules, they help ensure your salesperson provides consistent, high-quality service that matches your brand and company policies. You can always add or modify rules later from your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AgentStep3 