import React from "react";

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section className="mb-4 border rounded bg-white shadow-sm">
      <button
        className="w-full flex justify-between items-center px-4 py-3 text-left focus:outline-none focus:ring"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <span className="ml-2 text-gray-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
};

export default CollapsibleSection;
