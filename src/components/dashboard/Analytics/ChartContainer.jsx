import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

// ✅ Custom tooltip for Revenue Analytics
const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload;
  const { values } = dataPoint;

  const formatCurrency = (val) =>
    val?.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4 min-w-[220px]">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {label}
      </p>

      {/* Cart Value */}
      <div className="mb-3">
        <p className="font-medium text-blue-600 dark:text-blue-400">
          Cart Value: {formatCurrency(values.cart_value)}
        </p>
        <div className="ml-3 text-xs text-gray-700 dark:text-gray-300">
          <p>Subtotal: {formatCurrency(values.cart_subtotal)}</p>
        </div>
      </div>

      {/* Checkout Value */}
      {/* <div className="mb-3">
        <p className="font-medium text-yellow-600 dark:text-yellow-400">
          Checkout Value: {formatCurrency(values.checkout_value)}
        </p>
        <div className="ml-3 text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
          <p>Subtotal: {formatCurrency(values.checkout_subtotal)}</p>
          <p>Tax: {formatCurrency(values.checkout_tax)}</p>
          <p>Shipping: {formatCurrency(values.checkout_shipping)}</p>
        </div>
      </div> */}

      {/* Order Value */}
      <div>
        <p className="font-medium text-green-600 dark:text-green-400">
          Order Value: {formatCurrency(values.order_value)}
        </p>
        <div className="ml-3 text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
          <p>Subtotal: {formatCurrency(values.order_subtotal)}</p>
          <p>Tax: {formatCurrency(values.order_tax)}</p>
          <p>Shipping: {formatCurrency(values.order_shipping)}</p>
        </div>
      </div>
    </div>
  );
};

const ChartContainer = ({ data }) => {
  console.log('chart data received:', data);
  if (!data?.graph_data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Daily Trends
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            No chart data available
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return `${value.toLocaleString()}`;
  };

  const formatTooltipValue = (value) => {
    return typeof value === 'number' && value > 0 ? formatCurrency(value) : value;
  };

  return (
    <div className="space-y-8">
      {/* Daily Trends Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Daily Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.graph_data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <RechartsTooltip
                formatter={formatTooltipValue}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="engaged_conversations"
                name="Engaged Customers"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Chart (Modified Tooltip) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Revenue Analytics
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.graph_data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <RechartsTooltip content={<CustomRevenueTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="values.cart_value"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                name="Cart Value"
              />
              {/* <Line
                type="monotone"
                dataKey="values.checkout_value"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Checkout Value"
              /> */}
              <Line
                type="monotone"
                dataKey="values.order_value"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Order Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Events Over Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.graph_data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <RechartsTooltip
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="events.cart_creates"
                stackId="a"
                fill="#6366f1"
                name="Cart Creates"
                radius={[2, 2, 0, 0]}
              />
              {/* <Bar
                dataKey="events.cart_updates"
                stackId="a"
                fill="#8b5cf6"
                name="Cart Updates"
                radius={[2, 2, 0, 0]}
              /> */}
              {/* <Bar
                dataKey="events.checkout_creates"
                stackId="a"
                fill="#f59e0b"
                name="Checkout Creates"
                radius={[2, 2, 0, 0]}
              /> */}
              <Bar
                dataKey="events.order_creates"
                stackId="a"
                fill="#10b981"
                name="Order Creates"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;
