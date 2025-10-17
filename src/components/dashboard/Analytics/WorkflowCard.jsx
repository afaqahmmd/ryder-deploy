import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Tooltip,
  Cell,
} from "recharts";
import { CircleUserRound } from "lucide-react";

const COLORS = ["#3072C0", "#4BA3F5", "#7A86FA", "#7A86FA"]; // customize as you like

export default function WorkflowFunnel({ data }) {
  const data2 = [
    { name: "Engaged Customers", value: data.workflow.engaged_customers },
    { name: "Cart Creation", value: data.workflow.cart_creation },
    { name: "Checkout", value: data.workflow.checkout },
    { name: "Order Completion", value: data.workflow.order_completion },
  ];

  return (
    <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <CircleUserRound color="blue" className="w-5 h-5 mr-2" />
        Customer Workflow
      </h3>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full  bg-white dark:bg-[#0F1B29] rounded-2xl border border-1 p-6">
        {/* Labels + Counts (Right 60%) */}
        <div className="w-full flex flex-col justify-center gap-4">
          <div className="relative border-l border-gray-300 dark:border-gray-700 ml-4">
            {data2.map((item, i) => (
              <div key={i} className="mb-6 ml-4">
                {/* Timeline dot */}
                <div
                  className="absolute -left-2.5 w-4 h-4 mt-4 rounded-full border-2 border-white dark:border-gray-900"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></div>

                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span
                    className="text-xl rounded-full bg-gray-100 h-10 w-10 flex items-center justify-center font-semibold mt-1 sm:mt-0"
                    style={{ color: COLORS[i % COLORS.length] }}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
