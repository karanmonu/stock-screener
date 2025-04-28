import React, { useState, useEffect } from "react";

const defaultItem = {
  stockName: "",
  gradingNew: "",
  gradingOld: "",
  addDate: "",
  addRate: "",
  holdingPeriod: "",
  currentRate: "",
  change: "",
  changePct: "",
  redFlagsScore: "",
  redFlags: [],
  remarks: ""
};

// Helper to calculate auto fields
function autoFields(item) {
  const today = new Date();
  const addDate = item.addDate ? new Date(item.addDate) : null;
  const addRate = parseFloat(item.addRate) || 0;
  const currentRate = parseFloat(item.currentRate) || 0;
  // Holding Period
  let holdingPeriod = "";
  if (addDate) {
    const diff = Math.floor((today - addDate) / (1000 * 60 * 60 * 24));
    holdingPeriod = diff + " days";
  }
  // Change
  const change = currentRate && addRate ? (currentRate - addRate).toFixed(2) : "";
  // Change %
  const changePct = currentRate && addRate ? (((currentRate - addRate) / addRate) * 100).toFixed(2) : "";
  return { holdingPeriod, change, changePct };
}

const RED_FLAG_OPTIONS = [
  "Seasonal",
  "-ve cash Flow",
  "Low Bank Bal",
  "High Debt",
  "Low Promoter Holding"
];

// List of Values (LOV) for stock dropdown
const STOCK_LOV = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ITC",
  // Add more as needed
];

const WATCHLIST_KEY = "stock_screener_watchlist";

// --- Global error boundary for Watchlist page ---
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 my-6 rounded">
        <div className="font-bold mb-2">Something went wrong in Watchlist:</div>
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
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    this.props.setError(error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(defaultItem);
  const [editingIdx, setEditingIdx] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (err) {
      // Log error for debugging
      console.error("Failed to load watchlist from localStorage:", err);
      setItems([]);
    }
  }, []);
  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
    } catch (err) {
      // Log error for debugging
      console.error("Failed to save watchlist to localStorage:", err);
    }
  }, [items]);

  // Handle form input
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === "redFlags") {
      let newFlags = form.redFlags.slice();
      if (checked) {
        newFlags.push(value);
      } else {
        newFlags = newFlags.filter(f => f !== value);
      }
      setForm({ ...form, redFlags: newFlags });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Add or update item
  const handleSubmit = e => {
    e.preventDefault();
    try {
      const auto = autoFields(form);
      const newItem = { ...form, ...auto };
      if (editingIdx !== null) {
        const updated = items.slice();
        updated[editingIdx] = newItem;
        setItems(updated);
        setEditingIdx(null);
      } else {
        setItems([newItem, ...items]);
      }
      setForm(defaultItem);
    } catch (err) {
      console.error("Error submitting Watchlist form:", err);
    }
  };

  const handleEdit = idx => {
    setForm(items[idx]);
    setEditingIdx(idx);
  };

  const handleDelete = idx => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <ErrorBoundary>
      <div className="w-full max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8">Watchlist</h1>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded shadow" onSubmit={handleSubmit}>
          <select name="stockName" value={form.stockName} onChange={handleChange} className="border rounded px-2 py-1" required>
            <option value="">Select Stock</option>
            {STOCK_LOV.map(stock => (
              <option key={stock} value={stock}>{stock}</option>
            ))}
          </select>
          <input name="gradingNew" value={form.gradingNew} onChange={handleChange} placeholder="Grading - New" className="border rounded px-2 py-1" />
          <input name="gradingOld" value={form.gradingOld} onChange={handleChange} placeholder="Grading - Old" className="border rounded px-2 py-1" />
          <input name="addDate" type="date" value={form.addDate} onChange={handleChange} placeholder="Add Date" className="border rounded px-2 py-1" required />
          <input name="addRate" type="number" value={form.addRate} onChange={handleChange} placeholder="Add Rate" className="border rounded px-2 py-1" required />
          <input name="currentRate" type="number" value={form.currentRate} onChange={handleChange} placeholder="Current Rate" className="border rounded px-2 py-1" required />
          <input name="redFlagsScore" type="number" value={form.redFlagsScore} onChange={handleChange} placeholder="Red Flags Score" className="border rounded px-2 py-1" />
          <div className="col-span-1 md:col-span-3 flex flex-wrap gap-2">
            {RED_FLAG_OPTIONS.map(flag => (
              <label key={flag} className="text-xs bg-gray-100 rounded px-2 py-1">
                <input
                  type="checkbox"
                  name="redFlags"
                  value={flag}
                  checked={form.redFlags.includes(flag)}
                  onChange={handleChange}
                  className="mr-1"
                />
                {flag}
              </label>
            ))}
          </div>
          <input name="remarks" value={form.remarks} onChange={handleChange} placeholder="Remarks" className="border rounded px-2 py-1 col-span-1 md:col-span-3" />
          <button type="submit" className="bg-blue-700 text-white rounded px-4 py-2 font-semibold col-span-1 md:col-span-3">
            {editingIdx !== null ? "Update" : "Add"} Stock
          </button>
        </form>
        <table className="min-w-full text-sm bg-white rounded shadow overflow-x-auto">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-3 py-2">Stock Name</th>
              <th className="px-3 py-2">Grading (New)</th>
              <th className="px-3 py-2">Grading (Old)</th>
              <th className="px-3 py-2">Add Date</th>
              <th className="px-3 py-2">Add Rate</th>
              <th className="px-3 py-2">Holding Period</th>
              <th className="px-3 py-2">Current Rate</th>
              <th className="px-3 py-2">Change</th>
              <th className="px-3 py-2">Change %</th>
              <th className="px-3 py-2">Red Flags Score</th>
              <th className="px-3 py-2">Red Flags</th>
              <th className="px-3 py-2">Remarks</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={13} className="text-center text-gray-400 py-8 text-lg">No stocks in watchlist.</td></tr>
            ) : items.map((item, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition">
                <td className="px-3 py-2 font-semibold text-blue-700">{item.stockName}</td>
                <td className="px-3 py-2">{item.gradingNew}</td>
                <td className="px-3 py-2">{item.gradingOld}</td>
                <td className="px-3 py-2">{item.addDate}</td>
                <td className="px-3 py-2">{item.addRate}</td>
                <td className="px-3 py-2">{item.holdingPeriod}</td>
                <td className="px-3 py-2">{item.currentRate}</td>
                <td className="px-3 py-2">{item.change}</td>
                <td className={"px-3 py-2 font-bold " + (item.changePct < 0 ? "text-red-600" : "text-green-600")}>{item.changePct}</td>
                <td className="px-3 py-2">{item.redFlagsScore}</td>
                <td className="px-3 py-2">{item.redFlags && Array.isArray(item.redFlags) ? item.redFlags.join('; ') : ''}</td>
                <td className="px-3 py-2">{item.remarks}</td>
                <td className="px-3 py-2">
                  <button onClick={() => handleEdit(idx)} className="text-xs text-yellow-600 underline mr-2">Edit</button>
                  <button onClick={() => handleDelete(idx)} className="text-xs text-red-600 underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ErrorBoundary>
  );
}
