import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import News from "./News";
import FinancialMetricsPanel, { getRedFlags } from "../components/StockDetails/FinancialMetricsPanel";

const mockStocks = [
  { id: "RELIANCE", name: "Reliance Industries Ltd.", price: 2875.2, change: 1.2, marketCap: 1930000, pe: 22.5, metrics: { debtEquity: 0.6, pledge: 0, roe: 14, promoter: 49, profitGrowth: 10, opm: 18 } },
  { id: "TCS", name: "Tata Consultancy Services", price: 3842.5, change: -0.5, marketCap: 1400000, pe: 28.1, metrics: { debtEquity: 0.1, pledge: 0, roe: 25, promoter: 72, profitGrowth: 8, opm: 27 } },
  { id: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1502.9, change: 0.7, marketCap: 1150000, pe: 18.9, metrics: { debtEquity: 1.1, pledge: 0, roe: 16, promoter: 25, profitGrowth: 7, opm: 22 } },
  { id: "INFY", name: "Infosys Ltd.", price: 1410.6, change: 0.3, marketCap: 590000, pe: 24.7, metrics: { debtEquity: 0.2, pledge: 0, roe: 20, promoter: 13, profitGrowth: 5, opm: 21 } },
  { id: "ITC", name: "ITC Ltd.", price: 450.8, change: -0.3, marketCap: 560000, pe: 20.4, metrics: { debtEquity: 0.1, pledge: 0, roe: 28, promoter: 0, profitGrowth: 12, opm: 33 } },
];

const adminNews = [
  { id: 1, title: "News Headline 1", impactQtr: "Q1", date: "2023-02-20", summary: "This is a summary of the news article." },
  { id: 2, title: "News Headline 2", impactQtr: "Q2", date: "2023-03-15", summary: "This is another summary of the news article." },
  { id: 3, title: "News Headline 3", impactQtr: "Q3", date: "2023-04-10", summary: "This is a summary of the news article." },
  { id: 4, title: "News Headline 4", impactQtr: "Q4", date: "2023-05-05", summary: "This is another summary of the news article." },
];

function getMinMax(arr, key) {
  if (!arr.length) return [0, 0];
  let min = arr[0][key], max = arr[0][key];
  for (const item of arr) {
    if (item[key] < min) min = item[key];
    if (item[key] > max) max = item[key];
  }
  return [min, max];
}

const WATCHLIST_KEY = "stock_screener_watchlist";

const Dashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [peMin, setPeMin] = useState("");
  const [peMax, setPeMax] = useState("");
  const [mcMin, setMcMin] = useState("");
  const [mcMax, setMcMax] = useState("");
  const [sortBy, setSortBy] = useState("marketCap");
  const [sortDir, setSortDir] = useState("desc");
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(WATCHLIST_KEY);
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch {}
    }
  }, []);
  // Save watchlist to localStorage on change
  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  function isInWatchlist(symbol) {
    return watchlist.includes(symbol);
  }
  function addToWatchlist(symbol) {
    if (!isInWatchlist(symbol)) setWatchlist([...watchlist, symbol]);
  }
  function removeFromWatchlist(symbol) {
    setWatchlist(watchlist.filter(s => s !== symbol));
  }

  // Set initial filter ranges based on data
  const [priceMinDefault, priceMaxDefault] = getMinMax(mockStocks, "price");
  const [peMinDefault, peMaxDefault] = getMinMax(mockStocks, "pe");
  const [mcMinDefault, mcMaxDefault] = getMinMax(mockStocks, "marketCap");

  // Filtering
  let filteredStocks = mockStocks.filter(
    stock =>
      (stock.name.toLowerCase().includes(search.toLowerCase()) ||
        stock.id.toLowerCase().includes(search.toLowerCase())) &&
      (priceMin === "" || stock.price >= parseFloat(priceMin)) &&
      (priceMax === "" || stock.price <= parseFloat(priceMax)) &&
      (peMin === "" || stock.pe >= parseFloat(peMin)) &&
      (peMax === "" || stock.pe <= parseFloat(peMax)) &&
      (mcMin === "" || stock.marketCap >= parseFloat(mcMin)) &&
      (mcMax === "" || stock.marketCap <= parseFloat(mcMax))
  );

  // Sorting
  filteredStocks = filteredStocks.sort((a, b) => {
    let valA = a[sortBy], valB = b[sortBy];
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function handleSort(col) {
    if (sortBy === col) {
      setSortDir(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  function resetFilters() {
    setSearch("");
    setPriceMin("");
    setPriceMax("");
    setPeMin("");
    setPeMax("");
    setMcMin("");
    setMcMax("");
  }

  return (
    <div className="w-full px-2 md:px-8 lg:px-16 xl:px-28 2xl:px-40 py-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Dashboard</h1>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button onClick={() => navigate('/virtual-pl')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition shadow">Virtual P&amp;L</button>
          <button onClick={() => navigate('/actual-pl')} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition shadow">Actual P&amp;L</button>
          <button onClick={() => navigate('/leads')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow">Leads Tracker</button>
          <button onClick={() => navigate('/industry-tracker')} className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition shadow">Industry Tracker</button>
        </div>
      </div>
      {/* Watchlist Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Watchlist</h2>
        <div className="flex flex-wrap gap-3">
          {watchlist.map(symbol => {
            const stock = mockStocks.find(s => s.id === symbol);
            const redFlags = stock ? getRedFlags(stock.metrics) : [];
            return stock ? (
              <div key={symbol} className="flex items-center gap-2 bg-white border border-yellow-200 px-3 py-1 rounded shadow-sm">
                <span className="font-semibold text-yellow-800">{stock.name} <span className="text-xs text-gray-400">({symbol})</span></span>
                {redFlags.length > 0 && <span className="ml-1 text-red-600" title="Red Flags Detected">⚠️</span>}
                <button onClick={() => removeFromWatchlist(symbol)} className="text-xs px-2 py-0.5 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold">✕</button>
              </div>
            ) : null;
          })}
        </div>
      </section>
      {/* Main Table Section */}
      <section className="bg-white rounded-xl shadow border p-4 mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Market Overview</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-medium text-gray-700">Stock</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Price</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Change</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Market Cap</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">PE</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8 text-lg">No stocks found.</td>
              </tr>
            ) : (
              filteredStocks.map(stock => {
                const redFlags = getRedFlags(stock.metrics);
                return (
                  <tr key={stock.id} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition cursor-pointer group" onClick={() => navigate(`/stock/${stock.id}`)}>
                    <td className="px-4 py-3 font-semibold text-blue-700 group-hover:underline flex items-center gap-2">
                      {stock.name}
                      <button
                        className={`text-lg ${isInWatchlist(stock.id) ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 focus:outline-none`}
                        title={isInWatchlist(stock.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        onClick={e => { e.stopPropagation(); isInWatchlist(stock.id) ? removeFromWatchlist(stock.id) : addToWatchlist(stock.id); }}
                      >
                        ★
                      </button>
                      {redFlags.length > 0 && <span className="ml-1 text-red-600" title="Red Flags Detected">⚠️</span>}
                    </td>
                    <td className="px-4 py-3">{stock.price.toLocaleString()}</td>
                    <td className={`px-4 py-3 ${stock.change > 0 ? 'text-green-600' : stock.change < 0 ? 'text-red-600' : 'text-gray-700'} font-bold`}>{stock.change > 0 ? '+' : ''}{stock.change}%</td>
                    <td className="px-4 py-3">{stock.marketCap.toLocaleString()}</td>
                    <td className="px-4 py-3">{stock.pe}</td>
                    <td className="px-4 py-3">
                      <button
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition font-semibold text-xs"
                        onClick={e => { e.stopPropagation(); navigate(`/stock/${stock.id}`); }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
      {/* News Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {adminNews.slice(0, 6).map((news, idx) => (
            <div key={news.id} className="bg-white rounded-xl shadow border p-4 flex flex-col gap-2">
              <div className="text-blue-800 font-bold text-base mb-1">{news.title}</div>
              <div className="text-sm text-gray-700 flex-1">{news.summary ? (news.summary.length > 100 ? news.summary.slice(0, 100) + '…' : news.summary) : ''}</div>
              <div className="text-xs text-gray-400 mt-2">{news.date}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
