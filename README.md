// README for Indian Stock Screener Dashboard

# Indian Stock Screener Dashboard

A modern, modular React-based dashboard for viewing and editing detailed stock-level financials for Indian equities. Features responsive design with TailwindCSS, inline-editable data tables, collapsible sections, and tooltips for audit-friendliness.

## Features
- Detailed stock summary and key financial metrics
- Collapsible, semantic sections with tooltips
- Editable data table for CAs/Auditors (add/delete/edit rows, save changes)
- Indian formats: ₹, Cr, %
- Responsive and accessible layout
- Modular components, ready for backend API integration

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start development server:**
   ```sh
   npm start
   ```

## Project Structure
- `src/pages/StockDetails.jsx` – Main dashboard page
- `src/components/StockDetails/` – Modular UI components
- `src/index.jsx`, `src/index.css` – Entry point and global styles

## Customization
- Replace mock data in `StockDetails.jsx` with API calls
- Integrate PATCH/PUT logic in `EditableFinancialsTable`

## Tech Stack
- React 18
- React Router 6
- TailwindCSS 3

---

Designed for clarity, auditability, and Indian stock market context.
