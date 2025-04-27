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

function App() {
  return (
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
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
