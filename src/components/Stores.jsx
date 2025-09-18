import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SiShopify } from "react-icons/si";
import {
  MdAdd,
  MdStore,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdError,
  MdPlayArrow,
  MdWarning,
  MdClose,
} from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { connectShopifyStore } from "../store/shopify/shopifyThunk";
import { clearShopifyError } from "../store/shopify/shopifySlice";
import { fetchStores, deleteStore } from "../store/stores/storesThunk";
import { clearStoresError } from "../store/stores/storesSlice";
import { axiosInstance } from "../utils/axios";
import { toast } from "react-toastify";

// Store type options
const STORE_TYPES = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics & Technology" },
  { value: "home_garden", label: "Home & Garden" },
  { value: "beauty_health", label: "Beauty & Health" },
  { value: "sports_outdoors", label: "Sports & Outdoors" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "automotive", label: "Automotive" },
  { value: "books_media", label: "Books & Media" },
  { value: "toys_games", label: "Toys & Games" },
  { value: "jewelry_accessories", label: "Jewelry & Accessories" },
  { value: "art_crafts", label: "Art & Crafts" },
  { value: "pet_supplies", label: "Pet Supplies" },
  { value: "baby_kids", label: "Baby & Kids" },
  { value: "office_supplies", label: "Office & Business" },
  { value: "other", label: "Other" },
];

// Helper function to get store type labels
const getStoreTypeLabel = (type) => {
  const typeMap = {
    fashion: "Fashion & Apparel",
    electronics: "Electronics & Technology",
    home_garden: "Home & Garden",
    beauty_health: "Beauty & Health",
    sports_outdoors: "Sports & Outdoors",
    food_beverage: "Food & Beverage",
    automotive: "Automotive",
    books_media: "Books & Media",
    toys_games: "Toys & Games",
    jewelry_accessories: "Jewelry & Accessories",
    art_crafts: "Art & Crafts",
    pet_supplies: "Pet Supplies",
    baby_kids: "Baby & Kids",
    office_supplies: "Office & Business",
    other: "Other",
  };
  return typeMap[type] || "Other";
};

