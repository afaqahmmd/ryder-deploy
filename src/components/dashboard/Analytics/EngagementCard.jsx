import {
  MessageCircle,
  UserStar,
  UserRound,
  Activity,
  Users,
  User,
} from "lucide-react";

const EngagementCard = ({ data }) => {
  const stats = [];
  console.log("data in engagement card", data);
  if (data.customer_comparison) {
    stats.push(
      {
        icon: UserStar,
        label: "Total Engaged Customers",
        value: data.customer_comparison?.engaged_customers || 0,
        color: "blue",
      },
      {
        icon: UserRound,
        label: "Total Customers",
        value: data.customer_comparison?.total_customers || 0,
        color: "green",
      },
      {
        icon: Activity,
        label: "Engagement Rate",
        value: data.customer_comparison?.engagement_rate ? `${data.customer_comparison?.engagement_rate}%` : 0,
        color: "orange",
      }
    );
  }

  if (data.total_engaged_conversations !== undefined) {
    stats.push({
      icon: Users,
      label: "Engaged Conversations",
      value: data.total_engaged_conversations || 0,
      color: "indigo",
    });
  }

  return (
    <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
        <User className="w-5 h-5 mr-2" />
        Customer comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                  stat.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : stat.color === "purple"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : stat.color === "green"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : stat.color === "orange"
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngagementCard;
