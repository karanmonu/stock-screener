import React from "react";
import Tooltip from "./Tooltip";
import CollapsibleSection from "./CollapsibleSection";

const metrics = [
  {
    label: "ROE/ROCE",
    value: (data) => `${data.roe}% / ${data.roce}%`,
    tooltip: "Return on Equity / Return on Capital Employed"
  },
  {
    label: "PE",
    value: (data) => data.pe,
    tooltip: "Price to Earnings Ratio"
  },
  {
    label: "PS",
    value: (data) => data.ps,
    tooltip: "Price to Sales Ratio"
  },
  {
    label: "OPM",
    value: (data) => `${data.opm}%`,
    tooltip: "Operating Profit Margin"
  },
  {
    label: "PEG",
    value: (data) => data.peg,
    tooltip: "Price/Earnings to Growth Ratio"
  },
  {
    label: "Mkt Cap/Sales",
    value: (data) => `${data.marketCap} Cr / ${data.sales} Cr`,
    tooltip: "Market Cap to Sales Ratio (in Cr)"
  },
  {
    label: "Debt/Equity",
    value: (data) => data.debtEquity,
    tooltip: "Debt to Equity Ratio"
  }
];

const holdingMetrics = [
  { label: "FII", key: "fii", tooltip: "Foreign Institutional Investors (%)" },
  { label: "DII", key: "dii", tooltip: "Domestic Institutional Investors (%)" },
  { label: "Promoter", key: "promoter", tooltip: "Promoter Holding (%)" },
  { label: "Pledge %", key: "pledge", tooltip: "Promoter Pledge (%)" }
];

const otherMetrics = [
  { label: "Capex", key: "capex", tooltip: "Capital Expenditure (Cr)" },
  { label: "Order Book", key: "orderBook", tooltip: "Order Book Value (Cr)" },
  { label: "Exports", key: "exports", tooltip: "Exports (Cr)" },
  { label: "Pipeline", key: "pipeline", tooltip: "Future Pipeline (Cr)" }
];

// Red flag rules
const redFlagRules = [
  {
    key: "debtEquity",
    check: (m) => m.value > 1.5,
    desc: "High Debt/Equity (>1.5)"
  },
  {
    key: "pledge",
    check: (m) => m.value > 10,
    desc: "High Promoter Pledge (>10%)"
  },
  {
    key: "roe",
    check: (m) => m.value < 10,
    desc: "Low ROE (<10%)"
  },
  {
    key: "promoter",
    check: (m) => m.value < 40,
    desc: "Low Promoter Holding (<40%)"
  },
  {
    key: "profitGrowth",
    check: (m) => m.value < 0,
    desc: "Negative Profit Growth"
  },
  {
    key: "opm",
    check: (m) => m.value < 10,
    desc: "Low OPM (<10%)"
  }
];

function getRedFlags(metrics) {
  // metrics is an object with keys matching rule keys
  return redFlagRules.filter((rule) => {
    const m = metrics[rule.key];
    return m && rule.check(m);
  });
}

// Helper to determine arrow and color for metrics
function getMetricIndicator(label, value, data) {
  // Define simple thresholds for demo purposes
  // In production, use domain knowledge for thresholds
  let v = typeof value === "string" ? parseFloat(value) : value;
  if (label === "ROE/ROCE") {
    // Use ROE for indicator
    v = parseFloat(data.roe);
    if (v >= 15) return { arrow: "", color: "text-green-600", desc: "Good" };
    if (v >= 10) return { arrow: "", color: "text-yellow-500", desc: "Average" };
    return { arrow: "", color: "text-red-600", desc: "Poor" };
  }
  if (label === "PE" || label === "PEG") {
    // Lower is better, but not too low
    if (v < 10) return { arrow: "", color: "text-yellow-500", desc: "Low" };
    if (v <= 25) return { arrow: "", color: "text-green-600", desc: "Healthy" };
    return { arrow: "", color: "text-red-600", desc: "High" };
  }
  if (label === "PS") {
    if (v < 1) return { arrow: "", color: "text-green-600", desc: "Attractive" };
    if (v < 3) return { arrow: "", color: "text-yellow-500", desc: "Average" };
    return { arrow: "", color: "text-red-600", desc: "Expensive" };
  }
  if (label === "OPM") {
    if (v >= 20) return { arrow: "", color: "text-green-600", desc: "Strong" };
    if (v >= 10) return { arrow: "", color: "text-yellow-500", desc: "OK" };
    return { arrow: "", color: "text-red-600", desc: "Weak" };
  }
  if (label === "Debt/Equity") {
    if (v < 0.5) return { arrow: "", color: "text-green-600", desc: "Low" };
    if (v < 1) return { arrow: "", color: "text-yellow-500", desc: "Moderate" };
    return { arrow: "", color: "text-red-600", desc: "High" };
  }
  // Default: no indicator
  return { arrow: "", color: "", desc: "" };
}

