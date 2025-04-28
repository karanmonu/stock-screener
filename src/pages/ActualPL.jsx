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
  brokerage: "",
  gst: "",
  stampDuty: "",
  sebiFee: "",
  stt: "",
  otherCharges: "",
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

// --- Helper to calculate all charges and net P&L for a transaction ---
function calcTxnCharges(txn) {
  // Parse all fields as numbers (default to 0)
  const buy = Number(txn.price) || 0;
  const sale = txn.action === "Sell" ? Number(txn.price) || 0 : 0;
  const brokerage = Number(txn.brokerage) || 0;
  const gst = Number(txn.gst) || 0;
  const stampDuty = Number(txn.stampDuty) || 0;
  const sebiFee = Number(txn.sebiFee) || 0;
  const stt = Number(txn.stt) || 0;
  const otherCharges = Number(txn.otherCharges) || 0;
  // Net P&L = Sale - Buy - (all charges)
  const netPL = sale - buy - (brokerage + gst + stampDuty + sebiFee + stt + otherCharges);
  // Return % = (Net P&L) / Buy * 100
  const returnPct = buy ? ((netPL / buy) * 100).toFixed(2) : "";
  return { netPL, returnPct };
}

const ActualPL = () => {
  const [txns, setTxns] = useState([]);
  const [form, setForm] = useState(defaultTxn);
  const [editingIdx, setEditingIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
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

  const txnsWithCalc = txns.map(txn => {
    const { netPL, returnPct } = calcTxnCharges(txn);
    return { ...txn, netPL, returnPct };
  });

  const { summary, realizedPL, unrealizedPL, invested } = calcActualPL(txnsWithCalc);

  return (
    <div className="w-full px-2 md:px-8 lg:px-16 xl:px-28 2xl:px-40 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-8">Actual Portfolio P&amp;L</h1>
      <section className="bg-white rounded-xl shadow border p-6 mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Transactions</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-medium text-gray-700">Symbol</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Action</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Qty</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Price</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Net P&amp;L</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Return %</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {txnsWithCalc.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-400 py-8 text-lg">No transactions yet.</td></tr>
            ) : txnsWithCalc.map((txn, idx) => (
              <React.Fragment key={idx}>
                <tr className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                  <td className="px-4 py-3 font-semibold text-blue-700">{txn.symbol}</td>
                  <td className="px-4 py-3">{txn.action}</td>
                  <td className="px-4 py-3">{txn.quantity}</td>
                  <td className="px-4 py-3">{txn.price}</td>
                  <td className="px-4 py-3">{txn.date}</td>
                  <td className="px-4 py-3 font-bold">{txn.netPL || "-"}</td>
                  <td className={"px-4 py-3 font-bold " + (txn.returnPct < 0 ? "text-red-600" : "text-green-600")}>{txn.returnPct || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-xs text-blue-600 underline">{expandedIdx === idx ? "Hide" : "Show"} Details</button>
                  </td>
                </tr>
                {expandedIdx === idx && (
                  <tr className="bg-blue-50">
                    <td colSpan={8} className="p-0">
                      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div><span className="font-semibold">Brokerage:</span> {txn.brokerage}</div>
                        <div><span className="font-semibold">GST:</span> {txn.gst}</div>
                        <div><span className="font-semibold">Stamp Duty:</span> {txn.stampDuty}</div>
                        <div><span className="font-semibold">SEBI Fee:</span> {txn.sebiFee}</div>
                        <div><span className="font-semibold">STT:</span> {txn.stt}</div>
                        <div><span className="font-semibold">Other Charges:</span> {txn.otherCharges}</div>
                        <div><span className="font-semibold">Notes:</span> {txn.notes}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>
      <section className="bg-white rounded-xl shadow border p-6 mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add/Edit Transaction</h2>
        <form className="flex flex-wrap gap-4 items-end" onSubmit={editingIdx === null ? handleAdd : handleUpdate}>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Brokerage</label>
            <input name="brokerage" type="number" value={form.brokerage} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">GST</label>
            <input name="gst" type="number" value={form.gst} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Stamp Duty</label>
            <input name="stampDuty" type="number" value={form.stampDuty} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">SEBI Fee</label>
            <input name="sebiFee" type="number" value={form.sebiFee} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">STT</label>
            <input name="stt" type="number" value={form.stt} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Other Charges</label>
            <input name="otherCharges" type="number" value={form.otherCharges} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" />
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
      </section>
      <section className="bg-white rounded-xl shadow border p-6 mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Import/Export</h2>
        <button className="text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100 rounded px-3 py-1 text-xs font-semibold ml-2" onClick={handleExportCSV} type="button">Export CSV</button>
        <label className="text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100 rounded px-3 py-1 text-xs font-semibold ml-2 cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
        </label>
      </section>
      <section className="bg-white rounded-xl shadow border p-6 mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
        <div className="flex gap-4 items-center mb-4">
          <div>
            <div className="text-xs text-gray-600">Total Invested</div>
            <div className="text-lg font-bold">₹{invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Realized P&amp;L</div>
            <div className={`text-lg font-bold ${realizedPL >= 0 ? "text-green-600" : "text-red-600"}`}>₹{realizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Unrealized P&amp;L</div>
            <div className={`text-lg font-bold ${unrealizedPL >= 0 ? "text-green-600" : "text-red-600"}`}>₹{unrealizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-medium text-gray-700">Symbol</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Qty Held</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Avg Buy</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Invested</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Unrealized P&amp;L</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Realized P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(summary).length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8 text-lg">No positions yet.</td></tr>
            ) : Object.keys(summary).map(symbol => (
              <tr key={symbol} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition">
                <td className="px-4 py-3 font-semibold text-blue-700">{symbol}</td>
                <td className="px-4 py-3">{summary[symbol].qty}</td>
                <td className="px-4 py-3">{summary[symbol].avgBuy.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">{summary[symbol].invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className={"px-4 py-3 font-bold " + (summary[symbol].unrealized >= 0 ? "text-green-600" : "text-red-600")}>{summary[symbol].unrealized.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className={"px-4 py-3 font-bold " + (summary[symbol].realized >= 0 ? "text-green-600" : "text-red-600")}>{summary[symbol].realized.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ActualPL;
