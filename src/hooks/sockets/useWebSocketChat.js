import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWebSocketConnection } from "./useWebSocketConnection";
import {
  addMessage,
  setCustomerId,
} from "../../store/agents/comprehensiveChatSlice";

export const useWebSocketChat = (agent, store, customerId) => {
  const dispatch = useDispatch();
  const { connect, sendMessage, disconnect, isConnected, connectionError } =
    useWebSocketConnection({ agent, store });

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (data) => {
      const botMessage = {
        id: Date.now(),
        sender: "bot",
        message: data.response,
        timestamp: new Date().toLocaleTimeString(),
      };
      const errorMessage = {
        id: Date.now(),
        sender: "bot",
        message: data.message || "An error occurred",
        timestamp: new Date().toLocaleTimeString(),
      };
      switch (data.type) {
        case "chat_response":
          dispatch(addMessage(botMessage));
          break;
        case "comprehensive_chat_response":
          dispatch(addMessage(botMessage));
          console.log("Received customer ID:", data.customer_id);
          dispatch(setCustomerId(data.customer_id));
          break;

        case "customer_id":
          if (data.customer_id) {
            console.log("Received customer ID:", data.customer_id);
            dispatch(setCustomerId(data.customer_id));
          }
          break;

        case "error":
          dispatch(addMessage(errorMessage));
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    },
    [dispatch]
  );

  const handleError = useCallback((error) => {
    console.error("WebSocket error in chat:", error);
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (agent?.id && store?.id) {
      connect(agent.id, store.id, customerId, handleMessage, handleError);
    }
  }, [agent?.id, store?.id, customerId, connect, handleMessage, handleError]);

  return {
    sendMessage,
    disconnect,
    connectWebSocket,
    isConnected,
    connectionError,
  };
};
