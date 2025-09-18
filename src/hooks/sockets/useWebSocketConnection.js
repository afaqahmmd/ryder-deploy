import { useRef, useEffect, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { custom } from "zod";

export const useWebSocketConnection = ({ agent, store }) => {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;
  const { customerId } = useSelector(
    (state) => state.comprehensiveChat
  );

  const connect = useCallback(
    (agentId, storeId, customerId = null, onMessage, onError) => {
      // Close existing connection
      if (socketRef.current) {
        socketRef.current.close();
      }

      const wsUrl = import.meta.env.VITE_SOCKET_URL || "http://192.168.18.199:8000/ws/chat/";

      try {
        socketRef.current = new WebSocket(`${wsUrl}`);

        socketRef.current.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
          setConnectionError(null);
          setReconnectAttempts(0);

          // Send queued messages
          while (messageQueueRef.current.length > 0) {
            const message = messageQueueRef.current.shift();
            socketRef.current.send(JSON.stringify(message));
          }
        };

        socketRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket message received:", data);
            onMessage?.(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        socketRef.current.onclose = (event) => {
          console.log("WebSocket disconnected:", event);
          setIsConnected(false);

          // Attempt reconnection if not intentionally closed
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            setReconnectAttempts((prev) => prev + 1);
            console.log(
              `Attempting to reconnect... (${
                reconnectAttempts + 1
              }/${maxReconnectAttempts})`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              connect(agentId, storeId, customerId, onMessage, onError);
            }, reconnectInterval);
          }
        };

        socketRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionError("WebSocket connection failed");
          onError?.(error);
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        setConnectionError(error.message);
        onError?.(error);
      }
    },
    [reconnectAttempts, maxReconnectAttempts]
  );

  const sendMessage = useCallback(
    (message, isNewConvo) => {
     console.log("isnewconvo:",isNewConvo)
     console.log("customerid:",customerId)
      const messageData = {
        type: "comprehensive_chat",
        message: message.trim(),
        agent_id: agent.id,
        store_id: store.id,
        customer_id: customerId,
        new_convo: isNewConvo,
        include_timestamp: true,
      };

      if (isConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(messageData));
        return true;
      } else {
        // Queue message for later sending
        messageQueueRef.current.push(messageData);
        console.log("WebSocket not ready, message queued");
        return false;
      }
    },
    [isConnected,customerId,agent.id, store.id]
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.close(1000, "Intentional disconnect");
      socketRef.current = null;
    }

    setIsConnected(false);
    messageQueueRef.current = [];
    setReconnectAttempts(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    sendMessage,
    disconnect,
    isConnected,
    connectionError,
    reconnectAttempts,
  };
};
