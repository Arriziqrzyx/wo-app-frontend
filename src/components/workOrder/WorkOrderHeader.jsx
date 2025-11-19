import React from "react";

export default function WorkOrderHeader({
  title = "Detail Work Order",
  onBack,
  rightActions = null,
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        {rightActions}
        <button className="btn btn-sm btn-secondary" onClick={onBack}>
          ← Kembali
        </button>
      </div>
    </div>
  );
}
