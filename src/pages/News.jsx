import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock admin news (replace with API fetch in production)
export const adminNews = [
  {
    id: 1,
    title: "Reliance posts record profit in Q4",
    summary: "Reliance Industries reported a record net profit for the fourth quarter...",
    source: "MoneyControl",
    date: "2025-04-25",
    impactQtr: "Q4"
  },
  {
    id: 2,
    title: "ITC to demerge hotels business",
    summary: "ITC board approves demerger of hotels business to unlock value for shareholders...",
    source: "ET Markets",
    date: "2025-04-23",
    impactQtr: "Q1"
  },
  {
    id: 3,
    title: "TCS bags $2B deal from European client",
    summary: "Tata Consultancy Services secures a major contract in Europe...",
    source: "Business Standard",
    date: "2025-04-20",
    impactQtr: "Q1"
  }
];

const USER_NEWS_KEY = "stock_screener_user_news";

const News = () => {
  const [userNews, setUserNews] = useState([]);
  const [showUserNews, setShowUserNews] = useState(true);
  const [form, setForm] = useState({ title: "", summary: "", source: "", date: "", impactQtr: "" });
  const [editingIdx, setEditingIdx] = useState(null);
  const navigate = useNavigate();

  // Load user news from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(USER_NEWS_KEY);
    if (saved) {
      try {
        setUserNews(JSON.parse(saved));
      } catch {}
    }
  }, []);
  // Save user news to localStorage
  useEffect(() => {
    localStorage.setItem(USER_NEWS_KEY, JSON.stringify(userNews));
  }, [userNews]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = e => {
    e.preventDefault();
    if (!form.title) return;
    setUserNews([{ ...form, date: form.date || new Date().toISOString().slice(0, 10) }, ...userNews]);
    setForm({ title: "", summary: "", source: "", date: "", impactQtr: "" });
  };

  const handleEdit = idx => {
    setForm(userNews[idx]);
    setEditingIdx(idx);
  };

  const handleUpdate = e => {
    e.preventDefault();
    const updated = userNews.slice();
    updated[editingIdx] = form;
    setUserNews(updated);
    setForm({ title: "", summary: "", source: "", date: "", impactQtr: "" });
    setEditingIdx(null);
  };

  const handleDelete = idx => {
    setUserNews(userNews.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full px-2 md:px-8 lg:px-16 xl:px-28 2xl:px-40 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-8">Market News</h1>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {adminNews.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 text-lg">No admin news available.</div>
        ) : adminNews.map(news => (
          <div key={news.id} className="bg-white rounded-xl shadow border p-6 flex flex-col gap-2">
            <div className="text-blue-800 font-bold text-base mb-1">{news.title}</div>
            <div className="text-sm text-gray-700 flex-1">{news.summary}</div>
            <div className="text-xs text-gray-400 mt-2">{news.source} | {news.date}</div>
          </div>
        ))}
      </section>
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-green-800">User News</h2>
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" checked={showUserNews} onChange={e => setShowUserNews(e.target.checked)} /> Show
          </label>
        </div>
        {showUserNews && (
          <>
            <form className="mb-4 flex flex-wrap gap-4 items-end bg-green-50 rounded-lg px-4 py-3 shadow" onSubmit={editingIdx === null ? handleAdd : handleUpdate}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-40" placeholder="News Title" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Summary</label>
                <input name="summary" value={form.summary} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-48" placeholder="Short Summary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Source</label>
                <input name="source" value={form.source} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-32" placeholder="e.g. MoneyControl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-32" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Impact Qtr</label>
                <select name="impactQtr" value={form.impactQtr} onChange={handleChange} className="border rounded px-2 py-1 text-sm w-20">
                  <option value="">N/A</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm transition">
                {editingIdx === null ? "Add News" : "Update"}
              </button>
              {editingIdx !== null && (
                <button type="button" onClick={() => { setForm({ title: "", summary: "", source: "", date: "", impactQtr: "" }); setEditingIdx(null); }} className="ml-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold">Cancel</button>
              )}
            </form>
            <div className="space-y-3">
              {userNews.length === 0 ? (
                <div className="text-gray-500 text-sm">No user news added yet.</div>
              ) : (
                userNews.map((news, i) => (
                  <div key={i} className="bg-white rounded-xl shadow border p-6 flex flex-col gap-2">
                    <div className="text-green-800 font-bold text-base mb-1">{news.title}</div>
                    <div className="text-sm text-gray-700 flex-1">{news.summary}</div>
                    <div className="text-xs text-gray-400 mt-2">{news.source} | {news.date}</div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEdit(i)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">Edit</button>
                      <button onClick={() => handleDelete(i)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>
      <button className="text-blue-600 underline text-sm" onClick={() => navigate("/")}>← Back to Dashboard</button>
    </div>
  );
};

export default News;
