import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const industries = [
  {
    key: "auto",
    name: "Automobile",
    seasonality: [
      { month: "Jan", sales: 120 }, { month: "Feb", sales: 140 }, { month: "Mar", sales: 180 },
      { month: "Apr", sales: 110 }, { month: "May", sales: 90 }, { month: "Jun", sales: 100 },
      { month: "Jul", sales: 130 }, { month: "Aug", sales: 160 }, { month: "Sep", sales: 200 },
      { month: "Oct", sales: 250 }, { month: "Nov", sales: 220 }, { month: "Dec", sales: 210 }
    ],
    marketLeaders: [
      { name: "Maruti Suzuki", value: 42 },
      { name: "Hyundai", value: 18 },
      { name: "Tata Motors", value: 15 },
      { name: "Mahindra", value: 10 },
      { name: "Others", value: 15 }
    ],
    rawMaterials: [
      { name: "Steel", value: 55 },
      { name: "Aluminium", value: 20 },
      { name: "Plastic", value: 15 },
      { name: "Rubber", value: 10 }
    ],
    geoImpact: "High import dependence on steel and semiconductors from China and Southeast Asia. Export demand sensitive to global trade policies. Recent EV policy changes in Europe impact outlook."
  },
  {
    key: "it",
    name: "Information Technology",
    seasonality: [
      { quarter: "Q1", revenue: 30 }, { quarter: "Q2", revenue: 35 }, { quarter: "Q3", revenue: 40 }, { quarter: "Q4", revenue: 50 }
    ],
    marketLeaders: [
      { name: "TCS", value: 30 },
      { name: "Infosys", value: 25 },
      { name: "HCL Tech", value: 18 },
      { name: "Wipro", value: 12 },
      { name: "Others", value: 15 }
    ],
    rawMaterials: [
      { name: "Talent (Wages)", value: 70 },
      { name: "Hardware", value: 15 },
      { name: "Software Licenses", value: 10 },
      { name: "Others", value: 5 }
    ],
    geoImpact: "Export-driven sector. Sensitive to US/EU visa policies and currency fluctuations. Recent US H1B policy changes and EU data privacy laws impacting margins."
  },
  {
    key: "fmcg",
    name: "FMCG",
    seasonality: [
      { quarter: "Q1", sales: 80 }, { quarter: "Q2", sales: 110 }, { quarter: "Q3", sales: 120 }, { quarter: "Q4", sales: 100 }
    ],
    marketLeaders: [
      { name: "HUL", value: 32 },
      { name: "ITC", value: 22 },
      { name: "Nestle India", value: 16 },
      { name: "Dabur", value: 10 },
      { name: "Others", value: 20 }
    ],
    rawMaterials: [
      { name: "Agri Inputs", value: 50 },
      { name: "Packaging", value: 20 },
      { name: "Chemicals", value: 15 },
      { name: "Energy", value: 15 }
    ],
    geoImpact: "Dependent on monsoon and agri commodity prices. Exposed to global palm oil and packaging costs. Regulatory changes in food safety and labeling affect outlook."
  }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF", "#FF6F91"];

const IndustryTracker = () => {
  const [selected, setSelected] = useState(industries[0].key);
  const navigate = useNavigate();
  const industry = industries.find(i => i.key === selected);

  return (
    <main className="max-w-5xl mx-auto py-10 px-2 md:px-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Industry Tracker</h1>
        <button className="text-blue-600 underline text-sm" onClick={() => navigate("/")}>← Back to Dashboard</button>
      </div>
      <div className="mb-6 flex gap-4 flex-wrap">
        {industries.map(i => (
          <button
            key={i.key}
            className={`px-4 py-2 rounded-lg font-semibold border transition ${selected === i.key ? "bg-blue-600 text-white border-blue-700" : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"}`}
            onClick={() => setSelected(i.key)}
          >
            {i.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seasonality */}
        <div className="bg-white rounded-xl shadow border p-4">
          <h2 className="text-lg font-bold mb-2 text-blue-800">Seasonality</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={industry.seasonality}>
              <XAxis dataKey={industry.key === "auto" ? "month" : "quarter"} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={industry.key === "auto" ? "sales" : "revenue"} fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Market Leader */}
        <div className="bg-white rounded-xl shadow border p-4">
          <h2 className="text-lg font-bold mb-2 text-blue-800">Market Leaders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={industry.marketLeaders} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {industry.marketLeaders.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Raw Material Dependence */}
        <div className="bg-white rounded-xl shadow border p-4">
          <h2 className="text-lg font-bold mb-2 text-blue-800">Raw Material Dependence</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={industry.rawMaterials} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {industry.rawMaterials.map((entry, idx) => (
                  <Cell key={`cell-raw-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Geo Political Impact */}
        <div className="bg-white rounded-xl shadow border p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-2 text-blue-800">Geo-Political Impact</h2>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-base text-gray-700">{industry.geoImpact}</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default IndustryTracker;
