import React, { useState, useEffect, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";

// Mock price lookup (replace with real API if desired)
const priceMap = {
  RELIANCE: 2875.2,
  TCS: 3850.5,
  HDFCBANK: 1550.0,
  INFY: 1450.3,
  ITC: 450.8,
};

// List of available symbols for autocomplete
const symbolList = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ITC"];

function getCurrentPrice(symbol) {
  return priceMap[symbol] || 0;
}

function calcPL(holding) {
  const currentPrice = getCurrentPrice(holding.symbol);
  const invested = holding.buyPrice * holding.quantity;
  const currentValue = currentPrice * holding.quantity;
  const profit = currentValue - invested;
  const percent = invested === 0 ? 0 : (profit / invested) * 100;
  return { invested, currentValue, profit, percent, currentPrice };
}

const defaultHoldings = [];

const LOCAL_KEY = "virtual_pl_holdings";

// --- Global error boundary for VirtualPL page ---
function ErrorBoundary({ children }) {
  const [error, setError] = React.useState(null);
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 my-6 rounded">
        <div className="font-bold mb-2">Something went wrong in Virtual P&L:</div>
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

const VirtualPL = () => {
  const [holdings, setHoldings] = useState(defaultHoldings);
  const [form, setForm] = useState({ symbol: "", buyPrice: "", quantity: "", date: "" });
  const [editingIdx, setEditingIdx] = useState(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState(symbolList);
  const symbolInputRef = useRef();
  const navigate = useNavigate();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        setHoldings(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(holdings));
  }, [holdings]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "symbol") {
      const val = e.target.value.toUpperCase();
      setShowAutocomplete(true);
      setFilteredSymbols(symbolList.filter(s => s.startsWith(val)));
    }
  };

  const handleSelectSymbol = sym => {
    setForm(f => ({ ...f, symbol: sym }));
    setShowAutocomplete(false);
    symbolInputRef.current.blur();
  };

  const handleAdd = e => {
    e.preventDefault();
    if (!form.symbol || !form.buyPrice || !form.quantity) return;
    setHoldings([...holdings, { ...form, buyPrice: parseFloat(form.buyPrice), quantity: parseInt(form.quantity, 10) }]);
    setForm({ symbol: "", buyPrice: "", quantity: "", date: "" });
    setShowAutocomplete(false);
  };

  const handleEdit = idx => {
    setForm(holdings[idx]);
    setEditingIdx(idx);
    setShowAutocomplete(false);
  };

  const handleUpdate = e => {
    e.preventDefault();
    const updated = holdings.slice();
    updated[editingIdx] = { ...form, buyPrice: parseFloat(form.buyPrice), quantity: parseInt(form.quantity, 10) };
    setHoldings(updated);
    setForm({ symbol: "", buyPrice: "", quantity: "", date: "" });
    setEditingIdx(null);
    setShowAutocomplete(false);
  };

  const handleDelete = idx => {
    setHoldings(holdings.filter((_, i) => i !== idx));
  };

  // Summary
  const summary = holdings.reduce(
    (acc, h) => {
      const { invested, currentValue, profit } = calcPL(h);
      acc.invested += invested;
      acc.currentValue += currentValue;
      acc.profit += profit;
      return acc;
    },
    { invested: 0, currentValue: 0, profit: 0 }
  );

  return (
    <ErrorBoundary>
      <div className="w-full px-2 md:px-8 lg:px-16 xl:px-28 2xl:px-40 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8">Virtual Portfolio P&amp;L</h1>
        <section className="bg-white rounded-xl shadow border p-6 mb-10 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Holdings</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-700">Stock</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Qty</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Buy Price</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Current Price</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">P&amp;L</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Invested</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Current Value</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">%P&amp;L</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-8 text-lg">No holdings yet.</td></tr>
              ) : holdings.map((h, i) => {
                const { invested, currentValue, profit, percent, currentPrice } = calcPL(h);
                return (
                  <tr key={i} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition">
                    <td className="px-4 py-3 font-semibold text-blue-700">{h.symbol}</td>
                    <td className="px-4 py-3">{h.quantity}</td>
                    <td className="px-4 py-3">{h.buyPrice}</td>
                    <td className="px-4 py-3">{currentPrice}</td>
                    <td className={`px-4 py-3 font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>{profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">{invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">{currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className={`px-4 py-3 font-bold ${percent >= 0 ? "text-green-600" : "text-red-600"}`}>{percent.toFixed(2)}%</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleEdit(i)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">Edit</button>
                      <button onClick={() => handleDelete(i)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <form className="mb-8 flex flex-wrap gap-4 items-end bg-white rounded-lg px-6 py-4 shadow" onSubmit={editingIdx === null ? handleAdd : handleUpdate} autoComplete="off">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Symbol</label>
            <input
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              className="border rounded px-2 py-1 text-sm w-28"
              placeholder="e.g. RELIANCE"
              required
              autoComplete="off"
              ref={symbolInputRef}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 100)}
            />
            {showAutocomplete && filteredSymbols.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white border border-blue-200 rounded shadow z-10 mt-1 max-h-32 overflow-y-auto">
                {filteredSymbols.map(sym => (
                  <li
                    key={sym}
                    className="px-3 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                    onMouseDown={() => handleSelectSymbol(sym)}
                  >
                    {sym}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Buy Price</label>
            <input name="buyPrice" type="number" value={form.buyPrice} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" placeholder="e.g. 2500" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-20" placeholder="e.g. 10" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Buy Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-32" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm transition">
            {editingIdx === null ? "Add Holding" : "Update"}
          </button>
          {editingIdx !== null && (
            <button type="button" onClick={() => { setForm({ symbol: "", buyPrice: "", quantity: "", date: "" }); setEditingIdx(null); setShowAutocomplete(false); }} className="ml-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold">Cancel</button>
          )}
        </form>
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-blue-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                <th className="px-4 py-3 text-left font-semibold text-blue-800">Total Invested</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800">Current Value</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-800">Total P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3">₹{summary.invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">₹{summary.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className={`px-4 py-3 font-bold ${summary.profit >= 0 ? "text-green-600" : "text-red-600"}`}>₹{summary.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VirtualPL;
