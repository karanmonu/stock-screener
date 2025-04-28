import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockDetails from "./pages/StockDetails";
import Dashboard from "./pages/Dashboard";
import VirtualPL from "./pages/VirtualPL";
import News from "./pages/News";
import LeadsTracker from "./pages/LeadsTracker";
import ActualPL from "./pages/ActualPL";
import IndustryTracker from "./pages/IndustryTracker";
import "./index.css";

function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full bg-white shadow sticky top-0 z-30">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-blue-700 tracking-tight">Fintellect</span>
            <span className="text-xs text-gray-400 font-semibold ml-2">Smart Indian Stock Suite</span>
          </div>
          <div className="flex gap-4">
            <a href="/virtual-pl" className="hover:text-blue-700 font-semibold text-gray-700 transition">Virtual P&L</a>
            <a href="/actual-pl" className="hover:text-blue-700 font-semibold text-gray-700 transition">Actual P&L</a>
            <a href="/industry-tracker" className="hover:text-blue-700 font-semibold text-gray-700 transition">Industry Tracker</a>
            <a href="/leads" className="hover:text-blue-700 font-semibold text-gray-700 transition">Leads</a>
            <a href="/news" className="hover:text-blue-700 font-semibold text-gray-700 transition">News</a>
          </div>
        </nav>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="w-full bg-white border-t mt-10 py-4 text-center text-xs text-gray-500">&copy; {new Date().getFullYear()} Fintellect. All rights reserved.</footer>
    </div>
  );
}

function App() {
  return (
    <AppShell>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock/:stockId" element={<StockDetails />} />
          <Route path="/virtual-pl" element={<VirtualPL />} />
          <Route path="/actual-pl" element={<ActualPL />} />
          <Route path="/news" element={<News />} />
          <Route path="/leads" element={<LeadsTracker />} />
          <Route path="/industry-tracker" element={<IndustryTracker />} />
        </Routes>
      </BrowserRouter>
    </AppShell>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
