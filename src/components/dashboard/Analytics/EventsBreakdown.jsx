import { Plus, RefreshCw, CheckCircle, Package, ShoppingCart } from 'lucide-react';

const EventsBreakdown = ({ data }) => {
  if (!data.events && !data.event_breakdown) {
    return null;
  }

  const events = data.events || {};

  const eventTypes = [
    {
      key: 'cart_creates',
      label: 'Cart Creates',
      icon: Plus,
      color: 'blue'
    },
    {
      key: 'cart_updates',
      label: 'Cart Updates',
      icon: RefreshCw,
      color: 'purple'
    },
    {
      key: 'checkout_creates',
      label: 'Checkouts',
      icon: CheckCircle,
      color: 'green'
    },
    {
      key: 'order_creates',
      label: 'Orders',
      icon: Package,
      color: 'orange'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2" />
        Events Breakdown
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {eventTypes.map((event) => (
          <div
            key={event.key}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-lg ${
              event.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              event.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              event.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
            }`}>
              <event.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {events[event.key] || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {event.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsBreakdown;
