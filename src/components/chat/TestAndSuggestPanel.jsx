import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import ComprehensiveChatModal from './ComprehensiveChatModal'
import { useInstructionsStore } from '../../store/instructions/instructionsStore'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { createHtmlContent } from '../../utils/htmlRenderer';


const formatProductMessage = (message) => {
  try {
    // Check if message contains product information (numbered list with prices)
    const productPattern = /(\d+\.\s+\*\*[^*]+\*\*.*?)(?=\d+\.\s+\*\*|\n\n|$)/gs
    
    if (productPattern.test(message)) {
      // Split message into parts
      const parts = message.split(/(\d+\.\s+\*\*[^*]+\*\*.*?)(?=\d+\.\s+\*\*|\n\n|$)/gs)
      
      return parts.map((part, index) => {
        if (part.match(/^\d+\.\s+\*\*[^*]+\*\*/)) {
          // This is a product line - format it nicely
          const productName = part.match(/\*\*([^*]+)\*\*/)?.[1] || ''
          
          // Extract current price (after the dash) - more flexible pattern
          const currentPriceMatch = part.match(/\*\*[^*]+\*\*\s*[-–]\s*([^(]+)/)
          const priceInfo = currentPriceMatch ? currentPriceMatch[1].trim() : ''
          
          // Extract original price (inside parentheses after "was") - more flexible pattern
          const originalPriceMatch = part.match(/\(was\s+([^)]+)\)/)
          const originalPrice = originalPriceMatch ? originalPriceMatch[1].trim() : ''
          
          // Extract stock info if available
          const stockInfo = part.match(/We have (\d+) available/)?.[1] || part.match(/(\d+) in stock/)?.[1] || ''
          
          // Only render product card if we have a product name
          if (productName) {
            return (
              <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-3 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {productName}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    #{part.match(/^(\d+)\./)?.[1] || ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {priceInfo && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {priceInfo}
                      </span>
                    )}
                    {originalPrice && (
                      <span className="text-gray-400 line-through">
                        {originalPrice}
                      </span>
                    )}
                  </div>
                  {stockInfo && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {stockInfo} in stock
                    </span>
                  )}
                </div>
              </div>
            )
          } else {
            // If no product name found, return as regular text
            return <span key={index}>{part}</span>
          }
        } else if (part.trim()) {
          // Regular text
          return <span key={index}>{part}</span>
        }
        return null
      }).filter(Boolean) // Remove null values
    }
    
    // If no product pattern, return regular message
    return message
  } catch (error) {
    console.error('Error formatting product message:', error)
    // Fallback to regular message if formatting fails
    return message
  }
}


function truncateText(text, maxLength = 500) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + ' ....' : text;
}

export default function TestAndSuggestPanel({ agent, store, onClose }) {
  const suggest = useInstructionsStore((s) => s.suggest)
  const { messages, conversationId, customerId } = useSelector((s) => s.comprehensiveChat)
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const lastBotIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender !== 'user') return i
    }
    return -1
  }, [messages])
  

  const schema = z.object({ instruction: z.string().min(3, 'Please provide a meaningful instruction') })
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { instruction: '' }
  })

  const onSubmit = async (values) => {
    if (lastBotIndex < 0) {
      toast.error('No bot response to suggest on yet')
      return
    }
    try {
      setIsSaving(true)
      const botMsg = messages[lastBotIndex]
      let prevUserMsg = null
      for (let i = lastBotIndex - 1; i >= 0; i--) {
        if (messages[i].sender === 'user') { prevUserMsg = messages[i]; break }
      }
      const item = {
        user_message: prevUserMsg?.message || prevUserMsg?.content || '',
        ai_response: botMsg?.message || botMsg?.content || '',
        instruction: values.instruction,
        conversation_id: conversationId,
        customer_id: customerId
      }
      await suggest(agent.id, [item])
      reset()
      toast.success('Suggestion saved')
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    } catch (e) {
      // error handled globally by interceptor, but we show a fallback
      toast.error('Failed to save suggestion')
    }
    finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[80vh] mx-4 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold dark:text-white">Test and Suggest</h3>
          <button className="text-gray-500" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          <div className="h-full overflow-hidden border rounded">
            <ComprehensiveChatModal
              isOpen={true}
              onClose={() => {}}
              agent={agent}
              store={store}
              embed={true}
              showInlineSuggest={false}
            />
          </div>
          <div className="h-full overflow-auto border rounded p-0 md:p-3">
            <div className="mb-3 px-3 pt-3 text-sm text-gray-700 dark:text-gray-300">
              Provide an improvement for the most recent AI reply.
              {lastBotIndex >= 0 ? (
                <span className="ml-1 text-gray-500">Targeting reply #{lastBotIndex + 1}.</span>
              ) : (
                <span className="ml-1 text-gray-500">No AI reply yet.</span>
              )}
            </div>

            {lastBotIndex >= 0 ? (<div className="mb-3 text-sm px-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">AI Reply</p>
                {justSaved && (
                  <span className="text-green-700 dark:text-green-400 text-xs">Saved</span>
                )}
              </div>
              {lastBotIndex >= 0 &&
                messages[lastBotIndex]?.message !== "Cannot read properties of undefined (reading 'code')" ? (
                  <div
                    className="mt-2 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: formatProductMessage(truncateText(messages[lastBotIndex]?.message)),
                    }}
                  />
                ) : (
                  <p className="mt-2 text-gray-500"></p>
              )}
            </div>):(<div></div>)}
            {/* <div className="mb-2 text-sm">
              <p className="font-medium dark:text-white">Give suggestion for this message</p>
              {lastBotIndex >= 0 ? (
                <div className="mt-1 p-2 rounded border bg-gray-50 dark:bg-gray-800 dark:text-white whitespace-pre-wrap"
                  dangerouslySetInnerHTML={
                    createHtmlContent(messages[lastBotIndex]?.message || messages[lastBotIndex]?.content || '')}/>
              ) : (
                <p className="mt-1 text-gray-500"></p>
              )}
            </div> */}
            {lastBotIndex >= 0 &&
                messages[lastBotIndex]?.message !== "Cannot read properties of undefined (reading 'code')" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="px-3 pb-3">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Your suggestion</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded p-3 h-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain how the AI response should be improved for the recent message."
                  {...register('instruction')}
                  disabled={isSaving}
                />
                {errors.instruction && (
                  <p className="text-red-600 text-sm mt-1">{errors.instruction.message}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white rounded"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60"
                    disabled={isSaving}
                    aria-busy={isSaving}
                  >
                    {isSaving && (
                      <span className="mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {isSaving ? 'Saving...' : 'Save Suggestion'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="px-3 pb-3 text-sm text-gray-500">Send a test message in the chat to get a reply to suggest improvements on.</div>
            )}
            {/* // <form onSubmit={handleSubmit(onSubmit)}>
            //   <textarea
            //     className="w-full border rounded p-2 h-40 bg-transparent dark:text-white"
            //     placeholder="Explain how the AI response should be improved for the recent message."
            //     {...register('instruction')}
            //   />
            //   {errors.instruction && (
            //     <p className="text-red-600 text-sm mt-1">{errors.instruction.message}</p>
            //   )}
            //   <div className="flex justify-end mt-3">
            //     <button
            //       type="submit"
            //       className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            //     >
            //       Save Suggestion
            //     </button>
            //   </div>
            //   <div className="flex justify-end mt-3">
            //     <button
            //       type="button"
            //       className="px-16 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded"
            //       onClick={onClose}
            //     >
            //       Close
            //     </button>
            //   </div>
            // </form> */}
          </div>
        </div>
      </div>
    </div>
  )
}


