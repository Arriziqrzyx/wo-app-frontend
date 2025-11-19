import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  updateWorkOrderProgress,
  fetchWorkOrderById,
} from "../../features/workOrders/workOrdersSlice";

export default function RequesterConfirmation({ selectedId, onComplete }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType) => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await dispatch(
        updateWorkOrderProgress({
          id: selectedId,
          action: actionType,
          note: "",
          files: [],
        })
      ).unwrap();

      if (actionType === "CONFIRM_COMPLETION") {
        if (onComplete)
          onComplete({
            type: "success",
            text: "✅ Anda menyetujui hasil pekerjaan",
          });
      } else {
        if (onComplete)
          onComplete({
            type: "error",
            text: "❌ Anda menolak hasil & meminta revisi",
          });
      }

      dispatch(fetchWorkOrderById(selectedId));
    } catch (err) {
      if (onComplete)
        onComplete({ type: "error", text: err || "Gagal melakukan aksi" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-3">Konfirmasi Hasil Pekerjaan</h3>
      <div className="flex gap-3">
        <button
          className="btn btn-success flex-1"
          disabled={loading}
          onClick={() => handleAction("CONFIRM_COMPLETION")}
        >
          ✔ Setujui
        </button>
        <button
          className="btn btn-error flex-1"
          disabled={loading}
          onClick={() => handleAction("REJECT_RESULT")}
        >
          ✖ Tidak Setuju
        </button>
      </div>
    </div>
  );
}
