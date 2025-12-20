import { useState, useEffect } from "react";
import {
  BarChart3,
  ShoppingBag,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import EngagementCard from "./Analytics/EngagementCard";
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
import WorkflowCard from "./Analytics/WorkflowCard";

const AnalyticsTab = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [activeView, setActiveView] = useState("overview");
  const [selectedStore, setSelectedStore] = useState(null);
  const [startDate, setStartDate] = useState(formatDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  console.log("start date and end date", startDate, endDate);
  const dispatch = useDispatch();
  const { stores } = useSelector((state) => state.stores);

  // Use the selected store from dropdown for fetching analytics
  const { storeAnalytics, storeGraph, productAnalytics, engagedAnalytics } =
    useSelector((state) => state.analytics);

  const views = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "charts", label: "Charts", icon: TrendingUp },
  ];

useEffect(() => {
  if (!selectedStore && stores?.length > 0) {
    const defaultStore = stores[0];
    setSelectedStore(defaultStore);

    // Immediately trigger analytics fetch for the first store
    triggerAnalyticsFetch(defaultStore.id, startDate, endDate);
  }
}, [stores]);

  const getCurrentData = () => {
    const storeId = selectedStore?.id;
    const defaultAnalytics = storeAnalytics?.[storeId] || {};

    switch (activeView) {
      case "overview": {
        const engaged = engagedAnalytics?.[storeId] || {};
        return {
          currency: engaged.currency,
          customer_comparison: engaged.customer_comparison || {},
          summary: engaged.summary || {},
          workflow: engaged.workflow || {},
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
  }, [activeView, productAnalytics, dispatch, selectedStore,startDate, endDate]);

  // Ensure overview uses engaged analytics for store 25
  useEffect(() => {
    if (activeView !== "overview") return;
    const storeId = selectedStore?.id;
    if (!storeId) return;
    if (!engagedAnalytics?.[storeId]) {
      dispatch(fetchEngagedAnalytics(storeId));
    }
  }, [activeView, engagedAnalytics, dispatch, selectedStore,startDate, endDate]);

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    const store = stores.find((s) => s.id.toString() === storeId);
    setSelectedStore(store);

    if (store?.id) {
      triggerAnalyticsFetch(store.id, startDate, endDate);
    }
  };

  useEffect(() => {
    if (!selectedStore?.id) return;
    triggerAnalyticsFetch(selectedStore.id, startDate, endDate);
  }, [startDate, endDate]);

  const triggerAnalyticsFetch = (storeId, start, end) => {
    const dateParams = { start_date: start, end_date: end };

    dispatch(fetchStoreAnalytics({ storeId, ...dateParams }));
    dispatch(fetchProductAnalytics({ storeId, ...dateParams }));
    dispatch(fetchEngagedAnalytics({ storeId, ...dateParams }));
    dispatch(fetchEngagedGraph({ storeId, ...dateParams }));
    dispatch(fetchStoreGraph({ storeId, ...dateParams }));
  };

  // 🔄 Auto-refresh analytics every 1 minute
  useEffect(() => {
    const storeId = selectedStore?.id;
    if (!storeId) return;

    const intervalId = setInterval(() => {
      console.log(`🔄 Auto-refreshing analytics for store ID: ${storeId}`);
      triggerAnalyticsFetch(storeId, startDate, endDate);
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(intervalId);
  }, [selectedStore, startDate, endDate]);

  // 🧠 Fetch analytics automatically when selectedStore changes
  useEffect(() => {
    const storeId = selectedStore?.id;
    if (!storeId) return;
    console.log(`Fetching analytics for store ID: ${storeId}`);

    dispatch(
      fetchStoreAnalytics({ storeId, start_date: startDate, end_date: endDate })
    )
      .unwrap()
      .then((data) => {
        console.group(`✅ Store Analytics Loaded [Store ID: ${storeId}]`);
        console.log("Fetched Store Analytics Data:", data);
        console.groupEnd();
      })
      .catch((err) => {
        console.error("❌ Failed to fetch store analytics:", err);
      });
    dispatch(
      fetchProductAnalytics({
        storeId,
        start_date: startDate,
        end_date: endDate,
      })
    );
    // also fetch graph on selection
    dispatch(
      fetchStoreGraph({ storeId, start_date: startDate, end_date: endDate })
    );
  }, [dispatch, selectedStore, startDate, endDate]);

  // Ensure chart graph data are fetched when switching to charts view
  useEffect(() => {
    if (activeView !== "charts") return;
    const storeId = selectedStore?.id;
    if (!storeId) return;
    if (!storeGraph?.[storeId]) {
      dispatch(
        fetchStoreGraph({ storeId, start_date: startDate, end_date: endDate })
      );
    }
  }, [activeView, storeGraph, dispatch, selectedStore, startDate, endDate]);

  // Ensure engaged analytics are fetched when switching to engaged view
  useEffect(() => {
    if (activeView !== "engaged") return;
    const storeId = selectedStore?.id;
    if (!storeId) return;
    if (!engagedAnalytics?.[storeId]) {
      dispatch(
        fetchEngagedAnalytics({
          storeId,
          start_date: startDate,
          end_date: endDate,
        })
      );
    }
  }, [activeView, engagedAnalytics, dispatch, selectedStore, startDate, endDate]);

  return (
    <div className="flex-1 p-6 w-full">
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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

        {/* Right side controls */}
        <div className="flex flex-col md:flex-row md:items-center items-end md:w-auto w-full gap-3">
          {/* Date Range Inputs */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Start:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              End:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            />
          </div>

          {/* Store Dropdown */}
          {stores?.length > 0 && (
            <select
              value={selectedStore?.id || ""}
              onChange={handleStoreChange}
              className="w-48 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="hidden sm:flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
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

      {/* Analytics Content */}
      {currentData ? (
        <div className="space-y-8">
          {activeView === "overview" && (
            <>
              <EngagementCard data={currentData} />
              <WorkflowCard data={currentData} />
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
