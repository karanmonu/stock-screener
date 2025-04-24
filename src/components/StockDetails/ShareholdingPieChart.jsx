import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e42", "#ef4444"];

const ShareholdingPieChart = ({ data }) => {
  // data: [{ name: 'FII', value: 24.1 }, ...]
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-4 text-gray-500">No shareholding data available.</div>;
  }
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="font-semibold text-lg mb-2">Shareholding Pattern</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ShareholdingPieChart;
