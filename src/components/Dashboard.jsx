import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SHOPIFY_QUERIES } from "../config/shopify";
import { logoutUser as logoutSignupUser } from "../store/signup/signupSlice";
import { logoutUser as logoutLoginUser } from "../store/login/loginSlice";

// Import Redux thunks
import { fetchStores, fetchProductCounts } from "../store/stores/storesThunk";
import { fetchUserDetails } from "../store/login/userThunk";
import { fetchAgents } from "../store/agents/agentThunk";

// Import API service
import { apiService } from "../services/api";

// Components
import Sidebar from "./Sidebar";
import Stores from "./Stores";
import Settings from "./Settings";
import OnboardingGuide from "./OnboardingGuide";

// Dashboard components
import ProductsTab from "./dashboard/ProductsTab";
import KnowledgeBaseTab from "./dashboard/KnowledgeBaseTab";
import AgentsTab from "./dashboard/AgentsTab";
import ConversationsTab from "./dashboard/ConversationsTab";
import AnalyticsTab from "./dashboard/AnalyticsTab";
import ConnectStoreModal from "./walkthroughGuide/ConnectStoreModal";
import { SiShopify } from "react-icons/si";
import SyncProductsModal from "./walkthroughGuide/ProductsModal";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [activeMainTab, setActiveMainTab] = useState("dashboard");
  // const [products, setProducts] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");

  // Knowledge Base status for dashboard display
  const [productDatabaseStatus, setProductDatabaseStatus] = useState("not_started");

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConnectStoreModal, setShowConnectStoreModal] = useState(false);
  const [showProductsSyncModal, setShowProductsSyncModal] = useState(false);

  // Redux state
  const {
    stores,
    productCounts,
    isLoading: isLoadingStores,
    error: storesError,
  } = useSelector((state) => state.stores);
  const { agents, totalCount: agentsCount } = useSelector((state) => state.agents);
  const loginState = useSelector((state) => state.login);
  // Get store data from localStorage as fallback
  // const shopifySession = localStorage.getItem("shopify_session");
  // const storeData = shopifySession ? JSON.parse(shopifySession) : null;

  // Extract credentials and store data
  // const credentials = storeData?.credentials || {};
  // const shopDomain = credentials.shopDomain || "demo-store";
  // const storefrontToken = credentials.storefrontToken || "";

  // Extract store info
  // const storeInfo = storeData?.shop || {
  //   name: 'Demo Store',
  //   domain: `${shopDomain}.myshopify.com`,
  //   currency: 'USD'
  // }

  // Fetch all dashboard data on component mount
  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchProductCounts());
    dispatch(fetchUserDetails());
    dispatch(fetchAgents());
  }, [dispatch]);

  // Check if user is first time and show onboarding
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    const signupOnboardingCompleted = localStorage.getItem("signup_onboarding_completed");
    const userSession = localStorage.getItem("user_session");

    console.log("🔍 DEBUG - Onboarding Check:", {
      onboardingCompleted,
      signupOnboardingCompleted,
      userSession: userSession ? "exists" : "not found",
      storesLength: stores.length,
      showOnboarding: showOnboarding,
    });

    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        console.log("🔍 DEBUG - Session Data:", {
          isNewUser: sessionData.isNewUser,
          email: sessionData.email,
          user: sessionData.user ? "exists" : "not found",
        });

        // Only show onboarding if it's not already being shown and conditions are met
        if (!showOnboarding) {
          // Check if user has completed signup onboarding but not regular onboarding
          if (signupOnboardingCompleted && !onboardingCompleted && stores.length === 0) {
            console.log("🔍 DEBUG - Showing Regular Onboarding (no stores connected)");
            setShowOnboarding(true);
          }
          // Check if user has completed signup onboarding but no stores are connected
          else if (signupOnboardingCompleted && stores.length === 0) {
            console.log("🔍 DEBUG - Showing Regular Onboarding (no stores)");
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    } else {
      console.log("🔍 DEBUG - No user session found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores.length]); // Removed showOnboarding from dependencies to prevent infinite loop

  // Fetch products when products section is active
  // useEffect(() => {
  //   if (activeMainTab === "products") {
  //     fetchProducts();
  //   }
  // }, [activeMainTab]);

  // Check product database status when stores or product counts change
  useEffect(() => {
    if (stores.length > 0 && Object.keys(productCounts).length > 0) {
      checkProductDatabaseStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, productCounts]);

  // Helper function to get total products for a store
  const getProductCountForStore = (storeId) => {
    return productCounts[storeId] || 0;
  };

  // Function to check product database status
  const checkProductDatabaseStatus = async () => {
    try {
      // If no stores, database status is 'not_started'
      if (stores.length === 0) {
        setProductDatabaseStatus("not_started");
        return;
      }

      // Check if any store has products
      const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0);
      if (totalProducts === 0) {
        setProductDatabaseStatus("no_products");
        return;
      }

      // Check embedding database status for the first store with products
      const storeWithProducts = stores.find((store) => productCounts[store.id] > 0);
      if (!storeWithProducts) {
        setProductDatabaseStatus("no_products");
        return;
      }

      // try {
      //   const response = await apiService.embeddings.getStats(
      //     storeWithProducts.id
      //   );
      //   const stats = response.data?.details?.data;

      //   if (stats && stats.points_count > 0) {
      //     setProductDatabaseStatus("ready");
      //   } else {
      //     setProductDatabaseStatus("pending");
      //   }
      // } catch (error) {
      //   console.log(
      //     "🔍 DEBUG - No embedding database found, status: pending",
      //     error
      //   );
      //   setProductDatabaseStatus("pending");
      // }
    } catch (error) {
      console.error("Error checking product database status:", error);
      setProductDatabaseStatus("error");
    }
  };

  // const fetchProducts = async () => {
  //   if (!storeData || !storefrontToken) {
  //     setError("No store connected. Please connect a store first.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError("");

  //   try {
  //     const response = await fetch(
  //       `https://${shopDomain}.myshopify.com/api/2023-10/graphql.json`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "X-Shopify-Storefront-Access-Token": storefrontToken,
  //         },
  //         body: JSON.stringify({
  //           query: SHOPIFY_QUERIES.PRODUCTS,
  //           variables: { first: 20 },
  //         }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (data.errors) {
  //       const error = data.errors[0];
  //       if (error.extensions?.code === "UNAUTHORIZED") {
  //         throw new Error(
  //           "Invalid Storefront API token. Please check your token in the store settings."
  //         );
  //       }
  //       throw new Error(`GraphQL Error: ${error.message || "Unknown error"}`);
  //     }

  //     if (!response.ok) {
  //       throw new Error(`API Error: ${response.status} ${response.statusText}`);
  //     }

  //     // const transformedProducts = data.data.products.edges.map((edge) => ({
  //     //   id: edge.node.id,
  //     //   title: edge.node.title,
  //     //   description: edge.node.description,
  //     //   handle: edge.node.handle,
  //     //   image: edge.node.images.edges[0]?.node.url || null,
  //     //   price: edge.node.variants.edges[0]?.node.price.amount || "0",
  //     //   currency: edge.node.variants.edges[0]?.node.price.currencyCode || "USD",
  //     // }));

  //     // setProducts(transformedProducts);
  //   } catch (err) {
  //     setError(err.message);
  //     console.error("Error fetching products:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogout = () => {
    // Determine which logout action to use based on authentication state
    const isLoginUser = loginState.isAuthenticated;

    if (isLoginUser) {
      dispatch(logoutLoginUser());
    } else {
      dispatch(logoutSignupUser());
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleNavigateToStep = (step) => {
    setShowOnboarding(false);
    setActiveMainTab(step);
  };

  const renderMainContent = () => {
    switch (activeMainTab) {
      case "dashboard":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <div className='mb-6 sm:mb-8'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
                <div>
                  <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                    Dashboard
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Overview of your connected stores and AI salespeople
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className='bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center text-sm sm:text-base'
                  >
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                      />
                    </svg>
                    {stores.length === 0 ? "Overview guide" : "Show Tutorial"}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {storesError && (
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6'>
                {storesError && <p>Stores: {storesError}</p>}
              </div>
            )}

            {/* Dashboard Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8'>
              <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center'>
                  <div className='p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'>
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m2 0H5'
                      />
                    </svg>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      Connected Stores
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {stores.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center'>
                  <div className='p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'>
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                      />
                    </svg>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      Total Products
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {Object.values(productCounts).reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center'>
                  <div className='p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'>
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      AI Salespeople
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {agentsCount || agents?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center'>
                  <div className='p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'>
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4'
                      />
                    </svg>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      Product Database
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {productDatabaseStatus === "ready" && "Ready"}
                      {productDatabaseStatus === "pending" && "Pending"}
                      {productDatabaseStatus === "no_products" && "No Products"}
                      {productDatabaseStatus === "error" && "Error"}
                    </p>
                    {/* {productDatabaseStatus === 'ready' && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Searchable & indexed
                      </p>
                    )}
                    {productDatabaseStatus === 'pending' && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Needs creation
                      </p>
                    )}
                    {productDatabaseStatus === 'not_started' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Connect a store first
                      </p>
                    )}
                    {productDatabaseStatus === 'no_products' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        No products found
                      </p>
                    )} */}
                  </div>
                </div>
              </div>
            </div>

            {/* Store Overview Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8'>
              {isLoadingStores ? (
                <div className='col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <p className='text-gray-600 dark:text-gray-300'>Loading your stores...</p>
                </div>
              ) : stores.length > 0 ? (
                stores.map((store) => (
                  <div
                    key={store.id}
                    className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {store.store_name}
                      </h3>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          store.status === "active" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>

                    <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>Domain</span>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>
                          {store.domain}
                        </span>
                      </div>

                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>Products</span>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>
                          {getProductCountForStore(store.id) || "0"}
                        </span>
                      </div>

                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          Product Database
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            productDatabaseStatus === "ready"
                              ? "text-green-600 dark:text-green-400"
                              : productDatabaseStatus === "pending"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {productDatabaseStatus === "ready" && "Ready"}
                          {productDatabaseStatus === "pending" && "Pending"}
                          {productDatabaseStatus === "not_started" && "Not Started"}
                          {productDatabaseStatus === "no_products" && "No Products"}
                          {productDatabaseStatus === "error" && "Error"}
                        </span>
                      </div>
                    </div>

                    <div className='mt-4 pt-4 border-t border-gray-100 dark:border-gray-700'>
                      <div className='flex justify-between items-center mb-3'>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          Updated: {store.updated_at}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            store.status === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {store.status}
                        </span>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => setActiveMainTab("products")}
                          className='flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'
                        >
                          Products
                        </button>
                        <button
                          onClick={() => setActiveMainTab("product-database")}
                          className='flex-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors'
                        >
                          Database
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center'>
                  <div className='mb-4'>
                    <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-8 h-8 text-gray-400 dark:text-gray-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m2 0H5'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                      No stores connected
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400 mb-4'>
                      Connect your first Shopify store to get started with AI chatbots
                    </p>
                    <div className='flex justify-center space-x-3'>
                      <button
                        onClick={() => setShowConnectStoreModal(true)}
                        className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors'
                      >
                        Guide to connect store
                      </button>
                      <button
                        onClick={() => setActiveMainTab("stores")}
                        className='flex items-center bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors'
                      >
                        <SiShopify className='w-4 h-4 mr-2' />
                        Connect Store
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {stores.length > 0 && (
              <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                  Quick Actions
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <button
                    onClick={() => setActiveMainTab("products")}
                    className='flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left'
                  >
                    <div className='bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3'>
                      <svg
                        className='w-5 h-5 text-blue-600 dark:text-blue-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900 dark:text-white'>Manage Products</p>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        View and manage store products
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMainTab("knowledge-base")}
                    className='flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left'
                  >
                    <div className='bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3'>
                      <svg
                        className='w-5 h-5 text-purple-600 dark:text-purple-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900 dark:text-white'>Product Database</p>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Create searchable product database
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {stores.length > 0 && (
              <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
                <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Recent Activity
                  </h2>
                </div>
                <div className='p-6'>
                  <div className='space-y-4'>
                    {stores.map((store) => {
                      const productCount = getProductCountForStore(store.id);

                      return (
                        <div
                          key={store.id}
                          className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
                        >
                          <div className='flex items-center'>
                            <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
                              {store.store_name.charAt(0).toUpperCase()}
                            </div>
                            <div className='ml-3'>
                              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                {store.store_name}
                              </p>
                              <p className='text-xs text-gray-500 dark:text-gray-400'>
                                {store.domain}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center space-x-4 text-sm'>
                            <div className='text-center'>
                              <p className='font-medium text-gray-900 dark:text-white'>
                                {productCount}
                              </p>
                              <p className='text-gray-500 dark:text-gray-400'>Products</p>
                            </div>

                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                store.status === "active"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              }`}
                            >
                              {store.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "stores":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <Stores
              showConnectStoreModal={showConnectStoreModal}
              setShowConnectStoreModal={setShowConnectStoreModal}
            />
          </div>
        );

      case "agents":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <AgentsTab setShowOnboarding={setShowOnboarding} />
          </div>
        );

      case "products":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <ProductsTab
              showProductsSyncModal={showProductsSyncModal}
              setShowProductsSyncModal={setShowProductsSyncModal}
            />
          </div>
        );

      case "knowledge-base":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <KnowledgeBaseTab
              showOnboarding={showOnboarding}
              setShowOnboarding={setShowOnboarding}
              onNavigateToStep={handleNavigateToStep}
            />
          </div>
        );

      case "conversations":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <ConversationsTab />
          </div>
        );

      case "analytics":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <AnalyticsTab />
          </div>
        );

      case "settings":
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <Settings showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />
          </div>
        );

      default:
        return (
          <div className='flex-1 p-4 sm:p-6 max-w-7xl mx-auto'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
              Page Not Found
            </h1>
          </div>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 flex'>
      <Sidebar
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        onLogout={handleLogout}
      />
      <div className='flex-1 lg:ml-64 pt-16 lg:pt-0'>{renderMainContent()}</div>

      {/* Onboarding Guide */}
      {showOnboarding && (
        <OnboardingGuide
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          onNavigateToStep={handleNavigateToStep}
        />
        // modal for instructions regarding connecting shopify store
        // <ConnectStoreModal
        //   isOpen={showOnboarding}
        //   onClose={() => setShowOnboarding(false)}
        //   onNavigateToStep={handleNavigateToStep}
        // />
      )}
      {showConnectStoreModal && (
        <ConnectStoreModal
          isOpen={showConnectStoreModal}
          onClose={() => setShowConnectStoreModal(false)}
          onNavigateToStep={handleNavigateToStep}
        />
      )}
      {showProductsSyncModal && (
        <SyncProductsModal
          isOpen={showProductsSyncModal}
          onClose={() => setShowProductsSyncModal(false)}
          onNavigateToStep={handleNavigateToStep}
        />
      )}
    </div>
  );
};

export default Dashboard;
