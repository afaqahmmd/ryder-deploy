import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiBarChart2,
  FiShoppingBag,
  FiSearch,
  FiDatabase,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiPlay,
  FiRefreshCw,
} from "react-icons/fi";
import {
  fetchStores,
  fetchProductCounts,
} from "../../store/stores/storesThunk";
import { useEmbeddings } from "../../hooks/useEmbeddings";

const KnowledgeBaseTab = ({ setShowOnboarding }) => {
  const dispatch = useDispatch();

  // Redux state
  const {
    stores,
    productCounts,
    isLoading,
    topProducts,
    isFetchingTopProducts,
  } = useSelector((state) => state.stores);

  // Embeddings hook
  const {
    loading: embeddingsLoading,
    error: embeddingsError,
    embeddingStats,
    searchResults,
    isCreatingEmbeddings,
    isSearching,
    createEmbeddings,
    searchEmbeddings,
    // getEmbeddingStats,
    clearError,
    clearSearchResults,
  } = useEmbeddings();

  // Local state
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLimit, setSearchLimit] = useState(10);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const autoCreatedRef = useRef(new Set());


  // Load data on component mount
  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchProductCounts());
  }, [dispatch]);

  // Handle store selection
  const handleStoreSelection = async (storeId) => {
    setSelectedStore(stores.find((store) => store.id === storeId) || null);
    clearError();
    clearSearchResults();
    setShowSearchResults(false);
  };

  // Handle create database
  const handleCreateDatabase = async () => {
    if (!selectedStore) {
      alert("Please select a store first");
      return;
    }

    try {
     const res =  await createEmbeddings(selectedStore.id);
     console.log("res after create embeddings:", res);
    } catch (error) {
      console.error("Error creating database:", error);
    }
  };

  // Handle search products
  const handleSearchProducts = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query");
      return;
    }

    if (!selectedStore) {
      alert("Please select a store first");
      return;
    }

    try {
      await searchEmbeddings(searchQuery, selectedStore.id, searchLimit);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  // Auto-create embeddings in background for newly connected stores (when on this page)
  // useEffect(() => {
  //   const run = async () => {
  //     for (const s of stores) {
  //       if (!s || s.status !== "active") continue;
  //       if (autoCreatedRef.current.has(s.id)) continue;
  //       try {
  //         const stats = await getEmbeddingStats(s.id);
  //         const count = stats?.points_count || 0;
  //         if (count === 0) {
  //           await createEmbeddings(s.id);
  //         }
  //       } catch (error) {
  //         // ignore; surfaced via hook error
  //         console.error(error);
  //       } finally {
  //         autoCreatedRef.current.add(s.id);
  //       }
  //     }
  //   };
  //   if (stores && stores.length > 0) {
  //     run();
  //   }
  // }, [stores, getEmbeddingStats, createEmbeddings]);

  // On selection: check database, auto-create if missing, then fetch top products
  // useEffect(() => {
  //   const run = async () => {
  //     if (!selectedStore) return;
  //     try {
  //       await createEmbeddings(selectedStore.id);
  //       autoCreatedRef.current.add(selectedStore.id);
     
  //     } catch (error) {
  //       console.error(error);
  //       // handled via embeddingsError
  //     } finally {
  //       // Always fetch top N products for preview
  //       // dispatch(fetchProductsList({ storeId: selectedStore.id, limit: 6 }));
  //     }
  //   };
  //   run();
  // }, [selectedStore, createEmbeddings, dispatch]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="text-center flex-1">
            {/* move the button to the right */}
            <div className="flex items-center justify-center sm:justify-end space-x-3 mb-4">
              <button
                onClick={() => setShowOnboarding(true)}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center text-sm sm:text-base"
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
                Show Tutorial
              </button>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDatabase className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Product Database
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base mb-6">
              Create a smart searchable database of your products so customers
              can find exactly what they're looking for using natural language.
            </p>
          </div>
        </div>
      </div>

      {/* FUNCTIONAL SECTIONS - At the top for immediate access */}

      {/* Store Selection */}
      {stores.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Your Store
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => {
              const productCount = productCounts[store.id] || 0;
              const isSelected = selectedStore?.id === store.id;

              return (
                <div
                  key={store.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  onClick={() => handleStoreSelection(store.id)}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiShoppingBag className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {store.store_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {productCount} products
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Display */}
          {embeddingsError && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
              <FiAlertCircle className="w-5 h-5 mr-2" />
              {embeddingsError}
            </div>
          )}
        </div>
      )}

      {/* Database Status / Checking 
       COMMENTED OUT FOR NOW - 17 SEP 2025
      */}
      {/* {selectedStore && (
        <div className="bg-red-500 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {!embeddingStats && embeddingsLoading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">Checking database status…</span>
            </div>
          )}
          {embeddingStats && embeddingStats.points_count > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Database Ready! 🎉</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">{embeddingStats.points_count} products indexed and searchable</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your AI assistant can now understand customer queries and find relevant products instantly!</p>
                </div>
              </div>
              <button
                onClick={() => getEmbeddingStats(selectedStore.id)}
                disabled={embeddingsLoading}
                className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <FiRefreshCw className={`w-4 h-4 mr-1 ${embeddingsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          )}
        </div>
      )} */}

      {/* Create Database Section - When No Database Exists */}
      {selectedStore &&
        (!embeddingStats || embeddingStats.points_count === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDatabase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Create Product Database
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Transform <strong>{selectedStore.store_name}</strong>'s{" "}
                {productCounts[selectedStore.id] || 0} products into an
                intelligent, searchable database that understands customer
                language.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  What happens during creation:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      We securely download all your product data from Shopify
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      AI analyzes each product and creates smart searchable
                      chunks
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Each piece gets converted into mathematical "fingerprints"
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Everything gets stored securely in our cloud database
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Your AI assistant becomes instantly smarter at finding
                      products
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  ⏱️ Time Estimate:
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>
                    {productCounts[selectedStore.id] || 0} products
                  </strong>{" "}
                  will take approximately
                  <strong>
                    {" "}
                    {Math.ceil((productCounts[selectedStore.id] || 0) / 100)}-
                    {Math.ceil((productCounts[selectedStore.id] || 0) / 50)}{" "}
                    minutes
                  </strong>{" "}
                  to process. You'll receive a notification when it's complete!
                </p>
              </div>

              <button
                onClick={handleCreateDatabase}
                disabled={isCreatingEmbeddings}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isCreatingEmbeddings ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Database...
                  </>
                ) : (
                  <>
                    <FiDatabase className="w-5 h-5 mr-2" />
                    Create Database
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      {/* Test Search Section - When Database Exists */}
      {selectedStore &&
        embeddingStats &&
        embeddingStats.points_count > 0 &&
        !showSearchResults && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiSearch className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Test Your Smart Search
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try searching for products using natural language to see how
                customers will find your products. Test different types of
                queries to see the power of your AI-powered database!
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                  💡 Try these example searches:
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• "gifts for kids under $30"</li>
                  <li>• "comfortable shoes for running"</li>
                  <li>• "electronics on sale"</li>
                  <li>• "something for my mom's birthday"</li>
                  <li>• "trendy fashion items"</li>
                </ul>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Query
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'red shoes', 'electronics under $100', 'gift for kids'"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Results
                </label>
                <select
                  value={searchLimit}
                  onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={5}>5 results</option>
                  <option value={10}>10 results</option>
                  <option value={15}>15 results</option>
                  <option value={20}>20 results</option>
                </select>
              </div>

              <button
                onClick={handleSearchProducts}
                disabled={!searchQuery.trim() || isSearching}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="w-5 h-5 mr-2" />
                    Search Products
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      {/* Top Products Preview (6 items) when DB exists */}
      {selectedStore && embeddingStats && embeddingStats.points_count > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isFetchingTopProducts ? (
              <p className="text-gray-500 col-span-full">Loading products…</p>
            ) : (Array.isArray(topProducts[selectedStore.id])
                ? topProducts[selectedStore.id]
                : []
              ).length === 0 ? (
              <p className="text-gray-500 col-span-full">
                No products available.
              </p>
            ) : (
              (topProducts[selectedStore.id] || [])
                .slice(0, 6)
                .map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="w-full h-40 bg-white dark:bg-gray-600 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                      <img
                        src={
                          product.metadata?.images
                            ? (() => {
                                try {
                                  return JSON.parse(product.metadata.images)[0]
                                    ?.url;
                                } catch {
                                  return "/placeholder-image.jpg";
                                }
                              })()
                            : "/placeholder-image.jpg"
                        }
                        alt={product.title}
                        className="w-full h-72 object-cover rounded-md mb-3"
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {product.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.price} {product.currency}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Results
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Found {searchResults.length} products matching "{searchQuery}"
              </p>
            </div>
            <button
              onClick={() => setShowSearchResults(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image Placeholder */}
                <div className="w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-600">
                  <img
                    src={
                      result.metadata?.images
                        ? (() => {
                            try {
                              return JSON.parse(result.metadata.images)[0]?.url;
                            } catch {
                              return "/placeholder-image.jpg";
                            }
                          })()
                        : "/placeholder-image.jpg"
                    }
                    alt={result.title}
                    className="w-full h-72 object-cover rounded-md mb-3"
                  />
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-12">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Match: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.price}
                    </span>
                    {result.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          {result.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>🏪 Store: {result.metadata?.store_id || "N/A"}</div>
                      <div>
                        📦 Type: {result.metadata?.product_type || "N/A"}
                      </div>
                      <div>🏷️ Vendor: {result.metadata?.vendor || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Search Results */}
      {showSearchResults && searchResults.length === 0 && !isSearching && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <FiSearch className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No products found matching "{searchQuery}". Try a different search
            term.
          </p>
          <button
            onClick={() => setShowSearchResults(false)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Another Search
          </button>
        </div>
      )}

      {/* Empty State - No Stores */}
      {stores.length === 0 && !isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FiShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Stores Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to connect your Shopify stores first to create product
            databases.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Next Steps:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>
                • Go to the <strong>Stores</strong> section in the left menu
              </li>
              <li>• Connect your Shopify stores</li>
              <li>• Return here to create product databases</li>
            </ul>
          </div>
        </div>
      )}

      {/* Loading States */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading Stores
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we fetch your stores...
          </p>
        </div>
      )}

      {selectedStore && embeddingsLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600 dark:text-gray-300">
              Loading database status...
            </span>
          </div>
        </div>
      )}

      {/* EXPLANATORY SECTIONS - Below the functional parts */}

      {/* What is Product Database - Comprehensive Explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiDatabase className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          What is a Product Database?
        </h3>
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            Think of your Product Database as a super-smart library of all your
            products. Instead of customers having to browse through pages and
            pages of products, they can simply ask questions like "Show me red
            shoes under $50" or "I need a gift for my 10-year-old niece" and get
            exactly what they're looking for instantly.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              🎯 Real Example:
            </h4>
            <p className="text-sm">
              <strong>Customer asks:</strong> "I need comfortable running shoes
              for my daily jog"
              <br />
              <strong>Your AI finds:</strong> Nike Air Max, Adidas Boost, and
              other running shoes with comfort features - even if the customer
              didn't know the exact brand names!
            </p>
          </div>
        </div>
      </div>

      {/* How RAG Works - Step by Step Explanation */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiInfo className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
          How Does This Magic Work? (RAG Technology)
        </h3>
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            We use advanced AI technology called{" "}
            <strong>RAG (Retrieval-Augmented Generation)</strong> to make your
            products incredibly easy to find. Here's what happens behind the
            scenes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                  1
                </span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                📚 Collect All Data
              </h4>
              <p className="text-xs">
                We gather all your product information - names, descriptions,
                prices, categories, availability, and images from your shopify
                store. Nothing is left behind!
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                  2
                </span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                ✂️ Smart Chunking
              </h4>
              <p className="text-xs">
                We break down all this information into smaller, meaningful
                pieces. Think of it like cutting a book into chapters - each
                piece contains related information that makes sense together.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                  3
                </span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                🧠 Create Smart Maps
              </h4>
              <p className="text-xs">
                We convert each piece into what we call "embeddings" - think of
                them as smart fingerprints that capture the meaning and context
                of your products.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              ⚡ The Result:
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              When a customer asks a question, our AI instantly finds the most
              relevant products by matching their question with these smart
              fingerprints. It's like having a super-fast, super-accurate
              product search that understands what people are really looking
              for!
            </p>
          </div>
        </div>
      </div>

      {/* What Happens in the Backend */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
        <div className="flex items-start">
          <FiPlay className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
              What Happens When You Create a Database:
            </h4>
            <div className="space-y-3 text-sm text-indigo-700 dark:text-indigo-300">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h5 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                  🔄 Step 1: Data Collection
                </h5>
                <p className="text-xs">
                  Our system connects to your Shopify store and downloads all
                  your product information - titles, descriptions, prices,
                  categories, tags, and metadata. This happens securely and only
                  takes a few minutes.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h5 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                  🔍 Step 2: Smart Processing
                </h5>
                <p className="text-xs">
                  We analyze each product and break it down into searchable
                  pieces. For example, a "Nike Air Max Running Shoe" gets
                  processed into pieces like "running shoes", "comfortable",
                  "athletic", "Nike brand", etc.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h5 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                  🧠 Step 3: AI Transformation
                </h5>
                <p className="text-xs">
                  Each piece gets converted into what we call "embeddings" -
                  mathematical representations that capture the meaning and
                  context. This allows our AI to understand relationships
                  between products and customer queries.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h5 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                  💾 Step 4: Secure Storage
                </h5>
                <p className="text-xs">
                  All this processed information is stored securely in our cloud
                  database. It's encrypted, backed up, and optimized for
                  lightning-fast searches. Your original product data stays safe
                  in your Shopify store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div className="flex items-start">
          <FiInfo className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
              Getting Started:
            </h4>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Select your store from the options above</li>
              <li>• Click "Create Database" to process all your products</li>
              <li>• Wait a few minutes for the AI to analyze everything</li>
              <li>
                • Test the search functionality to see the magic in action
              </li>
              <li>
                • Your AI assistant will automatically use this database to help
                customers
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiCheckCircle className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
          Why This Makes Your Business Better
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-medium text-emerald-900 dark:text-emerald-200 mb-2">
              🚀 For Your Customers:
            </h4>
            <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
              <li>• Find products instantly with natural language</li>
              <li>• No need to know exact product names</li>
              <li>• Get personalized recommendations</li>
              <li>• Better shopping experience = more sales</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-medium text-emerald-900 dark:text-emerald-200 mb-2">
              💼 For Your Business:
            </h4>
            <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
              <li>• Reduce customer support questions</li>
              <li>• Increase conversion rates</li>
              <li>• Sell products customers didn't know you had</li>
              <li>• 24/7 AI-powered product assistance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseTab;
