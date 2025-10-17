import { Target, Sparkles, Trophy, TrendingUp } from "lucide-react";
import { useState } from "react";

// ✅ Reusable Tooltip component — supports multi-line key/value display
const Tooltip = ({ children, text, currency }) => {
  const [visible, setVisible] = useState(false);

  const formatCurrency = (val) => {
    if (typeof val === "number") {
      return `${currency === "USD" ? "$" : currency} ${val.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    }
    return val;
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && text && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-28 z-20 bg-gray-900 text-white text-xs px-3 py-2 rounded-md shadow-md whitespace-nowrap transition-all duration-200"
          style={{ minWidth: "180px" }}
        >
          {typeof text === "object" ? (
            <div className="flex flex-col text-left space-y-1">
              {Object.entries(text).map(([key, value], i) => (
                <div
                  key={i}
                  className="flex justify-between gap-3 border-b border-gray-700 last:border-none pb-1"
                >
                  <span className="text-gray-300">{key}</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span>{text}</span>
          )}
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const ConversionRates = ({ data }) => {
  if (!data.conversion_rates) return null;

  const rates = data.summary;
  const currency = data.currency;

  const formatCurrency = (amount) =>
    `${currency === "USD" ? "$" : currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const conversionMetrics = [
    {
      label: "Total Cart Value",
      value: formatCurrency(rates.total_cart_value || 0),
      icon: Target,
      color: "blue",
      tooltip: null, 
    },
    // {
    //   label: "Total Checkout Value",
    //   value: formatCurrency(rates.total_checkout_value || 0),
    //   icon: Sparkles,
    //   color: "purple",
    //   tooltip: {
    //     "Checkout Subtotal": rates.checkout_subtotal,
    //     "Checkout Tax": rates.checkout_tax,
    //     "Shipping Charges": rates.checkout_shipping,
    //   },
    // },
    {
      label: "Total Order Value",
      value: formatCurrency(rates.total_order_value || 0),
      icon: Trophy,
      color: "green",
      tooltip: {
        "Order Subtotal": rates.order_subtotal,
        "Order Tax": rates.order_tax,
        "Order Shipping": rates.order_shipping,
      },
    },
    {
      label: "Number of Orders",
      value: rates.number_of_orders || 0,
      icon: Trophy,
      color: "orange",
      tooltip: null, 
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conversionMetrics.map((metric, index) => {
          const Card = (
            <div
              key={index}
              className="text-center cursor-pointer transition-transform hover:scale-105"
            >
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
          );

          return metric.tooltip ? (
            <Tooltip key={index} text={metric.tooltip} currency={currency}>
              {Card}
            </Tooltip>
          ) : (
            Card
          );
        })}
      </div>
    </div>
  );
};

export default ConversionRates;
