import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import News from "./News";

const LEADS_KEY = "stock_screener_leads";
const NEWS_KEY = "stock_screener_news";
const adminNews = [
  { id: 1, title: "News 1", summary: "Summary 1" },
  { id: 2, title: "News 2", summary: "Summary 2" },
  { id: 3, title: "News 3", summary: "Summary 3" }
];

// Helper to get all news (admin + user)
function getAllNews() {
  let userNews = [];
  try {
    userNews = JSON.parse(localStorage.getItem(NEWS_KEY)) || [];
  } catch {}
  return [
    ...adminNews,
    ...userNews.map((n, i) => ({ ...n, id: `user-${i}` }))
  ];
}

const defaultLead = {
  symbol: "",
  action: "Buy",
  tgt1: "",
  tgt2: "",
  res1: "",
  res2: "",
  sl1: "",
  sl2: "",
  category: "Trading",
  closeDate: "",
  reasons: "",
  newsIds: []
};

const categories = ["Trading", "Intraday", "Swing", "Investment"];

const LeadsTracker = () => {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(defaultLead);
  const [editingIdx, setEditingIdx] = useState(null);
  const navigate = useNavigate();
  const allNews = getAllNews();

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LEADS_KEY);
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
      } catch {}
    }
  }, []);
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }, [leads]);

  const handleChange = e => {
    if (e.target.name === "newsIds") {
      // Multi-select
      const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
      setForm({ ...form, newsIds: options });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleAdd = e => {
    e.preventDefault();
    if (!form.symbol) return;
    setLeads([{ ...form }, ...leads]);
    setForm(defaultLead);
  };

  const handleEdit = idx => {
    setForm(leads[idx]);
    setEditingIdx(idx);
  };

  const handleUpdate = e => {
    e.preventDefault();
    const updated = leads.slice();
    updated[editingIdx] = form;
    setLeads(updated);
    setForm(defaultLead);
    setEditingIdx(null);
  };

  const handleDelete = idx => {
    setLeads(leads.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full px-2 md:px-8 lg:px-16 xl:px-28 2xl:px-40 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-8">Leads Tracker</h1>
      <section className="bg-white rounded-xl shadow border p-6 mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Potential Stocks</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-medium text-gray-700">Stock</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Action</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Tgt-1</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Tgt-2</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Res-1</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Res-2</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">SL-1</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">SL-2</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Close Date</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Why</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">News</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={13} className="text-center text-gray-400 py-8 text-lg">No leads yet.</td></tr>
            ) : (
              leads.map((lead, i) => (
                <tr key={i} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition">
                  <td className="px-4 py-3 font-semibold text-blue-700">{lead.symbol}</td>
                  <td className="px-4 py-3">{lead.action}</td>
                  <td className="px-4 py-3">{lead.tgt1}</td>
                  <td className="px-4 py-3">{lead.tgt2}</td>
                  <td className="px-4 py-3">{lead.res1}</td>
                  <td className="px-4 py-3">{lead.res2}</td>
                  <td className="px-4 py-3">{lead.sl1}</td>
                  <td className="px-4 py-3">{lead.sl2}</td>
                  <td className="px-4 py-3">{lead.category}</td>
                  <td className="px-4 py-3">{lead.closeDate}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={lead.reasons}>{lead.reasons}</td>
                  <td className="px-4 py-3">
                    {lead.newsIds && lead.newsIds.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {lead.newsIds.map(nid => {
                          const news = allNews.find(n => String(n.id) === String(nid));
                          return news ? (
                            <a
                              key={nid}
                              href="/news"
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold hover:underline inline-block"
                              title={news.summary || news.title}
                            >
                              {news.title.length > 24 ? news.title.slice(0, 24) + "..." : news.title}
                            </a>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(i)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-semibold mr-1">Edit</button>
                    <button onClick={() => handleDelete(i)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <section className="bg-white rounded-xl shadow border p-6 mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add/Edit Lead</h2>
        <form onSubmit={editingIdx === null ? handleAdd : handleUpdate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Symbol</label>
            <input name="symbol" value={form.symbol} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-24" placeholder="e.g. RELIANCE" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Action</label>
            <select name="action" value={form.action} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-20">
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tgt-1</label>
            <input name="tgt1" value={form.tgt1} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-16" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tgt-2</label>
            <input name="tgt2" value={form.tgt2} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-16" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Resistance-1</label>
            <input name="res1" value={form.res1} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-16" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Resistance-2</label>
            <input name="res2" value={form.res2} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-16" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Stop Loss-1</label>
            <input name="sl1" value={form.sl1} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-16" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Stop Loss-2</label>
            <input name="sl2" value={form.sl2} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-16" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-28">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Close Date</label>
            <input name="closeDate" type="date" value={form.closeDate} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-32" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Why (Reasons)</label>
            <input name="reasons" value={form.reasons} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-full" placeholder="Reason for the call..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Related News</label>
            <select name="newsIds" multiple value={form.newsIds} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-40 h-20">
              {allNews.map(news => (
                <option value={news.id} key={news.id}>{news.title}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm transition">
            {editingIdx === null ? "Add Lead" : "Update"}
          </button>
          {editingIdx !== null && (
            <button type="button" onClick={() => { setForm(defaultLead); setEditingIdx(null); }} className="ml-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold">Cancel</button>
          )}
        </form>
      </section>
    </div>
  );
};

export default LeadsTracker;
