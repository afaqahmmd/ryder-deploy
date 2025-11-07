import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiCalendar,
  FiClock,
  FiEye,
  FiX,
  FiSend,
  FiArrowLeft,
} from "react-icons/fi";
import { RiRobot2Fill } from "react-icons/ri";
import {
  fetchConversations,
  fetchConversationMessages,
  fetchConversationByCustomerId,
} from "../../store/conversations/conversationsThunk";
import {
  clearConversationError,
  clearCurrentConversation,
  clearMessages,
} from "../../store/conversations/conversationsSlice";

const ConversationsTab = () => {
  const dispatch = useDispatch();
  const {
    conversations,
    currentConversation,
    currentMessages,
    isLoading,
    isLoadingMessages,
    error,
    pagination,
    messagesPagination,
  } = useSelector((state) => state.conversations);

  const { agents } = useSelector((state) => state.agents);
  const { stores } = useSelector((state) => state.stores);

  // State for WhatsApp-like layout
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesPage, setMessagesPage] = useState(1);

  // Disable overall page scrolling when component mounts
  useEffect(() => {
    // Store original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Disable scrolling
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // Load conversations on mount
  useEffect(() => {
    dispatch(fetchConversations({ page: 1 }));
  }, [dispatch]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearConversationError());
    };
  }, [dispatch]);

  // Handle conversation selection
  const handleConversationClick = async (conversationId) => {
    setSelectedConversationId(conversationId);
    setMessagesPage(1);
    dispatch(clearMessages());

    try {
      await dispatch(
        fetchConversationMessages({
          conversationId,
          page: 1,
          pageSize: 50,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
    }
  };

  // Handle back to conversations list
  const handleBackToList = () => {
    setSelectedConversationId(null);
    dispatch(clearCurrentConversation());
    dispatch(clearMessages());
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.customer_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.customer_id
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Get selected conversation details
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get agent name by ID
  const getAgentName = (agentId) => {
    console.log("--------------------------------");
    console.log(agentId);
    console.log("--------------------------------");
    console.log(agents);
    console.log("--------------------------------");
    console.log(agents.find((a) => a.id === agentId));
    const agent = agents.find((a) => a.id === agentId);
    console.log(agent);
    return agent?.name || "Unknown Agent";
  };

  // Get store name by ID
  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store?.store_name || "Unknown Store";
  };

  // Format message content with markdown support for bot messages
  const formatMessageContent = (content, isCustomerMessage) => {
    if (isCustomerMessage) {
      // For customer messages, just escape HTML and preserve line breaks
      return content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\n/g, "<br>");
    }

    let formattedContent = content
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic text: *text* -> <em>text</em>
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Headers: ### text -> <h3>text</h3>
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-base font-semibold mb-3 mt-4 first:mt-0 text-gray-800 dark:text-gray-200">$1</h3>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-lg font-semibold mb-3 mt-4 first:mt-0 text-gray-800 dark:text-gray-200">$1</h2>'
      )
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-xl font-semibold mb-3 mt-4 first:mt-0 text-gray-800 dark:text-gray-200">$1</h1>'
      )
      // Lists: - item -> <li>item</li>
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      // Wrap consecutive list items in <ul>
      .replace(
        /(<li.*<\/li>)/gs,
        '<ul class="list-disc space-y-1 mb-3 ml-4">$1</ul>'
      )
      // Line breaks
      .replace(/\n/g, "<br>")
      // Escape remaining HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      // Restore our formatted elements
      .replace(/&lt;strong.*?&gt;/g, '<strong class="font-semibold">')
      .replace(/&lt;\/strong&gt;/g, "</strong>")
      .replace(/&lt;em.*?&gt;/g, '<em class="italic">')
      .replace(/&lt;\/em&gt;/g, "</em>")
      .replace(
        /&lt;h1.*?&gt;/g,
        '<h1 class="text-xl font-semibold mb-3 mt-4 first:mt-0 text-gray-800 dark:text-gray-200">'
      )
      .replace(
        /&lt;h2.*?&gt;/g,
        '<h2 class="text-lg font-semibold mb-3 mt-4 first:mt-0 text-gray-800 dark:text-gray-200">'
      )
      .replace(
        /&lt;h3.*?&gt;/g,
        '<h3 class="text-base font-semibold mb-3 mt-4 first:mt-0 text-gray-800 dark:text-gray-200">'
      )
      .replace(/&lt;\/h[1-3]&gt;/g, "</h3>")
      .replace(/&lt;ul.*?&gt;/g, '<ul class="list-disc space-y-1 mb-3 ml-4">')
      .replace(/&lt;\/ul&gt;/g, "</ul>")
      .replace(/&lt;li.*?&gt;/g, '<li class="ml-4 mb-1">')
      .replace(/&lt;\/li&gt;/g, "</li>")
      .replace(/&lt;br&gt;/g, "<br>");

    // Markdown images ![alt](url) -> <img>
    formattedContent = formattedContent.replace(
      /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md border border-gray-200 dark:border-gray-600 shadow-sm" />'
    );

    // Markdown links [text](url) -> styled anchor
    formattedContent = formattedContent.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" class="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Auto-embed plain image URLs first (wrap image with a link)
    formattedContent = formattedContent.replace(
      /(?<![\">])(https?:\/\/[^\s<]+\.(?:png|jpe?g|gif|webp|svg))/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"><img src="$1" alt="Image" class="max-w-full h-auto rounded-md border border-gray-200 dark:border-gray-600 shadow-sm" /></a>'
    );

    // Auto-link plain URLs
    formattedContent = formattedContent.replace(
      /(?<![\">])(https?:\/\/[^\s<]+)/g,
      '<a href="$1" class="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Ensure existing anchors get classes and attributes
    formattedContent = formattedContent
      .replace(
        /<a\s+(?![^>]*class=)/g,
        '<a class="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors" '
      )
      .replace(
        /<a([^>]*)(?<!target=["']?_blank["']?)([^>]*)>/g,
        '<a$1 target="_blank"$2>'
      )
      .replace(
        /<a([^>]*)(?<!rel=["']?noopener noreferrer["']?)([^>]*)>/g,
        '<a$1 rel="noopener noreferrer"$2>'
      );

    // Restore escaped <img> tags just in case they were escaped earlier
    formattedContent = formattedContent.replace(/&lt;img(.*?)&gt;/g, "<img$1>");

    return formattedContent;
  };

  return (
    <div className="h-full flex flex-col">
      {/* WhatsApp-like Layout */}
      <div className="flex h-full max-h-[1080px] bg-gray-50 dark:bg-gray-900">
        {/* Conversations List - Left Side - Static */}
        <div
          className={`${
            selectedConversationId ? "hidden md:block" : "block"
          } w-full md:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col sticky top-0 h-[calc(100vh-2rem)] `}
        >
          {/* Header - Fixed */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Conversations
            </h1>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Conversations List - Scrollable */}
          <div
            className="flex-1 h-full border-sm overflow-y-scroll"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgb(209 213 219) transparent",
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                <FiMessageSquare className="w-12 h-12 mb-2" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="flex flex-col max-h-[500px] overflow-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-700 ">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation.id)}
                      className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedConversationId === conversation.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {conversation.customer_name || "Unknown Customer"}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestamp(conversation.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Customer ID: {conversation.customer_id}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {conversation.agent_name}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              •
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {conversation.store_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Detail - Right Side - Scrollable */}
        <div
          className={`${
            selectedConversationId ? "block" : "hidden md:block"
          } flex-1 flex flex-col bg-white dark:bg-gray-800 h-[calc(100vh-2rem)] overflow-hidden`}
        >
          {selectedConversationId && selectedConversation ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.customer_name || "Unknown Customer"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customer ID: {selectedConversation.customer_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {/* {getAgentName(selectedConversation.agent_id)} */}
                      {selectedConversation.agent_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {/* {getStoreName(selectedConversation.store_id)} */}
                      {selectedConversation.store_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area - Scrollable */}
             <div
  className="flex-1 overflow-y-auto p-4"
  style={{
    scrollbarWidth: "thin",
    scrollbarColor: "rgb(209 213 219) transparent",
  }}
>
  {isLoadingMessages ? (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ) : currentMessages.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
      <FiMessageSquare className="w-12 h-12 mb-2" />
      <p>No messages in this conversation</p>
    </div>
  ) : (
    currentMessages
      // ✅ Skip the first customer message
      .filter((message, index, arr) => {
        const firstCustomerIndex = arr.findIndex(
          (m) => m.sender === "customer"
        );
        return index !== firstCustomerIndex;
      })
      .map((message, index) => (
        <div
          key={message.id || index}
          className={`flex ${
            message.sender === "customer" ? "justify-end" : "justify-start"
          } mb-4`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
              message.sender === "customer"
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
            }`}
          >
            <div
              className="text-sm whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatMessageContent(
                  message.content,
                  message.sender === "customer"
                ),
              }}
            />
            <p
              className={`text-xs mt-2 opacity-75 ${
                message.sender === "customer"
                  ? "text-blue-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formatTimestamp(message.timestamp)}
            </p>
          </div>
        </div>
      ))
  )}
</div>


              {/* Message Input (Read-only for now) - Fixed */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This is a read-only view of the conversation
                    </p>
                  </div>
                  <button
                    disabled
                    className="p-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Default state when no conversation is selected - Full height layout
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FiMessageSquare className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Select a conversation
                </h3>
                <p>Choose a conversation from the list to view the chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => dispatch(clearConversationError())}
              className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsTab;