const Stores = ({ showConnectStoreModal, setShowConnectStoreModal }) => {
  const dispatch = useDispatch();
  const { isConnecting, isConnected, connectionData, error } = useSelector(
    (state) => state.shopify
  );
  const {
    stores: connectedStores,
    isLoading: isLoadingStores,
    isDeleting,
  } = useSelector((state) => state.stores);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);


  const [formData, setFormData] = useState({
    clientId: "",
    clientSecret: "",
    shopDomain: "",
    storefrontToken: "",
    storeType: "",
    storeDescription: "",
  });

  // Fetch stores from Redux store on component mount
  useEffect(() => {
    dispatch(fetchStores());
  }, [dispatch]);

  // Load connected stores from localStorage as fallback if Redux store is empty
  useEffect(() => {
    const shopifySession = localStorage.getItem("shopify_session");
    if (shopifySession && connectedStores.length === 0 && !isLoadingStores) {
      try {
        const storeData = JSON.parse(shopifySession);
        // Note: We'll handle localStorage stores differently since they're not in Redux
        // This is just for display purposes
      } catch (error) {
        console.error("Error parsing shopify session:", error);
      }
    }
  }, [connectedStores.length, isLoadingStores]);

  // Handle successful connection
  useEffect(() => {
    if (isConnected && connectionData) {
      setShowConnectModal(false);
      localStorage.setItem("shopify_session", JSON.stringify(connectionData));
      // Refresh stores list after successful connection
      dispatch(fetchStores());
      // Reset form
      setFormData({
        clientId: "",
        clientSecret: "",
        shopDomain: "",
        storefrontToken: "",
        storeType: "",
        storeDescription: "",
      });
    }
  }, [isConnected, connectionData, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearShopifyError());
      dispatch(clearStoresError());
    };
  }, [dispatch]);

  const handleConnectClick = () => {
    setShowConnectModal(true);
    dispatch(clearShopifyError());
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      dispatch(clearShopifyError());
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.clientId ||
      !formData.clientSecret ||
      !formData.shopDomain ||
      !formData.storefrontToken
    ) {
      return;
    }

    dispatch(
      connectShopifyStore({
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        shopDomain: formData.shopDomain,
        storefrontToken: formData.storefrontToken,
        storeType: formData.storeType,
        storeDescription: formData.storeDescription,
      })
    );
  };

  const handleDisconnectStore = (store) => {
    setStoreToDelete(store);
    setShowDeleteModal(true);
  };

  const confirmDeleteStore = async () => {
    if (!storeToDelete) return;

    try {
      if (storeToDelete.source === "localStorage") {
        // Handle localStorage store
        localStorage.removeItem("shopify_session");
        toast.success("Store deleted successfully");
      } else {
        // Handle API store deletion using Redux
        await dispatch(deleteStore(storeToDelete.id)).unwrap();
        // The Redux slice will automatically update the UI when the API call succeeds
        // No need to manually update local state
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("Failed to delete store");
    } finally {
      setShowDeleteModal(false);
      setStoreToDelete(null);
    }
  };

  const cancelDeleteStore = () => {
    setShowDeleteModal(false);
    setStoreToDelete(null);
  };

  const formatDomain = (domain) => {
    if (!domain) return "";
    return domain.includes(".myshopify.com")
      ? domain
      : `${domain}.myshopify.com`;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Stores
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your connected Shopify stores
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowConnectStoreModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Guide to connect store
            </button>
          </div>
        </div>
      </div>

      {/* Connected Stores */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connected Stores
          </h2>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleConnectClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Add Store
            </button>
          </div>
        </div>

        {isLoadingStores ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading stores...
            </p>
          </div>
        ) : connectedStores.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <MdStore className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No stores connected
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Add your first Shopify store to get started
            </p>
           
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedStores.map((store, index) => (
              <div
                key={store.id || index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <SiShopify className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {store.store_name || "Shopify Store"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDomain(store.domain)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {store.status === "active" ? (
                      <MdCheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <MdError className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Store Status:
                    </span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {store.status || "Active"}
                    </span>
                  </div>

                  {/* NEW: Store Type Badge */}
                  {store.store_type && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Type:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          store.store_type === "fashion"
                            ? "bg-pink-100 text-pink-800"
                            : store.store_type === "electronics"
                            ? "bg-cyan-100 text-cyan-800"
                            : store.store_type === "home_garden"
                            ? "bg-blue-100 text-blue-800"
                            : store.store_type === "beauty_health"
                            ? "bg-green-100 text-green-800"
                            : store.store_type === "sports_outdoors"
                            ? "bg-yellow-100 text-yellow-800"
                            : store.store_type === "food_beverage"
                            ? "bg-purple-100 text-purple-800"
                            : store.store_type === "automotive"
                            ? "bg-indigo-100 text-indigo-800"
                            : store.store_type === "books_media"
                            ? "bg-violet-100 text-violet-800"
                            : store.store_type === "toys_games"
                            ? "bg-teal-100 text-teal-800"
                            : store.store_type === "jewelry_accessories"
                            ? "bg-orange-100 text-orange-800"
                            : store.store_type === "art_crafts"
                            ? "bg-pink-100 text-pink-800"
                            : store.store_type === "pet_supplies"
                            ? "bg-emerald-100 text-emerald-800"
                            : store.store_type === "baby_kids"
                            ? "bg-rose-100 text-rose-800"
                            : store.store_type === "office_supplies"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStoreTypeLabel(store.store_type)}
                      </span>
                    </div>
                  )}

                  {/* NEW: Store Description */}
                  {store.store_description && (
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">
                        Description:
                      </span>
                      <p className="text-gray-900 dark:text-white italic text-xs leading-relaxed">
                        {store.store_description}
                      </p>
                    </div>
                  )}

                  {/* NEW: Product Count */}
                  {store.product_count !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Products:
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {store.product_count.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Added:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(store.created_at)}
                    </span>
                  </div>
                  {store.source === "localStorage" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Source:
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                        Local Session
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDisconnectStore(store)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdDelete className="w-4 h-4 inline mr-1" />
                    Delete Store
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Store Confirmation Modal */}
      {showDeleteModal && storeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Store
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={cancelDeleteStore}
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdWarning className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Store?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to delete{" "}
                  <strong>{storeToDelete.store_name}</strong>? This action
                  cannot be undone.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This will remove the store and all its associated data from
                  your account.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={cancelDeleteStore}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  onClick={confirmDeleteStore}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Store"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Store Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <SiShopify className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Connect to Shopify
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enter your store credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Two Column Layout */}
            <div className="flex flex-col lg:flex-row max-h-[calc(95vh-80px)]">
              {/* Left Column - Instructions & Video */}
              <div className="lg:w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                {/* Video Demo Button */}
                <div className="text-center mb-6">
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        "/videos/shopify-connection-demo.mp4",
                        "_blank"
                      )
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                  >
                    <MdPlayArrow className="w-5 h-5 mr-2" />
                    🎥 Watch Demo Video
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    See how to get your Shopify credentials in 3 minutes
                  </p>
                </div>

                {/* Help Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">
                    Step-by-Step Guide to Get Your Shopify Credentials
                  </h4>
                  <div className="text-xs text-blue-700 space-y-3">
                    <div>
                      <p className="font-semibold mb-2">
                        1. Log in to Your Shopify Admin
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          Open <strong>admin.shopify.com</strong> in your
                          browser
                        </li>
                        <li>Select the store you want to connect</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">2. Create a New App</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          In the bottom-left corner of your Shopify admin, click
                          Settings
                        </li>
                        <li>
                          From the left menu, select Apps and sales channels
                        </li>
                        <li>At the top right, click Develop apps</li>
                        <li>Click Create an app</li>
                        <li>
                          Enter a unique App name (e.g., "My Store Connector")
                        </li>
                        <li>
                          Choose yourself (or the appropriate person) as the App
                          developer
                        </li>
                        <li>Click create app</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">
                        3. Configure API Access
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          Once you click on "Create app", it will take you to
                          the App development page, where you will configure the
                          access to your store
                        </li>
                        <li>Click on "Configure Storefront API scopes"</li>
                        <li>
                          If you can not find "Configure Storefront API scopes",
                          click on "Configuration" tab and then on the
                          "Storefront API Integration" section, click
                          "configure"
                        </li>
                        <li>
                          Check all "Read" permissions (this gives the app
                          permission to read your store's data)
                        </li>
                        <li>Click Save</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">4. Install the App</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>From the tabs, select "API Credentials"</li>
                        <li>Install the app by clicking on "Install app"</li>
                        <li>
                          When the pop-up appears, click Install to confirm
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">
                        5. Copy Your API Keys
                      </p>
                      <p className="mb-2">
                        Once the app is installed, you'll see your credentials.
                        Please copy and paste them in the fields on the left
                        side.
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          <strong>Storefront API Access Token</strong> → copy
                          and paste it in the "Storefront Access Token" field
                        </li>
                        <li>
                          <strong>API Key</strong> → copy and paste it in the
                          "API Key" field
                        </li>
                        <li>
                          <strong>API Secret Key</strong> → copy and paste it in
                          the "API Secret" field
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">6. Get Your Domain</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>From the left menu bar, select "Domains"</li>
                        <li>All your domains will be listed</li>
                        <li>
                          Select the domain that ends with "myshopify.com"
                        </li>
                        <li>
                          Copy the domain and paste it in the "Shop Domain"
                          field
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">7. Connect Store</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          Once you have all the credentials, click on "Connect
                          Store"
                        </li>
                        <li>And you are done! Welcome to Ryder Partners!</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-3">
                      <p className="text-amber-700 font-medium text-xs">
                        Important: Treat these keys like a password. Do not
                        share them publicly.
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded p-2 mt-3">
                      <p className="text-green-700 font-medium text-xs">
                        That's it! Your Shopify app is now created and
                        connected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="lg:w-1/2 p-6 flex flex-col overflow-y-auto">
                <form onSubmit={handleConnect} className="flex-1 flex flex-col">
                  <div className="space-y-6 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Storefront Access Token
                      </label>
                      <input
                        type="text"
                        name="storefrontToken"
                        value={formData.storefrontToken}
                        onChange={handleFormChange}
                        placeholder="Your Storefront API access token"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="text"
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleFormChange}
                        placeholder="Your Shopify API Key"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Secret
                      </label>
                      <input
                        type="password"
                        name="clientSecret"
                        value={formData.clientSecret}
                        onChange={handleFormChange}
                        placeholder="Your Shopify API Secret"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Domain
                      </label>
                      <input
                        type="text"
                        name="shopDomain"
                        value={formData.shopDomain}
                        onChange={handleFormChange}
                        placeholder="your-shop-name.myshopify.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Form Footer */}
                  <div className="flex space-x-4 mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowConnectModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isConnecting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <SiShopify className="w-5 h-5 mr-2" />
                          Connect Store
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Stores;
