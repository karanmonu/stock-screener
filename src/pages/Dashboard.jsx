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
  { id: 1, title: "News Headline 1", impactQtr: "Q1", date: "2023-02-20" },
  { id: 2, title: "News Headline 2", impactQtr: "Q2", date: "2023-03-15" },
  { id: 3, title: "News Headline 3", impactQtr: "Q3", date: "2023-04-10" },
  { id: 4, title: "News Headline 4", impactQtr: "Q4", date: "2023-05-05" },
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
    <main className="max-w-6xl mx-auto py-10 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Top Indian Stocks</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="border border-blue-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="🔍 Search by name or symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={resetFilters} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-semibold transition">Reset Filters</button>
          <button onClick={() => navigate('/virtual-pl')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition ml-2">Virtual P&amp;L</button>
          <button onClick={() => navigate('/actual-pl')} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition ml-2">Actual P&amp;L</button>
          <button onClick={() => navigate('/leads')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition ml-2">Leads Tracker</button>
          <button onClick={() => navigate('/industry-tracker')} className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition ml-2">Industry Tracker</button>
        </div>
      </div>
      {/* WATCHLIST SECTION */}
      <div className="mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 shadow-sm">
          <h2 className="font-bold text-yellow-800 text-lg mb-2 flex items-center gap-2">⭐ My Watchlist</h2>
          {watchlist.length === 0 ? (
            <div className="text-gray-500 text-sm">No stocks in your watchlist. Click the star on a stock to add.</div>
          ) : (
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
          )}
        </div>
      </div>
      {/* NEWS GLIMPSE SECTION */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-blue-800 text-lg flex items-center gap-2">📰 Latest News</h2>
            <button onClick={() => navigate('/news')} className="text-blue-600 underline text-xs font-semibold">See All</button>
          </div>
          <div className="space-y-2">
            {adminNews.slice(0, 3).map(news => (
              <div key={news.id} className="flex items-center gap-2">
                <span className="font-semibold text-blue-700">{news.title}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">{news.impactQtr}</span>
                <span className="text-xs text-gray-400">{news.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-blue-900 font-semibold">Price:</span>
          <input type="number" min={priceMinDefault} max={priceMaxDefault} value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder={`Min (${priceMinDefault})`} className="w-20 border border-blue-200 rounded px-2 py-1 text-xs focus:border-blue-400" />
          <span className="text-gray-400">-</span>
          <input type="number" min={priceMinDefault} max={priceMaxDefault} value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder={`Max (${priceMaxDefault})`} className="w-20 border border-blue-200 rounded px-2 py-1 text-xs focus:border-blue-400" />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-blue-900 font-semibold">PE:</span>
          <input type="number" min={peMinDefault} max={peMaxDefault} value={peMin} onChange={e => setPeMin(e.target.value)} placeholder={`Min (${peMinDefault})`} className="w-16 border border-blue-200 rounded px-2 py-1 text-xs focus:border-blue-400" />
          <span className="text-gray-400">-</span>
          <input type="number" min={peMinDefault} max={peMaxDefault} value={peMax} onChange={e => setPeMax(e.target.value)} placeholder={`Max (${peMaxDefault})`} className="w-16 border border-blue-200 rounded px-2 py-1 text-xs focus:border-blue-400" />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-blue-900 font-semibold">Mkt Cap:</span>
          <input type="number" min={mcMinDefault} max={mcMaxDefault} value={mcMin} onChange={e => setMcMin(e.target.value)} placeholder={`Min (${mcMinDefault})`} className="w-28 border border-blue-200 rounded px-2 py-1 text-xs focus:border-blue-400" />
          <span className="text-gray-400">-</span>
          <input type="number" min={mcMinDefault} max={mcMaxDefault} value={mcMax} onChange={e => setMcMax(e.target.value)} placeholder={`Max (${mcMaxDefault})`} className="w-28 border border-blue-200 rounded px-2 py-1 text-xs focus:border-blue-400" />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-blue-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
              <th className="px-4 py-3 text-left cursor-pointer select-none font-semibold text-blue-800" onClick={() => handleSort('name')}>Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
              <th className="px-4 py-3 text-left cursor-pointer select-none font-semibold text-blue-800" onClick={() => handleSort('price')}>Price (₹) {sortBy === 'price' && (sortDir === 'asc' ? '▲' : '▼')}</th>
              <th className="px-4 py-3 text-left cursor-pointer select-none font-semibold text-blue-800" onClick={() => handleSort('change')}>Change (%) {sortBy === 'change' && (sortDir === 'asc' ? '▲' : '▼')}</th>
              <th className="px-4 py-3 text-left cursor-pointer select-none font-semibold text-blue-800" onClick={() => handleSort('marketCap')}>Market Cap (Cr) {sortBy === 'marketCap' && (sortDir === 'asc' ? '▲' : '▼')}</th>
              <th className="px-4 py-3 text-left cursor-pointer select-none font-semibold text-blue-800" onClick={() => handleSort('pe')}>PE {sortBy === 'pe' && (sortDir === 'asc' ? '▲' : '▼')}</th>
              <th className="px-4 py-3"></th>
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
      </div>
    </main>
  );
};

export default Dashboard;
