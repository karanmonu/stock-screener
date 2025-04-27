import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

const ACTUAL_PL_KEY = "stock_screener_actual_pl";
const priceMap = {
  RELIANCE: 2875.2,
  TCS: 3842.5,
  HDFCBANK: 1502.9,
  INFY: 1410.6,
  ITC: 450.8,
};

const defaultTxn = {
  symbol: "",
  action: "Buy",
  quantity: "",
  price: "",
  date: "",
  fees: "",
  notes: ""
};

function getCurrentPrice(symbol) {
  return priceMap[symbol] || 0;
}

function calcActualPL(transactions) {
  // Calculate per-symbol position, realized/unrealized P&L
  const summary = {};
  let realizedPL = 0;
  let unrealizedPL = 0;
  let invested = 0;
  transactions.forEach(txn => {
    const { symbol, action, quantity, price, fees } = txn;
    if (!summary[symbol]) {
      summary[symbol] = { qty: 0, avgBuy: 0, invested: 0, realized: 0, unrealized: 0 };
    }
    const qty = parseInt(quantity, 10);
    const amt = qty * parseFloat(price);
    const fee = fees ? parseFloat(fees) : 0;
    if (action === "Buy") {
      // Weighted average buy price
      const prevQty = summary[symbol].qty;
      const prevAmt = summary[symbol].avgBuy * prevQty;
      summary[symbol].qty += qty;
      summary[symbol].avgBuy = summary[symbol].qty > 0 ? (prevAmt + amt + fee) / summary[symbol].qty : 0;
      summary[symbol].invested += amt + fee;
      invested += amt + fee;
    } else if (action === "Sell") {
      // Realized P&L: (Sell price - avg buy) * qty
      const sellPL = (parseFloat(price) - summary[symbol].avgBuy) * qty - fee;
      summary[symbol].qty -= qty;
      summary[symbol].realized += sellPL;
      realizedPL += sellPL;
      summary[symbol].invested -= summary[symbol].avgBuy * qty;
    }
  });
  // Calculate unrealized for open positions
  Object.keys(summary).forEach(symbol => {
    if (summary[symbol].qty > 0) {
      const curPL = (getCurrentPrice(symbol) - summary[symbol].avgBuy) * summary[symbol].qty;
      summary[symbol].unrealized = curPL;
      unrealizedPL += curPL;
    }
  });
  return { summary, realizedPL, unrealizedPL, invested };
}