const FinancialMetricsPanel = ({ data }) => {
  // metrics is an ARRAY for display, not an object
  const metricsList = metrics;
  // Prepare metrics for red flag logic (object)
  const metricsObj = {
    debtEquity: { value: data.debtEquity },
    pledge: { value: data.pledge },
    roe: { value: data.roe },
    promoter: { value: data.promoter },
    profitGrowth: { value: data.profitGrowth },
    opm: { value: data.opm },
    // ...add more as needed
  };
  const redFlags = getRedFlags(metricsObj);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {redFlags.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="font-bold text-red-700 mb-1 flex items-center gap-2">
            <span>⚠️ Red Flags Detected</span>
            {redFlags.length >= 3 && (
              <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs ml-2">
                Investment Not Recommended
              </span>
            )}
          </div>
          <ul className="text-red-800 text-sm list-disc pl-6">
            {redFlags.map((rule) => (
              <li key={rule.key}>{rule.desc}</li>
            ))}
          </ul>
        </div>
      )}
      <CollapsibleSection title="Key Ratios" defaultOpen>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {metricsList.map((m) => {
            const val = m.value(data);
            const indicator = getMetricIndicator(m.label, val, data);
            return (
              <div key={m.label} className="flex items-center gap-1">
                <Tooltip text={m.tooltip}>
                  <span className="font-medium text-gray-700">{m.label}:</span>
                </Tooltip>
                <span
                  className={`text-gray-900 flex items-center gap-1 ${
                    redFlags.find((r) => r.key === m.label)
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {val}
                  {indicator.arrow && (
                    <span
                      className={`ml-1 ${indicator.color} text-base`}
                      title={indicator.desc}
                    >
                      {indicator.arrow}
                    </span>
                  )}
                  {redFlags.find((r) => r.key === m.label) && (
                    <span className="text-red-600" title="Red Flag">
                      ⚠️
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Shareholding Pattern">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {holdingMetrics.map((m) => (
            <div key={m.label} className="flex items-center gap-1">
              <Tooltip text={m.tooltip}>
                <span className="font-medium text-gray-700">{m.label}:</span>
              </Tooltip>
              <span className="text-gray-900">{data[m.key]}%</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Other Metrics">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {otherMetrics.map((m) => (
            <div key={m.label} className="flex items-center gap-1">
              <Tooltip text={m.tooltip}>
                <span className="font-medium text-gray-700">{m.label}:</span>
              </Tooltip>
              <span className="text-gray-900">₹{data[m.key]} Cr</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Quarterly YoY Performance">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-1 text-left font-medium text-gray-700">
                  Quarter
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-700">
                  Sales YoY
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-700">
                  NP YoY
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-700">
                  OPM YoY
                </th>
              </tr>
            </thead>
            <tbody>
              {data.quarterly.map((q) => (
                <tr key={q.quarter} className="odd:bg-white even:bg-gray-50">
                  <td className="px-2 py-1">{q.quarter}</td>
                  <td className="px-2 py-1">{q.sales}%</td>
                  <td className="px-2 py-1">{q.np}%</td>
                  <td className="px-2 py-1">{q.opm}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export { getRedFlags, redFlagRules };
export default FinancialMetricsPanel;
