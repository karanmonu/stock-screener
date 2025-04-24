import React, { useState } from "react";

const defaultRows = [
  { id: 1, metric: "Revenue", value: "1200", unit: "Cr", period: "FY23" },
  { id: 2, metric: "PAT", value: "210", unit: "Cr", period: "FY23" },
];

const EditableFinancialsTable = ({ rows = defaultRows, onSave }) => {
  const [data, setData] = useState(rows);
  const [editIdx, setEditIdx] = useState(null);

  const handleChange = (idx, field, value) => {
    setData((d) => d.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const handleAdd = () => {
    setData((d) => [
      ...d,
      { id: Date.now(), metric: "", value: "", unit: "", period: "" },
    ]);
    setEditIdx(data.length);
  };

  const handleDelete = (idx) => {
    setData((d) => d.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (onSave) onSave(data);
    // PATCH/PUT API call logic can be placed here
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Editable Financials Table</h2>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          + Add Row
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1 text-left">Metric Name</th>
              <th className="px-2 py-1 text-left">Value</th>
              <th className="px-2 py-1 text-left">Unit</th>
              <th className="px-2 py-1 text-left">Period</th>
              <th className="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                {["metric", "value", "unit", "period"].map((field) => (
                  <td key={field} className="px-2 py-1">
                    <input
                      className="w-full border rounded px-1 py-0.5 focus:outline-none focus:ring"
                      type="text"
                      value={row[field]}
                      onChange={(e) => handleChange(idx, field, e.target.value)}
                    />
                  </td>
                ))}
                <td className="px-2 py-1 text-right">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(idx)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="mt-3 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditableFinancialsTable;
