import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
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
} from "../../store/conversations/conversationsThunk";
import {
  clearConversationError,
  clearCurrentConversation,
  clearMessages,
  resetConversations,
} from "../../store/conversations/conversationsSlice";

const ConversationsTab = () => {
  // Calculate default date range (last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dispatch = useDispatch();
  const {
    conversations,
    currentMessages,
    isLoading,
    isLoadingMessages,
    error,
    pagination,
  } = useSelector((state) => state.conversations);

  // const { agents } = useSelector((state) => state.agents);
  // const { stores } = useSelector((state) => state.stores);

  // State for WhatsApp-like layout
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states with default date range (last 7 days)
  const [filters, setFilters] = useState({
    startDate: formatDate(sevenDaysAgo),
    endDate: formatDate(today),
    hasEngagement: false,
    hasCartCreation: false,
    hasOrderComplete: false,
    hasCheckout: false,
  });

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
    dispatch(fetchConversations({ 
      ...filters,
      page: 1,
      page_size: 10
    }));
  }, [dispatch, filters]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearConversationError());
    };
  }, [dispatch]);

  // Handle conversation selection
  const handleConversationClick = async (conversationId) => {
    setSelectedConversationId(conversationId);
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

  // Handle filter changes with cascading logic
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        [filterName]: value,
      };

      // Cascading logic: if a filter is checked, all higher-tier filters must be checked
      if (value) {
        if (filterName === "hasCartCreation") {
          updatedFilters.hasEngagement = true;
        } else if (filterName === "hasCheckout") {
          updatedFilters.hasEngagement = true;
          updatedFilters.hasCartCreation = true;
        } else if (filterName === "hasOrderComplete") {
          updatedFilters.hasEngagement = true;
          updatedFilters.hasCartCreation = true;
          updatedFilters.hasCheckout = true;
        }
      }

      return updatedFilters;
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      hasEngagement: false,
      hasCartCreation: false,
      hasOrderComplete: false,
      hasCheckout: false,
    });
    setShowFilters(false);
  };

  // Handle load more conversations
  const handleLoadMore = () => {
    const nextPage = (pagination?.current_page || 1) + 1;
    dispatch(fetchConversations({
      ...filters,
      page: nextPage,
      page_size: 10
    }));
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
  // const getAgentName = (agentId) => {
  //   console.log("--------------------------------");
  //   console.log(agentId);
  //   console.log("--------------------------------");
  //   console.log(agents);
  //   console.log("--------------------------------");
  //   console.log(agents.find((a) => a.id === agentId));
  //   const agent = agents.find((a) => a.id === agentId);
  //   console.log(agent);
  //   return agent?.name || "Unknown Agent";
  // };

  // // Get store name by ID
  // const getStoreName = (storeId) => {
  //   const store = stores.find((s) => s.id === storeId);
  //   return store?.store_name || "Unknown Store";
  // };

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

    // For bot messages, apply markdown formatting
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

          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
            >
              <FiFilter className="w-5 h-5" />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>

            {/* Filters Section - Collapsible */}
            {showFilters && (
              <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                {/* Date Range Filters */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block uppercase tracking-wide">
                    📅 Date Range
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Start date"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="End date"
                      />
                    </div>
                  </div>
                </div>

                {/* Conversation Status Filters */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block uppercase tracking-wide">
                    🎯 Conversation Status
                  </label>
                  <div className="bg-white dark:bg-gray-600/50 p-3 rounded-lg grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasEngagement"
                        checked={filters.hasEngagement}
                        onChange={(e) => handleFilterChange("hasEngagement", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="hasEngagement" className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                        Has Engagement
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasCartCreation"
                        checked={filters.hasCartCreation}
                        onChange={(e) => handleFilterChange("hasCartCreation", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="hasCartCreation" className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                        Has Cart Creation
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasCheckout"
                        checked={filters.hasCheckout}
                        onChange={(e) => handleFilterChange("hasCheckout", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="hasCheckout" className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                        Has Checkout
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasOrderComplete"
                        checked={filters.hasOrderComplete}
                        onChange={(e) => handleFilterChange("hasOrderComplete", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="hasOrderComplete" className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                        Order Complete
                      </label>
                    </div>
                  </div>
                </div>

                {/* Reset Filters Button */}
                <button
                  onClick={handleResetFilters}
                  className="w-full px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  ↺ Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Conversations List - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading && conversations.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                <FiMessageSquare className="w-12 h-12 mb-2" />
                <p>No conversations found</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                          <div className="flex items-center space-x-2 mt-1 mb-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {conversation.agent_name}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {conversation.store_name}
                            </span>
                          </div>
                          {conversation.tags && conversation.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {conversation.tags.map((tag, index) => {
                                const tagColors = {
                                  'engaged': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
                                  'cart created': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
                                  'checkout created': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
                                  'ordered': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700'
                                };
                                const colorClass = tagColors[tag.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600';
                                return (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass} transition-all duration-200`}
                                  >
                                    {tag}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination?.has_next && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <FiChevronDown className="w-4 h-4" />
                          Load More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
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
                  currentMessages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex ${
                        message.sender === "customer"
                          ? "justify-end"
                          : "justify-start"
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