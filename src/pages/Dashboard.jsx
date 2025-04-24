import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockStocks = [
  { id: "RELIANCE", name: "Reliance Industries Ltd.", price: 2875.2, change: 1.2, marketCap: 1930000, pe: 22.5 },
  { id: "TCS", name: "Tata Consultancy Services", price: 3850.5, change: -0.8, marketCap: 1400000, pe: 29.1 },
  { id: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1550.0, change: 0.4, marketCap: 900000, pe: 18.7 },
  { id: "INFY", name: "Infosys Ltd.", price: 1450.3, change: 0.6, marketCap: 600000, pe: 25.2 },
  { id: "ITC", name: "ITC Ltd.", price: 450.8, change: -0.3, marketCap: 560000, pe: 20.4 },
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
              filteredStocks.map(stock => (
                <tr key={stock.id} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition cursor-pointer group" onClick={() => navigate(`/stock/${stock.id}`)}>
                  <td className="px-4 py-3 font-semibold text-blue-700 group-hover:underline">{stock.name}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Dashboard;
