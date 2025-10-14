import { Users } from "lucide-react";

const EngagedUsers = ({ users = [], recentActivity = [] }) => {
  if (!users || users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Engaged Users
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            No engaged user data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Engaged Users
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {users.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Customer
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Messages
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Webhook Events
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Cart Value
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Order Value
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={u.customer_id || idx}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {u.customer_name || "Customer"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {u.customer_id}
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  {u.message_count || 0}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  {u.webhook_events_count || 0}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  ₨{parseFloat(u.total_cart_value || 0).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  ₨{parseFloat(u.total_order_value || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Activity Table */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        {!recentActivity || recentActivity.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">
            No recent activity
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Event
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Customer
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Total Price
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Currency
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((a, idx) => (
                  <tr
                    key={`${a.event_type}-${a.created_at}-${idx}`}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {a.event_type}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {a.customer_id}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                      ₨{parseFloat(a.total_price || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {a.currency}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagedUsers;
