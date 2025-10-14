import { ShoppingBag } from 'lucide-react';

const ProductsTable = ({ data }) => {
  // New API shape provides arrays: product_metrics, top_by_value, top_by_quantity
  // Also support old overview shape under data.products.top_products
  const products =
    data?.product_metrics ||
    data?.top_by_value ||
    data?.top_by_quantity ||
    data?.products?.top_products ||
    [];

  console.log("ProductsTable received data:", data);

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <ShoppingBag className="w-5 h-5 mr-2" />
          Top Products
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">No product data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ShoppingBag className="w-5 h-5 mr-2" />
          Top Products
        </h3>
        {data?.total_products_added !== undefined && data?.unique_products !== undefined && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Added: {data.total_products_added || 0} | Unique: {data.unique_products || 0}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Product
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Quantity
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Total Value
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Avg Price
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.product_id || index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {product.product_id}
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  {product.total_quantity || 0}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  ₨{parseFloat(product.total_value || 0).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  ₨{product.avg_price ? parseFloat(product.avg_price).toLocaleString() : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
