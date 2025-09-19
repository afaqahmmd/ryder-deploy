import { useState, useEffect, useRef, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import {
  RiRobot2Fill,
  RiCloseLine,
  RiSendPlaneLine,
  RiRefreshLine,
  RiUserLine,
} from "react-icons/ri";
import {
  startNewConversation,
  continueConversation,
} from "../../store/agents/comprehensiveChatThunk";
import {
  clearChatError,
  addMessage,
  clearMessages,
  setCustomerId,
  setConversationId,
  resetChat,
  setCurrentAgent,
  setCurrentStore,
  setIsBotResponding,
} from "../../store/agents/comprehensiveChatSlice";
import SuggestInstructionModal from "../instructions/SuggestInstructionModal";
import { useInstructionsStore } from "../../store/instructions/instructionsStore";
import { handleApiError } from "../../services/api";
import { toast } from "react-toastify";
import { useWebSocketChat } from "../../hooks/sockets/useWebSocketChat";

const ComprehensiveChatModal = ({
  isOpen,
  onClose,
  agent,
  store = null,
  embed = false,
  showInlineSuggest = true,
}) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  // Chat state from Redux
  const {
    messages,
    customerId,
    conversationId,
    isChatting,
    isStartingConversation,
    isContinuingConversation,
    chatError,
    isBotResponding
  } = useSelector((state) => state.comprehensiveChat);

  // Local state
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [targetBotIndex, setTargetBotIndex] = useState(null);
  const [isSavingSuggestion, setIsSavingSuggestion] = useState(false);
  const suggest = useInstructionsStore((s) => s.suggest);

  // WebSocket integration
  const {
    sendMessage: sendWebSocketMessage,
    connectWebSocket,
    disconnect: disconnectWebSocket,
    isConnected,
  } = useWebSocketChat(agent, store, customerId);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when modal opens
  useEffect(() => {
    if (isOpen && agent && !initializedRef.current) {
      initializedRef.current = true;

      dispatch(setCurrentAgent(agent));
      if (store) {
        dispatch(setCurrentStore(store));
      }

      // Clear previous chat state
      dispatch(clearMessages());
      dispatch(setCustomerId(null));
      dispatch(setConversationId(null));

      // Connect WebSocket
      connectWebSocket();
    }
  }, [isOpen, agent, store, connectWebSocket, dispatch]);

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      disconnectWebSocket();
    }
  }, [isOpen, disconnectWebSocket]);

  // Enhanced send message function with WebSocket integration
  const sendMessage = async (userMessage) => {
    if (!agent || !store) {
      console.error("Agent or store not available");
      return;
    }

    try {
      // Try WebSocket first if connected
      if (isConnected) {
        console.log("Sending message via WebSocket");

        const isNewConvo = messages.length === 0;
        dispatch(setIsBotResponding(true));
        const sent = sendWebSocketMessage(userMessage, isNewConvo);
        if (sent) {
          // WebSocket message sent successfully, typing indicator will be handled by WebSocket response
          return;
        }
      }

      // Fallback to HTTP API
      // console.log("Sending message via HTTP API (WebSocket not available)");
      // let response;

      // if (!customerId) {
      //   response = await dispatch(
      //     startNewConversation({
      //       message: userMessage,
      //       agentId: agent.id,
      //       storeId: store.id,
      //       newConvo: true,
      //     })
      //   ).unwrap();
      // } else {
      //   response = await dispatch(
      //     continueConversation({
      //       message: userMessage,
      //       agentId: agent.id,
      //       storeId: store.id,
      //       customerId: customerId,
      //     })
      //   ).unwrap();
      // }

      // Add bot response for HTTP API
      // const botResponse = {
      //   id: Date.now(),
      //   sender: "bot",
      //   message: response.response,
      //   timestamp: new Date().toLocaleTimeString(),
      // };
      // dispatch(addMessage(botResponse));
    } catch (error) {
      console.error("Chat Error:", error);
      dispatch(setIsBotResponding(false));
      let errorMessage =
        "Sorry, I'm having trouble responding right now. Please try again.";

      if (error.message && error.message.includes("1000 characters")) {
        errorMessage =
          "Message is too long. Please keep it under 1000 characters.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      const errorResponse = {
        id: Date.now(),
        sender: "bot",
        message: errorMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      dispatch(addMessage(errorResponse));
    }
  };

  // Handle sending user message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim() || !agent) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      message: userInput.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };
    // Add user message
    dispatch(addMessage(userMessage));
    const currentUserInput = userInput.trim();
    setUserInput("");
    // Send to API/WebSocket
    sendMessage(currentUserInput);
  };

  // Handle modal close
  const handleClose = () => {
    dispatch(resetChat());
    setUserInput("");
    setIsTyping(false);

    initializedRef.current = false;
    disconnectWebSocket();
    onClose();
  };

  // Handle refresh chat
  const handleRefreshChat = () => {
    dispatch(resetChat());
    setUserInput("");
    setIsTyping(false);
    initializedRef.current = false;
    disconnectWebSocket();
    // Reconnect WebSocket after a short delay
    setTimeout(() => {
      connectWebSocket();
    }, 100);
  };

  // Build instruction item from messages (keeping your existing function)
  const buildInstructionItem = (
    allMessages,
    botIndex,
    instructionText,
    convId,
    custId
  ) => {
    const botMsg = allMessages[botIndex];
    let prevUserMsg = null;
    for (let i = botIndex - 1; i >= 0; i--) {
      if (allMessages[i].sender === "user") {
        prevUserMsg = allMessages[i];
        break;
      }
    }
    return {
      user_message: prevUserMsg?.message || prevUserMsg?.content || "",
      ai_response: botMsg?.message || botMsg?.content || "",
      instruction: instructionText,
      conversation_id: convId,
      customer_id: custId,
    };
  };

  // const openSuggest = (botIndex) => {
  //   setTargetBotIndex(botIndex);
  //   setIsSuggestOpen(true);
  // };

  const closeSuggest = () => {
    setIsSuggestOpen(false);
    setTargetBotIndex(null);
  };

  const handleSubmitSuggestion = async (instructionText) => {
    try {
      setIsSavingSuggestion(true);
      const item = buildInstructionItem(
        messages,
        targetBotIndex,
        instructionText,
        conversationId,
        customerId
      );
      await suggest(agent.id, [item]);
      closeSuggest();
    } catch (e) {
      toast.error(handleApiError(e));
    } finally {
      setIsSavingSuggestion(false);
    }
  };

  if (!agent) return null;
  if (!embed && !isOpen) return null;

  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <RiRobot2Fill className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Connecting...
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshChat}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title="Start New Conversation"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {message.sender === "bot" ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.message}</p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-200"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isBotResponding ? (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-lg max-w-xs">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {agent.name} is typing...
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            disabled={
              !isConnected ||
              isTyping ||
              isChatting ||
              isStartingConversation ||
              isContinuingConversation
            }
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={
              !userInput.trim() ||
              isTyping ||
              isChatting ||
              isStartingConversation ||
              isContinuingConversation
            }
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiSendPlaneLine className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {isConnected ? (
            <span>🟢 Real-time chat</span>
          ) : (
            <span>🔴 Connection in progress</span>
          )}
        </p>
      </div>

      {/* Error Display */}
      {chatError && (
        <div className="p-4 border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400 text-sm">
              {chatError}
            </div>
            <button
              onClick={() => dispatch(clearChatError())}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (embed) {
    return content;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {content}
      </div>
      {showInlineSuggest && (
        <SuggestInstructionModal
          isOpen={isSuggestOpen}
          onClose={closeSuggest}
          onSubmit={handleSubmitSuggestion}
          submitting={isSavingSuggestion}
        />
      )}
    </>
  );
};

export default ComprehensiveChatModal;
