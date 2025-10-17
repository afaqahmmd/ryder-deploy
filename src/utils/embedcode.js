export const getEmbedCode = (agent) => {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shopify Chatbot</title>

    <!-- Tailwind & Marked -->
    <script src="https://cdn.tailwindcss.com" async></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
        background: transparent;
      }
      .bred { border: 1px solid red; }
      .animate-bounce { animation: bounce 1s infinite; }
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
          transform: translate3d(0, 0, 0);
        }
        40%, 43% {
          animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          transform: translate3d(0, -8px, 0);
        }
        70% {
          animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          transform: translate3d(0, -4px, 0);
        }
        90% { transform: translate3d(0, -1px, 0); }
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Chat Window -->
      <div id="chat-window"
        class="fixed bottom-24 right-6 w-96 h-[28rem] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex-col hidden">
        <div class="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">🤖</div>
            <div>
              <h3 id="agent-name" class="font-semibold text-sm">Shopify Assistant</h3>
              <p class="text-xs text-blue-100">Online now</p>
            </div>
          </div>
          <button id="close-chat" class="text-blue-100 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-3 h-80"></div>

        <div class="border-t border-gray-200 p-3">
          <div class="flex space-x-2">
            <input type="text" id="message-input" placeholder="Type your message..."
              class="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
            <button id="send-button"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full p-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <script>
      const payload = {
        type: "comprehensive_chat",
        agent_id: ${agent.id},
        store_id: ${agent.store},
        new_convo: true,
        include_timestamp: true,
      };

      let trackingData = {
        chatbot_customer_id: null,
        chatbot_agent_id: payload.agent_id,
        chatbot_store_id: payload.store_id,
        cart_token: null,
        session_start: new Date().toISOString(),
      };

      let socket;

      const fetchActiveAgent = async () => {
        try {
          const response = await fetch(
            \`https://ryder-partner.cortechsocial.com/api/agents/public/active-agent/?store_id=\${payload.store_id}\`
          );
          const data = await response.json();
          if (data?.details?.data?.id) {
            payload.agent_id = data.details.data.id;
            trackingData.chatbot_agent_id = data.details.data.id;
          }
          if (data?.details?.data?.name) {
            const agentNameElement = document.getElementById("agent-name");
            if (agentNameElement) agentNameElement.textContent = data.details.data.name;
          }
          return data;
        } catch (error) {
          console.error("Error fetching active agent:", error);
        }
      };

      const monitorCart = async () => {
        try {
          const response = await fetch("/cart.js");
          const cart = await response.json();
          if (cart.token && cart.token !== trackingData.cart_token) {
            trackingData.cart_token = cart.token;
            console.log("Cart token captured:", cart.token);
          }
        } catch (error) {
          console.error("Error monitoring cart:", error);
        }
      };

      const sendToWebhook = async (cartData) => {
        try {
          const webhookUrl = "https://ryder-partner.cortechsocial.com/api/core/track/event/";
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cartData),
          });
          if (response.ok) console.log("✅ Cart data sent to webhook successfully");
          else console.error("❌ Error sending cart data:", response.statusText);
        } catch (error) {
          console.error("❌ Error sending to webhook:", error);
        }
      };

      const updateCartNoteIfNeeded = async (customerId) => {
        try {
          const cartResponse = await fetch("/cart.js");
          const currentCart = await cartResponse.json();
          let currentNoteData = {};
          if (currentCart.note) {
            try { currentNoteData = JSON.parse(currentCart.note); }
            catch { currentNoteData = {}; }
          }

          if (!currentNoteData.Chatbot_Session || currentNoteData.Chatbot_Session !== customerId) {
            const newNoteData = {
              ...currentNoteData,
              Chatbot_Session: customerId,
              agent_id: payload.agent_id,
              store_id: payload.store_id,
            };
            const sessionNote = JSON.stringify(newNoteData);
            const updateResponse = await fetch("/cart/update.js", {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ note: sessionNote }),
            });

            if (updateResponse.ok) {
              const updatedCart = await updateResponse.json();
              console.log("✅ Cart note updated with customer ID:", customerId);
              trackingData.cart_token = updatedCart.token;
              await sendToWebhook(updatedCart);
            } else console.error("❌ Error updating cart note");
          } else {
            console.log("✅ Cart note already contains correct session info, skipping");
            trackingData.cart_token = currentCart.token;
          }
        } catch (error) {
          console.error("❌ Error updating cart note:", error);
        }
      };

      let chatState = { isOpen: false, isTyping: false, messages: [] };

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

      const formatTime = (timestamp) =>
        timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const scrollToBottom = () => {
        setTimeout(() => {
          const { messagesContainer } = getDOMElements();
          if (messagesContainer)
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      };

      const addMessage = (text, sender) => {
        const message = { id: chatState.messages.length + 1, text, sender, timestamp: new Date() };
        chatState.messages.push(message);
        return message;
      };

      const createMessageElement = (message) => {
        const messageDiv = document.createElement("div");
        messageDiv.className = \`flex w-full break-words overflow-auto \${message.sender === "user" ? "justify-end" : "justify-start"}\`;

        const bubbleClass = message.sender === "user"
          ? "bg-blue-600 text-white rounded-br-none"
          : "bg-gray-100 text-gray-800 rounded-bl-none";

        const timeClass = message.sender === "user" ? "text-blue-100" : "text-gray-500";

        let content = message.text;
        if (message.sender === "bot" && typeof marked !== "undefined") {
          try {
            marked.setOptions({ breaks: true, gfm: true });
            content = marked.parse(message.text);
          } catch { content = message.text; }
        }

        messageDiv.innerHTML = \`
          <div class="max-w-sm px-3 py-2 rounded-lg text-sm \${bubbleClass}">
            <div class="\${message.sender === "bot" ? "markdown-content" : "whitespace-pre-line"}">\${content}</div>
            <p class="text-xs mt-1 opacity-70 \${timeClass}">
              \${formatTime(message.timestamp)}
            </p>
          </div>\`;
        return messageDiv;
      };

      const renderMessages = () => {
        const { messagesContainer } = getDOMElements();
        if (messagesContainer) {
          messagesContainer.innerHTML = "";
          chatState.messages.forEach((m) => messagesContainer.appendChild(createMessageElement(m)));
          scrollToBottom();
        }
      };

      const showTyping = () => {
      chatState.isTyping = true;
      const { messagesContainer, messageInput, sendButton } = getDOMElements();

      // Disable input and send button
      if (messageInput) messageInput.disabled = true;
      if (sendButton) sendButton.disabled = true;

      if (messagesContainer) {
        const typingDiv = document.createElement("div");
        typingDiv.id = "typing-indicator";
        typingDiv.className = "flex justify-start";
        typingDiv.innerHTML =
          '<div class="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 py-2 max-w-sm">' +
          '  <div class="flex space-x-1">' +
          '    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>' +
          '    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>' +
          '    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>' +
          '  </div>' +
          '</div>';
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
      }
    };

      const hideTyping = () => {
        chatState.isTyping = false;
        const { messageInput, sendButton } = getDOMElements();

        // Re-enable input and send button
        if (messageInput) {
          messageInput.disabled = false;
          messageInput.focus();
        }
        if (sendButton) sendButton.disabled = false;

        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) typingIndicator.remove();
      };
      const openChat = () => {
        chatState.isOpen = true;
        const { chatWindow, chatIcon, closeIcon } = getDOMElements();
        if (chatWindow && chatIcon && closeIcon) {
          chatWindow.classList.remove("hidden");
          chatWindow.classList.add("flex");
          chatIcon.classList.add("hidden");
          closeIcon.classList.remove("hidden");
          scrollToBottom();
        }
      };

      const closeChat = () => {
        chatState.isOpen = false;
        const { chatWindow, chatIcon, closeIcon } = getDOMElements();
        if (chatWindow && chatIcon && closeIcon) {
          chatWindow.classList.add("hidden");
          chatWindow.classList.remove("flex");
          chatIcon.classList.remove("hidden");
          closeIcon.classList.add("hidden");
        }
      };

      const toggleChat = () => (chatState.isOpen ? closeChat() : openChat());

      const sendMessage = () => {
        const { messageInput } = getDOMElements();
        if (!messageInput) return;
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        renderMessages();
        messageInput.value = "";
        showTyping();

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "comprehensive_chat", message, ...payload }));
        } else {
          hideTyping();
          addMessage("⚠️ Cannot send message: not connected to server.", "bot");
          renderMessages();
        }
      };

      const bindEvents = () => {
        const { chatToggle, closeChat: closeBtn, sendButton, messageInput } = getDOMElements();
        if (chatToggle) chatToggle.addEventListener("click", toggleChat);
        if (closeBtn) closeBtn.addEventListener("click", closeChat);
        if (sendButton) sendButton.addEventListener("click", sendMessage);
        if (messageInput) messageInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") sendMessage();
        });
      };

      const initializeChatbot = async () => {
        const storedCustomerId = localStorage.getItem("chatbot_customer_id");
        if (storedCustomerId) {
          payload.customer_id = storedCustomerId;
          payload.new_convo = false;
          trackingData.chatbot_customer_id = storedCustomerId;
          console.log("Loaded customer ID from localStorage:", storedCustomerId);
          await updateCartNoteIfNeeded(storedCustomerId);
        }

        socket = new WebSocket("wss://ryder-partner.cortechsocial.com/ws/chat/");

        socket.onopen = () => {
          console.log("✅ Connected to server");
          if (!payload.customer_id) {
            socket.send(JSON.stringify({
              type: "comprehensive_chat",
              message: "Who are you?",
              agent_id: payload.agent_id,
              store_id: payload.store_id,
              new_convo: true,
              include_timestamp: true,
            }));
          }
        };

        socket.onclose = () => console.log("❌ Disconnected from server");
        socket.onerror = (error) => console.error("⚠️ WebSocket Error:", error);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.customer_id) {
              payload.customer_id = data.customer_id;
              payload.new_convo = false;
              trackingData.chatbot_customer_id = data.customer_id;
              localStorage.setItem("chatbot_customer_id", data.customer_id);
              console.log("🎯 Chatbot Customer ID received:", data);
              updateCartNoteIfNeeded(data.customer_id);
              monitorCart();
            }

           if (data.response && data.type === "comprehensive_chat_response") {
              console.log("Response received:", data.response);
              hideTyping(); // re-enable input when bot reply arrives
              addMessage(data.response, "bot");
            } else if (data.error) {
              addMessage("Error: " + data.error, "bot");
            }
          } catch {
            addMessage(event.data, "bot");
          }
          renderMessages();
        };

        setInterval(() => {
          if (trackingData.chatbot_customer_id) monitorCart();
        }, 3000);

        bindEvents();
        renderMessages();
        await fetchActiveAgent();
        monitorCart();
        
        setTimeout(() => {
        openChat();
      }, 2500);
      };

      document.addEventListener("DOMContentLoaded", initializeChatbot);
    </script>
  </body>
</html>`;
  return html;
};
