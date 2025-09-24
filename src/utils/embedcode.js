export const getEmbedCode = (agent) => {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shopify Chatbot</title>
    <script src="https://cdn.tailwindcss.com" async></script>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
        background: transparent;
      }
      .bred {
        border: 1px solid red;
      }
      .animate-bounce {
        animation: bounce 1s infinite;
      }

      @keyframes bounce {
        0%,
        20%,
        53%,
        80%,
        100% {
          animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
          transform: translate3d(0, 0, 0);
        }
        40%,
        43% {
          animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          transform: translate3d(0, -8px, 0);
        }
        70% {
          animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          transform: translate3d(0, -4px, 0);
        }
        90% {
          transform: translate3d(0, -1px, 0);
        }
      }
    </style>
  </head>
  <body>
    <div id="chatbot-container">
      <!-- Floating Chat Icon -->
      <div class="fixed bottom-6 right-6 z-50">
        <button
          id="chat-toggle"
          class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <svg id="chat-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <svg
            id="close-icon"
            class="w-6 h-6 hidden"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Chat Window -->
      <div
        id="chat-window"
        class="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex-col hidden"
      >
        <!-- Header -->
        <div class="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              🤖
            </div>
            <div>
              <h3 id="agent-name" class="font-semibold text-sm">Shopify Assistant</h3>
              <p class="text-xs text-blue-100">Online now</p>
            </div>
          </div>
          <button id="close-chat" class="text-blue-100 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-3 h-64">
          <!-- Messages will be populated by JavaScript -->
        </div>

        <!-- Input -->
        <div class="border-t border-gray-200 p-3">
          <div class="flex space-x-2">
            <input
              type="text"
              id="message-input"
              placeholder="Type your message..."
              class="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              id="send-button"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full p-2 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <script>
      /*
        1. WebSocket connection to backend server
        2. State management for chat (open/close, messages, typing indicator)
        3. DOM manipulation for rendering messages and chat window
        4. Event handling for user interactions
      */
      const socket = new WebSocket("https://ryder-partner.cortechsocial.com/ws/chat/");
      const payload = {
        agent_id: ${agent.id},
        store_id: ${agent.store},
        customer_id: null,
        new_convo: true,
        include_timestamp: true,
      };

      // Fetch active agent for the store
      const fetchActiveAgent = async () => {
        try {
          const response = await fetch(
            \`https://ryder-partner.cortechsocial.com/api/agents/public/active-agent/?store_id=\${payload.store_id}\`
          );
          const data = await response.json();
          console.log("Active agent response:", data);
          if (data && data.details && data.details.data && data.details.data.id) {
              payload.agent_id = data.details.data.id;
          }
          // Update agent name if available in response
          if (data && data.details && data.details.data && data.details.data.name) {
              const agentNameElement = document.getElementById("agent-name");
              if (agentNameElement) {
                  agentNameElement.textContent = data.details.data.name;
              }
          }

          return data;
        } catch (error) {
          console.error("Error fetching active agent:", error);
        }
      };
      socket.onopen = () => {
          console.log("✅ Connected to server");
      };

      socket.onmessage = (event) => {
          hideTyping();

          try {
              const data = JSON.parse(event.data);
              console.log("data", data);
              if (data.customer_id) {
                  payload.customer_id = data.customer_id;
                  payload.new_convo = false;
              }
              if (data.type === "connection_established") {
                  addMessage(data.message, "bot");
              } else if (data.response) {
                  addMessage(data.response, "bot");
              } else if (data.error) {
                  addMessage("Error: " + data.error, "bot");
              } else {
                  addMessage(event.data, "bot");
              }
          } catch (e) {
              // If message isn't JSON, just show raw text
              addMessage(event.data, "bot");
          }

          renderMessages();
      };

      socket.onclose = () => {
          console.log("❌ Disconnected from server");
          addMessage("Disconnected from server.", "bot");
          renderMessages();
      };

      socket.onerror = (error) => {
          console.error("⚠️ WebSocket Error:", error);
          addMessage("Connection error occurred.", "bot");
          renderMessages();
      };

      // State management
      let chatState = {
          isOpen: false,
          isTyping: false,
          messages: [
              {
                  id: 1,
                  text: "Hello! 👋 Welcome to our Shopify store! How can I help you today?",
                  sender: "bot",
                  timestamp: new Date(Date.now() - 5000),
              },
          ],
      };

      // DOM element getters
      const getDOMElements = () => ({
          chatToggle: document.getElementById("chat-toggle"),
          closeChat: document.getElementById("close-chat"),
          sendButton: document.getElementById("send-button"),
          messageInput: document.getElementById("message-input"),
          chatWindow: document.getElementById("chat-window"),
          chatIcon: document.getElementById("chat-icon"),
          closeIcon: document.getElementById("close-icon"),
          messagesContainer: document.getElementById("messages-container"),
      });

      // Utility functions
      const formatTime = (timestamp) => {
          return timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          });
      };

      // UX to scroll chat to bottom automatically on message arrival
      const scrollToBottom = () => {
          setTimeout(() => {
              const { messagesContainer } = getDOMElements();
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }, 100);
      };

      // Message management functions
      const addMessage = (text, sender) => {
          const message = {
              id: chatState.messages.length + 1,
              text,
              sender,
              timestamp: new Date(),
          };
          chatState.messages.push(message);
          return message;
      };

      const createMessageElement = (message) => {
          const messageDiv = document.createElement("div");
          messageDiv.className = \`flex 
              w-full  break-words overflow-auto
              
              \${message.sender === "user" ? "justify-end" : "justify-start"}\`;

          const bubbleClass =
              message.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none";

          const timeClass = message.sender === "user" ? "text-blue-100" : "text-gray-500";

          messageDiv.innerHTML = \`
            <div class="max-w-xs px-3 py-2 rounded-lg text-sm \${bubbleClass}">
              <p class="break-words whitespace-pre-line whitespace-pre-line">\${message.text}</p>
              <p class="text-xs mt-1 opacity-70 \${timeClass}">
                \${formatTime(message.timestamp)}
              </p>
            </div>
          \`;

          return messageDiv;
      };

      const renderMessages = () => {
          const { messagesContainer } = getDOMElements();
          messagesContainer.innerHTML = "";

          chatState.messages.forEach((message) => {
              const messageElement = createMessageElement(message);
              messagesContainer.appendChild(messageElement);
          });

          scrollToBottom();
      };

      // Typing indicator functions
      const showTyping = () => {
          chatState.isTyping = true;
          const { messagesContainer } = getDOMElements();
          const typingDiv = document.createElement("div");
          typingDiv.id = "typing-indicator";
          typingDiv.className = "flex justify-start";
          typingDiv.innerHTML = \`
            <div class="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 py-2 max-w-xs">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          \`;
          messagesContainer.appendChild(typingDiv);
          scrollToBottom();
      };

      const hideTyping = () => {
          chatState.isTyping = false;
          const typingIndicator = document.getElementById("typing-indicator");
          if (typingIndicator) {
              typingIndicator.remove();
          }
      };

      // Chat control functions
      const openChat = () => {
          chatState.isOpen = true;
          const { chatWindow, chatIcon, closeIcon } = getDOMElements();

          chatWindow.classList.remove("hidden");
          chatWindow.classList.add("flex");
          chatIcon.classList.add("hidden");
          closeIcon.classList.remove("hidden");
          scrollToBottom();
      };

      const closeChat = () => {
          chatState.isOpen = false;
          const { chatWindow, chatIcon, closeIcon } = getDOMElements();

          chatWindow.classList.add("hidden");
          chatWindow.classList.remove("flex");
          chatIcon.classList.remove("hidden");
          closeIcon.classList.add("hidden");
      };

      const toggleChat = () => {
          if (chatState.isOpen) {
              closeChat();
          } else {
              openChat();
          }
      };

      // Message sending function (now uses backend)
      const sendMessage = () => {
          const { messageInput } = getDOMElements();
          const message = messageInput.value.trim();

          if (message === "") return;

          // Add user message to UI
          addMessage(message, "user");
          renderMessages();
          messageInput.value = "";

          // Show typing indicator while waiting for backend
          showTyping();

          // Send to backend
          if (socket.readyState === WebSocket.OPEN) {
              const messageData = {
                  type: "comprehensive_chat",
                  message,
                  ...payload,
              };
              socket.send(JSON.stringify(messageData));
          } else {
              hideTyping();
              addMessage("⚠️ Cannot send message: not connected to server.", "bot");
              renderMessages();
          }
      };

      // Event binding function for DOM elements
      const bindEvents = () => {
          const { chatToggle, closeChat: closeChatBtn, sendButton, messageInput } = getDOMElements();

          chatToggle.addEventListener("click", toggleChat);
          closeChatBtn.addEventListener("click", closeChat);
          sendButton.addEventListener("click", sendMessage);
          messageInput.addEventListener("keypress", (e) => {
              if (e.key === "Enter") {
                  sendMessage();
              }
          });
      };

      // Initialize chatbot
      const initializeChatbot = () => {
          bindEvents();
          renderMessages();
          // Fetch active agent on initialization
          fetchActiveAgent();
      };

      // Initialize when page loads
      document.addEventListener("DOMContentLoaded", initializeChatbot);
    </script>
  </body>
</html>
    `;

  return html
} 