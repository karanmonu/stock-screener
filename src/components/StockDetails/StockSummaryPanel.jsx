import React from "react";
import Tooltip from "./Tooltip";

const StockSummaryPanel = ({ stock }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded shadow mb-4">
      <div>
        <div className="text-lg font-semibold text-gray-900">{stock.name}</div>
        <div className="text-sm text-gray-600">{stock.sector} | {stock.theme}</div>
      </div>
      <div className="flex flex-col gap-1">
        <div>
          <Tooltip text="Current market price in ₹">
            <span className="font-medium">Price:</span> ₹{stock.price}
          </Tooltip>
        </div>
        <div>
          <Tooltip text="Simple Moving Average over 20/200 days">
            <span className="font-medium">20 SMA:</span> ₹{stock.sma20}
          </Tooltip>
        </div>
        <div>
          <span className="font-medium">200 SMA:</span> ₹{stock.sma200}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div>
          <Tooltip text="Market Capitalization in Crores">
            <span className="font-medium">Mkt Cap:</span> ₹{stock.marketCap} Cr
          </Tooltip>
        </div>
        <div>
          <Tooltip text="Book Value per Share">
            <span className="font-medium">Book Value:</span> ₹{stock.bookValue}
          </Tooltip>
        </div>
        <div>
          <Tooltip text="Dividend Yield in %">
            <span className="font-medium">Div Yield:</span> {stock.dividendYield}%
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default StockSummaryPanel;
