import React, { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// --- Error Boundary ---
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 my-6 rounded">
        <div className="font-bold mb-2">Something went wrong in Star Investors: a0</div>
        <div className="text-xs whitespace-pre-wrap">{error.message || String(error)}</div>
      </div>
    );
  }
  return (
    <React.Suspense fallback={null}>
      <ErrorCatcher setError={setError}>{children}</ErrorCatcher>
    </React.Suspense>
  );
}
class ErrorCatcher extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error) { this.props.setError(error); }
  render() { if (this.state.hasError) return null; return this.props.children; }
}

// --- Sample Data (from Excel) ---
const starInvestors = [
  { name: "Anil Goel", short: "AG", firm: "", remarks: "" },
  { name: "Alpana Dang", short: "AD-A", firm: "Authum", remarks: "" },
  { name: "Ashish Dhawan", short: "AD", firm: "", remarks: "" },
  { name: "Ashish Kacholia", short: "AK", firm: "Suryavanshi Commodtrade P LTD", remarks: "" },
  { name: "Ajay Upadhayay", short: "AU", firm: "", remarks: "" },
  { name: "Bengal Finance", short: "", firm: "", remarks: "" },
  { name: "Dilip Lekhi", short: "DL", firm: "", remarks: "" },
  { name: "Dolly Khanna", short: "DK", firm: "", remarks: "" },
  { name: "Dheeraj Kr Lohia", short: "DkL", firm: "", remarks: "" },
  { name: "Growfast", short: "GF", firm: "", remarks: "" },
  { name: "Haresh Keswani", short: "HK", firm: "", remarks: "" },
  { name: "Hitesh Zaveri", short: "HZ", firm: "", remarks: "" },
  { name: "Mukul Agarwal", short: "MA-P", firm: "Param Investment", remarks: "" },
  { name: "Madhukar Seth", short: "MS", firm: "", remarks: "" },
  { name: "Porinju Veliyath", short: "PV", firm: "", remarks: "" },
  { name: "Radha Krishna Damani", short: "RKD", firm: "", remarks: "" },
  { name: "Rekha Jhunjhunwala", short: "RJ", firm: "", remarks: "" },
  { name: "Ricky Kriplani", short: "RK", firm: "", remarks: "" },
  { name: "Sangeetha S", short: "SS", firm: "", remarks: "" },
  { name: "Santosh Industries Ltd", short: "SIL", firm: "", remarks: "" },
  { name: "Seema Goel", short: "SG", firm: "", remarks: "" },
  { name: "Sharad Kanhayalal", short: "SK", firm: "", remarks: "" },
  { name: "Sunil Singhania", short: "SS-A", firm: "Abaccus Fund", remarks: "" },
  { name: "Suresh Kr Agrawal", short: "RBA", firm: "RBA", remarks: "" },
  { name: "Sarita Agrawal", short: "RBA", firm: "RBA", remarks: "" },
  { name: "Vijay Kedia", short: "VK", firm: "Kedia Securities P Ltd", remarks: "" },
  { name: "Vijay Singhania", short: "VS", firm: "", remarks: "" },
  { name: "Vijay Agrawal", short: "VA", firm: "", remarks: "" },
  { name: "Arpit Khandelwal", short: "AK-PI", firm: "Plutus Wealth", remarks: "" },
];

// --- Chart Data Preparation ---
const firmCounts = Object.entries(starInvestors.reduce((acc, inv) => {
  if (inv.firm) acc[inv.firm] = (acc[inv.firm] || 0) + 1;
  return acc;
}, {})).map(([firm, count]) => ({ firm, count }));

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF", "#FF6F91", "#FFB347", "#B0E57C"];

export default function StarInvestors() {
  return (
    <ErrorBoundary>
      <div className="w-full max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8">Star Investor Holdings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Investor Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Short</th>
                    <th className="px-3 py-2">Firm</th>
                    <th className="px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {starInvestors.map((inv, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-blue-50">
                      <td className="px-3 py-2 font-semibold text-blue-700">{inv.name}</td>
                      <td className="px-3 py-2">{inv.short}</td>
                      <td className="px-3 py-2">{inv.firm}</td>
                      <td className="px-3 py-2">{inv.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Firm Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={firmCounts} dataKey="count" nameKey="firm" cx="50%" cy="50%" outerRadius={110} label>
                  {firmCounts.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Investors per Firm</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={firmCounts}>
              <XAxis dataKey="firm" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ErrorBoundary>
  );
}
