import { useState, useEffect } from "react";
import {
  BarChart3,
  ShoppingBag,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import StatsCard from "./Analytics/StatsCard";
import EventsBreakdown from "./Analytics/EventsBreakdown";
import ConversionRates from "./Analytics/ConversionRates";
import ProductsTable from "./Analytics/ProductsTable";
import EngagedUsers from "./Analytics/EngagedUsers";
import ChartContainer from "./Analytics/ChartContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStoreAnalytics,
  fetchStoreGraph,
  fetchEngagedAnalytics,
  fetchEngagedGraph,
  fetchProductAnalytics,
} from "@/store/analytics/analyticsThunk";

const AnalyticsTab = () => {
  const [activeView, setActiveView] = useState("overview");
  const [selectedStore, setSelectedStore] = useState(null);
  const dispatch = useDispatch();
  const { stores } = useSelector((state) => state.stores);
  // Use the selected store from dropdown for fetching analytics

  // const {
  //   storeAnalytics,
  //   storeGraph,
  //   engagedAnalytics,
  //   engagedGraph,
  //   productAnalytics,
  //   isLoading,
  //   error,
  // } = useSelector((state) => state.analytics);

   const { storeAnalytics, storeGraph, productAnalytics, engagedAnalytics } = useSelector((state) => state.analytics);

 useEffect(() => {
  console.log("stores", stores);
  if (!selectedStore && stores?.length > 0) {
    setSelectedStore(stores[0]);
  }
}, [stores, selectedStore]);

  const views = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "charts", label: "Charts", icon: TrendingUp },
  ];

  const getCurrentData = () => {
    const storeId = selectedStore?.id;
    const defaultAnalytics = storeAnalytics?.[storeId] || {};

    switch (activeView) {
      case "overview": {
        const engaged = engagedAnalytics?.[storeId] || {};
        return {
          summary: engaged.summary || {},
          events: engaged.events || {},
          conversion_rates: engaged.conversion_rates || {},
          products: engaged.products || {},
          engaged_users: engaged.engaged_users || [],
          recent_activity: engaged.recent_activity || [],
        };
      }
      case "products":
        return productAnalytics?.[storeId] || {};
      case "charts":
        return storeGraph?.[storeId] || {};
      case "engaged":
        return engagedAnalytics?.[storeId] || {};
      default:
        return defaultAnalytics;
    }
  };

  const currentData = getCurrentData();

  // Ensure products analytics are fetched when switching to products view
  useEffect(() => {
    if (activeView !== "products") return;
    const storeId = selectedStore?.id;
    if (!storeId) return;
    if (!productAnalytics?.[storeId]) {
      dispatch(fetchProductAnalytics(storeId));
    }
  }, [activeView, productAnalytics, dispatch, selectedStore]);

  // Ensure overview uses engaged analytics for store 25
  useEffect(() => {
    if (activeView !== "overview") return;
    const storeId = selectedStore?.id;
    if (!storeId) return;
    if (!engagedAnalytics?.[storeId]) {
      dispatch(fetchEngagedAnalytics(storeId));
    }
  }, [activeView, engagedAnalytics, dispatch, selectedStore]);

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    const store = stores.find((s) => s.id.toString() === storeId);
    setSelectedStore(store);
    console.log("Selected Store:", store);

    // Dispatch API calls for the newly selected store id
    if (store?.id) {
      dispatch(fetchStoreAnalytics(store.id));
      dispatch(fetchStoreGraph(store.id));
      dispatch(fetchEngagedAnalytics(store.id));
      dispatch(fetchEngagedGraph(store.id));
      dispatch(fetchProductAnalytics(store.id));
    }
  };

  // 🧠 Fetch analytics automatically when selectedStore changes
  useEffect(() => {
    const storeId = selectedStore?.id;
    if (!storeId) return;
    console.log(`Fetching analytics for store ID: ${storeId}`);

    dispatch(fetchStoreAnalytics(storeId))
      .unwrap()
      .then((data) => {
        console.group(`✅ Store Analytics Loaded [Store ID: ${storeId}]`);
        console.log("Fetched Store Analytics Data:", data);
        console.groupEnd();
      })
      .catch((err) => {
        console.error("❌ Failed to fetch store analytics:", err);
      });
    dispatch(fetchProductAnalytics(storeId));
    // also fetch graph on selection
    dispatch(fetchStoreGraph(storeId));
  }, [dispatch, selectedStore]);


useEffect(() => {
  const storeId = selectedStore?.id;
  if (!storeId) return;
  console.group(`📊 Current Analytics Data for Store ID: ${storeId}`);
  console.log("Store Analytics:", storeAnalytics);
  console.log("Store Graph:", storeGraph);
  console.log("Product Analytics:", productAnalytics);
  console.log("Engaged Analytics:", engagedAnalytics);
  console.groupEnd();
}, [storeAnalytics, storeGraph, productAnalytics, engagedAnalytics, selectedStore]);

  // Ensure chart graph data are fetched when switching to charts view
  useEffect(() => {
    if (activeView !== "charts") return;
    const storeId = selectedStore?.id;
    if (!storeId) return;
    if (!storeGraph?.[storeId]) {
      dispatch(fetchStoreGraph(storeId));
    }
  }, [activeView, storeGraph, dispatch, selectedStore]);

  // Ensure engaged analytics are fetched when switching to engaged view
  useEffect(() => {
    if (activeView !== "engaged") return;
    const storeId = selectedStore?.id;
    if (!storeId) return;
    if (!engagedAnalytics?.[storeId]) {
      dispatch(fetchEngagedAnalytics(storeId));
    }
  }, [activeView, engagedAnalytics, dispatch, selectedStore]);


  return (
    <div className="flex-1 p-6 w-full">
      <div className="mb-8  flex sm:flex-row flex-col items-center justify-between ">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Activity className="w-8 h-8 mr-3" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your store performance and customer
            engagement
          </p>
        </div>
        <div className="flex flex-col items-start">
          {/* Store Dropdown */}
          {stores?.length > 0 && (
            <div className=" sm:mt-0 w-full sm:w-64">
              <select
                value={selectedStore?.id || ""}
                onChange={handleStoreChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select Store
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.store_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-8">
        {/* Mobile: Dropdown */}
        <div className="sm:hidden mb-3">
          <select
            value={activeView}
            onChange={(e) => setActiveView(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop: Tabs */}
        <div className="hidden sm:flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeView === view.id
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
            >
              <view.icon className="w-4 h-4 mr-2" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State
      {!currentData && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )} */}

      {/* Analytics Content */}
      {currentData ? (
        <div className="space-y-8">
          {activeView === "overview" && (
            <>
              <StatsCard data={currentData} />
              <EventsBreakdown data={currentData} />
              <ConversionRates data={currentData} />
            </>
          )}

          {activeView === "products" && <ProductsTable data={currentData} />}

          {activeView === "charts" && <ChartContainer data={currentData} />}

          {activeView === "engaged" && (
            <EngagedUsers
              users={currentData?.engaged_users || []}
              recentActivity={currentData?.recent_activity || []}
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-300">No data found</div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
