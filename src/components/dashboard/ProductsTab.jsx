import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiShoppingBag } from "react-icons/fi";
import {
  fetchStores,
  fetchProductCounts,
  fetchProductsList,
} from "../../store/stores/storesThunk";
import { useTheme } from "../../contexts/ThemeContext";

const ProductsTab = ({ setShowProductsSyncModal }) => {
  const dispatch = useDispatch();

  const {
    stores,
    productCounts,
    isLoading,
    isFetchingProductCounts,
    // topProducts,
    // isFetchingTopProducts,
    error,
  } = useSelector((state) => state.stores);

  // Selected store for products view
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const { isDark } = useTheme();

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [products, setProducts] = useState([]);
  const totalPages = Math.ceil(productCounts[selectedStoreId] / pageSize);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  useEffect(() => {
    if (!selectedStoreId) return;
    const loadProducts = async () => {
      setFetchingProducts(true);

      const res = await dispatch(
        fetchProductsList({
          storeId: selectedStoreId,
          page,
          page_size: pageSize,
          query: searchProductQuery.trim(),
        })
      );
      setFetchingProducts(false);
      console.log("ressss products list:", res);
      setProducts(res.payload.products);
    };
    loadProducts();
  }, [selectedStoreId, dispatch, page, pageSize]);

  const fetchProductsWithQuery = async () => {
    try {
      setFetchingProducts(true);

      const res = await dispatch(
        fetchProductsList({
          storeId: selectedStoreId,
          page,
          page_size: pageSize,
          query: searchProductQuery,
        })
      );

      setProducts(res.payload.products);
    } catch (error) {
      console.error("Error fetching products with query:", error);
    } finally {
      setFetchingProducts(false);
    }
  };

  // Load data
  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchProductCounts());
  }, [dispatch]);

  // Total products
  const totalProducts = Object.values(productCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Products & Content Scanning
          </h2>
          <button
            onClick={() => setShowProductsSyncModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center text-sm"
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 
                18.477 5.754 18 7.5 18s3.332.477 4.5 
                1.253m0-13C13.168 5.477 14.754 5 16.5 
                5c1.746 0 3.332.477 4.5 
                1.253v13C19.832 18.477 18.246 18 
                16.5 18c-1.746 0-3.332.477-4.5 
                1.253"
              />
            </svg>
            Show Tutorial
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading / Empty */}
        {isLoading && stores.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading your stores...
            </p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Stores Connected
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect your Shopify store to view product information.
            </p>
          </div>
        ) : (
          <>
            {/* Product Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                    Product Summary
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Total products across all stores:{" "}
                    <span className="font-bold">{totalProducts}</span>
                  </p>
                </div>
                <FiShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Store cards */}
            <div className="grid grid-cols-1  gap-4 sm:gap-6 mb-8">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border overflow-hidden transition-all cursor-pointer ${
                    selectedStoreId === store.id
                      ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/40 shadow"
                      : "border-gray-200 dark:border-gray-700 hover:shadow-lg"
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {store.store_name}
                      </h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          store.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {store.status}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-lg text-gray-900 dark:text-white">
                          Domain
                        </p>
                        <p className="font-medium text-gray-400">
                          {store.domain}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-white">
                          Product Count
                        </p>
                        <div className="flex items-center">
                          {isFetchingProductCounts ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <p className="font-bold text-xl text-blue-600">
                              {productCounts[store.id] || 0}
                            </p>
                          )}
                          <span className="ml-2 text-sm text-gray-400">
                            products
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Created:{" "}
                          {new Date(store.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Updated:{" "}
                          {new Date(store.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <button
                          className="mt-4 w-fit bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                          onClick={() =>
                            setSelectedStoreId(
                              selectedStoreId === store.id ? null : store.id
                            )
                          }
                        >
                          {selectedStoreId === store.id
                            ? "Close"
                            : "View Products"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Products for this store when selected */}
                  {selectedStoreId === store.id && (
                    <div className="px-4 sm:px-6 pb-6">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Products List
                        </h3>
                        <div className="flex items-center justify-center flex-1 max-w-md gap-2">
                          <input
                            type="text"
                            value={searchProductQuery}
                            onChange={(e) =>
                              setSearchProductQuery(e.target.value)
                            }
                            placeholder="Search products"
                            className="p-4 py-2 border rounded-md w-full"
                          />
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                            onClick={fetchProductsWithQuery}
                          >
                            Search
                          </button>
                        </div>

                        <div className="flex items-center gap-3 ">
                          <p className={`${isDark ? "text-white":""}`}>Page Size: </p>
                          <select
                            className="p-4 py-2 border rounded-md"
                            onChange={(e) =>
                              setPageSize(Number(e.target.value))
                            }
                          >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                        </div>
                      </div>

                      <div className="w-full max-w-6xl mx-auto py-6">
                        {fetchingProducts ? (
                          <div className="flex w-full justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {/* Product Grid */}
                            {products.length > 0 ? (
                              products.map((product) => (
                                <div
                                  key={product.id}
                                  className="bg-white shadow-md rounded-2xl overflow-hidden border hover:shadow-lg transition"
                                >
                                  <img
                                    src={product.primary_image.src}
                                    alt={product.title}
                                    className="h-48 w-full object-contain"
                                  />
                                  <div className="p-4">
                                    <h2 className="text-lg font-semibold">
                                      {product.title}
                                    </h2>

                                    <p className="mt-2 font-bold text-blue-600">
                                      ${product.price_range}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex w-full gap-3 flex-col items-start">
                                <p>No products found... </p>
                                <p>Try reconnecting product database</p>
                                <button className="w-fit bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                                  Connect Database
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-2 mt-6">
                          <button
                            className={`
                                  ${isDark ? "bg-white " : ""}
                              px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50`}
                            disabled={page === 1}
                            onClick={() => setPage((prev) => prev - 1)}
                          >
                            Previous
                          </button>

                          {/* Pages with dots */}
                          {(() => {
                            const pages = [];

                            if (totalPages <= 5) {
                              // Show all pages
                              for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                              }
                            } else {
                              if (page <= 3) {
                                // Near the start
                                pages.push(1, 2, 3, "...", totalPages);
                              } else if (page >= totalPages - 2) {
                                // Near the end
                                pages.push(
                                  1,
                                  "...",
                                  totalPages - 2,
                                  totalPages - 1,
                                  totalPages
                                );
                              } else {
                                // In the middle
                                pages.push(
                                  1,
                                  "...",
                                  page - 1,
                                  page,
                                  page + 1,
                                  "...",
                                  totalPages
                                );
                              }
                            }

                            return pages.map((p, idx) =>
                              p === "..." ? (
                                <span key={`dots-${idx}`} className="px-3 py-2">
                                  ...
                                </span>
                              ) : (
                                <button
                                  key={p}
                                  className={`px-4 py-2 border text-white rounded-md ${
                                    p === page
                                      ? isDark
                                        ? "bg-blue-600 text-white"
                                        : "bg-blue-600 text-white"
                                      : ""
                                  }
                                 
                                  `}
                                  onClick={() => setPage(p)}
                                >
                                  {p}
                                </button>
                              )
                            );
                          })()}

                          <button
                            className={`
                                  ${isDark ? "bg-white " : ""}
                              px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50`}
                            disabled={page === totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsTab;
