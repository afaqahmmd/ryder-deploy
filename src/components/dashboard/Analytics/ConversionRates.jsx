import { Target, Sparkles, Trophy, TrendingUp } from "lucide-react";
import { useState } from "react";

// ✅ Reusable tooltip component
const Tooltip = ({ children, text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute max-w-sm left-1/2 -translate-x-1/2 -top-10 z-20 bg-gray-900 text-white text-xs px-3 py-1 rounded-md shadow-md whitespace-nowrap">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const ConversionRates = ({ data }) => {
  if (!data.conversion_rates) {
    return null;
  }

  const rates = data.summary;
  const currency = data.currency;

  const formatCurrency = (amount) => {
    return `${currency === "USD" ? "$" : currency} ${amount.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const conversionMetrics = [
    {
      label: "Total Cart Value",
      value: formatCurrency(rates.total_cart_value || 0),
      icon: Target,
      color: "blue",
      tooltip: "Cart Subtotal: " + currency + rates.cart_subtotal,
    },
    {
      label: "Total Checkout Value",
      value: formatCurrency(rates.total_checkout_value || 0),
      icon: Sparkles,
      color: "purple",
      tooltip:
        "Checkout subtotal: " +
        currency +
        rates.checkout_subtotal +
        ", Checkout tax: " +
        currency +
        rates.checkout_tax +
        ", Shipping charges: " +
        currency +
        rates.checkout_shipping,
    },
    {
      label: "Total Order Value",
      value: formatCurrency(rates.total_order_value || 0),
      icon: Trophy,
      color: "green",
      tooltip:
        "Order subtotal: " +
        currency +
        rates.order_subtotal +
        ", Order tax: " +
        currency +
        rates.order_tax +
        ", Order charges: " +
        currency +
        rates.order_shipping,
    },
    {
      label: "Number of Orders",
      value: rates.number_of_orders || 0,
      icon: Trophy,
      color: "orange",
      tooltip: "Count of all completed orders",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {conversionMetrics.map((metric, index) => (
          <Tooltip key={index} text={metric.tooltip}>
            <div className="text-center cursor-pointer transition-transform hover:scale-105">
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
                  metric.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : metric.color === "purple"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : metric.color === "orange"
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}
              >
                <metric.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metric.label}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default ConversionRates;
