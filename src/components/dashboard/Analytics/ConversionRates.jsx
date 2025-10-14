import { Target, Sparkles, Trophy, TrendingUp } from 'lucide-react';

const ConversionRates = ({ data }) => {
  if (!data.conversion_rates) {
    return null;
  }

  const rates = data.conversion_rates;

  const conversionMetrics = [
    {
      label: 'Cart to Checkout',
      value: rates.cart_to_checkout || 0,
      icon: Target,
      color: 'blue'
    },
    {
      label: 'Checkout to Order',
      value: rates.checkout_to_order || 0,
      icon: Sparkles,
      color: 'purple'
    },
    {
      label: 'Overall Conversion',
      value: rates.overall_conversion || 0,
      icon: Trophy,
      color: 'green'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Conversion Rates
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {conversionMetrics.map((metric, index) => (
          <div
            key={index}
            className="text-center"
          >
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
              metric.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              metric.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
              <metric.icon className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {metric.value}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionRates;
