import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./login/loginSlice";
import signupSlice from "./signup/signupSlice";
import shopifySlice from "./shopify/shopifySlice";
import agentSlice from "./agents/agentSlice";
import comprehensiveChatSlice from "./agents/comprehensiveChatSlice";
import storesSlice from "./stores/storesSlice";
import dashboardSlice from "./dashboard/dashboardSlice";
import conversationsSlice from "./conversations/conversationsSlice";
import analyticsSlice from "./analytics/analyticsSlice";

const store = configureStore({
  reducer: {
    login: loginSlice,
    signup: signupSlice,
    shopify: shopifySlice,
    agents: agentSlice,
    comprehensiveChat: comprehensiveChatSlice,
    stores: storesSlice,
    dashboard: dashboardSlice,
    conversations: conversationsSlice,
    analytics: analyticsSlice,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
