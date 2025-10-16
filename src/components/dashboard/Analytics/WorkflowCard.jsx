import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, Cell } from "recharts";
import { CircleUserRound } from "lucide-react";

const COLORS = ["#3072C0", "#4BA3F5", "#7A86FA", "#A0C4FF"]; // customize as you like

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

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full md:h-80 h-[500px] bg-white dark:bg-[#0F1B29] rounded-2xl border border-1 p-6">
        {/* Labels + Counts (Right 60%) */}
        <div className="w-full md:w-[60%] flex flex-col justify-center gap-4">
          {data2.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
              <span
                className="text-lg font-semibold"
                style={{ color: COLORS[i % COLORS.length] }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Funnel Chart (Left 40%) */}
        <div className="w-full md:w-[40%] h-full flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip
              formatter={(value, _name, props) => [
                `${value}`,
                props?.payload?.name || "Stage",
              ]}
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.9)", // dark gray with slight transparency
                border: "1px solid #3072C0", // theme blue accent
                borderRadius: "8px",
                color: "#F8FAFC", // off-white text
              }}
              itemStyle={{
                color: "#E2E8F0",
                fontWeight: 500,
              }}
              labelStyle={{
                color: "#93C5FD",
                fontWeight: 600,
              }}
            />
              <Funnel
                dataKey="value"
                data={data2}
                isAnimationActive
                stroke="#1E293B"
              >
                {data2.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
