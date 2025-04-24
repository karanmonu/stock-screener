import React from "react";

const Tooltip = ({ text, children }) => (
  <span className="relative group">
    {children}
    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs bg-gray-800 text-xs text-white rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-pre-line">
      {text}
    </span>
  </span>
);

export default Tooltip;
