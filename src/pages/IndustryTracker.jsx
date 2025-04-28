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
  },
  {
    key: "pharma",
    name: "Pharmaceuticals",
    seasonality: [
      { quarter: "Q1", sales: 60 }, { quarter: "Q2", sales: 65 }, { quarter: "Q3", sales: 80 }, { quarter: "Q4", sales: 90 }
    ],
    marketLeaders: [
      { name: "Sun Pharma", value: 28 },
      { name: "Dr Reddy's", value: 18 },
      { name: "Cipla", value: 16 },
      { name: "Lupin", value: 12 },
      { name: "Others", value: 26 }
    ],
    rawMaterials: [
      { name: "APIs", value: 60 },
      { name: "Packaging", value: 20 },
      { name: "Chemicals", value: 15 },
      { name: "Energy", value: 5 }
    ],
    geoImpact: "Export-driven, exposed to USFDA regulations and patent cliffs. Dependent on China for APIs. Sensitive to global health events and government pricing controls."
  },
  {
    key: "energy",
    name: "Energy & Power",
    seasonality: [
      { quarter: "Q1", gen: 90 }, { quarter: "Q2", gen: 110 }, { quarter: "Q3", gen: 120 }, { quarter: "Q4", gen: 100 }
    ],
    marketLeaders: [
      { name: "NTPC", value: 30 },
      { name: "Adani Power", value: 22 },
      { name: "Tata Power", value: 18 },
      { name: "Power Grid", value: 15 },
      { name: "Others", value: 15 }
    ],
    rawMaterials: [
      { name: "Coal", value: 60 },
      { name: "Gas", value: 20 },
      { name: "Renewables", value: 15 },
      { name: "Others", value: 5 }
    ],
    geoImpact: "Highly regulated sector. Impacted by global coal/gas prices, government tariffs, and renewable policy changes. Geopolitical tensions affect fuel imports."
  },
  {
    key: "cement",
    name: "Cement",
    seasonality: [
      { quarter: "Q1", sales: 50 }, { quarter: "Q2", sales: 70 }, { quarter: "Q3", sales: 90 }, { quarter: "Q4", sales: 80 }
    ],
    marketLeaders: [
      { name: "UltraTech", value: 38 },
      { name: "Shree Cement", value: 18 },
      { name: "Ambuja", value: 16 },
      { name: "ACC", value: 12 },
      { name: "Others", value: 16 }
    ],
    rawMaterials: [
      { name: "Limestone", value: 45 },
      { name: "Coal", value: 30 },
      { name: "Gypsum", value: 15 },
      { name: "Others", value: 10 }
    ],
    geoImpact: "Dependent on infrastructure demand and monsoon. Sensitive to coal and petcoke prices. Regulatory changes in mining and environmental norms impact costs."
  }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF", "#FF6F91"];

const IndustryTracker = () => {
  const [selected, setSelected] = useState(industries[0].key);
  const navigate = useNavigate();
  const industry = industries.find(i => i.key === selected);

  return (
    <main className="w-full py-8 px-2 md:px-8 lg:px-16 xl:px-28 2xl:px-40 bg-gray-50 min-h-screen">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 2xl:gap-16">
        {/* Seasonality */}
        <div className="bg-white rounded-xl shadow border p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold mb-4 text-blue-800">Seasonality</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={industry.seasonality}>
              <XAxis dataKey={industry.key === "auto" ? "month" : industry.key === "energy" ? "quarter" : "quarter"} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={industry.key === "auto" ? "sales" : industry.key === "energy" ? "gen" : "sales"} fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Market Leader */}
        <div className="bg-white rounded-xl shadow border p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold mb-4 text-blue-800">Market Leaders</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={industry.marketLeaders} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
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
        <div className="bg-white rounded-xl shadow border p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold mb-4 text-blue-800">Raw Material Dependence</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={industry.rawMaterials} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
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
        <div className="bg-white rounded-xl shadow border p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold mb-4 text-blue-800">Geo-Political Impact</h2>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-base text-gray-700 text-center">{industry.geoImpact}</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default IndustryTracker;
