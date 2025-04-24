import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const QuarterlyTrendsChart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-4 text-gray-500">No quarterly data available.</div>;
  }

  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <h2 className="font-semibold text-lg mb-2">Quarterly Trends</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="quarter" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="sales" fill="#2563eb" name="Sales" />
          <Bar dataKey="np" fill="#10b981" name="Net Profit" />
          <Bar dataKey="opm" fill="#f59e42" name="OPM" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuarterlyTrendsChart;