const ActualPL = () => {
  const [txns, setTxns] = useState([]);
  const [form, setForm] = useState(defaultTxn);
  const [editingIdx, setEditingIdx] = useState(null);
  const navigate = useNavigate();

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(ACTUAL_PL_KEY);
    if (saved) {
      try {
        setTxns(JSON.parse(saved));
      } catch {}
    }
  }, []);
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(ACTUAL_PL_KEY, JSON.stringify(txns));
  }, [txns]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = e => {
    e.preventDefault();
    if (!form.symbol || !form.quantity || !form.price) return;
    setTxns([{ ...form }, ...txns]);
    setForm(defaultTxn);
  };

  const handleEdit = idx => {
    setForm(txns[idx]);
    setEditingIdx(idx);
  };

  const handleUpdate = e => {
    e.preventDefault();
    const updated = txns.slice();
    updated[editingIdx] = form;
    setTxns(updated);
    setForm(defaultTxn);
    setEditingIdx(null);
  };

  const handleDelete = idx => {
    setTxns(txns.filter((_, i) => i !== idx));
  };

  // CSV Export
  const handleExportCSV = () => {
    const csv = Papa.unparse(txns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `actual_pl_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // CSV Import
  const handleImportCSV = e => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        if (results.errors.length) {
          alert("CSV parse error: " + results.errors[0].message);
          return;
        }
        // Validate: must have symbol, action, quantity, price
        const imported = results.data.filter(row => row.symbol && row.action && row.quantity && row.price);
        setTxns([...imported, ...txns]);
      }
    });
    e.target.value = "";
  };

  const { summary, realizedPL, unrealizedPL, invested } = calcActualPL(txns);

  return (
    <main className="max-w-5xl mx-auto py-10 px-2 md:px-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Actual Profit & Loss</h1>
        <div className="flex gap-2">
          <button className="text-blue-600 underline text-sm" onClick={() => navigate("/")}>← Back to Dashboard</button>
          <button className="text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100 rounded px-3 py-1 text-xs font-semibold ml-2" onClick={handleExportCSV} type="button">Export CSV</button>
          <label className="text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100 rounded px-3 py-1 text-xs font-semibold ml-2 cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          </label>
        </div>
      </div>
      <div className="bg-blue-50 rounded-lg px-6 py-4 mb-6 flex flex-wrap gap-8 items-center shadow">
        <div>
          <div className="text-xs text-gray-600">Total Invested</div>
          <div className="text-lg font-bold">₹{invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Realized P&L</div>
          <div className={`text-lg font-bold ${realizedPL >= 0 ? "text-green-600" : "text-red-600"}`}>₹{realizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Unrealized P&L</div>
          <div className={`text-lg font-bold ${unrealizedPL >= 0 ? "text-green-600" : "text-red-600"}`}>₹{unrealizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
      </div>
      <form className="mb-8 flex flex-wrap gap-4 items-end bg-white rounded-lg px-6 py-4 shadow" onSubmit={editingIdx === null ? handleAdd : handleUpdate}>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Symbol</label>
          <input name="symbol" value={form.symbol} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-28" placeholder="e.g. RELIANCE" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Buy/Sell</label>
          <select name="action" value={form.action} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-20">
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-20" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Price</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-32" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Brokerage/Fees</label>
          <input name="fees" type="number" value={form.fees} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
          <input name="notes" value={form.notes} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-40" placeholder="Optional notes" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm transition">
          {editingIdx === null ? "Add Txn" : "Update"}
        </button>
        {editingIdx !== null && (
          <button type="button" onClick={() => { setForm(defaultTxn); setEditingIdx(null); }} className="ml-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold">Cancel</button>
        )}
      </form>
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-blue-100 mb-8">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="px-2 py-2">Symbol</th>
              <th className="px-2 py-2">Buy/Sell</th>
              <th className="px-2 py-2">Qty</th>
              <th className="px-2 py-2">Price</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Fees</th>
              <th className="px-2 py-2">Notes</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {txns.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-400 py-4">No transactions yet.</td></tr>
            ) : (
              txns.map((txn, i) => (
                <tr key={i} className="odd:bg-white even:bg-blue-50">
                  <td className="px-2 py-2 font-semibold text-blue-800">{txn.symbol}</td>
                  <td className="px-2 py-2">{txn.action}</td>
                  <td className="px-2 py-2">{txn.quantity}</td>
                  <td className="px-2 py-2">{txn.price}</td>
                  <td className="px-2 py-2">{txn.date}</td>
                  <td className="px-2 py-2">{txn.fees}</td>
                  <td className="px-2 py-2 max-w-xs truncate" title={txn.notes}>{txn.notes}</td>
                  <td className="px-2 py-2">
                    <button onClick={() => handleEdit(i)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold mr-1">Edit</button>
                    <button onClick={() => handleDelete(i)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-blue-100">
        <h2 className="text-lg font-bold text-blue-800 px-4 pt-4">Position Summary</h2>
        <table className="min-w-full text-xs md:text-sm mb-4">
          <thead>
            <tr className="bg-blue-50 text-blue-900">
              <th className="px-2 py-2">Symbol</th>
              <th className="px-2 py-2">Qty Held</th>
              <th className="px-2 py-2">Avg Buy</th>
              <th className="px-2 py-2">Invested</th>
              <th className="px-2 py-2">Unrealized P&L</th>
              <th className="px-2 py-2">Realized P&L</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(summary).length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-4">No positions yet.</td></tr>
            ) : (
              Object.keys(summary).map(symbol => (
                <tr key={symbol} className="odd:bg-white even:bg-blue-50">
                  <td className="px-2 py-2 font-semibold text-blue-800">{symbol}</td>
                  <td className="px-2 py-2">{summary[symbol].qty}</td>
                  <td className="px-2 py-2">{summary[symbol].avgBuy.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-2 py-2">{summary[symbol].invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className={`px-2 py-2 ${summary[symbol].unrealized >= 0 ? "text-green-600" : "text-red-600"}`}>{summary[symbol].unrealized.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className={`px-2 py-2 ${summary[symbol].realized >= 0 ? "text-green-600" : "text-red-600"}`}>{summary[symbol].realized.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default ActualPL;
