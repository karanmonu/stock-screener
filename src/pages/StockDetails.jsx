import React from "react";
import { useParams } from "react-router-dom";
import StockSummaryPanel from "../components/StockDetails/StockSummaryPanel";
import FinancialMetricsPanel, { getRedFlags, redFlagRules } from "../components/StockDetails/FinancialMetricsPanel";
import EditableFinancialsTable from "../components/StockDetails/EditableFinancialsTable";
import ShareholdingPieChart from "../components/StockDetails/ShareholdingPieChart";
import QuarterlyTrendsChart from "../components/StockDetails/QuarterlyTrendsChart";
import ErrorBoundary from "../components/ErrorBoundary";

// Demo/mock data for illustration. Replace with API data integration as needed.
const mockStock = {
  name: "Reliance Industries Ltd.",
  sector: "Conglomerate",
  theme: "Bluechip, Nifty 50",
  price: 2875.20,
  sma20: 2850.10,
  sma200: 2550.50,
  marketCap: 1930000,
  bookValue: 1200.5,
  dividendYield: 0.35,
};

const mockMetrics = {
  roe: 15.2,
  roce: 13.8,
  pe: 22.5,
  ps: 2.1,
  opm: 18.7,
  peg: 1.3,
  marketCap: 1930000,
  sales: 860000,
  debtEquity: 0.25,
  fii: 24.1,
  dii: 12.3,
  promoter: 49.2,
  pledge: 0.0,
  capex: 3200,
  orderBook: 9800,
  exports: 52000,
  pipeline: 11000,
  quarterly: [
    { quarter: "Q3FY24", sales: 11.2, np: 10.1, opm: 0.5 },
    { quarter: "Q2FY24", sales: 10.5, np: 9.8, opm: 0.3 },
    { quarter: "Q1FY24", sales: 12.0, np: 8.7, opm: 0.7 },
  ],
  profitGrowth: 10.5,
};

const mockTableRows = [
  { id: 1, metric: "Revenue", value: "860000", unit: "Cr", period: "FY23" },
  { id: 2, metric: "PAT", value: "120000", unit: "Cr", period: "FY23" },
];

const StockDetails = () => {
  const { stockId } = useParams();

  // Prepare shareholding data for pie chart
  const data = mockMetrics; // or fetched data
  const shareholdingData = [
    { name: "FII", value: data.fii },
    { name: "DII", value: data.dii },
    { name: "Promoter", value: data.promoter },
    { name: "Pledge", value: data.pledge },
  ];

  // Prepare metrics for red flag check
  const metrics = {
    debtEquity: { value: data.debtEquity },
    pledge: { value: data.pledge },
    roe: { value: data.roe },
    promoter: { value: data.promoter },
    profitGrowth: { value: data.profitGrowth },
    opm: { value: data.opm },
  };
  const redFlags = getRedFlags(metrics);

  // Prepare quarterly data for bar chart
  const quarterlyData = mockMetrics.quarterly;

  // TODO: Fetch data using stockId

  return (
    <ErrorBoundary>
      <main className="w-full py-6 px-2 md:px-6 lg:px-12 xl:px-20 2xl:px-36 bg-gray-50 min-h-screen">
        {redFlags.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <div className="font-bold text-red-700 mb-1 flex items-center gap-2">
              <span>⚠️ Red Flags Detected</span>
              {redFlags.length >= 3 && <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs ml-2">Investment Not Recommended</span>}
            </div>
            <ul className="text-red-800 text-sm list-disc pl-6">
              {redFlags.map(rule => (
                <li key={rule.key}>{rule.desc}</li>
              ))}
            </ul>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-4">Stock Details</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          <div className="col-span-2 flex flex-col gap-6">
            <StockSummaryPanel stock={mockStock} />
            <FinancialMetricsPanel data={mockMetrics} />
          </div>
          <div className="col-span-1 flex flex-col gap-6">
            <ShareholdingPieChart data={shareholdingData} />
            <QuarterlyTrendsChart data={quarterlyData} />
          </div>
        </div>
        <EditableFinancialsTable rows={mockTableRows} onSave={(rows) => {
          // TODO: Integrate PATCH/PUT API call
          console.log("Saved rows:", rows);
        }} />
      </main>
    </ErrorBoundary>
  );
};

export default StockDetails;
